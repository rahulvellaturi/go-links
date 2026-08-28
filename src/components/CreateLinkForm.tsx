import { useState } from 'react';
import type { Link, NewLink } from '../types/link';
import { validateShortname, validateUrl } from '../lib/validation';

interface Props {
  existing: Link[];
  onCreate: (input: NewLink) => Promise<void>;
}

export function CreateLinkForm({ existing, onCreate }: Props) {
  const [shortname, setShortname] = useState('');
  const [url, setUrl] = useState('');
  const [shortnameError, setShortnameError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nameCheck = validateShortname(shortname, existing);
    const urlCheck = validateUrl(url);
    setShortnameError(nameCheck.error ?? null);
    setUrlError(urlCheck.error ?? null);
    if (!nameCheck.ok || !urlCheck.ok) return;

    setSubmitting(true);
    try {
      await onCreate({ shortname, url });
      setShortname('');
      setUrl('');
    } catch (err) {
      // Server-side rejection (e.g. a race that took the name first).
      setFormError(err instanceof Error ? err.message : 'Could not create link.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2 className="form__title">Create a shortcut</h2>

      <div className="field">
        <label htmlFor="shortname">Shortname</label>
        <div className="field__prefixed">
          <span className="field__prefix" aria-hidden="true">go/</span>
          <input
            id="shortname"
            value={shortname}
            placeholder="design-system"
            autoComplete="off"
            aria-invalid={shortnameError ? true : undefined}
            aria-describedby={shortnameError ? 'shortname-error' : undefined}
            onChange={(e) => {
              setShortname(e.target.value);
              if (shortnameError) setShortnameError(null);
            }}
          />
        </div>
        {shortnameError && (
          <p id="shortname-error" className="field__error" role="alert">{shortnameError}</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="url">Destination URL</label>
        <input
          id="url"
          value={url}
          placeholder="https://intranet/hr/payroll"
          autoComplete="off"
          aria-invalid={urlError ? true : undefined}
          aria-describedby={urlError ? 'url-error' : undefined}
          onChange={(e) => {
            setUrl(e.target.value);
            if (urlError) setUrlError(null);
          }}
        />
        {urlError && (
          <p id="url-error" className="field__error" role="alert">{urlError}</p>
        )}
      </div>

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create shortcut'}
      </button>

      {formError && <p className="field__error" role="alert">{formError}</p>}
    </form>
  );
}
