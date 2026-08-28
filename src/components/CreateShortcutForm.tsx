import { useState } from 'react';
import type { NewShortcut, Shortcut } from '../types/shortcut';
import { validateAlias, validateTargetUrl } from '../lib/validation';

interface Props {
  existing: Shortcut[];
  onCreate: (input: NewShortcut) => void;
}

export function CreateShortcutForm({ existing, onCreate }: Props) {
  const [alias, setAlias] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const aliasResult = validateAlias(alias, existing);
    const urlResult = validateTargetUrl(targetUrl);
    setAliasError(aliasResult.error ?? null);
    setUrlError(urlResult.error ?? null);

    if (!aliasResult.ok || !urlResult.ok) return;

    onCreate({ alias, targetUrl });
    setAlias('');
    setTargetUrl('');
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2 className="form__title">Create a shortcut</h2>

      <div className="field">
        <label htmlFor="alias">Alias</label>
        <div className="field__prefixed">
          <span className="field__prefix" aria-hidden="true">go/</span>
          <input
            id="alias"
            value={alias}
            placeholder="payroll"
            autoComplete="off"
            aria-invalid={aliasError ? true : undefined}
            aria-describedby={aliasError ? 'alias-error' : undefined}
            onChange={(e) => {
              setAlias(e.target.value);
              if (aliasError) setAliasError(null);
            }}
          />
        </div>
        {aliasError && (
          <p id="alias-error" className="field__error" role="alert">{aliasError}</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="url">Destination URL</label>
        <input
          id="url"
          value={targetUrl}
          placeholder="https://intranet/hr/payroll"
          autoComplete="off"
          aria-invalid={urlError ? true : undefined}
          aria-describedby={urlError ? 'url-error' : undefined}
          onChange={(e) => {
            setTargetUrl(e.target.value);
            if (urlError) setUrlError(null);
          }}
        />
        {urlError && (
          <p id="url-error" className="field__error" role="alert">{urlError}</p>
        )}
      </div>

      <button type="submit" className="button">Create shortcut</button>
    </form>
  );
}
