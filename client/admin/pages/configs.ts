// The five single-record pages and their grouped field cards (design: admin/assets/page.js PAGES).
import type { FieldDef } from '../ui/fields';
import type { PageDef } from './types';

export type PageSection = 'home' | 'about' | 'contact' | 'booking' | 'settings';

const URL_FIELD: Partial<FieldDef> = { input: 'url', mono: true, ph: 'https://' };
// '5:00 pm' or the stored '05:00 PM'
const TIME = /^(1[0-2]|0?[1-9]):[0-5]\d\s?(am|pm)$/i;

const home: PageDef = {
  title: 'Home page',
  site: '/',
  sub: 'The words and pictures on the home page, section by section.',
  sources: [
    { endpoint: 'hero', prefix: 'hero' },
    { endpoint: 'welcome', prefix: 'welcome' },
    { endpoint: 'methodology-quote', prefix: 'quote' },
    { endpoint: 'cta', prefix: 'cta' },
  ],
  cards: [
    {
      title: 'Hero', sub: 'The first screen, over the room photo.', fields: [
        { k: 'hero.tagline', label: 'Small line above the title', full: true },
        { k: 'hero.titleLine1', label: 'Title, line 1', req: true },
        { k: 'hero.titleLine2', label: 'Title, line 2' },
        { k: 'hero.titleLine3', label: 'Title, line 3', hint: 'Shown in the accent italic.' },
        { k: 'hero.description', label: 'Introduction', type: 'textarea', req: true, full: true },
        { k: 'hero.ctaPrimaryText', label: 'Main button', req: true },
        { k: 'hero.ctaSecondaryText', label: 'Second link' },
        { k: 'hero.portraitImageUrl', label: 'Background photo', type: 'image', full: true },
      ],
    },
    {
      title: 'Welcome', sub: 'The introduction beside the portrait.', fields: [
        { k: 'welcome.scriptTitle', label: 'Small heading' },
        { k: 'welcome.heading', label: 'Heading', req: true },
        { k: 'welcome.paragraph1', label: 'First paragraph', type: 'textarea', req: true, full: true },
        { k: 'welcome.paragraph2', label: 'Second paragraph', type: 'textarea', full: true },
        { k: 'welcome.credentialName', label: 'Signed by', req: true },
        { k: 'welcome.credentialTitle', label: 'Qualifications line', type: 'textarea' },
        { k: 'welcome.portraitImageUrl', label: 'Portrait', type: 'image', full: true },
      ],
    },
    {
      title: 'How we’ll work', sub: 'The quote above the three steps. The steps themselves are on the About page.', fields: [
        { k: 'quote.scriptTitle', label: 'Heading' },
        { k: 'quote.attribution', label: 'Attribution' },
        { k: 'quote.quote', label: 'Quote', type: 'textarea', req: true, full: true },
      ],
    },
    {
      title: 'Closing invitation', sub: 'The last band before the footer.', fields: [
        { k: 'cta.heading', label: 'Heading', req: true, full: true },
        { k: 'cta.subtitle', label: 'Line beneath', full: true },
        { k: 'cta.buttonText', label: 'Button', req: true },
      ],
    },
  ],
};

const about: PageDef = {
  title: 'About page',
  site: '/about',
  sub: 'Bio, credentials and the three steps of how sessions work.',
  sources: [{ endpoint: 'about' }],
  cards: [
    {
      title: 'Bio', fields: [
        { k: 'tagline', label: 'Small heading' },
        { k: 'heading', label: 'Page title', req: true },
        { k: 'bio1', label: 'First paragraph', type: 'textarea', req: true, full: true },
        { k: 'bio2', label: 'Second paragraph', type: 'textarea', full: true },
        { k: 'quote', label: 'Pull quote', type: 'textarea', full: true },
        { k: 'location', label: 'Practice' },
        { k: 'experience', label: 'Experience' },
        { k: 'portraitImageUrl', label: 'Portrait', type: 'image', full: true },
      ],
    },
    {
      title: 'Training & credentials', sub: 'Listed in the order shown.', items: {
        k: 'credentials', endpoint: 'credentials', one: 'credential', blank: { description: '' },
        sub: [{ k: 'title', label: 'Credential', req: true, full: true }],
      },
    },
    {
      title: 'How sessions work', sub: 'The three steps on the home page.', items: {
        k: 'methodology', endpoint: 'methodology-steps', one: 'step', blank: {},
        sub: [
          { k: 'stepNumber', label: 'Label', ph: 'First' },
          { k: 'title', label: 'Title', req: true },
          { k: 'description', label: 'Description', type: 'textarea', full: true },
        ],
      },
    },
  ],
};

