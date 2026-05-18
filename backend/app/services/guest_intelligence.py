"""Guest Intelligence service — pure computation functions.

All functions accept raw values (ORM objects, scalars) and return
computed metrics.  They do NOT touch the database.
"""

from datetime import date, datetime, timezone
from typing import Optional


def _days_since(dt: Optional[date]) -> Optional[int]:
    """Return days between *dt* and today, or None if dt is None."""
    if dt is None:
        return None
    if isinstance(dt, datetime):
        dt = dt.date()
    return (date.today() - dt).days


# ─────────────────────────────────────────────────────────────────────────────
# AI Score  (0–100, higher = better guest)
# ─────────────────────────────────────────────────────────────────────────────

def compute_ai_score(
    user: object,
    total_bookings: int,
    completed_stays: int,
    cancelled_bookings: int,
    total_spent: float,
) -> int:
    """Return a 0-100 guest quality score.

    Breakdown:
      Base              50
      Loyalty points    +0–15   (max at 5000 pts)
      Completion rate   +0–20   (based on completed / max(total,1))
      Cancellation pen  0–−20   (based on cancel / max(total,1))
      Spend bonus       +0–10   (max at $3000)
      VIP bonus         +10
      Banned penalty    −30
    """
    score = 50

    # Loyalty points bonus (max 15)
    points: int = int(getattr(user, "loyalty_points", 0) or 0)
    score += min(15, int(points / 5000 * 15))

    # Completion bonus (max 20)
    total = max(total_bookings, 1)
    completion_rate = completed_stays / total
    score += int(completion_rate * 20)

    # Cancellation penalty (max −20)
    cancel_rate = cancelled_bookings / total
    score -= int(cancel_rate * 20)

    # Spend bonus (max 10)
    score += min(10, int(float(total_spent or 0) / 3000 * 10))

    # VIP bonus
    if getattr(user, "vip_status", False):
        score += 10

    # Banned penalty
    if getattr(user, "is_banned", False):
        score -= 30

    return max(0, min(100, score))


# ─────────────────────────────────────────────────────────────────────────────
# Segment
# ─────────────────────────────────────────────────────────────────────────────

def compute_segment(
    user: object,
    total_bookings: int,
    completed_stays: int,
    cancelled_bookings: int,
    total_spent: float,
    _last_visit: Optional[date],
) -> str:
    """Classify a guest into a named segment string."""
    # Blacklisted first
    if getattr(user, "is_banned", False):
        return "blacklisted"

    spent = float(total_spent or 0)

    # VIP: explicit flag or high spender
    if getattr(user, "vip_status", False) or spent > 5000:
        return "vip"

    total = total_bookings or 0
    completed = completed_stays or 0
    cancelled = cancelled_bookings or 0

    # Risky: high cancellation rate with enough data
    if total > 2 and cancelled / total > 0.5:
        return "risky"

    # Frequent: many completed stays
    if completed >= 8:
        return "frequent"

    # New: never booked
    if total == 0:
        return "new"

    # Regular
    if completed >= 3:
        return "regular"

    return "casual"


# ─────────────────────────────────────────────────────────────────────────────
# Churn probability  (0–100, higher = more likely to churn)
# ─────────────────────────────────────────────────────────────────────────────

def compute_churn_probability(
    last_visit: Optional[date],
    completed_stays: int,
) -> int:
    """Estimate churn probability as an integer 0–100."""
    if not completed_stays:
        return 0  # never stayed → new/unconverted, not churning

    days = _days_since(last_visit)
    if days is None:
        return 80
    if days > 365:
        return 85
    if days > 180:
        return 65
    if days > 90:
        return 40
    if days > 30:
        return 20
    return 10


# ─────────────────────────────────────────────────────────────────────────────
# Lifetime Value
# ─────────────────────────────────────────────────────────────────────────────

def compute_ltv(
    total_spent: float,
    completed_stays: int,
    last_visit: Optional[date],
    created_at: Optional[datetime],
) -> float:
    """Estimate lifetime value including projected future spend."""
    spent = float(total_spent or 0)
    stays = max(completed_stays, 0)

    if stays == 0:
        return 0.0

    avg_per_stay = spent / stays

    # Tenure in months (minimum 1)
    if created_at:
        if isinstance(created_at, datetime):
            ca_aware = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
            tenure_days = (datetime.now(timezone.utc) - ca_aware).days
    else:
        tenure_days = 365

    tenure_months = max(tenure_days / 30.0, 1.0)
    stays_per_month = stays / tenure_months

    # Project 12 months into the future
    churn_p = compute_churn_probability(last_visit, stays) / 100.0
    retention = max(1 - churn_p, 0.05)
    projected_future_stays = stays_per_month * 12 * retention

    return round(spent + avg_per_stay * projected_future_stays, 2)


# ─────────────────────────────────────────────────────────────────────────────
# Risk Score  (0–100, higher = more risky)
# ─────────────────────────────────────────────────────────────────────────────

def compute_risk_score(
    user: object,
    cancelled_bookings: int,
    total_bookings: int,
) -> int:
    """Compute a 0–100 risk score for a guest."""
    score = 0

    # Banned user is very high risk
    if getattr(user, "is_banned", False):
        score += 40

    # High cancellation rate
    total = max(total_bookings, 1)
    cancel_rate = cancelled_bookings / total
    if cancel_rate > 0.5:
        score += 30
    elif cancel_rate > 0.3:
        score += 15
    elif cancel_rate > 0.1:
        score += 5

    # Low loyalty tier adds slight risk
    tier = str(getattr(user, "loyalty_tier", "") or "").lower()
    if tier == "bronze":
        score += 5

    # No VIP, no points
    if not getattr(user, "vip_status", False) and int(getattr(user, "loyalty_points", 0) or 0) == 0:
        score += 5

    return max(0, min(100, score))
