import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PortableTextBlock } from '@portabletext/react';
import { sanityFetch, type SanityImage } from '../lib/sanity';

// ─── Types ──────────────────────────────────────────────────────────────────────
// The shapes SITE_QUERY returns (field map: docs/sanity-schema-map.md). Singletons are
// null until published; array items carry Sanity's _key, documents their _id.

export type RichText = PortableTextBlock[];

export interface ProcessStep { _key: string; title: string; description?: string }
export interface Stat { _key: string; figure: string; label: string }
export interface GalleryPhoto extends SanityImage { _key: string; alt: string }
export interface Testimonial { _key: string; quote: string; theme?: string }

export interface HomePage {
  heroHeadline?: RichText;
  heroIntro?: string;
  heroPrimaryButton?: string;
  heroSecondaryLink?: string;
  heroImage?: SanityImage;
  welcomeEyebrow?: string;
  welcomeHeadline?: string;
  welcomeBody?: RichText;
  welcomeSignatureName?: string;
  welcomeSignatureDetail?: RichText;
  welcomeImage?: SanityImage;
  approachHeadline?: string;
  approachQuote?: string;
  approachQuoteAttribution?: string;
  approachSteps: ProcessStep[];
  stats: Stat[];
  galleryPhotos: GalleryPhoto[];
  testimonials: Testimonial[];
  ctaHeadline?: string;
  ctaText?: string;
  ctaButton?: string;
}

export interface Credential { _key: string; title: string; description?: string }

export interface AboutPage {
  eyebrow?: string;
  headline?: string;
  body?: RichText;
  pullQuote?: string;
  practice?: string;
  experience?: string;
  image?: SanityImage;
  credentials: Credential[];
}

export interface Statement { _key: string; text: string }
export interface AssessmentResult { _key: string; fromScore: number; toScore: number; headline: string; message?: string }
export interface SelfAssessment { statements: Statement[]; results: AssessmentResult[] }

export interface GeneralSettings {
  siteName?: string;
  announcement?: RichText;
  isAnnouncementVisible?: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export interface ContactSettings {
  practiceName: string;
  address: string;
  city?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
}

export interface BookingSettings {
  whatsappNumber?: string;
  intro?: string;
  times?: string[];
  sessionOptions?: string[];
}

export interface ServiceData {
  _id: string;
  name: string;
  slug: string;
  category: string;
  summary: string;
  workPoints: string[];
  closingNote: string | null;
  _updatedAt: string;
}

export interface ProgramData {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  summary: string;
  suitedTo: string;
  curriculum: string[];
}

export interface FAQItem { _id: string; question: string; answer: string }

export interface BlogPostData {
  _id: string;
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  summary: string;
  body: RichText;
  _updatedAt: string;
}

// ─── Context Value ──────────────────────────────────────────────────────────────

export interface SiteData {
  home: HomePage | null;
  about: AboutPage | null;
  assessment: SelfAssessment | null;
  general: GeneralSettings | null;
  contact: ContactSettings | null;
  booking: BookingSettings | null;
  services: ServiceData[];
  programs: ProgramData[];
  faqs: FAQItem[];
  posts: BlogPostData[];
}

interface SiteDataContextType extends SiteData {
  loading: boolean;
}

const EMPTY: SiteData = {
  home: null,
  about: null,
  assessment: null,
  general: null,
  contact: null,
  booking: null,
  services: [],
  programs: [],
  faqs: [],
  posts: [],
};

const SiteDataContext = createContext<SiteDataContextType>({ loading: true, ...EMPTY });

// Content the page was prerendered with. When present the provider starts from it and
// makes no requests; without it (the dev server) the provider loads everything itself.
export const SiteDataSeed = createContext<SiteData | null>(null);

// ─── Loading ────────────────────────────────────────────────────────────────────

// Everything the site shows, in one request. Hidden items (isVisible == false) are filtered
// here, lists come in the editor's drag-and-drop order, and the arrays a page maps over
// are never null.
const SITE_QUERY = `{
  "home": *[_id == "homePage"][0]{
    ...,
    "approachSteps": coalesce(approachSteps, []),
    "stats": coalesce(stats, []),
    "galleryPhotos": coalesce(galleryPhotos[isVisible != false]{_key, asset, hotspot, crop, alt}, []),
    "testimonials": coalesce(testimonials[isVisible != false]{_key, quote, theme}, [])
  },
  "about": *[_id == "aboutPage"][0]{..., "credentials": coalesce(credentials, [])},
  "assessment": *[_id == "selfAssessment"][0]{
    "statements": coalesce(statements[isVisible != false]{_key, text}, []),
    "results": coalesce(results, []) | order(fromScore asc)
  },
  "general": *[_id == "generalSettings"][0],
  "contact": *[_id == "contactSettings"][0],
  "booking": *[_id == "bookingSettings"][0],
  "services": *[_type == "service" && isVisible != false] | order(orderRank){
    _id, name, "slug": slug.current, category, summary, "workPoints": coalesce(workPoints, []), closingNote, _updatedAt
  },
  "programs": *[_type == "program" && isVisible != false] | order(orderRank){
    _id, title, "slug": slug.current, "subtitle": coalesce(subtitle, ""), "duration": coalesce(duration, ""),
    "summary": coalesce(summary, ""), "suitedTo": coalesce(suitedTo, ""), "curriculum": coalesce(curriculum, [])
  },
  "faqs": *[_type == "faq" && isVisible != false] | order(orderRank){_id, question, answer},
  "posts": *[_type == "post"] | order(date desc){
    _id, title, "slug": slug.current, date, "category": coalesce(category, ""), summary,
    "body": coalesce(body, []), _updatedAt
  }
}`;

// In the browser a failed request leaves the site on its fallbacks. The prerender passes
// strict, so unreachable content fails the build instead of publishing empty pages.
export async function loadSiteData({ strict = false } = {}): Promise<SiteData> {
  try {
    return await sanityFetch<SiteData>(SITE_QUERY);
  } catch (err) {
    if (strict) throw new Error(`Failed to load the site's content from Sanity: ${(err as Error).message}`);
    console.error("Failed to load the site's content from Sanity", err);
    return EMPTY;
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const seed = useContext(SiteDataSeed);
  const [data, setData] = useState<SiteData>(seed ?? EMPTY);
  const [loading, setLoading] = useState(!seed);

  useEffect(() => {
    if (seed) return;
    let live = true;
    loadSiteData().then((loaded) => {
      if (!live) return;
      setData(loaded);
      setLoading(false);
    });
    return () => { live = false; };
  }, [seed]);

  return (
    <SiteDataContext.Provider value={{ loading, ...data }}>
      {children}
    </SiteDataContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useSiteData() {
  return useContext(SiteDataContext);
}
