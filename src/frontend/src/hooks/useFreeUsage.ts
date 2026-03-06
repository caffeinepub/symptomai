const STORAGE_KEY = "synapse_free_uses";
const FREE_USE_LIMIT = 2;

export function getFreeUseCount(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? Number.parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementFreeUseCount(): number {
  const next = getFreeUseCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore
  }
  return next;
}

export function hasReachedFreeLimit(): boolean {
  return getFreeUseCount() >= FREE_USE_LIMIT;
}

export { FREE_USE_LIMIT };
