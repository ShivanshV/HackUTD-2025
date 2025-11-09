# Data Flow: Where Does the Orchestrator Get Response Data?

## Overview

The orchestrator gets response data from **two main sources**:

1. **Nemotron AI API** - Generates intelligent responses
2. **Vehicle Data (cars.json)** - Provides actual vehicle information via tools

## Data Flow Diagram

```
User Query
    │
    ▼
┌─────────────────────────────────────────┐
│  Nemotron Orchestrator                  │
│  (nemotron_orchestrator.py)             │
└─────────────────────────────────────────┘
    │
    ├─── Simple Query (No Tools Needed)
    │    │
    │    ▼
    │    Nemotron API (AI Response)
    │    │
    │    ▼
    │    Direct Response to User
    │
    └─── Complex Query (Needs Vehicle Data)
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Nemotron API decides to call tools │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Tool Execution                     │
    │  - find_cars()                      │
    │  - calculate_true_cost()            │
    │  - get_vehicle_details()            │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Vehicle Service                    │
    │  (vehicle_service.py)               │
    └─────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │  cars.json                          │
    │  (backend/app/data/cars.json)       │
    │  - 246 vehicles                     │
    │  - Full specifications              │
    │  - Pricing, MPG, features, etc.     │
    └─────────────────────────────────────┘
         │
         ▼
    Tool Results (Vehicle Data)
         │
         ▼
    ┌─────────────────────────────────────┐
    │  Nemotron API                       │
    │  (Uses tool results to generate     │
    │   intelligent response)             │
    └─────────────────────────────────────┘
         │
         ▼
    Final Response to User
```

## Detailed Data Sources

### 1. **Nemotron AI API** (External)
- **URL**: `https://integrate.api.nvidia.com/v1`
- **Model**: `nvidia/nvidia-nemotron-nano-9b-v2`
- **Purpose**: 
  - Generates natural language responses
  - Decides when to call tools
  - Synthesizes tool results into user-friendly responses
- **Configuration**: Set in `backend/app/core/config.py`
  - API Key: `NEMOTRON_API_KEY` from `.env`
  - Temperature: 0.7
  - Max Tokens: 1000

### 2. **Vehicle Data (cars.json)** (Local)
- **Location**: `backend/app/data/cars.json`
- **Size**: 246 vehicles
- **Loaded by**: `VehicleService` on startup
- **Contains**:
  - Vehicle specifications (body style, fuel type, MPG, etc.)
  - Pricing information (MSRP, lease, loan estimates)
  - Capacity (seats, cargo space)
  - Safety features
  - Annual costs (fuel, insurance, maintenance)
  - Descriptions and recommendations
  - Dealer inventory (if available)

## Step-by-Step Example

### Example: "Find me a sedan under $30,000"

1. **User sends query**:
   ```json
   {
     "messages": [
       {"role": "user", "content": "Find me a sedan under $30,000"}
     ]
   }
   ```

2. **Orchestrator receives query**:
   - Located in: `backend/app/services/nemotron_orchestrator.py`
   - Method: `process_message()`

3. **Nemotron API analyzes query**:
   - Determines: "This needs vehicle data"
   - Decides: "Call find_cars tool"

4. **Tool execution**:
   - Tool: `find_cars(body_style="sedan", max_price=30000)`
   - Located in: `backend/app/tools/vehicle_tools.py`

5. **Vehicle Service queries data**:
   - Service: `VehicleService.find_vehicles()`
   - Located in: `backend/app/services/vehicle_service.py`
   - Filters: `cars.json` data in memory
   - Returns: List of matching vehicles

6. **Tool returns results**:
   ```json
   [
     {
       "id": "camry-le-2024",
       "make": "Toyota",
       "model": "Camry",
       "specs": {
         "body_style": "sedan",
         "pricing": {"base_msrp": 26520},
         "powertrain": {"mpg_hwy": 39}
       },
       ...
     },
     ...
   ]
   ```

7. **Nemotron API generates response**:
   - Receives: Tool results (vehicle data)
   - Generates: Natural language response
   - Example: "I found several sedans under $30,000. The Toyota Camry LE starts at $26,520 and gets 39 MPG highway..."

8. **Response sent to user**:
   ```json
   {
     "role": "agent",
     "content": "I found several sedans under $30,000. The Toyota Camry LE..."
   }
   ```

## File Locations

