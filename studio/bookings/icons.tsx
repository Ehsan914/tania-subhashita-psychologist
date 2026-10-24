// The admin design's stroke icons (design-demo/calm-elegant/admin/assets/admin.js), 24px grid.
// Styled by `.ts-admin svg.i` in admin.css.
const PATHS = {
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  chat: '<path d="M4 20l1.5-4A8 8 0 1 1 9 19.5L4 20z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.7-4.3L4 9M4 4v5h5M4 13a8 8 0 0 0 14.7 4.3L20 15M20 20v-5h-5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  sort: '<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
} as const

export type IconName = keyof typeof PATHS

// The paths are fixed strings from this file, never data, so setting them as markup is safe.
export function Icon({name}: {name: IconName}) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{__html: PATHS[name]}} />
}
