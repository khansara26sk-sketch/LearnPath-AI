import asyncio
from app.database.connection import get_database


class DashboardService:
    def __init__(self):
        self.db = get_database()

    async def get_dashboard_stats(self, user_id: str):

        quiz_count_task = self.db["quiz_submissions"].count_documents(
            {"user_id": user_id}
        )

        roadmap_count_task = self.db["roadmap_progress"].count_documents(
            {"user_id": user_id}
        )

        roadmaps_task = (
            self.db["roadmap_progress"]
            .find(
                {"user_id": user_id},
                {"completed_weeks": 1}
            )
            .to_list(length=100)
        )

        weak_topics_task = self.db["student_weak_topics"].find_one(
            {"user_id": user_id},
            {"weak_topics": 1}
        )

        (
            quiz_count,
            roadmap_count,
            roadmaps,
            weak_topics_doc,
        ) = await asyncio.gather(
            quiz_count_task,
            roadmap_count_task,
            roadmaps_task,
            weak_topics_task,
        )

        completed_weeks = sum(
            len(roadmap.get("completed_weeks", []))
            for roadmap in roadmaps
        )

        weak_topics = []

        if weak_topics_doc:
            weak_topics = weak_topics_doc.get("weak_topics", [])

        needs_revision_count = len(weak_topics)

        return {
            "success": True,
            "user_id": user_id,
            "quizzes_taken": quiz_count,
            "roadmaps_created": roadmap_count,
            "completed_weeks": completed_weeks,
            "weak_topics": weak_topics,
            "needs_revision_count": needs_revision_count,
        }