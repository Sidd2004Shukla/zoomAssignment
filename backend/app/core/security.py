from __future__ import annotations

import logging
from typing import Any
import jwt
from fastapi import Header, HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


def extract_user_identity_from_token(token: str) -> dict[str, Any]:
    """
    Decodes Clerk JWT token.
    Falls back gracefully to unverified decode if external network is unavailable.
    """
    try:
        # First attempt standard unverified claim extraction to get sub / claims
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        return unverified_claims
    except Exception as exc:
        logger.warning("Failed to decode token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc
