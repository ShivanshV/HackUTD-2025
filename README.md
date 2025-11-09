# Toyota Lifestyle Copilot

An AI-powered vehicle recommendation system that helps users find their perfect Toyota based on lifestyle, preferences, and needs through natural conversation.

## What It Does

Toyota Lifestyle Copilot uses AI to understand your lifestyle and recommend the perfect Toyota vehicle. Describe your needs, commute, family size, and budget in natural language, and the AI will:

- Analyze preferences from conversation
- Filter vehicles from a comprehensive catalog
- Provide personalized recommendations with detailed reasoning
- Compare vehicles side-by-side
- Calculate ownership costs including fuel and maintenance
- Display interactive 3D models of select vehicles

### Features

- 🤖 **Smart Search**: AI-powered conversational search
- 📋 **Catalog Search**: Traditional filter-based search
- ⚖️ **Compare**: Side-by-side vehicle comparison with reports
- 🎨 **3D Models**: Interactive 3D vehicle viewer
- 📊 **Analytics**: Detailed ownership costs and fuel efficiency

## How to Run

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
- NVIDIA Nemotron API key (or other LLM API key)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HackUTD-2025
   ```

2. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your API key:
   # NEMOTRON_API_KEY=your_api_key_here
   ```

3. **Start the application**
   ```bash
   # From project root
   docker compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development Mode

The development setup includes hot-reload for both frontend and backend:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Changes to code will automatically reload the application.

### Manual Setup (Without Docker)

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: FastAPI, Python, NVIDIA Nemotron
- **AI**: LangChain, Custom AI agent
- **Data**: JSON-based vehicle catalog (296 vehicles)

## License

Hackathon Project - HackUTD 2025
