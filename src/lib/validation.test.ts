import { describe, it, expect } from 'vitest';
import { validateAlias, validateTargetUrl, ALIAS_MAX_LENGTH } from './validation';
import type { Shortcut } from '../types/shortcut';

const existing: Shortcut[] = [
  { id: '1', alias: 'payroll', targetUrl: 'https://example.com', createdAt: '' },
];

describe('validateAlias', () => {
  it('rejects an empty alias', () => {
    expect(validateAlias('   ', existing).ok).toBe(false);
  });

  it('rejects illegal characters', () => {
    expect(validateAlias('my link', existing).ok).toBe(false);
    expect(validateAlias('go/oncall', existing).ok).toBe(false);
  });

  it('rejects an alias that is already taken (case-insensitive)', () => {
    expect(validateAlias('PAYROLL', existing).ok).toBe(false);
  });

  it('rejects an alias over the length limit', () => {
    expect(validateAlias('a'.repeat(ALIAS_MAX_LENGTH + 1), existing).ok).toBe(false);
  });

  it('accepts a clean, unique alias', () => {
    expect(validateAlias('design-system', existing).ok).toBe(true);
  });
});

describe('validateTargetUrl', () => {
  it('rejects an empty URL', () => {
    expect(validateTargetUrl('').ok).toBe(false);
  });

  it('rejects a non-http protocol', () => {
    expect(validateTargetUrl('ftp://example.com').ok).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(validateTargetUrl('not a url').ok).toBe(false);
  });

  it('accepts a valid https URL', () => {
    expect(validateTargetUrl('https://intranet/hr/payroll').ok).toBe(true);
  });
});