const contact: PageDef = {
  title: 'Contact info',
  site: '/contact',
  sub: 'Shown on the contact page and in the footer of every page.',
  sources: [{ endpoint: 'contact' }],
  cards: [
    {
      title: 'Clinic', fields: [
        { k: 'clinicName', label: 'Clinic name', req: true },
        { k: 'officeHours', label: 'Opening hours', req: true },
        { k: 'address', label: 'Street address', req: true, full: true },
        { k: 'city', label: 'City and postcode', req: true },
      ],
    },
    {
      title: 'Reaching you', fields: [
        { k: 'phone', label: 'Phone', req: true, input: 'tel' },
        { k: 'email', label: 'Email', req: true, input: 'email' },
        {
          k: 'mapEmbedUrl', label: 'Map link', full: true, ...URL_FIELD,
          hint: 'In Google Maps: Share → Embed a map → copy the link inside src="…".',
        },
      ],
    },
  ],
};

const booking: PageDef = {
  title: 'Booking settings',
  site: '/book',
  sub: 'What people can choose on the booking page, and where their request is sent.',
  sources: [{ endpoint: 'booking-settings' }],
  cards: [
    {
      title: 'Requests', fields: [
        {
          k: 'whatsappNumber', label: 'WhatsApp number', req: true, mono: true, test: true,
          pattern: /^880\d{10}$/, patternMsg: 'Use the full number with 880 and no spaces, like 8801580700700.',
          hint: 'Booking requests open a WhatsApp chat with this number.',
        },
        { k: 'introText', label: 'Note above the form', type: 'textarea', full: true },
      ],
    },
    {
      title: 'Time slots', sub: 'The start times people can pick.',
      chips: { k: 'timeSlots', label: 'New time slot', ph: '5:00 pm', check: (v) => (TIME.test(v) ? '' : 'Write a time like 5:00 pm.') },
    },
    {
      title: 'Session types', sub: 'Lengths and kinds of session on offer.',
      chips: { k: 'sessionDurations', label: 'New session type', ph: '50-Min Couples Session', check: () => '' },
    },
  ],
};

const settings: PageDef = {
  title: 'Site settings',
  site: '/',
  sub: 'The name, the announcement bar and social links used across the whole site.',
  sources: [{ endpoint: 'site-settings' }],
  cards: [
    {
      title: 'Identity', fields: [
        { k: 'siteName', label: 'Site name', req: true },
        { k: 'siteTagline', label: 'Tagline' },
      ],
    },
    {
      title: 'Announcement bar', sub: 'A thin line above the header on every page.', fields: [
        { k: 'announcementActive', label: 'Show it', type: 'switch', on: 'Shown on every page' },
        { k: 'announcementText', label: 'Message', full: true, hint: 'Plain text, or a simple link in HTML.' },
      ],
    },
    {
      title: 'Social links', sub: 'Leave a link empty to hide that icon.', fields: [
        { k: 'facebookUrl', label: 'Facebook', full: true, ...URL_FIELD },
        { k: 'instagramUrl', label: 'Instagram', full: true, ...URL_FIELD },
        { k: 'linkedinUrl', label: 'LinkedIn', full: true, ...URL_FIELD },
      ],
    },
  ],
};

export const PAGES: Record<PageSection, PageDef> = { home, about, contact, booking, settings };
