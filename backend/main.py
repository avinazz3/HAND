from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api import groups, bets, proofs, users, notifications, analytics, storage
from app.utils.realtime import RealtimeManager
from app.utils.validators import BetValidator
from firebase_admin import credentials, initialize_app, get_app

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Try to get the default app first
    firebase_app = get_app()
except ValueError:
    # Initialize only if it doesn't exist
    cred = credentials.Certificate("C:/Users/Avinash/Desktop/HAND/backend/handshake-5dd27-firebase-adminsdk-fbsvc-7d7f13a9f1.json")
    firebase_app = initialize_app(cred)

app = FastAPI()

app.include_router(groups.router, prefix="/api")
app.include_router(bets.router, prefix="/api")
app.include_router(proofs.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(storage.router, prefix="/api")

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
