"""
Orchestrator API Endpoints

Provides API endpoints for orchestrating AI agent interactions with tool calling.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.chat import ChatRequest, ChatResponse
from app.services.nemotron_orchestrator import nemotron_orchestrator
from typing import AsyncGenerator
import json

router = APIRouter()


@router.post("/orchestrator/chat", response_model=ChatResponse)
async def orchestrate_chat(request: ChatRequest):
    """
    Orchestrated chat endpoint with tool calling support
    
    This endpoint uses the Nemotron orchestrator which can:
    - Automatically decide when to use tools (find_cars, calculate_true_cost, etc.)
    - Execute tools based on user queries
    - Generate intelligent responses using tool results
    
    Receives the full chat history from the frontend,
    orchestrates tool calls and AI agent interactions,
    and returns the agent's response.
    """
    try:
        # Validate that we have messages
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Process the messages with the orchestrator
        # The orchestrator handles tool calling automatically
        response_content = await nemotron_orchestrator.process_message(request.messages)
        
        return ChatResponse(
            role="agent",
            content=response_content
        )
    
    except Exception as e:
        print(f"Error in orchestrator chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/orchestrator/chat/stream")
async def orchestrate_chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint (without tool calling)
    
    Provides a streaming response for real-time chat updates.
    Note: Streaming mode doesn't support tool calling for simplicity.
    For tool calling, use the /orchestrator/chat endpoint.
    """
    try:
        # Validate that we have messages
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        async def generate_stream() -> AsyncGenerator[str, None]:
            """Generate streaming response"""
            try:
                # Iterate through the sync generator
                # In an async context, we can yield from sync generators directly
                for chunk in nemotron_orchestrator.process_message_streaming(request.messages):
                    # Format as SSE (Server-Sent Events)
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_msg = f"Error: {str(e)}"
                yield f"data: {json.dumps({'content': error_msg, 'error': True})}\n\n"
                yield "data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    
    except Exception as e:
        print(f"Error in streaming orchestrator chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/orchestrator/tools")
async def get_available_tools():
    """
    Get list of available tools that the orchestrator can use
    
    Returns information about all tools that the AI agent can call
    """
    try:
        tools_info = []
        for tool in nemotron_orchestrator.tools:
            if tool.get("type") == "function":
                func_def = tool.get("function", {})
                tools_info.append({
                    "name": func_def.get("name"),
                    "description": func_def.get("description"),
                    "parameters": func_def.get("parameters", {}).get("properties", {}),
                    "required": func_def.get("parameters", {}).get("required", []),
                })
        
        return {
            "tools": tools_info,
            "count": len(tools_info)
        }
    
    except Exception as e:
        print(f"Error getting tools: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/orchestrator/status")
async def get_orchestrator_status():
    """
    Get orchestrator status and configuration
    
    Returns the current status of the orchestrator including:
    - API key configuration status
    - Available tools count
    - Model configuration
    """
    try:
        from app.core.config import settings
        
        return {
            "status": "active" if nemotron_orchestrator.client else "inactive",
            "api_key_configured": bool(settings.NEMOTRON_API_KEY),
            "tools_count": len(nemotron_orchestrator.tools),
            "model": "nvidia/nvidia-nemotron-nano-9b-v2",
            "temperature": settings.MODEL_TEMPERATURE,
            "max_tokens": settings.MAX_TOKENS,
        }
    
    except Exception as e:
        print(f"Error getting orchestrator status: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

