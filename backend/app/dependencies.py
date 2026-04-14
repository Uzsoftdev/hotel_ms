from typing import Any

from fastapi import Depends, HTTPException, Request, status


def get_current_user(request: Request) -> Any:
    """
    Returns the authenticated user attached by auth middleware/dependency.
    """
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


def get_current_hotel(user: Any = Depends(get_current_user)) -> int:
    hotel_id = getattr(user, "hotel_id", None)

    if hotel_id is None:
        role = getattr(user, "role", None)
        if role == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin must explicitly select a hotel context",
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to a hotel",
        )

    return int(hotel_id)
