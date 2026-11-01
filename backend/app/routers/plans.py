"""Plan persistence endpoints with MongoDB and in-memory fallback."""

import uuid
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database import is_db_available, get_db
from app.models.plan import PlanCreate, PlanResponse

router = APIRouter(tags=["plans"])

# In-memory plan store for when MongoDB is not running locally
_local_plans: dict[str, dict] = {}


@router.post("/plans", response_model=PlanResponse, status_code=201)
async def create_plan(plan: PlanCreate) -> PlanResponse:
    """Save a user plan to MongoDB (or local store if DB offline)."""
    doc = plan.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)

    if is_db_available():
        try:
            db = get_db()
            result = await db["plans"].insert_one(doc)
            doc["id"] = str(result.inserted_id)
            return PlanResponse(**doc)
        except Exception:
            pass  # Fall through to local fallback

    plan_id = f"plan_{uuid.uuid4().hex[:12]}"
    doc["id"] = plan_id
    _local_plans[plan_id] = doc
    return PlanResponse(**doc)


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str) -> PlanResponse:
    """Retrieve a saved plan by its ID."""
    if is_db_available():
        try:
            db = get_db()
            oid = ObjectId(plan_id)
            doc = await db["plans"].find_one({"_id": oid})
            if doc:
                doc["id"] = str(doc.pop("_id"))
                return PlanResponse(**doc)
        except Exception:
            pass

    if plan_id in _local_plans:
        return PlanResponse(**_local_plans[plan_id])

    raise HTTPException(status_code=404, detail="Plan not found.")
