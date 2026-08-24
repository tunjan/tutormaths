---
version: beta
name: Maths Tasks Design System
description: A focused tutoring workspace built on cool neutrals, one purposeful blue accent, compact Geist typography, a 4px spacing grid, and restrained elevation. The system favors clarity, scannability, and calm over decorative chrome.

colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-active: "#1e40af"
  on-primary: "#ffffff"
  ink: "#18181b"
  body: "#3f3f46"
  mute: "#52525b"
  faint: "#62626a"
  control-border: "#85858e"
  hairline: "#d4d4d8"
  hairline-soft: "#e4e4e7"
  canvas: "#fafafa"
  canvas-subtle: "#f4f4f5"
  canvas-elevated: "#ffffff"
  link: "#1d4ed8"
  link-deep: "#1e40af"
  link-soft: "#dbeafe"
  success: "#166534"
  success-soft: "#dcfce7"
  warning: "#92400e"
  warning-soft: "#fef3c7"
  error: "#b91c1c"
  error-soft: "#fee2e2"

typography:
  display-xl:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 48px
    fontWeight: 600
    lineHeight: 48px
    letterSpacing: -0.05em
  page-title:
    fontFamily: Geist, Arial, sans-serif
    fontSize: clamp(28px, calc(24px + 1vw), 32px)
    fontWeight: 600
    lineHeight: 1.125
    letterSpacing: -0.035em
  section-title:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: -0.72px
  heading-md:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  label:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: -0.01em
  eyebrow:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0
  caption:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0
  button:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0
  code:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 64px
  4xl: 96px
  section: 128px

components:
  app-shell:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    maxWidth: 1248px
    padding: "{spacing.md} {spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0px 14px"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    borderColor: "{colors.control-border}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0px 14px"
  text-input:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.control-border}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
  card:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  dialog:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

## Direction

Maths Tasks is a private working tool, not a marketing page. Its visual language is quiet and exact: near-white canvas, white working surfaces, clear dark type, one blue interaction accent, and status colors only when the workflow needs them. Information hierarchy comes from typography, spacing, alignment, and grouping before color or elevation.

The product should feel calm with sparse data and remain scannable when assignments, comments, students, and files become dense. Every screen must preserve a clear next action and a visible route back.

## Core principles

- **Focus:** one filled blue primary action per view; peer actions stay outlined, ghosted, or linked.
- **Restraint:** neutral surfaces and hairlines do most structural work. Color has a job, never a decorative quota.
- **Consistency:** use semantic tokens and shared components instead of local visual overrides.
- **Accessibility:** keyboard behavior, focus visibility, labels, error messaging, contrast, and touch targets are part of the design system.
- **Resilience:** layouts handle empty, sparse, dense, loading, error, and long-content states without changing their visual grammar.

## Color

### Roles

- `{colors.canvas}` is the page background; `{colors.canvas-elevated}` is reserved for cards, inputs, menus, and overlays.
- `{colors.ink}` is for headings and high-emphasis values. Body and metadata step through `{colors.body}`, `{colors.mute}`, and `{colors.faint}`.
- `{colors.primary}` is the sole interactive accent for filled actions and focus. Links use the deeper blue tier so they remain distinct on light surfaces.
- Success, warning, and error colors appear only with a text label or icon. Color never carries status alone.
- The auth canvas may use a single 5% blue ambient field. Do not add multi-hue gradients, glow effects, or decorative color blocks.

### Contrast pairs

The implemented palette is measured against its rendered surfaces. Body/canvas is 10.01:1, link/canvas 6.42:1, white/primary 5.17:1, and the input border/card edge is 3.66:1. Re-measure the actual rendered pair before changing a token.

## Typography

Geist Sans handles UI and prose; Geist Mono is limited to code and compact technical eyebrows. The system uses only 400, 500, and 600 weights.

