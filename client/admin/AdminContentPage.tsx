// Generic list editor for the admin's content types (design: admin/content.html?t=…,
// admin/assets/content.js). Per-type fields and endpoints live in ./content/configs.
import { TYPES, type ContentType } from './content/configs';
import { ContentSection } from './content/ContentSection';
import { Icon } from './ui/icons';
import { usePageMeta } from '../hooks/usePageMeta';

export type { ContentType };

function ContentPage({ type }: { type: ContentType }) {
  const T = TYPES[type];

  usePageMeta(`${T.title} · Admin`);

  return (
    <>
      <div className="ph">
        <div><h1>{T.title}</h1><p>{T.sub}</p></div>
        <div className="actions">
          <a className="abtn ghost" href={T.site} target="_blank" rel="noopener noreferrer"><Icon name="ext" />See it on the site</a>
        </div>
      </div>
      {T.note && <p className="callout"><Icon name="shield" /><span>{T.note}</span></p>}
      <div className="stack">
        {T.sections.map((sec) => (
          <ContentSection key={sec.endpoint} sec={sec} showHeading={T.sections.length > 1} />
        ))}
      </div>
    </>
  );
}

// Every content route renders this same component, so the key resets all state when the type changes.
export default function AdminContentPage({ type }: { type: ContentType }) {
  return <ContentPage key={type} type={type} />;
}
