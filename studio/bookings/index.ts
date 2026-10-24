import {CalendarIcon} from '@sanity/icons/Calendar'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import type {Tool} from 'sanity'
import {route} from 'sanity/router'
import {APPOINTMENTS, AppointmentsTool, DASHBOARD, DashboardTool} from './tools'

// Booking requests from the website, read from and written to the private Google Sheet
// through the site's /api/bookings function (docs/booking-plan.md). Nothing here is stored in Sanity.
export const dashboardTool: Tool = {
  name: DASHBOARD,
  title: 'Dashboard',
  icon: DashboardIcon,
  component: DashboardTool,
}

export const appointmentsTool: Tool = {
  name: APPOINTMENTS,
  title: 'Appointments',
  icon: CalendarIcon,
  component: AppointmentsTool,
  // /appointments/BK-20261024-7F3A opens that booking's panel
  router: route.create('/', [route.create('/:id')]),
}
