import { downloadCanvasAsPng } from '@/lib/downloadCanvasPng';
import { flattenDomForHtml2Canvas } from '@/lib/flattenDomForHtml2Canvas';

/**
 * Renders a clone off-screen and captures it with html2canvas (same settings as Card Forge).
 */
export async function exportCardToPng(cardElement: HTMLElement, nameForFile: string): Promise<void> {
  const base = (nameForFile || 'dnd-card').replace(/\s+/g, '-').toLowerCase();
  const clone = cardElement.cloneNode(true) as HTMLElement;
  flattenDomForHtml2Canvas(cardElement, clone);
  Object.assign(clone.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '595px',
    height: '833px',
    transform: 'none',
    borderRadius: '22px',
  });
  document.body.appendChild(clone);

  try {
    const html2canvas = (await import('html2canvas')).default;
    await new Promise(r => setTimeout(r, 250));

    const canvas = await html2canvas(clone, {
      width: 595,
      height: 833,
      scale: 1.26,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    await downloadCanvasAsPng(canvas, `${base}-card.png`);
  } finally {
    document.body.removeChild(clone);
  }
}
