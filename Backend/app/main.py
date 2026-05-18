from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler

from app.api.scan import router as scan_router
from app.storage.history import init_db
from app.core.limiter import limiter


# =====================================
# LOAD ENV
# =====================================

load_dotenv()

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
# CORS
# =====================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
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

app.include_router(
    scan_router,
    prefix="/api/v1"
)