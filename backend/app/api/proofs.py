from fastapi import APIRouter, HTTPException, UploadFile, File
from ..config.supabase_setup import supabase
from ..models.proofs import ProofSubmission, ProofVerification, ProofResponse

router = APIRouter(prefix="/proofs", tags=["proofs"])

@router.post("/submit", response_model=ProofResponse)
async def submit_proof(proof_data: ProofSubmission):
    try:
        # Create proof record
        response = supabase.table('bet_proofs').insert({
            "bet_id": proof_data.bet_id,
            "proof_image_url": proof_data.proof_image_url,
            "required_witnesses": proof_data.required_witnesses,
            "verification_deadline": proof_data.verification_deadline
        }).execute()
        
        # Notify potential witnesses (implementation in notifications.py)
        await notify_witnesses_required(proof_data.bet_id)
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{proof_id}/verify")
async def verify_proof(proof_id: str, verification: ProofVerification):
    try:
        # Add verification
        response = supabase.table('proof_verifications').insert({
            "proof_id": proof_id,
            "witness_id": "user_id",  # From auth
            "verified": verification.verified,
            "comment": verification.comment
        }).execute()
        
        # Check if we have enough verifications
        proof = await check_verification_status(proof_id)
        
        return {"message": "Verification submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pending")
async def get_pending_verifications():
    try:
        response = supabase.table('bet_proofs')\
            .select('*, bets(description)')\
            .eq('verification_status', 'pending')\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
