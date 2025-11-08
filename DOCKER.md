# 🐳 Docker Setup Guide

Complete guide to running the Toyota AI Assistant with Docker.

## Quick Start

### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually comes with Docker Desktop)

### 2. Clone & Run

```bash
# Clone the repository
git clone <your-repo-url>
cd HackUTD-2025

# Build and start all services
docker-compose up --build
```

That's it! 🎉

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Stop the Application

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes
docker-compose down -v
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.docker.example .env
```

Edit `.env` and add your API keys:

```env
# Backend API Keys
NEMOTRON_API_KEY=your-nemotron-key-here
# or
OPENAI_API_KEY=your-openai-key-here
```

Docker Compose will automatically load these variables.

### Port Configuration

Default ports:
- Frontend: `3000`
- Backend: `8000`

To change ports, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change 8001 to your desired port
  
  frontend:
    ports:
      - "3001:3000"  # Change 3001 to your desired port
```

## Development with Docker

### Rebuild After Changes

```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Execute Commands in Containers

```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Run Python commands
docker-compose exec backend python -c "print('Hello')"
```

### Update Vehicle Data

The vehicle data is mounted as a volume, so you can edit `backend/app/data/cars.json` and the changes will reflect immediately (may need to trigger a new API call).

## Docker Architecture

```
┌─────────────────────────────────────┐
│         Docker Network              │
│      (toyota-network)               │
│                                     │
│  ┌──────────────┐  ┌────────────┐ │
│  │   Frontend   │  │   Backend  │ │
│  │   (Next.js)  │──▶│  (FastAPI) │ │
│  │   Port 3000  │  │  Port 8000 │ │
│  └──────────────┘  └────────────┘ │
│         │                  │       │
└─────────┼──────────────────┼───────┘
          │                  │
     Host:3000          Host:8000
```

## File Structure

```
HackUTD-2025/
├── docker-compose.yml          # Orchestrates all services
├── .env                        # Environment variables (create this)
├── .env.docker.example         # Example environment file
│
├── frontend/
│   ├── Dockerfile             # Frontend container definition
│   └── .dockerignore          # Files to exclude from build
│
└── backend/
    ├── Dockerfile             # Backend container definition
    └── .dockerignore          # Files to exclude from build
```

## Services

### Backend Service

**Container Name**: `toyota-ai-backend`

- **Base Image**: Python 3.11 Slim
- **Port**: 8000
- **Health Check**: Checks `/health` endpoint every 30s
- **Dependencies**: Installs from `requirements.txt`
- **Entry Point**: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Features**:
- Non-root user (security)
- Health checks (ensures service is ready)
- Minimal image size
- Auto-restart on failure

### Frontend Service

**Container Name**: `toyota-ai-frontend`

- **Base Image**: Node 18 Alpine
- **Port**: 3000
- **Build**: Multi-stage build (optimized)
- **Depends On**: Backend (waits for backend to be healthy)
- **Entry Point**: Next.js standalone server

**Features**:
- Multi-stage build (small final image)
- Production optimized
- Non-root user (security)
- Waits for backend to be ready

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing dependencies - rebuild: docker-compose build backend
# 2. Syntax errors in Python code
# 3. Environment variables not set
```

### Frontend Can't Connect to Backend

```bash
# Check if backend is healthy
docker-compose ps

# Should show backend as "healthy"
# If not, check backend logs:
docker-compose logs backend
```

### Permission Errors

```bash
# Reset file permissions
sudo chown -R $USER:$USER .

# Rebuild
docker-compose down
docker-compose up --build
```

### Clear Everything and Start Fresh

```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, volumes, and images
docker-compose down -v --rmi all

# Rebuild from scratch
docker-compose up --build
```

## Production Deployment

### Using Docker Compose

```bash
# Start in detached mode (background)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Environment Variables for Production

Create `.env` file with production settings:

```env
# Backend
NEMOTRON_API_KEY=your-production-key
ENV=production
CORS_ORIGINS=https://yourdomain.com

# Optional: External database if you add one later
# DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Security Considerations

✅ **Non-root users**: Both containers run as non-root  
✅ **Health checks**: Monitors service health  
✅ **Read-only mounts**: Data is mounted read-only  
✅ **No secrets in images**: Use environment variables  
✅ **Minimal base images**: Alpine/Slim for smaller attack surface

### Scaling

To run multiple instances (requires load balancer):

```bash
docker-compose up --scale backend=3
```

## Docker Commands Cheat Sheet

```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# Stop services
docker-compose stop

# Stop and remove
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend bash

# View running containers
docker-compose ps

# Remove all (including volumes)
docker-compose down -v

# Remove all (including images)
docker-compose down -v --rmi all
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: docker-compose build
      
      - name: Test
        run: docker-compose up -d && sleep 10 && curl http://localhost:8000/health
```

## Advanced Configuration

### Custom Network

Edit `docker-compose.yml` to customize the network:

```yaml
networks:
  toyota-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Resource Limits

Add resource constraints:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Volume Persistence

To persist data across restarts:

```yaml
services:
  backend:
    volumes:
      - backend-data:/app/data

volumes:
  backend-data:
```

## Performance Tips

1. **Use build cache**: Docker caches layers, so put frequently changing files last
2. **Multi-stage builds**: Already implemented in frontend
3. **Minimal base images**: Using Alpine and Slim images
4. **.dockerignore**: Excludes unnecessary files from build context
5. **Health checks**: Ensures services are ready before accepting traffic

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Rebuild: `docker-compose up --build`
4. Clean slate: `docker-compose down -v && docker-compose up --build`

---

**Happy Dockerizing! 🐳**

