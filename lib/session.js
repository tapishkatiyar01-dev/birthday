export const UNLOCK_KEY = "birthday-unlocked";

export function isGiftUnlocked() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function unlockGiftSession() {
  sessionStorage.setItem(UNLOCK_KEY, "1");
}
