"""Email service using Resend for sending verification codes."""

from app.config import settings


def send_verification_email(to_email: str, code: str) -> None:
    """Send a verification code email via Resend."""
    if not settings.RESEND_API_KEY:
        print(f"[DEV] Verification code for {to_email}: {code}")
        return

    import resend
    resend.api_key = settings.RESEND_API_KEY

    resend.Emails.send({
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
