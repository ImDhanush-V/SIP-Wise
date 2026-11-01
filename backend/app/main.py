"""SIP-Wise FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import close_db, connect_db
from app.routers import funds, health, optimize, plans, risk, simulate


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open and close the MongoDB connection around the app lifetime."""
    try:
        await connect_db()
    except Exception:
        pass  # Allow app to start even without MongoDB (uses CSV fallback)
    yield
    await close_db()


app = FastAPI(
    title="SIP-Wise API",
    description="Investment planning tool for Indian mutual fund SIPs — "
                "risk profiling, Markowitz optimisation and Monte Carlo simulation.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(risk.router)
app.include_router(funds.router)
app.include_router(optimize.router)
app.include_router(simulate.router)
app.include_router(plans.router)
