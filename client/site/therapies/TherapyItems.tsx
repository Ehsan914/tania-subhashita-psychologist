// One therapy as a guide row (step 2) or as a photo card (the plain list).
import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { ProgramData, ServiceData } from '../../context/SiteDataContext';
import { bookHref, CRISIS_SLUG } from './therapyData';

const MAX_CARD_STAGGER = 8;

function CrisisNote() {
  return (
    <p className="crisis-note">
      If you are in danger right now, call <a href="tel:999">999</a> or Kaan Pete Roi on <a href="tel:09612119911">09612-119911</a> (3 pm – 3 am).
    </p>
  );
}

function AlsoProgram({ program, lead }: { program: ProgramData; lead: string }) {
  return <p className="also">{lead} <Link className="link" to={`/programs#${program.slug}`}>{program.title}</Link></p>;
}

interface ItemProps {
  service: ServiceData;
  index: number;
  program?: ProgramData;
}

export function TherapyRow({ service, index, program, isTarget }: ItemProps & { isTarget: boolean }) {
  return (
    <li className={isTarget ? 'service is-target' : 'service'} id={service.slug} style={{ '--i': index } as CSSProperties}>
      <Link to={bookHref(service.slug)}>
        <span className="txt"><strong>{service.name}</strong><small>{service.description}</small></span>
        <span className="go" aria-hidden="true">→</span>
        <span className="visually-hidden">, book a session</span>
      </Link>
      {service.slug === CRISIS_SLUG && <CrisisNote />}
      {program && <AlsoProgram program={program} lead="Also offered as a programme:" />}
    </li>
  );
}

// Decorative photo; a slug without a photo keeps the card's tinted frame instead.
function TherapyPhoto({ slug }: { slug: string }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className="s-img">
      {!missing && (
        <img src={`/images/therapies/${slug}.jpg`} alt="" width={900} height={600} loading="lazy" onError={() => setMissing(true)} />
      )}
    </div>
  );
}

export function TherapyCard({ service, index, program }: ItemProps) {
  return (
    <li className="s-card" style={{ '--i': Math.min(index, MAX_CARD_STAGGER) } as CSSProperties}>
      <TherapyPhoto slug={service.slug} />
      <div className="s-body">
        <h4><Link to={bookHref(service.slug)}>{service.name}<span className="visually-hidden">, book a session</span></Link></h4>
        <p>{service.description}</p>
        {service.slug === CRISIS_SLUG && <CrisisNote />}
        {program && <AlsoProgram program={program} lead="Also a programme:" />}
        <span className="s-go" aria-hidden="true">Book a session <span className="arrow">→</span></span>
      </div>
    </li>
  );
}
