import re
import json
from typing import List, Dict, Any, Optional

class LocalKnowledgeAdvisor:
    def __init__(self, knowledge_base_path: str):
        with open(knowledge_base_path, 'r') as f:
            self.kb = json.load(f)
        
        # Predefined keywords for extraction
        self.keywords = [
            "SIP", "ELSS", "PPF", "NPS", "LIC", "Term Insurance", 
            "Health Insurance", "80C", "80D", "Tax Regime", 
            "Old Regime", "New Regime", "Mutual Funds", "Investment", 
            "Tenure", "Returns", "Lock-in Period", "Premium", "Policy", "Deduction"
        ]
        
        # Intent mapping
        self.intent_keywords = {
            "tenure": ["tenure", "lock-in", "duration", "how long", "period"],
            "returns": ["return", "interest", "profit", "yield", "growth"],
            "tax": ["tax", "80C", "80D", "deduction", "benefit", "save"],
            "price": ["price", "premium", "cost", "how much", "amount"]
        }

    def extract_keywords(self, query: str) -> List[str]:
        query_upper = query.upper()
        found = []
        for kw in self.keywords:
            if re.search(rf"\b{re.escape(kw.upper())}\b", query_upper):
                found.append(kw)
        return found

    def detect_intent(self, query: str) -> Optional[str]:
        query_lower = query.lower()
        for intent, patterns in self.intent_keywords.items():
            for p in patterns:
                if p in query_lower:
                    return intent
        return None

    def get_response(self, query: str) -> Dict[str, Any]:
        found_keywords = self.extract_keywords(query)
        intent = self.detect_intent(query)
        
        if not found_keywords:
            return {
                "role": "assistant",
                "content": "Currently, OPAX supports advisory on 80C, 80D, SIP, ELSS, PPF, NPS, and Insurance policies. Could you please specify which of these you'd like to learn about?"
            }
        
        # Take the first primary keyword found
        primary_kw = found_keywords[0]
        
        # Check if we have data for this in KB
        # Mapping variations to KB keys
        kb_mapping = {
            "ELSS": "ELSS (Equity Linked Savings Scheme)",
            "PPF": "PPF (Public Provident Fund)",
            "NPS": "NPS (National Pension System)",
            "SSY": "Sukanya Samriddhi Yojana (SSY)",
            "80D": "Section 80D (Health Insurance)",
            "HEALTH INSURANCE": "Section 80D (Health Insurance)"
        }
        
        kb_key = kb_mapping.get(primary_kw.upper(), primary_kw)
        
        # Search in investment_options
        options_dict = self.kb.get("investment_options", {})
        data = None
        
        # 1. Search in 80C list
        if not data and "80C" in options_dict:
            for opt in options_dict["80C"]:
                if isinstance(opt, dict) and "name" in opt:
                    if primary_kw.upper() in opt["name"].upper() or opt["name"].upper() in primary_kw.upper():
                        data = opt
                        break
                        
        # 2. Check 80D
        if not data and (primary_kw.upper() == "80D" or "HEALTH" in primary_kw.upper()):
            d = options_dict.get("80D", {})
            data = {
                "name": "Section 80D (Health Insurance)",
                "limit": f"Up to ₹{d.get('self_family', {}).get('base', 25000)} for self/family, plus ₹{d.get('parents', {}).get('senior_citizen', 50000)} for senior parents.",
                "tax_status": "Deduction under Section 80D",
                "risk_level": "N/A (Insurance)",
                "lock_in": "Annual Premium"
            }
            
        # 3. Check NPS
        if not data and primary_kw.upper() == "NPS":
            nps = options_dict.get("NPS", {})
            data = {
                "name": "NPS (National Pension System)",
                "limit": f"Additional ₹{nps.get('80CCD_1B', 50000)} under 80CCD(1B)",
                "tax_status": "EET (Exempt, Exempt, Partially Taxable)",
                "risk_level": "Market-linked (Moderate)",
                "lock_in": nps.get("lock_in", "Until Age 60"),
                "returns": nps.get("maturity", "Market Dependent")
            }
        
        if not data:
             return {
                "role": "assistant",
                "content": f"I found a reference to {primary_kw}, but I don't have detailed structured data for it yet. OPAX is expanding its local knowledge base every day!"
            }

        if intent == "tenure":
            content = f"The lock-in period for **{data['name']}** is **{data.get('lock_in', 'Not applicable')}**."
        elif intent == "returns":
            ret = data.get('expected_returns', data.get('interest_rate', data.get('returns', 'Not specified')))
            content = f"**{data['name']}** typically offers returns of **{ret}**."
        elif intent == "tax":
            content = f"**{data['name']}** provides benefits under **{data.get('tax_status', 'N/A')}**. It falls under the **{data.get('risk_level', data.get('risk', 'N/A'))}** risk category."
        else:
            # General overview if no specific intent
            ret = data.get('expected_returns', data.get('interest_rate', data.get('returns', 'Not specified')))
            content = f"You are asking about **{data['name']}**.\n\nHere are the available details:\n1. **Lock-in Period**: {data.get('lock_in', 'N/A')}\n2. **Expected Returns**: {ret}\n3. **Tax Benefits**: {data.get('tax_status', 'N/A')}\n4. **Risk Level**: {data.get('risk_level', data.get('risk', 'N/A'))}\n\nWhich one would you like to explore further?"

        return {
            "role": "assistant",
            "content": content
        }

# Singleton instance
import os
KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json")
local_advisor = LocalKnowledgeAdvisor(KNOWLEDGE_BASE_PATH)
