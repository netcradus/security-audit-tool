from fastapi import FastAPI
from app.api.scan import router as scan_router
from dotenv import load_dotenv
import os

load_dotenv()

ZAP_API_KEY = os.getenv("ZAP_API_KEY")

app = FastAPI(title='WebSec Scanner Phase 4')
app.include_router(scan_router)
