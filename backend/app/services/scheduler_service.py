from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.email_services import send_daily_motivation_email

def job_send_daily_emails():
    print("\n⏰ RUNNING DAILY EMAIL SCHEDULER...")
    
    # Yahan hum apne database se un sabhi bacho ki list nikalenge jinhone roadmap banaya hai
    # Aur un sab par ek for loop laga kar unhe mail bhejenge
    
    print("✅ All daily emails processed!\n")

# Yeh humara main scheduler object hai
scheduler = AsyncIOScheduler()

def start_scheduler():
    # Abhi hum isko set karenge ki yeh har din subah 9:00 AM par chale
    # Testing ke liye hum isko 'har 1 minute' par bhi set kar sakte hain
    scheduler.add_job(job_send_daily_emails, 'cron', hour=9, minute=0)
    scheduler.start()
    print("🚀 Background Email Scheduler Started!")