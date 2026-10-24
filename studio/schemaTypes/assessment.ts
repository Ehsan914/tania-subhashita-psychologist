import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
import {ChartUpwardIcon} from '@sanity/icons/ChartUpward'
import {CheckmarkIcon} from '@sanity/icons/Checkmark'
import {TaskIcon} from '@sanity/icons/Task'
import {titledAs, visibleField, withStatus} from './fields'

export const statement = defineType({
  name: 'statement',
  title: 'Statement',
  type: 'object',
  icon: CheckmarkIcon,
  fields: [defineField({name: 'text', title: 'Statement', type: 'string', validation: (rule) => rule.required()}), visibleField],
  preview: {
    select: {title: 'text', isVisible: 'isVisible'},
    prepare: ({title, isVisible}) => ({title, ...withStatus(isVisible)}),
  },
})

export const result = defineType({
  name: 'result',
  title: 'Result',
  type: 'object',
  icon: ChartUpwardIcon,
  fieldsets: [{name: 'range', title: 'For scores', description: 'One point per statement ticked.', options: {columns: 2}}],
  fields: [
    defineField({name: 'fromScore', title: 'From', type: 'number', fieldset: 'range', validation: (rule) => rule.required().integer().min(0)}),
    defineField({
      name: 'toScore',
      title: 'To',
      type: 'number',
      fieldset: 'range',
      validation: (rule) =>
        rule
          .required()
          .integer()
          .custom((to, context) => {
            const from = (context.parent as {fromScore?: number} | undefined)?.fromScore
            return typeof to === 'number' && typeof from === 'number' && to < from ? '“To” must not be lower than “From”.' : true
          }),
    }),
    defineField({name: 'headline', title: 'Headline', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'message', title: 'Message', type: 'text', rows: 3, validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'headline', from: 'fromScore', to: 'toScore'},
    prepare: ({title, from, to}) => ({title, subtitle: `Scores ${from}–${to}`}),
  },
})

// The "gentle self-check" on the Home page: statements to tick, and the message for each score range.
export const selfAssessment = defineType({
  name: 'selfAssessment',
  title: 'Self-assessment',
  type: 'document',
  icon: TaskIcon,
  groups: [
    {name: 'statements', title: 'Statements', default: true},
    {name: 'results', title: 'Results'},
    {...ALL_FIELDS_GROUP, hidden: true},
  ],
  fields: [
    defineField({
      name: 'statements',
      title: 'Statements',
      type: 'array',
      group: 'statements',
      description: 'Visitors tick the ones that sound like their week. Drag to reorder.',
      of: [defineArrayMember({type: 'statement'})],
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      group: 'results',
      description: 'The message shown for each range of scores. Together the ranges should cover 0 up to the number of visible statements.',
      of: [defineArrayMember({type: 'result'})],
    }),
  ],
  preview: titledAs('Self-assessment'),
})
