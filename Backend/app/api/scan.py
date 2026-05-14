
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from uuid import uuid4

from app.core.scan_runner import run_full_scan
from app.storage.history import scan_history

router = APIRouter()

class ScanRequest(BaseModel):
    target: str

@router.post('/scan')
def start_scan(request: ScanRequest, background_tasks: BackgroundTasks):

    scan_id = str(uuid4())

    scan_history[scan_id] = {
        'target': request.target,
        'status': 'running',
        'results': None
    }

    background_tasks.add_task(
        run_full_scan,
        scan_id,
        request.target
    )

    return {
        'scan_id': scan_id,
        'status': 'started'
    }

@router.get('/scan/{scan_id}')
def get_scan(scan_id: str):

    return scan_history.get(scan_id, {
        'error': 'Not Found'
    })

@router.get('/history')
def history():
    return scan_history
