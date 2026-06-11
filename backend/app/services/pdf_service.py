from io import BytesIO
import json
import re

from pypdf import PdfReader

from app.services.groq_service import GroqService


class PDFService:
    def __init__(self, groq: GroqService):
        self.groq = groq

    def extract_pdf_text(self, pdf_bytes: bytes) -> str:
        try:
            reader = PdfReader(BytesIO(pdf_bytes))

            text = ""

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                return "No readable text found in this PDF."

            return text[:15000]

        except Exception as exc:
            return f"Could not read this PDF file. Error: {exc}"

    async def generate_summary(self, pdf_bytes: bytes):
        text = self.extract_pdf_text(pdf_bytes)

        prompt = f"""
Summarize the following document clearly.

{text}
"""

        return await self.groq.generate_text(prompt)

    async def generate_notes(self, pdf_bytes: bytes):
        text = self.extract_pdf_text(pdf_bytes)

        prompt = f"""
Create well-structured study notes from this document.

Include:
- Main topics
- Important points
- Key definitions
- Exam revision notes

Document:

{text}
"""

        return await self.groq.generate_text(prompt)

    async def generate_mcqs(self, pdf_bytes: bytes):
        text = self.extract_pdf_text(pdf_bytes)

        prompt = f"""
Generate 15 multiple-choice questions from this document.

Provide:
Question
A
B
C
D
Correct Answer

Document:

{text}
"""

        return await self.groq.generate_text(prompt)

    async def generate_quiz(self, pdf_bytes: bytes):
        text = self.extract_pdf_text(pdf_bytes)

        prompt = f"""
Create 10 MCQ quiz questions from this PDF content.

Return ONLY valid JSON in this exact format:

{{
  "title": "PDF Generated Quiz",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "category": "PDF Quiz"
    }}
  ]
}}

Rules:
- correct must be the index number of the right option: 0, 1, 2, or 3
- options must always contain exactly 4 options
- return valid JSON only
- no markdown
- no explanation

PDF Content:
{text}
"""

        response = await self.groq.generate_text(prompt)

        cleaned = response.strip()
        cleaned = re.sub(r"```json", "", cleaned)
        cleaned = re.sub(r"```", "", cleaned).strip()

        try:
            data = json.loads(cleaned)

            if "questions" not in data:
                return {
                    "title": "PDF Generated Quiz",
                    "questions": [],
                }

            return data

        except Exception as exc:
            print("QUIZ JSON PARSE ERROR:", exc)
            print("RAW GROQ RESPONSE:", response)

            return {
                "title": "PDF Generated Quiz",
                "questions": [],
            }

    async def generate_flashcards(self, pdf_bytes: bytes):
        text = self.extract_pdf_text(pdf_bytes)

        prompt = f"""
Generate flashcards.

Format:

Q:
A:

Document:

{text}
"""

        return await self.groq.generate_text(prompt)