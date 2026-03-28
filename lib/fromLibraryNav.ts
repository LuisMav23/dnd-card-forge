/** Appended when navigating from My Library so detail/forge pages can return to /library. */
export const FROM_LIBRARY_QS = '?from=library';

export const FROM_LIBRARY_APPEND = '&from=library';

export function isFromLibrarySearch(
  searchParams: { get: (name: string) => string | null } | null
): boolean {
  return searchParams?.get('from') === 'library';
}
