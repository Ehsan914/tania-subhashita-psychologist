// Shapes for the single-record page editor (design: admin/assets/page.js).
import type { FieldDef, FieldValue } from '../ui/fields';

// `test` adds the design's "Send a test message" link beside a WhatsApp number field.
export interface PageField extends FieldDef {
  test?: boolean;
}

// A list of short strings edited as removable chips (booking time slots, session types).
// Stored in the record as newline-separated text.
export interface ChipsDef {
  k: string;
  label: string;
  ph: string;
  check: (value: string) => string;
}

// A collection edited inline as an ordered list of small forms (credentials, steps).
export interface ItemsDef {
  k: string;
  endpoint: string;
  one: string;
  blank: Record<string, string>; // sent on create for required columns the list does not edit
  sub: FieldDef[];
}

export interface CardDef {
  title: string;
  sub?: string;
  fields?: PageField[];
  chips?: ChipsDef;
  items?: ItemsDef;
}

// A singleton admin endpoint. With a prefix, its columns appear in the draft as `prefix.column`,
// so one page can combine several records (the home page edits four).
export interface SingletonSource {
  endpoint: string;
  prefix?: string;
}

export interface PageDef {
  title: string;
  sub: string;
  site: string;
  sources: SingletonSource[];
  cards: CardDef[];
}

export interface ItemRow {
  key: string;
  id: string | null;
  values: Record<string, string>;
}

export interface Draft {
  fields: Record<string, FieldValue>;
  lists: Record<string, string[]>;
  items: Record<string, ItemRow[]>;
}

export const itemFieldKey = (list: string, row: string, field: string) => `${list}.${row}.${field}`;
