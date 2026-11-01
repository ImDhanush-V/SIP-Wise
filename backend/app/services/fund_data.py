"""Fund data service — fetches NAVs, caches in MongoDB, computes returns."""

from __future__ import annotations

import logging
from pathlib import Path

import httpx
import numpy as np
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# ── Representative fund scheme codes (MFAPI.in) ──────────────────────

FUND_MAP: dict[str, dict] = {
    "Large Cap": {"scheme_code": 120503, "scheme_name": "UTI Nifty 50 Index Fund - Direct Growth"},
    "Mid Cap": {"scheme_code": 101539, "scheme_name": "HDFC Mid-Cap Opportunities Fund - Direct Growth"},
    "Small Cap": {"scheme_code": 125307, "scheme_name": "SBI Small Cap Fund - Direct Growth"},
    "Debt": {"scheme_code": 119551, "scheme_name": "HDFC Short Term Debt Fund - Direct Growth"},
    "Gold": {"scheme_code": 100060, "scheme_name": "SBI Gold Fund - Direct Growth"},
    "Hybrid": {"scheme_code": 106235, "scheme_name": "ICICI Prudential Balanced Advantage Fund - Direct Growth"},
}

FALLBACK_CSV = Path(__file__).resolve().parent.parent / "data" / "fallback_navs.csv"


# ── Fetch / cache ────────────────────────────────────────────────────


async def _fetch_navs_from_api(scheme_code: int) -> list[dict] | None:
    """Fetch historical NAVs from MFAPI.in. Returns None on failure."""
    url = f"https://api.mfapi.in/mf/{scheme_code}"
import asyncio

async def _fetch_navs_from_api(scheme_code: int) -> list[dict] | None:
    """Fetch historical NAVs from MFAPI.in. Returns None on failure or timeout."""
    url = f"https://api.mfapi.in/mf/{scheme_code}"
    try:
        async with httpx.AsyncClient(timeout=3.5) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            return data.get("data", [])
    except Exception as exc:
        logger.info("MFAPI fetch unavailable for %s: %s (using fallback)", scheme_code, exc)
        return None


def _navs_to_df(raw: list[dict], category: str) -> pd.DataFrame:
    """Convert MFAPI JSON rows [{date, nav}, ...] to a dated Series."""
    df = pd.DataFrame(raw)
    df["date"] = pd.to_datetime(df["date"], format="%d-%m-%Y", dayfirst=True)
    df["nav"] = pd.to_numeric(df["nav"], errors="coerce")
    df = df.dropna(subset=["nav"]).sort_values("date").reset_index(drop=True)
    df = df.rename(columns={"nav": category})
    return df[["date", category]]


def _load_fallback_csv() -> pd.DataFrame:
    """Load the seeded CSV fallback."""
    df = pd.read_csv(FALLBACK_CSV, parse_dates=["date"], dayfirst=True)
    return df.sort_values("date").reset_index(drop=True)


async def _cache_navs(db: AsyncIOMotorDatabase, category: str, rows: list[dict]) -> None:
    """Upsert NAV rows into MongoDB for caching."""
    try:
        coll = db["nav_cache"]
        await asyncio.wait_for(coll.delete_many({"category": category}), timeout=2.0)
        if rows:
            docs = [{"category": category, **r} for r in rows[:1500]]
            await asyncio.wait_for(coll.insert_many(docs), timeout=2.0)
    except Exception as e:
        logger.warning("MongoDB cache write skipped: %s", e)


async def _load_cached_navs(db: AsyncIOMotorDatabase, category: str) -> list[dict] | None:
    """Load cached NAVs from MongoDB."""
    try:
        coll = db["nav_cache"]
        cursor = coll.find({"category": category}, {"_id": 0, "category": 0})
        docs = await asyncio.wait_for(cursor.to_list(length=10000), timeout=2.0)
        return docs if docs else None
    except Exception as e:
        logger.warning("MongoDB cache read skipped: %s", e)
        return None


# ── Public API ────────────────────────────────────────────────────────


async def get_nav_dataframe(db: AsyncIOMotorDatabase | None = None) -> pd.DataFrame:
    """Return a merged DataFrame of monthly NAVs for all categories.

    Tries MFAPI (concurrent) → MongoDB cache → CSV fallback, in that order.
    """
    try:
        # Fetch all schemes concurrently with a 4s ceiling
        tasks = [
            _fetch_navs_from_api(info["scheme_code"])
            for info in FUND_MAP.values()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        frames: list[pd.DataFrame] = []
        categories = list(FUND_MAP.keys())

        for cat, res in zip(categories, results):
            if isinstance(res, list) and len(res) > 10:
                if db is not None:
                    asyncio.create_task(_cache_navs(db, cat, res))
                frames.append(_navs_to_df(res, cat))
            elif db is not None:
                cached = await _load_cached_navs(db, cat)
                if cached:
                    frames.append(_navs_to_df(cached, cat))

        # If all categories retrieved, merge them
        if len(frames) == len(FUND_MAP):
            merged = frames[0]
            for f in frames[1:]:
                merged = pd.merge(merged, f, on="date", how="inner")
            if len(merged) > 12:
                resampled = merged.set_index("date").resample("ME").last().dropna().reset_index()
                return resampled
    except Exception as e:
        logger.info("Live fetch or cache resolution deferred to fallback CSV: %s", e)

    # Reliable fallback CSV loaded instantly
    return _load_fallback_csv()


def compute_monthly_returns(nav_df: pd.DataFrame) -> pd.DataFrame:
    """Compute monthly percentage returns from NAV levels."""
    categories = [c for c in nav_df.columns if c != "date"]
    returns = nav_df[categories].pct_change().dropna()
    return returns


def compute_statistics(returns_df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Return (annualised_mean_returns, annualised_cov_matrix, category_names).

    Monthly returns are annualised by multiplying mean by 12
    and covariance by 12.
    """
    categories = list(returns_df.columns)
    mean_monthly = returns_df.mean().values
    cov_monthly = returns_df.cov().values

    mean_annual = mean_monthly * 12
    cov_annual = cov_monthly * 12

    return mean_annual, cov_annual, categories
