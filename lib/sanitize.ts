const PURIFY_OPTS = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Strips dangerous script elements and inline event handlers.
 * Used server-side where the browser DOM is unavailable.
 */
function serverSanitize(html: string): string {
  return html
    .replace(/<(script|iframe|object|embed|form|input)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed|form|input)\b[^>]*\/?>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

/**
 * Sanitizes an HTML string, allowing safe formatting tags while stripping
 * dangerous content. Uses DOMPurify on the client and a regex fallback on
 * the server to avoid the jsdom ESM top-level-await incompatibility.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    return serverSanitize(dirty);
  }
  // Browser only — dompurify uses the native DOM, no jsdom required.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('dompurify') as typeof import('dompurify').default;
  return DOMPurify.sanitize(dirty, PURIFY_OPTS) as string;
}
