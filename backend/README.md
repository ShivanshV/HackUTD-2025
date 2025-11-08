# Toyota AI Assistant - Backend

FastAPI backend with AI agent architecture for the Toyota vehicle recommendation chatbot.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **LangChain** - AI agent framework
- **Nemotron** - NVIDIA's LLM (or OpenAI for testing)
- **Pydantic** - Data validation
- **JSON** - Static vehicle data storage

## Architecture

This backend follows the **"No-Database Hackathon"** pattern:

### Data Flow

1. **Frontend sends**: Full chat history (`messages: [...]`)
2. **Backend receives**: Entire conversation as context
3. **AI Agent**:
   - Uses chat history as "memory"
   - Extracts user preferences (commute, budget, passengers)
   - Calls tools (`findCars`, `calculateTrueCost`)
   - Generates natural response
4. **Backend returns**: New agent message
5. **Frontend adds**: Response to chat history

### Why No Database?

✅ **Speed**: JSON file is infinitely faster to set up  
✅ **Simplicity**: No schemas, migrations, or connection strings  
✅ **Read-Only**: Vehicle data doesn't change during demo  
✅ **Hackathon-Smart**: Focus on AI features, not infrastructure

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── chat.py              # Chat endpoint
│   ├── core/
│   │   └── config.py            # Settings & configuration
│   ├── models/
│   │   └── chat.py              # Pydantic models
│   ├── services/
│   │   ├── vehicle_service.py   # Load & filter cars.json
│   │   └── ai_agent.py          # LangChain agent (TODO)
│   ├── tools/
│   │   └── vehicle_tools.py     # Agent tools (findCars, etc.)
│   └── data/
│       └── cars.json            # Vehicle database
├── tests/                       # Unit tests
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
└── .env                         # Environment variables
```

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=8000
CORS_ORIGINS=http://localhost:3000
# Add your API keys when ready:
# NEMOTRON_API_KEY=your-key-here
```

### 4. Run the Server

```bash
# Development mode (auto-reload)
uvicorn main:app --reload --port 8000

# Or use Python
python main.py
```

Server runs at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

## API Endpoints

### `POST /api/chat`

Main chat endpoint that receives chat history and returns AI response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "I have a 60-mile commute" },
    { "role": "agent", "content": "Got it! Let me find fuel-efficient options..." }
  ]
}
```

**Response:**
```json
{
  "role": "agent",
  "content": "Based on your commute, I recommend the Prius..."
}
```

### `GET /health`

Health check endpoint.

## Key Components

### 1. Vehicle Service (`app/services/vehicle_service.py`)

Loads and filters `cars.json`:
- `get_all_vehicles()` - Get all cars
- `find_vehicles(type, max_price, min_mpg, min_seating)` - Filter cars
- `calculate_true_cost(vehicle_id, commute_miles)` - Calculate ownership cost

### 2. AI Agent (`app/services/ai_agent.py`)

**TODO**: Integrate LangChain + Nemotron here.

Current placeholder shows the structure:
```python
async def process_message(messages: List[ChatMessage]) -> str:
    # Your AI agent logic here
    # Extract preferences from chat history
    # Call tools when needed
    # Generate response
```

### 3. Tools (`app/tools/vehicle_tools.py`)

Functions your AI agent can call:
- `find_cars()` - Search for vehicles
- `calculate_true_cost()` - Calculate ownership costs
- `get_vehicle_details()` - Get full vehicle info

When you integrate LangChain, wrap these as tools:
```python
from langchain.agents import Tool

tools = [
    Tool(
        name="findCars",
        func=find_cars,
        description="Find Toyota vehicles matching criteria..."
    ),
    # ... more tools
]
```

## Development Workflow

### Adding New Vehicles

Edit `app/data/cars.json`:
```json
{
  "id": "corolla-2024",
  "name": "Corolla",
  "type": "sedan",
  "price": 26400,
  ...
}
```

### Adding New Tools

1. Create function in `app/tools/vehicle_tools.py`
2. Add to agent's tool list
3. Update tool description for LLM

### Integrating LangChain

Replace placeholder in `app/services/ai_agent.py`:

```python
from langchain.agents import initialize_agent
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.tools.vehicle_tools import find_cars, calculate_true_cost

class AIAgent:
    def __init__(self):
        self.llm = ChatNVIDIA(
            model="nemotron-4-340b-instruct",
            api_key=settings.NEMOTRON_API_KEY
        )
        
        self.tools = [
            Tool(name="findCars", func=find_cars, ...),
            Tool(name="calculateTrueCost", func=calculate_true_cost, ...),
        ]
        
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent="chat-conversational-react-description",
            verbose=True
        )
    
    async def process_message(self, messages):
        # Convert messages to LangChain format
        # Run agent
        # Return response
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Test the API manually
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"I need a family SUV"}]}'
```

## Vehicle Data

`cars.json` contains 6 sample Toyota vehicles:
- Camry XSE 2024 (Sedan) - $32,500
- RAV4 XLE 2024 (SUV) - $35,800
- Prius Limited 2024 (Hybrid) - $34,500
- Tacoma TRD 2024 (Truck) - $42,500
- Highlander XLE 2024 (SUV) - $45,500
- Corolla SE 2024 (Sedan) - $26,400

Each includes specs, features, MPG, safety ratings, etc.

## Next Steps

1. ✅ Backend skeleton created
2. ✅ JSON data loaded
3. ✅ Tools defined
4. 🔲 Integrate LangChain in `ai_agent.py`
5. 🔲 Add Nemotron/OpenAI LLM
6. 🔲 Configure tools for agent
7. 🔲 Test agent responses
8. 🔲 Add more sophisticated tools

## Notes

- **No database = No persistence**: Chat history lives in frontend only
- **Stateless API**: Each request is independent (gets full history)
- **Tools are the key**: Agent intelligence comes from good tool design
- **cars.json is your database**: Fast, simple, perfect for demos

Happy hacking! 🚗🤖
