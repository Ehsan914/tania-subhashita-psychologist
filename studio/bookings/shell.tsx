// What both tools share: the scoped root that carries the design's styles and font, and the
// notice shown when the bookings can't be read.
import {useEffect, useState, type ReactNode} from 'react'
import type {ApiError} from './api'
import {Icon} from './icons'
import './admin.css'

// The design's text face; loaded once, the first time either tool opens.
const FONT_ID = 'ts-admin-font'
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap'
// The charts animate in once; after that a refresh or status change updates them in place.
const SETTLE_MS = 1600

function useDesignFont() {
  useEffect(() => {
    if (document.getElementById(FONT_ID)) return
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href = FONT_URL
    document.head.append(link)
  }, [])
}

export function AdminRoot({children}: {children: ReactNode}) {
  useDesignFont()
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), SETTLE_MS)
    return () => clearTimeout(timer)
  }, [])
  return <div className={`ts-admin${settled ? ' settled' : ''}`}>{children}</div>
}

/** Why the bookings aren't shown, in a calm line above the page. Not connected is not a fault. */
export function Notice({error, userId, onRetry}: {error: ApiError; userId?: string; onRetry: () => void}) {
  if (error.kind === 'not-connected') {
    return (
      <div className="callout" role="status">
        <Icon name="help" />
        <div>
          <strong>Not connected to Google Sheets yet</strong>
          <p>
            Booking requests from the website will appear here once the bookings Sheet is set up. Until then,
            clients still reach you through the WhatsApp button on the booking page.
          </p>
        </div>
      </div>
    )
  }
  const denied = error.kind === 'denied'
  const retryable = error.kind === 'network' || error.kind === 'server'
  return (
    <div className={`callout${denied || error.kind === 'config' ? '' : ' err'}`} role="alert">
      <Icon name={denied ? 'help' : 'x'} />
      <div>
        <strong>{denied ? 'Your account isn’t allowed to see bookings.' : error.message}</strong>
        {denied && (
          <p>
            Ask the site’s owner to add your Sanity user ID to the bookings allowlist{userId ? <>: <code>{userId}</code></> : '.'}
          </p>
        )}
        {retryable && (
          <button className="btn ghost sm" type="button" onClick={onRetry}>
            <Icon name="refresh" />
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
