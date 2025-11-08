from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.ai_agent import ai_agent

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Receives the full chat history from the frontend,
    passes it to the AI agent, and returns the agent's response.
    """
    try:
        # Validate that we have messages
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Process the messages with the AI agent
        # The agent has access to the full chat history as "memory"
        response_content = await ai_agent.process_message(request.messages)
        
        return ChatResponse(
            role="agent",
            content=response_content
        )
    
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

