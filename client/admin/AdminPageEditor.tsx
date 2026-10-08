// Single-record page editor (design: admin/page.html?s=…, admin/assets/page.js): grouped cards
// of fields with one sticky save bar. Edits go into a draft; the bar appears only while the
// draft differs from what was last saved.
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAdmin } from './ui/AdminContext';
import { Field, focusFirstError, validateFields, type FieldValue } from './ui/fields';
import { Icon } from './ui/icons';
import { usePageMeta } from '../hooks/usePageMeta';
import ChipList from './pages/ChipList';
import ItemList from './pages/ItemList';
import { PAGES, type PageSection } from './pages/configs';
import { loadPage, pageItems, savePage, withNewIds } from './pages/persist';
import { itemFieldKey, type CardDef, type Draft, type ItemRow, type PageDef } from './pages/types';

export type { PageSection };

type Errors = Record<string, string>;

// Every required or formatted field on the page, including each row of the inline lists.
function validate(page: PageDef, draft: Draft): Errors {
  const fields = page.cards.flatMap((c) => c.fields ?? []);
  return pageItems(page).reduce((errs, def) => draft.items[def.k].reduce((acc, row) => {
    const defs = def.sub.map((f) => ({ ...f, k: itemFieldKey(def.k, row.key, f.k) }));
    const values = Object.fromEntries(def.sub.map((f) => [itemFieldKey(def.k, row.key, f.k), row.values[f.k]]));
    return { ...acc, ...validateFields(defs, values) };
  }, errs), validateFields(fields, draft.fields));
}

function WhatsAppTest({ number }: { number: string }) {
  return (
    <div className="f">
      <span className="label">&nbsp;</span>
      <a className="abtn ghost" href={`https://wa.me/${encodeURIComponent(number.trim())}`} target="_blank" rel="noopener noreferrer">
        <Icon name="chat" />Send a test message
      </a>
    </div>
  );
}

interface CardBodyProps {
  card: CardDef;
  draft: Draft;
  errors: Errors;
  setField: (k: string, v: FieldValue) => void;
  setList: (k: string, list: string[]) => void;
  setRows: (k: string, rows: ItemRow[]) => void;
  clearError: (k: string) => void;
}

function CardBody({ card, draft, errors, setField, setList, setRows, clearError }: CardBodyProps) {
  if (card.chips) {
    const { k } = card.chips;
    return <ChipList def={card.chips} values={draft.lists[k]} onChange={(list) => setList(k, list)} />;
  }
  if (card.items) {
    const { k } = card.items;
    return <ItemList def={card.items} rows={draft.items[k]} errors={errors} onChange={(rows) => setRows(k, rows)} onFieldEdit={clearError} />;
  }
  return (
    <div className="form">
      {card.fields?.map((f) => (
        <Fragment key={f.k}>
          <Field f={f} value={draft.fields[f.k]} error={errors[f.k]} onChange={(v) => setField(f.k, v)} />
          {f.test && <WhatsAppTest number={String(draft.fields[f.k] ?? '')} />}
        </Fragment>
      ))}
    </div>
  );
}

function PageEditor({ section }: { section: PageSection }) {
  const page = PAGES[section];
  const { toast } = useAdmin();
  usePageMeta(`${page.title} · Admin`);
  const stack = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    loadPage(page)
      .then((d) => { if (active) { setSaved(d); setDraft(d); } })
      .catch((err: unknown) => { if (active) setLoadError(err instanceof Error ? err.message : 'Could not load this page.'); });
    return () => { active = false; };
  }, [page, attempt]);

  const dirty = useMemo(() => Boolean(draft && saved) && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const clearError = (k: string) => setErrors((errs) => {
    if (!errs[k]) return errs;
    const { [k]: _gone, ...rest } = errs;
    return rest;
  });
  const update = (patch: (d: Draft) => Draft) => setDraft((d) => d && patch(d));
  const setField = (k: string, v: FieldValue) => {
    clearError(k);
    update((d) => ({ ...d, fields: { ...d.fields, [k]: v } }));
  };
  const setList = (k: string, list: string[]) => update((d) => ({ ...d, lists: { ...d.lists, [k]: list } }));
  const setRows = (k: string, rows: ItemRow[]) => update((d) => ({ ...d, items: { ...d.items, [k]: rows } }));

  const discard = () => {
    setDraft(saved);
    setErrors({});
    toast('Changes discarded.');
  };

  const save = async () => {
    if (!draft || !saved) return;
    const errs = validate(page, draft);
    if (Object.keys(errs).length) {
      flushSync(() => setErrors(errs));
      focusFirstError(stack.current);
      toast('Some fields need a look before saving.', 'err');
      return;
    }
    setSaving(true);
    const out = await savePage(page, saved, draft);
    setSaving(false);
    setSaved(out.saved);
    setDraft((d) => d && withNewIds(d, out.newIds));
    if (out.error) toast(`Not everything saved: ${out.error}`, 'err');
    else toast('Saved. The website shows the new version.');
  };

  const retry = () => {
    setLoadError(null);
    setAttempt((n) => n + 1);
  };

  return (
    <>
      <div className="ph">
        <div><h1>{page.title}</h1><p>{page.sub}</p></div>
        <div className="actions">
          {section === 'settings' && (
            <Link className="abtn ghost" to="/admin/account"><Icon name="key" />Your sign-in details</Link>
          )}
          <a className="abtn ghost" href={page.site} target="_blank" rel="noopener noreferrer"><Icon name="ext" />See it on the site</a>
        </div>
      </div>

      {loadError ? (
        <div className="card">
          <div className="empty" role="alert">
            <strong>This page didn’t load.</strong>
            <p>{loadError}</p>
            <button className="abtn ghost" type="button" onClick={retry} style={{ marginTop: 16 }}><Icon name="refresh" />Try again</button>
          </div>
        </div>
      ) : !draft ? (
        <div className="card"><p className="empty" role="status">Loading…</p></div>
      ) : (
        <div className="stack" ref={stack}>
          {page.cards.map((card) => (
            <section className="card" key={card.title}>
              <div className="hd"><div><h2>{card.title}</h2>{card.sub && <p>{card.sub}</p>}</div></div>
              <div className="bd">
                <CardBody
                  card={card} draft={draft} errors={errors}
                  setField={setField} setList={setList} setRows={setRows} clearError={clearError}
                />
              </div>
            </section>
          ))}
        </div>
      )}

      <div className={dirty ? 'savebar show' : 'savebar'} role="region" aria-label="Unsaved changes" inert={!dirty}>
        <span>You have unsaved changes.</span>
        <button className="abtn ghost sm" type="button" onClick={discard} disabled={saving}>Discard</button>
        <button className="abtn primary sm" type="button" onClick={save} disabled={saving}>
          {saving ? <><span className="spin" aria-hidden="true" />Saving…</> : 'Save changes'}
        </button>
      </div>
    </>
  );
}

// Keyed by section: moving between the pages starts a fresh editor rather than carrying a draft over.
export default function AdminPageEditor({ section }: { section: PageSection }) {
  return <PageEditor key={section} section={section} />;
}
