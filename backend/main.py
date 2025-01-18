from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api import groups, bets, proofs, users, notifications, analytics, storage
from app.utils.realtime import RealtimeManager
from app.utils.validators import BetValidator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.include_router(groups.router)
app.include_router(bets.router)
app.include_router(proofs.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(storage.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    logger.info("Root endpoint accessed")
    try:
        return {"Hello": "World"}
    except Exception as e:
        logger.error(f"Error in root endpoint: {str(e)}")
        raise

@app.get("/ping")
async def ping():
    logger.info("Ping endpoint accessed")
    return {"message": "pong"}
