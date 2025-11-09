from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.ai_agent import ai_agent
from app.services.vehicle_service import vehicle_service
import json
import os

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Receives the full chat history from the frontend,
    passes it to the AI agent, and returns the agent's response
    along with recommended car IDs (if any).
    
    Also writes recommended cars to AiSuggested.json for real-time updates.
    """
    try:
        # Validate that we have messages
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        print(f"📥 Received chat request with {len(request.messages)} messages")
        print(f"📝 Last user message: {request.messages[-1].content[:100] if request.messages else 'N/A'}")
        
        # Process the messages with the AI agent
        # Returns: (response_text, recommended_car_ids, scoring_method)
        response_content, recommended_car_ids, scoring_method = await ai_agent.process_message(request.messages)
        
        print(f"📤 Returning response: {len(response_content)} chars, {len(recommended_car_ids) if recommended_car_ids else 0} recommended cars")
        
        return ChatResponse(
            role="agent",
            content=response_content,
            recommended_car_ids=recommended_car_ids if recommended_car_ids else None,
            scoring_method=scoring_method
        )
    
    except Exception as e:
        print(f"Error processing chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

