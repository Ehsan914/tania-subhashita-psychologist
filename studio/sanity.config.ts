import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
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
  schema: {types: schemaTypes},
  // One document each; Studio hides them from "create new" and blocks duplicates and deletes.
  document: {singletons: SINGLETONS},
  studio: {components: {layout: StudioLayout}},
})
