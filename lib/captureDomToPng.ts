/**
 * Shared PNG export pipeline: wait for fonts/images, clone + flatten for legacy parsers,
 * try html2canvas (+ onclone flatten) first, fall back to html-to-image, validate, download.
 */
import { toCanvas } from 'html-to-image';

import { assertCanvasExportLooksValid, canUseStrictCanvasExport, isCanvasLikelyBlank } from '@/lib/canvasExportGuards';
import { DomPngExportError } from '@/lib/domPngExportError';
import { downloadCanvasAsPng } from '@/lib/downloadCanvasPng';
import { CARD_PNG_EXPORT, STATBLOCK_PNG_EXPORT } from '@/lib/exportPngProfiles';
import { flattenDomForHtml2Canvas, selfFlattenHtml2CanvasTree } from '@/lib/flattenDomForHtml2Canvas';
import { settleExportLayout, waitForExportReady } from '@/lib/waitForExportReady';

function sanitizeFilenameBase(raw: string, fallback: string): string {
  const s = (raw || fallback).replace(/\s+/g, '-').toLowerCase();
  return s || fallback;
}

async function captureWithHtmlToImage(
  node: HTMLElement,
  width: number,
  height: number,
  pixelRatio: number
): Promise<HTMLCanvasElement> {
  return toCanvas(node, {
    width,
    height,
    pixelRatio,
    cacheBust: true,
  });
}

async function captureWithHtml2Canvas(
  node: HTMLElement,
  width: number,
  height: number,
  scale: number,
  allowTaint: boolean
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(node, {
    width,
    height,
    scale,
    useCORS: true,
    allowTaint,
    backgroundColor: null,
    logging: false,
    onclone: (_doc, element) => {
      if (element instanceof HTMLElement) {
        selfFlattenHtml2CanvasTree(element);
      }
    },
  });
}

/**
 * Prefer html2canvas (works with our CSS flattening); fall back to html-to-image when canvas is blank or throws.
 */
async function captureToCanvas(
  node: HTMLElement,
  width: number,
  height: number,
  scale: number,
  strictNoTaint: boolean
): Promise<HTMLCanvasElement> {
  const allowTaint = !strictNoTaint;
  let html2canvasError: unknown;

  try {
    const canvas = await captureWithHtml2Canvas(node, width, height, scale, allowTaint);
    if (canvas.width > 0 && canvas.height > 0 && !isCanvasLikelyBlank(canvas)) {
      return canvas;
    }
  } catch (e) {
    html2canvasError = e;
  }

  let htmlToImageError: unknown;
  try {
    const canvas = await captureWithHtmlToImage(node, width, height, scale);
    if (canvas.width > 0 && canvas.height > 0 && !isCanvasLikelyBlank(canvas)) {
      return canvas;
    }
  } catch (e) {
    htmlToImageError = e;
  }

  const msg2c = html2canvasError instanceof Error ? html2canvasError.message : String(html2canvasError ?? '');
  const msgH2i = htmlToImageError instanceof Error ? htmlToImageError.message : String(htmlToImageError ?? '');
  const parts = [msg2c, msgH2i].filter(m => m.length > 0 && m !== 'undefined');
  const detail = parts.length > 0 ? parts.join(' · ') : 'Unknown error';
  throw new DomPngExportError(
    `PNG export failed: ${detail}. If you used images from another site, re-upload them here.`,
    'BOTH_ENGINES_FAILED'
  );
}

type ExportKind = 'card' | 'statblock';

async function runExport(element: HTMLElement, kind: ExportKind, downloadName: string): Promise<void> {
  await waitForExportReady(element);

  const clone = element.cloneNode(true) as HTMLElement;
  flattenDomForHtml2Canvas(element, clone);
  const strict = canUseStrictCanvasExport(element);

  if (kind === 'card') {
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: `${CARD_PNG_EXPORT.width}px`,
      height: `${CARD_PNG_EXPORT.height}px`,
      transform: 'none',
      borderRadius: CARD_PNG_EXPORT.borderRadius,
    });
  } else {
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: `${STATBLOCK_PNG_EXPORT.width}px`,
      height: 'auto',
      transform: 'none',
    });
  }

  document.body.appendChild(clone);

  try {
    await settleExportLayout();

    let width: number;
    let height: number;
    let scale: number;

    if (kind === 'card') {
      width = CARD_PNG_EXPORT.width;
      height = CARD_PNG_EXPORT.height;
      scale = CARD_PNG_EXPORT.scale;
    } else {
      width = STATBLOCK_PNG_EXPORT.width;
      const measured = Math.ceil(clone.scrollHeight);
      height = Math.min(
        STATBLOCK_PNG_EXPORT.maxHeightPx,
        Math.max(STATBLOCK_PNG_EXPORT.minHeightPx, measured)
      );
      clone.style.height = `${height}px`;
      await settleExportLayout();
      scale = STATBLOCK_PNG_EXPORT.scale;
    }

    selfFlattenHtml2CanvasTree(clone);

    const canvas = await captureToCanvas(clone, width, height, scale, strict);
    assertCanvasExportLooksValid(canvas);
    await downloadCanvasAsPng(canvas, downloadName);
  } finally {
    document.body.removeChild(clone);
  }
}

export async function exportCardToPng(cardElement: HTMLElement, nameForFile: string): Promise<void> {
  const base = sanitizeFilenameBase(nameForFile, 'dnd-card');
  await runExport(cardElement, 'card', `${base}-card.png`);
}

export async function exportStatBlockToPng(blockElement: HTMLElement, nameForFile: string): Promise<void> {
  const base = sanitizeFilenameBase(nameForFile, 'stat-block');
  await runExport(blockElement, 'statblock', `${base}-statblock.png`);
}
