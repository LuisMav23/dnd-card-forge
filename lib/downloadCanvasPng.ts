/**
 * Download a canvas as PNG. Uses blob URL + in-DOM click (Safari-friendly; avoids huge data URLs).
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(
              new Error(
                'Could not create PNG. Cross-origin images can block export; try re-uploading art in this app.'
              )
            );
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          queueMicrotask(() => URL.revokeObjectURL(url));
          resolve();
        },
        'image/png',
        1.0
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Browser blocked PNG export (often due to cross-origin images).';
      reject(new Error(msg));
    }
  });
}
