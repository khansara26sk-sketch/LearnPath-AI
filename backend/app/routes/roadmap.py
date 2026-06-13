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
    return await service.generate_roadmap(payload)


@router.post("/universal", response_model=RoadmapResponse)
async def generate_universal_roadmap(
    payload: RoadmapRequest,
    service: RoadmapService = Depends(get_roadmap_service),
) -> RoadmapResponse:
    return await service.generate_roadmap(payload)


@router.get("/user/{user_id}")
async def get_user_roadmaps(
    user_id: str,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.get_user_roadmaps(user_id)


@router.get("/saved/{user_id}/{roadmap_id}")
async def get_saved_roadmap(
    user_id: str,
    roadmap_id: str,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.get_saved_roadmap(
        user_id=user_id,
        roadmap_id=roadmap_id,
    )


@router.post("/progress/init")
async def initialize_roadmap_progress(
    payload: dict,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.initialize_progress(
        user_id=payload.get("user_id"),
        roadmap_id=payload.get("roadmap_id"),
        total_weeks=payload.get("total_weeks", 1),
    )


@router.get("/progress/{user_id}/{roadmap_id}")
async def get_roadmap_progress(
    user_id: str,
    roadmap_id: str,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.get_progress(
        user_id=user_id,
        roadmap_id=roadmap_id,
    )


@router.post("/progress/complete-week")
async def complete_roadmap_week(
    payload: dict,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.complete_week(
        user_id=payload.get("user_id"),
        roadmap_id=payload.get("roadmap_id"),
        week=int(payload.get("week")),
    )


@router.patch("/progress/{user_id}/{roadmap_id}/week/{week}")
async def update_roadmap_week_progress(
    user_id: str,
    roadmap_id: str,
    week: int,
    service: RoadmapService = Depends(get_roadmap_service),
):
    return await service.complete_week(
        user_id=user_id,
        roadmap_id=roadmap_id,
        week=week,
    )