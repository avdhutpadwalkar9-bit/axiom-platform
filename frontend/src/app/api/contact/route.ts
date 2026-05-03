/**
 * POST /api/contact
 *
 * Contact-form submission endpoint wired to Resend.
 *
 * On a valid submission we send TWO emails in one request:
 *   1. The actual lead → to the founder's inbox (RESEND_CONTACT_TO).
 *      Plain HTML with the four form fields + a reply-to set to the
 *      sender's email so a one-click reply goes back to them.
 *   2. An auto-acknowledgement → to the sender, so they know the
 *      message landed and what happens next.
 *
 * Required env vars:
 *   RESEND_API_KEY      — Resend API key.
 *   RESEND_CONTACT_TO   — destination inbox for new leads (e.g. hello@cortexcfo.com).
 *                         Defaults to RESEND_AUDIENCE_OWNER if unset; ultimately falls
 *                         back to a placeholder so dev environments don't 500.
 *   RESEND_FROM         — verified sender ("CortexCFO <hello@cortexcfo.com>").
 *                         Falls back to "CortexCFO <onboarding@resend.dev>" sandbox.
 *
 * Honest behavior:
 *   - If RESEND_API_KEY is missing we log the submission server-side and
 *     return { ok: true, pending: true } — submitter never sees a 500 just
 *     because env vars are pending. When the key lands, real sending starts.
 *   - The founder-facing lead email is the must-send. The auto-ack to the
 *     sender is a nice-to-have; if it fails we still return ok because the
 *     lead was delivered.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Defensive caps so a malicious/oversized payload can't blow past Resend's limits.
const MAX_NAME = 200;
const MAX_COMPANY = 200;
const MAX_MESSAGE = 5000;

interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let body: ContactPayload = {};
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim().slice(0, MAX_NAME);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 254);
  const company = (body.company ?? "").trim().slice(0, MAX_COMPANY);
  const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE);

  // Field-level validation — surface clear messages back to the form so the
  // user knows exactly what to fix instead of a vague "submission failed".
  if (!name || name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400 },
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (!message || message.length < 10) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please share a little more about how we can help (10+ chars).",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "CortexCFO <onboarding@resend.dev>";
  const to = process.env.RESEND_CONTACT_TO ?? "hello@cortexcfo.com";

  if (!apiKey) {
    // No key configured — log so the submission isn't silently dropped, and
    // return ok so the form UX is consistent across environments.
    console.warn("[contact] RESEND_API_KEY missing. Logging submission only:", {
      name,
      email,
      company,
      message,
    });
    return NextResponse.json({ ok: true, pending: true });
  }

  const resend = new Resend(apiKey);
  const submittedAt = new Date().toISOString();

  // ── 1. Lead email to the founder's inbox ─────────────────────────────
  const leadSubject = `New contact form: ${name}${company ? ` (${company})` : ""}`;
  const leadHtml = `
    <!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
            <tr><td style="padding:28px 32px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="display:inline-block;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#6ee7b7;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border-radius:999px;">New lead · contact form</div>
              <h1 style="margin:14px 0 0;font-size:20px;line-height:1.3;color:#fff;font-weight:600;">${escape(name)}${company ? ` · <span style="color:rgba(255,255,255,0.55);font-weight:400;">${escape(company)}</span>` : ""}</h1>
            </td></tr>
            <tr><td style="padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1.5px;width:90px;vertical-align:top;">Email</td>
                  <td style="padding:6px 0;font-size:14px;color:#fff;"><a href="mailto:${escape(email)}" style="color:#34d399;text-decoration:none;">${escape(email)}</a></td>
                </tr>
                ${
                  company
                    ? `<tr><td style="padding:6px 0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1.5px;vertical-align:top;">Company</td><td style="padding:6px 0;font-size:14px;color:#fff;">${escape(company)}</td></tr>`
                    : ""
                }
                <tr>
                  <td style="padding:6px 0;font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1.5px;vertical-align:top;">Sent</td>
                  <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.65);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escape(submittedAt)}</td>
                </tr>
              </table>
              <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">Message</div>
                <div style="font-size:15px;line-height:1.65;color:rgba(255,255,255,0.92);white-space:pre-wrap;">${escape(message)}</div>
              </div>
            </td></tr>
            <tr><td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.08);background:#0d0d0d;">
              <a href="mailto:${escape(email)}?subject=${encodeURIComponent("Re: " + (company || "your message"))}" style="display:inline-block;background:#10b981;color:#fff;font-size:13px;font-weight:600;text-decoration:none;padding:9px 16px;border-radius:8px;">Reply directly →</a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">CortexCFO contact intake · do not reply to this address</p>
        </td></tr>
      </table>
    </body></html>`;

  const leadText = [
    `New contact form submission`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    company ? `Company: ${company}` : null,
    `Sent:    ${submittedAt}`,
    ``,
    `Message:`,
    message,
    ``,
    `— CortexCFO contact intake`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { error: leadErr } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: leadSubject,
      html: leadHtml,
      text: leadText,
    });

    if (leadErr) {
      console.error("[contact] resend lead-email error:", leadErr);
      return NextResponse.json(
        {
          ok: false,
          error:
            "We couldn't deliver your message right now. Please email us directly at hello@cortexcfo.com.",
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[contact] unexpected lead-email failure:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Something went wrong. Please email us directly at hello@cortexcfo.com.",
      },
      { status: 500 },
    );
  }

  // ── 2. Auto-ack to the sender (best-effort, soft-fail) ───────────────
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: "We got your message — CortexCFO",
      text: [
        `Hi ${name.split(" ")[0]},`,
        ``,
        `Thanks for reaching out to CortexCFO. We've received your message and a real human will respond within 24 hours on business days.`,
        ``,
        `For reference, here's what you sent:`,
        ``,
        message,
        ``,
        `If anything time-sensitive comes up, just reply to this email — it goes straight to our inbox.`,
        ``,
        `— The CortexCFO team`,
      ].join("\n"),
      html: `
        <!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
            <tr><td align="center">
              <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
                <tr><td style="padding:40px 40px 24px;">
                  <div style="display:inline-block;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#6ee7b7;font-size:11px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:20px;">Message received</div>
                  <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;letter-spacing:-0.01em;">Thanks, ${escape(name.split(" ")[0])}.</h1>
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">We&rsquo;ve received your message. A real person will respond within 24 hours on business days.</p>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">If anything time-sensitive comes up, just reply to this email — it goes straight to our inbox.</p>
                  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px 20px;margin:0 0 24px;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.4px;margin-bottom:8px;">Your message</div>
                    <div style="font-size:14px;line-height:1.65;color:rgba(255,255,255,0.85);white-space:pre-wrap;">${escape(message)}</div>
                  </div>
                  <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">— The CortexCFO team</p>
                </td></tr>
              </table>
              <p style="margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">CortexCFO &middot; advisory, not audit</p>
            </td></tr>
          </table>
        </body></html>`,
    });
  } catch (err) {
    // Soft-fail — the lead landed; the auto-ack is a courtesy.
    console.warn("[contact] auto-ack send failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
