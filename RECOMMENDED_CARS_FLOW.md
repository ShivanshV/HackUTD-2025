# Current Recommended Cars List Flow

## What's Currently Happening

### Backend (Orchestration Implementation)

1. **Initialization** (line 1287):
   ```python
   recommended_car_ids_list = []
   scoring_method = None
   ```
   - Starts empty
   - No cars tracked initially

2. **Tool Call Tracking** (lines 1359-1364):
   ```python
   if tool_name == "score_cars_for_user":
       scoring_method = "preference_based"
       if isinstance(tool_result, list):
           # Extract car IDs from scored results
           recommended_car_ids_list = [car.get("id") for car in tool_result[:10] if car.get("id")]
   ```
   - **Only tracks IDs when `score_cars_for_user` tool is called**
   - Takes first 10 cars from tool result
   - Ignores other tool calls (evaluate_affordability, get_car_details, etc.)

3. **Final Response** (lines 1332-1344):
   ```python
   if not message.tool_calls:
       response_text = message.content or "..."
       # Extract car IDs from response if available
       if recommended_car_ids_list:
           # Already extracted from tool calls
           pass
       else:
           # Try to extract from response text
           # This is a fallback if Nemotron doesn't explicitly return IDs
           pass
       return (response_text, recommended_car_ids_list, scoring_method)
   ```
   - Returns whatever is in `recommended_car_ids_list`
   - **Does NOT extract IDs from Nemotron's final response text**
   - Fallback logic is empty (just `pass`)

### Issues with Current Implementation

1. **Limited to `score_cars_for_user` tool**:
   - Only tracks IDs when this specific tool is called
   - If Nemotron calls other tools first, IDs aren't tracked
   - If Nemotron doesn't call this tool, list stays empty

2. **No extraction from final response**:
   - Doesn't parse Nemotron's text response for car IDs
   - Doesn't look for JSON blocks with recommended_car_ids
   - The fallback logic is empty

3. **Fixed to top 10**:
   - Always takes first 10 cars from tool result
   - Doesn't respect Nemotron's actual recommendations
   - Nemotron might want to recommend different cars

4. **No handling for `evaluate_affordability`**:
   - If Nemotron calls `evaluate_affordability` for specific cars, those IDs aren't tracked
   - Only tracks from scoring tool, not affordability tool

### Frontend

1. **Receives `recommended_car_ids`** from backend response
2. **Fetches car details** for each ID:
   ```typescript
   const carPromises = response.recommended_car_ids.map(id => 
     getVehicleById(id).catch(err => {
       console.error(`Failed to fetch car ${id}:`, err)
       return null
     })
   )
   const cars = await Promise.all(carPromises)
   const validCars = cars.filter((car): car is Vehicle => car !== null)
   setRecommendedCars(validCars)
   ```
3. **Displays in sidebar**:
   - Shows "Recommended Vehicles" if `recommendedCars.length > 0`
   - Shows "All Available Vehicles" if empty
   - Falls back to loading all cars if no recommendations

## Current Behavior

### Scenario 1: Nemotron Calls `score_cars_for_user`
- ✅ Tool result contains scored cars
- ✅ First 10 car IDs extracted
- ✅ IDs returned to frontend
- ✅ Frontend displays recommended cars

### Scenario 2: Nemotron Doesn't Call `score_cars_for_user`
- ❌ No IDs tracked
- ❌ Empty list returned
- ❌ Frontend shows "All Available Vehicles" (loads all 246 cars)

### Scenario 3: Nemotron Calls `evaluate_affordability`
- ❌ IDs not tracked (only tracks from scoring tool)
- ❌ Empty list returned
- ❌ Frontend shows all cars

### Scenario 4: Nemotron Recommends Different Cars in Text
- ❌ IDs not extracted from text
- ❌ Returns IDs from tool call (might not match text)
- ❌ Potential mismatch between text and sidebar

## What Should Happen

1. **Track IDs from multiple tools**:
   - Track from `score_cars_for_user`
   - Track from `evaluate_affordability` (vehicle_id parameter)
   - Track from `get_car_details` (if user asks about specific car)

2. **Extract IDs from final response**:
   - Parse JSON blocks with `recommended_car_ids`
   - Extract car names from text and match to IDs
   - Use Nemotron's actual recommendations

3. **Respect Nemotron's recommendations**:
   - Don't just take top 10 from tool
   - Use IDs that Nemotron actually recommends
   - Maintain order from Nemotron's response

4. **Handle all scenarios**:
   - Scoring tool called → Track IDs
   - Affordability tool called → Track IDs
   - Final response mentions cars → Extract IDs
   - No tools called → Extract from response text

## Summary

**Current State**: 
- Only tracks IDs from `score_cars_for_user` tool
- Takes first 10 cars from tool result
- Doesn't extract from final response
- Limited functionality

**What's Missing**:
- Extraction from final response text
- Tracking from other tools
- Respecting Nemotron's actual recommendations
- Handling all workflow scenarios

