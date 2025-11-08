# 🐳 Docker Setup - Complete Summary

## Files Created

```
HackUTD-2025/
├── docker-compose.yml              # Orchestrates both services
├── .dockerignore                   # Root ignore file
├── .env.docker.example            # Environment template
├── DOCKER.md                      # Complete Docker guide
│
├── frontend/
│   ├── Dockerfile                 # Multi-stage Next.js build
│   └── .dockerignore             # Frontend ignore file
│
└── backend/
    ├── Dockerfile                # Python FastAPI container
    └── .dockerignore            # Backend ignore file
```

## One Command to Rule Them All

```bash
docker-compose up --build
```

That's it! Both frontend and backend will start automatically.

## What Happens When You Run It

1. **Backend Container** (`toyota-ai-backend`):
   - Builds Python 3.11 image
   - Installs dependencies from `requirements.txt`
   - Runs health check on port 8000
   - Starts FastAPI with `uvicorn`

2. **Frontend Container** (`toyota-ai-frontend`):
   - Builds Node 18 image (multi-stage)
   - Installs dependencies and builds Next.js app
   - Waits for backend to be healthy
   - Serves on port 3000

3. **Network** (`toyota-network`):
   - Connects both containers
   - Frontend can call backend via `http://backend:8000`

## Port Mapping

| Service  | Container Port | Host Port | Access URL |
|----------|---------------|-----------|------------|
| Frontend | 3000          | 3000      | http://localhost:3000 |
| Backend  | 8000          | 8000      | http://localhost:8000 |

## Docker Architecture

```
┌─────────────────────────────────────────────┐
│            Host Machine                     │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │      Docker Network                │    │
│  │      (toyota-network)              │    │
│  │                                    │    │
│  │  ┌──────────────┐  ┌────────────┐ │    │
│  │  │   Frontend   │  │   Backend  │ │    │
│  │  │              │─▶│            │ │    │
│  │  │  Next.js     │  │  FastAPI   │ │    │
│  │  │  Node 18     │  │  Python311 │ │    │
│  │  │  Port 3000   │  │  Port 8000 │ │    │
│  │  └──────────────┘  └────────────┘ │    │
│  │         │                  │       │    │
│  └─────────┼──────────────────┼───────┘    │
│            │                  │            │
│      localhost:3000    localhost:8000      │
└─────────────────────────────────────────────┘
```

## Essential Commands

### Starting

```bash
# Build and start
docker-compose up --build

# Start in background (detached)
docker-compose up -d

# Start and follow logs
docker-compose up --build && docker-compose logs -f
```

### Stopping

```bash
# Stop containers (preserves data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers AND volumes
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Managing Services

```bash
# Restart a service
docker-compose restart backend

# Rebuild specific service
docker-compose build backend
docker-compose up backend

# Check status
docker-compose ps
```

### Debugging

```bash
# Enter backend container
docker-compose exec backend bash

# Enter frontend container  
docker-compose exec frontend sh

# Run command in container
docker-compose exec backend python --version

# View container resource usage
docker stats
```

## Environment Variables

### Quick Setup

```bash
# Copy template
cp .env.docker.example .env

# Edit with your keys
nano .env
```

### Available Variables

```env
# Backend API Keys
NEMOTRON_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here

# Optional: Override ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
```

### How They're Used

Variables in `.env` are automatically loaded by docker-compose:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - NEMOTRON_API_KEY=${NEMOTRON_API_KEY}
```

## Dockerfile Details

### Frontend Dockerfile (Multi-Stage)

**Stage 1: Dependencies** - Install production dependencies  
**Stage 2: Builder** - Build the Next.js app  
**Stage 3: Runner** - Minimal runtime image

Benefits:
- ✅ Smaller final image (~100MB vs ~1GB)
- ✅ No dev dependencies in production
- ✅ Faster subsequent builds (cached layers)
- ✅ More secure (less attack surface)

### Backend Dockerfile

Features:
- ✅ Non-root user (`appuser`)
- ✅ Health check built-in
- ✅ Minimal base image (Python slim)
- ✅ Separate layer for dependencies (better caching)

## Health Checks

### Backend Health Check

```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health')"]
  interval: 30s
  timeout: 10s
  retries: 3
```

Checks `/health` endpoint every 30 seconds.

### Frontend Dependency

Frontend waits for backend to be healthy:

```yaml
depends_on:
  backend:
    condition: service_healthy
```

## .dockerignore Files

### Why They Matter

`.dockerignore` files prevent unnecessary files from being copied into containers:

- ⚡ **Faster builds** - Less data to copy
- 💾 **Smaller images** - No node_modules, .git, etc.
- 🔒 **More secure** - No .env files in image
- 🎯 **Better caching** - Only relevant files trigger rebuilds

### What's Ignored

**Both**:
- `.git/`, `.gitignore`
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)
- Documentation (`*.md`)
- Environment files (`.env*`)

**Frontend**:
- `node_modules/`, `.next/`
- Build artifacts

**Backend**:
- `__pycache__/`, `venv/`
- Python build artifacts

## Troubleshooting

### Build Failures

```bash
# Clear everything and rebuild
docker-compose down -v --rmi all
docker-compose up --build
```

### Port Conflicts

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs backend

# Common issues:
# - Missing dependencies (rebuild)
# - Syntax errors in code
# - Wrong environment variables
```

### Permission Errors

```bash
# Fix file ownership
sudo chown -R $USER:$USER .

# Rebuild
docker-compose up --build
```

### Frontend Can't Reach Backend

1. Check backend is healthy: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify CORS settings in `backend/.env`
4. Check network: `docker network inspect hackutd-2025_toyota-network`

## Performance Tips

1. **Use .dockerignore** - Already configured ✅
2. **Layer caching** - Dependencies before code ✅
3. **Multi-stage builds** - Frontend uses this ✅
4. **Minimal base images** - Alpine/Slim ✅

## Production Readiness Checklist

- [x] Multi-stage builds for smaller images
- [x] Non-root users for security
- [x] Health checks configured
- [x] Environment variables externalized
- [x] Proper .dockerignore files
- [x] Read-only data mounts
- [x] Network isolation
- [x] Resource limits (optional, add if needed)
- [x] Restart policies configured

## Quick Reference

```bash
# Start fresh
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild backend only
docker-compose build backend && docker-compose up backend

# Execute command
docker-compose exec backend bash

# Clean everything
docker-compose down -v --rmi all

# Check status
docker-compose ps

# Follow logs for specific service
docker-compose logs -f backend
```

## Testing Your Setup

```bash
# 1. Start services
docker-compose up -d

# 2. Wait for health checks
sleep 10

# 3. Test backend
curl http://localhost:8000/health

# 4. Test frontend
curl http://localhost:3000

# 5. View status
docker-compose ps

# Expected output:
# NAME                    STATUS
# toyota-ai-backend      Up (healthy)
# toyota-ai-frontend     Up
```

## Next Steps

1. ✅ Docker setup complete
2. Run `docker-compose up --build`
3. Open http://localhost:3000
4. Test the chat interface
5. Add your API keys to `.env`
6. Integrate LangChain in backend
7. Deploy to production!

## Additional Resources

- [DOCKER.md](DOCKER.md) - Full Docker documentation
- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Happy Dockerizing! 🐳**

Built with ❤️ for HackUTD 2025

