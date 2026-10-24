import {defineField, defineType} from 'sanity'
import {ComposeIcon} from '@sanity/icons/Compose'

// A post is public once published; an unpublished draft never reaches the site.
export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: ComposeIcon,
  fieldsets: [{name: 'details', title: 'Details', options: {columns: 3}}],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The end of the post’s web address. Changing it after publishing breaks existing links.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'date', title: 'Date', type: 'date', fieldset: 'details', validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string', fieldset: 'details'}),
    defineField({name: 'readTime', title: 'Reading time', type: 'string', fieldset: 'details', description: 'e.g. 4 min read'}),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Shown in the blog list and in search results.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Body', type: 'postBody', validation: (rule) => rule.required()}),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', date: 'date', category: 'category'},
    prepare: ({title, date, category}) => ({title, subtitle: [date, category].filter(Boolean).join(' · ')}),
  },
})
