from fastapi import APIRouter, Depends

from app.core.dependencies import get_quiz_service
from app.models.quiz import QuizSubmissionRequest, QuizSubmissionResponse
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/submit-quiz", tags=["Quiz"])


@router.post("", response_model=QuizSubmissionResponse)
async def submit_quiz(
    payload: QuizSubmissionRequest,
    service: QuizService = Depends(get_quiz_service),
) -> QuizSubmissionResponse:
    """Submit quiz answers, analyze weak topics, and persist results to MongoDB."""
    return await service.submit_quiz(payload)
