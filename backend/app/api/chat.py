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
        
        # Process the messages with the AI agent
        # Returns: (response_text, recommended_car_ids, scoring_method)
        response_content, recommended_car_ids, scoring_method = await ai_agent.process_message(request.messages)
        
        # Write recommended cars to AiSuggested.json
        if recommended_car_ids:
            try:
                # Get full vehicle data for recommended IDs
                recommended_vehicles = []
                for car_id in recommended_car_ids:
                    vehicle = vehicle_service.get_vehicle_by_id(car_id)
                    if vehicle:
                        # Convert Pydantic model to dict, handling any serialization issues
                        vehicle_dict = vehicle.dict()
                        recommended_vehicles.append(vehicle_dict)
                
                # Write to AiSuggested.json
                data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
                ai_suggested_path = os.path.join(data_dir, "AiSuggested.json")
                
                # Ensure directory exists
                os.makedirs(data_dir, exist_ok=True)
                
                with open(ai_suggested_path, "w") as f:
                    json.dump(recommended_vehicles, f, indent=2, default=str)
                
                print(f"✅ Wrote {len(recommended_vehicles)} vehicles to AiSuggested.json")
            except Exception as e:
                print(f"⚠️ Failed to write AiSuggested.json: {e}")
                import traceback
                traceback.print_exc()
        else:
            # Clear AiSuggested.json if no recommendations
            try:
                data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
                ai_suggested_path = os.path.join(data_dir, "AiSuggested.json")
                os.makedirs(data_dir, exist_ok=True)
                with open(ai_suggested_path, "w") as f:
                    json.dump([], f)
                print("✅ Cleared AiSuggested.json (no recommendations)")
            except Exception as e:
                print(f"⚠️ Failed to clear AiSuggested.json: {e}")
        
        return ChatResponse(
            role="agent",
            content=response_content,
            recommended_car_ids=recommended_car_ids if recommended_car_ids else None,
            scoring_method=scoring_method
        )
    
    except Exception as e:
        print(f"❌ Error processing chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

