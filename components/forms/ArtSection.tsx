'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Props {
  icons: string[];
  currentIcon: string;
  currentImage: string | null;
  onIconChange: (icon: string) => void;
  onImageChange: (img: string | null) => void;
}

export default function ArtSection({ icons, currentIcon, currentImage, onIconChange, onImageChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPreview = useCallback((dataUrl: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const img = new Image();
    img.onload = () => {
      cv.width = 200;
      cv.height = 94;
      cv.style.maxWidth = '110px';
      cv.getContext('2d')?.drawImage(img, 0, 0, 200, 94);
    };
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    if (currentImage) drawPreview(currentImage);
  }, [currentImage, drawPreview]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const W = 559, H = 256;
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d')!;
        const ar = img.width / img.height;
        const tr = W / H;
        let sx: number, sy: number, sw: number, sh: number;
        if (ar > tr) { sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0; }
        else { sw = img.width; sh = sw / tr; sx = 0; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        onImageChange(cv.toDataURL('image/png'));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fsec">
      <h3>🖼 Card Art</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Icon (used when no image)</label>
          <div className="icon-grid">
            {icons.map(ic => (
              <button
                key={ic}
                className={`ibtn${currentIcon === ic ? ' active' : ''}`}
                onClick={() => onIconChange(ic)}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div className="fg">
          <label>Upload Image (auto-crops to art frame)</label>
          <div className="upload-area" style={{ position: 'relative', overflow: 'hidden' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
            <div className="upload-icon">📷</div>
            <p>Click to upload<br />Auto center-cropped</p>
          </div>
          <div className={`prev-wrap${currentImage ? ' vis' : ''}`}>
            <canvas ref={canvasRef} />
          </div>
          {currentImage && (
            <button className="clear-btn" style={{ display: 'block' }} onClick={() => onImageChange(null)}>
              ✕ Remove Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
