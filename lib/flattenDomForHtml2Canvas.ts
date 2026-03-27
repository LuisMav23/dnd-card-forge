/**
 * Copies resolved computed color-related CSS from a source tree onto a deep-cloned tree.
 * html2canvas 1.4.x cannot parse modern serialized colors (e.g. color-mix → `color(srgb …)` in Chromium).
 */

let probeCtx: CanvasRenderingContext2D | null | undefined;

function getProbe2d(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (probeCtx === undefined) {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    probeCtx = c.getContext('2d');
  }
  return probeCtx;
}

/** Browser-normalizes any supported color to rgb()/rgba()/# for legacy CSS parsers. */
function coerceColorToRgbString(cssColor: string): string {
  const value = cssColor.trim();
  if (!value || value === 'none') return value;
  const ctx = getProbe2d();
  if (!ctx) return value;
  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = value;
    return String(ctx.fillStyle);
  } catch {
    return value;
  }
}

/** Replace top-level `color(...)` spans (Chromium serialization of color-mix, etc.). */
const COLOR_FN = /\bcolor\((?:[^()]|\([^()]*\))*\)/gi;

function stripColorFunctionSpans(cssValue: string): string {
  if (!cssValue.includes('color(')) return cssValue;
  return cssValue.replace(COLOR_FN, match => coerceColorToRgbString(match));
}

function normalizeSvgPaint(value: string): string {
  const v = value.trim();
  if (!v || v === 'none') return v;
  if (/^url\(/i.test(v)) return v;
  if (/\bcolor\(/i.test(v)) return stripColorFunctionSpans(v);
  return coerceColorToRgbString(v);
}

export function flattenDomForHtml2Canvas(sourceRoot: Element, cloneRoot: Element): void {
  function walk(origin: Element, cloned: Element): void {
    if (origin instanceof HTMLElement && cloned instanceof HTMLElement) {
      const s = getComputedStyle(origin);
      cloned.style.color = coerceColorToRgbString(s.color);
      cloned.style.backgroundColor = coerceColorToRgbString(s.backgroundColor);
      cloned.style.backgroundImage = stripColorFunctionSpans(s.backgroundImage);
      cloned.style.backgroundSize = s.backgroundSize;
      cloned.style.backgroundPosition = s.backgroundPosition;
      cloned.style.backgroundRepeat = s.backgroundRepeat;
      cloned.style.borderTopColor = coerceColorToRgbString(s.borderTopColor);
      cloned.style.borderRightColor = coerceColorToRgbString(s.borderRightColor);
      cloned.style.borderBottomColor = coerceColorToRgbString(s.borderBottomColor);
      cloned.style.borderLeftColor = coerceColorToRgbString(s.borderLeftColor);
      cloned.style.outlineColor = coerceColorToRgbString(s.outlineColor);
      cloned.style.textDecorationColor = coerceColorToRgbString(s.textDecorationColor);
      cloned.style.boxShadow = stripColorFunctionSpans(s.boxShadow);
      cloned.style.textShadow = stripColorFunctionSpans(s.textShadow);
      cloned.style.filter = stripColorFunctionSpans(s.filter);
      cloned.style.borderImageSource = stripColorFunctionSpans(s.borderImageSource);
    } else if (origin instanceof SVGElement && cloned instanceof SVGElement) {
      const tag = origin.tagName.toLowerCase();
      if (tag !== 'svg' && tag !== 'defs' && tag !== 'clipPath' && tag !== 'linearGradient') {
        const s = getComputedStyle(origin);
        cloned.setAttribute('fill', normalizeSvgPaint(s.fill));
        cloned.setAttribute('stroke', normalizeSvgPaint(s.stroke));
      }
    }

    const oc = origin.children;
    const cc = cloned.children;
    const n = oc.length;
    if (cc.length !== n) return;
    for (let i = 0; i < n; i++) walk(oc[i], cc[i]);
  }

  walk(sourceRoot, cloneRoot);
}
