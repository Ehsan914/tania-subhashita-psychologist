// One entry per content type, following the Prisma models (design: admin/assets/content.js `TYPES`).
import type { FieldDef } from '../ui/fields';
import { lines, text } from './helpers';
import type { TypeConfig } from './types';

export type ContentType =
  | 'services' | 'programs' | 'blog' | 'testimonials' | 'faqs' | 'gallery' | 'statistics' | 'assessment';

// The service areas as stored in the database (US spelling).
const CATEGORIES = ['Mood & Emotion', 'Self & Relationships', 'Addiction & Behavior', 'Specialized Care'];

const SLUG: Partial<FieldDef> = {
  mono: true,
  req: true,
  pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  patternMsg: 'Use lower-case letters, numbers and dashes, like anxiety-disorder.',
};
const NUM: Partial<FieldDef> = { req: true, input: 'number', pattern: /^\d+$/, patternMsg: 'Use a whole number.' };

export const TYPES: Record<ContentType, TypeConfig> = {
  services: {
    title: 'Services', site: '/services?view=list',
    sub: 'The therapies people choose from when they book. Drag to set the order they appear in.',
    sections: [{
      endpoint: 'services', one: 'service', many: 'services', reorder: 'bulk', search: true, flag: 'isActive', unique: 'slug',
      defaults: { category: CATEGORIES[0] },
      thumb: (s) => `/images/therapies/${text(s, 'slug')}.jpg`, main: (s) => text(s, 'name'), meta: (s) => text(s, 'category'),
      fields: [
        { k: 'name', label: 'Name', req: true },
        { k: 'slug', label: 'Web address', hint: 'Links straight to it: /services#web-address', ...SLUG },
        { k: 'category', label: 'Area', type: 'select', options: CATEGORIES, req: true },
        { k: 'description', label: 'Short description', type: 'textarea', req: true, full: true },
        { k: 'treatmentPoints', label: 'What treatment covers', type: 'textarea', full: true, hint: 'One point per line. Shown as a list on the service.' },
        { k: 'clinicNote', label: 'Clinic note', type: 'textarea', full: true, hint: 'Shown beneath the service, for example a safety message.' },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }],
  },
  programs: {
    title: 'Programs', site: '/programs',
    sub: 'Structured multi-week programmes, each linked to one of the services.',
    sections: [{
      endpoint: 'programs', one: 'program', many: 'programs', reorder: 'each', flag: 'isActive', unique: 'slug',
      main: (p) => text(p, 'title'), meta: (p) => `${text(p, 'duration')} · ${text(p, 'subtitle')}`,
      toForm: (p) => ({
        title: text(p, 'title'), slug: text(p, 'slug'), subtitle: text(p, 'subtitle'), duration: text(p, 'duration'),
        description: text(p, 'description'), suitability: text(p, 'suitability'), isActive: Boolean(p.isActive),
        details: Array.isArray(p.details) ? p.details.map(String).join('\n') : '',
      }),
      fromForm: (v) => ({ ...v, details: lines(String(v.details ?? '')) }),
      fields: [
        { k: 'title', label: 'Title', req: true },
        { k: 'slug', label: 'Web address', ...SLUG },
        { k: 'subtitle', label: 'Subtitle', req: true, full: true },
        { k: 'duration', label: 'Duration', req: true, ph: '8 weekly sessions' },
        { k: 'description', label: 'Description', type: 'textarea', req: true, full: true },
        { k: 'details', label: "What's included", type: 'textarea', full: true, hint: 'One item per line.' },
        { k: 'suitability', label: 'Who it suits', type: 'textarea', full: true },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }],
  },
  blog: {
    title: 'Journal posts', site: '/blog',
    sub: 'Articles on the journal page. Drafts stay hidden until you publish them.',
    sections: [{
      endpoint: 'blog-posts', one: 'post', many: 'posts', reorder: 'bulk', newAt: 'start', search: true,
      flag: 'published', flagLabel: 'Published', unique: 'slug',
      main: (p) => text(p, 'title'), meta: (p) => `${text(p, 'date')} · ${text(p, 'category')} · ${text(p, 'readTime')}`,
      fields: [
        { k: 'title', label: 'Title', req: true, full: true },
        { k: 'slug', label: 'Web address', ...SLUG },
        { k: 'category', label: 'Category', req: true },
        { k: 'date', label: 'Date shown', req: true, ph: 'June 12, 2026' },
        { k: 'readTime', label: 'Reading time', ph: '5 min read' },
        { k: 'summary', label: 'Summary', type: 'textarea', req: true, full: true, hint: 'One or two sentences for the journal list.' },
        { k: 'content', label: 'Article', type: 'textarea', tall: true, req: true, full: true, hint: 'Start a line with ### for a heading. Leave a blank line between paragraphs.' },
        { k: 'published', label: 'Status', type: 'switch', on: 'Published on the journal' },
      ],
    }],
  },
  testimonials: {
    title: 'Testimonials', site: '/#voices',
    sub: 'Quotes shown in “What people carry away” on the home page.',
    note: 'Quotes are published without names. Never add a name, initials, date or detail that could identify a client, and only use words a client has agreed to share.',
    sections: [{
      endpoint: 'testimonials', one: 'quote', many: 'quotes', reorder: 'each', flag: 'isActive',
      createExtras: { name: '' }, // the model still requires a name; quotes are never published with one
      main: (t) => `“${text(t, 'text')}”`, meta: (t) => text(t, 'role'),
      fields: [
        { k: 'role', label: 'What it speaks to', req: true, full: true, ph: 'On feeling safe', hint: 'A theme, never a name.' },
        { k: 'text', label: 'Quote', type: 'textarea', req: true, full: true },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }],
  },
  faqs: {
    title: 'FAQs', site: '/',
    sub: '“Before you begin” on the home page: the questions people ask before a first session.',
    sections: [{
      endpoint: 'faqs', one: 'question', many: 'questions', reorder: 'each', flag: 'isActive',
      main: (f) => text(f, 'question'), meta: (f) => text(f, 'answer'),
      fields: [
        { k: 'question', label: 'Question', req: true, full: true },
        { k: 'answer', label: 'Answer', type: 'textarea', req: true, full: true },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }],
  },
  gallery: {
    title: 'Gallery', site: '/',
    sub: '“Beyond the therapy room” on the home page. Photos keep their own shape, so any size works.',
    sections: [{
      endpoint: 'gallery', one: 'photo', many: 'photos', reorder: 'each', grid: true, flag: 'isActive',
      thumb: (g) => text(g, 'url'), main: (g) => text(g, 'altText'), meta: () => '',
      fields: [
        { k: 'url', label: 'Photo', type: 'image', req: true, full: true, hint: 'Path or link to the image file.' },
        { k: 'altText', label: 'Caption', type: 'textarea', req: true, full: true, hint: 'Shown under the photo and read aloud by screen readers.' },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }],
  },
  statistics: {
    title: 'Statistics', site: '/about',
    sub: 'The figures that sit beside the bio.',
    sections: [{
      endpoint: 'statistics', one: 'figure', many: 'figures', reorder: 'each',
      main: (s) => `${text(s, 'value')}  ${text(s, 'label')}`, meta: (s) => text(s, 'detail'),
      fields: [
        { k: 'value', label: 'Figure', req: true, ph: '1,560' },
        { k: 'label', label: 'What it counts', req: true },
        { k: 'detail', label: 'Small print', full: true },
      ],
    }],
  },
  assessment: {
    title: 'Self-check', site: '/',
    sub: '“How has this week felt?” on the home page. Each ticked statement adds one point; the score picks the message.',
    sections: [{
      endpoint: 'assessment-questions', heading: 'Statements', one: 'statement', many: 'statements', reorder: 'each', flag: 'isActive',
      main: (q) => text(q, 'text'), meta: () => '',
      fields: [
        { k: 'text', label: 'Statement', type: 'textarea', req: true, full: true, hint: 'Written in the first person, about the last seven days.' },
        { k: 'isActive', label: 'Visibility', type: 'switch' },
      ],
    }, {
      endpoint: 'assessment-score-bands', heading: 'Score messages', one: 'score message', many: 'score messages',
      sortBy: (a, b) => Number(a.minScore) - Number(b.minScore),
      main: (b) => `${text(b, 'emoji') ? `${text(b, 'emoji')} ` : ''}${text(b, 'label')}`,
      meta: (b) => `Score ${text(b, 'minScore')}–${text(b, 'maxScore')}`,
      fromForm: (v) => ({ ...v, minScore: Number(v.minScore), maxScore: Number(v.maxScore) }),
      fields: [
        { k: 'label', label: 'Title', req: true },
        { k: 'emoji', label: 'Emoji' },
        { k: 'minScore', label: 'From score', ...NUM },
        { k: 'maxScore', label: 'To score', ...NUM },
        { k: 'message', label: 'Message', type: 'textarea', req: true, full: true },
      ],
    }],
  },
};
