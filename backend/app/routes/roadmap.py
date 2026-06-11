from fastapi import APIRouter, Depends

from app.core.dependencies import get_roadmap_service
from app.models.roadmap import RoadmapRequest, RoadmapResponse
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/generate-roadmap", tags=["Roadmap"])


@router.post("", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    service: RoadmapService = Depends(get_roadmap_service),
) -> RoadmapResponse:
    """Generate a personalized learning roadmap based on weak topics."""
    return await service.generate_roadmap(payload)
