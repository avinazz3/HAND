from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProofSubmission(BaseModel):
    bet_id: str
    proof_image_url: str
    required_witnesses: int = 2
    verification_deadline: Optional[datetime]

class ProofVerification(BaseModel):
    proof_id: str
    verified: bool
    comment: Optional[str]

class ProofResponse(BaseModel):
    id: str
    bet_id: str
    proof_image_url: str
    verification_status: str
    required_witnesses: int
    current_witnesses: int
    submitted_at: datetime