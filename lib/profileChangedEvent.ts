/** Fired after profile (avatar, name, etc.) is saved so the header can refetch. */
export const PROFILE_CHANGED_EVENT = 'card-forge-profile-changed';

export function notifyProfileChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
  }
}
