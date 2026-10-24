import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'v75epg3m',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // The site serves the built Studio at /studio, so its assets are linked from there.
  project: {basePath: '/studio'},
})
