import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import health, scans

settings = get_settings()

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        # Face images and landmark arrays must never reach an error report.
        send_default_pii=False,
    )

app = FastAPI(
    title="Ayna Analysis API",
    version=settings.engine_version,
    description="Landmark extraction, deterministic facial metrics, scoring and recommendations.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(scans.router)
