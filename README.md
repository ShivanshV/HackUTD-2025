# 🚗 Toyota AI Assistant - HackUTD 2025

An AI-powered conversational assistant that helps customers find their perfect Toyota vehicle based on personal preferences like commute distance, family size, budget, and priorities.

## 🎯 Project Overview

This project uses an **AI agent architecture** where:
- Users chat naturally about their needs
- AI extracts preferences from conversation
- AI calls tools to search vehicles and calculate costs
- AI recommends vehicles with personalized reasoning

### Key Innovation: No-Database Approach

✅ **Chat history managed in frontend state** (React useState)  
✅ **Vehicle data stored in JSON file** (fast, simple, read-only)  
✅ **Stateless backend** (receives full history each request)  
✅ **AI provides intelligence** (LangChain + Nemotron)

## 🏗️ Architecture

```
┌─────────────┐                    ┌──────────────┐
│   Frontend  │ ──── messages ──▶  │   Backend    │
│  (Next.js)  │                    │  (FastAPI)   │
│             │                    │              │
│ chatHistory │                    │  AI Agent    │
│   (state)   │                    │ (LangChain)  │
│             │                    │              │
│             │ ◀── response ────  │   Tools      │
└─────────────┘                    │ cars.json    │
                                   └──────────────┘
```

### Data Flow

1. **User types**: "I have a 60-mile commute and 2 kids"
2. **Frontend**: Adds to `chatHistory` array
3. **Frontend**: Sends **entire** `chatHistory` to `/api/chat`
4. **Backend AI Agent**:
   - Receives full conversation as "memory"
   - Extracts: `commute=60, passengers=3+`
   - Calls tools: `findCars(min_mpg=30, min_seating=5)`
   - Calls: `calculateTrueCost(vehicle_id, commute_miles=60)`
   - Generates natural response
5. **Frontend**: Receives response, adds to `chatHistory`
6. **UI**: Re-renders with new message

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **CSS Modules** - Component-scoped styling
- **Axios** - API communication

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - AI agent framework
- **Nemotron/OpenAI** - Large Language Model
- **Pydantic** - Data validation
- **JSON** - Vehicle data storage

## 📂 Project Structure

```
HackUTD-2025/
├── frontend/                   # Next.js Frontend
│   ├── app/                   
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main chat page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── chat/              # Chat UI components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessageBubble.tsx
│   │   │   └── ChatInput.tsx
│   │   └── ui/                # Reusable UI
│   └── lib/
│       ├── api/               # API client
│       └── types/             # TypeScript types
│
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── chat.py        # Chat endpoint
│   │   ├── services/
│   │   │   ├── vehicle_service.py  # Load cars.json
│   │   │   └── ai_agent.py    # AI agent (TODO: LangChain)
│   │   ├── tools/
│   │   │   └── vehicle_tools.py    # Agent tools
│   │   ├── data/
│   │   │   └── cars.json      # Vehicle database
│   │   └── models/
│   │       └── chat.py        # Data models
│   └── main.py                # FastAPI app
│
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker (Recommended) 🐳

**Prerequisites**: [Docker Desktop](https://docs.docker.com/get-docker/) installed and running

```bash
# Clone the repository
git clone <your-repo-url>
cd HackUTD-2025

# Start everything with one command
docker compose up --build
```

Done! 🎉
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

**📖 New to this?** See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for complete step-by-step instructions!

**⚡ Need it faster?** See **[CLONE_AND_RUN.md](CLONE_AND_RUN.md)** for ultra-quick 3-command setup!

**🐳 Want Docker details?** See [DOCKER.md](DOCKER.md) for advanced Docker documentation.

### Option 2: Manual Setup

**Prerequisites**: Node.js 18+, Python 3.10+, npm, pip

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit if needed (default: http://localhost:8000)

# Run development server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🧠 AI Agent Architecture

### Current State (Placeholder)
The backend has a **placeholder response system** to demonstrate the architecture. It responds to keywords like "commute", "family", "budget".

### Next Steps (Your Implementation)

Integrate LangChain in `backend/app/services/ai_agent.py`:

```python
from langchain.agents import initialize_agent, Tool
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.tools.vehicle_tools import find_cars, calculate_true_cost

class AIAgent:
    def __init__(self):
        # Initialize LLM
        self.llm = ChatNVIDIA(
            model="nemotron-4-340b-instruct",
            api_key=settings.NEMOTRON_API_KEY
        )
        
        # Define tools
        self.tools = [
            Tool(
                name="findCars",
                func=find_cars,
                description="Find Toyota vehicles. Args: vehicle_type, max_price, min_mpg, min_seating"
            ),
            Tool(
                name="calculateTrueCost",
                func=calculate_true_cost,
                description="Calculate total cost including fuel. Args: vehicle_id, commute_miles"
            ),
        ]
        
        # Initialize agent
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent="chat-conversational-react-description",
            verbose=True
        )
    
    async def process_message(self, messages):
        # Convert to LangChain format
        # Run agent with chat history
        # Return response
