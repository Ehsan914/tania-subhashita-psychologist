// The Sanity project the site's content lives in. The dataset is public and read-only from
// here, so no token is needed; the same code runs in the browser and in the prerender
// (Node), where Vite has already replaced import.meta.env. Plain Node (the tests) has no
// import.meta.env at all, hence the ?.
import { createImageUrlBuilder } from '@sanity/image-url';

const SANITY_CONFIG = {
  projectId: import.meta.env?.VITE_SANITY_PROJECT_ID ?? 'v75epg3m',
  dataset: import.meta.env?.VITE_SANITY_DATASET ?? 'production',
  apiVersion: '2026-01-01',
  useCdn: true,
  // drafts never reach the site
  perspective: 'published',
} as const;

/** Runs a GROQ query against the published content. */
export async function sanityFetch<T>(query: string): Promise<T> {
  // Loaded on demand: prerendered pages carry their content and never query, so the
  // client stays out of the page bundle; only the build and the dev server fetch it.
  const { createClient } = await import('@sanity/client');
  return createClient(SANITY_CONFIG).fetch<T>(query);
}

// Image URLs are built from the project details alone; no request is made.
const builder = createImageUrlBuilder({ projectId: SANITY_CONFIG.projectId, dataset: SANITY_CONFIG.dataset });

// An image field as the queries return it: the asset reference with the editor's crop and
// hotspot, so the CDN crops around the part of the photo that matters.
export interface SanityImage {
  asset: { _ref: string };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

/** A CDN address for the image at the given width, in the best format the browser accepts. */
export function imageUrl(image: SanityImage | null | undefined, width?: number): string | undefined {
  if (!image?.asset) return undefined;
  const sized = builder.image(image);
  return (width ? sized.width(width) : sized).auto('format').url();
}
