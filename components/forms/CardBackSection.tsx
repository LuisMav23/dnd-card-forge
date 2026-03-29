'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { uploadUserAsset, removeUserAssetByPublicUrl } from '@/lib/storage/uploadUserAsset';

/** Card shell aspect (matches .spell-card in globals.css). */
const CARD_W = 595;
const CARD_H = 833;
const MAX_TEX_W = 1200;
const JPEG_Q = 0.82;

interface Props {
  currentBack: string | null;
  onBackChange: (url: string | null) => void;
}

function processFileToBlob(file: File): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result;
      if (typeof src !== 'string') {
        resolve(null);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const outW = Math.min(MAX_TEX_W, img.width);
        const outH = Math.round((outW * CARD_H) / CARD_W);
        const tr = outW / outH;
        const ar = img.width / img.height;
        const cv = document.createElement('canvas');
        cv.width = outW;
        cv.height = outH;
        const ctx = cv.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        let sx: number;
        let sy: number;
        let sw: number;
        let sh: number;
        if (ar > tr) {
          sh = img.height;
          sw = sh * tr;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = sw / tr;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        cv.toBlob(b => resolve(b), 'image/jpeg', JPEG_Q);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = src;
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export default function CardBackSection({ currentBack, onBackChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);

  const drawPreview = useCallback((src: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pw = 200;
      const ph = Math.round((pw * CARD_H) / CARD_W);
      cv.width = pw;
      cv.height = ph;
      cv.style.maxWidth = '110px';
      cv.getContext('2d')?.drawImage(img, 0, 0, pw, ph);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (currentBack) drawPreview(currentBack);
  }, [currentBack, drawPreview]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousUrl = currentBack;
    setUploading(true);
    try {
      const blob = await processFileToBlob(file);
      if (!blob) throw new Error('Could not process image');
      const url = await uploadUserAsset(blob, 'card-back');
      onBackChange(url);
      if (previousUrl && previousUrl !== url) await removeUserAssetByPublicUrl(previousUrl);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      window.alert(msg);
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  }

  async function handleClear() {
    const prev = currentBack;
    onBackChange(null);
    await removeUserAssetByPublicUrl(prev);
  }

  return (
    <div className="fsec">
      <h3>↩ Card back</h3>
      <p className="ex-note mb-3 text-left">
        Optional reverse side for print (Pokémon-style back). Not the same as the front background texture.
      </p>
      <div className="frow c1">
        <div className="fg">
          <label>Upload image (cover-crop, max ~{MAX_TEX_W}px wide)</label>
          <div
            className="upload-area"
            style={{
              position: 'relative',
              overflow: 'hidden',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={e => void handleUpload(e)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
            />
            <div className="upload-icon">🖼</div>
            <p>
              {uploading ? 'Uploading…' : 'Click to upload'}
              <br />
              JPEG · saved to your storage
            </p>
          </div>
          <div className={`prev-wrap${currentBack ? ' vis' : ''}`}>
            <canvas ref={canvasRef} />
          </div>
          {currentBack && (
            <button
              type="button"
              className="clear-btn"
              style={{ display: 'block' }}
              disabled={uploading}
              onClick={() => void handleClear()}
            >
              ✕ Remove card back image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
