from fastapi import APIRouter, Depends, HTTPException
from app.models.chat_models import ChatRequest, ChatResponse
from app.services.ai_agent import ai_agent

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_opax(request: ChatRequest):
    """
    Endpoint for the AI Chatbot.
    Takes the user's message, conversation history, and current tax context 
    and returns an AI-generated personalized response.
    """
    try:
        # Convert Pydantic history objects to dicts for the agent
        history_dicts = []
        if request.history:
            for h in request.history:
                history_dicts.append({"role": h.role, "content": h.content})
                
        # Generate the AI response
        response_text = ai_agent.generate_response(
            message=request.message,
            context=request.user_context,
            history=history_dicts
        )
        
        return ChatResponse(reply=response_text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
