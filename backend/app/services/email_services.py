import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_daily_motivation_email(receiver_email: str, user_name: str = "Student"):
    # 🔥 YAHAN APNI DETAILS DAALO 🔥
    SENDER_EMAIL = "your_email@gmail.com" # Apna NAYA Gmail yahan daalo
    # Wo 16-digit ka App Password yahan daalo (spaces hata dena agar ho toh)
    APP_PASSWORD = "abcdefghijklmnop" 

    # Email ka structure
    message = MIMEMultipart("alternative")
    message["Subject"] = "🚀 Keep Up the Great Work! - LearnPath AI"
    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email

    # Email ka HTML Design (Jo bache ko dikhega)
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
        # Gmail ke server se connect karna aur email bhejna
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        server.quit()
        print(f"✅ Email successfully sent to {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {receiver_email}. Error: {e}")
        return False

# Sirf Testing ke liye
if __name__ == "__main__":
    print("⏳ Testing Email Service...")
    # Yahan apna personal/purana email daalo jispe tumhe test mail receive karna hai
    send_daily_motivation_email("educationg26@gmail.com", "Pratibha")