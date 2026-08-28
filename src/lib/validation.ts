import type { Shortcut } from '../types/shortcut';

export const ALIAS_MAX_LENGTH = 40;

/** Aliases are lowercase letters, numbers and hyphens: what can sit after `go/`. */
const ALIAS_PATTERN = /^[a-z0-9-]+$/;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate a proposed alias against the format rules and existing shortcuts.
 * Returns the first problem found, so the form can show one clear message.
 */
export function validateAlias(
  raw: string,
  existing: Shortcut[],
): ValidationResult {
  const alias = raw.trim().toLowerCase();

  if (alias.length === 0) {
    return { ok: false, error: 'Enter an alias.' };
  }
  if (alias.length > ALIAS_MAX_LENGTH) {
    return { ok: false, error: `Keep the alias under ${ALIAS_MAX_LENGTH} characters.` };
  }
  if (!ALIAS_PATTERN.test(alias)) {
    return { ok: false, error: 'Use only lowercase letters, numbers and hyphens.' };
  }
  if (existing.some((s) => s.alias === alias)) {
    return { ok: false, error: `go/${alias} is already taken.` };
  }
  return { ok: true };
}

/** Target URLs must be absolute http(s) links so the redirect actually works. */
export function validateTargetUrl(raw: string): ValidationResult {
  const value = raw.trim();

  if (value.length === 0) {
    return { ok: false, error: 'Enter a destination URL.' };
  }
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

/** Normalise an alias to its canonical stored form. */
export function normaliseAlias(raw: string): string {
  return raw.trim().toLowerCase();
}
