# How to Meet NVIDIA HackUTD Challenge Requirements

## Current Status: ❌ Does NOT Meet Requirements

**Score: 7/20**
- Reasoning: 2/5 (partial)
- Orchestration: 0/5 (missing)
- Tool Integration: 0/5 (missing)
- Practical Value: 5/5 (yes)

## What Needs to Change

### 1. Implement Function Calling (High Priority)

**Current**: Python calls services directly
**Required**: Nemotron calls tools via function calling

**Steps**:
1. Define tools in OpenAI function calling format
2. Implement `_execute_tool()` function
3. Add `tools` parameter to Nemotron API call
4. Implement tool call loop

**Code Changes**: ~136 lines (see `IMPLEMENTATION_ROADMAP.md`)

### 2. Enable Nemotron Orchestration (High Priority)

**Current**: Python orchestrates workflows
**Required**: Nemotron orchestrates workflows

**Steps**:
1. Remove Python orchestration logic (extract → decide → call → filter)
2. Let Nemotron decide which tools to call
3. Let Nemotron handle workflow planning
4. Nemotron analyzes results and decides next steps

**Code Changes**: Refactor `process_message()` to use tool calling

### 3. Enable Multi-Step Reasoning (Medium Priority)

**Current**: Single-step process
**Required**: Multi-step workflow planning

**Steps**:
1. Nemotron analyzes user query
2. Nemotron plans workflow (what tools to call, in what order)
3. Nemotron executes tools in sequence
4. Nemotron reasons about results
5. Nemotron decides if more tools are needed
6. Nemotron generates final response

**Code Changes**: Tool call loop with reasoning

### 4. Maintain Practical Value (Already Done)

**Current**: ✅ Car recommendation system
**Required**: ✅ Keep current functionality

**No Changes Needed**

## Implementation Plan

### Phase 1: Add Function Calling (~2 hours)

1. **Define Tools**:
   ```python
   def _define_tools(self) -> List[Dict[str, Any]]:
       return [
           {
               "type": "function",
               "function": {
                   "name": "score_cars_for_user",
                   "description": "Score and rank Toyota vehicles...",
                   "parameters": {...}
               }
           },
           {
               "type": "function",
               "function": {
                   "name": "evaluate_affordability",
                   "description": "Calculate affordability...",
                   "parameters": {...}
               }
           }
       ]
   ```

2. **Implement Tool Execution**:
   ```python
   def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
       if tool_name == "score_cars_for_user":
           return self.catalog.score_cars_for_user(arguments)
       elif tool_name == "evaluate_affordability":
           car = self._get_car_details(arguments["vehicle_id"])
           return financial_service.evaluate_affordability(car, arguments)
       # ...
   ```

3. **Add Tool Call Loop**:
   ```python
   max_iterations = 5
   while iteration < max_iterations:
       # Call Nemotron with tools
       completion = self.client.chat.completions.create(
           model="...",
           messages=formatted_messages,
           tools=self.tools,
           tool_choice="auto"
       )
       
       # If tool calls, execute them
       if completion.choices[0].message.tool_calls:
           for tool_call in completion.choices[0].message.tool_calls:
               result = self._execute_tool(tool_call.function.name, ...)
               # Add result to conversation
       else:
           # Nemotron is done
           return completion.choices[0].message.content
   ```

### Phase 2: Enable Nemotron Orchestration (~1 hour)

1. **Remove Python Orchestration**:
   - Remove profile extraction from Python
   - Remove decision logic (has_substantial_preferences, etc.)
   - Remove service calls from Python
   - Remove filtering/sorting from Python

2. **Let Nemotron Orchestrate**:
   - Nemotron extracts user profile from conversation
   - Nemotron decides which tools to call
   - Nemotron calls tools in sequence
   - Nemotron reasons about results
   - Nemotron generates response

### Phase 3: Enable Multi-Step Reasoning (~1 hour)

1. **Workflow Planning**:
   - Nemotron analyzes user query
   - Nemotron plans workflow (what tools to call)
   - Nemotron executes tools in sequence
   - Nemotron reasons about results
   - Nemotron decides if more tools are needed

2. **Conditional Logic**:
   - If user provides preferences → Call scoring service
   - If user provides financial info → Call financial service
   - If results are unclear → Call more tools
   - If results are clear → Generate response

## Expected Result

### Before (Current):
```
Python: Extract → Decide → Call → Filter → Send to Nemotron
Nemotron: Generate text
```

### After (Required):
```
Nemotron: Analyze query
Nemotron: Plan workflow
Nemotron: Call tool 1 (score_cars)
Nemotron: Analyze results
Nemotron: Call tool 2 (evaluate_affordability)
Nemotron: Reason about results
Nemotron: Generate response
```

## Compliance Score After Implementation

| Requirement | Before | After | Score |
|------------|--------|-------|-------|
| Reasoning beyond single-prompt | Partial | ✅ Yes | 5/5 |
| Workflow orchestration | ❌ No | ✅ Yes | 5/5 |
| Tool and API integration | ❌ No | ✅ Yes | 5/5 |
| Practical value | ✅ Yes | ✅ Yes | 5/5 |
| **Total** | **7/20** | **20/20** | **100%** |

## Timeline

- **Phase 1**: 2 hours (Function Calling)
- **Phase 2**: 1 hour (Nemotron Orchestration)
- **Phase 3**: 1 hour (Multi-Step Reasoning)
- **Testing**: 1 hour
- **Total**: ~5 hours

## Next Steps

1. **Implement function calling** (see `IMPLEMENTATION_ROADMAP.md`)
2. **Enable Nemotron orchestration** (remove Python orchestration)
3. **Test multi-step workflows** (verify Nemotron calls tools)
4. **Document workflow orchestration** (show Nemotron's reasoning)

## Key Files to Modify

1. `backend/app/services/ai_agent.py`:
   - Add `_define_tools()` method
   - Add `_execute_tool()` method
   - Refactor `process_message()` to use tool calling
   - Remove Python orchestration logic

2. `backend/app/core/config.py`:
   - No changes needed (already has API key config)

3. `backend/app/services/catalog_scoring.py`:
   - No changes needed (already works)

4. `backend/app/services/financial_service.py`:
   - No changes needed (already works)

## Testing Checklist

- [ ] Nemotron calls `score_cars_for_user` tool
- [ ] Nemotron calls `evaluate_affordability` tool
- [ ] Nemotron orchestrates multi-step workflows
- [ ] Nemotron reasons about tool results
- [ ] Nemotron generates appropriate responses
- [ ] Workflow adapts based on user input
- [ ] Multi-turn conversations work correctly
- [ ] Tool calls are logged for debugging

## Success Criteria

✅ Nemotron decides which tools to call
✅ Nemotron calls tools in sequence
✅ Nemotron reasons about tool results
✅ Nemotron adapts workflow based on results
✅ Multi-step workflows work correctly
✅ Meets all NVIDIA challenge requirements

## Conclusion

**Current Status**: ❌ Does NOT meet requirements
**After Implementation**: ✅ Will meet all requirements
**Effort Required**: ~5 hours
**Priority**: HIGH (Required for HackUTD challenge)

