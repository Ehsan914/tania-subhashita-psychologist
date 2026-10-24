import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // https://taniasubhashita.sanity.studio; also listed in the site's STUDIO_ORIGINS on Vercel
  studioHost: 'taniasubhashita',
})
