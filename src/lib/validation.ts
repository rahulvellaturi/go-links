import type { Link } from '../types/link';

const SHORTNAME_PATTERN = /^[a-z0-9-]+$/;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/** Validate a shortname client-side for instant feedback; the server re-checks. */
export function validateShortname(raw: string, existing: Link[]): ValidationResult {
  const name = raw.trim().toLowerCase();
  if (name.length === 0) return { ok: false, error: 'Enter a shortname.' };
  if (!SHORTNAME_PATTERN.test(name)) {
    return { ok: false, error: 'Use only lowercase letters, numbers and hyphens.' };
  }
  if (existing.some((l) => l.shortname === name)) {
    return { ok: false, error: `go/${name} is already taken.` };
  }
  return { ok: true };
}

export function validateUrl(raw: string): ValidationResult {
  const value = raw.trim();
  if (value.length === 0) return { ok: false, error: 'Enter a destination URL.' };
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'URL must start with http:// or https://' };
    }
  } catch {
    return { ok: false, error: 'Enter a valid URL, including https://' };
  }
  return { ok: true };
}
