// The body of a content card: loading, error and empty states, then the rows or gallery grid.
import type { KeyboardEvent } from 'react';
import { ContentRow, type DragProps } from './ContentRow';
import type { ContentItem, SectionConfig } from './types';

interface ContentListProps {
  sec: SectionConfig;
  items: ContentItem[];
  q: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  canDrag: boolean;
  drag: { from: number; over: number | null } | null;
  dragProps: (i: number) => DragProps;
  gripKey: (i: number) => (e: KeyboardEvent) => void;
  onToggle: (it: ContentItem, on: boolean) => void;
  onEdit: (it: ContentItem) => void;
  onDelete: (it: ContentItem) => void;
}

export function ContentList(props: ContentListProps) {
  const { sec, items, q, loading, error, onRetry, canDrag, drag, dragProps, gripKey, onToggle, onEdit, onDelete } = props;

  if (loading) return <div className="empty" role="status"><strong>Loading…</strong>Fetching the {sec.many}.</div>;
  if (error) {
    return (
      <div className="empty" role="alert">
        <strong>Couldn't load the {sec.many}</strong>{error}{' '}
        <button className="abtn ghost sm" type="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  const needle = q.toLowerCase();
  const shown = items
    .map((it, i) => ({ it, i }))
    .filter(({ it }) => !needle || `${sec.main(it)} ${sec.meta(it)}`.toLowerCase().includes(needle));

  if (!shown.length) {
    return (
      <div className="empty">
        <strong>{q ? 'No matches' : `No ${sec.many} yet`}</strong>
        {q ? `Nothing matches “${q}”.` : `Add the first ${sec.one} to show it on the site.`}
      </div>
    );
  }

  const rows = shown.map(({ it, i }) => {
    const dragState = drag?.from === i ? 'dragging' : drag?.over === i ? 'over' : '';
    return (
      <ContentRow
        key={it.id} grid={sec.grid} sec={sec} item={it} index={i} canDrag={canDrag} dragState={dragState}
        drag={dragProps(i)} onGripKey={gripKey(i)}
        onToggle={(on) => onToggle(it, on)} onEdit={() => onEdit(it)} onDelete={() => onDelete(it)}
      />
    );
  });

  return sec.grid ? <div className="gallery-grid">{rows}</div> : <ul className="rows">{rows}</ul>;
}
