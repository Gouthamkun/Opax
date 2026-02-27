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

    def run_simulation(self, salary: float, age: int, inv_80c: float, inv_80d: float, inv_nps: float) -> Dict[str, Any]:
        """Runs a tax simulation with manual investment overrides instead of transaction parsing."""
        # Determine 80D age limit key
        age_key = "self_family_above_60" if age >= 60 else "self_family_below_60"
        limits = self.rules["limits"]
        
        # Construct simulation deductions
        st_deduction_old = self.rules["standard_deduction"]["old_regime"]
        deductions_breakdown = {
            "80C": {"claimed": inv_80c, "allowed": min(inv_80c, limits["80C"])},
            "80D": {"claimed": inv_80d, "allowed": min(inv_80d, limits["80D"][age_key])},
            "80CCD_1B": {"claimed": inv_nps, "allowed": min(inv_nps, limits["80CCD_1B"])},
            "Standard_Deduction": {"claimed": st_deduction_old, "allowed": st_deduction_old}
        }
        
        total_allowed = sum(d["allowed"] for d in deductions_breakdown.values())
        
        old_regime_result = self.calculate_regime(salary, total_allowed, "old_regime")
        new_regime_result = self.calculate_regime(salary, 0, "new_regime")
        
        old_tax = old_regime_result["final_tax"]
        new_tax = new_regime_result["final_tax"]
        
        recommended = "Old Regime" if old_tax < new_tax else "New Regime"
        savings = abs(old_tax - new_tax)
        
        # Calculate Health Metrics
        u80c = (deductions_breakdown["80C"]["allowed"] / 150000) * 100
        limit_80d = limits["80D"][age_key]
        u80d = (deductions_breakdown["80D"]["allowed"] / limit_80d) * 100
        health_score = int((u80c * 0.7) + (u80d * 0.3))
        
        return {
            "old_tax": old_tax,
            "new_tax": new_tax,
            "tax_saved": savings,
            "recommended": recommended,
            "savings_gap": max(0, 200000 - (deductions_breakdown["80C"]["allowed"] + deductions_breakdown["80D"]["allowed"])),
            "health_score": health_score
        }

    def get_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generates dynamic recommendations based on tax gaps and expert knowledge base."""
        recs = []
        deductions = analysis["deductions"]
        salary = analysis["income"]
        
        # 80C Check
        gap_80c = 150000 - deductions["80C"]["allowed"]
        if gap_80c > 5000:
            # High income + high risk -> ELSS
            if salary > 1200000:
                recs.append({
                    "month": "MONTH 1-2",
                    "title": "Equity Tax Savings (ELSS)",
                    "description": f"With your income level, ELSS funds offer the best growth potential with the shortest lock-in (3 years). Goal: ₹{gap_80c:,.0f}.",
                    "amount": f"₹{gap_80c/4:,.0f}/mo",
                    "icon": "TrendingUp",
                    "color": "bg-brandBlue"
                })
            else:
                recs.append({
                    "month": "MONTH 1-2",
                    "title": "Wealth Safety (PPF)",
                    "description": f"Secure your future with the Public Provident Fund (PPF). It's tax-free interest (EEE) makes it ideal for you. Goal: ₹{gap_80c:,.0f}.",
                    "amount": f"₹{gap_80c/6:,.0f}/mo",
                    "icon": "ShieldCheck",
                    "color": "bg-brandBlue"
                })

        # Family Check (Special logic for SSY)
        # Note: In a real app we'd check if they have a daughter. For now, we'll mention it as an option.
        if gap_80c > 50000:
            recs.append({
                "month": "MONTH 2",
                "title": "Sukanya Samriddhi (SSY)",
                "description": "If you have a daughter under 10, SSY offers a superior 8.2% tax-free return, higher than PPF.",
                "amount": "As needed",
                "icon": "BrainCircuit",
                "color": "bg-accentCyan"
            })
            
        # 80D Check
        u80d = analysis["health_metrics"]["utilization_80d"]
        if u80d < 100:
            limit_80d = 25000 # Standard
            missing = limit_80d - deductions["80D"]["allowed"]
            if missing > 0:
                recs.append({
                    "month": "MONTH 3",
                    "title": "Comprehensive Health Floater",
                    "description": "You are under-insured. A family health floater not only protects your family but also fills your 80D gap.",
                    "amount": f"₹{missing:,.0f}",
                    "icon": "ShieldCheck",
                    "color": "bg-brandGreen"
                })
            
        # NPS Check
        nps_allowed = deductions.get("80CCD_1B", {}).get("allowed", 0)
        if nps_allowed < 50000:
            gap_nps = 50000 - nps_allowed
            recs.append({
                "month": "MONTH 4-6",
                "title": "NPS Additional Benefit",
                "description": "Utilize Section 80CCD(1B) for an extra ₹50,000 deduction on top of 80C. Best for retirement growth.",
                "amount": f"₹{gap_nps/3:,.0f}/mo",
                "icon": "Zap",
                "color": "bg-brandBlue"
            })
            
        return recs

    def analyze_profile(self, profile: UserProfile, transactions: List[Transaction]) -> Dict[str, Any]:
        """Orchestrates the entire comparison and returns a structured breakdown."""
        deductions_breakdown = self.aggregate_deductions(transactions, profile)
        
        total_allowed = sum(d["allowed"] for d in deductions_breakdown.values())
        
        old_regime_result = self.calculate_regime(profile.salary, total_allowed, "old_regime")
        new_regime_result = self.calculate_regime(profile.salary, 0, "new_regime") 
        
        old_tax = old_regime_result["final_tax"]
        new_tax = new_regime_result["final_tax"]
        
        recommended = "Old Regime" if old_tax < new_tax else "New Regime"
        savings = abs(old_tax - new_tax)

        u80c = (deductions_breakdown["80C"]["allowed"] / 150000) * 100
        limit_80d = self.rules["limits"]["80D"]["self_family_above_60" if profile.age >= 60 else "self_family_below_60"]
        u80d = (deductions_breakdown["80D"]["allowed"] / limit_80d) * 100
        
        health_score = int((u80c * 0.7) + (u80d * 0.3))
        
        analysis = {
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
        
        # Add dynamic recommendations
        analysis["recommendations"] = self.get_recommendations(analysis)
        
        return analysis

tax_engine = TaxEngine()
