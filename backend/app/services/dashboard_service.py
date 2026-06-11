from app.database.connection import get_database


class DashboardService:
    def __init__(self):
        self.db = get_database()

    async def get_dashboard_stats(self, user_id: str):
        quiz_count = await self.db["quiz_submissions"].count_documents(
            {"user_id": user_id}
        )

        roadmap_count = await self.db["roadmap_progress"].count_documents(
            {"user_id": user_id}
        )

        roadmaps = await (
            self.db["roadmap_progress"]
            .find({"user_id": user_id})
            .to_list(length=100)
        )

        completed_weeks = 0

        for roadmap in roadmaps:
            completed_weeks += len(
                roadmap.get("completed_weeks", [])
            )

        return {
            "success": True,
            "user_id": user_id,
            "quizzes_taken": quiz_count,
            "roadmaps_created": roadmap_count,
            "completed_weeks": completed_weeks,
        }