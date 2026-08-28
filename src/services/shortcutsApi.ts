import type { Shortcut } from '../types/shortcut';

/**
 * Data-access layer. Today this reads a static JSON file that stands in for a
 * real backend, but every call goes over HTTP with the same shape a real API
 * client would have — so swapping in a live service later touches only this file.
 */

const ENDPOINT = `${import.meta.env.BASE_URL}shortcuts.json`;

/** Lightweight request id so a fetch can be traced in logs end to end. */
function requestId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function fetchShortcuts(): Promise<Shortcut[]> {
  const rid = requestId();
  console.info(`[shortcuts] GET ${ENDPOINT} rid=${rid}`);

  const res = await fetch(ENDPOINT, { headers: { 'x-request-id': rid } });
  if (!res.ok) {
    console.error(`[shortcuts] GET failed rid=${rid} status=${res.status}`);
    throw new Error(`Could not load shortcuts (status ${res.status}).`);
  }

  const data = (await res.json()) as Shortcut[];
  console.info(`[shortcuts] GET ok rid=${rid} count=${data.length}`);
  return data;
}
