import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
import {BookmarkIcon} from '@sanity/icons/Bookmark'
import {UserIcon} from '@sanity/icons/User'
import {imageWithAlt, titledAs} from './fields'

export const credential = defineType({
  name: 'credential',
  title: 'Credential',
  type: 'object',
  icon: BookmarkIcon,
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'title', subtitle: 'description'}},
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'profile', title: 'Profile', default: true},
    {name: 'credentials', title: 'Credentials'},
    {...ALL_FIELDS_GROUP, hidden: true},
  ],
  fieldsets: [
    {name: 'heading', title: 'Page heading', options: {columns: 2}},
    {name: 'facts', title: 'Facts beside the photo', options: {columns: 2}},
  ],
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'profile', fieldset: 'heading'}),
    defineField({name: 'headline', title: 'Headline', type: 'string', group: 'profile', fieldset: 'heading'}),
    imageWithAlt('image', 'The portrait at the top of the page.', 'profile'),
    defineField({name: 'practice', title: 'Practice', type: 'string', group: 'profile', fieldset: 'facts'}),
    defineField({name: 'experience', title: 'Experience', type: 'string', group: 'profile', fieldset: 'facts'}),
    defineField({name: 'body', title: 'Body', type: 'inlineText', group: 'profile'}),
    defineField({name: 'pullQuote', title: 'Pull quote', type: 'text', rows: 3, group: 'profile', description: 'Set large under the body. Curly quotes are added for you.'}),
    defineField({
      name: 'credentials',
      title: 'Training & credentials',
      type: 'array',
      group: 'credentials',
      description: 'In the order shown on the page. Drag to reorder.',
      of: [defineArrayMember({type: 'credential'})],
    }),
  ],
  preview: titledAs('About page'),
})
