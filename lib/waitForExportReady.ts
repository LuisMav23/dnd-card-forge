const IMAGE_WAIT_MS = 8000;

function waitForImage(img: HTMLImageElement): Promise<void> {
  const src = (img.currentSrc || img.src || '').trim();
  if (!src) {
    return Promise.resolve();
  }

  const waitLoad = (): Promise<void> =>
    new Promise(resolve => {
      if (img.complete) {
        resolve();
        return;
      }
      const timer = window.setTimeout(() => resolve(), IMAGE_WAIT_MS);
      const done = () => {
        window.clearTimeout(timer);
        resolve();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });

  return waitLoad().then(() => {
    if (img.naturalWidth === 0 && src && !src.startsWith('data:')) {
      return;
    }
    return img.decode().catch(() => undefined);
  });
}

/** Two animation frames after DOM/layout updates so paint matches computed layout. */
export function settleExportLayout(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Ensures fonts and descendant images are ready before rasterizing for export.
 * Replaces fixed delays (e.g. setTimeout(250)).
 */
export async function waitForExportReady(root: HTMLElement): Promise<void> {
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }

  const images = root.querySelectorAll('img');
  await Promise.all(Array.from(images).map(img => waitForImage(img)));

  await settleExportLayout();
}
