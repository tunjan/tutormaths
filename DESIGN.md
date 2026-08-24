---
version: alpha
name: Maths Tasks Design System
description: A focused tutoring workspace built on cool neutrals, one purposeful blue accent, a 4px spacing grid, consistent nested radii, and restrained elevation.

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
  hairline: "#e4e4e7"
  hairline-soft: "#eeeef0"
  hairline-strong: "#d4d4d8"
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
    fontSize: 32px
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
    letterSpacing: 0em
  body:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0em
  caption:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0em
  button:
    fontFamily: Geist, Arial, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0em
  code:
    fontFamily: Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0em

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
  content-width: 1248px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0px 14px"
  text-input:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
  card:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  dialog:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  divider:
    backgroundColor: "{colors.hairline-soft}"
    size: 1px
  link:
    textColor: "{colors.link}"
    typography: "{typography.body}"
  link-hover:
    textColor: "{colors.link-deep}"
    typography: "{typography.body}"
  selection:
    backgroundColor: "{colors.link-soft}"
    textColor: "{colors.ink}"
  status-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
  status-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.sm}"
  status-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
---

## Overview

Maths Tasks is a private working tool for tutors and students. Its shared UI uses a near-white canvas, white working surfaces, clear dark type, one blue interaction accent, and status colors only when the workflow needs them. Hierarchy comes from typography, spacing, alignment, and tonal grouping before borders or shadows.

The interface must stay calm with sparse data and scannable when assignments, comments, students, and files become dense. Each state keeps a clear next action and a visible route back.

## Colors

- `{colors.canvas}` is the page field; `{colors.canvas-elevated}` is the working surface for controls, cards, menus, and overlays. `{colors.canvas-subtle}` groups related content without adding another outline.
- `{colors.ink}` carries headings and high-emphasis values. Body and metadata step through `{colors.body}`, `{colors.mute}`, and `{colors.faint}`.
- `{colors.hairline}` and `{colors.hairline-soft}` are structural separators only. Interactive controls retain `{colors.control-border}` so the quieter container system does not weaken affordance.
- `{colors.primary}` is the sole interaction accent for filled actions and visible focus. Links use `{colors.link}` and `{colors.link-deep}` on light surfaces.
- Success, warning, and error treatments pair their tint with a text label or icon. Color never carries status alone.

## Typography

Geist Sans handles interface text and prose. Geist Mono is limited to code and compact technical eyebrows. Use only the weights already represented by the shared typography tokens.

- Page and section headings use the corresponding title tokens with balanced wrapping.
- Body copy uses `{typography.body}` or `{typography.body-lg}` with pretty wrapping and deliberate line-length constraints.
- Labels and actions use `{typography.label}` and `{typography.button}`; technical metadata may use `{typography.eyebrow}`.
- Changing values, dates, percentages, and counts use tabular numerals. Long identifiers wrap or truncate deliberately.

## Layout

The system is based on `{spacing.xxs}` increments, with most layout rhythm advancing through the paired steps in the shared spacing scale. Use `{spacing.xs}` and `{spacing.sm}` within related control groups, `{spacing.md}` and `{spacing.lg}` inside surfaces, and the larger tokens between major page regions.

App content stays within `{spacing.content-width}`. Mobile layouts stack in reading order; wider screens introduce columns only when the relationship benefits from comparison. Use grid or flexbox instead of JavaScript measurement, keep truncating flex children at `min-width: 0`, and constrain ultra-wide layouts to the content shell.

## Elevation & Depth

Depth is primarily tonal: canvas, subtle group, then elevated working surface. Structural cards stay flat. Rested elevation is limited to primary controls and lightly raised interactive surfaces; raised elevation belongs to menus and popovers; dialog elevation belongs to blocking overlays. Shadows inherit the ink hue and remain low-alpha.

Prefer whitespace or a surface step before a separator, and a quiet separator before a shadow. Interactive hover elevation is allowed only when the whole surface is actionable.

## Shapes

Nested radii follow `{rounded.xs}` details, `{rounded.sm}` controls, `{rounded.md}` cards, and `{rounded.lg}` panels or dialogs. Child radii do not exceed their parent. `{rounded.full}` is reserved for circles, avatars, status dots, and intentional category pills rather than general app chrome.

## Components

- Primary buttons use the blue action sequence and restrained rested elevation. Secondary and ghost actions use neutral surfaces; only one peer action should be filled blue in a view.
- Inputs keep the explicit control border, elevated surface, inline invalid state, and blue focus ring. Disabled and read-only states use a neutral surface change rather than reduced legibility.
- Cards use the elevated surface, card radius, and a quiet structural edge only where the page surface does not already provide enough grouping.
- Menus and popovers use raised elevation, bounded height, and contained overscroll. Dialogs and sheets use the largest nested radius, safe-area padding, contained scrolling, and mobile action stacking.
- Dense lists prefer row rhythm and soft dividers over individually bordered items. Status treatments always combine their tint with a label and, where useful, an icon or dot.
- Empty states provide one concrete next step without requiring decorative illustration or a framed card.

## Do's and Don'ts

- Do use semantic tokens and the existing Base UI or shadcn primitives.
- Do separate sections with whitespace, alignment, or tonal surfaces before adding a border.
- Do retain explicit control boundaries, visible focus, keyboard behavior, safe touch targets, and resilient content handling.
- Do verify mobile, laptop, and ultra-wide layouts, plus sparse, dense, loading, empty, and error states.
- Don't introduce another accent hue, decorative gradients, glow effects, glass effects, or gradient-filled cards.
- Don't put a border around every group, row, or nested surface.
- Don't apply the same radius or elevation to every element.
- Don't reduce text, control, or focus contrast to make the interface quieter.
- Don't use `transition: all` or animate layout properties; reduced-motion preferences must disable nonessential motion.
