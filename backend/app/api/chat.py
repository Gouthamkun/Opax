from fastapi import APIRouter, Depends, HTTPException
from app.models.chat_models import ChatRequest, ChatResponse
from app.services.local_advisor import local_advisor

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_opax(request: ChatRequest):
    """
    Endpoint for the Local RAG Chatbot.
    Uses deterministic keyword-based retrieval from local knowledge base.
    """
    try:
        # Generate the response using local advisor
        res = local_advisor.get_response(request.message)
        
        return ChatResponse(reply=res["content"])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
