from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.repositories.pricing_repository import create_rule, delete_rule, get_rules_by_hotel
from app.schemas.pricing import PricingRuleCreate, PricingRuleResponse

router = APIRouter(prefix="/pricing-rules", tags=["Admin Pricing"])


@router.post("/", response_model=PricingRuleResponse, status_code=status.HTTP_201_CREATED)
def create_pricing_rule_endpoint(
    data: PricingRuleCreate,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> PricingRuleResponse:
    payload = data.model_dump()
    payload["hotel_id"] = hotel_id
    return create_rule(db, payload)


@router.get("/", response_model=List[PricingRuleResponse])
def list_pricing_rules_endpoint(
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> List[PricingRuleResponse]:
    return get_rules_by_hotel(db, hotel_id)


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pricing_rule_endpoint(
    rule_id: int,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> None:
    deleted = delete_rule(db, rule_id, hotel_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing rule not found")
