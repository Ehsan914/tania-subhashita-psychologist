// An ordered list of small inline forms with move up/down and remove (design: page.js itemsHtml),
// for the About page's credentials and methodology steps.
import { useEffect, useRef } from 'react';
import { Field } from '../ui/fields';
import { Icon } from '../ui/icons';
import { itemFieldKey, type ItemRow, type ItemsDef } from './types';

interface ItemListProps {
  def: ItemsDef;
  rows: ItemRow[];
  errors: Record<string, string>;
  onChange: (rows: ItemRow[]) => void;
  onFieldEdit: (key: string) => void;
}

export default function ItemList({ def, rows, errors, onChange, onFieldEdit }: ItemListProps) {
  const list = useRef<HTMLOListElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const nextKey = useRef(0);
  // where focus goes once the list has re-rendered (moved rows lose focus when the DOM node moves)
  const pendingFocus = useRef<(() => void) | null>(null);

  useEffect(() => {
    pendingFocus.current?.();
    pendingFocus.current = null;
  });

  const inRow = (key: string, selector: string) =>
    list.current?.querySelector<HTMLElement>(`[data-row="${key}"] ${selector}`);

  const edit = (index: number, field: string, value: string) => {
    onFieldEdit(itemFieldKey(def.k, rows[index].key, field));
    onChange(rows.map((r, i) => (i === index ? { ...r, values: { ...r.values, [field]: value } } : r)));
  };

  const add = () => {
    const key = `new-${nextKey.current++}`;
    onChange([...rows, { key, id: null, values: Object.fromEntries(def.sub.map((f) => [f.k, ''])) }]);
    pendingFocus.current = () => inRow(key, ':is(input, textarea)')?.focus();
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...rows];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    onChange(next);
    const { key } = rows[index];
    const same = dir < 0 ? 'up' : 'down';
    const other = dir < 0 ? 'down' : 'up';
    pendingFocus.current = () => (inRow(key, `[data-move="${same}"]:not(:disabled)`) ?? inRow(key, `[data-move="${other}"]`))?.focus();
  };

  const remove = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
    pendingFocus.current = () => addButton.current?.focus();
  };

  return (
    <>
      <ol className="items" ref={list}>
        {rows.map((row, i) => (
          <li className="item" key={row.key} data-row={row.key}>
            <div className="form">
              {def.sub.map((f) => {
                const k = itemFieldKey(def.k, row.key, f.k);
                return <Field key={f.k} f={{ ...f, k }} value={row.values[f.k]} error={errors[k]} onChange={(v) => edit(i, f.k, String(v))} />;
              })}
            </div>
            <div className="item-acts">
              <button className="icon-btn" type="button" data-move="up" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <Icon name="up" />
              </button>
              <button className="icon-btn" type="button" data-move="down" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                <Icon name="down" />
              </button>
              <button className="icon-btn del" type="button" aria-label={`Remove this ${def.one}`} onClick={() => remove(i)}>
                <Icon name="trash" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button ref={addButton} className="abtn ghost sm add-item" type="button" onClick={add}>
        <Icon name="plus" />Add {def.one}
      </button>
    </>
  );
}
