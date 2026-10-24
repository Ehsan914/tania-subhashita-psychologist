import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {CogIcon} from '@sanity/icons/Cog'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {titledAs} from './fields'

export const generalSettings = defineType({
  name: 'generalSettings',
  title: 'General settings',
  type: 'document',
  icon: CogIcon,
  fieldsets: [
    {name: 'announcement', title: 'Announcement bar', description: 'The strip across the top of every page.'},
    {name: 'social', title: 'Social profiles', description: 'Linked from the footer.', options: {collapsible: true, collapsed: true}},
  ],
  fields: [
    defineField({name: 'siteName', title: 'Site name', type: 'string', description: 'In the header, the footer and the browser tab.', validation: (rule) => rule.required()}),
    defineField({name: 'announcement', title: 'Text', type: 'inlineText', fieldset: 'announcement'}),
    defineField({name: 'isAnnouncementVisible', title: 'Visible on site', type: 'boolean', fieldset: 'announcement', initialValue: true}),
    defineField({name: 'facebookUrl', title: 'Facebook page', type: 'url', fieldset: 'social'}),
    defineField({name: 'instagramUrl', title: 'Instagram profile', type: 'url', fieldset: 'social'}),
    defineField({name: 'linkedinUrl', title: 'LinkedIn profile', type: 'url', fieldset: 'social'}),
  ],
  preview: titledAs('General settings'),
})

export const contactSettings = defineType({
  name: 'contactSettings',
  title: 'Contact settings',
  type: 'document',
  icon: EnvelopeIcon,
  fieldsets: [
    {name: 'place', title: 'Practice', options: {columns: 2}},
    {name: 'reach', title: 'Phone and email', options: {columns: 2}},
  ],
  fields: [
    defineField({name: 'practiceName', title: 'Practice name', type: 'string', fieldset: 'place', validation: (rule) => rule.required()}),
    defineField({name: 'city', title: 'City', type: 'string', fieldset: 'place', initialValue: 'Dhaka'}),
    defineField({name: 'address', title: 'Address', type: 'text', rows: 2, validation: (rule) => rule.required()}),
    defineField({name: 'phone', title: 'Phone', type: 'string', fieldset: 'reach'}),
    defineField({name: 'email', title: 'Email', type: 'string', fieldset: 'reach', validation: (rule) => rule.email()}),
    defineField({name: 'openingHours', title: 'Opening hours', type: 'string', description: 'e.g. 10:00 am – 8:00 pm'}),
  ],
  preview: titledAs('Contact settings'),
})

export const bookingSettings = defineType({
  name: 'bookingSettings',
  title: 'Booking settings',
  type: 'document',
  icon: CalendarIcon,
  fieldsets: [{name: 'options', title: 'What visitors can choose', options: {columns: 2}}],
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      description: 'Booking requests open a WhatsApp chat with this number. Country code and number, digits only, e.g. 8801XXXXXXXXX.',
      validation: (rule) => rule.required().regex(/^\d{8,15}$/, {name: 'digits only'}),
    }),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3, description: 'Above the booking form. Leave empty for none.'}),
    defineField({name: 'times', title: 'Times', type: 'array', fieldset: 'options', of: [defineArrayMember({type: 'string'})], description: 'e.g. 10:00 am'}),
    defineField({
      name: 'sessionOptions',
      title: 'Sessions',
      type: 'array',
      fieldset: 'options',
      of: [defineArrayMember({type: 'string'})],
      description: 'e.g. 60-min session (Standard)',
    }),
  ],
  preview: titledAs('Booking settings'),
})
