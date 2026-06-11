import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("Loaded key:", api_key[:8] + "..." if api_key else "NOT FOUND")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.0-flash")

response = model.generate_content("Hello")

print(response.text)