from fastapi import APIRouter, Request, HTTPException, Depends, Query
from fastapi.responses import FileResponse

from pydantic import BaseModel
from uuid import uuid4
import os
import re

from concurrent.futures import ThreadPoolExecutor

from app.core.scan_runner import run_full_scan
from app.core.report_generator import generate_professional_report
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
# DOWNLOAD PDF REPORT
# =====================================


@router.get("/scan/{scan_id}/report", dependencies=[Depends(verify_api_key)])
def download_scan_report(
    scan_id: str,
    company_name: str = Query(..., min_length=1),
    audit_by: str = Query(..., min_length=1)
):

    scan = get_scan(scan_id)

    if not scan:

        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.get("status") != "completed":

        raise HTTPException(status_code=409, detail="Scan report is not ready yet")

    results = scan.get("results") or {}

    if not results:

        raise HTTPException(status_code=404, detail="Report data not found")

    target = scan.get("target") or scan_id

    safe_target = re.sub(r"[^a-zA-Z0-9.-]+", "-", target).strip("-")

    reports_dir = os.getenv(
        "REPORTS_DIR",
        "reports"
    )

    os.makedirs(
        reports_dir,
        exist_ok=True
    )

    report_path = os.path.join(
        reports_dir,
        f"{scan_id}-download.pdf"
    )

    try:

        generate_professional_report(
            report_path,
            results,
            {
                "company_name": company_name,
                "audit_by": audit_by
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {e}"
        )

    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=f"netcrad-{safe_target}-{scan_id}.pdf"
    )


# =====================================
# GET HISTORY
# =====================================


@router.get("/history", dependencies=[Depends(verify_api_key)])
@limiter.limit("30/minute")
def history(request: Request):

    return get_all_scans()
