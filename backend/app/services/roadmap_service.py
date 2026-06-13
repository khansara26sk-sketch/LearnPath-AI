import json
import re
from datetime import datetime, timezone
from uuid import uuid4

from app.config import get_settings
from app.database.connection import get_database
from app.models.roadmap import (
    RoadmapMilestone,
    RoadmapRequest,
    RoadmapResponse,
)
from app.services.groq_service import GroqService


class RoadmapService:
    def __init__(self, groq: GroqService) -> None:
        self.settings = get_settings()
        self.groq = groq
        self.roadmap_collection = "roadmaps"
        self.progress_collection = "roadmap_progress"

    def _get_goal(self, payload: RoadmapRequest) -> str:
        return (
            payload.goal
            or payload.learning_goal
            or payload.subject
            or "General Learning"
        )

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

    async def save_roadmap(self, roadmap: RoadmapResponse) -> None:
        db = get_database()
        now = datetime.now(timezone.utc)

        print("\n========== SAVING ROADMAP ==========")
        print("USER ID:", roadmap.user_id)
        print("ROADMAP ID:", roadmap.roadmap_id)
        print("TITLE:", roadmap.title)
        print("COLLECTION:", self.roadmap_collection)
        print("====================================\n")

        result = await db[self.roadmap_collection].update_one(
            {"roadmap_id": roadmap.roadmap_id},
            {
                "$set": {
                    "roadmap_id": roadmap.roadmap_id,
                    "user_id": roadmap.user_id,
                    "subject": roadmap.subject,
                    "title": roadmap.title,
                    "milestones": [
                        milestone.model_dump()
                        for milestone in roadmap.milestones
                    ],
                    "focus_areas": roadmap.focus_areas,
                    "ai_mode": roadmap.ai_mode,
                    "goal": roadmap.goal,
                    "level": roadmap.level,
                    "purpose": roadmap.purpose,
                    "weekly_hours": roadmap.weekly_hours,
                    "updated_at": now,
                },
                "$setOnInsert": {
                    "created_at": now,
                },
            },
            upsert=True,
        )

        print("\n========== ROADMAP SAVE RESULT ==========")
        print("MATCHED:", result.matched_count)
        print("MODIFIED:", result.modified_count)
        print("UPSERTED ID:", result.upserted_id)
        print("=========================================\n")

    def _mock_roadmap(self, payload: RoadmapRequest) -> RoadmapResponse:
        goal = self._get_goal(payload)

        focus = payload.weak_topics or [
            f"{goal} fundamentals",
            "Core concepts",
            "Practice and revision",
        ]

        milestones = []

        for week in range(1, payload.duration_weeks + 1):
            topic = focus[(week - 1) % len(focus)]

            milestones.append(
                RoadmapMilestone(
                    week=week,
                    title=f"Week {week}: {topic}",
                    topics=[
                        topic,
                        "Concept building",
                        "Practice questions",
                        "Revision",
                    ],
                    resources=[
                        "NCERT / textbook chapter",
                        "Video lessons",
                        "Practice worksheet",
                        "Previous year questions",
                    ],
                    estimated_hours=payload.weekly_hours,
                    tasks=[
                        "Study concepts",
                        "Make short notes",
                        "Solve practice questions",
                        "Revise mistakes",
                    ],
                    project=(
                        "Mini test / practice set"
                        if payload.purpose in [
                            "School Exam",
                            "Competitive Exam",
                        ]
                        else "Mini project"
                    ),
                )
            )

        return RoadmapResponse(
            user_id=payload.user_id,
            subject=payload.subject,
            roadmap_id=str(uuid4()),
            title=f"{goal} Roadmap",
            milestones=milestones,
            focus_areas=focus,
            ai_mode="mock",
            goal=goal,
            level=payload.level,
            purpose=payload.purpose,
            weekly_hours=payload.weekly_hours,
        )

    async def _create_initial_progress(
        self,
        user_id: str,
        roadmap_id: str,
        total_weeks: int,
    ) -> dict:
        db = get_database()
        now = datetime.now(timezone.utc)

        weeks = []

        for week in range(1, total_weeks + 1):
            weeks.append(
                {
                    "week": week,
                    "status": "in-progress" if week == 1 else "locked",
                    "completed_at": None,
                }
            )

        progress_doc = {
            "user_id": user_id,
            "roadmap_id": roadmap_id,
            "total_weeks": total_weeks,
            "current_week": 1,
            "completed_weeks": [],
            "weeks": weeks,
            "created_at": now,
            "updated_at": now,
        }

        await db[self.progress_collection].update_one(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
            },
            {
                "$setOnInsert": progress_doc,
            },
            upsert=True,
        )

        return progress_doc

    async def initialize_progress(
        self,
        user_id: str,
        roadmap_id: str,
        total_weeks: int,
    ) -> dict:
        existing = await self.get_progress(
            user_id=user_id,
            roadmap_id=roadmap_id,
        )

        if existing.get("found"):
            return existing

        progress = await self._create_initial_progress(
            user_id=user_id,
            roadmap_id=roadmap_id,
            total_weeks=total_weeks,
        )

        return {
            "success": True,
            "found": True,
            "progress": progress,
        }

    async def get_progress(
        self,
        user_id: str,
        roadmap_id: str,
    ) -> dict:
        db = get_database()

        progress = await db[self.progress_collection].find_one(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
            },
            {"_id": 0},
        )

        if not progress:
            return {
                "success": True,
                "found": False,
                "progress": None,
            }

        return {
            "success": True,
            "found": True,
            "progress": progress,
        }

    async def complete_week(
        self,
        user_id: str,
        roadmap_id: str,
        week: int,
    ) -> dict:
        db = get_database()
        now = datetime.now(timezone.utc)

        progress_response = await self.get_progress(
            user_id=user_id,
            roadmap_id=roadmap_id,
        )

        if not progress_response.get("found"):
            return {
                "success": False,
                "message": "Progress not found.",
            }

        progress = progress_response["progress"]
        total_weeks = progress.get("total_weeks", 0)

        if week < 1 or week > total_weeks:
            return {
                "success": False,
                "message": "Invalid week number.",
            }

        weeks = progress.get("weeks", [])
        completed_weeks = set(progress.get("completed_weeks", []))

        updated_weeks = []

        for item in weeks:
            item_week = item["week"]

            if item_week == week:
                item["status"] = "completed"
                item["completed_at"] = now

            if item_week == week + 1 and item["status"] != "completed":
                item["status"] = "in-progress"

            updated_weeks.append(item)

        completed_weeks.add(week)

        next_week = week + 1
        current_week = next_week if next_week <= total_weeks else total_weeks

        await db[self.progress_collection].update_one(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
            },
            {
                "$set": {
                    "weeks": updated_weeks,
                    "completed_weeks": sorted(list(completed_weeks)),
                    "current_week": current_week,
                    "updated_at": now,
                }
            },
        )

        updated = await self.get_progress(
            user_id=user_id,
            roadmap_id=roadmap_id,
        )

        return {
            "success": True,
            "message": f"Week {week} marked as completed.",
            "progress": updated.get("progress"),
        }

    async def get_user_roadmaps(self, user_id: str) -> dict:
        db = get_database()

        roadmaps = (
            await db[self.roadmap_collection]
            .find({"user_id": user_id}, {"_id": 0})
            .sort("created_at", -1)
            .to_list(100)
        )

        return {
            "success": True,
            "user_id": user_id,
            "roadmaps": roadmaps,
        }

    async def get_saved_roadmap(
        self,
        user_id: str,
        roadmap_id: str,
    ) -> dict:
        db = get_database()

        roadmap = await db[self.roadmap_collection].find_one(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
            },
            {"_id": 0},
        )

        progress = await db[self.progress_collection].find_one(
            {
                "user_id": user_id,
                "roadmap_id": roadmap_id,
            },
            {"_id": 0},
        )

        if not roadmap:
            return {
                "success": False,
                "message": "Roadmap not found.",
            }

        return {
            "success": True,
            "roadmap": roadmap,
            "progress": progress,
        }

    async def generate_roadmap(
        self,
        payload: RoadmapRequest,
    ) -> RoadmapResponse:
        if not self.settings.groq_enabled:
            roadmap = self._mock_roadmap(payload)

            await self.save_roadmap(roadmap)

            await self._create_initial_progress(
                user_id=roadmap.user_id,
                roadmap_id=roadmap.roadmap_id,
                total_weeks=len(roadmap.milestones),
            )

            return roadmap

        goal = self._get_goal(payload)

        weak_topics_text = (
            ", ".join(payload.weak_topics)
            if payload.weak_topics
            else "None provided"
        )

        prompt = f"""
Create a personalized learning roadmap.

User Details:
- Goal or Subject: {goal}
- Subject: {payload.subject}
- Purpose: {payload.purpose}
- Level: {payload.level}
- Duration: {payload.duration_weeks} weeks
- Weekly Study Hours: {payload.weekly_hours}
- Weak Topics: {weak_topics_text}

Return ONLY valid JSON in this exact format:

{{
  "title": "Roadmap title here",
  "focus_areas": ["Focus area 1", "Focus area 2"],
  "milestones": [
    {{
      "week": 1,
      "title": "Week 1 title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "resources": ["Resource 1", "Resource 2"],
      "estimated_hours": 10,
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "project": "Practice test, mini project, or revision task"
    }}
  ]
}}

Rules:
- Make exactly {payload.duration_weeks} weekly milestones.
- estimated_hours should match weekly study hours: {payload.weekly_hours}.
- For school subjects, include chapters, revision, textbook practice, and tests.
- For competitive exams like NEET/JEE/CUET/UPSC/SSC, include concepts, PYQs, mocks, revision, and weak-topic practice.
- For college skills like Python/DSA/Web Development/Data Science, include concepts, projects, GitHub practice, and interview prep.
- For career goals, include skill-building, projects, portfolio, and practical tasks.
- Do not return markdown.
- Do not add explanation outside JSON.
"""

        try:
            response = await self.groq.generate_text(
                prompt=prompt,
                system_instruction=(
                    "You are an expert curriculum designer for school, "
                    "college, competitive exams, and career learning. "
                    "Return only valid JSON."
                ),
            )

            data = self._safe_json_parse(response)

            milestones = []

            for item in data.get("milestones", []):
                try:
                    milestones.append(RoadmapMilestone(**item))
                except Exception:
                    continue

            if not milestones:
                roadmap = self._mock_roadmap(payload)

                await self.save_roadmap(roadmap)

                await self._create_initial_progress(
                    user_id=roadmap.user_id,
                    roadmap_id=roadmap.roadmap_id,
                    total_weeks=len(roadmap.milestones),
                )

                return roadmap

            roadmap = RoadmapResponse(
                user_id=payload.user_id,
                subject=payload.subject,
                roadmap_id=str(uuid4()),
                title=data.get("title", f"{goal} Roadmap"),
                milestones=milestones,
                focus_areas=data.get(
                    "focus_areas",
                    payload.weak_topics or [goal],
                ),
                ai_mode="groq",
                goal=goal,
                level=payload.level,
                purpose=payload.purpose,
                weekly_hours=payload.weekly_hours,
            )

            await self.save_roadmap(roadmap)

            await self._create_initial_progress(
                user_id=roadmap.user_id,
                roadmap_id=roadmap.roadmap_id,
                total_weeks=len(roadmap.milestones),
            )

            return roadmap

        except Exception as exc:
            print("\n========== ROADMAP ERROR ==========")
            print(str(exc))
            print("===================================\n")

            roadmap = self._mock_roadmap(payload)

            await self.save_roadmap(roadmap)

            await self._create_initial_progress(
                user_id=roadmap.user_id,
                roadmap_id=roadmap.roadmap_id,
                total_weeks=len(roadmap.milestones),
            )

            return roadmap