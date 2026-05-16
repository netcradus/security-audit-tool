from fastapi import APIRouter, Request, HTTPException, Depends

from pydantic import BaseModel
from uuid import uuid4

from concurrent.futures import ThreadPoolExecutor

from app.core.scan_runner import run_full_scan
from app.core.limiter import limiter

from app.storage.history import create_scan, get_scan, get_all_scans

from app.utils.validators import is_valid_target, normalize_target


from app.middleware.auth import verify_api_key

# =====================================
# THREAD EXECUTOR
# =====================================

executor = ThreadPoolExecutor(max_workers=5)

router = APIRouter()

# =====================================
# REQUEST MODEL
# =====================================


class ScanRequest(BaseModel):
    target: str


# =====================================
# START SCAN
# =====================================


@router.post("/scan", dependencies=[Depends(verify_api_key)])
@limiter.limit("5/minute")
def start_scan(request: Request, payload: ScanRequest):

    normalized_target = normalize_target(payload.target)
    # =================================
    # TARGET VALIDATION
    # =================================

    if not is_valid_target(normalized_target):

        raise HTTPException(status_code=400, detail="Invalid or private target")

    # =================================
    # CREATE SCAN
    # =================================

    scan_id = str(uuid4())

    create_scan(scan_id, normalized_target)

    # =================================
    # RUN SCAN
    # =================================

    executor.submit(run_full_scan, scan_id, normalized_target)

    return {"scan_id": scan_id, "status": "started"}


# =====================================
# GET SINGLE SCAN
# =====================================


@router.get("/scan/{scan_id}", dependencies=[Depends(verify_api_key)])
def get_scan_result(scan_id: str):

    scan = get_scan(scan_id)

    if not scan:

        raise HTTPException(status_code=404, detail="Scan not found")

    return scan


# =====================================
# GET HISTORY
# =====================================


@router.get("/history", dependencies=[Depends(verify_api_key)])
@limiter.limit("30/minute")
def history(request: Request):

    return get_all_scans()
