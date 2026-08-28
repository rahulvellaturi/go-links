/**
 * Validation shared by the create endpoint. Kept framework-free so the rules
 * are easy to read and mirror on the client. Returns the first error found so
 * the API can respond with one clear message.
 */

export const SHORTNAME_MAX_LENGTH = 40;
export const URL_MAX_LENGTH = 2048;

const SHORTNAME_PATTERN = /^[a-z0-9-]+$/;

/** Names that would collide with our own paths if used as a shortcut. */
const RESERVED = new Set(['api', 'go', 'assets', 'favicon.ico', 'index.html']);

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateShortname(raw: string): ValidationResult {
  const name = raw.trim().toLowerCase();

  if (name.length === 0) return { ok: false, error: 'Shortname is required.' };
  if (name.length > SHORTNAME_MAX_LENGTH) {
    return { ok: false, error: `Keep the shortname under ${SHORTNAME_MAX_LENGTH} characters.` };
  }
  if (!SHORTNAME_PATTERN.test(name)) {
    return { ok: false, error: 'Use only lowercase letters, numbers and hyphens.' };
  }
  if (RESERVED.has(name)) {
    return { ok: false, error: `"${name}" is reserved and can't be used.` };
  }
  return { ok: true };
}

export function validateUrl(raw: string): ValidationResult {
  const value = raw.trim();

  if (value.length === 0) return { ok: false, error: 'Destination URL is required.' };
  if (value.length > URL_MAX_LENGTH) return { ok: false, error: 'URL is too long.' };

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: 'Enter a valid URL, including https://' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'URL must start with http:// or https://' };
  }
  return { ok: true };
}
