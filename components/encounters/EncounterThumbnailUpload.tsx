'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadUserAsset, removeUserAssetByPublicUrl } from '@/lib/storage/uploadUserAsset';

const PREVIEW_W = 200;
const PREVIEW_H = 150;

interface Props {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
}

export default function EncounterThumbnailUpload({ imageUrl, onImageChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);

  const drawPreview = useCallback((src: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cv.width = PREVIEW_W;
      cv.height = PREVIEW_H;
      cv.style.maxWidth = '140px';
      cv.getContext('2d')?.drawImage(img, 0, 0, PREVIEW_W, PREVIEW_H);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (imageUrl) drawPreview(imageUrl);
  }, [imageUrl, drawPreview]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousUrl = imageUrl;
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
        const W = 800;
        const H = 600;
        const cv = document.createElement('canvas');
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        const ar = img.width / img.height;
        const tr = W / H;
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
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
        const blob = await new Promise<Blob | null>(r => cv.toBlob(b => r(b), 'image/png'));
        if (!blob) throw new Error('Could not encode image');
        const url = await uploadUserAsset(blob, 'encounter-thumbnail');
        onImageChange(url);
        if (previousUrl && previousUrl !== url) await removeUserAssetByPublicUrl(previousUrl);
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : 'Upload failed');
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
    const prev = imageUrl;
    onImageChange(null);
    await removeUserAssetByPublicUrl(prev);
  }

  return (
    <div>
      <label className="block font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark">
        Encounter thumbnail
      </label>
      <p className="mt-1 text-xs text-muted">Optional cover image (4:3, center-cropped). Shown on your home recent activity.</p>
      <div
        className="relative mt-2 overflow-hidden rounded-lg border border-bdr-2 bg-mid/80"
        style={{ opacity: uploading ? 0.65 : 1 }}
      >
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={e => void handleUpload(e)}
          className="absolute inset-0 z-[1] cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label="Upload encounter thumbnail"
        />
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <span className="text-2xl" aria-hidden>
            📷
          </span>
          <span className="font-[var(--font-cinzel),serif] text-xs text-bronze">
            {uploading ? 'Uploading…' : 'Click to upload image'}
          </span>
        </div>
      </div>
      {imageUrl ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="overflow-hidden rounded-md border border-bdr bg-mid/60 p-1">
            <canvas ref={canvasRef} className="block" />
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => void handleClear()}
            className="panel-btn border-red-900/50 text-xs text-red-300 hover:bg-red-950/40 disabled:opacity-50"
          >
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  );
}
