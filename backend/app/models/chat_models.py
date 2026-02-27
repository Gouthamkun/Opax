from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    user_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
