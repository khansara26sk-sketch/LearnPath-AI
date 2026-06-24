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
        self.weak_topics_collection = "student_weak_topics"

    def _safe_json_parse(self, text: str) -> dict:
        cleaned = text.strip()
        cleaned = re.sub(r"```json", "", cleaned)
        cleaned = re.sub(r"```", "", cleaned).strip()

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

    def _normalize_topic(self, topic: str) -> str:
        return re.sub(r"\s+", " ", topic.strip().lower())

    def _extract_topics_from_text(self, text: str) -> list[str]:
        if not text:
            return []

        parts = re.split(r",| and | & |\|", text, flags=re.IGNORECASE)
        topics = []

        for part in parts:
            cleaned = self._normalize_topic(part)

            if not cleaned:
                continue

            if len(cleaned) > 60:
                continue

            topics.append(cleaned)

        return topics

    async def generate_topic_quiz(
        self,
        topic: str,
        count: int = 15,
        goal: str | None = None,
        difficulty: str = "Medium",
        class_name: str = "College / University",
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
Education Level / Class: {class_name}
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
- Questions MUST match the topic, goal, education level ({class_name}), and difficulty level ({difficulty}).
- If education level is Class 1-5 or 6-8, keep language simple and age-appropriate.
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
        class_name = payload.get("class_name", "College / University")

        quiz = await self.generate_topic_quiz(
            topic=topic,
            count=count,
            goal=goal,
            difficulty=payload.get("difficulty", "Medium"),
            class_name=class_name,
        )

        quiz["title"] = f"Week {week}: {topic} Quiz" if week else f"{topic} Quiz"

        return quiz

    async def save_weak_topics(
        self,
        user_id: str,
        analysis: QuizAnalysis,
    ) -> None:
        weak_topics_set = set()

        for weak in analysis.weak_topics:
            raw_topic = getattr(weak, "topic", "")
            extracted_topics = self._extract_topics_from_text(raw_topic)

            for topic in extracted_topics:
                weak_topics_set.add(topic)

        weak_topics = sorted(list(weak_topics_set))

        if not weak_topics:
            return

        try:
            db = get_database()

            await db[self.weak_topics_collection].update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "updated_at": datetime.now(timezone.utc),
                    },
                    "$addToSet": {
                        "weak_topics": {
                            "$each": weak_topics,
                        }
                    },
                },
                upsert=True,
            )

            await db["roadmap_progress"].update_many(
                {"user_id": user_id},
                {
                    "$set": {
                        "needs_revision": True,
                        "revision_topics": weak_topics,
                        "revision_updated_at": datetime.now(timezone.utc),
                    }
                },
            )

            print("Weak topics saved:", weak_topics)

        except Exception as exc:
            print("Failed to save weak topics:", exc)

    async def clear_revision_topics(
        self,
        user_id: str,
        revision_topics: list[str],
    ) -> None:
        if not revision_topics:
            return

        db = get_database()

        clean_topics = sorted(
            list(
                {
                    self._normalize_topic(topic)
                    for topic in revision_topics
                    if topic and self._normalize_topic(topic)
                }
            )
        )

        await db[self.weak_topics_collection].update_one(
            {"user_id": user_id},
            {
                "$pull": {
                    "weak_topics": {
                        "$in": clean_topics,
                    }
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                },
            },
        )

        remaining_doc = await db[self.weak_topics_collection].find_one(
            {"user_id": user_id},
            {"_id": 0},
        )

        remaining_topics = []

        if remaining_doc:
            remaining_topics = remaining_doc.get("weak_topics", [])

        if remaining_topics:
            await db["roadmap_progress"].update_many(
                {"user_id": user_id},
                {
                    "$set": {
                        "needs_revision": True,
                        "revision_topics": remaining_topics,
                        "revision_updated_at": datetime.now(timezone.utc),
                    }
                },
            )
        else:
            await db["roadmap_progress"].update_many(
                {"user_id": user_id},
                {
                    "$set": {
                        "needs_revision": False,
                        "revision_topics": [],
                        "revision_updated_at": datetime.now(timezone.utc),
                    }
                },
            )

        print("Revision topics cleared:", clean_topics)

    async def create_auto_roadmap_from_quiz(
        self,
        user_id: str,
        subject: str,
        topic: str,
        analysis: QuizAnalysis,
    ) -> None:
        try:
            db = get_database()

            weak_topics_set = set()

            for weak in analysis.weak_topics:
                raw_topic = getattr(weak, "topic", "")
                extracted_topics = self._extract_topics_from_text(raw_topic)

                for extracted_topic in extracted_topics:
                    weak_topics_set.add(extracted_topic)

            weak_topics = sorted(list(weak_topics_set))

            if not weak_topics:
                return

            existing = await db["roadmaps"].find_one(
                {
                    "user_id": user_id,
                    "auto_generated": True,
                    "source": "quiz_result",
                    "source_topic": topic,
                }
            )

            now = datetime.now(timezone.utc)

            milestones = []

            for index, weak_topic in enumerate(weak_topics[:4], start=1):
                milestones.append(
                    {
                        "week": index,
                        "title": f"Revision Week {index}: {weak_topic.title()}",
                        "topics": [weak_topic],
                        "resources": [
                            f"Revise notes for {weak_topic.title()}",
                            f"Practice MCQs on {weak_topic.title()}",
                            f"Ask AI Tutor doubts on {weak_topic.title()}",
                        ],
                        "estimated_hours": 5,
                        "tasks": [
                            f"Revise core concepts of {weak_topic.title()}",
                            f"Solve 25 questions on {weak_topic.title()}",
                            f"Take a revision quiz on {weak_topic.title()}",
                        ],
                        "project": f"Mini revision test on {weak_topic.title()}",
                    }
                )

            if existing:
                roadmap_id = existing["roadmap_id"]

                await db["roadmaps"].update_one(
                    {"roadmap_id": roadmap_id},
                    {
                        "$set": {
                            "milestones": milestones,
                            "focus_areas": weak_topics,
                            "updated_at": now,
                            "revision_topics": weak_topics,
                        }
                    },
                )

                await db["roadmap_progress"].update_one(
                    {"user_id": user_id, "roadmap_id": roadmap_id},
                    {
                        "$set": {
                            "needs_revision": True,
                            "revision_topics": weak_topics,
                            "updated_at": now,
                            "revision_updated_at": now,
                        }
                    },
                    upsert=True,
                )

                print("Auto roadmap updated from quiz:", roadmap_id)
                return

            roadmap_id = str(uuid4())

            roadmap_doc = {
                "roadmap_id": roadmap_id,
                "user_id": user_id,
                "subject": subject,
                "title": f"Auto Revision Roadmap: {topic}",
                "milestones": milestones,
                "focus_areas": weak_topics,
                "ai_mode": "auto-quiz-analysis",
                "goal": f"Improve weak areas in {topic}",
                "level": "Adaptive",
                "purpose": "Quiz Result Improvement",
                "weekly_hours": 5,
                "created_at": now,
                "updated_at": now,
                "auto_generated": True,
                "source": "quiz_result",
                "source_topic": topic,
                "revision_topics": weak_topics,
            }

            await db["roadmaps"].insert_one(roadmap_doc)

            progress_weeks = []

            for milestone in milestones:
                progress_weeks.append(
                    {
                        "week": milestone["week"],
                        "status": "in-progress"
                        if milestone["week"] == 1
                        else "locked",
                        "completed_at": None,
                    }
                )

            progress_doc = {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
                "total_weeks": len(progress_weeks),
                "weeks": progress_weeks,
                "completed_weeks": [],
                "current_week": 1,
                "needs_revision": True,
                "revision_topics": weak_topics,
                "created_at": now,
                "updated_at": now,
                "revision_updated_at": now,
            }

            await db["roadmap_progress"].insert_one(progress_doc)

            print("Auto roadmap created from quiz:", roadmap_id)

        except Exception as exc:
            print("Failed to create auto roadmap from quiz:", exc)
    async def get_quiz_history(self, user_id: str) -> dict:
        try:
            db = get_database()

            cursor = (
                db[self.collection_name]
                .find({"user_id": user_id}, {"_id": 0})
                .sort("created_at", -1)
                .limit(20)
            )

            submissions = await cursor.to_list(length=20)

            return {
                "success": True,
                "user_id": user_id,
                "history": submissions,
            }

        except Exception as exc:
            return {
            "success": False,
            "user_id": user_id,
            "history": [],
            "error": str(exc),
        }

    async def submit_quiz(
        self,
        payload: QuizSubmissionRequest,
    ) -> QuizSubmissionResponse:
        analysis: QuizAnalysis = await self.analysis.analyze_quiz(
            subject=payload.subject,
            topic=payload.topic,
            answers=payload.answers,
        )

        score = analysis.overall_score
        is_revision_quiz = "," in payload.topic

        if is_revision_quiz and score >= 70:
            revision_topics = self._extract_topics_from_text(payload.topic)

            await self.clear_revision_topics(
                user_id=payload.user_id,
                revision_topics=revision_topics,
            )

        else:
            await self.save_weak_topics(
                user_id=payload.user_id,
                analysis=analysis,
            )

            if score < 70 and analysis.weak_topics:
                await self.create_auto_roadmap_from_quiz(
                    user_id=payload.user_id,
                    subject=payload.subject,
                    topic=payload.topic,
                    analysis=analysis,
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
            "is_revision_quiz": is_revision_quiz,
            "auto_roadmap_checked": True,
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