"""
Email service for Aapat Setu.
Uses FastAPI-Mail if configured; gracefully disables (returns False) when SMTP
variables are missing so the platform works without email during local dev/demo.

Configure in backend/.env:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your@email.com
    SMTP_PASSWORD=app-password
    SMTP_FROM="Aapat Setu <no-reply@aapatsetu.app>"
    SMTP_TLS=true
    ALERT_EMAIL_TO=ops@aapatsetu.app   # comma-separated list for broadcast
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import List, Optional

log = logging.getLogger(__name__)

_configured = False
_fastapi_mail = None
try:
    from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
    _fastapi_mail = (ConnectionConfig, FastMail, MessageSchema, MessageType)
except ImportError:  # pragma: no cover
    ConnectionConfig = FastMail = MessageSchema = MessageType = None


def _get_config() -> Optional["ConnectionConfig"]:
    if not _fastapi_mail:
        return None
    ConnectionConfig, FastMail, MessageSchema, MessageType = _fastapi_mail
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    pwd = os.getenv("SMTP_PASSWORD")
    if not (host and user and pwd):
        return None
    return ConnectionConfig(
        MAIL_USERNAME=user,
        MAIL_PASSWORD=pwd,
        MAIL_FROM=os.getenv("SMTP_FROM", f"Aapat Setu <{user}>"),
        MAIL_PORT=port,
        MAIL_SERVER=host,
        MAIL_STARTTLS=os.getenv("SMTP_TLS", "true").lower() == "true",
        MAIL_SSL_TLS=os.getenv("SMTP_SSL", "false").lower() == "true",
        MAIL_DEBUG=False,
    )


def is_configured() -> bool:
    return _get_config() is not None


def get_alert_recipients() -> List[str]:
    to = os.getenv("ALERT_EMAIL_TO", "")
    if not to:
        return []
    return [x.strip() for x in to.split(",") if x.strip()]


async def send_alert_email(subject: str, body_html: str, recipients: Optional[List[str]] = None) -> bool:
    """Send an email alert. Returns True if sent, False if disabled/failed."""
    if not _fastapi_mail:
        log.info("Email not sent: fastapi-mail not installed")
        return False
    ConnectionConfig, FastMail, MessageSchema, MessageType = _fastapi_mail
    cfg = _get_config()
    if not cfg:
        log.info("Email not sent: SMTP not configured")
        return False
    to = recipients or get_alert_recipients()
    if not to:
        return False
    try:
        message = MessageSchema(
            subject=subject,
            recipients=to,
            body=body_html,
            subtype=MessageType.html,
        )
        fm = FastMail(cfg)
        await fm.send_message(message)
        log.info(f"Alert email sent to {len(to)} recipients: {subject}")
        return True
    except Exception as e:  # pragma: no cover
        log.warning(f"Failed to send alert email: {e}")
        return False


def format_alert_html(incident: dict) -> str:
    """Build a clean HTML email body for an incident alert."""
    sev = (incident.get("ai_severity") or incident.get("severity") or "unknown").upper()
    itype = (incident.get("incident_type") or "incident").replace("_", " ").title()
    summary = incident.get("ai_summary") or incident.get("description") or "No summary available."
    loc = f"{incident.get('lat',0):.4f}, {incident.get('lng',0):.4f}"
    ets = incident.get("eta_minutes")
    victims = incident.get("ai_estimated_victims")
    return f"""
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:600px; margin:0 auto; border:1px solid #fecaca; border-radius:14px; overflow:hidden;">
      <div style="background:#dc2626; padding:20px; color:#fff;">
        <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; opacity:.9;">🚨 Aapat Setu Emergency Alert</div>
        <h1 style="margin:8px 0 0; font-size:22px;">{itype} · {sev}</h1>
      </div>
      <div style="padding:22px; background:#fff; color:#0f172a;">
        <p style="font-size:15px; line-height:1.55; margin:0 0 16px;">{summary}</p>
        <table width="100%" cellpadding="6" style="border-collapse:collapse; font-size:13px; color:#334155;">
          <tr><td style="color:#64748b;width:120px;">Severity</td><td><b>{sev}</b></td></tr>
          <tr><td style="color:#64748b;">Location</td><td>{loc}</td></tr>
          {f'<tr><td style="color:#64748b;">ETA</td><td>{ets} min</td></tr>' if ets else ''}
          {f'<tr><td style="color:#64748b;">Est. victims</td><td>{victims}</td></tr>' if victims is not None else ''}
        </table>
        <p style="margin-top:18px; font-size:12px; color:#94a3b8;">
          This message was sent automatically by the Aapat Setu AI triage engine.
        </p>
      </div>
    </div>
    """
