'use client';

import { Camera } from 'lucide-react';
import { useRef, useEffect, useCallback, useState } from 'react';
import IconDisplay from '@/components/IconDisplay';
import {
  uploadUserAsset,
  removeUserAssetByPublicUrl,
  type UserAssetKind,
} from '@/lib/storage/uploadUserAsset';

interface Props {
  icons: string[];
  currentIcon: string;
  currentImage: string | null;
  onIconChange: (icon: string) => void;
  onImageChange: (img: string | null) => void;
  /** Supabase Storage object name suffix; default card-art */
  assetKind?: Extract<UserAssetKind, 'card-art' | 'statblock-art'>;
  /** Section heading (default: card forge copy) */
  sectionTitle?: string;
}

export default function ArtSection({
  icons,
  currentIcon,
  currentImage,
  onIconChange,
  onImageChange,
  assetKind = 'card-art',
  sectionTitle = 'Card Art',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);

  const drawPreview = useCallback((src: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cv.width = 200;
      cv.height = 94;
      cv.style.maxWidth = '110px';
      cv.getContext('2d')?.drawImage(img, 0, 0, 200, 94);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (currentImage) drawPreview(currentImage);
  }, [currentImage, drawPreview]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousUrl = currentImage;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = ev.target?.result as string;
        });
        const W = 559,
          H = 256;
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext('2d')!;
        const ar = img.width / img.height;
        const tr = W / H;
        let sx: number, sy: number, sw: number, sh: number;
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
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        const blob = await new Promise<Blob | null>(r => cv.toBlob(b => r(b), 'image/png'));
        if (!blob) throw new Error('Could not encode image');
        const url = await uploadUserAsset(blob, assetKind);
        onImageChange(url);
        if (previousUrl && previousUrl !== url) await removeUserAssetByPublicUrl(previousUrl);
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : 'Upload failed';
        window.alert(msg);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploading(false);
      window.alert('Could not read file');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleClear() {
    const prev = currentImage;
    onImageChange(null);
    await removeUserAssetByPublicUrl(prev);
  }

  return (
    <div className="fsec">
      <h3>{sectionTitle}</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Icon (used when no image)</label>
          <div className="icon-grid">
            {icons.map(ic => (
              <button
                key={ic}
                className={`ibtn${currentIcon === ic ? ' active' : ''}`}
                onClick={() => onIconChange(ic)}
                title={ic}
              >
                <IconDisplay iconId={ic} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div className="fg">
          <label>Upload Image (auto-crops to art frame)</label>
          <div
            className="upload-area"
            style={{ position: 'relative', overflow: 'hidden', opacity: uploading ? 0.6 : 1 }}
          >
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={e => void handleUpload(e)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
            <div className="upload-icon">
              <Camera className="h-6 w-6" />
            </div>
            <p>
              {uploading ? 'Uploading…' : 'Click to upload'}
              <br />
              Auto center-cropped · saved to your storage
            </p>
          </div>
          <div className={`prev-wrap${currentImage ? ' vis' : ''}`}>
            <canvas ref={canvasRef} />
          </div>
          {currentImage && (
            <button
              type="button"
              className="clear-btn"
              style={{ display: 'block' }}
              disabled={uploading}
              onClick={() => void handleClear()}
            >
              ✕ Remove Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
