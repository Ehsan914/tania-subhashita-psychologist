// The Bookings page as plain props → markup, so it renders the same with live or sample data.
// Phone first: one column, actions under the thumb, every button at least 44px tall.
import {CalendarIcon} from '@sanity/icons/Calendar'
import {CheckmarkIcon} from '@sanity/icons/Checkmark'
import {ClockIcon} from '@sanity/icons/Clock'
import {CloseIcon} from '@sanity/icons/Close'
import {CommentIcon} from '@sanity/icons/Comment'
import {RefreshIcon} from '@sanity/icons/Refresh'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'
import {Code} from '@sanity/ui/code'
import {Avatar, Box, Button, Card, Container, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import type {CSSProperties, ReactNode} from 'react'
import type {ApiError, Booking, BookingsResponse, NextStatus} from './api'
import {formatDay, groupBookings, initials, whatsappLink} from './sort'

const TAP: CSSProperties = {minHeight: 44}

export interface Busy {
  id: string
  status: NextStatus
}

export interface BookingsViewProps {
  firstName?: string
  userId?: string
  data?: BookingsResponse
  error?: ApiError
  loading: boolean
  busy?: Busy
  onRefresh: () => void
  onSetStatus: (booking: Booking, status: NextStatus) => void
}

const greeting = (hour: number) => (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')

function statusLine(waiting: number): string {
  if (waiting === 0) return 'Nobody is waiting on a reply. Everything is up to date.'
  return `${waiting} ${waiting === 1 ? 'person is' : 'people are'} waiting to hear back about a session.`
}

export function BookingsView(props: BookingsViewProps) {
  const {firstName, data, error, loading, onRefresh} = props
  const groups = data && groupBookings(data.bookings, data.today)
  return (
    <Card height="fill" overflow="auto" tone="transparent">
      {/* padding on a Box: Container is width 100%, so padding on it would overflow a phone */}
      <Box paddingX={[3, 4]} paddingY={[4, 5]}>
        <Container width={2}>
          <Stack gap={[4, 5]}>
            <Flex align="flex-start" justify="space-between" gap={3}>
              <Stack gap={3}>
                <Heading as="h1" size={[2, 3]}>
                  {greeting(new Date().getHours())}
                  {firstName ? `, ${firstName}` : ''}.
                </Heading>
                <Text muted size={[1, 2]}>
                  {groups ? statusLine(groups.waiting.length) : 'Booking requests from the website, from the bookings Sheet.'}
                </Text>
              </Stack>
              <Button icon={RefreshIcon} mode="ghost" text="Refresh" onClick={onRefresh} loading={loading} style={TAP} />
            </Flex>

            {error && <ErrorNotice error={error} userId={props.userId} onRetry={onRefresh} />}

            {groups && data && (
              <>
                <Grid gridTemplateColumns={3} gap={[2, 3]}>
                  <Kpi icon={<ClockIcon />} label="Waiting" value={groups.waiting.length} note="New requests" hot={groups.waiting.length > 0} />
                  <Kpi icon={<CalendarIcon />} label="Today" value={groups.today.length} note={groups.today[0] ? `Next ${groups.today[0].time}` : 'A free day'} />
                  <Kpi icon={<CheckmarkIcon />} label="Next 7 days" value={groups.nextWeek} note="Confirmed" />
                </Grid>

                <Section id="waiting" title="Waiting for a reply" hint="Message them on WhatsApp, then confirm or decline here." empty="All caught up. New requests from the booking form appear here.">
                  {groups.waiting.map((b) => <BookingCard key={b.id} booking={b} busy={props.busy} onSetStatus={props.onSetStatus} />)}
                </Section>

                {groups.unmarked.length > 0 && (
                  <Section id="unmarked" title="Still to mark" hint="Sessions on earlier days: did they happen?">
                    {groups.unmarked.map((b) => <BookingCard key={b.id} booking={b} busy={props.busy} onSetStatus={props.onSetStatus} />)}
                  </Section>
                )}

                <Section id="today" title="Today" hint={formatDay(data.today)} empty="No sessions confirmed for today.">
                  {groups.today.map((b) => <BookingCard key={b.id} booking={b} busy={props.busy} onSetStatus={props.onSetStatus} />)}
                </Section>

                <Section id="upcoming" title="Coming up" hint="Confirmed sessions after today." empty="Nothing confirmed yet.">
                  {groups.upcoming.map((b) => <BookingCard key={b.id} booking={b} busy={props.busy} onSetStatus={props.onSetStatus} />)}
                </Section>
              </>
            )}

            {!data && !error && loading && (
              <Flex justify="center" padding={6}>
                <Spinner muted />
              </Flex>
            )}
          </Stack>
        </Container>
      </Box>
    </Card>
  )
}

function Kpi({icon, label, value, note, hot}: {icon: ReactNode; label: string; value: number; note: string; hot?: boolean}) {
  return (
    <Card padding={[3, 4]} radius={3} border tone={hot ? 'primary' : 'default'}>
      <Stack gap={3}>
        <Flex align="center" gap={1}>
          <Text size={1} muted>{icon}</Text>
          <Text size={1} muted textOverflow="ellipsis">{label}</Text>
        </Flex>
        <Text size={[3, 4]} weight="semibold">{value}</Text>
        <Text size={0} muted textOverflow="ellipsis">{note}</Text>
      </Stack>
    </Card>
  )
}

function Section({id, title, hint, empty, children}: {id: string; title: string; hint: string; empty?: string; children: ReactNode[]}) {
  return (
    <Stack as="section" gap={3} aria-labelledby={`bookings-${id}`}>
      <Stack gap={2}>
        <Heading as="h2" size={1} id={`bookings-${id}`}>
          {title}
        </Heading>
        <Text size={1} muted>{hint}</Text>
      </Stack>
      {children.length > 0 ? (
        <Stack gap={3}>{children}</Stack>
      ) : (
        <Card padding={4} radius={3} border tone="transparent">
          <Text size={1} muted>{empty}</Text>
        </Card>
      )}
    </Stack>
  )
}

const ACTIONS: Record<string, {status: NextStatus; text: string; tone: 'positive' | 'critical' | 'caution'; primary: boolean}[]> = {
  New: [
    {status: 'Declined', text: 'Decline', tone: 'critical', primary: false},
    {status: 'Confirmed', text: 'Confirm', tone: 'positive', primary: true},
  ],
  Confirmed: [
    {status: 'No-show', text: 'No-show', tone: 'caution', primary: false},
    {status: 'Attended', text: 'Attended', tone: 'positive', primary: true},
  ],
}

function BookingCard({booking: b, busy, onSetStatus}: {booking: Booking} & Pick<BookingsViewProps, 'busy' | 'onSetStatus'>) {
  const chat = whatsappLink(b.phone)
  const actions = ACTIONS[b.status] ?? []
  const details = [b.concern, b.date && `${formatDay(b.date)}, ${b.time}`, b.format].filter(Boolean).join(' · ')
  return (
    <Card padding={[3, 4]} radius={3} border>
      <Stack gap={4}>
        <Flex gap={3} align="flex-start">
          <Avatar initials={initials(b.name)} size={1} color="magenta" />
          <Stack gap={2} flex={1} style={{minWidth: 0}}>
            <Text weight="semibold" textOverflow="ellipsis">{b.name || 'No name given'}</Text>
            <Text size={1} muted>{details}</Text>
            {b.session && <Text size={1} muted>{b.session}</Text>}
            {b.message && <Text size={1}>“{b.message}”</Text>}
            {b.notes && <Text size={1} muted>Notes: {b.notes}</Text>}
          </Stack>
        </Flex>
        {chat && (
          <Button as="a" href={chat} target="_blank" rel="noopener noreferrer" icon={CommentIcon} mode="ghost" text="WhatsApp" aria-label={`Message ${b.name} on WhatsApp`} style={TAP} />
        )}
        {/* the status buttons last, under the thumb */}
        <Grid gridTemplateColumns={2} gap={2}>
          {actions.map((a) => (
            <Button
              key={a.status}
              icon={a.primary ? CheckmarkIcon : CloseIcon}
              text={a.text}
              tone={a.tone}
              mode={a.primary ? 'default' : 'ghost'}
              disabled={Boolean(busy)}
              loading={busy?.id === b.id && busy.status === a.status}
              onClick={() => onSetStatus(b, a.status)}
              style={TAP}
            />
          ))}
        </Grid>
      </Stack>
    </Card>
  )
}

function ErrorNotice({error, userId, onRetry}: {error: ApiError; userId?: string; onRetry: () => void}) {
  if (error.kind === 'not-connected') return <NotConnectedNotice />
  const denied = error.kind === 'denied'
  const retryable = error.kind === 'network' || error.kind === 'server'
  return (
    <Card padding={4} radius={3} border tone={denied || error.kind === 'config' ? 'caution' : 'critical'}>
      <Flex gap={3} align="flex-start">
        <Text size={2}>
          <WarningOutlineIcon />
        </Text>
        <Stack gap={3} flex={1}>
          <Text weight="semibold">{denied ? 'Your account isn’t allowed to see bookings.' : error.message}</Text>
          {denied && (
            <Text size={1} muted>
              Ask the site’s owner to add your Sanity user ID to the bookings allowlist
              {userId ? ':' : '.'}
            </Text>
          )}
          {denied && userId && <Code size={1}>{userId}</Code>}
          {retryable && (
            <Box>
              <Button icon={RefreshIcon} text="Try again" mode="ghost" onClick={onRetry} style={TAP} />
            </Box>
          )}
        </Stack>
      </Flex>
    </Card>
  )
}

// Not a fault: the site works and takes bookings by WhatsApp until the Sheet is wired up.
function NotConnectedNotice() {
  return (
    <Card padding={4} radius={3} border tone="primary">
      <Stack gap={3}>
        <Text weight="semibold">Not connected to Google Sheets yet</Text>
        <Text size={1} muted>
          Booking requests from the website will be listed here once the bookings Sheet is set up.
          Until then, clients still reach Tania through the WhatsApp button on the booking page.
        </Text>
      </Stack>
    </Card>
  )
}
