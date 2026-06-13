import json
import re
from datetime import datetime, timezone
from typing import Any, Dict
from uuid import uuid4

from app.core.exceptions import DatabaseError
from app.database.connection import get_database
from app.models.quiz import (
    QuizAnalysis,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
)
from app.services.analysis_service import AnalysisService


class QuizService:
    def __init__(self, analysis_service: AnalysisService) -> None:
        self.analysis = analysis_service
        self.collection_name = "quiz_submissions"

    def _safe_json_parse(self, text: str) -> dict:
        cleaned = text.strip()
        cleaned = re.sub(r"```json", "", cleaned)
        cleaned = re.sub(r"```", "", cleaned)
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except Exception:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    return {}
            return {}

    def _mock_quiz(self, topic: str, count: int = 15) -> dict:
        questions = []

        for i in range(1, count + 1):
            questions.append(
                {
                    "id": i,
                    "question": f"Sample question {i} on {topic}?",
                    "options": [
                        f"{topic} option A",
                        f"{topic} option B",
                        f"{topic} option C",
                        f"{topic} option D",
                    ],
                    "correct": 0,
                    "category": topic,
                }
            )

        return {
            "title": f"{topic} Quiz",
            "questions": questions,
        }

    async def generate_topic_quiz(
    self,
    topic: str,
    count: int = 15,
    goal: str | None = None,
    difficulty: str = "Medium",
) -> dict:
        if not topic:
            topic = "General Topic"

        count = int(count or 15)

        groq = getattr(self.analysis, "groq", None)

        if groq is None:
            return self._mock_quiz(topic, count)

        prompt = f"""
Generate {count} multiple choice quiz questions.

Topic: {topic}
Difficulty: {difficulty}
Goal/Exam Context: {goal or "General learning"}

Return ONLY valid JSON in this exact format:

{{
  "title": "{topic} Quiz",
  "questions": [
    {{
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "category": "{topic}"
    }}
  ]
}}

Rules:
- Generate exactly {count} questions.
- Each question must have exactly 4 options.
- correct must be index number: 0, 1, 2, or 3.
- Questions should match the topic, goal, and difficulty level: {difficulty}.
- For NEET/JEE/CUET/competitive exams, make questions exam-style.
- For school subjects, make questions student-friendly.
- For coding skills, make concept + practical questions.
- Do not return markdown.
- Do not add explanation outside JSON.
"""

        try:
            response = await groq.generate_text(
                prompt=prompt,
                system_instruction=(
                    "You are an expert quiz creator for school, college, "
                    "competitive exams, and career skills. Return only valid JSON."
                ),
            )

            data = self._safe_json_parse(response)

            questions = data.get("questions", [])

            valid_questions = []

            for index, question in enumerate(questions, start=1):
                options = question.get("options", [])

                if len(options) != 4:
                    continue

                correct = question.get("correct", 0)

                if not isinstance(correct, int) or correct not in [0, 1, 2, 3]:
                    correct = 0

                valid_questions.append(
                    {
                        "id": question.get("id", index),
                        "question": question.get(
                            "question",
                            f"Question {index} on {topic}",
                        ),
                        "options": options,
                        "correct": correct,
                        "category": question.get("category", topic),
                    }
                )

            if not valid_questions:
                return self._mock_quiz(topic, count)

            return {
                "title": data.get("title", f"{topic} Quiz"),
                "questions": valid_questions[:count],
            }

        except Exception as exc:
            print("\n========== QUIZ GENERATION ERROR ==========")
            print(str(exc))
            print("===========================================\n")
            return self._mock_quiz(topic, count)

    async def generate_roadmap_quiz(self, payload: dict) -> dict:
        week = payload.get("week")
        topic = payload.get("topic") or "Roadmap Topic"
        goal = payload.get("goal") or "Learning Roadmap"
        count = payload.get("count", 15)

        quiz = await self.generate_topic_quiz(
            topic=topic,
            count=count,
            goal=goal,
            difficulty=payload.get("difficulty", "Medium"),
        )

        quiz["title"] = f"Week {week}: {topic} Quiz" if week else f"{topic} Quiz"

        return quiz

    async def submit_quiz(
        self,
        payload: QuizSubmissionRequest,
    ) -> QuizSubmissionResponse:
        analysis: QuizAnalysis = await self.analysis.analyze_quiz(
            subject=payload.subject,
            topic=payload.topic,
            answers=payload.answers,
        )

        submission_id = str(uuid4())
        created_at = datetime.now(timezone.utc)

        document: Dict[str, Any] = {
            "_id": submission_id,
            "user_id": payload.user_id,
            "subject": payload.subject,
            "topic": payload.topic,
            "answers": [a.model_dump() for a in payload.answers],
            "time_taken_seconds": payload.time_taken_seconds,
            "analysis": analysis.model_dump(),
            "created_at": created_at,
        }

        try:
            db = get_database()
            await db[self.collection_name].insert_one(document)
        except Exception as exc:
            raise DatabaseError(
                f"Failed to store quiz submission: {exc}"
            ) from exc

        return QuizSubmissionResponse(
            submission_id=submission_id,
            user_id=payload.user_id,
            subject=payload.subject,
            topic=payload.topic,
            analysis=analysis,
            created_at=created_at,
        )