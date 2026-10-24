import {defineArrayMember, defineField, defineType} from 'sanity'

const link = defineArrayMember({
  name: 'link',
  type: 'object',
  title: 'Link',
  fields: [
    defineField({
      name: 'href',
      type: 'url',
      title: 'Address',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}),
    }),
  ],
})

const italic = {title: 'Italic', value: 'em'}

const marks = {
  decorators: [{title: 'Bold', value: 'strong'}, italic],
  annotations: [link],
}

// Short text with bold, italic and links: the fields that held inline HTML before
// (announcement bar, welcome paragraphs, signature line, about body).
export const inlineText = defineType({
  name: 'inlineText',
  title: 'Text',
  type: 'array',
  of: [defineArrayMember({type: 'block', styles: [{title: 'Normal', value: 'normal'}], lists: [], marks})],
})

// The home headline: one block per line, so the site renders block 1 as the first row and
// block 2 as the second, with its `em` spans in italic.
export const headlineText = defineType({
  name: 'headlineText',
  title: 'Headline',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {decorators: [italic], annotations: []},
    }),
  ],
  validation: (rule) => rule.required().min(1).max(2).error('The headline has one or two lines.'),
})

// A blog post: paragraphs, one heading level, bullet and numbered lists.
export const postBody = defineType({
  name: 'postBody',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading', value: 'h2'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks,
    }),
  ],
})
