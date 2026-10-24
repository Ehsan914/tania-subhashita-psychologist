import {defineConfig} from 'sanity'
import {media} from 'sanity-plugin-media'
import {structureTool} from 'sanity/structure'
import {bookingsTool} from './bookings'
import {BrandIcon, StudioLayout, theme} from './branding'
import {schemaTypes, SINGLETONS} from './schemaTypes'
import {structure} from './structure'

// The project id is public (the site reads the same dataset without a token), so the build on
// Vercel needs no studio/.env.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'v75epg3m'

export default defineConfig({
  name: 'default',
  title: 'Tania Subhashita',
  // Served at taniasubhashita.com/studio: the prefix comes from project.basePath in
  // sanity.cli.ts; a basePath here would be added on top of it (/studio/studio).
  icon: BrandIcon,
  theme,
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  // Media: one browsable library of every uploaded photo, with tags and alt text.
  plugins: [structureTool({structure}), media()],
  // Bookings first, so it is the page the Studio opens on.
  tools: (prev) => [bookingsTool, ...prev],
  // Token login, so useClient().config().token holds the session token the Bookings tool sends
  // to /api/bookings; with cookie login (or 'dual' when cookies work) the client holds no token.
  auth: {loginMethod: 'token'},
  schema: {types: schemaTypes},
  // One document each; Studio hides them from "create new" and blocks duplicates and deletes.
  document: {singletons: SINGLETONS},
  studio: {components: {layout: StudioLayout}},
})
