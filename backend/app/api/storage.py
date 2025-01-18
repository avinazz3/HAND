from fastapi import APIRouter, HTTPException, UploadFile, File
from ..config.supabase_setup import supabase
from typing import List, Optional
import uuid

router = APIRouter(prefix="/storage", tags=["storage"])

@router.post("/upload-proof")
async def upload_proof_image(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_ext = file.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        
        # Upload to Supabase Storage
        file_bytes = await file.read()
        response = supabase.storage\
            .from_('proofs')\
            .upload(file_name, file_bytes)
            
        # Get public URL
        public_url = supabase.storage\
            .from_('proofs')\
            .get_public_url(file_name)
            
        return {"url": public_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete-proof/{file_name}")
async def delete_proof_image(file_name: str):
    try:
        response = supabase.storage\
            .from_('proofs')\
            .remove([file_name])
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))