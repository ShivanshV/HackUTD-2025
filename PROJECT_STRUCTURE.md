# 📁 Complete Project Structure

```
HackUTD-2025/
│
├── 📄 README.md                   # Main documentation
├── 📄 QUICKSTART.md              # 5-minute setup guide
├── 📄 PROJECT_STRUCTURE.md       # This file
│
├── 🎨 frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (main chat interface)
│   │   ├── page.module.css      # Page styles
│   │   └── globals.css          # Global styles & CSS variables
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx         # Main chat component (manages state)
│   │   │   ├── ChatInterface.module.css
│   │   │   ├── ChatMessageBubble.tsx     # Individual message display
│   │   │   ├── ChatMessageBubble.module.css
│   │   │   ├── ChatInput.tsx             # Message input field
│   │   │   └── ChatInput.module.css
│   │   │
│   │   └── ui/
│   │       ├── Header.tsx                # App header
│   │       └── Header.module.css
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   └── chat.ts          # API client (calls backend)
│   │   │
│   │   └── types/
│   │       └── chat.ts          # TypeScript type definitions
│   │
│   ├── public/                  # Static assets
│   │   ├── images/             # Vehicle images (placeholder)
│   │   └── icons/              # App icons
│   │
│   ├── package.json            # Dependencies & scripts
│   ├── tsconfig.json           # TypeScript config
│   ├── next.config.js          # Next.js config
│   ├── .env.example            # Environment template
│   ├── .gitignore
│   └── README.md               # Frontend documentation
│
├── 🐍 backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── chat.py         # ⭐ Chat endpoint (POST /api/chat)
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py       # Settings & environment variables
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── chat.py         # Pydantic models (ChatMessage, Vehicle, etc.)
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── vehicle_service.py   # Load & filter cars.json
│   │   │   └── ai_agent.py          # ⭐⭐⭐ AI Agent (TODO: Add LangChain)
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   └── vehicle_tools.py     # ⭐⭐ Agent tools (findCars, calculateTrueCost)
│   │   │
│   │   └── data/
│   │       └── cars.json        # ⭐ Vehicle database (6 Toyota vehicles)
│   │
│   ├── tests/                   # Unit tests (placeholder)
│   │
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template
│   ├── .gitignore
│   └── README.md               # Backend documentation
│
└── .git/                       # Git repository
```

## 🎯 Key Files to Focus On

### For AI Integration (Priority 1)
```
backend/app/services/ai_agent.py        ⭐⭐⭐ Add LangChain + Nemotron here
backend/app/tools/vehicle_tools.py      ⭐⭐  Define agent tools
backend/app/data/cars.json              ⭐   Vehicle data
```

### For UI/UX Polish (Priority 2)
```
frontend/components/chat/ChatInterface.tsx     Main chat component
frontend/app/globals.css                       Global styles
frontend/components/chat/*.module.css          Component styles
```

### Configuration Files
```
backend/.env                    Backend environment variables
frontend/.env                   Frontend environment variables
backend/requirements.txt        Python packages
frontend/package.json           npm packages
```

## 📊 File Statistics

- **Total Files Created**: ~40 files
- **Frontend**: 23 files (TypeScript, CSS, config)
- **Backend**: 17 files (Python, JSON, config)

## 🔗 How Files Connect

### Frontend → Backend
```
ChatInterface.tsx
    ↓ (user sends message)
lib/api/chat.ts
    ↓ (POST /api/chat with full history)
Backend: app/api/chat.py
    ↓ (processes with AI agent)
Backend: app/services/ai_agent.py
    ↓ (calls tools if needed)
Backend: app/tools/vehicle_tools.py
    ↓ (queries data)
Backend: app/data/cars.json
    ↑ (returns vehicles)
Backend: app/services/vehicle_service.py
    ↑ (formats response)
Backend: app/api/chat.py
    ↑ (sends back to frontend)
lib/api/chat.ts
    ↑ (receives response)
ChatInterface.tsx
    ↑ (displays in UI)
```

## 🚀 Development Flow

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Make Changes
- **Backend**: Changes auto-reload
- **Frontend**: Changes auto-reload
- **Data (cars.json)**: Reloads on next request
- **Environment (.env)**: Requires manual restart

### 3. Test
- **Manual**: Use the chat interface at http://localhost:3000
- **API**: Use http://localhost:8000/docs
- **Curl**: Test backend directly with curl commands

## 📝 File Ownership Guide

If working in a team, split work like this:

**Person 1: AI Integration**
- `backend/app/services/ai_agent.py`
- `backend/app/tools/vehicle_tools.py`
- Test with curl/Postman

**Person 2: UI/UX**
- `frontend/components/chat/*`
- `frontend/app/globals.css`
- Polish styling and animations

**Person 3: Data & Logic**
- `backend/app/data/cars.json`
- `backend/app/services/vehicle_service.py`
- Add more vehicles and features

**Person 4: Integration**
- Test full flow
- Fix bugs
- Prepare demo

## 🎨 Customization Points

### Change Toyota Branding
Edit: `frontend/app/globals.css`
```css
:root {
  --primary-color: #eb0a1e;  /* Toyota Red */
  --secondary-color: #333333;
}
```

### Add More Vehicles
Edit: `backend/app/data/cars.json`
```json
{
  "id": "4runner-2024",
  "name": "4Runner",
  ...
}
```

### Modify AI Behavior
Edit: `backend/app/services/ai_agent.py`
- Change system prompt
- Add/remove tools
- Adjust response format

### Update UI Text
Edit: `frontend/components/chat/ChatInterface.tsx`
```typescript
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
  {
    role: 'agent',
    content: "Your custom welcome message here!",
  },
])
```

## 🔍 Finding Things

**Looking for...**
- API endpoint definition? → `backend/app/api/chat.py`
- Chat UI? → `frontend/components/chat/ChatInterface.tsx`
- Vehicle data? → `backend/app/data/cars.json`
- AI logic? → `backend/app/services/ai_agent.py`
- API calls? → `frontend/lib/api/chat.ts`
- Styles? → `frontend/**/*.module.css`
- Types? → `frontend/lib/types/chat.ts` or `backend/app/models/chat.py`
- Environment vars? → `.env` files
- Dependencies? → `requirements.txt` or `package.json`

## ✅ Checklist: Is Everything Set Up?

- [ ] Backend runs without errors
- [ ] Frontend runs without errors
- [ ] Can see chat interface in browser
- [ ] Backend responds to chat messages (even with placeholder)
- [ ] API docs accessible at `/docs`
- [ ] Can see vehicle data in `cars.json`
- [ ] Both README files read
- [ ] Environment files created (`.env`)
- [ ] Virtual environment activated (Python)
- [ ] Dependencies installed (both frontend and backend)

If all checked ✅, you're ready to integrate the AI! 🎉

