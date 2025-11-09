from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.ai_agent import ai_agent

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Receives the full chat history from the frontend,
    passes it to the AI agent, and returns the agent's response
    along with recommended car IDs (if any).
    
    Frontend can fetch full car details using /api/vehicles/{id} for each car ID.
    """
    try:
        # Validate that we have messages
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Process the messages with the AI agent
        # Returns: (response_text, recommended_car_ids, scoring_method)
        response_content, recommended_car_ids, scoring_method = await ai_agent.process_message(request.messages)
        
        return ChatResponse(
            role="agent",
            content=response_content,
            recommended_car_ids=recommended_car_ids if recommended_car_ids else None,
            scoring_method=scoring_method
        )
    
    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

