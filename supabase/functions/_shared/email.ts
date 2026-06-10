// ============================================================================
// Shared email rendering for Maths Tasks.
//
// A single, polished, responsive HTML template used by every transactional
// email (per-notification + reminders). Built table-first with inline styles
// so it renders consistently across Gmail, Apple Mail, and Outlook.
//
// The "Manta" mascot is served from the app's /public/mascot folder. Emails
// reference the PNG renders (manta-*.png) rather than the SVGs, because Gmail
// and Outlook don't render SVG <img>; PNG is universally supported. The
// wordmark + alt text still carry the brand if images are blocked.
//
// `_shared` is underscore-prefixed, so Supabase does NOT deploy it as its own
// function — it's imported by the real functions via `../_shared/email.ts`.
// ============================================================================

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type MascotPose =
  | "glide"
  | "wave"
  | "cheer"
  | "sleep"
  | "dive"
  | "peek";

export type BadgeTone = "info" | "success" | "warning";

export interface EmailOptions {
  /** Recipient's display name; falls back to a neutral greeting. */
  recipientName?: string;
  /** Big headline inside the card. */
  heading: string;
  /** Main message. Plain text — it is escaped and newline-aware. */
  body: string;
  /** Optional call-to-action button. */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Small pill above the heading (e.g. the notification category). */
  badge?: { label: string; tone: BadgeTone };
  /** Mascot mood shown in the header. */
  pose?: MascotPose;
  /** Hidden inbox preview text. */
  preheader?: string;
  /** Absolute site origin (no trailing slash) for assets + footer links. */
  siteUrl?: string;
}

// Palette mirrors the in-app OpenAI-inspired light theme.
const C = {
  bg: "#F4F5F7",
  card: "#FFFFFF",
  border: "#E5E7EB",
  ink: "#111827",
  muted: "#6B7280",
  faint: "#9CA3AF",
  primary: "#2563EB",
  primaryInk: "#FFFFFF",
};

const BADGE: Record<BadgeTone, { bg: string; fg: string }> = {
  info: { bg: "#DBEAFE", fg: "#1D4ED8" },
  success: { bg: "#D1FAE5", fg: "#047857" },
  warning: { bg: "#FEF3C7", fg: "#B45309" },
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Renders the full HTML document for one transactional email. */
export function renderEmail(opts: EmailOptions): string {
  const {
    recipientName,
    heading,
    body,
    ctaLabel,
    ctaUrl,
    badge,
    pose = "glide",
    preheader,
    siteUrl = "",
  } = opts;

  const name = (recipientName || "there").trim();
  const bodyHtml = escapeHtml(body).replace(/\n/g, "<br/>");
  const mascotSrc = siteUrl ? `${siteUrl}/mascot/manta-${pose}.png` : "";

  const badgeHtml = badge
    ? `<tr><td style="padding:0 0 14px;">
         <span style="display:inline-block;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${BADGE[badge.tone].fg};background:${BADGE[badge.tone].bg};border-radius:999px;padding:5px 12px;">${escapeHtml(badge.label)}</span>
       </td></tr>`
    : "";

  // Bulletproof, centered CTA button (table-based for Outlook).
  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<tr><td style="padding:28px 0 4px;">
           <table role="presentation" cellpadding="0" cellspacing="0" border="0">
             <tr><td style="border-radius:10px;background:${C.primary};">
               <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:15px;font-weight:600;color:${C.primaryInk};text-decoration:none;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
             </td></tr>
           </table>
         </td></tr>`
      : "";

  const mascotHtml = mascotSrc
    ? `<img src="${mascotSrc}" width="64" alt="Manta the manta ray" style="display:block;width:64px;height:auto;border:0;outline:none;" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

        <!-- Brand header -->
        <tr>
          <td style="padding:4px 8px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">${mascotHtml}</td>
                <td style="vertical-align:middle;font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:-.01em;color:${C.ink};">
                  Maths<span style="color:${C.primary};">Tasks</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:36px 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${badgeHtml}
              <tr>
                <td style="font-family:${FONT};font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-.01em;color:${C.ink};padding-bottom:14px;">
                  ${escapeHtml(heading)}
                </td>
              </tr>
              <tr>
                <td style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.muted};">
                  <p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
                  <p style="margin:0;color:${C.ink};">${bodyHtml}</p>
                </td>
              </tr>
              ${ctaHtml}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 12px 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.faint};">
            You're receiving this because you have a Maths&nbsp;Tasks account.
            ${siteUrl ? `<br/><a href="${siteUrl}" style="color:${C.faint};text-decoration:underline;">Open Maths Tasks</a>` : ""}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
