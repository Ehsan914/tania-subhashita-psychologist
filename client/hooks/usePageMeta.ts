import { useEffect } from 'react';

// Sets the tab title and, when given, the meta description (values from the design's pages).
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description === undefined) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);
}
