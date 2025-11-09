# Implementation Roadmap: Nemotron Orchestration

## Current State Assessment

### ✅ What You Have (Sufficient):

1. **Services Ready**:
   - ✅ `catalog_scoring_service.score_cars_for_user(profile)` - Works
   - ✅ `financial_service.evaluate_affordability(car, profile)` - Works
   - ✅ `catalog_scoring_service.get_all_cars()` - Works
   - ✅ `_get_car_details(car_id)` - Works

2. **Nemotron Client**:
   - ✅ OpenAI SDK configured
   - ✅ API key configured
   - ✅ Base URL configured
   - ✅ Model: `nvidia/nvidia-nemotron-nano-9b-v2`

3. **Data Structures**:
   - ✅ User profile extraction (can be used by Nemotron)
   - ✅ Financial profile extraction (can be used by Nemotron)

### ❌ What's Missing (Not Sufficient):

1. **Tool Definitions**: Need to define tools in OpenAI function calling format
2. **Tool Execution**: Need `execute_tool()` function
3. **Tool Calling Support**: API call doesn't include `tools` parameter
4. **Tool Call Loop**: No loop to handle multiple tool calls
5. **Tool Result Formatting**: Need to format results as JSON strings

## What Needs to Be Added

### Step 1: Define Tools (~50 lines)

Add to `ai_agent.py`:

```python
def _define_tools(self) -> List[Dict[str, Any]]:
    """Define tools available to Nemotron for orchestration"""
    return [
        {
            "type": "function",
            "function": {
                "name": "score_cars_for_user",
                "description": "Score and rank Toyota vehicles based on user preferences. Use this when the user provides vehicle requirements like budget, passengers, priorities, features, or terrain.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "budget_max": {
                            "type": "number",
                            "description": "Maximum budget in dollars"
                        },
                        "passengers": {
                            "type": "integer",
                            "description": "Number of passengers needed"
                        },
                        "priorities": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "User priorities: fuel_efficiency, safety, space, performance, budget"
                        },
                        "features_wanted": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Desired features: awd, hybrid, 3_row_seating, etc."
                        },
                        "terrain": {
                            "type": "string",
                            "description": "Driving terrain: city, highway, offroad, rough_city"
                        },
                        "commute_miles": {
                            "type": "integer",
                            "description": "One-way commute distance in miles"
                        },
                        "has_children": {
                            "type": "boolean",
                            "description": "Whether user has children (needs baby seat room)"
                        },
                        "needs_ground_clearance": {
                            "type": "boolean",
                            "description": "Whether user needs good ground clearance for potholes/speed bumps"
                        },
                        "weights": {
                            "type": "object",
                            "description": "Custom scoring weights (optional). Keys: budget, fuel_efficiency, seating, drivetrain, vehicle_type, performance, features, safety. Values should sum to ~1.0"
                        }
                    },
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "evaluate_affordability",
                "description": "Calculate affordability for a specific vehicle based on financial profile. Use this when the user provides financial information (income, credit score, down payment) and you want to check if a specific car is affordable.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "vehicle_id": {
                            "type": "string",
                            "description": "Car ID (e.g., 'prius-le-2020', 'camry-le-2018')"
                        },
                        "annual_income": {
                            "type": "number",
                            "description": "Annual income in dollars"
                        },
                        "monthly_income": {
                            "type": "number",
                            "description": "Monthly income in dollars"
                        },
                        "credit_score": {
                            "type": ["integer", "string"],
                            "description": "Credit score: numeric (300-850) or text (excellent, good, fair, poor)"
                        },
                        "down_payment": {
                            "type": "number",
                            "description": "Down payment amount in dollars"
                        },
                        "loan_term_months": {
                            "type": "integer",
                            "description": "Loan term in months (default: 60)"
                        },
                        "trade_in_value": {
                            "type": "number",
                            "description": "Trade-in value in dollars"
                        }
                    },
                    "required": ["vehicle_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_all_cars",
                "description": "Get all Toyota vehicles from the catalog. Use this when you need to see the full catalog or search for specific vehicles.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_car_details",
                "description": "Get detailed information about a specific vehicle by ID. Use this when the user asks about a specific car or you need detailed specs for a vehicle.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "vehicle_id": {
                            "type": "string",
                            "description": "Car ID (e.g., 'prius-le-2020', 'camry-le-2018')"
                        }
                    },
                    "required": ["vehicle_id"]
                }
            }
        }
    ]
```

### Step 2: Implement Tool Execution (~30 lines)

Add to `ai_agent.py`:

