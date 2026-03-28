/**
 * Copies resolved computed color-related CSS from a source tree onto a deep-cloned tree.
 * html2canvas 1.4.x cannot parse modern color syntax (color-mix → `color(srgb …)`, oklch, etc.).
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

/** CSS color functions that serialize with nested parens; regex cannot reliably match them. */
const MODERN_COLOR_FUNCS = ['color', 'oklch', 'lab', 'lch', 'hwb'] as const;

function replaceBalancedCalls(input: string, funcName: string): string {
  const needle = `${funcName.toLowerCase()}(`;
  const lower = input.toLowerCase();
  let out = '';
  let i = 0;
  while (i < input.length) {
    let found = lower.indexOf(needle, i);
    while (found !== -1) {
      const before = found > 0 ? input[found - 1] : '';
      if (/[a-z0-9_-]/i.test(before)) {
        found = lower.indexOf(needle, found + 1);
      } else {
        break;
      }
    }
    if (found === -1) {
      out += input.slice(i);
      break;
    }
    out += input.slice(i, found);
    const openParen = found + needle.length - 1;
    if (input[openParen] !== '(') {
      out += input.slice(found, found + needle.length);
      i = found + needle.length;
      continue;
    }
    let depth = 1;
    let j = openParen + 1;
    while (j < input.length && depth > 0) {
      const c = input[j];
      if (c === '(') {
        depth++;
      } else if (c === ')') {
        depth--;
      }
      j++;
    }
    if (depth !== 0) {
      out += input.slice(found, found + needle.length);
      i = found + needle.length;
      continue;
    }
    const fullCall = input.slice(found, j);
    out += coerceColorToRgbString(fullCall);
    i = j;
  }
  return out;
}

/** Replace all modern color() / oklch() / … spans until stable (e.g. nested in gradients). */
export function stripModernColorFunctions(cssValue: string): string {
  if (!cssValue || cssValue === 'none') return cssValue;
  let result = cssValue;
  let guard = 0;
  let changed = true;
  while (changed && guard++ < 48) {
    changed = false;
    for (const fn of MODERN_COLOR_FUNCS) {
      const next = replaceBalancedCalls(result, fn);
      if (next !== result) {
        result = next;
        changed = true;
      }
    }
  }
  return result;
}

function normalizeSvgPaint(value: string): string {
  const v = value.trim();
  if (!v || v === 'none') return v;
  if (/^url\(/i.test(v)) return v;
  return coerceColorToRgbString(stripModernColorFunctions(v));
}

function applyComputedPaintOntoElement(origin: HTMLElement, target: HTMLElement): void {
  const s = getComputedStyle(origin);
  target.style.color = coerceColorToRgbString(s.color);
  target.style.backgroundColor = coerceColorToRgbString(s.backgroundColor);
  target.style.backgroundImage = stripModernColorFunctions(s.backgroundImage);
  target.style.backgroundSize = s.backgroundSize;
  target.style.backgroundPosition = s.backgroundPosition;
  target.style.backgroundRepeat = s.backgroundRepeat;
  target.style.borderTopColor = coerceColorToRgbString(s.borderTopColor);
  target.style.borderRightColor = coerceColorToRgbString(s.borderRightColor);
  target.style.borderBottomColor = coerceColorToRgbString(s.borderBottomColor);
  target.style.borderLeftColor = coerceColorToRgbString(s.borderLeftColor);
  target.style.borderTopWidth = s.borderTopWidth;
  target.style.borderRightWidth = s.borderRightWidth;
  target.style.borderBottomWidth = s.borderBottomWidth;
  target.style.borderLeftWidth = s.borderLeftWidth;
  target.style.borderTopStyle = s.borderTopStyle;
  target.style.borderRightStyle = s.borderRightStyle;
  target.style.borderBottomStyle = s.borderBottomStyle;
  target.style.borderLeftStyle = s.borderLeftStyle;
  target.style.outlineColor = coerceColorToRgbString(s.outlineColor);
  target.style.outlineStyle = s.outlineStyle;
  target.style.outlineWidth = s.outlineWidth;
  target.style.textDecorationColor = coerceColorToRgbString(s.textDecorationColor);
  target.style.boxShadow = stripModernColorFunctions(s.boxShadow);
  target.style.textShadow = stripModernColorFunctions(s.textShadow);
  target.style.filter = stripModernColorFunctions(s.filter);
  target.style.borderImageSource = stripModernColorFunctions(s.borderImageSource);
}

/**
 * Re-applies sanitized computed paint onto html2canvas's own clone (onclone).
 * html2canvas re-clones the subtree; this strips `color()` / oklch again from resolved values.
 */
export function selfFlattenHtml2CanvasTree(root: HTMLElement): void {
  function walk(el: Element): void {
    if (el instanceof HTMLElement) {
      applyComputedPaintOntoElement(el, el);
    } else if (el instanceof SVGElement) {
      const tag = el.tagName.toLowerCase();
      if (tag !== 'svg' && tag !== 'defs' && tag !== 'clipPath' && tag !== 'linearGradient') {
        const s = getComputedStyle(el);
        el.setAttribute('fill', normalizeSvgPaint(s.fill));
        el.setAttribute('stroke', normalizeSvgPaint(s.stroke));
      }
    }
    for (let i = 0; i < el.children.length; i++) {
      walk(el.children[i]);
    }
  }
  walk(root);
}

export function flattenDomForHtml2Canvas(sourceRoot: Element, cloneRoot: Element): void {
  function walk(origin: Element, cloned: Element): void {
    if (origin instanceof HTMLElement && cloned instanceof HTMLElement) {
      applyComputedPaintOntoElement(origin, cloned);
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
