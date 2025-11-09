# Requirements for Nemotron Orchestration

## Current State vs. Required State

### Current Implementation (Python Orchestrates)
```
Python Code:
  - Extracts profiles
  - Decides what to do
  - Calls services directly
  - Filters/sorts results
  - Sends to Nemotron for explanation
```

### Required for Nemotron Orchestration
```
Nemotron API:
  - Analyzes user query
  - Decides which tools to call
  - Calls tools (scoring service, financial service)
  - Processes tool results
  - Generates response
```

## What's Needed: Function Calling / Tool Calling

### 1. Define Tools/Functions for Nemotron

Nemotron needs to know what tools it can call. You need to define:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "score_cars_for_user",
            "description": "Score and rank Toyota vehicles based on user preferences (budget, passengers, priorities, features, etc.)",
            "parameters": {
                "type": "object",
                "properties": {
                    "budget_max": {"type": "number", "description": "Maximum budget in dollars"},
                    "passengers": {"type": "integer", "description": "Number of passengers needed"},
                    "priorities": {"type": "array", "items": {"type": "string"}, "description": "User priorities: fuel_efficiency, safety, space, performance, budget"},
                    "features_wanted": {"type": "array", "items": {"type": "string"}, "description": "Desired features: awd, hybrid, 3_row_seating, etc."},
                    "terrain": {"type": "string", "description": "Driving terrain: city, highway, offroad"},
                    "commute_miles": {"type": "integer", "description": "One-way commute distance in miles"},
                    "weights": {"type": "object", "description": "Custom scoring weights (optional)"}
                },
                "required": ["budget_max"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "evaluate_affordability",
            "description": "Calculate affordability for a specific vehicle based on financial profile",
            "parameters": {
                "type": "object",
                "properties": {
                    "vehicle_id": {"type": "string", "description": "Car ID (e.g., 'prius-le-2020')"},
                    "annual_income": {"type": "number", "description": "Annual income in dollars"},
                    "monthly_income": {"type": "number", "description": "Monthly income in dollars"},
                    "credit_score": {"type": ["integer", "string"], "description": "Credit score (numeric or text: excellent, good, fair, poor)"},
                    "down_payment": {"type": "number", "description": "Down payment amount in dollars"},
                    "loan_term_months": {"type": "integer", "description": "Loan term in months (default: 60)"},
                    "trade_in_value": {"type": "number", "description": "Trade-in value in dollars"}
                },
                "required": ["vehicle_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_cars",
            "description": "Get all Toyota vehicles from the catalog",
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
            "description": "Get detailed information about a specific vehicle by ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "vehicle_id": {"type": "string", "description": "Car ID (e.g., 'prius-le-2020')"}
                },
                "required": ["vehicle_id"]
            }
        }
    }
]
```

### 2. Implement Tool Execution Functions

You need functions that Nemotron can call:

```python
def execute_tool(tool_name: str, arguments: dict) -> Any:
    """Execute a tool function based on tool name and arguments"""
    if tool_name == "score_cars_for_user":
        return catalog_scoring_service.score_cars_for_user(arguments)
    elif tool_name == "evaluate_affordability":
        car = get_car_by_id(arguments["vehicle_id"])
        return financial_service.evaluate_affordability(car, arguments)
    elif tool_name == "get_all_cars":
        return catalog_scoring_service.get_all_cars()
    elif tool_name == "get_car_details":
        return get_car_by_id(arguments["vehicle_id"])
    else:
        return {"error": f"Unknown tool: {tool_name}"}
```

### 3. Modify Nemotron API Call to Support Tool Calling

Current call (no tools):
```python
completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
    stream=True,
)
```

Required call (with tools):
```python
completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    tools=tools,  # ← Add tools
    tool_choice="auto",  # ← Let Nemotron decide when to use tools
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
    stream=False,  # ← Tool calling typically requires non-streaming
)
```

### 4. Handle Tool Call Loop

Nemotron might call multiple tools in sequence. You need a loop:

```python
max_iterations = 5
iteration = 0

while iteration < max_iterations:
    iteration += 1
    
    # Call Nemotron
    completion = self.client.chat.completions.create(
        model="nvidia/nvidia-nemotron-nano-9b-v2",
        messages=formatted_messages,
        tools=tools,
        tool_choice="auto",
        ...
    )
    
    message = completion.choices[0].message
    
    # Add assistant's message to conversation
    formatted_messages.append({
        "role": "assistant",
        "content": message.content,
        "tool_calls": [...]  # If any
    })
    
    # If no tool calls, return response
    if not message.tool_calls:
        return message.content
    
    # Execute tool calls
    for tool_call in message.tool_calls:
        tool_name = tool_call.function.name
        tool_args = json.loads(tool_call.function.arguments)
        
        # Execute tool
        tool_result = execute_tool(tool_name, tool_args)
        
        # Add tool result to conversation
        formatted_messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": tool_name,
            "content": json.dumps(tool_result)
        })
    
    # Continue loop - Nemotron will process tool results and generate response
