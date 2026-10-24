import {defineArrayMember, defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {visibleField, withStatus} from './fields'

// The groups the Services page is divided into, in the site's order.
export const CATEGORIES = ['Mood & Emotion', 'Self & Relationships', 'Addiction & Behavior', 'Specialized Care']

const slugField = (source: string) =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    description: 'The end of the page’s web address. Changing it breaks existing links to the page.',
    options: {source},
    validation: (rule) => rule.required(),
  })

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
    slugField('name'),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: CATEGORIES, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Under the name on the Services page and at the top of the service’s own page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workPoints',
      title: 'What we can work on together',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: 'One point per line. Without these the page is kept out of search results.',
    }),
    defineField({name: 'closingNote', title: 'Closing note', type: 'text', rows: 3, description: 'A short note after the points.'}),
    visibleField,
    orderRankField({type: 'service'}),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {title: 'name', category: 'category', isVisible: 'isVisible'},
    prepare: ({title, category, isVisible}) => ({title, ...withStatus(isVisible, category)}),
  },
})

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: ThLargeIcon,
  fieldsets: [{name: 'intro', title: 'Under the title', options: {columns: 2}}],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    slugField('title'),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string', fieldset: 'intro'}),
    defineField({name: 'duration', title: 'Duration', type: 'string', fieldset: 'intro', description: 'e.g. 8 weekly sessions, in person or online'}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({name: 'suitedTo', title: 'Suited to', type: 'text', rows: 2}),
    defineField({name: 'curriculum', title: 'What we’ll cover', type: 'array', of: [defineArrayMember({type: 'string'})], description: 'One point per line.'}),
    visibleField,
    orderRankField({type: 'program'}),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {title: 'title', duration: 'duration', isVisible: 'isVisible'},
    prepare: ({title, duration, isVisible}) => ({title, ...withStatus(isVisible, duration)}),
  },
})
