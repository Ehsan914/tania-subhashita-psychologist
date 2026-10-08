// Loads one admin collection into local state that the list then edits in place.
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../hooks/useApi';
import { errorMessage } from './helpers';
import type { ContentItem } from './types';

export function useCollection(endpoint: string) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isCurrent: () => boolean = () => true) => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminApi<ContentItem[]>(endpoint, 'GET');
      if (isCurrent()) setItems(list);
    } catch (err) {
      if (isCurrent()) setError(errorMessage(err));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    let current = true;
    load(() => current);
    return () => { current = false; };
  }, [load]);

  return { items, setItems, loading, error, reload: () => load() };
}
