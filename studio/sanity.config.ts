import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {bookingsTool} from './bookings'
import {BrandIcon, StudioLayout, theme} from './branding'
import {schemaTypes, SINGLETONS} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) throw new Error('Set SANITY_STUDIO_PROJECT_ID in studio/.env (see .env.example)')

export default defineConfig({
  name: 'default',
  title: 'Tania Subhashita',
  icon: BrandIcon,
  theme,
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({structure})],
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
