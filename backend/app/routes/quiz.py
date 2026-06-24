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
    return await service.submit_quiz(payload)


@router.post("/generate")
async def generate_quiz(
    payload: dict,
    service: QuizService = Depends(get_quiz_service),
):
    topic = payload.get("topic")

    count = (
        payload.get("count")
        or payload.get("question_count")
        or 10
    )

    difficulty = payload.get("difficulty", "Medium")

    class_name = payload.get(
        "class_name",
        "College / University",
    )

    return await service.generate_topic_quiz(
        topic=topic,
        count=count,
        difficulty=difficulty,
        class_name=class_name,
    )


@router.post("/generate-from-roadmap")
async def generate_quiz_from_roadmap(
    payload: dict,
    service: QuizService = Depends(get_quiz_service),
):
    return await service.generate_roadmap_quiz(payload)


@router.get("/quiz-history/{user_id}")
async def get_quiz_history(
    user_id: str,
    service: QuizService = Depends(get_quiz_service),
):
    return await service.get_quiz_history(user_id)