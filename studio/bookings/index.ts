import {CalendarIcon} from '@sanity/icons/Calendar'
import type {Tool} from 'sanity'
import {BookingsTool} from './BookingsTool'

// Booking requests from the website, read from and written to the private Google Sheet
// through the site's /api/bookings function (docs/booking-plan.md). Nothing here is stored in Sanity.
export const bookingsTool: Tool = {
  name: 'bookings',
  title: 'Bookings',
  icon: CalendarIcon,
  component: BookingsTool,
}
