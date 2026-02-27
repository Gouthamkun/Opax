import json
import os
from typing import Dict, List, Any
from app.models.schemas import UserProfile, Transaction
from app.core.config import TAX_RULES_PATH

class TaxEngine:
    def __init__(self):
        self.rules = self._load_rules()

    def _load_rules(self) -> Dict[str, Any]:
        """Loads deterministic tax configurations from the JSON knowledge base."""
        with open(TAX_RULES_PATH, 'r') as f:
            return json.load(f)

    def aggregate_deductions(self, transactions: List[Transaction], profile: UserProfile) -> Dict[str, Dict[str, float]]:
        """
        Aggregates raw transaction amounts by tax section and applies legal caps.
        Only considers transactions marked as tax-saving by the ML classifier.
        """
        raw_totals = {"80C": 0.0, "80D": 0.0, "80CCD_1B": 0.0, "24B": 0.0}
        
        # Aggregate claimed amounts
        for txn in transactions:
            if txn.is_tax_saving and txn.tax_section in raw_totals:
                raw_totals[txn.tax_section] += txn.amount

        # Determine 80D age limit key dynamically
        age_key = "self_family_above_60" if profile.age >= 60 else "self_family_below_60"

        # Apply deterministic limits based on tax_rules.json
        limits = self.rules["limits"]
        aggregate = {
            "80C": {
                "claimed": raw_totals["80C"],
                "allowed": min(raw_totals["80C"], limits["80C"])
            },
            "80D": {
                "claimed": raw_totals["80D"],
                "allowed": min(raw_totals["80D"], limits["80D"][age_key])
            },
            "80CCD_1B": {
                "claimed": raw_totals["80CCD_1B"],
                "allowed": min(raw_totals["80CCD_1B"], limits["80CCD_1B"])
            }
        }
        
        # Standard Deduction (allowed fully if eligible; cap usually exact amount anyway)
        st_deduction = self.rules["standard_deduction"]["old_regime"]
        aggregate["Standard_Deduction"] = {
            "claimed": st_deduction,
            "allowed": st_deduction
        }

        return aggregate

    def compute_tax(self, taxable_income: float, regime: str) -> float:
        """Calculates exact tax liability using purely mathematical slab brackets."""
        slabs = self.rules["slabs"][regime]
        tax = 0.0
        
        for slab in slabs:
            min_val = slab["min"]
            max_val = slab["max"]
            rate = slab["rate"]
            
            if taxable_income > min_val:
                # If current bracket has a cap and income exceeds it, tax the full bracket.
                # If no cap (i.e. highest slab) or income falls inside bracket, tax the difference.
                if max_val and taxable_income > max_val:
                    taxable_amount = max_val - min_val
                else:
                    taxable_amount = taxable_income - min_val
                    
                tax += taxable_amount * rate
                
        return tax

    def calculate_regime(self, income: float, deductions_allowed: float, regime: str) -> Dict[str, float]:
        """Calculates final tax layout for a specific regime, applying deductions and rebate."""
        # Note: New regime only allows standard deduction (₹75k), no 80C/80D.
        if regime == "new_regime":
            applicable_deductions = self.rules["standard_deduction"]["new_regime"]
        else:
            applicable_deductions = deductions_allowed

        taxable_income = max(0, income - applicable_deductions)
        gross_tax = self.compute_tax(taxable_income, regime)
        
        # Apply 87A Rebate if eligible
        rebate_rules = self.rules["rebate_87A"][regime]
        rebate = rebate_rules["max_rebate"] if taxable_income <= rebate_rules["max_income"] else 0.0
        tax_after_rebate = max(0, gross_tax - rebate)
        
        # Apply 4% Health & Education Cess
        cess = tax_after_rebate * (self.rules["cess_percent"] / 100.0)
        final_tax = tax_after_rebate + cess
        
        return {
            "taxable_income": taxable_income,
            "gross_tax": gross_tax,
            "rebate": rebate,
            "final_tax": final_tax
        }

    def analyze_profile(self, profile: UserProfile, transactions: List[Transaction]) -> Dict[str, Any]:
        """Orchestrates the entire comparison and returns a structured breakdown."""
        deductions_breakdown = self.aggregate_deductions(transactions, profile)
        
        total_allowed = sum(d["allowed"] for d in deductions_breakdown.values())
        
        old_regime_result = self.calculate_regime(profile.salary, total_allowed, "old_regime")
        new_regime_result = self.calculate_regime(profile.salary, 0, "new_regime") # Pass 0 because calculate_regime handles standard deduction internally
        
        old_tax = old_regime_result["final_tax"]
        new_tax = new_regime_result["final_tax"]
        
        recommended = "Old Regime" if old_tax < new_tax else "New Regime"
        savings = abs(old_tax - new_tax)

        # Calculate Real Health Metrics
        u80c = (deductions_breakdown["80C"]["allowed"] / 150000) * 100
        # 80D limit depends on age
        limit_80d = self.rules["limits"]["80D"]["self_family_above_60" if profile.age >= 60 else "self_family_below_60"]
        u80d = (deductions_breakdown["80D"]["allowed"] / limit_80d) * 100
        
        # Simple weighted score: 70% 80C, 30% 80D
        health_score = int((u80c * 0.7) + (u80d * 0.3))
        
        return {
            "income": profile.salary,
            "deductions": deductions_breakdown,
            "old_regime": {
                "taxable_income": old_regime_result["taxable_income"],
                "tax": old_tax
            },
            "new_regime": {
                "taxable_income": new_regime_result["taxable_income"],
                "tax": new_tax
            },
            "recommended": recommended,
            "savings": savings,
            "health_metrics": {
                "score": health_score,
                "utilization_80c": u80c,
                "utilization_80d": u80d
            }
        }

tax_engine = TaxEngine()
