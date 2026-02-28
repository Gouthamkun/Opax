import requests
import sys

def test_chat(query: str):
    url = "http://127.0.0.1:8000/api/v1/chat"
    payload = {
        "message": query,
        "user_context": {"salary": 1200000, "age": 30},
        "history": []
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Query: '{query}'")
        print(f"Response: {data.get('reply')}\n")
    except Exception as e:
        print(f"Error testing query '{query}': {e}")
        if hasattr(e, 'response') and e.response:
             print(e.response.text)

if __name__ == "__main__":
    test_queries = [
        "What is the lock-in for ELSS?",
        "Tell me about PPF returns",
        "What are the tax benefits of Health Insurance?",
        "What is the tenure for NPS?",
        "Tell me a joke"
    ]
    
    for q in test_queries:
        test_chat(q)
