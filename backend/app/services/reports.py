"""
Reports service layer.

Report aggregation logic is implemented directly in the route handlers at:
  app/api/v1/admin/reports.py

This is intentional — the queries are bespoke SQL aggregations that don't benefit
from an intermediate service abstraction. If shared reporting logic is needed across
multiple routers in future, extract it here.
"""
