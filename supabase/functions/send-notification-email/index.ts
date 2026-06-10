// ============================================================================
// Maths Tasks — per-notification email function.
// Invoked once per row inserted into public.notifications, via the
// trg_email_notification trigger (pg_net http_post — see migration 0008).
// It looks up the recipient's email and sends them the notification by email
// through Resend, so every in-app notification also lands in their inbox.
//
// 'reminder' notifications are intentionally skipped: send-reminders already
// emails those, and double-handling them here would send two emails.
// Runs with the service-role key (injected by Supabase), so it bypasses RLS.
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  renderEmail,
  type BadgeTone,
} from "../_shared/email.ts";

interface NotificationPayload {
  recipient_id?: string;
  type?: string;
  assignment_id?: string | null;
  body?: string;
  // Supabase DB-webhook shape, in case it's wired that way instead.
  record?: NotificationPayload;
}

// Presentation per notification type: the inbox subject, the in-card headline,
// the mascot mood, and a category pill. The notification's own `body` is the
// message itself.
interface TypeMeta {
  subject: string;
  heading: string;

  badge: { label: string; tone: BadgeTone };
}

const META: Record<string, TypeMeta> = {
  assignment_created: {
    subject: "New assignment from your tutor",
    heading: "You have a new assignment",
    badge: { label: "Assignment", tone: "info" },
  },
  tutor_comment: {
    subject: "Your tutor left a comment",
    heading: "Your tutor left a comment",
    badge: { label: "Comment", tone: "info" },
  },
  student_comment: {
    subject: "New comment from your student",
    heading: "New comment from your student",
    badge: { label: "Comment", tone: "info" },
  },
  submission_updated: {
    subject: "A student updated their work",
    heading: "A student updated their work",
    badge: { label: "Update", tone: "info" },
  },
  homework_requested: {
    subject: "A student requested more practice",
    heading: "A student wants more practice",
    badge: { label: "Request", tone: "info" },
  },
  work_approved: {
    subject: "Your work was approved",
    heading: "Nice work — approved! ",
    badge: { label: "Approved", tone: "success" },
  },
  work_returned: {
    subject: "Your tutor asked for changes",
    heading: "Your tutor asked for changes",
    badge: { label: "Needs changes", tone: "warning" },
  },
};

const FALLBACK_META: TypeMeta = {
  subject: "New notification",
  heading: "You have a new notification",
  badge: { label: "Update", tone: "info" },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail =
    Deno.env.get("RESEND_FROM_EMAIL") ?? "Maths Tasks <onboarding@resend.dev>";
  // Absolute origin for the "open" link in the email (no trailing slash).
  const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");

  let payload: NotificationPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid body" }, 400);
  }

  const n = payload.record ?? payload;
  const recipientId = n.recipient_id;
  const type = String(n.type ?? "");
  const assignmentId = n.assignment_id ?? null;
  const text = String(n.body ?? "");

  if (!recipientId) return jsonResponse({ error: "Missing recipient_id" }, 400);
  // send-reminders owns the email for reminders.
  if (type === "reminder") return jsonResponse({ ok: true, skipped: "reminder" });

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", recipientId)
    .single();

  if (!profile?.email) return jsonResponse({ ok: true, skipped: "no email" });
  if (!resendKey) return jsonResponse({ ok: true, skipped: "no resend key" });

  // Deep-link to the relevant page when we know the origin. Assignment-scoped
  // notifications open the assignment; otherwise the role's home.
  let link = siteUrl;
  if (siteUrl) {
    const base = profile.role === "tutor" ? "/tutor" : "/student";
    link =
      assignmentId && type !== "homework_requested"
        ? `${siteUrl}${base}/assignments/${assignmentId}`
        : `${siteUrl}${base}`;
  }

  const meta = META[type] ?? FALLBACK_META;
  const html = renderEmail({
    recipientName: profile.full_name,
    heading: meta.heading,
    body: text,
    badge: meta.badge,
    preheader: text,
    ctaLabel: link ? "Open Maths Tasks" : undefined,
    ctaUrl: link || undefined,
    siteUrl,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: profile.email,
        subject: meta.subject,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend error", res.status, detail);
      return jsonResponse({ error: "Resend failed", status: res.status }, 502);
    }
  } catch (e) {
    console.error("Resend request failed", e);
    return jsonResponse({ error: "Resend request failed" }, 502);
  }

  return jsonResponse({ ok: true, to: profile.email, type });
});
