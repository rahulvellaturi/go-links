import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLinks } from '../../src/hooks/useLinks';

function TestComp() {
  const { links, loading, error, createLink } = useLinks();
  return (
    <div>
      {loading && <div>loading</div>}
      {error && <div role="alert">{error}</div>}
      <div data-testid="count">{links.length}</div>
      <button onClick={() => createLink({ shortname: 'new', url: 'https://new' })}>create</button>
    </div>
  );
}

describe('useLinks', () => {
  const originalFetch = global.fetch as any;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('loads links on mount and can create a link', async () => {
    const initial = [{ id: '1', shortname: 'a', url: 'https://a', createdAt: new Date().toISOString(), visits: 0 }];
    const created = { id: '2', shortname: 'new', url: 'https://new', createdAt: new Date().toISOString(), visits: 0 };

    // First call: GET /api/links -> initial
    // Second call: POST /api/links -> created
    let call = 0;
    global.fetch = jest.fn((input, init) => {
      call += 1;
      if (typeof input === 'string' && input === '/api/links' && (!init || init.method === 'GET')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(initial) } as any);
      }
      if (typeof input === 'string' && input === '/api/links' && init && init.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(created) } as any);
      }
      return Promise.resolve({ ok: false } as any);
    }) as any;

    render(<TestComp />);

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
  });
});
