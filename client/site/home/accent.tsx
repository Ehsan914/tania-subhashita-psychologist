import type { ReactNode } from 'react';

// The design's headings end on an accent phrase in <em> ("…carry it <em>on your own.</em>").
// Headings edited in the admin are plain text, so their last `words` words take the accent.
export function accentTail(text: string, words: number): ReactNode {
  const parts = text.trim().split(/\s+/);
  if (parts.length <= words) return text;
  return [
    `${parts.slice(0, -words).join(' ')} `,
    <em key="accent">{parts.slice(-words).join(' ')}</em>,
  ];
}
