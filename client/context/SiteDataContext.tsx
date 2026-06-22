import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API } from '../hooks/useApi';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  announcementText: string;
  announcementActive: boolean;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}

export interface HeroData {
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  portraitImageUrl: string;
  portraitQuote: string;
  portraitAttribution: string;
}

export interface StatisticData {
  id: string;
  value: string;
  label: string;
  detail: string;
}

export interface WelcomeData {
  scriptTitle: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  credentialName: string;
  credentialTitle: string;
  portraitImageUrl: string;
}

export interface ServiceData {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  order: number;
}

export interface ScoreBand {
  id: string;
  minScore: number;
  maxScore: number;
  emoji: string;
  label: string;
  message: string;
}

export interface MethodologyQuoteData {
  scriptTitle: string;
  quote: string;
  attribution: string;
}

export interface CTAData {
  heading: string;
  subtitle: string;
  scriptTitle: string;
  buttonText: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  altText: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  gender: string;
  text: string;
  role: string;
  order: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ContactInfo {
  clinicName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  officeHours: string;
  mapEmbedUrl: string;
}

export interface AboutData {
  tagline: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  highlightQuote: string;
  profileName: string;
  profileRole: string;
  profileLocation: string;
  profileExperience: string;
  portraitImageUrl: string;
}

export interface Credential {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface MethodologyStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  order: number;
}

export interface ProgramData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  details: string[];
  suitability: string;
  linkedServiceSlug: string;
  order: number;
}

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  linkedServiceSlug: string;
  published: boolean;
}

// ─── Context Value ──────────────────────────────────────────────────────────────

interface SiteDataContextType {
  loading: boolean;
  siteSettings: SiteSettings | null;
  hero: HeroData | null;
  statistics: StatisticData[];
  welcome: WelcomeData | null;
  services: ServiceData[];
  assessmentQuestions: AssessmentQuestion[];
  scoreBands: ScoreBand[];
  methodologyQuote: MethodologyQuoteData | null;
  cta: CTAData | null;
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  contact: ContactInfo | null;
  about: AboutData | null;
  credentials: Credential[];
  methodologySteps: MethodologyStep[];
  programs: ProgramData[];
  blogPosts: BlogPostData[];
}

const defaultValue: SiteDataContextType = {
  loading: true,
  siteSettings: null,
  hero: null,
  statistics: [],
  welcome: null,
  services: [],
  assessmentQuestions: [],
  scoreBands: [],
  methodologyQuote: null,
  cta: null,
  gallery: [],
  testimonials: [],
  faqs: [],
  contact: null,
  about: null,
  credentials: [],
  methodologySteps: [],
  programs: [],
  blogPosts: [],
};

const SiteDataContext = createContext<SiteDataContextType>(defaultValue);

// ─── Helper ─────────────────────────────────────────────────────────────────────

async function fetchJson<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api/${endpoint}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.error(`Failed to fetch /api/${endpoint}`);
    return null;
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<SiteDataContextType, 'loading'>>({
    siteSettings: null,
    hero: null,
    statistics: [],
    welcome: null,
    services: [],
    assessmentQuestions: [],
    scoreBands: [],
    methodologyQuote: null,
    cta: null,
    gallery: [],
    testimonials: [],
    faqs: [],
    contact: null,
    about: null,
    credentials: [],
    methodologySteps: [],
    programs: [],
    blogPosts: [],
  });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [
      siteSettings,
      hero,
      statistics,
      welcome,
      services,
      assessmentQuestions,
      scoreBands,
      methodologyQuote,
      cta,
      gallery,
      testimonials,
      faqs,
      contact,
      about,
      credentials,
      methodologySteps,
      programs,
      blogPosts,
    ] = await Promise.all([
      fetchJson<SiteSettings>('site-settings'),
      fetchJson<HeroData>('hero'),
      fetchJson<StatisticData[]>('statistics'),
      fetchJson<WelcomeData>('welcome'),
      fetchJson<ServiceData[]>('services'),
      fetchJson<AssessmentQuestion[]>('assessment-questions'),
      fetchJson<ScoreBand[]>('assessment-score-bands'),
      fetchJson<MethodologyQuoteData>('methodology-quote'),
      fetchJson<CTAData>('cta'),
      fetchJson<GalleryImage[]>('gallery'),
      fetchJson<Testimonial[]>('testimonials'),
      fetchJson<FAQItem[]>('faqs'),
      fetchJson<ContactInfo>('contact'),
      fetchJson<AboutData>('about'),
      fetchJson<Credential[]>('credentials'),
      fetchJson<MethodologyStep[]>('methodology-steps'),
      fetchJson<ProgramData[]>('programs'),
      fetchJson<BlogPostData[]>('blog-posts'),
    ]);

    setData({
      siteSettings,
      hero,
      statistics: statistics ?? [],
      welcome,
      services: services ?? [],
      assessmentQuestions: assessmentQuestions ?? [],
      scoreBands: scoreBands ?? [],
      methodologyQuote,
      cta,
      gallery: gallery ?? [],
      testimonials: testimonials ?? [],
      faqs: faqs ?? [],
      contact,
      about,
      credentials: credentials ?? [],
      methodologySteps: methodologySteps ?? [],
      programs: programs ?? [],
      blogPosts: blogPosts ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
