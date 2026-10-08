// One item in a content list: a row with grip, thumbnail, switch and actions, or a gallery card.
import { useState, type DragEvent, type KeyboardEvent } from 'react';
import { Icon } from '../ui/icons';
import { isFlagOn } from './helpers';
import type { ContentItem, SectionConfig } from './types';

export interface DragProps {
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
}

interface RowProps {
  sec: SectionConfig;
  item: ContentItem;
  index: number;
  canDrag: boolean;
  dragState: '' | 'dragging' | 'over';
  drag: DragProps;
  onToggle: (on: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onGripKey: (e: KeyboardEvent) => void;
}

function FlagSwitch({ sec, item, name, visible, onToggle }: {
  sec: SectionConfig; item: ContentItem; name: string; visible?: boolean; onToggle: (on: boolean) => void;
}) {
  if (!sec.flag) return null;
  return (
    <label className="switch" title={sec.flagLabel || 'Shown on the website'}>
      <input type="checkbox" checked={isFlagOn(sec, item)} onChange={(e) => onToggle(e.target.checked)} />
      <span className="track" />
      {visible
        ? <><span>On the site</span><span className="visually-hidden">: {name}</span></>
        : <span className="visually-hidden">{sec.flagLabel || 'Show'}: {name}</span>}
    </label>
  );
}

function RowActions({ name, onEdit, onDelete }: { name: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="acts">
      <button className="icon-btn" type="button" aria-label={`Edit ${name}`} onClick={onEdit}><Icon name="edit" /></button>
      <button className="icon-btn del" type="button" aria-label={`Delete ${name}`} onClick={onDelete}><Icon name="trash" /></button>
    </div>
  );
}

const classes = (hidden: boolean, dragState: string) =>
  [hidden && 'is-hidden', dragState].filter(Boolean).join(' ') || undefined;

export function ContentRow({ grid, ...props }: RowProps & { grid?: boolean }) {
  return grid ? <GalleryCard {...props} /> : <ListRow {...props} />;
}

// A list thumbnail. A therapy without a photo yet shows the empty tile, not a broken image.
function Thumb({ src }: { src: string }) {
  const [missing, setMissing] = useState(false);
  return <span className="thumb">{!missing && <img src={src} alt="" loading="lazy" onError={() => setMissing(true)} />}</span>;
}

// Photo, a two-line caption, then one footer row: every card the same height.
function GalleryCard({ sec, item, index, canDrag, dragState, drag, onToggle, onEdit, onDelete }: RowProps) {
  const name = sec.main(item);
  const src = sec.thumb?.(item) ?? '';
  const hidden = !isFlagOn(sec, item);
  return (
    <figure data-i={index} className={classes(hidden, dragState)} {...drag} draggable={canDrag || undefined}>
      <div className="shot">
        <img className="backdrop" src={src} alt="" loading="lazy" />
        <img className="photo" src={src} alt="" loading="lazy" />
        {hidden && <span className="pill off">Hidden</span>}
      </div>
      <figcaption><span title={name}>{name}</span></figcaption>
      <div className="foot">
        <FlagSwitch sec={sec} item={item} name={name} visible onToggle={onToggle} />
        <RowActions name={name} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </figure>
  );
}

function ListRow({ sec, item, index, canDrag, dragState, drag, onToggle, onEdit, onDelete, onGripKey }: RowProps) {
  const name = sec.main(item);
  const meta = sec.meta(item);
  const hidden = !isFlagOn(sec, item);
  return (
    <li data-i={index} className={classes(hidden, dragState)} {...drag} draggable={canDrag || undefined}>
      {sec.reorder && (
        <button
          className="icon-btn grip" type="button" disabled={!canDrag} onKeyDown={onGripKey}
          aria-label={`Move ${name}. Use the up and down arrow keys.`}
        >
          <Icon name="grip" />
        </button>
      )}
      {sec.thumb && <Thumb key={sec.thumb(item)} src={sec.thumb(item)} />}
      <div className="txt"><strong>{name}</strong>{meta && <small>{meta}</small>}</div>
      <div className="ctrl">
        {hidden && <span className="pill off">{sec.flag === 'published' ? 'Draft' : 'Hidden'}</span>}
        <FlagSwitch sec={sec} item={item} name={name} onToggle={onToggle} />
        <RowActions name={name} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </li>
  );
}
