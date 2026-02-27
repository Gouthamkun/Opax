from app.services.tax_engine import tax_engine
from app.models.schemas import UserProfile, Transaction
from app.ml.transaction_classifier import classifier

# Test profile representing a typical user
test_profile = UserProfile(
    name="Goutham",
    salary=1200000,
    age=28,
    risk_appetite="moderate",
    financial_year="2024-2025"
)

# Simulated transactions where ML classifier should recognize the instruments
simulated_txns = [
    Transaction(date="2024-04-10", description="LIC Premium XYZ", amount=50000, category="insurance"),
    Transaction(date="2024-05-15", description="HDFC ELSS Tax Saver SIP", amount=60000, category="investment"),
    Transaction(date="2024-06-20", description="Star Health Insurance Renewal", amount=20000, category="health"),
    Transaction(date="2024-07-01", description="Amazon Shopping", amount=5000, category="shopping"), # Should be ignored
    Transaction(date="2024-08-01", description="LIC Premium Next Phase", amount=40000, category="insurance") # Will push 80C to 1.5L cap
]

def test_engine():
    print("--- 1. Classifying Transactions with ML ---")
    classified_txns = classifier.process_transactions(simulated_txns)
    for t in classified_txns:
        if t.is_tax_saving:
            print(f"✅ Matched [Section {t.tax_section}]: {t.amount} ({t.description})")
        else:
            print(f"❌ Ignored: {t.amount} ({t.description})")

    print("\n--- 2. Running Deterministic Tax Engine ---")
    result = tax_engine.analyze_profile(test_profile, classified_txns)
    
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_engine()
