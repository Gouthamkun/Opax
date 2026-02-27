import pandas as pd
import re
from typing import List, Dict
from app.models.schemas import Transaction

def clean_description(desc: str) -> str:
    """Cleans the transaction description for better ML matching."""
    if not isinstance(desc, str):
        return ""
    # Remove special characters, multiple spaces, keep alphanumeric
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', desc)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip().lower()
    return cleaned

def parse_bank_statement(df: pd.DataFrame) -> List[Transaction]:
    """
    Parses a raw dataframe of bank transactions into standardized Pydantic models.
    Expects basic columns like Date, Description, Amount/Debit/Credit.
    """
    # Standardize column names
    df.columns = df.columns.astype(str).str.lower().str.strip()
    
    # Common mappings for Indian bank statements (HDFC, SBI, ICICI)
    col_mapping = {
        'txn date': 'date', 'value date': 'date', 'transaction date': 'date',
        'narration': 'description', 'remarks': 'description', 'particulars': 'description',
        'withdrawal amount (inr)': 'debit_amount', 'deposit amount (inr)': 'credit_amount',
        'debit': 'debit_amount', 'credit': 'credit_amount', 'withdrawal': 'debit_amount', 'deposit': 'credit_amount'
    }
    
    df = df.rename(columns=col_mapping)
    transactions = []
    
    for index, row in df.iterrows():
        if 'date' not in row or 'description' not in row:
            continue
            
        desc = str(row['description'])
        if pd.isna(desc) or desc.strip() == '':
            continue
            
        amount = 0.0
        # Determine amount (we mainly care about debit/expenses for tax deductions)
        if 'debit_amount' in row and not pd.isna(row['debit_amount']) and float(row['debit_amount']) > 0:
            amount = float(row['debit_amount'])
        elif 'amount' in row and not pd.isna(row['amount']):
            # Some statements have single amount column and use negative for debit
            amount = abs(float(row['amount']))
        else:
            # Skip if no clear expense amount
            continue
            
        # Clean description for matching later
        clean_desc = clean_description(desc)
        
        txn = Transaction(
            date=str(row['date']),
            description=clean_desc,
            amount=amount
        )
        transactions.append(txn)
        
    return transactions
