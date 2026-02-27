from pydantic import BaseModel
from typing import Optional, List

class UserProfile(BaseModel):
    name: str
    salary: float
    age: int
    risk_appetite: str  # conservative, moderate, aggressive
    financial_year: str

class Transaction(BaseModel):
    date: str
    description: str
    amount: float
    category: Optional[str] = None
    tax_section: Optional[str] = None  # e.g., 80C, 80D
    is_tax_saving: bool = False

class TaxResult(BaseModel):
    old_regime_tax: float
    new_regime_tax: float
    recommended_regime: str
    total_deductions: float
    savings_opportunity: float
    health_score: int
    utilization_80c: float
    utilization_80d: float

class SimulationRequest(BaseModel):
    salary: float
    age: int
    investments_80c: float
    investments_80d: float
    investments_nps: float
    expected_growth: float = 0.0

class SimulationResponse(BaseModel):
    old_tax: float
    new_tax: float
    tax_saved: float
    recommended: str
    savings_gap: float
    health_score: int
