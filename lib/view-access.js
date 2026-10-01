export const ACCESS_WINDOW_MS = 30 * 60 * 1000;

export function isViewExpired(viewedAt) {
  if (!viewedAt) return false;
  const started = new Date(viewedAt).getTime();
  if (Number.isNaN(started)) return false;
  return Date.now() - started >= ACCESS_WINDOW_MS;
}

export function remainingAccessMs(viewedAt) {
  if (!viewedAt) return ACCESS_WINDOW_MS;
  const started = new Date(viewedAt).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, ACCESS_WINDOW_MS - (Date.now() - started));
}
