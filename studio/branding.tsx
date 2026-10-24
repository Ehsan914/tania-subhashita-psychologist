import {buildLegacyTheme, type LayoutProps} from 'sanity'
import {createGlobalStyle} from 'styled-components'

// The practice's mark in mauve ("Tanu Logo/SVG/tania-logo-icon-pinkAsset 6.svg", copied to
// static/favicon.svg, which Sanity also serves as the favicon), shown as the workspace icon.
export function BrandIcon() {
  return <img src="/static/favicon.svg" alt="" width="100%" height="100%" />
}

// The site's accent, mauve --accent (client/styles/site.css), as the primary and focus colour.
// Dark mode puts dark text on the button, which needs a lighter step of the mauve to reach 4.5:1
// (ratios in docs/sanity-migration-plan.md), so each scheme comes from its own build.
const accentTheme = (accent: string) => buildLegacyTheme({'--brand-primary': accent, '--focus-color': accent})
const light = accentTheme('#A84B65')
const dark = accentTheme('#C46A84')

export const theme = {...light, color: light.color && dark.color && {light: light.color.light, dark: dark.color.dark}}

// Thinnest scrollbars on every scrolling area. Chromium reads the ::-webkit-scrollbar rules;
// `scrollbar-width` is for Firefox only, because in Chromium 121+ it overrides them.
const Scrollbars = createGlobalStyle`
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.45); border-radius: 4px; }
  ::-webkit-scrollbar-button { display: none; }
  @supports not selector(::-webkit-scrollbar) {
    * { scrollbar-width: thin; }
  }
`

export function StudioLayout(props: LayoutProps) {
  return (
    <>
      <Scrollbars />
      {props.renderDefault(props)}
    </>
  )
}
