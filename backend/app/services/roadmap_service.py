from uuid import uuid4

from app.config import get_settings
from app.models.roadmap import RoadmapMilestone, RoadmapRequest, RoadmapResponse
from app.services.groq_service import GroqService



class RoadmapService:
    def __init__(self, groq: GroqService) -> None:
        self.settings = get_settings()
        self.groq = groq

    def _mock_roadmap(self, payload: RoadmapRequest) -> RoadmapResponse:
        focus = payload.weak_topics or [f"{payload.subject} fundamentals"]
        milestones = []

        for week in range(1, payload.duration_weeks + 1):
            topic_slice = focus[(week - 1) % len(focus) : week % len(focus) + 1] or focus[:1]
            milestones.append(
                RoadmapMilestone(
                    week=week,
                    title=f"Week {week}: Build mastery",
                    topics=topic_slice,
                    resources=[
                        f"Video lessons — {payload.subject}",
                        "Practice worksheet (15 questions)",
                        "Quick recap flashcards",
                    ],
                    estimated_hours=5 + (week % 3),
                )
            )

        return RoadmapResponse(
            user_id=payload.user_id,
            subject=payload.subject,
            roadmap_id=str(uuid4()),
            title=f"Personalized {payload.subject} Learning Path",
            milestones=milestones,
            focus_areas=focus,
            ai_mode="mock",
        )

    async def generate_roadmap(self, payload: RoadmapRequest) -> RoadmapResponse:
        if not self.settings.groq_enabled:
            return self._mock_roadmap(payload)

        prompt = (
            f"Create a {payload.duration_weeks}-week study roadmap. "
            f"Subject: {payload.subject}. Weak topics: {payload.weak_topics}. "
            f"Goal: {payload.learning_goal or 'General improvement'}. "
            "Return JSON with keys: title, focus_areas (list), milestones "
            "(list of week, title, topics, resources, estimated_hours)."
        )
        data = await self.groq.generate_json(prompt, "You are a curriculum designer for K-12 and college learners.")
        milestones = [RoadmapMilestone(**m) for m in data.get("milestones", [])]

        return RoadmapResponse(
            user_id=payload.user_id,
            subject=payload.subject,
            roadmap_id=str(uuid4()),
            title=data.get("title", f"Personalized {payload.subject} Learning Path"),
            milestones=milestones or self._mock_roadmap(payload).milestones,
            focus_areas=data.get("focus_areas", payload.weak_topics),
            ai_mode="groq",
        )
