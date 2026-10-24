import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while prerendering and during the browser's first (hydrating) render, true after.
 * Parts of a page that depend on the visit itself (today's date, the query string) render
 * behind it, so the prerendered HTML and the first browser render always agree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
