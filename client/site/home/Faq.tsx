// "Before you begin": questions that expand in place; the first starts open.
import { useState } from 'react';
import type { FAQItem } from '../../context/SiteDataContext';
import { SplitWords } from '../motion';

function Item({ faq, defaultOpen }: { faq: FAQItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="item" data-open={open ? '' : undefined}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {faq.question}<span className="plus" aria-hidden="true" />
      </button>
      <div className="answer"><div><p>{faq.answer}</p></div></div>
    </div>
  );
}

export default function Faq({ faqs }: { faqs: FAQItem[] }) {
  return (
    <section className="section faq" style={{ paddingTop: 0 }}>
      <div className="wrap layout">
        <div>
          <h2 className="h2" data-reveal="split"><SplitWords>Before you <em>begin</em></SplitWords></h2>
          <p className="lede" data-reveal="rise">The questions people most often ask before a first session.</p>
        </div>
        <div className="items" data-reveal="rise">
          {faqs.map((faq, i) => <Item key={faq.id} faq={faq} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  );
}
