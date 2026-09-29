from __future__ import annotations

from fastapi import APIRouter, FastAPI

from app.auth.router import router as auth_router
from app.meetings.router import router as meetings_router
from app.participants.router import router as participants_router
from app.schemas import APIMessage
from app.users.router import router as users_router

api_router = APIRouter(prefix="/api/v1")


@api_router.get("/health", response_model=APIMessage, tags=["health"])
def health() -> APIMessage:
    return APIMessage(message="ok")


api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(meetings_router)
api_router.include_router(participants_router)


def create_app() -> FastAPI:
    app = FastAPI(title="Zoom Assignment API", version="1.0.0")
    app.include_router(api_router)
    return app