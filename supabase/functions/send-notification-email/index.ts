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

interface NotificationPayload {
  recipient_id?: string;
  type?: string;
  assignment_id?: string | null;
  body?: string;
  // Supabase DB-webhook shape, in case it's wired that way instead.
  record?: NotificationPayload;
}

// Subject line per notification type. The notification's own `body` is the
// email content; this is just the inbox-facing headline.
const SUBJECTS: Record<string, string> = {
  assignment_created: "New assignment from your tutor",
  tutor_comment: "Your tutor left a comment",
  student_comment: "New comment from your student",
  submission_updated: "A student updated their work",
  homework_requested: "A student requested more homework",
  work_approved: "Your work was approved",
  work_returned: "Your tutor asked for changes",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const subject = SUBJECTS[type] ?? "New notification";
  const html =
    `<p>Hi ${escapeHtml(profile.full_name || "there")},</p>` +
    `<p>${escapeHtml(text)}</p>` +
    (link ? `<p><a href="${link}">Open Maths Tasks</a></p>` : "");

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
        subject,
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