```python
def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
    """Execute a tool function based on tool name and arguments"""
    try:
        if tool_name == "score_cars_for_user":
            # Call catalog scoring service
            return self.catalog.score_cars_for_user(arguments)
        
        elif tool_name == "evaluate_affordability":
            # Get car details first
            vehicle_id = arguments.get("vehicle_id")
            car = self._get_car_details(vehicle_id)
            if not car:
                return {"error": f"Vehicle {vehicle_id} not found"}
            
            # Create financial profile from arguments
            financial_profile = {
                "annual_income": arguments.get("annual_income"),
                "monthly_income": arguments.get("monthly_income"),
                "credit_score": arguments.get("credit_score"),
                "down_payment": arguments.get("down_payment"),
                "loan_term_months": arguments.get("loan_term_months", 60),
                "trade_in_value": arguments.get("trade_in_value")
            }
            
            # Remove None values
            financial_profile = {k: v for k, v in financial_profile.items() if v is not None}
            
            # Evaluate affordability
            affordability = financial_service.evaluate_affordability(car, financial_profile)
            
            # Return as dict for JSON serialization
            return {
                "vehicle_id": vehicle_id,
                "monthly_payment": affordability.monthly_payment,
                "down_payment_required": affordability.down_payment_required,
                "total_cost_5yr": affordability.total_cost_5yr,
                "debt_to_income_ratio": affordability.debt_to_income_ratio,
                "affordability_score": affordability.affordability_score,
                "affordable": affordability.affordable,
                "warnings": affordability.warnings
            }
        
        elif tool_name == "get_all_cars":
            return self.catalog.get_all_cars()
        
        elif tool_name == "get_car_details":
            vehicle_id = arguments.get("vehicle_id")
            car = self._get_car_details(vehicle_id)
            if not car:
                return {"error": f"Vehicle {vehicle_id} not found"}
            return car
        
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    
    except Exception as e:
        return {"error": f"Error executing tool {tool_name}: {str(e)}"}
```

### Step 3: Modify API Call (~5 lines)

Change from:
```python
completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
    stream=True,  # ← Currently streaming
    ...
)
```

To:
```python
completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    tools=self.tools,  # ← Add tools
    tool_choice="auto",  # ← Let Nemotron decide
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
    stream=False,  # ← Change to False (tool calling requires non-streaming)
    ...
)
```

### Step 4: Implement Tool Call Loop (~50 lines)

Replace the current single API call with a loop:

```python
# Initialize tools in __init__
def __init__(self):
    ...
    self.tools = self._define_tools()  # ← Add this

# In process_message(), replace single API call with loop:
max_iterations = 5
iteration = 0

while iteration < max_iterations:
    iteration += 1
    
    # Call Nemotron API
    completion = self.client.chat.completions.create(
        model="nvidia/nvidia-nemotron-nano-9b-v2",
        messages=formatted_messages,
        tools=self.tools,
        tool_choice="auto",
        temperature=settings.MODEL_TEMPERATURE,
        max_tokens=settings.MAX_TOKENS,
        stream=False,
    )
    
    message = completion.choices[0].message
    
    # Add assistant's message to conversation
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
        return (message.content or "I'm here to help!", recommended_car_ids_list, scoring_method)
    
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
    
    # Continue loop - Nemotron will process tool results and generate response

# If we've reached max iterations, force a final response
final_completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    tools=self.tools,
    tool_choice="none",  # Force no more tool calls
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
)

return (final_completion.choices[0].message.content or "I'm here to help!", recommended_car_ids_list, scoring_method)
```

## Total Code to Add

- **Tool definitions**: ~50 lines
- **Tool execution**: ~30 lines
- **Tool call loop**: ~50 lines
- **Modify API call**: ~5 lines
- **Initialize tools**: ~1 line

**Total: ~136 lines of code**

## Is Current Code Sufficient?

### Partially Sufficient:

✅ **Services exist and work**:
- `catalog_scoring_service` ✅
- `financial_service` ✅
- Helper functions ✅

✅ **Nemotron client configured**:
- OpenAI SDK ✅
- API key ✅
- Base URL ✅

❌ **Missing tool calling infrastructure**:
- No tool definitions
- No tool execution function
- No tool call loop
- API call doesn't support tools

## Recommendation

### Option 1: Keep Current (Python Orchestrates)
**Best if:**
- You want fast, reliable responses
- Current logic handles most cases
- You want to minimize API costs

### Option 2: Add Nemotron Orchestration
**Best if:**
- You want Nemotron to decide what to do
- You want flexibility for edge cases
- You're okay with multiple API calls

**Implementation effort**: ~136 lines of code

### Option 3: Hybrid Approach
**Best if:**
- You want best of both worlds
- Use Python for standard queries
- Use Nemotron orchestration for complex queries

**Implementation effort**: ~200 lines of code (both approaches)

## Next Steps

If you want to enable Nemotron orchestration:

1. **Add tool definitions** (Step 1)
2. **Add tool execution** (Step 2)
3. **Modify API call** (Step 3)
4. **Implement tool call loop** (Step 4)
5. **Test with simple queries**
6. **Handle edge cases**

The current code is **partially sufficient** - you have all the services, but need to add the tool calling infrastructure (~136 lines).

