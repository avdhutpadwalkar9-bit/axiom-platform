"""Email service using Resend for sending verification codes."""

import traceback
from app.config import settings


def send_verification_email(to_email: str, code: str) -> bool:
    """Send a verification code email via Resend. Returns True if sent successfully."""
    if not settings.RESEND_API_KEY:
        print(f"[DEV] No RESEND_API_KEY set. Verification code for {to_email}: {code}")
        return False

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        result = resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to_email],
            "subject": f"Your CortexCFO verification code: {code}",
            "text": (
                f"Hi,\n\n"
                f"Your verification code is: {code}\n\n"
                f"Enter this code to verify your email and access CortexCFO.\n"
                f"This code expires in {settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutes.\n\n"
                f"If you did not sign up for CortexCFO, please ignore this email.\n\n"
                f"Thanks,\n"
                f"CortexCFO Team"
            ),
        })
        print(f"[EMAIL] Sent verification to {to_email}. Resend response: {result}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
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
