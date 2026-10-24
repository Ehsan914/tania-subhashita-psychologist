// Portable Text from Sanity rendered as the design's markup. Strong and em use the library's
// defaults (<strong>, <em>); links are the one mark that needs the site's rules.
import { PortableText, type PortableTextComponents, type PortableTextMarkComponentProps } from '@portabletext/react';
import { Fragment, type ReactNode } from 'react';
import type { RichText } from '../context/SiteDataContext';

const isExternal = (href: string) => /^https?:\/\//i.test(href);

// Other sites open in a new tab without access to this one; mailto:, tel: and the site's
// own paths stay in place.
function LinkMark({ value, children }: PortableTextMarkComponentProps<{ _type: 'link'; href?: string }>) {
  const href = value?.href ?? '';
  return isExternal(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    : <a href={href}>{children}</a>;
}

const MARKS: PortableTextComponents['marks'] = { link: LinkMark };

// Paragraphs, headings and lists use the defaults: <p>, <h2>, <ul>, <ol>.
const BLOCKS: PortableTextComponents = { marks: MARKS };

// No wrapping <p>: the block's text runs on inside the caller's line.
const INLINE: PortableTextComponents = {
  marks: MARKS,
  block: { normal: ({ children }: { children?: ReactNode }) => <>{children}</> },
};

/** Rich text as paragraphs (welcome text, about body), and the headings and lists of a post. */
export function InlineText({ value }: { value: RichText }) {
  return <PortableText value={value} components={BLOCKS} />;
}

/** Rich text inside one line of the design, wrapped in a <span> (signature line, announcement bar). */
export function InlineSpan({ value }: { value: RichText }) {
  // a space between blocks keeps two of them from running together
  return (
    <span>
      {value.map((block, i) => (
        <Fragment key={block._key ?? i}>{i > 0 && ' '}<PortableText value={block} components={INLINE} /></Fragment>
      ))}
    </span>
  );
}
