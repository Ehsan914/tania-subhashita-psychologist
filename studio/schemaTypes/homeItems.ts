import {defineField, defineType} from 'sanity'
import {BarChartIcon} from '@sanity/icons/BarChart'
import {DoubleQuoteIcon} from '@sanity/icons/DoubleQuote'
import {ImageIcon} from '@sanity/icons/Image'
import {OlistIcon} from '@sanity/icons/Olist'
import {imageFields, visibleField, withStatus} from './fields'

// The short lists inside the Home page. They reorder by drag and drop, so none has an order field.

export const stat = defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({name: 'figure', title: 'Figure', type: 'string', description: 'As shown, e.g. 1,560', validation: (rule) => rule.required()}),
    defineField({name: 'label', title: 'Label', type: 'string', description: 'The words after the figure.', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'figure', subtitle: 'label'}},
})

export const processStep = defineType({
  name: 'processStep',
  title: 'Step',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'description'}},
})

// The thumbnail stays on a hidden photo so it can still be recognised; the word says it's hidden.
export const galleryPhoto = defineType({
  name: 'galleryPhoto',
  title: 'Photo',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [...imageFields, visibleField],
  preview: {
    select: {title: 'alt', isVisible: 'isVisible', media: 'asset'},
    prepare: ({title, isVisible, media}) => ({title, media, subtitle: withStatus(isVisible).subtitle}),
  },
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  icon: DoubleQuoteIcon,
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      description: 'What it speaks to, shown under the quote, e.g. “On feeling safe”. Never a name.',
    }),
    visibleField,
  ],
  preview: {
    select: {title: 'quote', theme: 'theme', isVisible: 'isVisible'},
    prepare: ({title, theme, isVisible}) => ({title, ...withStatus(isVisible, theme)}),
  },
})