- Page titles use `{typography.page-title}` with balanced wrapping.
- Section titles descend to `{typography.section-title}` and `{typography.heading-md}`.
- Body copy uses `{typography.body}` with descriptions capped near 65 characters.
- Labels and buttons use 500; headings use 600; prose uses 400.
- Body copy uses `text-wrap: pretty`; headings use `text-wrap: balance`; long identifiers must break safely.
- Changing values, dates, percentages, and counts use tabular numerals.
- Inputs render at 16px on coarse pointers to avoid iOS zoom.

## Spacing and layout

The base unit is 4px. Micro spacing may use one unit; most layout rhythm advances in 8px pairs. Prefer the shared scale: 4 → 8 → 12 → 16 → 24 → 32 → 40 → 64 → 96 → 128px.

- App content is centered in a 1248px shell with 16px mobile and 24px larger-screen gutters.
- Related controls use 8–12px gaps. Card interiors generally use 16–24px. Major page sections use 24–40px.
- Use CSS grid or flexbox; do not measure layouts in JavaScript when the browser can resolve them.
- Mobile flows stack in reading order. Laptop layouts may introduce two purposeful columns. Ultra-wide screens keep the container constraint.
- Every flex child that may truncate needs `min-width: 0`; user content must wrap or truncate deliberately.

## Shape and elevation

Nested radii follow 4px details, 8px controls, 12px cards, and 16px panels/dialogs. Full rounding is reserved for circles, avatars, status dots, and intentionally pill-shaped categories—not general app chrome.

| Level | Treatment | Use |
|---|---|---|
| Flat | Surface step or hairline, no shadow | Page sections, default cards, inputs |
| Rested | Compact direct shadow | Primary controls, lightly raised surfaces |
| Raised | Direct + low-alpha ambient shadow | Menus and popovers |
| Dialog | Direct + broader ambient shadow | Modals and blocking overlays |

Shadows inherit the ink hue. Prefer a border or surface change before adding elevation.

## Components

- **Buttons:** default and marketing primary variants use the blue accent; outline buttons are transparent; ghost buttons add only a neutral hover surface. Pressed states use a 1px transform and active color.
- **Inputs:** white surface, explicit control border, blue focus ring, inline invalid state, and a neutral read-only/disabled surface.
- **Cards:** white 12px-radius surface with a quiet hairline. Add hover elevation only when the whole card is genuinely interactive.
- **Menus and popovers:** white raised surface, restrained shadow, bounded height, and contained overscroll.
- **Dialogs and sheets:** 16px parent radius, safe-area padding, contained scrolling, and stacked full-width actions on mobile.
- **Status:** badges and alerts combine tint with a label and, where useful, an icon or dot.
- **Empty states:** calm bordered surface with a concrete next step; no decorative illustration is required.

## Interaction and accessibility

- Interactive targets are at least 24px and expand to at least 44px for coarse pointers.
- Keep a visible `:focus-visible` ring and use native semantics before ARIA.
- Links remain links; buttons remain buttons. Never use clickable generic containers for navigation.
- Modals trap focus, contain overscroll, and return focus to their trigger.
- Loading buttons keep their original label, add a spinner, and disable only after the request starts.
- Motion uses only opacity and transform with the shared 120/180/240ms durations. Reduced-motion preferences disable nonessential animation.
- Hover, active, focus, disabled, invalid, loading, empty, and error states must remain visually distinct without relying on color alone.

## Do / don’t

### Do

- Use semantic tokens and existing Base UI/shadcn primitives.
- Keep one clear filled action and quiet the rest.
- Let whitespace and hierarchy separate sections.
- Use locale-aware dates and numbers, semantic headings, and tabular figures.
- Verify mobile, laptop, and ultra-wide layouts before shipping.

### Don’t

- Don’t introduce another accent hue or a decorative multi-color gradient.
- Don’t apply the same radius or shadow to every element.
- Don’t use heavy shadows, glass effects, or gradient-filled cards.
- Don’t use `transition: all` or animate layout properties.
- Don’t reduce contrast to make the interface look quieter.
- Don’t add local color or typography overrides when a shared token or variant should own the change.
