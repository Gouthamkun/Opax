import json
import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from app.services.tax_engine import tax_engine
from app.models.schemas import UserProfile, Transaction

def test_recommendations():
    profile = UserProfile(
        name="Test User",
        salary=1200000,
        age=28,
        risk_appetite="moderate",
        financial_year="2024-25"
    )
    
    # Mock transactions with low 80C and no NPS/80D
    transactions = [
        Transaction(date="2024-05-10", description="RANDOM", amount=5000)
    ]
    
    analysis = tax_engine.analyze_profile(profile, transactions)
    
    print(f"Health Score: {analysis['health_metrics']['score']}")
    print(f"Recommendations Count: {len(analysis['recommendations'])}")
    for rec in analysis['recommendations']:
        print(f"- {rec['title']}: {rec['description']}")

if __name__ == "__main__":
    test_recommendations()
