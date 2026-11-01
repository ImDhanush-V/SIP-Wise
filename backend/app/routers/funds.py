"""Fund categories endpoint."""

from fastapi import APIRouter

from app.models.fund import CategoryResponse, FundInfo
from app.services.fund_data import FUND_MAP

router = APIRouter(tags=["funds"])


@router.get("/funds/categories", response_model=CategoryResponse)
async def get_categories() -> CategoryResponse:
    """Return the list of fund categories and their representative schemes."""
    funds = [
        FundInfo(category=cat, scheme_code=info["scheme_code"], scheme_name=info["scheme_name"])
        for cat, info in FUND_MAP.items()
    ]
    return CategoryResponse(categories=funds)
