from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

from concurrent.futures import ThreadPoolExecutor

from app.core.scan_runner import run_full_scan

from app.storage.history import (
    create_scan,
    get_scan,
    get_all_scans
)

# =====================================
# THREAD EXECUTOR
# =====================================

executor = ThreadPoolExecutor(
    max_workers=5
)

router = APIRouter()

# =====================================
# REQUEST MODEL
# =====================================

class ScanRequest(BaseModel):
    target: str

# =====================================
# START SCAN
# =====================================

@router.post('/scan')
def start_scan(request: ScanRequest):

    scan_id = str(uuid4())

    # Create DB entry
    create_scan(
        scan_id,
        request.target
    )

    # Run scan in background thread
    executor.submit(
        run_full_scan,
        scan_id,
        request.target
    )

    return {
        'scan_id': scan_id,
        'status': 'started'
    }

# =====================================
# GET SINGLE SCAN
# =====================================

@router.get('/scan/{scan_id}')
def get_scan_result(scan_id: str):

    scan = get_scan(scan_id)

    if not scan:

        return {
            'error': 'Scan not found'
        }

    return scan

# =====================================
# GET ALL HISTORY
# =====================================

@router.get('/history')
def history():

    return get_all_scans()