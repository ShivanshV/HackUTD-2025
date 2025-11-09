"""
AI Agent Service - Nemotron API Configuration
"""

from typing import List, Dict
from openai import OpenAI  # OpenAI SDK used for Nemotron API (compatible format)
from app.models.chat import ChatMessage
from app.core.config import settings

class AIAgent:
    """AI Agent powered by NVIDIA Nemotron API"""
    
    def __init__(self):
        """Initialize the Nemotron client"""
        if settings.NEMOTRON_API_KEY:
            self.client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NEMOTRON_API_KEY
            )
        else:
            self.client = None
    
    def _convert_messages_to_nemotron_format(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Convert ChatMessage list to Nemotron API format"""
        formatted_messages = []
        
        # Add system message
        formatted_messages.append({
            "role": "system",
            "content": "You are a helpful Toyota vehicle assistant."
        })
        
        # Convert chat history
        for msg in messages:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return formatted_messages
    
    async def process_message(self, messages: List[ChatMessage]) -> str:
        """
        Process incoming messages and generate a response using Nemotron API
        
        Args:
            messages: Full chat history
        
        Returns:
            Agent's response as a string
        """
        if not self.client:
            return "API key not configured. Please set NEMOTRON_API_KEY in .env"
        
        try:
            # Convert messages to Nemotron API format
            formatted_messages = self._convert_messages_to_nemotron_format(messages)
            
            # Call Nemotron API with streaming and reasoning
            completion = self.client.chat.completions.create(
                model="nvidia/nvidia-nemotron-nano-9b-v2",
                messages=formatted_messages,
                temperature=settings.MODEL_TEMPERATURE,
                top_p=0.95,
                max_tokens=settings.MAX_TOKENS,
                frequency_penalty=0,
                presence_penalty=0,
                stream=True,
                extra_body={
                    "min_thinking_tokens": 512,
                    "max_thinking_tokens": 1024
                }
            )
            
            # Collect the response (streaming)
            response_content = ""
            for chunk in completion:
                # Handle reasoning content (thinking tokens)
                reasoning = getattr(chunk.choices[0].delta, "reasoning_content", None)
                if reasoning:
                    pass  # Reasoning tokens handled but not returned
                
                # Collect actual response content
                if chunk.choices[0].delta.content is not None:
                    response_content += chunk.choices[0].delta.content
            
            return response_content.strip() if response_content.strip() else "I'm here to help!"
            
        except Exception as e:
            print(f"Error calling Nemotron API: {e}")
            return f"Error: {str(e)}"

# Singleton instance
ai_agent = AIAgent()
