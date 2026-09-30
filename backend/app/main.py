from __future__ import annotations

from fastapi.middleware.cors import CORSMiddleware

from app.api import create_app
from app.core.config import settings

app = create_app()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)