import { DomPngExportError } from '@/lib/domPngExportError';

function isSameOriginHref(src: string): boolean {
  try {
    const u = new URL(src, window.location.href);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * When true, html2canvas can use allowTaint: false (stricter, clearer failures).
 * Remote http(s) images must use crossOrigin="anonymous" (see crossOriginForImgSrc).
 */
export function canUseStrictCanvasExport(root: HTMLElement): boolean {
  for (const img of root.querySelectorAll('img')) {
    const s = (img.currentSrc || img.src || '').trim();
    if (!s) {
      continue;
    }
    if (s.startsWith('data:') || s.startsWith('blob:')) {
      continue;
    }
    if (s.startsWith('http://') || s.startsWith('https://')) {
      if (!isSameOriginHref(s) && img.crossOrigin !== 'anonymous') {
        return false;
      }
    }
  }
  return true;
}

function sampleHasOpaquePixels(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): boolean {
  const safeW = Math.max(1, Math.min(w, ctx.canvas.width - x));
  const safeH = Math.max(1, Math.min(h, ctx.canvas.height - y));
  if (safeW < 1 || safeH < 1) {
    return false;
  }
  const data = ctx.getImageData(x, y, safeW, safeH).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 8) {
      return true;
    }
  }
  return false;
}

/** Heuristic: canvas is empty or fully transparent (often CORS / taint). */
export function isCanvasLikelyBlank(canvas: HTMLCanvasElement): boolean {
  if (canvas.width < 1 || canvas.height < 1) {
    return true;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return true;
  }
  const w = canvas.width;
  const h = canvas.height;
  const edge = Math.min(48, w, h);
  if (sampleHasOpaquePixels(ctx, 0, 0, edge, edge)) {
    return false;
  }
  if (sampleHasOpaquePixels(ctx, w - edge, 0, edge, edge)) {
    return false;
  }
  if (sampleHasOpaquePixels(ctx, 0, h - edge, edge, edge)) {
    return false;
  }
  if (sampleHasOpaquePixels(ctx, w - edge, h - edge, edge, edge)) {
    return false;
  }
  const cx = Math.max(0, Math.floor(w / 2) - 24);
  const cy = Math.max(0, Math.floor(h / 2) - 24);
  return !sampleHasOpaquePixels(ctx, cx, cy, 48, 48);
}

export function assertCanvasExportLooksValid(canvas: HTMLCanvasElement): void {
  if (canvas.width < 1 || canvas.height < 1) {
    throw new DomPngExportError('Export produced an empty canvas.', 'INVALID_DIMENSIONS');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new DomPngExportError('Could not read export result.', 'NO_CONTEXT');
  }
  if (isCanvasLikelyBlank(canvas)) {
    throw new DomPngExportError(
      'Export looks blank—often caused by cross-origin images without CORS. Try re-uploading art in this app.',
      'BLANK_EXPORT'
    );
  }
}
