import os
import json
from firebase_admin import credentials, initialize_app, auth
from dotenv import load_dotenv

load_dotenv()

# Get Firebase credentials from environment variables
private_key = os.getenv('FIREBASE_PRIVATE_KEY')
if not private_key:
    raise ValueError("FIREBASE_PRIVATE_KEY environment variable is not set")

# Create credentials dictionary
cred_dict = {
    "type": "service_account",
    "project_id": "handshake-5dd27",
    "private_key": private_key,
    "client_email": "firebase-adminsdk-fbsvc@handshake-5dd27.iam.gserviceaccount.com",
    "client_id": "116664445661445289150",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40handshake-5dd27.iam.gserviceaccount.com"
}

# Initialize Firebase Admin SDK with credentials
cred = credentials.Certificate(cred_dict)
firebase_app = initialize_app(cred)
admin_auth = auth
