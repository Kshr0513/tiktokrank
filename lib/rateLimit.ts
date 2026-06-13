/** Simple in-process rate limiter (IP → timestamps). Resets on server restart. */
const store = new Map<string, number[]>();

/**
 * Returns true if the request should be blocked.
 * @param key   Identifier (e.g. hashed IP)
 * @param limit Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = (store.get(key) ?? []).filter((t) => t > now - windowMs);
  if (timestamps.length >= limit) return true;
  timestamps.push(now);
  store.set(key, timestamps);
  return false;
}
