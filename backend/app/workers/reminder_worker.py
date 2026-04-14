from __future__ import annotations

from datetime import datetime, timezone

from apscheduler.schedulers.blocking import BlockingScheduler
from sqlalchemy import select

from app.db.models import Reminder
from app.db.session import SessionLocal
from app.services.redis_bus import publish_notification


def dispatch_due_reminders() -> None:
    with SessionLocal() as db:
        now = datetime.now(timezone.utc)
        reminders = db.scalars(select(Reminder).where(Reminder.status == "pending", Reminder.remind_at <= now)).all()
        for reminder in reminders:
            reminder.status = "sent"
            db.add(reminder)
            publish_notification(
                {
                    "type": "reminder",
                    "user_id": str(reminder.user_id),
                    "reminder_id": str(reminder.id),
                    "title": reminder.title,
                    "remind_at": reminder.remind_at.isoformat(),
                }
            )
        db.commit()


def main() -> None:
    scheduler = BlockingScheduler()
    scheduler.add_job(dispatch_due_reminders, "interval", minutes=1)
    scheduler.start()


if __name__ == "__main__":
    main()

