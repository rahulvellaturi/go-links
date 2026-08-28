import { describe, it, expect } from 'vitest';
import { validateShortname, validateUrl, SHORTNAME_MAX_LENGTH } from './validation';
import type { Link } from '../types/link';

const existing: Link[] = [
  { id: '1', shortname: 'payroll', url: 'https://example.com', createdAt: '', visitCount: 0, lastVisitedAt: null },
];

describe('validateShortname', () => {
  it('rejects an empty shortname', () => {
    expect(validateShortname('   ', existing).ok).toBe(false);
  });

  it('rejects illegal characters', () => {
    expect(validateShortname('my link', existing).ok).toBe(false);
    expect(validateShortname('go/oncall', existing).ok).toBe(false);
  });

  it('rejects a reserved word', () => {
    expect(validateShortname('api', existing).ok).toBe(false);
  });

  it('rejects a duplicate (case-insensitive)', () => {
    expect(validateShortname('PAYROLL', existing).ok).toBe(false);
  });

  it('rejects an over-length shortname', () => {
    expect(validateShortname('a'.repeat(SHORTNAME_MAX_LENGTH + 1), existing).ok).toBe(false);
  });

  it('accepts a clean, unique shortname', () => {
    expect(validateShortname('design-system', existing).ok).toBe(true);
  });
});

describe('validateUrl', () => {
  it('rejects an empty URL', () => {
    expect(validateUrl('').ok).toBe(false);
  });

  it('rejects a non-http protocol', () => {
    expect(validateUrl('ftp://example.com').ok).toBe(false);
  });

  it('rejects a malformed URL', () => {
    expect(validateUrl('not a url').ok).toBe(false);
  });

  it('accepts a valid https URL', () => {
    expect(validateUrl('https://intranet/hr/payroll').ok).toBe(true);
  });
});
