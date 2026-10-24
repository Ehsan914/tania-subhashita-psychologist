// One therapy's own page (/services/<slug>): what it covers, how sessions work in Dhaka and
// online, related support, and the way to book it. The Therapies page stays the hub.
import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { usePageMeta, useJsonLd } from '../hooks/usePageMeta';
import { clip } from '../lib/site';
import { pageGraph, serviceNode } from '../lib/schema';
import { SplitWords, useReveal } from '../site/motion';
import { useContactDetails } from '../site/SiteChrome';
import { CRISIS_SLUG, bookHref, linkPrograms, serviceHref } from '../site/therapies/therapyData';
import NotFoundPage from './NotFoundPage';

const RELATED_MAX = 6;

function CrisisPanel() {
  return (
    <div className="note" role="note" style={{ marginBottom: 32 }}>
      <p>
        <strong>If you are in danger right now, please don't wait for an appointment.</strong> Call <a href="tel:999">999</a>,
        go to the nearest hospital emergency department, or call Kaan Pete Roi on <a className="nowrap" href="tel:09612119911">09612-119911</a> (3 pm – 3 am daily).
        Booking requests and messages are not read around the clock.
      </p>
    </div>
  );
}

export default function ServicePage() {
  const { slug } = useParams();
  const { services, programs } = useSiteData();
  const contact = useContactDetails();
  const rootRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.slug === slug);
  const program = useMemo(() => (service ? linkPrograms(programs).get(service.slug) : undefined), [programs, service]);
  const related = useMemo(
    () => (service ? services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, RELATED_MAX) : []),
    [services, service],
  );

  useReveal(rootRef, [slug]);

  const path = service ? serviceHref(service.slug) : '';
  const points = service?.workPoints ?? [];
  usePageMeta(
    service ? `${service.name} · Dhaka & online | Tania Subhashita` : 'Therapy not found — Tania Subhashita',
    service
      ? clip(`${service.summary} In person in New Eskaton, Dhaka, or online by video across Bangladesh.`)
      : 'This therapy page could not be found.',
    // until a service says what treatment covers, its page is too thin to offer search engines
    { noindex: !service || points.length === 0 },
  );
  useJsonLd('page', service && pageGraph('WebPage', path, service.name,
    [{ name: 'Therapies', path: '/services' }, { name: service.name, path }],
    [serviceNode(service, path)]));

  if (!service) return <NotFoundPage />;

  return (
    <div ref={rootRef} className="service-page">
      <header className="page-head wrap">
        <nav aria-label="Breadcrumb" className="crumbs" data-reveal="rise">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Therapies</Link></li>
            <li aria-current="page">{service.name}</li>
          </ol>
        </nav>
        <p className="eyebrow" data-reveal="rise">{service.category}</p>
        <h1 className="h1" data-reveal="split"><SplitWords>{service.name}</SplitWords></h1>
        <p className="lede" data-reveal="rise">{service.summary}</p>
      </header>

      <div className="wrap service-body">
        <div>
          {service.slug === CRISIS_SLUG && <CrisisPanel />}

          {points.length > 0 && (
            <section data-reveal="rise">
              <h2>What we can work on together</h2>
              <ul className="points">{points.map((p) => <li key={p}>{p}</li>)}</ul>
            </section>
          )}

          {service.closingNote && (
            <section data-reveal="rise">
              <p className="note">{service.closingNote}</p>
            </section>
          )}

          <section data-reveal="rise">
            <h2>How sessions work</h2>
            <p>
              Sessions last 60 minutes, and the first 20 minutes are free, so you can see whether working together feels right
              before committing to anything. You can come in person to {contact.clinic || 'the chamber'} in New Eskaton, Dhaka, or meet
              online by Zoom or Google Meet from anywhere in Bangladesh.
            </p>
            <p>
              Everything you share is kept strictly confidential. The first conversation is about understanding what is happening for
              you and what you would like to change; together we then decide on a plan that fits.
            </p>
            {program && (
              <p>
                For more structured support, this is also offered as the{' '}
                <Link className="link" to={`/programs#${program.slug}`}>{program.title}</Link> ({program.duration.toLowerCase()}).
              </p>
            )}
          </section>

          {related.length > 0 && (
            <section data-reveal="rise">
              <h2>Related support</h2>
              <ul className="related">
                {related.map((s) => <li key={s.slug}><Link to={serviceHref(s.slug)}>{s.name}</Link></li>)}
              </ul>
            </section>
          )}
        </div>

        <aside aria-label="Book this therapy" data-reveal="rise">
          <dl>
            <div><dt>In person</dt><dd>{contact.clinic && <>{contact.clinic}, </>}{contact.address || 'New Eskaton, Dhaka'}</dd></div>
            <div><dt>Online</dt><dd>Zoom or Google Meet, anywhere in Bangladesh</dd></div>
            <div><dt>Session</dt><dd>60 minutes · first 20 minutes free</dd></div>
            {contact.hours && <div><dt>Hours</dt><dd>{contact.hours}</dd></div>}
          </dl>
          <Link className="btn" to={bookHref(service.slug)}>
            Book a session <span className="arrow" aria-hidden="true">→</span>
          </Link>
          {contact.phone && (
            <p style={{ marginTop: 16, fontSize: 15 }}>Or call <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a></p>
          )}
        </aside>
      </div>
    </div>
  );
}
