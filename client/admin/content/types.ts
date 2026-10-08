// Shapes for the content list editor (design: admin/assets/content.js `TYPES`).
import type { FieldDef, FieldValue } from '../ui/fields';

// A record as the admin API returns it; each section reads the fields it knows.
export interface ContentItem {
  id: string;
  order?: number;
  [key: string]: unknown;
}

export type FormValues = Record<string, FieldValue>;

export interface SectionConfig {
  endpoint: string; // /api/admin/<endpoint>
  heading?: string; // shown when a type has more than one section
  one: string;
  many: string;
  // 'bulk': PUT <endpoint>/reorder { items }; 'each': one PUT { order } per moved item
  reorder?: 'bulk' | 'each';
  // where the server puts a new item: blog posts are created at the top
  newAt?: 'start' | 'end';
  search?: boolean;
  grid?: boolean;
  flag?: 'isActive' | 'published';
  flagLabel?: string;
  unique?: string; // a field that must differ between items (the web address)
  fields: FieldDef[];
  defaults?: FormValues; // starting values for a new item
  createExtras?: Record<string, unknown>; // required by the model but not edited here
  thumb?: (it: ContentItem) => string;
  main: (it: ContentItem) => string;
  meta: (it: ContentItem) => string;
  toForm?: (it: ContentItem) => FormValues;
  fromForm?: (v: FormValues) => Record<string, unknown>;
  sortBy?: (a: ContentItem, b: ContentItem) => number;
}

export interface TypeConfig {
  title: string;
  site: string; // public page that shows this content
  sub: string;
  note?: string;
  sections: SectionConfig[];
}
