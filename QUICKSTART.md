# 🚀 Quick Start Guide - Toyota AI Assistant

Get up and running in 2 minutes with Docker!

## 🐳 Docker Setup (Easiest)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed

### Start the App

```bash
# Clone the repo
git clone <your-repo-url>
cd HackUTD-2025

# Start everything
docker-compose up --build
```

**That's it!** ✨

- 🎨 Frontend: http://localhost:3000
- 🐍 Backend: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

### Stop the App

```bash
# Press Ctrl+C or
docker-compose down
```

---

## 🔧 Manual Setup (Alternative)

If you prefer not to use Docker:

### Step 1: Backend (2 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# OR: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

✅ Backend running at `http://localhost:8000`

### Step 2: Frontend (2 minutes)

**Open a new terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at `http://localhost:3000`

---

## 🎮 Test It!

1. Open browser to `http://localhost:3000`
2. Type: **"I have a 60-mile commute"**
3. See the AI respond! 🎉

## 🔑 Add API Keys (Optional)

For real AI responses (not placeholder):

### Using Docker:
```bash
# Copy environment template
cp .env.docker.example .env

# Edit .env and add:
NEMOTRON_API_KEY=your-key-here
# or
OPENAI_API_KEY=your-key-here

# Restart
docker-compose up --build
```

### Using Manual Setup:
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your keys

# Restart backend
uvicorn main:app --reload --port 8000
```

## 📊 What Works Now

Even without API keys, you'll see:
- ✅ Beautiful chat interface
- ✅ Message history
- ✅ Placeholder AI responses
- ✅ Full architecture working

## 🧠 Add Real AI

Edit `backend/app/services/ai_agent.py`:

```python
from langchain_nvidia_ai_endpoints import ChatNVIDIA
# or
from langchain_openai import ChatOpenAI

# Replace placeholder with real LLM
self.llm = ChatNVIDIA(...)
```

See full docs in [README.md](README.md)

## 🆘 Troubleshooting

### Docker Issues

```bash
# Port already in use?
docker-compose down
docker-compose up --build

# Start fresh
docker-compose down -v
docker-compose up --build
```

### Manual Setup Issues

**Backend won't start:**
- Check Python version: `python3 --version` (need 3.10+)
- Activate virtual environment
- Check if port 8000 is available

**Frontend won't start:**
- Check Node version: `node --version` (need 18+)
- Try: `rm -rf node_modules && npm install`
- Check if port 3000 is available

**Can't connect to backend:**
- Make sure backend is running on port 8000
- Check `frontend/.env` has correct URL

## 📚 Next Steps

1. ✅ App is running
2. 🧠 Integrate LangChain in `backend/app/services/ai_agent.py`
3. 🎨 Customize UI in `frontend/components/`
4. 🚗 Add more vehicles in `backend/app/data/cars.json`

## 📖 Full Documentation

- [README.md](README.md) - Complete project documentation
- [DOCKER.md](DOCKER.md) - Docker guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File structure

---

**You're ready to build!** 🎊

Happy hacking at HackUTD! 🚀
