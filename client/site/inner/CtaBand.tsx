// The closing band that ends the inner pages with the free-consult invitation.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SplitWords } from '../motion';

interface CtaBandProps {
  title: ReactNode;
  lede: string;
}

export function CtaBand({ title, lede }: CtaBandProps) {
  return (
    <section className="cta-band">
      <div className="wrap inner">
        <div>
          <h2 className="h2" data-reveal="split"><SplitWords>{title}</SplitWords></h2>
          <p className="lede" data-reveal="rise">{lede}</p>
        </div>
        <Link className="btn" to="/book" data-reveal="rise">
          Book a free consult <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
