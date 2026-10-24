import {defineField} from 'sanity'
import {EyeClosedIcon} from '@sanity/icons/EyeClosed'

// Fields and previews shared by the pages and collections.

export const visibleField = defineField({
  name: 'isVisible',
  title: 'Visible on site',
  type: 'boolean',
  description: 'Turn off to hide this from the site without deleting it.',
  initialValue: true,
})

// A hidden item says so in the list, in words and with an icon, not by colour.
export const withStatus = (isVisible: boolean | undefined, subtitle?: string) =>
  isVisible === false
    ? {subtitle: ['Hidden', subtitle].filter(Boolean).join(' · '), media: EyeClosedIcon}
    : {subtitle}

// A singleton's header names the document, not its first field.
export const titledAs = (title: string) => ({select: {}, prepare: () => ({title})})

const altField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description: 'What the photo shows, for people who can’t see it and for search engines. Describe it plainly; skip “photo of”.',
  validation: (rule) => rule.required(),
})

export const imageFields = [altField]

export const imageWithAlt = (name: string, description?: string, group?: string) =>
  defineField({
    name,
    title: 'Image',
    type: 'image',
    description,
    group,
    options: {hotspot: true},
    fields: imageFields,
  })
