// Schema.org JSON-LD for the public pages. Everything here is read from the site's own
// content, so the markup always matches what the page shows; nothing is added that a
// visitor cannot see (no ratings, no invented hours or coordinates).
import { toPlainText } from '@portabletext/react';
import type { AboutPage, BlogPostData, ContactSettings, GeneralSettings, HomePage, ServiceData } from '../context/SiteDataContext';
import { PERSON_NAME, SITE_NAME, SITE_URL, absoluteUrl } from './site';

const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_ID = `${SITE_URL}/#person`;
const PRACTICE_ID = `${SITE_URL}/#practice`;

const PORTRAIT = '/images/tania-subhashita-portrait.jpeg';
const DHAKA = { '@type': 'City', name: 'Dhaka', sameAs: 'https://en.wikipedia.org/wiki/Dhaka' };
const BANGLADESH = { '@type': 'Country', name: 'Bangladesh', sameAs: 'https://en.wikipedia.org/wiki/Bangladesh' };

// "…, New Eskaton, Dhaka 1000" → street "…, New Eskaton", locality "Dhaka", postal code "1000".
function postalAddress(contact: ContactSettings) {
  const city = contact.city || 'Dhaka';
  // the city is editor-entered text, so it is escaped before going into the pattern
  const cityPattern = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = contact.address.match(new RegExp(`^(.*?),?\\s*${cityPattern}\\s*-?\\s*(\\d{4})?\\s*$`, 'i'));
  return {
    '@type': 'PostalAddress',
    streetAddress: (match?.[1] ?? contact.address).trim(),
    addressLocality: city,
    ...(match?.[2] && { postalCode: match[2] }),
    addressCountry: 'BD',
  };
}

/** Tania's qualifications as one line of text: the signature line under the welcome. */
export const qualificationsOf = (home: HomePage | null) => toPlainText(home?.welcomeSignatureDetail ?? []);

interface SiteGraphInput {
  contact: ContactSettings | null;
  general: GeneralSettings | null;
  home: HomePage | null;
  about: AboutPage | null;
}

/** The site, the psychologist and the practice: on every page, so each one can point at them by @id. */
export function siteGraph({ contact, general, home, about }: SiteGraphInput) {
  const sameAs = [general?.facebookUrl, general?.linkedinUrl, general?.instagramUrl].filter(Boolean);
  const qualifications = qualificationsOf(home);

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    jobTitle: 'Psychologist',
    ...(qualifications && { description: qualifications }),
    url: absoluteUrl('/about'),
    image: absoluteUrl(PORTRAIT),
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Dhaka', sameAs: 'https://www.du.ac.bd' },
    knowsAbout: (about?.credentials ?? []).map((c) => c.title),
    worksFor: { '@id': PRACTICE_ID },
    ...(sameAs.length > 0 && { sameAs }),
  };

  const practice = contact && {
    '@type': 'MedicalBusiness',
    '@id': PRACTICE_ID,
    name: contact.practiceName || SITE_NAME,
    description: 'Psychological counselling and psychotherapy in New Eskaton, Dhaka, and online by video across Bangladesh.',
    url: SITE_URL,
    image: absoluteUrl(PORTRAIT),
    logo: absoluteUrl('/logo-pink.svg'),
    ...(contact.phone && { telephone: contact.phone.replace(/\s+/g, '') }),
    ...(contact.email && { email: contact.email }),
    address: postalAddress(contact),
    areaServed: [DHAKA, BANGLADESH],
    employee: { '@id': PERSON_ID },
    ...(sameAs.length > 0 && { sameAs }),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': WEBSITE_ID, url: SITE_URL, name: SITE_NAME, inLanguage: 'en', publisher: { '@id': PERSON_ID } },
      person,
      ...(practice ? [practice] : []),
    ],
  };
}

export interface Crumb {
  name: string;
  path: string;
}

function breadcrumbs(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path),
    })),
  };
}

/** A page's own nodes: a WebPage of the given type, its breadcrumb trail and anything it is about. */
export function pageGraph(type: string, path: string, name: string, crumbs: Crumb[], extra: object[] = [], mainEntity?: object) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type,
        '@id': `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name,
        isPartOf: { '@id': WEBSITE_ID },
        inLanguage: 'en',
        ...(mainEntity && { mainEntity }),
      },
      ...(crumbs.length > 0 ? [breadcrumbs(crumbs)] : []),
      ...extra,
    ],
  };
}

export const personRef = { '@id': PERSON_ID };

export function serviceNode(service: ServiceData, path: string) {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(path)}#service`,
    name: service.name,
    serviceType: service.name,
    category: service.category,
    description: service.summary,
    url: absoluteUrl(path),
    provider: { '@id': PRACTICE_ID },
    areaServed: [DHAKA, BANGLADESH],
    availableChannel: [
      { '@type': 'ServiceChannel', name: 'In person in New Eskaton, Dhaka', serviceLocation: { '@id': PRACTICE_ID } },
      { '@type': 'ServiceChannel', name: 'Online by video (Zoom or Google Meet)', serviceUrl: absoluteUrl('/book') },
    ],
  };
}

// Post dates are stored as YYYY-MM-DD, already the ISO 8601 date schema.org wants.
export function isoDate(date: string | undefined): string | undefined {
  return date?.slice(0, 10) || undefined;
}

export function articleNode(post: BlogPostData, path: string, image: string) {
  const published = isoDate(post.date);
  // an edit saved in UTC can carry an earlier day than the date written on the post
  const saved = post._updatedAt.slice(0, 10);
  const modified = saved && published && saved < published ? published : saved;
  return {
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(path)}#article`,
    headline: post.title,
    description: post.summary,
    articleSection: post.category,
    ...(published && { datePublished: published }),
    ...((modified ?? published) && { dateModified: modified ?? published }),
    image: absoluteUrl(image),
    author: personRef,
    publisher: personRef,
    mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
    inLanguage: 'en',
  };
}
