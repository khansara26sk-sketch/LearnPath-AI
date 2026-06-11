from fastapi import APIRouter, Depends

from app.core.dependencies import get_roadmap_service
from app.models.roadmap import RoadmapRequest, RoadmapResponse
from app.services.roadmap_service import RoadmapService

router = APIRouter(
    prefix="/generate-roadmap",
    tags=["Roadmap"],
)


@router.post("", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    service: RoadmapService = Depends(get_roadmap_service),
) -> RoadmapResponse:
    """
    Generate a personalized learning roadmap.

    Supports:
    - School subjects
    - Competitive exams
    - College skills
    - Career goals
    """
    return await service.generate_roadmap(payload)


@router.post("/universal", response_model=RoadmapResponse)
async def generate_universal_roadmap(
    payload: RoadmapRequest,
    service: RoadmapService = Depends(get_roadmap_service),
) -> RoadmapResponse:
    """
    Generate a universal roadmap for any goal:
    NEET, JEE, Class 10 Maths, Python, DSA, Data Engineer, etc.
    """
    return await service.generate_roadmap(payload)


@router.post("/progress/init")
async def initialize_roadmap_progress(
    user_id: str,
    roadmap_id: str,
    total_weeks: int,
    service: RoadmapService = Depends(get_roadmap_service),
):
    """
    Initialize roadmap progress in MongoDB.

    Week 1 starts as in-progress.
    Remaining weeks are locked.
    """
    return await service.initialize_progress(
        user_id=user_id,
        roadmap_id=roadmap_id,
        total_weeks=total_weeks,
    )


@router.get("/progress/{user_id}/{roadmap_id}")
async def get_roadmap_progress(
    user_id: str,
    roadmap_id: str,
    service: RoadmapService = Depends(get_roadmap_service),
):
    """
    Get saved roadmap progress.
    """
    return await service.get_progress(
        user_id=user_id,
        roadmap_id=roadmap_id,
    )


@router.patch("/progress/{user_id}/{roadmap_id}/week/{week}")
async def update_roadmap_week_progress(
    user_id: str,
    roadmap_id: str,
    week: int,
    service: RoadmapService = Depends(get_roadmap_service),
):
    """
    Mark a week as completed.

    Example:
    Week 1 completed -> Week 2 becomes in-progress.
    """
    return await service.complete_week(
        user_id=user_id,
        roadmap_id=roadmap_id,
        week=week,
    )