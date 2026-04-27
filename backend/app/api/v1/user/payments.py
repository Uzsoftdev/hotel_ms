from typing import Any, List
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.payment_repository import get_payments_for_user
from app.services.payment import PaymentError, process_payment

router = APIRouter(prefix="/payments", tags=["User Payments"])


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal
    currency: str
    method: str
    status: str
    transaction_id: str | None

    class Config:
        from_attributes = True


class PaymentRequest(BaseModel):
    booking_id: int
    amount: Decimal
    method: str = "card"
    currency: str = "USD"


@router.get("/", response_model=List[PaymentResponse])
def list_payments(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    return get_payments_for_user(db, user.id)


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def make_payment(
    data: PaymentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Any:
    try:
        booking = process_payment(db, data.booking_id, user.id, data.amount, data.method, data.currency)
    except PaymentError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    from app.repositories.payment_repository import get_payments_for_booking
    payments = get_payments_for_booking(db, data.booking_id)
    latest = max(payments, key=lambda p: p.id)
    return latest
