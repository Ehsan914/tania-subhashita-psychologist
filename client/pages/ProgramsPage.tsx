import { useRef } from 'react';
import { useSiteData } from '../context/SiteDataContext';
import { useReveal } from '../site/motion';
import { PageHead } from '../site/inner/PageHead';
import { ProgramSection } from '../site/inner/ProgramSection';
import { CtaBand } from '../site/inner/CtaBand';
import { usePageMeta } from '../hooks/usePageMeta';

export default function ProgramsPage() {
  usePageMeta('Programs — Tania Subhashita, Psychologist', 'Structured 4, 8 and 12-week therapy programs for anxiety and panic, addictive behaviour, and exam phobia.');
  const { programs } = useSiteData();
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef, [programs]);

  return (
    <div ref={rootRef}>
      <PageHead
        eyebrow="Programs"
        title={<>When you want a <em>clear path.</em></>}
        lede="For deeper struggles, steady, staged guidance does more than occasional drop-in sessions. Each program walks you from where you are now to feeling resilient on your own."
      />
      <div id="programs">
        {programs.map((p, i) => <ProgramSection key={p.id} program={p} index={i} />)}
      </div>
      <CtaBand
        title={<>Not sure which is <em>right?</em></>}
        lede="Start with a free 20-minute conversation and we'll decide together, or choose single sessions instead."
      />
    </div>
  );
}
