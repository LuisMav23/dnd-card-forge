export type DomPngExportErrorCode =
  | 'INVALID_DIMENSIONS'
  | 'BLANK_EXPORT'
  | 'NO_CONTEXT'
  | 'BOTH_ENGINES_FAILED';

/**
 * Stable error type for UI: `err instanceof DomPngExportError`, `err.code`, `err.message`.
 */
export class DomPngExportError extends Error {
  readonly code: DomPngExportErrorCode;

  constructor(message: string, code: DomPngExportErrorCode) {
    super(message);
    this.name = 'DomPngExportError';
    this.code = code;
  }
}

/** Short button label for PNG export failures (full detail in console). */
export function getDomPngExportButtonLabel(err: unknown): string {
  if (err instanceof DomPngExportError) {
    if (err.code === 'BLANK_EXPORT') {
      return '✕ Blank export — re-upload images';
    }
    if (err.code === 'BOTH_ENGINES_FAILED') {
      return '✕ Export failed — check images';
    }
    if (err.code === 'INVALID_DIMENSIONS' || err.code === 'NO_CONTEXT') {
      return '✕ Export failed — try again';
    }
  }
  if (err instanceof Error && err.message.includes('Cross-origin')) {
    return '✕ Cross-origin images blocked';
  }
  return '✕ Error — Try Again';
}
