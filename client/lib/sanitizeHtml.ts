import DOMPurify from 'dompurify';

// Admin-edited copy may carry light formatting (<strong class="…">, <span>, links).
// Anything beyond that — scripts, event handlers, javascript: URLs — is stripped.
const ALLOWED_TAGS = ['strong', 'b', 'em', 'i', 'u', 'span', 'br', 'a'];
const ALLOWED_ATTR = ['class', 'href'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
