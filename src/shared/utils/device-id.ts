// Device ID helper: generate, persist, and expose a stable per-device ID
// - Web: persist in localStorage and Cookie (DID)
// - Cookie: Max-Age 1 year, SameSite=Lax, Path=/

const STORAGE_KEY = 'device_id';
const COOKIE_NAME = 'DID';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

function safeWindow(): Window | undefined {
  try {
    return typeof window !== 'undefined' ? window : undefined;
  } catch {
    return undefined;
  }
}

function readCookie(name: string): string | undefined {
  const w = safeWindow();
  if (!w || !w.document?.cookie) return undefined;
  const cookies = w.document.cookie.split(';').map(s => s.trim());
  const kv = cookies.find(c => c.startsWith(name + '='));
  if (!kv) return undefined;
  return decodeURIComponent(kv.substring(name.length + 1));
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  const w = safeWindow();
  if (!w) return;
  try {
    // Use SameSite=Lax so it’s sent on top-level navigations
    w.document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
  } catch { /* ignore */ }
}

function readFromStorage(): string | undefined {
  const w = safeWindow();
  if (!w) return undefined;
  try {
    const v = w.localStorage.getItem(STORAGE_KEY);
    return v || undefined;
  } catch {
    return undefined;
  }
}

function writeToStorage(value: string): void {
  const w = safeWindow();
  if (!w) return;
  try {
    w.localStorage.setItem(STORAGE_KEY, value);
  } catch { /* ignore */ }
}

function generateUUID(): string {
  // Prefer crypto.randomUUID if available
  const w = safeWindow();
  try {
    if (w && 'crypto' in w && typeof (w.crypto as any).randomUUID === 'function') {
      return (w.crypto as any).randomUUID();
    }
  } catch { /* ignore */ }
  // Fallback to RFC4122 v4-like UUID
  const hex = [...Array(256)].map((_, i) => (i).toString(16).padStart(2, '0'));
  const r = new Uint8Array(16);
  for (let i = 0; i < 16; i++) r[i] = Math.floor(Math.random() * 256);
  r[6] = (r[6] & 0x0f) | 0x40; // version 4
  r[8] = (r[8] & 0x3f) | 0x80; // variant 10
  return (
    hex[r[0]] + hex[r[1]] + hex[r[2]] + hex[r[3]] + '-' +
    hex[r[4]] + hex[r[5]] + '-' +
    hex[r[6]] + hex[r[7]] + '-' +
    hex[r[8]] + hex[r[9]] + '-' +
    hex[r[10]] + hex[r[11]] + hex[r[12]] + hex[r[13]] + hex[r[14]] + hex[r[15]]
  );
}

function ensureCookie(value: string): void {
  // Always refresh cookie to extend validity window
  setCookie(COOKIE_NAME, value, ONE_YEAR_SECONDS);
}

/**
 * Returns a stable device ID; generates and persists on first call.
 */
export function getOrCreateDeviceId(): string {
  // Prefer localStorage; fallback to cookie; then generate
  let did = readFromStorage();
  if (!did) {
    did = readCookie(COOKIE_NAME);
  }
  if (!did) {
    did = generateUUID();
  }
  // Persist to both storage and cookie
  writeToStorage(did);
  ensureCookie(did);
  return did;
}

/**
 * Get current device ID without generating a new one. Returns undefined if absent.
 */
export function peekDeviceId(): string | undefined {
  return readFromStorage() || readCookie(COOKIE_NAME);
}

/**
 * Ensures DID cookie exists and is fresh (1 year TTL) based on current deviceId.
 */
export function refreshDidCookie(): void {
  const id = peekDeviceId();
  if (id) ensureCookie(id);
}

