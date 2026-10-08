// Removable chips with an add row underneath (design: page.js chipsHtml), for short lists
// such as booking time slots and session types.
import { useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../ui/icons';
import type { ChipsDef } from './types';

interface ChipListProps {
  def: ChipsDef;
  values: string[];
  onChange: (values: string[]) => void;
}

export default function ChipList({ def, values, onChange }: ChipListProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const add = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    const msg = !v ? 'Type something to add.' : values.includes(v) ? 'That one is already in the list.' : def.check(v);
    setError(msg);
    input.current?.focus();
    if (msg) return;
    onChange([...values, v]);
    setText('');
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
    input.current?.focus();
  };

  return (
    <>
      <div className="chip-edit">
        {values.map((v, i) => (
          <span key={`${i}-${v}`}>
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => remove(i)}><Icon name="x" /></button>
          </span>
        ))}
      </div>
      <form className="add-row" noValidate onSubmit={add}>
        <label className="visually-hidden" htmlFor={id}>{def.label}</label>
        <input
          ref={input} className="in" id={id} placeholder={def.ph} style={{ maxWidth: 240 }}
          value={text} onChange={(e) => setText(e.target.value)}
        />
        <button className="abtn ghost" type="submit"><Icon name="plus" />Add</button>
      </form>
      <p className="hint chip-err" role="alert">{error}</p>
    </>
  );
}
