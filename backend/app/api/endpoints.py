from fastapi import APIRouter, File, UploadFile, HTTPException, Form
import pandas as pd
import io
import json
from datetime import datetime

from app.models.schemas import UserProfile
from app.services.data_processing import parse_bank_statement
from app.ml.transaction_classifier import classifier
from app.services.tax_engine import tax_engine

router = APIRouter()

@router.post("/analyze")
async def analyze_transactions(
    file: UploadFile = File(..., description="CSV File of Bank Statement"),
    user_profile: str = Form(..., description="JSON string of UserProfile")
):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")

        # 1. Parse user profile
        try:
            profile_data = json.loads(user_profile)
            profile = UserProfile(**profile_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid User Profile JSON: {str(e)}")

        # 2. Read and parse CSV
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail="Failed to parse CSV file")

        # 3. Parse RAW to Pydantic transactions
        raw_transactions = parse_bank_statement(df)
        if not raw_transactions:
            raise HTTPException(status_code=400, detail="No readable expense transactions found in CSV")

        # 4. Classify transactions (ML Layer)
        classified_transactions = classifier.process_transactions(raw_transactions)

        # 5. Calculate Taxes (Deterministic Engine)
        analysis_result = tax_engine.analyze_profile(profile, classified_transactions)
        
        # Build clean response including matches for transparency
        tax_saving_txns = [
            {"date": t.date, "description": t.description, "amount": t.amount, "section": t.tax_section, "category": t.category} 
            for t in classified_transactions if t.is_tax_saving
        ]

        # 6. Return response matching architecture structure exactly
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "profile": profile.dict(),
            "discovered_investments": tax_saving_txns,
            "tax_analysis": analysis_result
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
