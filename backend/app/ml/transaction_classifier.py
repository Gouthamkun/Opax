import pandas as pd
import numpy as np
import os
import time

# We use lazy imports for heavy ML libraries so the FastAPI app starts instantly for other tests
from typing import List, Dict

class TransactionClassifier:
    _instance = None

    def __new__(cls):
        # Implement Singleton to ensure we load the model & embeddings only once
        if cls._instance is None:
            cls._instance = super(TransactionClassifier, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.knowledge_base = None
            cls._instance.kb_embeddings = None
        return cls._instance

    def _init_model(self):
        """Lazy load the sentence transformer model to prevent long boot times."""
        from sentence_transformers import SentenceTransformer
        from app.core.config import EMBEDDING_MODEL_NAME, TAX_INSTRUMENTS_PATH
        
        if self.model is None:
            print(f"Loading SentenceTransformer: {EMBEDDING_MODEL_NAME}...")
            start = time.time()
            self.model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            print(f"Model loaded in {time.time() - start:.2f}s")
            
        if self.knowledge_base is None:
            self.knowledge_base = pd.read_csv(TAX_INSTRUMENTS_PATH)
            # Create a rich text description combining name and category for better matching
            texts_to_embed = (self.knowledge_base['instrument_name'] + " " +
                              self.knowledge_base['provider'].fillna('') + " " +
                              self.knowledge_base['category'].fillna('')).tolist()
                              
            print("Embedding knowledge base...")
            self.kb_embeddings = self.model.encode(texts_to_embed)

    def classify_transaction(self, description: str) -> dict:
        """
        Takes a transaction description, computes cosine similarity against
        all known tax instruments, and returns the best match if threshold is met.
        """
        from sklearn.metrics.pairwise import cosine_similarity
        from app.core.config import SIMILARITY_THRESHOLD
        
        self._init_model()  # Ensure ML is loaded

        # Remove common bank noise
        clean_desc = description.replace("upi", "").replace("netbanking", "").replace("ecs", "")
        
        # Embed the query
        query_embedding = self.model.encode([clean_desc])
        
        # Calculate similarity [1, N] array
        similarities = cosine_similarity(query_embedding, self.kb_embeddings)[0]
        
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]
        
        if best_score >= SIMILARITY_THRESHOLD:
            match = self.knowledge_base.iloc[best_idx]
            return {
                "is_match": True,
                "score": float(best_score),
                "section": match['section'],
                "category": match['category'],
                "instrument": match['instrument_name']
            }
            
        return {"is_match": False, "score": float(best_score)}

    def process_transactions(self, transactions: list) -> list:
        """Enriches a list of Transaction models with tax classifications."""
        from app.models.schemas import Transaction
        
        for txn in transactions:
            # We already ran clean_description during parsing
            result = self.classify_transaction(txn.description)
            if result['is_match']:
                txn.tax_section = result['section']
                txn.category = result['category']
                txn.is_tax_saving = True
            
        return transactions

# Global instance
classifier = TransactionClassifier()