```

## Is Current Implementation Sufficient?

### ✅ What You Already Have:

1. **Services are ready**:
   - `catalog_scoring_service.score_cars_for_user()` ✅
   - `financial_service.evaluate_affordability()` ✅
   - `catalog_scoring_service.get_all_cars()` ✅

2. **Nemotron client is set up**:
   - OpenAI SDK configured ✅
   - API key configured ✅
   - Base URL configured ✅

3. **Data structures exist**:
   - User profile extraction (can be used by Nemotron) ✅
   - Financial profile extraction (can be used by Nemotron) ✅

### ❌ What's Missing:

1. **Tool definitions**: Need to define tools in OpenAI function calling format
2. **Tool execution**: Need `execute_tool()` function
3. **Tool calling support**: Need to add `tools` and `tool_choice` to API call
4. **Tool call loop**: Need to handle multiple tool calls in sequence
5. **Tool result formatting**: Need to format tool results as JSON strings

## Implementation Steps

### Step 1: Create Tool Definitions

```python
# In ai_agent.py or new orchestrator.py

def _define_tools(self) -> List[Dict[str, Any]]:
    """Define tools available to Nemotron"""
    return [
        {
            "type": "function",
            "function": {
                "name": "score_cars_for_user",
                "description": "Score and rank Toyota vehicles based on user preferences",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "budget_max": {"type": "number"},
                        "passengers": {"type": "integer"},
                        "priorities": {"type": "array", "items": {"type": "string"}},
                        # ... more properties
                    }
                }
            }
        },
        # ... more tools
    ]
```

### Step 2: Implement Tool Execution

```python
def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
    """Execute a tool function"""
    if tool_name == "score_cars_for_user":
        return self.catalog.score_cars_for_user(arguments)
    elif tool_name == "evaluate_affordability":
        car = self._get_car_details(arguments["vehicle_id"])
        return financial_service.evaluate_affordability(car, arguments)
    # ... more tools
```

### Step 3: Modify API Call

```python
# Add tools to API call
completion = self.client.chat.completions.create(
    model="nvidia/nvidia-nemotron-nano-9b-v2",
    messages=formatted_messages,
    tools=self.tools,  # ← Add this
    tool_choice="auto",  # ← Add this
    temperature=settings.MODEL_TEMPERATURE,
    max_tokens=settings.MAX_TOKENS,
    stream=False,  # ← Change to False for tool calling
)
```

### Step 4: Implement Tool Call Loop

```python
# Handle tool calling loop (see example above)
```

## Comparison: Current vs. Orchestrated

### Current (Python Orchestrates):
- ✅ Fast (one API call)
- ✅ Deterministic (always same logic)
- ✅ Reliable (no LLM decision errors)
- ❌ Less flexible (hardcoded logic)
- ❌ Can't adapt to unexpected queries

### Orchestrated (Nemotron Orchestrates):
- ✅ Flexible (Nemotron decides what to do)
- ✅ Adaptive (handles unexpected queries)
- ✅ More natural (Nemotron can reason about what tools to use)
- ❌ Slower (multiple API calls)
- ❌ More expensive (multiple API calls)
- ❌ Less reliable (Nemotron might make wrong decisions)

## Recommendation

### Option 1: Keep Current (Python Orchestrates)
**Best if:**
- You want fast, reliable responses
- You want deterministic behavior
- You want to minimize API costs
- Current logic handles most cases

### Option 2: Hybrid Approach
**Best if:**
- You want flexibility for edge cases
- You want Nemotron to handle complex queries
- You're okay with some latency

**Implementation:**
- Use Python orchestration for standard queries
- Use Nemotron orchestration for complex/ambiguous queries
- Let Nemotron decide which approach to use

### Option 3: Full Nemotron Orchestration
**Best if:**
- You want maximum flexibility
- You want Nemotron to handle all decision-making
- You're okay with higher costs/latency

## What You Need to Add

To enable Nemotron orchestration, you need to add:

1. **Tool definitions** (~50 lines)
2. **Tool execution function** (~30 lines)
3. **Tool call loop** (~50 lines)
4. **Modify API call** (~5 lines)

**Total: ~135 lines of code**

## Is Current Code Sufficient?

**Partially**: 
- ✅ Services exist and work
- ✅ Nemotron client is configured
- ❌ Missing tool definitions
- ❌ Missing tool execution
- ❌ Missing tool call loop
- ❌ API call doesn't support tools

**You need to add ~135 lines of code to enable Nemotron orchestration.**

