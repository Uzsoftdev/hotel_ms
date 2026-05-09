from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class PricingRuleBase(BaseModel):
    room_type_id: int
    start_date: date
    end_date: date
    price: Optional[Decimal] = None
    multiplier: Optional[Decimal] = None
    priority: int = 0

    @field_validator("price", "multiplier", mode="before")
    @classmethod
    def validate_price_or_multiplier(cls, v):
        return v

    def model_post_init(self, __context):
        if self.price is None and self.multiplier is None:
            raise ValueError("Either price or multiplier must be provided")


class PricingRuleCreate(PricingRuleBase):
    pass


class PricingRuleResponse(PricingRuleBase):
    id: int
    hotel_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
