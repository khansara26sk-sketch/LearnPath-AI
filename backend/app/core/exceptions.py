from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class DatabaseError(AppException):
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status.HTTP_503_SERVICE_UNAVAILABLE)


class AIServiceError(AppException):
    def __init__(self, message: str = "AI service unavailable"):
        super().__init__(message, status.HTTP_502_BAD_GATEWAY)


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message},
    )


async def generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "An unexpected error occurred"},
    )
