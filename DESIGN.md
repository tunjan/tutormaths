# Design System
Reference basis: a scheduling/booking product's public marketing site and its logged-in web application (referred to throughout as **the reference marketing site** and **the reference application**)
Generated: 2026-07-26
## 1. Purpose and scope
This document governs the visual and interaction language for building new pages and components in this repository (Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Base UI primitives) so that they read as part of the same product family as the reference application — a scheduling/booking application with a dashboard, forms, tables, and a public booking flow.
**Product context.** The target application is a scheduling tool: a logged-in dashboard (event types, bookings, availability, settings) plus a public-facing booking flow. This maps closely to the reference application's own product, which makes it an unusually direct reference rather than a loose stylistic inspiration.
**Reference website.** Two distinct surfaces were inspected, and they are **not** the same codebase:
- **The reference marketing site** — built on **Framer** (confirmed via `framer-*` class names and computed styles on live DOM), not the open-source Next.js app. Its visual language (large serif-free display type, generous whitespace, dark CTAs) is worth noting for marketing-page composition, but its markup/component patterns are not portable to a React/Tailwind codebase and were not used as a source of component rules.
- **The reference application** (product application) — the real, open-source Next.js/React/Tailwind/tRPC application (a community, MIT-licensed edition of the same codebase that powers the hosted product). This is the primary source for every component rule, token, and composition pattern in this document.
**What was inspected.**
- Live, authenticated browsing of the reference application: Links (event types list), event type editor (Setup tab with live booking preview), Bookings (list + empty state), Availability (list + dropdown menu), Teams/Insights (paywall/upsell card pattern), Workflows (empty state + template gallery), Settings → Profile (form, danger zone, destructive dialog), Settings → Appearance (radio-card selector), the command palette (⌘K-style search overlay), and the public booking page (`<domain>/<user>/<event>` — the "Booker").
- Live browsing of the reference marketing homepage (hero, trust bar) for high-level composition only.
- Direct inspection of the open-source repository (`main` branch) for ground-truth values: `packages/config/theme/tokens.css` (the full light/dark CSS custom-property set), `packages/ui/styles/shared-globals.css` (font-face declarations), `packages/coss-ui/src/styles/globals.css` (the newer shadcn-shaped token layer the reference application is migrating toward), and component source for `Button`, `Badge` (`packages/ui/components/**`), including their `class-variance-authority` variant definitions.
- Computed-style extraction (`getComputedStyle`) on live rendered elements for font sizes/weights, spacing, radii, shadows, and color, cross-checked against the source CSS custom properties above.
**What was excluded.** Enterprise/team-only screens that required a paid plan (their content areas render as an upsell card, so no team table, org chart, or advanced routing UI was inspected). Mobile/narrow-viewport rendering could not be directly verified in this session (the automated viewport resize did not visibly reflow the captured screenshots), so responsive behavior below is stated explicitly as **inferred from standard Tailwind breakpoint conventions and the app's own `sm:`/`md:`/`lg:` utility usage visible in class names**, not from a verified narrow screenshot, and is flagged as such.
**Access/evidence limitations.** The marketing site's Framer origin means its exact CSS cannot be treated as "the design system" — it is a separate brand execution. Where this document states a value as "verified," it was read directly from `tokens.css`/`globals.css` source or from `getComputedStyle` on the live app. Where a value is a normalization or recommendation (e.g., collapsing several near-duplicate radii into a scale), that is called out explicitly.
## 2. Design direction
**Principles**
1. **Near-neutral, near-black interface — color is reserved for meaning.** The entire chrome (backgrounds, borders, primary buttons, text) is built from white/gray/near-black. Verified: the primary button fill is `hsla(221, 39%, 11%, 1)` (`#111827`, i.e., functionally black, not brand-blue), and the entire neutral scale (`--surface-*`, `--content-*`, `--line-*`) is desaturated gray. Color (blue/green/orange/red) appears **only** for semantic state — info, success, warning/attention, error — and for a handful of data-visualization accents. Rule: never introduce a saturated "brand color" fill for default UI chrome; reserve saturation for status.
2. **Density with breathing room, not compactness.** Controls are small (28–32px inputs/buttons, 14px body text) and text is small (12–14px throughout the dashboard), but padding around cards and between sections is generous (16–24px). The result reads dense in information terms but not cramped visually. Rule: shrink the control, not the surrounding whitespace.
3. **Shadows, not scale, communicate interaction state.** Buttons barely change size or color on hover/press; instead a layered `box-shadow` (inset highlight + outer contact shadow) shifts between rest/hover/active/focus. This is a distinctive, verifiable pattern (see `--shadow-button-solid-brand-*`, `--shadow-outline-gray-*` in `tokens.css`). Rule: prefer shadow/opacity transitions over transform/scale for control feedback.
5. **One consistent 3-tier radius language.** Small chips/menu items use a tight radius (~4–6px), interactive controls (buttons, inputs, small cards) use a mid radius fixed at **10px**, and panels/dialogs/large cards use a large radius (**16px**). This is a deliberate, repeated pattern across unrelated components (Button, Input, dropdown, dialog, event-type card all match), not incidental drift.
6. **Structure over decoration.** No gradients, no illustration-heavy empty states, no heavy iconography. Empty states are a bordered icon tile + bold headline + one muted sentence + a single primary action. Data forms use plain labeled fields with a live preview panel rather than wizards or heavy visual explanation.
**Emotional qualities:** calm, precise, "operator tool" — closer to a code editor or admin console than a consumer app. Confident but quiet; nothing shouts except semantic color (red for destructive, orange/amber for paywalled features).
**Information-density strategy:** dashboard list/detail pages default to a two- or three-column layout (primary nav → content list/form → optional live preview) so a lot of state is visible without scrolling, but each column keeps a single clear content type (never mixing a table and a form in one column).
**Hierarchy strategy:** hierarchy is carried by weight and size, not color. Page titles use the heading typeface at 20px/600 with a distinct line-height (28px, looser than the type size — visibly "roomier" than body text). Section/card titles are 14px/600 in the *body* typeface (not the display face) — the reference application intentionally reserves the display face for page-level titles only, not every heading level. **Important accessibility note (verified):** semantic heading level and visual size are decoupled — a card title can legitimately be an `<h2>` styled at 14px while the page title is an `<h3>` at 20px. Follow the semantic document outline, not the visual size, when choosing heading tags.
**What makes the design recognizable:** the "Booker" component (the public scheduling widget — a white, `16px`-radius card floating on a light-gray page, split into avatar/event-info, month calendar grid with a solid black selected-day tile, and a scrollable list of pill-shaped time slots with a small green "available" dot) is the single most recognizable piece of the product and should be treated as a signature composition, not a generic calendar picker.
**Patterns to deliberately not copy:**
- Do not copy the marketing site's large Framer-driven type scale (64px hero headings, Framer-specific spacing) into the application shell — that belongs to the separate marketing brand execution, not the product UI.
- Do not introduce the legacy duplicate "darkgray-*" color scale still present in the codebase for backward compatibility (`--color-darkgray-50…950`) — it is a deprecated alias of the standard gray scale kept only for migration purposes.
- Do not treat the richer "visualization" token set (7 hue pairs for charts) as general-purpose UI color — it is scoped to Insights/analytics charts only.
## 3. Foundations
### Color
Two token layers coexist in the real codebase and are both worth carrying into this repository:
- **Core layer** — shadcn-standard roles (`background`, `foreground`, `card`, `primary`, `border`, etc.), for compatibility with shadcn/ui and Base UI components.
- **Extension layer** — the reference application's own richer `subtle`/`default`/`emphasis` steps per surface and per text role, which the real Button/Badge/Alert components bind to directly. Use the core layer for generic shadcn primitives and the extension layer whenever a component needs a third state between "default" and "emphasis" (very common in this design language — see Button's `secondary`/`minimal` variants).
All values below are **verified** from `packages/config/theme/tokens.css` unless marked "recommended."
| Role | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` (`--surface`) | `#0F0F0F` (`--surface`) |
| Foreground (default text) | `#3C3E44` (`--content`) | `#D4D4D4` (`--content`) |
| Foreground (emphasis / headings) | `#070A0D` (`--content-emphasis`) | `#FAFAFA` (`--content-emphasis`) |
| Surface (muted app canvas, behind cards) | `#F6F7F9` (`--surface-muted`) | `#171717` (`--surface-muted`) |
| Elevated surface (card, dialog, popover) | `#FFFFFF` (`--surface`) | `#0F0F0F`, dialogs slightly lighter via `color-mix` | 
| Muted surface (subtle fills: hover rows, chip bg) | `#EEEFF2` (`--surface-subtle`) | `#262626` (`--surface-subtle`) |
| Emphasis surface (pressed/strong fills, active nav item hover) | `#E5E7EB` (`--surface-emphasis`) | `#404040` (`--surface-emphasis`) |
| Primary (button/brand fill) | `#111827` (`--brand`) | `#FFFFFF` (`--brand`) |
| Primary hover | `#0F0F0F` (`--brand-emphasis`) | `#9CA3B0` (`--brand-emphasis`) |
| Secondary (bordered button fill) | `#FFFFFF` on `1px` border `#D1D5DB` | `--surface` on `--line` |
| Accent / active nav & tab fill | `rgba(0,0,0,.04)` (black-alpha, not a flat color — verified via computed style `oklab(... / 0.04)` on the active "Links" sidebar item) | `rgba(255,255,255,.04)` equivalent |
| Destructive | Text/icon `#752522`→ on hover a solid `#DC2626`-family red button (`bg-red-*` Tailwind reds used directly, not a semantic token) | same family, adjusted for dark |
| Success | bg `#E4FBED`, text `#285231` (`--surface-success` / `--content-success`) | bg `#133D1F`-family (`hsla(133,34%,24%)`), text `hsla(134,76%,94%)` |
| Warning / Attention | bg `#FFEDD6`, text `#74331B` (`--surface-warning` / `--content-warning`) | bg `hsla(16,62%,28%)`, text `hsla(37,86%,92%)` |
| Information | bg `#DDE7FD`, text `#243C84` (`--surface-info` / `--content-info`) | bg `hsla(228,56%,33%)`, text `hsla(218,83%,93%)` |
| Border (default) | `#D1D5DB` (`--line`) | `#4C4C4C` (`--line`) |
| Border (subtle / dividers) | `#E5E7EB` (`--line-subtle`) | `#262626` (`--line-subtle`) |
| Input border | same as Border, at low alpha in the newer layer: `rgba(0,0,0,.08)` (verified via computed style on the Title input) | `rgba(255,255,255,.08)` equivalent |
| Ring (focus) | buttons use a **shadow-based** focus ring, not an outline ring (`--shadow-button-solid-brand-focused`, a 2-layer white+black ring drawn as box-shadow); form inputs fall back to `--default-ring-color: rgb(59 130 246 / 0.5)` | same |
| Muted text (secondary/tertiary copy) | `#6B7280` (`--content-subtle`), placeholder/disabled `#9CA3B0` (`--content-muted`) | `#A3A3A3` for both subtle and muted |
**Richer semantic pairs** (used in Insights/analytics surfaces; keep as an extension namespace, not the default Alert/Badge colors above): info/success/attention/error each have a `subtle` bg and a saturated `emphasis` bg, e.g. success-subtle `#E4F7F3` / success-emphasis `#19A974`. Full values are in the token appendix (§10).
**Accessibility adjustment:** the verified `--content-muted` on `--surface` pairing (`#9CA3B0` on `#FFFFFF`) is ≈2.8:1 — **below WCAG AA for normal text.** Reserve this pairing for placeholder text, disabled controls, and icon-only decorative use; never use it for body copy or anything conveying required information. Use `--content-subtle` (`#6B7280` on white ≈ 4.6:1, AA-compliant) as the floor for any readable secondary text.
### Typography
**Font stacks (verified via `@font-face` in `packages/ui/styles/shared-globals.css`):**
- Heading/display (`--font-display` / `--font-heading`): a proprietary, open-source geometric display face unique to the reference application (MIT-licensed, self-hosted `.ttf`). If not bundled in this repository, substitute a geometric-humanist sans with similar proportions — **Inter Tight** or **General Sans** are close practical substitutes — rather than leaving heading type identical to body type.
- Body/UI (`--font-sans`): **"Inter var"** (variable font, weight range 100–900), loaded as a self-hosted `.woff2`. Substitute with `next/font/google` Inter if self-hosting is not desired; visually indistinguishable at UI sizes.
- Monospace: not directly observed in the app shell; use the standard system stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`) as confirmed in `packages/coss-ui`'s token file.
**Scale (verified via computed style on live pages):**
| Role | Size | Weight | Line-height | Face |
|---|---|---|---|---|
| Page title (e.g. "Links") | 20px | 600 | 28px | Heading |
| App logo / nav wordmark | 18px | 600 | 18px | Heading |
| Card / section title | 14px | 600 | 20px | Body |
| Body / default UI text | 14px | 400 | ~20px | Body |
| Form label | 14px | 500 | default | Body |
| Small / helper / meta text | 12px | 400 | default | Body |
| Badge text | 10–14px depending on size variant | 500 | 1 (leading-none) | Body |
Marketing-site display type (64px/600, in the display face) is **not** part of the app scale — it belongs to the Framer-built marketing brand execution (§1) and should only be used if this repository ever builds a standalone marketing page, not inside the authenticated app shell.
**Letter-spacing:** normal throughout (no tracked-out caps observed except section-group labels in the settings sidebar, which are uppercase small-caps-style labels — verify per component, do not assume tracking).
**Recommended max text width:** body copy / descriptions inside cards and dialogs should wrap at **60–75 characters** (≈ `max-w-md`–`max-w-lg` in Tailwind, 28–40rem) — observed dialog copy ("Anyone who's shared your account link…") wraps at a dialog width of `768px` with generous internal padding, keeping measure comfortable.
**Responsive typography:** the dashboard does not noticeably scale type by breakpoint (14px body stays 14px from mobile to desktop) — density is handled by layout reflow (columns stacking), not by shrinking type. Marketing/public pages (Booker, marketing site) do scale display type down on narrow viewports; treat this as a marketing-only pattern.
### Spacing and sizing
**Base unit:** 4px (Tailwind default `spacing` scale — every verified padding/gap value observed is a multiple of 4: 8, 11(~12), 16, 20, 24px).
**Recommended token scale** (Tailwind default, confirmed compatible with all observed values):
`0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px), 16(64px)`
**Verified control heights:**
- Small input / search box: `30px`
- Button (`base` size, the default): `32px` total via `py-2` + line-height, horizontal padding `11px` (i.e. `px-2.5`-ish, effectively **`0 11px`**)
- Button `xs`: `24px`, `sm`: `28px`, `lg`: unbounded (padding-driven, `12px/10px`)
- Icon button (`variant=icon`, `size=base`): `36×36px` minimum tap target
- Icon button `xs`: `20×20px` — **below the 24px minimum touch target; reserve `xs` icon buttons for dense desktop-only toolbars, never for primary mobile actions.**
**Page gutters:** content area begins with roughly **32px** left inset from the sidebar edge (verified header `x≈32` after the sidebar) and a matching right margin; card padding internally is **24px** (`p-6`) for standard content cards, **16px** (`p-4`) for compact list rows.
**Component padding:** form inputs `0 11px` horizontal; buttons `0 11px`–`12px` horizontal depending on size; dropdown menu items `4px 8px`; badges `4px 6px` (`sm`) up to `4px 6px` with larger text (`lg`).
**Icon sizes:** `16px` (`h-4 w-4`) is the dominant icon size inside buttons and inline text; `12px` for badge start-icons; `20–24px` for empty-state/illustrative icons inside a bordered tile.
**Touch-target minimum (recommendation for this repo):** enforce a **24×24px** CSS minimum (WCAG 2.2 AA) on every interactive element regardless of visual icon size, by padding hit areas — the reference application's own `xs` icon button (20px) technically falls under this and should be treated as a normalization opportunity, not a pattern to replicate on touch surfaces.
### Shape and depth
**Border widths:** `1px` default for cards, inputs, dropdown menus, dialogs. No `0px`/borderless cards observed for content containers — even white-on-white cards keep a `1px` `rgba(0,0,0,.08)` hairline.
**Radius scale — verified, normalize to three tiers:**
- **Tight (4–6px):** badges (`rounded-[4px]`), dropdown/menu items (`rounded-md`, 6px), skeleton chips.
- **Control (10px, fixed):** buttons, inputs, chips/tags, the "New" button, dropdown menu panel itself, search box. This value is hardcoded (`rounded-[10px]`) in the real `Button` component rather than drawn from the `--radius-*` scale — treat it as a first-class token (`--radius-control: 10px`) in this repo rather than approximating with the nearest scale step.
- **Panel (16px):** dialogs/modals, standalone content cards (event-type list card, availability card).
- Full scale for reference (`packages/config/theme/tokens.css`, `:root`): `--radius-sm 2px`, `--radius(base) 4px`, `--radius-md 6px`, `--radius-lg 8px`, `--radius-xl 12px`, `--radius-2xl 16px`, `--radius-3xl 24px`, `--radius-full 9999px` (pills, avatars, dot indicators).
**Shadow / elevation scale (verified, all multi-layer):**
- `--shadow-elevation-low` — generic low card elevation.
- `--shadow-dropdown` — dropdown/menu/popover elevation (soft, two-layer, no hard edge).
- `--shadow-outline-gray-{rested,hover,active,focused}` — the *secondary/minimal* button's state machine, communicated almost entirely through this shadow stack rather than color change.
- `--shadow-button-solid-brand-{default,hover,active,focused}` — the *primary* button's state machine (inset highlight + outer contact shadow + focus ring drawn as shadow).
- `--shadow-outline-red-{rested,hover,active}` / `--shadow-button-outline-red-focused` — destructive button state machine.
- `--shadow-switch-thumb` — the toggle-switch knob's resting elevation.
Use this as the elevation model: **static elevation** (card floating on page) uses `elevation-low`/`dropdown`; **interactive elevation** (button state) uses the per-color state-shadow stacks, not opacity or scale changes.
**Divider rule:** dividers are `1px solid` using the `border-subtle`/`border-muted` step (never the darker default `border` token, which is reserved for container edges, not internal dividers).
**Focus-ring treatment:** default browser `outline` is suppressed (`focus-visible:outline-none`) and replaced with a layered `box-shadow` ring — typically a `1px` light ring plus a `2px` dark ring, giving a crisp ring that works on both light and dark backgrounds without relying on `outline-color` contrast alone. Always pair with `focus-visible:` (never bare `:focus`) so mouse users don't see a ring on click.
### Motion
**Durations (verified):** `100ms` (primary button shadow/transform), `150ms` (drawer/sheet slide), `200ms` (secondary/minimal/destructive button shadow transitions), `600ms` (content fade-in-up on page load, e.g. booking confirmation).
**Easing (verified):** `cubic-bezier(.21, 1.02, .73, 1)` for the fade-in-up entrance (a gentle overshoot-then-settle curve), `ease-in` for the drawer's fade-out on close, linear for the loading spinner.
**Enter/exit behavior:** drawers/sheets slide in from the right and fade (150ms), dialogs fade+scale in (Base UI/Radix-style default), toasts and page-load content use the `fade-in-up` keyframe (translateY(10px)→0, opacity 0→1).
**Hover/press feedback:** buttons do **not** scale or move on hover; feedback is (a) a background-color shift by one surface step, and (b) a `box-shadow` change. On active/press, most buttons also apply a `translate-y-[0.5px]` micro-nudge to the icon/label content (a very subtle "press" cue), verified in `Button.tsx` (`group-[:not(div):active]:translate-y-[0.5px]`).
**Loading transitions:** a `spinning` keyframe (`360deg`, `0.75s linear infinite`) drives a centered SVG spinner that replaces button content (content becomes `invisible`, not removed, to prevent layout shift) while `loading` is true; the button itself gets `cursor-wait` and a reduced-opacity treatment per color variant.
**Reduced motion:** not explicitly observed as a `prefers-reduced-motion` branch in the inspected CSS. **Recommendation for this repo:** wrap the `fade-in-up`/`drawer-slide` keyframes in `@media (prefers-reduced-motion: no-preference)` and fall back to an instant opacity swap otherwise — the reference application's own motion is subtle enough that this is a safe, low-risk addition rather than a deviation from the source design language.
## 4. Layout and responsive behavior
**Container widths:** the dashboard has no single centered "container" — content spans the full space right of the sidebar, with a fixed **32px** gutter on the left/right of the content column and cards/forms internally capping around **~700–900px** for readability (the event-type Setup form column, for example, sits well short of the full available width even on a wide screen, leaving the booking-preview panel to fill the remainder).
**Breakpoints:** not independently re-verified via live resize in this session (see §1 limitation). Use standard Tailwind breakpoints as the working scale, consistent with class-name evidence (`md:`, `lg:` prefixes) seen in component source (`Button`'s `fab` variant: `md:min-w-min md:rounded-[10px]`):
`sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px` — plus two custom large steps present in the `coss-ui` token layer for very wide dashboards: `3xl 1600px`, `4xl 2000px`.
**Grid behavior:** list pages (event types, availability) are a single-column stack of full-width cards, not a CSS grid — each "row" is its own bordered card. Form pages use a fixed two-thirds/one-third split: form fields in the wider column, a sticky live-preview panel in the narrower column. Settings pages are a single centered form column (no side preview).
**Page gutters by breakpoint:** desktop gutter is 32px as stated; **recommendation** (not independently verified): reduce to 16px at `<640px` and let the secondary sidebar (tab navigation inside a settings/event-type page) collapse into a horizontal scroller or a `Sheet`/drawer, consistent with the app's own use of a slide-in drawer pattern (`--animate-drawer-slide-*`) elsewhere.
**Common page compositions observed:**
1. **List page** (Links, Availability, Workflows): page header (title + one-line description + primary action button, top-right) → single column of bordered `16px`-radius cards, each card a horizontal row (title/meta left, controls right).
2. **Detail/editor page** (event type Setup): back-arrow + title in a slim top bar → left secondary sidebar of grouped tabs (section labels are small caps, tabs below each) → scrollable form column → sticky live-preview column showing the actual public Booker in miniature.
3. **Settings page**: back-arrow → left sidebar grouped by section (account name, then uppercase group labels: Security, Billing, Developer, My teams) → single form column, each logical group its own card with a distinct **muted-background footer strip** containing the primary save action (this footer-strip-as-action-bar is a repeated, deliberate pattern — do not put the save button inline with form fields; separate it into its own footer band).
4. **Empty state:** centered icon tile (bordered, rounded, containing a `20–24px` icon) + bold 16–18px headline + one muted sentence + primary button, all centered inside the content card.
5. **Upsell/paywall card** (Insights, Teams on a plan without access): a wide card split ~55/45 into a left text column (small "kicker" badge, bold headline, muted description, a bulleted feature list using a small dot marker instead of a bullet glyph, a divider, then a primary "Try it for free →" button + a plain "Learn more" link) and a right illustrative panel (product screenshot/mock).
**Sidebar and navigation behavior:** primary navigation is a fixed-width (~252–260px) left sidebar: wordmark + search icon + avatar at top, flat list of top-level nav items (icon + label, 10px-radius active-state fill at 4% black alpha), nested items (e.g. Insights → Bookings/Routing/…) appear as an indented sub-list directly under the parent when expanded — not a flyout. Footer of the sidebar holds secondary/meta links (view public page, copy link, settings) and a version string, visually demoted (smaller, muted).
On detail/editor pages the **primary** sidebar collapses to a single "← Back" control and is replaced by a **secondary** tab sidebar scoped to that record — this swap (not a nested/stacked pair of sidebars) is the key navigation pattern to replicate.
**Sticky/fixed regions:** the live-preview column on the event-type editor stays fixed/visible while the form column scrolls independently (two independently-scrolling panes). The settings form footer (save button strip) is anchored to the bottom of its card, not to the viewport.
**Mobile transformations (recommended, not independently verified live):** collapse the primary sidebar into a top bar + slide-in `Sheet` (the codebase already ships a drawer slide animation for exactly this purpose); stack the editor's form/preview columns vertically with the preview below the form, collapsed by default behind a "Preview" toggle to avoid pushing the form far down the page; convert the settings two-pane layout into a single stacked list → detail push navigation.
## 5. Component specifications
For each component: purpose, anatomy, variants/sizes actually evidenced, visual/spacing rules, states, responsive notes, accessibility, and the shadcn/Base UI primitive to extend. Only variants seen in evidence (or a documented `class-variance-authority` source file) are listed — do not invent additional variants.
### Button
**Purpose:** primary interactive trigger for actions/navigation.
**Anatomy:** optional start icon, label, optional end icon, optional loading spinner overlay.
**Variants (verified, `cva`):** `primary` (solid near-black fill), `secondary` (white fill, bordered), `minimal` (transparent, border appears on hover), `destructive` (bordered, red text, red fill on hover/focus). Structural variants: `button` (default), `icon` (square, icon-only), `fab` (floating action button, becomes a circular icon-only button below `md`, expands to a labeled pill at `md+`).
**Sizes:** `xs` (24px), `sm` (28px), `base` (32px, default), `lg` (padding-driven, no fixed height).
**Visual rules:** radius fixed `10px`; label `14px/500`; icon `16px`, `stroke-width 1.5`; state communicated via background + layered shadow (§3 Shape and depth), not scale.
**Spacing rules:** horizontal padding `11–12px`; `4px` gap between icon and label (`gap-1`).
**Interaction states:** rest/hover/active/focus-visible/disabled/loading all have distinct, verified shadow+color treatments; `disabled` = `opacity-30` + `cursor-not-allowed`; `loading` = content set `invisible` (not removed) + centered spinner + `cursor-wait`.
**Responsive:** `fab` variant is the only one with a breakpoint-dependent shape change (icon-only circle on mobile → labeled pill on desktop).
**Accessibility:** always a real `<button>` or `<a>` (never a `<div>` with a click handler — verified in source, the component explicitly renders one or the other based on `href`); disabled state prevents the click handler from firing even if a stray click gets through; tooltip prop wraps the trigger in an accessible `Tooltip` when supplied.
**shadcn/Base UI mapping:** extend shadcn `Button` with a `cva` variant map matching the four colors above; do not use shadcn's default `outline`/`ghost`/`link` names — rename to `secondary`/`minimal` to match this product's vocabulary and avoid confusing contributors moving between the two systems.
**Do not use for:** navigation that should be a plain inline text link inside a paragraph (use `Link`, not `Button` with `variant="minimal"`).
### Icon Button
A structural variant of Button (`variant="icon"`), not a separate component. Square, sizes `20/24/36/40px` matching Button's `xs/sm/base/lg`. Always pair with a `tooltip` prop for accessible labeling when there is no visible text.
### Link
Inline text links use the default text color with an underline on hover (not always-on underline); no separate component beyond styled `<a>`/`next/link`. Use `Button` `variant="minimal"` only when the link must look and behave like a control (e.g., inside a toolbar), not for in-paragraph links.
### Input
**Purpose:** single-line text entry.
**Anatomy:** label above, optional helper/tip text below (small, muted, often with a leading info icon), the field itself, optional inline prefix text (verified: a static domain prefix, e.g. `app.example.com/`, baked into the Username field, styled as static muted text sharing the input's box).
**Visual rules:** height `30px` (compact — noticeably shorter than the 32px button, a deliberate visual pairing so inline button+input rows align on their vertical center rather than top edge); radius `10px`; border `1px` at low alpha (`rgba(0,0,0,.08)` light); `14px` text; background transparent/white.
**States:** rest, focus (ring, not just border-color change), disabled (muted bg + muted text), error (red border/ring — apply the `destructive`/error border + a red helper message below, not a color-only signal — see §8).
**shadcn/Base UI mapping:** shadcn `Input`, override default height/radius/border tokens to match the values above; Base UI's unstyled `Input` primitive if going headless.
### Textarea
Same visual language as Input; observed usage is a rich-text editor shell (toolbar row with a "Normal" block-type dropdown + bold/italic/link icon buttons, `1px` border separating toolbar from the editable area) rather than a plain `<textarea>` for anything user-facing-rich (event description, profile "About"). For genuinely plain multi-line text, use the same border/radius/padding as Input, just taller with `resize-y`.
### Select
Dropdown-style field matching Input's height/radius/border; opens a `Popover`/`Command`-style list (see Dropdown Menu below) rather than a native `<select>` skin. Used for single-choice structured data (e.g., "Default duration").
### Checkbox
Not directly captured via computed style in this session; follow the same 10px-family control radius scaled down (use `4–6px` for the checkbox box itself, consistent with the "tight" radius tier) and the same focus-ring treatment as Input/Button. Use shadcn `Checkbox` (Base UI `Checkbox` primitive) unmodified in radius/spacing terms, restyled only in color to the tokens in §3.
### Radio group
**Purpose:** mutually exclusive choice, especially where each option benefits from a visual preview (verified pattern: theme selection).
**Visual rule (verified):** each option is its own bordered "preview card" (a rectangle showing a miniature mock of the option, e.g. a light/dark UI thumbnail) with a small radio dot + label beneath; the **selected** card gets a full `2px`-equivalent dark ring around the whole card (not just the dot), making the selection state readable at a glance even before reading the label. Use this "card radio" pattern specifically for theme/layout/visual choices; use a plain dot-and-label radio for simple text choices (do not force every radio group into a card).
**shadcn/Base UI mapping:** shadcn `RadioGroup` + a custom `RadioGroupCard` composition wrapping each `RadioGroupItem` in a bordered, ring-on-checked container via `data-[state=checked]:ring-2`.
### Switch
Toggle used for boolean settings (e.g., event type enabled/disabled, "Allow multiple durations"). Track uses the muted/emphasis surface pair, thumb is white with its own dedicated small shadow (`--shadow-switch-thumb`) for a slightly raised look even at rest. Use shadcn `Switch` (Base UI `Switch`), restyle track colors to `--surface-subtle` (off) / `--brand` (on) and apply the thumb shadow token.
### Form field
Composition of Label (`14px/500`) + control + optional helper text (`12px`, muted, may include a small leading info icon) + optional error text (same size, error-colored, replaces helper text rather than stacking under it). Always associate label/control/helper/error via `htmlFor`/`aria-describedby` — verified pattern keeps helper and error mutually exclusive in the same slot, not both visible at once.
### Card
**Purpose:** generic bordered content container — the base unit for list rows, settings groups, and empty states.
**Anatomy:** `1px` border, `16px` radius, white background, `24px` internal padding for standalone cards, `16px` for compact list rows; optional **footer strip** with a muted background and a `1px` top divider for primary actions (verified, repeated pattern — see §4.3).
**Variants:** standalone card (settings group), list-row card (event type / availability row, horizontal flex layout), paywall/upsell card (two-column, see §4.5).
**shadcn/Base UI mapping:** shadcn `Card`, but add an explicit `CardFooter` variant with `bg-muted` + top border, since the default shadcn `CardFooter` has no such treatment and this pattern is used constantly here.
### Badge
**Purpose:** small status/category label (verified source: `packages/ui/components/badge/Badge.tsx`).
**Variants (verified `cva`):** `default`/`warning`/`orange` (attention colors), `success`/`green`, `gray`, `blue`/`info`, `red`/`error`, `grayWithoutHover`, `purple`.
**Sizes:** `sm` (10px text), `md` (12px text, default), `lg` (14px text, larger radius `8px` vs the default `4px`).
**Visual rules:** radius `4px` (the one component that deliberately uses the "tight" tier even at its largest size, `lg`, where it steps up to `8px` — never to the `10px` control radius); optional leading dot (small filled circle) or start icon (`12×12px`, `stroke-width 3`).
**shadcn/Base UI mapping:** shadcn `Badge`, replace default `variant` enum with the color list above; keep shadcn's `Badge` un-clickable by default but allow an optional `onClick` (verified: the reference application's Badge conditionally renders a `<button>` instead of a `<div>` when `onClick` is supplied — mirror this rather than always rendering a button with no visual difference).
### Alert
Not separately captured live; use the same semantic color pairs as Badge/toast (§3 Color) with a left-aligned icon, bold title, muted body, `1px` border in the matching semantic `border` step (not the neutral default border), radius `10px` (control tier, since Alerts are informational bars, not panels).
### Tabs
Two verified forms:
1. **Underline tabs** (Bookings: Upcoming/Unconfirmed/Recurring/Past/Canceled) — flat row, active tab bold + dark text, inactive tabs muted text, no visible underline bar was distinguishable from a bottom border on the active tab in the capture; treat as `border-b-2` active indicator to be safe and accessible.
2. **Filled/rounded tabs** (secondary editor sidebar, "Basics"/"Availability" etc.) — vertical stack, active tab gets a `10px`-radius, 4%-black-alpha fill, same treatment as the primary sidebar's active nav item — **reuse one `NavItem`-style component for both the primary sidebar and secondary tab sidebar** rather than building two separate active-state systems.
**shadcn/Base UI mapping:** shadcn `Tabs` for the underline form; a plain vertical nav list (not Radix Tabs) for the sidebar form, since it is really navigation (changes the URL/tab query param), not in-place panel switching.
### Breadcrumbs
Not directly evidenced in this session (detail pages used a single "← Back" control instead of a breadcrumb trail). Recommendation: if breadcrumbs are needed for deeper hierarchies, match the muted/default text pairing (`text-subtle` for all but the current page, `text-emphasis` for the current page) and the `14px` body size — do not introduce a new type scale for breadcrumbs.
### Header
Page header pattern (verified, repeated): title (`h3`, 20px/600) + one-line muted description directly under it (`14px`, `text-subtle`), with the primary action button and/or a search box right-aligned on the same row as the title. No hero imagery, no large top banner in the dashboard.
### Sidebar
See §4 "Sidebar and navigation behavior" for the full pattern (primary vs. secondary swap). Component-level: fixed width, `1px` right border, `24px`-ish internal padding, flat icon+label nav items at `10px` radius when active.
### Navigation menu
The primary sidebar *is* the navigation menu for this product — there is no separate top mega-menu in the authenticated app (the marketing site has one, but it is out of scope per §1). Do not build a horizontal mega-menu for the dashboard.
### Dropdown menu
**Purpose:** contextual actions on a list row (verified: "⋯" button on an Availability row → Duplicate / Delete).
**Visual rules (verified):** white panel, `10px` radius, `1px` border at 8% black alpha, layered soft shadow (`--shadow-dropdown`), `0` panel padding with each item individually padded `4px 8px` and `6px`-radius on hover/focus.
**Destructive items:** rendered in the same red used for the Delete-account error text (`hsla(0,63%,...)` family), not a separate "danger" style — reuse the semantic error text token.
**shadcn/Base UI mapping:** shadcn `DropdownMenu` (Base UI `Menu`), override panel radius/shadow/border and item padding/radius to the values above.
### Popover
Used for the command palette's contained result groups and for contextual pickers (e.g., timezone selector). Follows the same panel treatment as Dropdown Menu (white, `10px` radius, soft shadow). Command palette specifically adds a **backdrop blur + dim overlay** over the entire app shell (verified: background content visibly blurred/dimmed behind the search overlay) — reserve the blurred-backdrop treatment for app-wide overlays like the command palette, use a plain dim overlay (no blur) for scoped dialogs to keep the visual language legible (blur reads as "you've left the current context entirely").
### Tooltip
Small dark/inverted pill (verified: "Need help?" tooltip on the public booking page used the inverted-surface color, i.e., near-black bg with white text), appears on hover with no visible delay-related evidence captured — default to a short show-delay (~200–400ms) and no hide-delay, per common Radix/Base UI tooltip convention, since none of the inspected tooltips revealed a custom timing.
### Dialog
**Purpose:** blocking confirmation/action (verified: "Delete account" confirmation).
**Anatomy:** dim overlay (no blur) → centered panel, `16px` radius, `1px` shadow (`0 1px 2px rgba(0,0,0,.05)` — notably a *lighter* shadow than the dropdown menu's, since the overlay itself provides the separation) → header (bold title + close `×` icon top-right) → body copy (one or two short paragraphs) → **footer band with muted background** containing a `minimal`/text Cancel button and a solid destructive/primary action, right-aligned, Cancel to the left of the primary/destructive action.
**Sizing:** verified width `768px` for a two-sentence confirmation dialog — generous for the amount of content; do not shrink dialogs to fit content tightly, match this "roomy" convention.
**Accessibility:** must trap focus, close on `Escape`, restore focus to the trigger on close, and label via `aria-labelledby`/`aria-describedby` pointing at the title/body.
**shadcn/Base UI mapping:** shadcn `Dialog` (Base UI `Dialog`), with a custom `DialogFooter` that always applies the muted-background/top-border treatment — this is not optional styling in this design language, it's the default.
### Drawer / Sheet
Evidenced only indirectly via the shipped `drawerSlideLeftAndFade`/`drawerSlideRightAndFade` keyframes (150ms slide+fade). Use for mobile navigation and for any "edit in place without leaving the list" pattern (e.g., editing a booking from the Bookings list on a narrow viewport). shadcn `Sheet` (Base UI `Dialog` with a side-anchored variant) with these exact durations/easings.
### Table / data grid
Not populated with real data in this session (evidenced only via the `packages/ui/components/table` package existing and `pagination` styling fixes in commit history — see evidence appendix), so exact cell padding/borders were not independently measured live. **Recommendation, consistent with the rest of the system:** row height ≥ `44px` for comfortable click targets, `14px` body text, `1px` bottom border per row using the `border-subtle` token (not the darker default border), sticky header row with the `bg-muted` surface token and `text-subtle` uppercase-or-not label (match whichever the settings sidebar's group labels use — do not invent a new label treatment).
### Pagination
Not independently measured; commit history confirms an existing component (`packages/ui/components/pagination`) with a documented alignment fix for a "rows per page" select next to it — implies the real pattern is page-size select + page controls on one row, consistent with standard admin-table conventions. Match control height (`30–32px`) to the rest of the form-control family.
### Search
**Purpose:** two forms verified — an inline scoped search (event types list, `30px` input with a leading search icon, placeholder "Search") and a global command-palette search (large input at the top of a full-overlay panel, grouped results below by category, e.g. "Workflows", "Links").
**Visual rules:** inline search matches Input exactly (§ Input); command palette input is larger/borderless-looking within its own panel, with results grouped under small muted category labels.
**shadcn/Base UI mapping:** `cmdk`-based `Command` component (already the de facto shadcn pattern) for the global palette; plain `Input` + icon for inline/scoped search.
### Empty state
See §4.4 for the full anatomy (icon tile, headline, one sentence, primary action). **Do not** add secondary/tertiary actions to an empty state — every verified instance (Bookings, Workflows) used exactly one primary action.
### Skeleton
Referenced via a dedicated `--animate-skeleton` keyframe in the `coss-ui` token layer (`background-position` sweep, `2s` linear infinite, offset `-1s`) — a shimmer/sweep skeleton, not a flat pulse. Use `bg-muted` base with a lighter sweep gradient animated per this keyframe rather than shadcn's default opacity-pulse skeleton, to match the source system.
### Toast
Not directly triggered/captured in this session; the `fade-in-up` keyframe (§3 Motion) is the documented entrance animation available in the token layer and is the most probable candidate for toast entrance based on its naming and duration profile. Use shadcn `Sonner`/`Toast`, apply `fade-in-up` on enter, plain opacity fade on exit, and the same semantic color pairs as Alert/Badge for success/error toasts.
## 6. Composition patterns
**Application shell:** fixed-width primary sidebar (nav + search + avatar) + fluid content area with `32px` gutters. No top app bar separate from the sidebar — the sidebar carries all persistent chrome.
**Marketing page:** out of scope for this repository's component system (§1) — if one is built, treat it as a visually distinct "brand" execution (large display type, generous whitespace) that intentionally does not reuse the dashboard's compact control sizing, consistent with how the reference product itself separates the two.
**Dashboard / list page:** header (title + description + primary action, §5 Header) → stack of full-width `16px`-radius row-cards → empty state when zero items. No grid-of-cards layout was observed for primary dashboard lists; reserve card-grid layouts for template/gallery pickers (Workflows' template section) instead.
**Detail page:** slim top bar (back + record title + primary actions) → secondary tab sidebar + form column (+ optional sticky live-preview column). See §4.2.
**List and filtering page:** underline tabs for status filters (Bookings) + a "Filter" button opening additional structured filters + view-mode icon toggles top-right. Filtering controls live on the *same row* as the tabs, right-aligned, never as a separate row below.
**Form page / Settings page:** grouped cards, each with its own muted-footer save action (§4.3) — never a single page-level "Save" floating at the very bottom for multiple unrelated groups; each group commits independently.
**Authentication page:** not inspected in this session (already authenticated); infer from the marketing site's sign-up module only for the broad shape (centered card, OAuth button above a plain-email fallback, "No credit card required" reassurance copy) — treat control styling on this page as the *dashboard's* Button/Input tokens, not the marketing site's Framer styling, since auth is functionally part of the product, not the marketing brand.
## 7. Content and microcopy
- **Heading capitalization:** sentence case throughout ("Links", "Delete account", "Create your first workflow") — never title case, never all-caps except small structural group labels in navigation (treat those as a distinct "label" style, not a heading).
- **Button labels:** short, verb-first, 1–3 words ("New", "Save", "Update", "Try it for free", "Delete my account"). Destructive confirmation buttons restate the object being destroyed ("Delete my account", not a bare "Delete") when the action is severe (account deletion) but can stay generic ("Delete") for low-severity, easily-reversible items (a single availability schedule, which also offers "Duplicate" alongside it).
- **Form labels/helper text:** label is a short noun phrase ("Title", "Full name", "Default duration"); helper text is a full, plain sentence, often prefixed with a small info icon when it's a tip rather than a requirement ("Tip: You can add a '+' between usernames…").
- **Validation messages:** not directly captured live; follow the same plain-sentence tone as helper text, state what's wrong and how to fix it, and replace (not stack under) the helper text in the same slot (§5 Form field).
- **Empty states:** bold short headline stating the *capability* ("Create your first workflow"), one muted sentence explaining *why*/*what happens next*, single action button restating the headline's verb ("Create").
- **Destructive confirmations:** two-part body copy — first sentence is a direct yes/no question ("Are you sure you want to delete your account?"), second sentence/paragraph states the concrete, specific consequence ("Anyone who's shared your account link with will no longer be able to book using it…") rather than a generic "this cannot be undone" alone. Always pair with a plain non-destructive "Cancel" as the visually secondary button.
- **Dates/numbers/truncation:** durations are shown compactly with a unit suffix, no space-padding inconsistency ("50m", "1h 20m" — hours+minutes combined once past 60 minutes, not "80m"); long URLs/slugs truncate the path, not the domain, when space-constrained (verified: a slug like `/jane-doe-xnt8ol/30min` stays intact under the card title rather than being ellipsized in the observed viewport — at narrower widths, truncate the *middle* of the slug, keep prefix and duration suffix visible).
Do not copy the reference product's actual copy verbatim into this repository's content — the phrasing rules above are the pattern to follow with new, original copy.
## 8. Accessibility
- **WCAG 2.2 AA contrast:** verified default body text (`#3C3E44` on white) and emphasis text (`#070A0D` on white) both comfortably clear AA. **Flagged risk:** `--content-muted` (`#9CA3B0`, ≈2.8:1) is sub-AA for body copy — restrict to placeholders/disabled/decorative use only (§3 Color).
- **Keyboard navigation:** every interactive element must be reachable via `Tab`/`Shift+Tab` in visual order; the sidebar's active-item pattern and the secondary tab sidebar must both be real link/button elements (not `div[onclick]`) — consistent with the verified `Button` source, which explicitly branches between rendering an `<a>` or a `<button>` rather than a generic clickable `<div>`.
- **Visible focus:** always use `focus-visible` (not bare `:focus`) with the layered box-shadow ring described in §3; never remove focus styling without a replacement, even on custom-styled controls (radio cards, toggle switches).
- **Semantic HTML:** use real `<button>`, `<a href>`, `<label>`, `<fieldset>`/`<legend>` for radio groups, `<table>` for tabular data — do not build tables/menus out of nested `<div>`s. Heading level should follow document outline; visual size is independently controlled (§2, verified `<h2>` styled at 14px pattern) — never skip heading levels to "get" a smaller visual size.
- **Labels and descriptions:** every form control has a visible `<label>` (verified — no placeholder-as-label pattern was observed); helper/error text is linked via `aria-describedby`.
- **Error identification:** never rely on color alone — pair the red border/ring with explicit error text in the helper-text slot (§5 Form field) and, where practical, an inline icon.
- **Minimum target sizes:** enforce 24×24px CSS minimum on every control; flag the source system's own `xs` icon button (20px) as a value to raise, not replicate, when the surface may be touched (§3 Spacing).
- **Screen-reader announcements:** dialogs and drawers must move focus into the panel on open and announce via `aria-labelledby`; toasts should use a polite `aria-live` region so they announce without interrupting; loading buttons should expose their busy state via `aria-busy`, since the visual "invisible content + spinner" swap conveys nothing to assistive tech on its own (verified gap in the source component — do not carry this gap into this repository, add `aria-busy` explicitly).
- **Reduced motion:** wrap all keyframe-driven entrances/exits in a `prefers-reduced-motion` check (§3 Motion) — not present in the verified source, added here as a hardening recommendation.
- **Zoom and reflow:** fixed-height, `px`-based controls (`30px` inputs, `32px` buttons) should still be built with `rem`-equivalent sizing under the hood so browser text-zoom (not just pinch-zoom) reflows correctly; verify the two-pane editor layout (form + live preview) collapses to single-column well before 400% zoom equivalent width, consistent with the mobile stacking recommendation in §4.
- **Color-independent status communication:** badges/alerts should keep their leading icon or dot even when color alone would technically suffice, so status is legible without color differentiation (verified: Badge component supports an optional leading dot/icon precisely for this reason — treat it as required, not optional, when the badge conveys status rather than a neutral category).
## 9. Implementation architecture
**Token organization:** two CSS files, layered:
1. `tokens.css` — the semantic extension layer (`--surface-*`, `--content-*`, `--line-*`, shadow/radius/animation tokens), scoped under `:root` and `.dark`, matching the structure verified in the real repo.
2. `globals.css` — the shadcn-standard core layer (`--background`, `--foreground`, `--primary`, `--card`, `--popover`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`), defined so that every shadcn/Base UI component works unmodified, with values set to match the extension layer's equivalents (§10) rather than shadcn's stock neutral palette.
**CSS custom-property conventions:** all tokens are unprefixed CSS variables consumed through Tailwind v4's `@theme inline` block (i.e., `--color-primary: var(--primary);` etc.), not a `tailwind.config.js` `theme.extend.colors` object — this repo should follow the same CSS-first token approach (Tailwind v4 native) rather than reintroducing a JS config for colors, to stay consistent with the verified source (`@theme inline` blocks in both `tokens.css` and `coss-ui/globals.css`).
**Tailwind integration:** reference tokens only via the generated utility classes (`bg-default`, `text-subtle`, `border-emphasis`, etc., mirroring the real `--color-*`/`--text-color-*`/`--border-color-*` mappings in `tokens.css`) — never hardcode a hex/hsl value in a component's `className`. Add the fixed `10px` control radius as a first-class Tailwind token (`--radius-control: 10px` → `rounded-control`) rather than repeating `rounded-[10px]` as an arbitrary value across every component, which is the one inconsistency worth correcting from the source (the real code uses the arbitrary-value form pervasively; a named token is strictly better for a from-scratch build).
**shadcn component-extension strategy:** install shadcn components as-is, then apply this design system's tokens/radii/shadows via each component's default `className` (theming at the token layer, not by hand-editing every generated component file line-by-line) so future `shadcn add` updates stay low-friction. Where a variant vocabulary differs from shadcn's default (Button's `secondary`/`minimal` vs. shadcn's `outline`/`ghost`), rename in the generated component's `cva` config once, immediately after scaffolding.
**Base UI primitive mapping:** for any interaction shadcn doesn't ship a matching component for (the radio-card selector, the muted-footer card action bar), build directly on Base UI's unstyled primitives (`@base-ui-components/react`'s `RadioGroup`, `Dialog`, `Menu`, etc.) rather than hand-rolling focus/keyboard logic.
**Variant management:** use `class-variance-authority` (already the pattern in the reference source for both `Button` and `Badge`) for every component with more than two visual variants or size steps. Co-locate the `cva` config with the component file, export the inferred variant-prop types (`VariantProps<typeof xClasses>`) for use in the component's public props type, exactly as the reference `Button.tsx`/`Badge.tsx` do.
**Rules for composing `className`:** use a `cn()`/`classNames()` merge helper (Tailwind-merge + clsx) everywhere a component accepts an external `className` override, so consumer overrides win predictably — verified pattern (`classNames(buttonClasses({...}), props.className)` in `Button.tsx`).
**Server/client component boundaries (Next.js App Router):** keep token/CSS files and purely presentational components (Badge, Card, Button) server-renderable by default; mark client boundaries only where interaction state is required (Dialog, DropdownMenu, form controls, anything using Base UI's stateful primitives) — do not blanket-mark a whole page `"use client"` just because one interactive control lives in it; push the `"use client"` boundary down to the smallest component that needs it.
**Icon library guidance:** the reference system uses a single custom `Icon` wrapper (`packages/ui/components/icon`) around **Lucide** icons (confirmed by icon-prop naming conventions, e.g. `plus`, and stroke-width usage matching Lucide's default `1.5–3px` stroke model) with a fixed default size/stroke. In this repository, use `lucide-react` directly through a thin wrapper that fixes default `size={16}` and `strokeWidth={1.5}` to match the verified button-icon proportions, rather than importing raw Lucide icons ad hoc with inconsistent sizing per call site.
**Avoiding one-off arbitrary values:** the only sanctioned arbitrary-value class in this system is the control radius (`rounded-[10px]`, which should become `rounded-control` per above) and the button press micro-nudge (`translate-y-[0.5px]`, small and specific enough to leave as a documented one-off utility, e.g. `active:translate-y-press`). Any other arbitrary value appearing in a PR should be treated as a signal that the token scale is missing a step, not as a license to hardcode.
## 10. Design tokens
```css
:root {
  /* ---- Core (shadcn-compatible) ---- */
  --background: #FFFFFF;
  --foreground: #3C3E44;
  --card: #FFFFFF;
  --card-foreground: #3C3E44;
  --popover: #FFFFFF;
  --popover-foreground: #3C3E44;
  --primary: #111827;              /* --brand */
  --primary-foreground: #FFFFFF;
  --secondary: #FFFFFF;
  --secondary-foreground: #3C3E44;
  --muted: #F6F7F9;                /* --surface-muted */
  --muted-foreground: #6B7280;     /* --content-subtle */
  --accent: rgba(0, 0, 0, 0.04);
  --accent-foreground: #070A0D;
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  --info: #DDE7FD;
  --info-foreground: #243C84;
  --success: #E4FBED;
  --success-foreground: #285231;
  --warning: #FFEDD6;
  --warning-foreground: #74331B;
  --border: #D1D5DB;
  --input: rgba(0, 0, 0, 0.08);
  --ring: rgb(59 130 246 / 0.5);
  --radius: 0.625rem;               /* 10px — control tier default for shadcn's --radius */
  /* ---- Extension layer (product semantic scale) ---- */
  --surface: #FFFFFF;
  --surface-subtle: #EEEFF2;
  --surface-muted: #F6F7F9;
  --surface-emphasis: #E5E7EB;
  --surface-inverted: #070A0D;
  --content: #3C3E44;
  --content-emphasis: #070A0D;
  --content-subtle: #6B7280;
  --content-muted: #9CA3B0;
  --content-inverted: #FFFFFF;
  --line: #D1D5DB;
  --line-subtle: #E5E7EB;
  --line-muted: #EEEFF2;
  --line-emphasis: #9CA3B0;
  --brand: #111827;
  --brand-emphasis: #0F0F0F;
  --surface-info: #DDE7FD;      --content-info: #243C84;
  --surface-success: #E4FBED;   --content-success: #285231;
  --surface-warning: #FFEDD6; --content-warning: #74331B;
  --surface-error: #F9E3E1;     --content-error: #811D1D;
  /* Radius scale */
  --radius-sm: 0.125rem;   /* 2px */
  --radius-md: 0.375rem;   /* 6px  – "tight" tier (badges, menu items) */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-control: 0.625rem; /* 10px – buttons, inputs, chips, menus */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px – "panel" tier (cards, dialogs) */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
  /* Shadows */
  --shadow-elevation-low: 0px 1px 1px rgba(0,0,0,.07), 0px 1px 2px rgba(0,0,0,.08), 0px 2px 2px rgba(0,0,0,.10), 0px 0px 8px rgba(0,0,0,.05);
  --shadow-dropdown: 0px 5px 20px rgba(0,0,0,.10), 0px 10px 40px rgba(0,0,0,.03);
  --shadow-button-solid-brand-default: 0px 2px 3px rgba(0,0,0,.06), 0px 1px 1px rgba(0,0,0,.08), 1px 4px 8px rgba(0,0,0,.12), 0px 2px .4px rgba(255,255,255,.12) inset, 0px -3px 2px rgba(0,0,0,.04) inset;
  --shadow-button-solid-brand-hover: 0px 1px 1px rgba(0,0,0,.10), 0px 2px 3px rgba(0,0,0,.08), 1px 4px 8px rgba(0,0,0,.12), 0px -3px 2px rgba(0,0,0,.10) inset, 0px 2px .4px rgba(255,255,255,.24) inset;
  --shadow-outline-gray-rested: 0px 2px 3px rgba(0,0,0,.03), 0px 2px 2px -1px rgba(0,0,0,.03);
  --shadow-switch-thumb: 0px .8px .8px rgba(0,0,0,.10), 0px .8px 3.2px rgba(0,0,0,.08);
  /* Typography */
  --font-sans: "Inter var", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Inter Tight", "Inter var", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* Motion */
  --ease-entrance: cubic-bezier(.21, 1.02, .73, 1);
  --duration-control: 100ms;
  --duration-shadow: 200ms;
  --duration-drawer: 150ms;
  --duration-entrance: 600ms;
}
.dark {
  --background: #0F0F0F;
  --foreground: #D4D4D4;
  --card: #0F0F0F;
  --card-foreground: #D4D4D4;
  --popover: #171717;
  --popover-foreground: #D4D4D4;
  --primary: #FFFFFF;
  --primary-foreground: #111827;
  --secondary: #0F0F0F;
  --secondary-foreground: #D4D4D4;
  --muted: #171717;
  --muted-foreground: #A3A3A3;
  --accent: rgba(255, 255, 255, 0.04);
  --accent-foreground: #FAFAFA;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --border: #4C4C4C;
  --input: rgba(255, 255, 255, 0.08);
  --ring: #737373;
  --surface: #0F0F0F;
  --surface-subtle: #262626;
  --surface-muted: #171717;
  --surface-emphasis: #404040;
  --surface-inverted: #FAFAFA;
  --content: #D4D4D4;
  --content-emphasis: #FAFAFA;
  --content-subtle: #A3A3A3;
  --content-muted: #A3A3A3;
  --content-inverted: #0F0F0F;
  --line: #4C4C4C;
  --line-subtle: #262626;
  --line-muted: #171717;
  --line-emphasis: #737373;
  --brand: #FFFFFF;
  --brand-emphasis: #9CA3B0;
}
```
**TypeScript representation** (only where it aids implementation — the Button/Badge variant contracts):
```ts
// button-variants.ts
import { cva, type VariantProps } from "class-variance-authority";
export const buttonVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-control text-sm font-medium transition-shadow disabled:cursor-not-allowed disabled:opacity-30",
  {
    variants: {
      color: {
        primary: "border border-primary bg-primary text-primary-foreground shadow-button-solid-brand-default hover:bg-primary/90 hover:shadow-button-solid-brand-hover",
        secondary: "border border-border bg-card text-foreground shadow-outline-gray-rested hover:bg-muted",
        minimal: "border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
        destructive: "border border-border text-destructive hover:border-destructive hover:bg-destructive/10",
      },
      size: {
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-7 px-2 py-1.5",
        base: "h-8 px-2.5 py-2",
        lg: "px-3 py-2.5",
      },
    },
    defaultVariants: { color: "primary", size: "base" },
  }
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;
```
## 11. Examples
**Example 1 — Page header + empty state (list page pattern, §4/§5):**
```tsx
// app/(dashboard)/workflows/page.tsx
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
export default function WorkflowsPage() {
  const workflows: Workflow[] = []; // fetched server-side
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Create workflows to automate notifications and reminders
          </p>
        </div>
      </div>
      {workflows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
            <Zap className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Create your first workflow
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Workflows automate notifications and reminders, helping you build
            processes around your events.
          </p>
          <Button color="primary">Create</Button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {workflows.map((w) => (
            <WorkflowRow key={w.id} workflow={w} />
          ))}
        </ul>
      )}
    </div>
  );
}
```
**Example 2 — Card with footer action bar (settings pattern, §4.3/§5 Card):**
```tsx
// components/settings/settings-card.tsx
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
export function SettingsCard({
  title,
  description,
  children,
  onSave,
  saveDisabled,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${title}-heading`}
      className="rounded-2xl border border-border bg-card"
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 id={`${title}-heading`} className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
      <div className="flex justify-end rounded-b-2xl border-t border-border bg-muted px-6 py-3">
        <Button color="primary" size="sm" disabled={saveDisabled} onClick={onSave}>
          Update
        </Button>
      </div>
    </section>
  );
}
```
**Example 3 — Destructive confirmation dialog (§5 Dialog, §8 Accessibility):**
```tsx
// components/settings/delete-account-dialog.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? Anyone you&apos;ve
            shared a booking link with will no longer be able to book using
            it, and any preferences you&apos;ve saved will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end gap-2 border-t border-border bg-muted p-4">
          <Button color="minimal" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button color="destructive" onClick={onConfirm} aria-label="Permanently delete my account">
            Delete my account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```
## 12. Do and don't rules
- Do use `bg-muted`/`text-muted-foreground` semantic tokens for all secondary surfaces and text; don't hardcode `#F6F7F9` or `gray-100` in a component.
- Do use the `rounded-control` (10px) token for every button, input, and small card; don't reach for Tailwind's raw `rounded-lg`/`rounded-xl` on these controls just because it's close.
- Do communicate button interaction state with the `shadow-button-*`/`shadow-outline-*` token stacks; don't add `hover:scale-105` or similar transform-based feedback — it is not part of this design language.
- Do put a form group's primary save action inside a distinct `bg-muted` footer band with a top border; don't place a Save button inline among the fields it saves.
- Do pair every destructive action with a specific consequence sentence in the confirmation dialog; don't ship a bare "This action cannot be undone" with no detail.
- Do use `text-muted-foreground`/`--content-subtle` as the floor for any readable secondary copy; don't use `--content-muted` for anything but placeholders/disabled state (it fails AA contrast).
- Do keep badges/alerts at the "tight" 4–6px radius tier; don't promote them to the 10px control radius just for visual consistency with buttons — the radius difference is intentional signal that they're not interactive.
- Do render real `<button>`/`<a>` elements for every clickable control, exactly as the reference `Button` component does; don't attach `onClick` to a bare `<div>` or `<span>`.
- Do reserve saturated color (blue/green/orange/red) for semantic state and data visualization; don't introduce a saturated "brand" fill color for default chrome.
- Do use `cva` for any component with more than two variants/sizes, colocated with the component; don't scatter conditional className logic through inline ternaries once a component has more than two variant axes.
## 13. Visual QA checklist
- [ ] **Hierarchy:** page title is the only 20px/heading-face text on the page; card/section titles are 14px/600 body-face, not heading-face.
- [ ] **Alignment:** primary action buttons in page headers are right-aligned on the title's row; card row content is vertically centered, not top-aligned.
- [ ] **Spacing:** all paddings/gaps are multiples of 4px; standalone cards use 24px internal padding, compact list rows use 16px.
- [ ] **Typography:** body copy is 14px/400 in the sans token; no component silently falls back to the browser default font stack.
- [ ] **Responsive:** two-pane editor layouts (form + preview) collapse to a single column before the content overflows or requires horizontal scroll; primary sidebar collapses to a drawer/sheet below the `md` breakpoint.
- [ ] **Component states:** every interactive component has visibly distinct rest/hover/focus-visible/active/disabled states, and buttons additionally have a loading state that preserves layout (content `invisible`, not removed).
- [ ] **Keyboard behavior:** full page is operable by `Tab`/`Shift+Tab`/`Enter`/`Escape` alone; dialogs trap focus and restore it to the trigger on close; no keyboard trap exists anywhere else.
- [ ] **Contrast:** no instance of `--content-muted`/`muted-foreground` used for body copy or required information; all text/background pairs meet WCAG AA (4.5:1 normal, 3:1 large text/UI).
- [ ] **Loading and error states:** every async list/table has a skeleton (shimmer-sweep, not opacity-pulse) and an explicit error state with retry, not just a silent empty state.
- [ ] **Consistency with tokens:** no raw hex/hsl values or arbitrary Tailwind values (`rounded-[Npx]`, `#RRGGBB`) in component code outside the token files in §10, except the two documented exceptions in §9 (`rounded-control`, press micro-nudge) — and those should already be named tokens/utilities, not raw arbitrary values, in new code.
- [ ] **Light and dark themes:** every semantic token has a resolved `.dark` value (§10); manually verify the destructive/success/warning/info pairs specifically, since they are the most likely to be forgotten when a component is first built in light mode only.

## 14. Implementation notes for this repository

This section records where this codebase's implementation intentionally departs from or extends the analysis above, so future changes stay consistent.

- **Navigation architecture:** the app uses a fixed left sidebar (`components/app-toolbar.tsx`, `~260px`, `--sidebar-width`) per §4/§6, collapsing to a top bar + slide-in `Sheet` below `lg`. There is no secondary tab-sidebar pattern in this app (no event-type-editor-style detail page exists here).
- **Font substitutes:** self-hosting Geist-family fonts is out of scope; this repo uses `next/font/google` **Inter** (body) and **Inter Tight** (heading), per the substitution guidance in §3 Typography.
- **Compact heading ladder:** beyond the page-title (20px) / card-title (14px) split, this repo defines a small in-page heading ladder (`text-h2` 18px, `text-h3`/`text-h4` 16px) for sub-headings that sit between the two, and a separate **stat/metric** type scale (`text-stat-lg/md/sm`, 32/24/20px, weight 700) for dashboard KPI numerals — kept deliberately outside the heading hierarchy so headings stay compact while stat displays keep visual weight.
- **Token naming:** the existing product's own semantic alias layer (`--bg-*`, `--border-*`, `--content-*`, `--text-*`, `--surface-*`, `--status-*`, `--chart-*`, `--sidebar-*`) is preserved as-is and repointed to this design system's palette, rather than renamed to the exact `--surface-*`/`--content-*`/`--line-*` names in §10 — both layers resolve to the same values; components consume whichever alias they already used.
- **Button variant set:** `primary` / `secondary` / `minimal` / `soft` / `destructive`. `soft` is a repo-specific fifth variant (solid subtle fill) kept from before this migration for a couple of low-emphasis actions; it is not part of the four canonical colors in §5 and should not be reached for by default — prefer `secondary` or `minimal` first.
