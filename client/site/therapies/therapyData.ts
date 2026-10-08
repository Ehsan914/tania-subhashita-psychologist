// Static copy and pairings for the Therapies page (design: site/assets/therapies.js).
import type { ProgramData, ServiceData } from '../../context/SiteDataContext';

export interface AreaCopy {
  feel: string;
  line: string;
}

// Each area in the words people use for how they feel, not clinical labels. Keys are the
// services' category values as stored in the DB (US spelling); insertion order is the design's.
export const AREA_COPY = new Map<string, AreaCopy>([
  ['Mood & Emotion', { feel: 'My mood and feelings', line: 'Sadness, worry, fear, grief or guilt that won’t settle.' }],
  ['Self & Relationships', { feel: 'Myself and the people close to me', line: 'Confidence, decisions, partners, family and friends.' }],
  ['Addiction & Behavior', { feel: 'Habits I can’t control', line: 'Substances, screens, anger, or putting things off.' }],
  ['Specialized Care', { feel: 'A specific condition', line: 'OCD, trauma, sleep, exams, a child’s behaviour, or online sessions.' }],
]);

// The areas present in the data: the design's four in its order, then any other category
// an admin has added, in the order the services list them.
export function areasOf(services: ServiceData[]): string[] {
  const present = new Set(services.map((s) => s.category));
  const known = [...AREA_COPY.keys()].filter((area) => present.has(area));
  const extra = [...present].filter((area) => !AREA_COPY.has(area));
  return [...known, ...extra];
}

// Programs carry no service link in the API, so the design's pairing is kept here by slug.
const PROGRAM_FOR_SERVICE: Record<string, string> = {
  'anxiety-disorder': 'anxiety-panic',
  'behavioral-addiction': 'addiction-reset',
  'exam-phobia': 'student-peak-mind',
};

// service slug → the program also offered for it (only programs the API returns).
export function linkPrograms(programs: ProgramData[]): Map<string, ProgramData> {
  const bySlug = new Map(programs.map((p) => [p.slug, p]));
  return new Map(Object.entries(PROGRAM_FOR_SERVICE).flatMap(([service, program]) => {
    const match = bySlug.get(program);
    return match ? [[service, match] as const] : [];
  }));
}

// The therapy whose row and card also show the crisis helplines.
export const CRISIS_SLUG = 'suicidal-thought';

export const bookHref = (slug: string) => `/book?service=${encodeURIComponent(slug)}`;
