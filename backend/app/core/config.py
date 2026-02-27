import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")

TAX_RULES_PATH = os.path.join(DATA_DIR, "tax_rules.json")
TAX_INSTRUMENTS_PATH = os.path.join(DATA_DIR, "tax_knowledge", "tax_instruments.csv")

# ML Model Config
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.55  # Adjusted threshold for practical bank statement matching
