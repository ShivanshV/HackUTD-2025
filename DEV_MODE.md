# 🔥 Development Mode with Hot Reload

This guide shows you how to run the project in **development mode** with **live changes** (hot reload).

## 🚀 Quick Start (Development Mode)

Instead of the production build, use the development configuration:

```bash
docker compose -f docker-compose.dev.yml up --build
```

That's it! Now any changes you make to the code will **automatically reload** without rebuilding! 🎉

---

## ✨ What's Different in Dev Mode?

### Backend (FastAPI)
- ✅ **Auto-reload** with `--reload` flag
- ✅ Source code mounted as volume
- ✅ Changes reflect instantly
- ✅ No need to rebuild container

### Frontend (Next.js)
- ✅ **Fast Refresh** enabled
- ✅ Source code mounted as volume
- ✅ Changes reflect in 1-2 seconds
- ✅ No need to rebuild container

---

## 📝 How to Use

### 1. Start in Development Mode

```bash
# From project root
docker compose -f docker-compose.dev.yml up
```

### 2. Make Changes

Edit any file:
- **Backend**: `backend/app/api/chat.py`, `backend/app/services/ai_agent.py`, etc.
- **Frontend**: `frontend/app/page.tsx`, `frontend/components/chat/ChatInterface.tsx`, etc.

### 3. See Changes Instantly!

- **Backend**: Watch the terminal - it will say "Reloading..."
- **Frontend**: Browser automatically refreshes (or shows update notification)

### 4. Stop When Done

```bash
# Press Ctrl+C or run:
docker compose -f docker-compose.dev.yml down
```

---

## 🔄 Development Workflow

```bash
# Start dev containers
docker compose -f docker-compose.dev.yml up

# In another terminal, edit files
code backend/app/api/chat.py

# Save the file
# Watch terminal - backend reloads automatically
# Refresh browser if needed

# Make frontend changes
code frontend/components/chat/ChatInterface.tsx

# Save the file
# Browser updates automatically (Fast Refresh)
```

---

## 📂 What Gets Mounted?

### Backend Volume Mounts
```yaml
volumes:
  - ./backend:/app          # Source code
  - /app/__pycache__        # Excluded (use container version)
```

### Frontend Volume Mounts
```yaml
volumes:
  - ./frontend:/app         # Source code
  - /app/node_modules       # Excluded (use container version)
  - /app/.next              # Excluded (use container version)
```

---

## 🐛 Troubleshooting

### Changes Not Reflecting?

**Backend:**
```bash
# Check if reload is working
docker compose -f docker-compose.dev.yml logs -f backend

# Should see "Reloading..." when you save files
```

**Frontend:**
```bash
# Check Next.js Fast Refresh
docker compose -f docker-compose.dev.yml logs -f frontend

# Should see compilation messages when you save files
```

### Need to Reinstall Dependencies?

**Backend:**
```bash
# After changing requirements.txt
docker compose -f docker-compose.dev.yml build backend
docker compose -f docker-compose.dev.yml up backend
```

**Frontend:**
```bash
# After changing package.json
docker compose -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.dev.yml up frontend
```

### Slow Performance?

On **macOS/Windows**, volume mounts can be slow. Solutions:

1. **Use Docker Desktop's file sharing optimization**
2. **Or run locally without Docker** for faster development:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## 🔀 Switching Between Modes

### Development Mode (Hot Reload)
```bash
docker compose -f docker-compose.dev.yml up
```
- Fast iteration
- Instant changes
- Larger containers
- Good for: Coding, testing features

### Production Mode (Optimized)
```bash
docker compose up
```
- Optimized builds
- Smaller images
- No hot reload
- Good for: Final testing, deployment

---

## 📊 Comparison

| Feature | Production Mode | Development Mode |
|---------|----------------|------------------|
| Hot Reload | ❌ No | ✅ Yes |
| Build Time | 5-8 min | 2-3 min |
| Image Size | Small | Larger |
| Performance | Optimized | Standard |
| Use Case | Deployment | Development |
| Command | `docker compose up` | `docker compose -f docker-compose.dev.yml up` |

---

## 💡 Pro Tips

### 1. Keep Dev Mode Running
Leave the dev containers running while you work. They'll automatically reload!

### 2. View Logs in Real-Time
```bash
# See all logs
docker compose -f docker-compose.dev.yml logs -f

# See specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
```

### 3. Restart a Service
```bash
# If a service gets stuck
docker compose -f docker-compose.dev.yml restart backend
docker compose -f docker-compose.dev.yml restart frontend
```

### 4. Access Container Shell
```bash
# Backend shell
docker compose -f docker-compose.dev.yml exec backend bash

# Frontend shell
docker compose -f docker-compose.dev.yml exec frontend sh
```

### 5. Clean Restart
```bash
# Stop and remove everything
docker compose -f docker-compose.dev.yml down

# Start fresh
docker compose -f docker-compose.dev.yml up --build
```

---

## 🎯 Common Use Cases

### Editing AI Agent Logic
```bash
# Start dev mode
docker compose -f docker-compose.dev.yml up

# Edit the AI agent
code backend/app/services/ai_agent.py

# Save - backend reloads automatically
# Test in browser at localhost:3000
```

### Changing UI Components
```bash
# Start dev mode
docker compose -f docker-compose.dev.yml up

# Edit a component
code frontend/components/chat/ChatInterface.tsx

# Save - browser updates automatically (Fast Refresh)
```

### Adding New API Endpoints
```bash
# Start dev mode
docker compose -f docker-compose.dev.yml up

# Add new endpoint
code backend/app/api/chat.py

# Save - backend reloads
# Test at localhost:8000/docs
```

---

## ⚙️ Configuration Files

### Development Docker Compose
- **File**: `docker-compose.dev.yml`
- **Purpose**: Hot reload configuration
- **Features**: Volume mounts, dev servers

### Development Dockerfiles
- **Backend**: `backend/Dockerfile.dev`
- **Frontend**: `frontend/Dockerfile.dev`
- **Differences**: Dev dependencies, reload flags

---

## 🚦 Quick Commands

```bash
# Start dev mode
docker compose -f docker-compose.dev.yml up

# Start in background
docker compose -f docker-compose.dev.yml up -d

# Stop
docker compose -f docker-compose.dev.yml down

# Rebuild
docker compose -f docker-compose.dev.yml up --build

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart service
docker compose -f docker-compose.dev.yml restart backend

# Check status
docker compose -f docker-compose.dev.yml ps
```

---

## ✅ Verification

You'll know hot reload is working when:

**Backend:**
- Save a Python file
- Terminal shows: `INFO: Reloading...`
- Terminal shows: `INFO: Application startup complete`

**Frontend:**
- Save a TypeScript/React file
- Terminal shows: `Compiling /app/...`
- Browser updates automatically or shows "Fast Refresh" notification

---

## 🎉 You're Ready!

Now you can:
- ✅ Edit code and see changes instantly
- ✅ Develop inside Docker containers
- ✅ No need to rebuild after every change
- ✅ Fast iteration and testing

Happy coding with hot reload! 🔥🚀

