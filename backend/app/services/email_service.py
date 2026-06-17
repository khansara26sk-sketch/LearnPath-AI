import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 🔥 TUMHARI DETAILS YAHAN HAIN 🔥
SENDER_EMAIL = "email@gmail.com" 
APP_PASSWORD = "abcd efgh ijkl" 

# ---------------------------------------------------------
# FUNCTION 1: Daily Motivation Email
# ---------------------------------------------------------
def send_daily_motivation_email(receiver_email: str, user_name: str = "Student"):
    message = MIMEMultipart("alternative")
    message["Subject"] = "🚀 Keep Up the Great Work! - LearnPath AI"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Hi {user_name}! 👋</h2>
        <p>Thank you for logging into <b>LearnPath AI</b>.</p>
        <p>Aapki learning journey aapka wait kar rahi hai. Apne roadmap ko follow karte rahein aur naye concepts seekhte rahein!</p>
        <br>
        <p>Keep coding and keep growing,</p>
        <p><b>LearnPath AI Team</b></p>
      </body>
    </html>
    """
    
    part = MIMEText(html_content, "html")
    message.attach(part)

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        server.quit()
        print(f"✅ Motivation Email successfully sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send motivation email to {receiver_email}. Error: {e}")
        return False

# ---------------------------------------------------------
# FUNCTION 2: Login Alert Email (NAYA 🔥)
# ---------------------------------------------------------
def send_login_alert_email(receiver_email: str, user_name: str = "Student"):
    message = MIMEMultipart("alternative")
    message["Subject"] = "🔐 Security Alert: New Login to LearnPath AI"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Hi {user_name},</h2>
        <p>Humne notice kiya hai ki aapne abhi <b>LearnPath AI</b> par naya login kiya hai.</p>
        <p>Agar yeh aapne kiya hai, toh aapko kuch karne ki zaroorat nahi hai. Happy Learning! 🚀</p>
        <br>
        <p>Agar yeh aapne nahi kiya, toh kripya apne account ki security check karein.</p>
        <p>Regards,</p>
        <p><b>LearnPath AI Security Team</b></p>
      </body>
    </html>
    """
    
    part = MIMEText(html_content, "html")
    message.attach(part)

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        server.quit()
        print(f"✅ Login Alert Email successfully sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send login email. Error: {e}")
        return False


# Sirf Testing ke liye
if __name__ == "__main__":
    print("⏳ Testing Email Services...")
    
    # Test 1
    print("\n--- Testing Motivation Email ---")
    send_daily_motivation_email("educationg26@gmail.com", "Pratibha")
    
    # Test 2
    print("\n--- Testing Login Alert Email ---")
    send_login_alert_email("educationg26@gmail.com", "Pratibha")