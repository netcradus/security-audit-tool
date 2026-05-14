from fastapi import FastAPI
from app.api.scan import router as scan_router
from dotenv import load_dotenv
from app.storage.history import init_db
import os

load_dotenv()

ZAP_API_KEY = os.getenv("ZAP_API_KEY")
init_db()

app = FastAPI(title='WebSec Scanner')
app.include_router(scan_router)
