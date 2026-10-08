// Loading a page's records into one draft, and saving only what changed back to the admin API.
import { adminApi } from '../../hooks/useApi';
import type { FieldValue } from '../ui/fields';
import type { Draft, ItemRow, ItemsDef, PageDef, SingletonSource } from './types';

type ApiRecord = Record<string, unknown>;

const inSource = (key: string, src: SingletonSource) => !src.prefix || key.startsWith(`${src.prefix}.`);
const columnOf = (key: string, src: SingletonSource) => (src.prefix ? key.slice(src.prefix.length + 1) : key);
const sourceOf = (page: PageDef, key: string) => page.sources.find((src) => inSource(key, src));

const pageFields = (page: PageDef) => page.cards.flatMap((c) => c.fields ?? []);
const pageChips = (page: PageDef) => page.cards.flatMap((c) => (c.chips ? [c.chips] : []));
export const pageItems = (page: PageDef) => page.cards.flatMap((c) => (c.items ? [c.items] : []));

const splitLines = (text: unknown) => String(text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);

const toRow = (def: ItemsDef, record: ApiRecord): ItemRow => ({
  key: String(record.id),
  id: String(record.id),
  values: Object.fromEntries(def.sub.map((f) => [f.k, String(record[f.k] ?? '')])),
});

export async function loadPage(page: PageDef): Promise<Draft> {
  const items = pageItems(page);
  const [records, lists] = await Promise.all([
    Promise.all(page.sources.map((src) => adminApi<ApiRecord>(src.endpoint, 'GET'))),
    Promise.all(items.map((def) => adminApi<ApiRecord[]>(def.endpoint, 'GET'))),
  ]);
  const read = (key: string): unknown => {
    const i = page.sources.findIndex((src) => inSource(key, src));
    return i < 0 ? undefined : records[i][columnOf(key, page.sources[i])];
  };

  return {
    fields: Object.fromEntries(pageFields(page).map((f): [string, FieldValue] => {
      const v = read(f.k);
      return [f.k, f.type === 'switch' ? Boolean(v) : String(v ?? '')];
    })),
    lists: Object.fromEntries(pageChips(page).map((c) => [c.k, splitLines(read(c.k))])),
    items: Object.fromEntries(items.map((def, i) => [def.k, lists[i].map((r) => toRow(def, r))])),
  };
}

// The editable columns of one record, as the API expects them (lists as newline-joined text).
function sourceBody(page: PageDef, src: SingletonSource, draft: Draft) {
  const body: Record<string, FieldValue> = {};
  for (const f of pageFields(page)) if (sourceOf(page, f.k) === src) body[columnOf(f.k, src)] = draft.fields[f.k];
  for (const c of pageChips(page)) if (sourceOf(page, c.k) === src) body[columnOf(c.k, src)] = draft.lists[c.k].join('\n');
  return body;
}

// `into` with one record's fields and lists taken from `from`
function withSource(page: PageDef, src: SingletonSource, into: Draft, from: Draft): Draft {
  const mine = (key: string) => sourceOf(page, key) === src;
  return {
    ...into,
    fields: { ...into.fields, ...Object.fromEntries(Object.entries(from.fields).filter(([k]) => mine(k))) },
    lists: { ...into.lists, ...Object.fromEntries(Object.entries(from.lists).filter(([k]) => mine(k))) },
  };
}

const sameValues = (a: Record<string, string>, b: Record<string, string>) => JSON.stringify(a) === JSON.stringify(b);

export interface SaveOutcome {
  saved: Draft; // what the server now holds, as far as this save got
  newIds: Record<string, string>; // row key → id for rows created by this save
  error: string | null;
}

// Saves record by record and row by row, so a failure part-way still reports what did save:
// a retry then re-sends only what is left (created rows keep their new ids and are not duplicated).
export async function savePage(page: PageDef, saved: Draft, draft: Draft): Promise<SaveOutcome> {
  let result = saved;
  const newIds: Record<string, string> = {};
  try {
    for (const src of page.sources) {
      const body = sourceBody(page, src, draft);
      if (JSON.stringify(body) === JSON.stringify(sourceBody(page, src, saved))) continue;
      await adminApi(src.endpoint, 'PUT', body);
      result = withSource(page, src, result, draft);
    }
    for (const def of pageItems(page)) {
      result = await saveItems(def, result, draft.items[def.k], newIds, (next) => { result = next; });
    }
    return { saved: result, newIds, error: null };
  } catch (err) {
    return { saved: result, newIds, error: err instanceof Error ? err.message : 'Could not save.' };
  }
}

async function saveItems(
  def: ItemsDef, saved: Draft, rows: ItemRow[], newIds: Record<string, string>, progress: (d: Draft) => void,
): Promise<Draft> {
  const setRows = (d: Draft, list: ItemRow[]): Draft => ({ ...d, items: { ...d.items, [def.k]: list } });
  let current = saved;
  const kept = new Set(rows.map((r) => r.id));

  for (const row of saved.items[def.k]) {
    if (!row.id || kept.has(row.id)) continue;
    await adminApi(`${def.endpoint}/${row.id}`, 'DELETE');
    current = setRows(current, current.items[def.k].filter((r) => r.id !== row.id));
    progress(current);
  }

  for (const [order, row] of rows.entries()) {
    if (!row.id) {
      const created = await adminApi<{ id: string }>(def.endpoint, 'POST', { ...def.blank, ...row.values, order });
      newIds[row.key] = created.id;
      current = setRows(current, [...current.items[def.k], { ...row, id: created.id }]);
      progress(current);
      continue;
    }
    const before = current.items[def.k];
    const at = before.findIndex((r) => r.id === row.id);
    if (at === order && sameValues(before[at].values, row.values)) continue;
    await adminApi(`${def.endpoint}/${row.id}`, 'PUT', { ...row.values, order });
  }

  return setRows(current, rows.map((r) => (r.id ? r : { ...r, id: newIds[r.key] })));
}

// The draft after a save: rows created by the save carry their new ids.
export function withNewIds(draft: Draft, newIds: Record<string, string>): Draft {
  if (!Object.keys(newIds).length) return draft;
  return {
    ...draft,
    items: Object.fromEntries(Object.entries(draft.items).map(([k, rows]) => [
      k, rows.map((r) => (!r.id && newIds[r.key] ? { ...r, id: newIds[r.key] } : r)),
    ])),
  };
}
