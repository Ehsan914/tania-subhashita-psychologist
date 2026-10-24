import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {visibleField, withStatus} from './fields'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    visibleField,
    orderRankField({type: 'faq'}),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {title: 'question', isVisible: 'isVisible'},
    prepare: ({title, isVisible}) => ({title, ...withStatus(isVisible)}),
  },
})
