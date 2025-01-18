from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException
import supabase

class BetValidator:
    @staticmethod
    def validate_conditions(bet_data: Dict[str, Any]) -> bool:
        if bet_data['target_quantity'] <= 0:
            raise HTTPException(status_code=400, detail="Target quantity must be positive")
        
        if bet_data['bet_type'] not in ['one_to_many', 'many_to_many']:
            raise HTTPException(status_code=400, detail="Invalid bet type")
            
        return True

    @staticmethod
    def validate_proof_submission(proof_data: Dict[str, Any]) -> bool:
        if not proof_data.get('proof_image_url'):
            raise HTTPException(status_code=400, detail="Proof image is required")
            
        if proof_data.get('required_witnesses', 0) < 1:
            raise HTTPException(status_code=400, detail="At least one witness is required")
            
        return True

    @staticmethod
    def check_deadlines(bet_id: str) -> bool:
        try:
            bet = supabase.table('bets')\
                .select('*')\
                .eq('id', bet_id)\
                .single()\
                .execute()
                
            if bet.data and bet.data.get('verification_deadline'):
                if datetime.now() > bet.data['verification_deadline']:
                    raise HTTPException(status_code=400, detail="Verification deadline has passed")
                    
            return True
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))