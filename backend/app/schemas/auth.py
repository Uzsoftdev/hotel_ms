from typing import Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    hotel_id: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
