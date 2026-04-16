"""Email service using Resend for sending verification codes."""

import traceback
from app.config import settings


def _build_verification_html(code: str) -> str:
    """Build a branded HTML email matching CortexCFO's theme."""
    digits = "".join(
        f'<td style="width:44px;height:52px;background:#f8f6f3;border:1px solid #e5e5e5;border-radius:8px;text-align:center;font-size:24px;font-weight:700;color:#1a1a1a;font-family:\'SF Mono\',Monaco,Consolas,monospace;letter-spacing:1px;">{d}</td>'
        for d in code
    )

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">

<!-- Main card -->
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

  <!-- Header with brand bar -->
  <tr>
    <td style="background:#059669;padding:28px 40px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;">&#x2197;</span>
                </td>
                <td style="padding-left:10px;">
                  <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.3px;">CortexCFO</span>
                </td>
              </tr>
            </table>
          </td>
          <td align="right">
            <span style="color:rgba(255,255,255,0.7);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Verification</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 20px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a1a;line-height:1.3;">Verify your email</h1>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
        Enter this code to complete your registration and start analyzing your financials with AI-powered insights.
      </p>
    </td>
  </tr>

  <!-- Code box -->
  <tr>
    <td style="padding:8px 40px 28px;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;padding:20px 24px;">
        <tr>
          <td align="center">
            <p style="margin:0 0 12px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;">Your verification code</p>
            <table cellpadding="0" cellspacing="6">
              <tr>{digits}</tr>
            </table>
            <p style="margin:12px 0 0;font-size:12px;color:#bbb;">Expires in {settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutes</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding:0 40px;">
      <div style="border-top:1px solid #f0f0f0;"></div>
    </td>
  </tr>

  <!-- What you get section -->
  <tr>
    <td style="padding:24px 40px 8px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#1a1a1a;">What you unlock with CortexCFO:</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 40px 28px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:20px;height:20px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:20px;">
              <span style="color:#059669;font-size:12px;">&#x2713;</span>
            </div>
          </td>
          <td style="padding:8px 0 8px 8px;">
            <span style="font-size:13px;color:#333;font-weight:500;">AI-Powered Financial Analysis</span>
            <span style="display:block;font-size:12px;color:#999;margin-top:2px;">Upload your Trial Balance, get instant insights</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:20px;height:20px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:20px;">
              <span style="color:#059669;font-size:12px;">&#x2713;</span>
            </div>
          </td>
          <td style="padding:8px 0 8px 8px;">
            <span style="font-size:13px;color:#333;font-weight:500;">Ind AS Compliance Review</span>
            <span style="display:block;font-size:12px;color:#999;margin-top:2px;">Automatic checks against AS 12, 15, 16, 19, 24, 37</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:20px;height:20px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:20px;">
              <span style="color:#059669;font-size:12px;">&#x2713;</span>
            </div>
          </td>
          <td style="padding:8px 0 8px 8px;">
            <span style="font-size:13px;color:#333;font-weight:500;">Industry Benchmarks for 11 Sectors</span>
            <span style="display:block;font-size:12px;color:#999;margin-top:2px;">Compare your KPIs against industry standards</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:20px;height:20px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:20px;">
              <span style="color:#059669;font-size:12px;">&#x2713;</span>
            </div>
          </td>
          <td style="padding:8px 0 8px 8px;">
            <span style="font-size:13px;color:#333;font-weight:500;">Ask AI Anything</span>
            <span style="display:block;font-size:12px;color:#999;margin-top:2px;">Chat with Claude about your financials, get actionable advice</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Security note -->
  <tr>
    <td style="padding:0 40px 28px;">
      <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafafa;border-radius:8px;padding:14px 16px;">
        <tr>
          <td style="vertical-align:top;width:20px;">
            <span style="font-size:13px;">&#x1f512;</span>
          </td>
          <td style="padding-left:8px;">
            <span style="font-size:12px;color:#999;line-height:1.5;">Your financial data is encrypted and never used for AI training. We take security seriously.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#fafafa;padding:20px 40px;border-top:1px solid #f0f0f0;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="font-size:12px;color:#bbb;">CortexCFO Financial Intelligence</span>
          </td>
          <td align="right">
            <span style="font-size:11px;color:#ccc;">If you didn't sign up, ignore this email.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
<!-- /Main card -->

<!-- Bottom text -->
<table width="520" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:20px 0;text-align:center;">
      <span style="font-size:11px;color:#bbb;">AI-powered financial intelligence for Indian businesses</span>
    </td>
  </tr>
</table>

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
"""


def send_verification_email(to_email: str, code: str) -> bool:
    """Send a branded verification code email via Resend."""
    if not settings.RESEND_API_KEY:
        print(f"[DEV] No RESEND_API_KEY set. Verification code for {to_email}: {code}")
        return False

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        html = _build_verification_html(code)

        result = resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to_email],
            "subject": f"Your CortexCFO verification code: {code}",
            "html": html,
            "text": (
                f"Your CortexCFO verification code is: {code}\n\n"
                f"Enter this code to verify your email.\n"
                f"This code expires in {settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutes.\n\n"
                f"If you did not sign up, please ignore this email."
            ),
        })
        print(f"[EMAIL] Sent verification to {to_email}. Resend response: {result}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
        traceback.print_exc()
        return False


def _build_welcome_html(name: str | None) -> str:
    """Warm, founder-signed welcome email sent right after signup."""
    first_name = (name or "").strip().split(" ")[0] if name else ""
    greeting = f"Hi {first_name}," if first_name else "Hi,"

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
<tr><td align="center">

<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

  <!-- Brand strip -->
  <tr>
    <td style="background:#059669;padding:24px 40px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;text-align:center;vertical-align:middle;">
            <span style="color:#ffffff;font-size:16px;font-weight:700;">&#x2197;</span>
          </td>
          <td style="padding-left:10px;">
            <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.3px;">CortexCFO</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 8px;">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;line-height:1.3;">Welcome to CortexCFO</h1>
      <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">{greeting}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
        This is Avdhut, founder of CortexCFO. Thank you for trusting us with your
        financial review workflow &mdash; you&rsquo;re in good company with the founders
        and CFOs running ₹10&ndash;50 Cr businesses across India.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
        CortexCFO replaces the &#8377;6&ndash;15 Lakh Big-4 Quality of Earnings
        engagement with a continuous, AI-native review engine &mdash; every report
        CA-signed, every add-back defensible in diligence, for &#8377;25K/month.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
        Here&rsquo;s how to get the most out of your first week:
      </p>
    </td>
  </tr>

  <!-- Steps -->
  <tr>
    <td style="padding:0 40px 20px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:22px;color:#059669;font-size:12px;font-weight:700;">1</div>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <span style="font-size:13px;color:#1a1a1a;font-weight:600;">Upload your latest Trial Balance</span>
            <span style="display:block;font-size:12px;color:#888;margin-top:3px;">Get a full Ind AS P&amp;L, Balance Sheet, ratios and QoE preview in under 60 seconds.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:22px;color:#059669;font-size:12px;font-weight:700;">2</div>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <span style="font-size:13px;color:#1a1a1a;font-weight:600;">Add last year for variance &amp; common-size</span>
            <span style="display:block;font-size:12px;color:#888;margin-top:3px;">YoY movement, expense drift, working-capital deterioration &mdash; all auto-flagged.</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;background:#ecfdf5;border-radius:6px;text-align:center;line-height:22px;color:#059669;font-size:12px;font-weight:700;">3</div>
          </td>
          <td style="padding:8px 0 8px 10px;">
            <span style="font-size:13px;color:#1a1a1a;font-weight:600;">Export a CA-signed QoE report</span>
            <span style="display:block;font-size:12px;color:#888;margin-top:3px;">Adjusted EBITDA, add-back schedule, compliance matrix &mdash; ready for banks, PE, or acquirers.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:4px 40px 28px;">
      <a href="https://axiom-platform.vercel.app/dashboard"
         style="display:inline-block;background:#10b981;color:#ffffff;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;text-decoration:none;">
        Open your dashboard &rarr;
      </a>
    </td>
  </tr>

  <!-- Signature -->
  <tr>
    <td style="padding:0 40px 28px;">
      <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">
        If you ever get stuck, reply to this email &mdash; it comes straight to me.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#444;line-height:1.6;">
        <span style="font-weight:600;color:#1a1a1a;">Avdhut Padwalkar</span><br/>
        <span style="color:#888;">Founder, CortexCFO</span>
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#fafafa;padding:16px 40px;border-top:1px solid #f0f0f0;">
      <span style="font-size:11px;color:#bbb;">CortexCFO &middot; AI-powered financial intelligence for Indian businesses</span>
    </td>
  </tr>

</table>

</td></tr>
</table>

</body>
</html>
"""


def send_welcome_email(to_email: str, name: str | None = None) -> bool:
    """Send a founder-signed welcome email via Resend.

    Fires right after signup alongside the verification code. Non-fatal: if
    the call fails, we log and continue so signup still succeeds.
    """
    if not settings.RESEND_API_KEY:
        print(f"[DEV] No RESEND_API_KEY set. Would have sent welcome email to {to_email}")
        return False

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        html = _build_welcome_html(name)

        result = resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to_email],
            "subject": "Welcome to CortexCFO",
            "html": html,
            "text": (
                f"Hi {name.split(' ')[0] if name else ''},\n\n"
                f"This is Avdhut, founder of CortexCFO. Thank you for trusting us "
                f"with your financial review workflow.\n\n"
                f"CortexCFO replaces the Rs 6-15 Lakh Big-4 Quality of Earnings "
                f"engagement with a continuous, AI-native review engine - every "
                f"report CA-signed, every add-back defensible, for Rs 25K/month.\n\n"
                f"Open your dashboard: https://axiom-platform.vercel.app/dashboard\n\n"
                f"If you get stuck, reply to this email - it comes straight to me.\n\n"
                f"- Avdhut Padwalkar\n  Founder, CortexCFO"
            ),
        })
        print(f"[EMAIL] Sent welcome to {to_email}. Resend response: {result}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Welcome mail to {to_email} failed: {e}")
        traceback.print_exc()
        return False


def check_resend_configured() -> dict:
    """Check if Resend is properly configured."""
    has_key = bool(settings.RESEND_API_KEY)
    key_preview = settings.RESEND_API_KEY[:8] + "..." if has_key else "NOT SET"
    from_email = settings.FROM_EMAIL
    return {
        "has_key": has_key,
        "key_preview": key_preview,
        "from_email": from_email,
    }
