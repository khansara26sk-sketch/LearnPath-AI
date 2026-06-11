from fastapi import APIRouter, Depends

from app.core.dependencies import get_quiz_service
from app.models.quiz import (
    QuizSubmissionRequest,
    QuizSubmissionResponse,
)
from app.services.quiz_service import QuizService

router = APIRouter(tags=["Quiz"])


@router.post(
    "/submit-quiz",
    response_model=QuizSubmissionResponse,
)
async def submit_quiz(
    payload: QuizSubmissionRequest,
    service: QuizService = Depends(get_quiz_service),
) -> QuizSubmissionResponse:
    """
    Submit quiz answers and analyze performance.
    """
    return await service.submit_quiz(payload)


@router.post("/generate")
async def generate_quiz(
    payload: dict,
    service: QuizService = Depends(get_quiz_service),
):
    """
    Generate quiz from topic.

    Example:
    {
      "topic": "Genetics",
      "count": 15
    }
    """
    topic = payload.get("topic")
    count = payload.get("count", 15)

    return await service.generate_topic_quiz(
        topic=topic,
        count=count,
    )


@router.post("/generate-from-roadmap")
async def generate_quiz_from_roadmap(
    payload: dict,
    service: QuizService = Depends(get_quiz_service),
):
    """
    Generate quiz from roadmap week.

    Example:
    {
      "week": 3,
      "topic": "Genetics",
      "goal": "NEET Biology",
      "count": 15
    }
    """
    return await service.generate_roadmap_quiz(payload)