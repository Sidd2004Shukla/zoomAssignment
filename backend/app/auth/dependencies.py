from __future__ import annotations

from typing import Annotated
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import extract_user_identity_from_token
from app.models import User


def get_current_user_optional(
    authorization: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
    db: Session = Depends(get_db),
) -> User | None:
    auth_provider_user_id: str | None = None
    email_claim: str | None = None
    name_claim: str | None = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token:
            try:
                claims = extract_user_identity_from_token(token)
                auth_provider_user_id = claims.get("sub")
                email_claim = claims.get("email") or claims.get("primary_email_address")
                name_claim = claims.get("name") or claims.get("first_name")
            except Exception:
                pass

    if not auth_provider_user_id and x_user_id:
        auth_provider_user_id = x_user_id.strip()

    if not auth_provider_user_id:
        return None

    # Lookup user in DB by auth_provider_user_id or id
    user = db.scalar(
        select(User).where(
            (User.auth_provider_user_id == auth_provider_user_id) | (User.id == auth_provider_user_id)
        )
    )

    if not user:
        # Auto-provision user in SQLite
        email = email_claim or f"{auth_provider_user_id}@clerk.local"
        user = User(
            auth_provider_user_id=auth_provider_user_id,
            email=email,
            name=name_claim,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_current_user(
    user: Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
