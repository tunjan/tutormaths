import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The design system replaces Tailwind's default font-size scale with its own
// (--text-h1, --text-button-lg, …). tailwind-merge can't infer those, so it
// treats `text-button-lg` as a text *color* and drops any color class before it.
const FONT_SIZES = [
  "display-xl",
  "display-lg",
  "display-md",
  "display-sm",
  "display",
  "page-title",
  "heading-lg",
  "heading-md",
  "section-title",
  "metric",
  "title-lg",
  "title-md",
  "title-sm",
  "h1",
  "h2",
  "h3",
  "h4",
  "label",
  "eyebrow",
  "body-lg",
  "body-sm",
  "body",
  "caption",
  "button-lg",
  "button",
  "code",
  "micro",
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
