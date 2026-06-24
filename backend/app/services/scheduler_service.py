from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.email_service import send_daily_motivation_email
from app.database.connection import get_database

async def job_send_daily_emails():
    print("\n⏰ RUNNING DAILY EMAIL SCHEDULER...")

    try:
        db = get_database()

        users = await db.roadmaps.distinct("user_email")

        for email in users:
            try:
                await send_daily_motivation_email(email)

                print(f"✅ Email sent to {email}")

            except Exception as e:
                print(f"❌ Failed for {email}: {e}")

        print("✅ All daily emails processed!\n")

    except Exception as e:
        print(f"Scheduler Error: {e}")

scheduler = AsyncIOScheduler()

def start_scheduler():
    scheduler.add_job(
        job_send_daily_emails,
        "cron",
        hour=9,
        minute=0,
    )

    scheduler.start()

    print("🚀 Background Email Scheduler Started!")