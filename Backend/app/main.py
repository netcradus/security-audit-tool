from fastapi import FastAPI

from dotenv import load_dotenv

from app.api.scan import router as scan_router

from app.storage.history import init_db

from app.core.limiter import limiter

from slowapi.errors import (
    RateLimitExceeded
)

from slowapi.middleware import (
    SlowAPIMiddleware
)

from slowapi.extension import (
    _rate_limit_exceeded_handler
)

import os

# =====================================
# LOAD ENV
# =====================================

load_dotenv()

ZAP_API_KEY = os.getenv(
    "ZAP_API_KEY"
)

# =====================================
# INIT DATABASE
# =====================================

init_db()

# =====================================
# FASTAPI APP
# =====================================

app = FastAPI(
    title="WebSec Scanner"
)

# =====================================
# RATE LIMITING
# =====================================

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)

app.add_middleware(
    SlowAPIMiddleware
)

# =====================================
# ROUTERS
# =====================================

app.include_router(scan_router)