// The heading block at the top of every inner page (design: header.page-head).
import type { ReactNode } from 'react';
import { SplitWords } from '../motion';

interface PageHeadProps {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
}

export function PageHead({ eyebrow, title, lede }: PageHeadProps) {
  return (
    <header className="page-head wrap">
      <p className="eyebrow" data-reveal="rise">{eyebrow}</p>
      <h1 className="h1" data-reveal="split"><SplitWords>{title}</SplitWords></h1>
      <p className="lede" data-reveal="rise">{lede}</p>
    </header>
  );
}
