import type {DocumentDefinition} from 'sanity'
import {aboutPage, credential} from './about'
import {result, selfAssessment, statement} from './assessment'
import {faq} from './faq'
import {homePage} from './home'
import {galleryPhoto, processStep, stat, testimonial} from './homeItems'
import {post} from './journal'
import {headlineText, inlineText, postBody} from './richText'
import {program, service} from './services'
import {bookingSettings, contactSettings, generalSettings} from './site'

// One document each; the document id is the type name. The title is the sidebar's name for it;
// the sidebar icon falls back to the schema type's.
const singleton = (type: DocumentDefinition, title: string) => ({documentId: type.name, schemaType: type.name, title})

export const SINGLETONS = [
  singleton(homePage, 'Home'),
  singleton(aboutPage, 'About'),
  singleton(selfAssessment, 'Self-assessment'),
  singleton(generalSettings, 'General'),
  singleton(contactSettings, 'Contact'),
  singleton(bookingSettings, 'Booking'),
]

export const schemaTypes = [
  inlineText,
  headlineText,
  postBody,
  stat,
  processStep,
  galleryPhoto,
  testimonial,
  credential,
  statement,
  result,
  homePage,
  aboutPage,
  selfAssessment,
  service,
  program,
  post,
  faq,
  generalSettings,
  contactSettings,
  bookingSettings,
]
