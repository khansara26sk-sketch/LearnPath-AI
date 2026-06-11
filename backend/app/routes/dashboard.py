from fastapi import APIRouter, Depends

from app.core.dependencies import get_dashboard_service
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/{user_id}")
async def get_dashboard(
    user_id: str,
    service: DashboardService = Depends(
        get_dashboard_service
    ),
):
    return await service.get_dashboard_stats(
        user_id
    )