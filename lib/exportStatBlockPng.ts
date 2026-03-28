import { downloadCanvasAsPng } from '@/lib/downloadCanvasPng';
import { flattenDomForHtml2Canvas } from '@/lib/flattenDomForHtml2Canvas';

/**
 * Clones a stat block DOM node off-screen and captures it with html2canvas (same settings as Stat Blocks forge).
 */
export async function exportStatBlockToPng(blockElement: HTMLElement, nameForFile: string): Promise<void> {
  const base = (nameForFile || 'stat-block').replace(/\s+/g, '-').toLowerCase();
  const clone = blockElement.cloneNode(true) as HTMLElement;
  flattenDomForHtml2Canvas(blockElement, clone);
  Object.assign(clone.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '700px',
    transform: 'none',
  });
  document.body.appendChild(clone);

  try {
    const html2canvas = (await import('html2canvas')).default;
    await new Promise(r => setTimeout(r, 250));

    const canvas = await html2canvas(clone, {
      width: 700,
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    await downloadCanvasAsPng(canvas, `${base}-statblock.png`);
  } finally {
    document.body.removeChild(clone);
  }
}
