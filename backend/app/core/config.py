from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os
from dotenv import load_dotenv

backend_root = Path(__file__).resolve().parents[2]
load_dotenv(backend_root / ".env")


def _default_database_url() -> str:
    data_dir = backend_root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{(data_dir / 'app.db').as_posix()}"


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", _default_database_url())
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    zegocloud_app_id: str = os.getenv("ZEGOCLOUD_APP_ID", "")
    zegocloud_server_secret: str = os.getenv("ZEGOCLOUD_SERVER_SECRET", "")
    zegocloud_app_sign: str = os.getenv("ZEGOCLOUD_APP_SIGN", "")
    clerk_secret_key: str = os.getenv("CLERK_SECRET_KEY", "")
    clerk_publishable_key: str = os.getenv("CLERK_PUBLISHABLE_KEY", "")
    clerk_jwks_url: str = os.getenv(
        "CLERK_JWKS_URL", "https://next-panda-1552.clerk.accounts.dev/.well-known/jwks.json"
    )


settings = Settings()