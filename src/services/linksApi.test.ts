import { fetchLinks, createLink } from './linksApi';

describe('linksApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('fetchLinks returns parsed JSON on success', async () => {
    const data = [{ id: '1', shortname: 'payroll', url: 'https://x', createdAt: new Date().toISOString(), visits: 0 }];
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(data) })) as any;

    const result = await fetchLinks();
    expect(result).toEqual(data);
    expect(global.fetch).toHaveBeenCalledWith('/api/links');
  });

  it('createLink throws on 4xx with server message', async () => {
    const body = { error: 'Bad input' };
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve(body) })) as any;

    await expect(createLink({ shortname: 'x', url: 'https://x' })).rejects.toThrow('Bad input');
  });
});
