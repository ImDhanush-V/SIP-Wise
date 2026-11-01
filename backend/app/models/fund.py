"""Pydantic models for fund / category data."""

from pydantic import BaseModel


class FundInfo(BaseModel):
    """One representative fund."""
    category: str
    scheme_code: int
    scheme_name: str


class CategoryResponse(BaseModel):
    """List of available fund categories and their representative funds."""
    categories: list[FundInfo]
