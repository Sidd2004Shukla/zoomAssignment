from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os
from dotenv import load_dotenv

backend_root = Path(__file__).resolve().parents[2]
load_dotenv(backend_root / ".env")


def _default_database_url() -> str:
    try:
        data_dir = backend_root / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        test_file = data_dir / ".write_test"
        test_file.touch()
        test_file.unlink()
        return f"sqlite:///{(data_dir / 'app.db').as_posix()}"
    except (OSError, PermissionError):
        tmp_dir = Path("/tmp") / "zoom_Assignment"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{(tmp_dir / 'app.db').as_posix()}"


def _get_database_url() -> str:
    db_url = os.getenv("DATABASE_URL")
    if db_url and not db_url.startswith("sqlite"):
        return db_url

    # For SQLite, ensure directory is writable
    if db_url and db_url.startswith("sqlite"):
        try:
            rel_path = db_url.replace("sqlite:///", "").replace("sqlite://", "")
            target_path = Path(rel_path)
            if not target_path.is_absolute():
                target_path = backend_root / target_path
            target_path.parent.mkdir(parents=True, exist_ok=True)
            test_file = target_path.parent / ".write_test"
            test_file.touch()
            test_file.unlink()
            return f"sqlite:///{target_path.as_posix()}"
        except (OSError, PermissionError):
            pass

    # Default fallback to backend/data or /tmp
    return _default_database_url()


@dataclass(frozen=True)
class Settings:
    database_url: str = _get_database_url()
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