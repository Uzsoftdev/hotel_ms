from typing import Sequence

from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.user import User


def require_roles(*roles: str):
    """FastAPI dependency that raises 403 if current user's role is not in allowed roles."""

    def _check(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}",
            )
        return user

    return _check


# Convenience aliases
require_admin = require_roles("hotel_admin", "super_admin")
require_super_admin = require_roles("super_admin")
require_staff_or_admin = require_roles("staff", "hotel_admin", "super_admin")