```

### Available Tools

Tools in `backend/app/tools/vehicle_tools.py`:

1. **`find_cars()`** - Search for vehicles
   - Args: `vehicle_type`, `max_price`, `min_mpg`, `min_seating`
   - Returns: List of matching vehicles

2. **`calculate_true_cost()`** - Calculate ownership cost
   - Args: `vehicle_id`, `commute_miles`, `gas_price`
   - Returns: MSRP, fuel costs, 5-year total

3. **`get_vehicle_details()`** - Get full vehicle info
   - Args: `vehicle_id`
   - Returns: Complete vehicle specifications

## 📊 Vehicle Data

`backend/app/data/cars.json` contains 6 Toyota vehicles:

| Vehicle | Type | Price | MPG (City/Hwy) | Seating |
|---------|------|-------|----------------|---------|
| Corolla SE | Sedan | $26,400 | 31/40 | 5 |
| Camry XSE | Sedan | $32,500 | 28/39 | 5 |
| Prius Limited | Hybrid | $34,500 | 54/50 | 5 |
| RAV4 XLE | SUV | $35,800 | 27/35 | 5 |
| Tacoma TRD | Truck | $42,500 | 20/23 | 5 |
| Highlander XLE | SUV | $45,500 | 21/29 | 8 |

Each vehicle includes:
- Complete specifications
- Features list
- Safety ratings
- MPG data
- Engine details

## 🎨 UI/UX

The frontend features:
- **Clean chat interface** with Toyota branding
- **Message bubbles** (user in red, agent in gray)
- **Loading indicators** during API calls
- **Mobile responsive** design
- **Smooth animations** and transitions

## 📝 API Documentation

### `POST /api/chat`

Main chat endpoint.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "I have a 60-mile commute" },
    { "role": "agent", "content": "..." },
    { "role": "user", "content": "What about hybrid options?" }
  ]
}
```

**Response:**
```json
{
  "role": "agent",
  "content": "Based on your 60-mile commute, the Prius is perfect..."
}
```

## 🔧 Development

### Adding New Vehicles

Edit `backend/app/data/cars.json`:
```json
{
  "id": "sienna-2024",
  "name": "Sienna",
  "type": "suv",
  "price": 38000,
  "mpg_city": 36,
  "mpg_highway": 36,
  ...
}
```

### Adding New Agent Tools

1. Create function in `backend/app/tools/vehicle_tools.py`
2. Add to LangChain agent's tools list
3. Provide clear description for the LLM

### Frontend Styling

Uses CSS modules with Toyota brand colors:
- Primary: `#eb0a1e` (Toyota Red)
- Secondary: `#333333`
- Background: `#f5f5f5`

## 🧪 Testing

### Backend
```bash
cd backend
pytest

# Test API directly
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"I need a family car"}]}'
```

### Frontend
```bash
cd frontend
npm run lint
npm run build
```

## 🎯 Hackathon Strategy

### What's Already Built ✅
- Complete frontend with chat UI
- FastAPI backend with structured endpoints
- Vehicle data in JSON
- Tool functions ready to integrate
- Placeholder AI responses

### What You Need to Do 🔲
1. **Integrate LangChain** in `ai_agent.py`
2. **Add Nemotron LLM** (or OpenAI for testing)
3. **Configure tools** for the agent
4. **Test conversations** and refine prompts
5. **Polish UI** with your team's touch

### Time Estimates
- LangChain integration: 2-3 hours
- Tool configuration: 1 hour
- Testing & refinement: 2-3 hours
- **Total**: 5-7 hours to full AI functionality

## 🚧 Future Enhancements

- [ ] User preferences persistence (localStorage)
- [ ] Vehicle comparison feature
- [ ] Test drive scheduling
- [ ] Dealer locator integration
- [ ] Image generation for visualizations
- [ ] Multi-language support
- [ ] Voice input/output

## 👥 Team

HackUTD 2025 Team - Built with ❤️ for Toyota

## 📄 License

Hackathon Project - HackUTD 2025

---

**Pro Tips for the Hackathon:**

1. **Start with OpenAI** if Nemotron setup takes too long
2. **Focus on 3-5 great conversation flows** rather than covering everything
3. **Demo with a story**: "Meet Sarah, she has a 60-mile commute..."
4. **Show the tools in action**: Print tool calls to console during demo
5. **Keep cars.json simple**: 6 vehicles is enough for a great demo

**The "No Database" approach is your secret weapon** - it lets you move fast and focus on the AI intelligence, which is what judges care about! 🚀
