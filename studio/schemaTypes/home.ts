import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {imageWithAlt, titledAs} from './fields'

// The Home page, one tab per section in the order the page shows them.
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'welcome', title: 'Welcome'},
    {name: 'approach', title: 'Approach'},
    {name: 'numbers', title: 'Numbers'},
    {name: 'gallery', title: 'Gallery'},
    {name: 'testimonials', title: 'Testimonials'},
    {name: 'cta', title: 'Call to action'},
    {...ALL_FIELDS_GROUP, hidden: true},
  ],
  fieldsets: [
    {name: 'heroButtons', title: 'Buttons', options: {columns: 2}},
    {name: 'signature', title: 'Signature', description: 'Under the text, beside the link to the About page.'},
    {name: 'quote', title: 'Quote'},
  ],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'headlineText',
      group: 'hero',
      description:
        'Shown as two lines: the first alone, then the second with the italic ending. Press Enter between the lines; select the ending and press Ctrl+I (⌘I on a Mac) to set it in italic.',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'The first sentence search engines see; keep “psychologist” and “Dhaka” in it.',
    }),
    defineField({name: 'heroPrimaryButton', title: 'Primary button', type: 'string', group: 'hero', fieldset: 'heroButtons', description: 'Opens the booking page.'}),
    defineField({name: 'heroSecondaryLink', title: 'Secondary link', type: 'string', group: 'hero', fieldset: 'heroButtons', description: 'Opens the Services page.'}),
    imageWithAlt('heroImage', 'Fills the screen behind the headline.', 'hero'),

    defineField({name: 'welcomeEyebrow', title: 'Eyebrow', type: 'string', group: 'welcome'}),
    defineField({name: 'welcomeHeadline', title: 'Headline', type: 'string', group: 'welcome', description: 'The last three words are set in italic.'}),
    defineField({name: 'welcomeBody', title: 'Body', type: 'inlineText', group: 'welcome'}),
    defineField({name: 'welcomeSignatureName', title: 'Name', type: 'string', group: 'welcome', fieldset: 'signature'}),
    defineField({name: 'welcomeSignatureDetail', title: 'Qualifications', type: 'inlineText', group: 'welcome', fieldset: 'signature'}),
    imageWithAlt('welcomeImage', 'The portrait beside the text.', 'welcome'),

    defineField({name: 'approachHeadline', title: 'Headline', type: 'string', group: 'approach', description: 'The last two words are set in italic.'}),
    defineField({name: 'approachQuote', title: 'Quote', type: 'text', rows: 3, group: 'approach', fieldset: 'quote'}),
    defineField({name: 'approachQuoteAttribution', title: 'Attribution', type: 'string', group: 'approach', fieldset: 'quote'}),
    defineField({
      name: 'approachSteps',
      title: 'Steps',
      type: 'array',
      group: 'approach',
      description: 'Numbered 01, 02, 03… in the order shown here. Drag to reorder.',
      of: [defineArrayMember({type: 'processStep'})],
    }),

    defineField({
      name: 'stats',
      title: 'Numbers',
      type: 'array',
      group: 'numbers',
      description: 'The figures in the band across the page, left to right.',
      of: [defineArrayMember({type: 'stat'})],
    }),

    defineField({
      name: 'galleryPhotos',
      title: 'Photos',
      type: 'array',
      group: 'gallery',
      description: 'The “Workshops & conferences” carousel, in this order.',
      of: [defineArrayMember({type: 'galleryPhoto'})],
    }),

    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      group: 'testimonials',
      description: 'Only words a client has agreed in writing to share. The section stays hidden until there is one.',
      of: [defineArrayMember({type: 'testimonial'})],
    }),

    defineField({name: 'ctaHeadline', title: 'Headline', type: 'string', group: 'cta', description: 'The last two words are set in italic.'}),
    defineField({name: 'ctaText', title: 'Text', type: 'string', group: 'cta'}),
    defineField({name: 'ctaButton', title: 'Button', type: 'string', group: 'cta', description: 'Opens the booking page.'}),
  ],
  preview: titledAs('Home page'),
})
