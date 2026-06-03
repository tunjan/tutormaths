// ============================================================================
// TutorMaths — scheduled reminder function.
// Invoked by pg_cron on a FIXED interval (e.g. every 15 minutes), NOT per
// assignment. On each run it finds active assignments whose due time has
// entered a reminder window, and for each (assignment, student, window) it has
// not already handled it:
//   1. atomically CLAIMS a row in reminders_sent (the unique constraint is the
//      dedupe guarantee — a claimed window is never processed twice),
//   2. writes an in-app notification, and
//   3. emails the student via Resend.
// Runs with the service-role key (injected by Supabase), so it bypasses RLS.
// ============================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

interface Assignment {
  id: string;
  student_id: string;
  tutor_id: string;
  title: string;
  due_at: string;
  completion_pct: number;
}

const HOUR_MS = 3600 * 1000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatDue(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail =
    Deno.env.get("RESEND_FROM_EMAIL") ?? "TutorMaths <onboarding@resend.dev>";

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = Date.now();

  // Reminder windows (single tutor). Fall back to the documented defaults.
  const { data: settings } = await supabase
    .from("tutor_settings")
    .select("reminder_windows")
    .limit(1)
    .maybeSingle();

  const windows: number[] =
    settings?.reminder_windows && settings.reminder_windows.length > 0
      ? settings.reminder_windows
      : [48, 24, 6];
  const maxWindowMs = Math.max(...windows) * HOUR_MS;

  // Candidates: not completed, still upcoming, due within the largest window.
  const horizon = new Date(now + maxWindowMs).toISOString();
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id, student_id, tutor_id, title, due_at, completion_pct")
    .lt("completion_pct", 100)
    .gt("due_at", new Date(now).toISOString())
    .lte("due_at", horizon);

  if (error) return jsonResponse({ error: error.message }, 500);

  let sent = 0;

  for (const a of (assignments ?? []) as Assignment[]) {
    const due = new Date(a.due_at).getTime();

    for (const w of windows) {
      const threshold = due - w * HOUR_MS;
      if (now < threshold) continue; // window not entered yet

      // Claim the dedupe slot first. A unique violation (23505) means another
      // run already handled this window — skip silently.
      const { error: claimErr } = await supabase.from("reminders_sent").insert({
        assignment_id: a.id,
        student_id: a.student_id,
        window_hours: w,
      });
      if (claimErr) {
        if (claimErr.code !== "23505") {
          console.error("reminders_sent claim failed", claimErr);
        }
        continue;
      }

      const { data: student } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", a.student_id)
        .single();

      const hoursLeft = Math.max(0, Math.round((due - now) / HOUR_MS));
      const body = `Reminder: "${a.title}" is due ${formatDue(a.due_at)} (~${hoursLeft}h left).`;

      // In-app notification (an absent student still gets the email below).
      await supabase.from("notifications").insert({
        recipient_id: a.student_id,
        type: "reminder",
        assignment_id: a.id,
        body,
      });

      // Email via Resend.
      if (resendKey && student?.email) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: student.email,
              subject: `Homework due soon: ${a.title}`,
              html: `<p>Hi ${student.full_name || "there"},</p><p>${body}</p>`,
            }),
          });
          if (!res.ok) {
            console.error("Resend error", res.status, await res.text());
          }
        } catch (e) {
          console.error("Resend request failed", e);
        }
      }

      sent++;
    }
  }

  return jsonResponse({
    ok: true,
    evaluated: assignments?.length ?? 0,
    sent,
  });
});