### Core Files
- **Orchestrator**: `backend/app/services/nemotron_orchestrator.py`
- **Vehicle Service**: `backend/app/services/vehicle_service.py`
- **Tools**: `backend/app/tools/vehicle_tools.py`
- **Data File**: `backend/app/data/cars.json`
- **Config**: `backend/app/core/config.py`

### API Endpoints
- **Orchestrator Chat**: `POST /api/orchestrator/chat`
- **Vehicle Search**: `GET /api/vehicles/search`
- **Vehicle Details**: `GET /api/vehicles/{id}`

## Data Loading Process

### On Startup
1. **VehicleService initializes**:
   ```python
   # In vehicle_service.py
   def __init__(self):
       self.cars_data = self._load_cars_data()
   ```

2. **Loads cars.json**:
   ```python
   cars_file = Path(__file__).parent.parent / "data" / "cars.json"
   with open(cars_file, 'r') as f:
       data = json.load(f)
   ```

3. **Data stored in memory**:
   - All 246 vehicles loaded
   - Fast filtering and searching
   - No database queries needed

### On Request
1. **User query received**
2. **Nemotron decides if tools needed**
3. **If tools needed**:
   - Tool called (e.g., `find_cars`)
   - VehicleService filters in-memory data
   - Results returned to Nemotron
   - Nemotron generates response

## Available Tools

### 1. find_cars
- **Purpose**: Search for vehicles matching criteria
- **Data Source**: `cars.json` (filtered)
- **Returns**: List of matching vehicles
- **Example**: `find_cars(body_style="sedan", max_price=30000)`

### 2. calculate_true_cost
- **Purpose**: Calculate ownership costs
- **Data Source**: `cars.json` (specific vehicle)
- **Calculates**: Fuel costs, insurance, maintenance, 5-year total
- **Example**: `calculate_true_cost(vehicle_id="camry-2024", commute_miles=50)`

### 3. get_vehicle_details
- **Purpose**: Get full vehicle specifications
- **Data Source**: `cars.json` (specific vehicle)
- **Returns**: Complete vehicle information
- **Example**: `get_vehicle_details(vehicle_id="camry-2024")`

## Viewing the Data

### Check Data File
```bash
# View cars.json location
ls backend/app/data/cars.json

# Count vehicles (in Docker)
docker compose -f docker-compose.dev.yml exec backend python -c "import json; data = json.load(open('/app/app/data/cars.json')); print(f'Total vehicles: {len(data)}')"
```

### Check Loaded Data
```bash
# Test vehicle service
docker compose -f docker-compose.dev.yml exec backend python -c "from app.services.vehicle_service import vehicle_service; print(f'Loaded: {len(vehicle_service.cars_data)} vehicles')"
```

### Test Tool Execution
```bash
# Test find_cars tool
docker compose -f docker-compose.dev.yml exec backend python -c "from app.tools.vehicle_tools import find_cars; results = find_cars(max_price=30000); print(f'Found: {len(results)} vehicles')"
```

## Summary

**Response Data Sources**:
1. **AI Responses**: From Nemotron API (external)
2. **Vehicle Data**: From `cars.json` (local file, 246 vehicles)
3. **Tool Results**: Filtered/searched vehicle data from `cars.json`

**Data Flow**:
- User Query → Nemotron API → Tool Calls → Vehicle Service → cars.json → Tool Results → Nemotron API → Final Response

**Key Point**: 
- The orchestrator doesn't generate vehicle data itself
- It uses tools to query the local `cars.json` file
- Nemotron AI synthesizes the data into natural language responses

## Modifying Data

### To Update Vehicle Data
1. Edit `backend/app/data/cars.json`
2. Restart backend: `docker compose -f docker-compose.dev.yml restart backend`
3. Data reloads automatically

### To Add New Tools
1. Add tool function in `backend/app/tools/vehicle_tools.py`
2. Add tool definition in `backend/app/services/nemotron_orchestrator.py`
3. Tool will be available to Nemotron API

### To Change AI Model
1. Edit `backend/app/core/config.py`
2. Update `MODEL_TEMPERATURE`, `MAX_TOKENS`
3. Or change model in `nemotron_orchestrator.py`

## Questions?

- **Where is cars.json?** → `backend/app/data/cars.json`
- **How many vehicles?** → 246 vehicles
- **When is data loaded?** → On VehicleService initialization (backend startup)
- **Can I modify data?** → Yes, edit cars.json and restart backend
- **How does AI access data?** → Through tool calls that query VehicleService

