// One card of a content page: header with count, search and Add, then the list or gallery grid.
// Lists drag (or arrow-key on the grip) to reorder; each row has a show/hide switch, edit and delete.
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { adminApi } from '../../hooks/useApi';
import { useAdmin } from '../ui/AdminContext';
import { Icon } from '../ui/icons';
import { ConfirmDelete } from '../ui/overlay';
import { ContentList } from './ContentList';
import { EditDrawer } from './EditDrawer';
import { arrayMove, capitalize, errorMessage, isFlagOn, nextOrder, plural } from './helpers';
import type { ContentItem, SectionConfig } from './types';
import { useCollection } from './useCollection';

interface EditState { item: ContentItem | null; open: boolean; session: number }

function countText(sec: SectionConfig, items: ContentItem[]) {
  const off = items.filter((x) => !isFlagOn(sec, x)).length;
  return `${plural(items.length, sec)}${off ? ` · ${off} ${sec.flag === 'published' ? 'draft' : 'hidden'}` : ''}${sec.reorder ? ' · drag to reorder' : ''}`;
}

// Saves positions after a move: one bulk request where the API has it, otherwise one per moved item.
function saveOrder(sec: SectionConfig, next: ContentItem[]) {
  if (sec.reorder === 'bulk') {
    return adminApi(`${sec.endpoint}/reorder`, 'PUT', { items: next.map((x, order) => ({ id: x.id, order })) });
  }
  const moved = next.map((x, order) => ({ x, order })).filter(({ x, order }) => x.order !== order);
  return Promise.all(moved.map(({ x, order }) => adminApi(`${sec.endpoint}/${x.id}`, 'PUT', { order })));
}

export function ContentSection({ sec, showHeading }: { sec: SectionConfig; showHeading: boolean }) {
  const { toast } = useAdmin();
  const { items, setItems, loading, error, reload } = useCollection(sec.endpoint);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<EditState | null>(null);
  // kept while the dialog fades out, so its text does not blank mid-fade
  const [deleting, setDeleting] = useState<{ item: ContentItem; open: boolean } | null>(null);
  const [drag, setDrag] = useState<{ from: number; over: number | null } | null>(null);
  const box = useRef<HTMLElement>(null);
  const focusGrip = useRef<number | null>(null);
  const sorted = (list: ContentItem[]) => (sec.sortBy ? [...list].sort(sec.sortBy) : list);

  // after an arrow-key move, keep focus on the grip of the item that moved
  useEffect(() => {
    if (focusGrip.current === null) return;
    box.current?.querySelector<HTMLElement>(`[data-i="${focusGrip.current}"] .grip`)?.focus();
    focusGrip.current = null;
  }, [items]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return false;
    const next = arrayMove(items, from, to);
    setItems(next.map((x, order) => ({ ...x, order })));
    // per-item saves can fail part-way, so on failure show what the server actually holds
    saveOrder(sec, next)
      .then(() => toast('New order saved.'))
      .catch((err) => { toast(errorMessage(err), 'err'); reload(); });
    return true;
  };

  const toggle = (it: ContentItem, on: boolean) => {
    if (!sec.flag) return;
    const flag = sec.flag;
    const setFlag = (value: boolean) => setItems((list) => list.map((x) => (x.id === it.id ? { ...x, [flag]: value } : x)));
    setFlag(on);
    adminApi(`${sec.endpoint}/${it.id}`, 'PUT', { [flag]: on })
      .then(() => toast(flag === 'published'
        ? (on ? 'Published.' : 'Moved back to drafts.')
        : (on ? 'Now shown on the website.' : 'Hidden from the website.')))
      .catch((err) => { setFlag(!on); toast(errorMessage(err), 'err'); });
  };

  const openEdit = (item: ContentItem | null) => setEdit((prev) => ({ item, open: true, session: (prev?.session ?? 0) + 1 }));
  const closeEdit = () => setEdit((prev) => (prev ? { ...prev, open: false } : prev));

  const save = async (body: Record<string, unknown>) => {
    const current = edit?.item ?? null;
    if (current) {
      const updated = await adminApi<ContentItem>(`${sec.endpoint}/${current.id}`, 'PUT', body);
      setItems((list) => sorted(list.map((x) => (x.id === updated.id ? updated : x))));
      toast('Changes saved.');
    } else {
      const atEnd = sec.newAt !== 'start';
      const order = sec.reorder && atEnd ? { order: nextOrder(items) } : {};
      const created = await adminApi<ContentItem>(sec.endpoint, 'POST', { ...sec.createExtras, ...body, ...order });
      setItems((list) => sorted(atEnd ? [...list, created] : [created, ...list.map((x) => ({ ...x, order: Number(x.order ?? 0) + 1 }))]));
      toast(`${capitalize(sec.one)} added.`);
    }
    closeEdit();
  };

  const askDelete = (item: ContentItem) => {
    closeEdit();
    setDeleting({ item, open: true });
  };
  const cancelDelete = () => setDeleting((prev) => (prev ? { ...prev, open: false } : prev));

  const confirmDelete = () => {
    if (!deleting) return;
    const it = deleting.item;
    cancelDelete();
    adminApi(`${sec.endpoint}/${it.id}`, 'DELETE')
      .then(() => {
        setItems((list) => list.filter((x) => x.id !== it.id));
        toast(`${capitalize(sec.one)} deleted.`);
      })
      .catch((err) => toast(errorMessage(err), 'err'));
  };

  const canDrag = Boolean(sec.reorder) && !q.trim(); // a filtered list has gaps, so ordering waits until the search is cleared

  const dragProps = (i: number) => ({
    onDragStart: (e: DragEvent) => {
      setDrag({ from: i, over: null });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
    },
    onDragOver: (e: DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      if (drag.over !== i) setDrag({ ...drag, over: i });
    },
    onDrop: (e: DragEvent) => {
      if (!drag) return;
      e.preventDefault();
      setDrag(null);
      move(drag.from, i);
    },
    onDragEnd: () => setDrag(null),
  });

  const gripKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const to = i + (e.key === 'ArrowUp' ? -1 : 1);
    if (move(i, to)) focusGrip.current = to;
  };

  return (
    <section className="card" ref={box}>
      <div className="hd">
        <div>
          {showHeading && <h2>{sec.heading}</h2>}
          <p className="count">{loading || error ? '' : countText(sec, items)}</p>
        </div>
        <div className="hd-acts">
          {sec.search && (
            <label className="search">
              <span className="visually-hidden">Search {sec.many}</span>
              <Icon name="search" />
              <input className="in" type="search" placeholder={`Search ${sec.many}`} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          )}
          <button className="abtn primary sm" type="button" onClick={() => openEdit(null)} disabled={loading || Boolean(error)}>
            <Icon name="plus" />Add {sec.one}
          </button>
        </div>
      </div>
      <div className="list">
        <ContentList
          sec={sec} items={items} q={q.trim()} loading={loading} error={error} onRetry={reload}
          canDrag={canDrag} drag={drag} dragProps={dragProps} gripKey={gripKey}
          onToggle={toggle} onEdit={openEdit} onDelete={askDelete}
        />
      </div>
      {edit && (
        <EditDrawer
          key={edit.session} sec={sec} open={edit.open} item={edit.item} items={items}
          onClose={closeEdit} onSave={save} onDelete={() => edit.item && askDelete(edit.item)}
        />
      )}
      <ConfirmDelete
        open={Boolean(deleting?.open)} what={deleting ? sec.main(deleting.item) : ''}
        onCancel={cancelDelete} onConfirm={confirmDelete}
      />
    </section>
  );
}
