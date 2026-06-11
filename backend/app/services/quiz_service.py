from datetime import datetime, timezone
from typing import Any, Dict
from uuid import uuid4

from app.core.exceptions import DatabaseError
from app.database.connection import get_database
from app.models.quiz import QuizAnalysis, QuizSubmissionRequest, QuizSubmissionResponse
from app.services.analysis_service import AnalysisService


class QuizService:
    def __init__(self, analysis_service: AnalysisService) -> None:
        self.analysis = analysis_service
        self.collection_name = "quiz_submissions"

    async def submit_quiz(self, payload: QuizSubmissionRequest) -> QuizSubmissionResponse:
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
            raise DatabaseError(f"Failed to store quiz submission: {exc}") from exc

        return QuizSubmissionResponse(
            submission_id=submission_id,
            user_id=payload.user_id,
            subject=payload.subject,
            topic=payload.topic,
            analysis=analysis,
            created_at=created_at,
        )
