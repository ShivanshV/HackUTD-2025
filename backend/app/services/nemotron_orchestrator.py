"""
Nemotron Orchestrator Service

Orchestrates tool calling, function execution, and AI agent interactions
using the NVIDIA Nemotron API with function calling capabilities.
"""

from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.models.chat import ChatMessage
from app.core.config import settings
from app.services.vehicle_service import vehicle_service
from app.tools.vehicle_tools import find_cars, calculate_true_cost, get_vehicle_details
import json


class NemotronOrchestrator:
    """Orchestrates AI agent interactions with tool calling capabilities"""
    
    def __init__(self):
        """Initialize the Nemotron client and tool definitions"""
        if settings.NEMOTRON_API_KEY:
            self.client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NEMOTRON_API_KEY
            )
        else:
            self.client = None
        
        # Define available tools/functions for the AI agent
        self.tools = self._define_tools()
    
    def _define_tools(self) -> List[Dict[str, Any]]:
        """Define the tools/functions available to the Nemotron API"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "find_cars",
                    "description": "Find Toyota vehicles matching specific criteria. Use this when the user is looking for a car with certain features, price range, fuel economy, or seating capacity.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "vehicle_type": {
                                "type": "string",
                                "description": "Type of vehicle (e.g., 'sedan', 'suv', 'truck') - maps to body_style",
                            },
                            "body_style": {
                                "type": "string",
                                "description": "Body style (e.g., 'sedan', 'suv', 'truck', 'coupe')",
                            },
                            "fuel_type": {
                                "type": "string",
                                "description": "Fuel type (e.g., 'gasoline', 'hybrid', 'electric')",
                            },
                            "max_price": {
                                "type": "number",
                                "description": "Maximum price in dollars",
                            },
                            "min_mpg": {
                                "type": "integer",
                                "description": "Minimum highway MPG (miles per gallon)",
                            },
                            "min_seating": {
                                "type": "integer",
                                "description": "Minimum number of seats",
                            },
                            "year": {
                                "type": "integer",
                                "description": "Model year",
                            },
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_true_cost",
                    "description": "Calculate the true cost of ownership for a vehicle including fuel costs, insurance, and maintenance over 5 years. Use this when the user asks about cost of ownership, total cost, or wants to compare vehicles based on cost.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "vehicle_id": {
                                "type": "string",
                                "description": "The ID of the vehicle (e.g., 'camry-2024', 'corolla-2024')",
                            },
                            "commute_miles": {
                                "type": "integer",
                                "description": "One-way commute distance in miles per day",
                            },
                            "gas_price": {
                                "type": "number",
                                "description": "Price per gallon of gas (default: 3.50)",
                                "default": 3.50,
                            },
                        },
                        "required": ["vehicle_id", "commute_miles"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_vehicle_details",
                    "description": "Get detailed information about a specific vehicle by its ID. Use this when the user asks about specific features, specifications, or details of a particular vehicle.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "vehicle_id": {
                                "type": "string",
                                "description": "The ID of the vehicle (e.g., 'camry-2024', 'corolla-2024')",
                            },
                        },
                        "required": ["vehicle_id"],
                    },
                },
            },
        ]
    
    def _convert_messages_to_nemotron_format(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Convert ChatMessage list to Nemotron API format"""
        formatted_messages = []
        
        # Add system message with tool awareness
        system_message = """You are a helpful Toyota vehicle assistant. You can help customers find vehicles, 
        compare options, calculate costs, and answer questions about Toyota vehicles.

        When users ask about vehicles, use the available tools to:
        1. Search for vehicles matching their criteria
        2. Get detailed information about specific vehicles
        3. Calculate ownership costs including fuel, insurance, and maintenance

        Be conversational, helpful, and provide detailed information about vehicles."""
        
        formatted_messages.append({
            "role": "system",
            "content": system_message
        })
        
        # Convert chat history
        for msg in messages:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return formatted_messages
    
    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Execute a tool function based on the tool name and arguments"""
        try:
            if tool_name == "find_cars":
                return find_cars(
                    vehicle_type=arguments.get("vehicle_type"),
                    body_style=arguments.get("body_style"),
                    fuel_type=arguments.get("fuel_type"),
                    max_price=arguments.get("max_price"),
                    min_mpg=arguments.get("min_mpg"),
                    min_seating=arguments.get("min_seating"),
                    year=arguments.get("year"),
                )
            elif tool_name == "calculate_true_cost":
                return calculate_true_cost(
                    vehicle_id=arguments.get("vehicle_id"),
                    commute_miles=arguments.get("commute_miles"),
                    gas_price=arguments.get("gas_price", 3.50),
                )
            elif tool_name == "get_vehicle_details":
                return get_vehicle_details(
                    vehicle_id=arguments.get("vehicle_id")
                )
            else:
                return {"error": f"Unknown tool: {tool_name}"}
        except Exception as e:
            return {"error": f"Error executing tool {tool_name}: {str(e)}"}
    
    async def process_message(self, messages: List[ChatMessage]) -> str:
        """
        Process incoming messages with tool calling support
        
        Args:
            messages: Full chat history
        
        Returns:
            Agent's response as a string
        """
        if not self.client:
            return "API key not configured. Please set NEMOTRON_API_KEY in .env file with a valid Nemotron API key."
        
        # Check if API key is a placeholder
        if settings.NEMOTRON_API_KEY and ("your-nemotron" in settings.NEMOTRON_API_KEY.lower() or 
                                           "your-key" in settings.NEMOTRON_API_KEY.lower() or
                                           len(settings.NEMOTRON_API_KEY) < 20):
            return ("⚠️ Nemotron API key appears to be invalid or a placeholder. "
                   "Please set a valid NEMOTRON_API_KEY in your .env file. "
                   "You can get an API key from: https://build.nvidia.com/nvidia/nemotron "
                   "\n\nNote: You can still test the vehicle search tools directly at /api/vehicles endpoints.")
        
        try:
            # Convert messages to Nemotron API format
            formatted_messages = self._convert_messages_to_nemotron_format(messages)
            
            # Maximum number of tool call iterations to prevent infinite loops
            max_iterations = 5
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                
                # Call Nemotron API with tool definitions
                completion = self.client.chat.completions.create(
                    model="nvidia/nvidia-nemotron-nano-9b-v2",
                    messages=formatted_messages,
                    tools=self.tools,
                    tool_choice="auto",  # Let the model decide when to use tools
                    temperature=settings.MODEL_TEMPERATURE,
                    top_p=0.95,
                    max_tokens=settings.MAX_TOKENS,
                    stream=False,  # Disable streaming for tool calling
                )
                
                message = completion.choices[0].message
                
                # Add the assistant's message to the conversation
                formatted_messages.append({
                    "role": "assistant",
                    "content": message.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            }
                        } for tc in (message.tool_calls or [])
                    ] if message.tool_calls else None,
                })
                
                # If no tool calls, return the response
                if not message.tool_calls:
                    return message.content or "I'm here to help!"
                
                # Execute tool calls
                for tool_call in message.tool_calls:
                    tool_name = tool_call.function.name
                    try:
                        tool_arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        tool_arguments = {}
                    
                    # Execute the tool
                    tool_result = self._execute_tool(tool_name, tool_arguments)
                    
                    # Add tool result to conversation
                    formatted_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps(tool_result) if isinstance(tool_result, (dict, list)) else str(tool_result),
                    })
                
                # Continue the conversation with tool results
                # The model will process the tool results and generate a final response
            
            # If we've reached max iterations, return a response
            final_completion = self.client.chat.completions.create(
                model="nvidia/nvidia-nemotron-nano-9b-v2",
                messages=formatted_messages,
                tools=self.tools,
                tool_choice="none",  # Force no more tool calls
                temperature=settings.MODEL_TEMPERATURE,
                max_tokens=settings.MAX_TOKENS,
            )
            
            return final_completion.choices[0].message.content or "I'm here to help!"
            
        except Exception as e:
            print(f"Error in Nemotron orchestrator: {e}")
            import traceback
            traceback.print_exc()
            return f"Error: {str(e)}"
    
    def process_message_streaming(self, messages: List[ChatMessage]):
        """
        Process messages with streaming support (simplified version without tool calling)
        For streaming responses, tool calling is disabled for simplicity
        
        Args:
            messages: Full chat history
        
        Yields:
            Response chunks as strings
        """
        if not self.client:
            yield "API key not configured. Please set NEMOTRON_API_KEY in .env"
            return
        
        try:
            formatted_messages = self._convert_messages_to_nemotron_format(messages)
            
            completion = self.client.chat.completions.create(
                model="nvidia/nvidia-nemotron-nano-9b-v2",
                messages=formatted_messages,
                temperature=settings.MODEL_TEMPERATURE,
                top_p=0.95,
                max_tokens=settings.MAX_TOKENS,
                stream=True,
            )
            
            for chunk in completion:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            print(f"Error in streaming: {e}")
            yield f"Error: {str(e)}"


# Singleton instance
nemotron_orchestrator = NemotronOrchestrator()

