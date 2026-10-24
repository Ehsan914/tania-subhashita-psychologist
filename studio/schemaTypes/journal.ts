import {defineField, defineType} from 'sanity'
import {ComposeIcon} from '@sanity/icons/Compose'
import {imageWithAlt} from './fields'

// A post is public once published; an unpublished draft never reaches the site.
export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: ComposeIcon,
  fieldsets: [{name: 'details', title: 'Details', options: {columns: 2}}],
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
    imageWithAlt('image', 'At the top of the post, in the blog list and when the post is shared. Leave empty for a calm stock photo.'),
    defineField({name: 'date', title: 'Date', type: 'date', fieldset: 'details', validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string', fieldset: 'details'}),
    // The site now works out "N min read" from the post's word count. Kept, hidden, so posts that
    // already hold a value don't show an "unknown field" warning.
    defineField({name: 'readTime', title: 'Reading time', type: 'string', hidden: true}),
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
    select: {title: 'title', date: 'date', category: 'category', media: 'image'},
    prepare: ({title, date, category, media}) => ({title, media, subtitle: [date, category].filter(Boolean).join(' · ')}),
  },
})
