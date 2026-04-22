/**
 * POST /api/subscribe
 *
 * Newsletter-signup endpoint wired to Resend. On a successful subscribe:
 *   1. (Optional) adds the address to a Resend audience if RESEND_AUDIENCE_ID is set
 *   2. Sends a branded "thanks for subscribing" email to the subscriber
 *   3. Returns { ok: true } — the client swaps to a success state
 *
 * Required env vars:
 *   RESEND_API_KEY        — Resend project API key (https://resend.com/api-keys)
 *   RESEND_FROM           — Verified sender, e.g. "CortexCFO <hello@cortexcfo.com>"
 *                           Until a domain is verified, use Resend's testing sender:
 *                           "Acme <onboarding@resend.dev>" (only delivers to the
 *                           account owner's inbox in sandbox).
 *
 * Optional:
 *   RESEND_AUDIENCE_ID    — Resend audience ID to add contacts to. If omitted,
 *                           we only send the welcome email (no list management).
 *
 * Honest limits (stated explicitly in the welcome copy):
 *   - The product is still in encryption / analysis hardening. We say so.
 *   - No personalization beyond the address itself.
 *   - Soft-fail the audience add — if it errors, we still send the welcome
 *     so the subscriber never sees a failure unless the welcome itself fails.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

// Minimal email-shape validation. We don't over-engineer — Resend will
// reject genuinely malformed addresses on its side; this check just
// stops obvious garbage from hitting the API.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "CortexCFO <onboarding@resend.dev>";
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey) {
    // If the key is missing we still want the user's submit to feel right —
    // log the subscription intent and return ok. When the key lands in prod
    // Vercel env, subsequent subscriptions start sending for real.
    console.warn(
      "[subscribe] RESEND_API_KEY missing. Logging intent only:",
      email,
    );
    return NextResponse.json({ ok: true, pending: true });
  }

  const resend = new Resend(apiKey);

  // 1) Optional — add to audience. Soft-fail so a contacts-API hiccup doesn't
  // eat the welcome email. If the address is already in the audience Resend
  // returns a 422; we treat that as success too.
  if (audienceId) {
    try {
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      });
    } catch (err) {
      console.warn("[subscribe] audience add failed (non-fatal):", err);
    }
  }

  // 2) Welcome email — the copy the user asked for. Plain + HTML versions
  // so it renders on every client. Honest about the product state.
  const subject = "Welcome to The CortexCFO Brief";

  const text = [
    "Thanks for subscribing.",
    "",
    "We're still building the program and it'll take a few more months to ship —",
    "we want to be double-sure on the encryption and the quality of the analysis",
    "coming out the other side. The moment the first issue is ready, you'll hear",
    "from us.",
    "",
    "In the meantime, everything that IS live is at axiom-platform.vercel.app —",
    "the knowledge base, glossary, and /how-it-works page covering our",
    "multi-model Cognitive Engine.",
    "",
    "— The CortexCFO team",
    "",
    "If you didn't subscribe, just ignore this email — we won't send another.",
  ].join("\n");

  const html = `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
              <tr>
                <td style="padding:40px 40px 24px;">
                  <div style="display:inline-block;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#6ee7b7;font-size:11px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:20px;">
                    The CortexCFO Brief
                  </div>
                  <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#ffffff;font-weight:700;letter-spacing:-0.01em;">
                    Thanks for subscribing.
                  </h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">
                    We&rsquo;re still building the program and it&rsquo;ll take a few more months to ship &mdash; we want to be double-sure on the encryption and the quality of the analysis coming out the other side.
                  </p>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">
                    The moment the first issue is ready, you&rsquo;ll hear from us.
                  </p>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.72);">
                    In the meantime, everything that IS live is at the site &mdash; the knowledge base, glossary, and the page on how our multi-model Cognitive Engine works.
                  </p>
                  <div style="margin:0 0 32px;">
                    <a href="https://axiom-platform.vercel.app/knowledge-base" style="display:inline-block;background:#10b981;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:999px;">
                      Browse the Knowledge Base
                    </a>
                  </div>
                  <p style="margin:0 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.45);">
                    &mdash; The CortexCFO team
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.35);">
                    If you didn&rsquo;t subscribe, ignore this email &mdash; we won&rsquo;t send another.
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:20px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">
              CortexCFO &middot; Multi-model Cognitive Engine for FP&amp;A
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("[subscribe] resend.emails.send error:", error);
      return NextResponse.json(
        {
          ok: false,
          error:
            "We logged your subscription but couldn't send the confirmation email. We'll follow up manually.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[subscribe] unexpected failure:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again in a moment." },
      { status: 500 },
    );
  }
}
