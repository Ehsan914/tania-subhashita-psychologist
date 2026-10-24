import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {CATEGORIES} from './schemaTypes/services'

// Pages, then collections, then settings, in the conventional CMS order. Singletons open
// straight into their document; collections that the site orders are drag-to-reorder lists.
export const structure: StructureResolver = (S, context) => {
  const orderable = (type: string, title: string, icon: typeof SparklesIcon, extra?: {id: string; filter: string; params: Record<string, unknown>}) =>
    orderableDocumentListDeskItem({type, title, icon, S, context, ...extra})

  // One drag-to-reorder list per category, as the Services page groups them.
  const services = S.listItem()
    .title('Services')
    .icon(SparklesIcon)
    .child(
      S.list()
        .title('Services')
        .items([
          ...CATEGORIES.map((category) =>
            orderable('service', category, SparklesIcon, {
              id: `services-${category.replace(/\W+/g, '-').toLowerCase()}`,
              filter: 'category == $category',
              params: {category},
            }),
          ),
          S.divider(),
          S.listItem()
            .title('All services, A–Z')
            .icon(DocumentsIcon)
            .child(S.documentTypeList('service').title('All services').defaultOrdering([{field: 'name', direction: 'asc'}])),
        ]),
    )

  return S.list()
    .title('Content')
    .items([
      S.divider().title('Pages'),
      S.listItem().singleton('homePage'),
      S.listItem().singleton('aboutPage'),
      S.listItem().singleton('selfAssessment'),
      S.divider().title('Collections'),
      services,
      orderable('program', 'Programs', ThLargeIcon),
      S.documentTypeListItem('post')
        .title('Blog posts')
        .child(S.documentTypeList('post').title('Blog posts').defaultOrdering([{field: 'date', direction: 'desc'}])),
      orderable('faq', 'FAQ', HelpCircleIcon),
      S.divider().title('Settings'),
      S.listItem().singleton('generalSettings'),
      S.listItem().singleton('contactSettings'),
      S.listItem().singleton('bookingSettings'),
    ])
}
