# Toyota AI Assistant - Frontend

Next.js frontend for the Toyota AI Vehicle Assistant chatbot.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **React** - UI library
- **Axios** - HTTP client for API calls

## Architecture

This frontend manages **chat history in state** (no database needed). The chat history is passed to the backend with each request, providing context for the AI agent.

### How It Works

1. **Chat State Management**: 
   - `chatHistory` is stored in React state (`useState`)
   - Each message has `{ role: 'user' | 'agent', content: string }`

2. **Message Flow**:
   - User types a message → Added to `chatHistory`
   - **Entire** `chatHistory` sent to backend at `/api/chat`
   - Backend's AI agent uses this history as "memory"
   - Agent response received → Added to `chatHistory`
   - UI re-renders with new message

3. **No Persistence**: 
   - Chat history exists only during the session
   - Perfect for hackathon - no database complexity!

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page with chat
│   ├── globals.css         # Global styles
│   └── page.module.css     # Page-specific styles
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx        # Main chat component
│   │   ├── ChatMessageBubble.tsx    # Message display
│   │   └── ChatInput.tsx            # Input field
│   └── ui/
│       └── Header.tsx               # Header component
├── lib/
│   ├── api/
│   │   └── chat.ts         # API client for backend
│   └── types/
│       └── chat.ts         # TypeScript types
└── public/                 # Static assets
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```
   BACKEND_API_URL=http://localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Key Components

### ChatInterface
Main component that manages the chat state and coordinates message flow.

```typescript
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
```

### API Client
Located in `lib/api/chat.ts`, handles communication with FastAPI backend:

```typescript
// Sends entire chat history to backend
sendChatMessage(messages: ChatMessage[]): Promise<string>
```

## Development

### Adding New Features

1. **Add new message types**: Update `lib/types/chat.ts`
2. **Modify chat UI**: Edit components in `components/chat/`
3. **Add API endpoints**: Extend `lib/api/chat.ts`

### Styling

Uses CSS Modules for component-scoped styles with Toyota brand colors:
- Primary: `#eb0a1e` (Toyota Red)
- Text: `#333333`
- Background: `#ffffff`

## Building for Production

```bash
npm run build
npm start
```

## Notes for Hackathon

✅ **No database needed** - chat history lives in React state  
✅ **Simple architecture** - easy to understand and modify  
✅ **Fast setup** - just install and run  
✅ **Scalable** - can add features without backend changes  

The frontend is designed to be the "state manager" while the backend provides AI intelligence!
