# 🚀 Complete Setup Guide - Toyota AI Assistant

This guide will help you clone the repository and get the entire application running on your machine in about **10 minutes**.

## 📋 Prerequisites

Before you begin, make sure you have:

### 1. Install Docker Desktop

**Download and install Docker Desktop for your operating system:**

- **Mac**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/desktop/install/linux-install/

**After installation:**
1. Open Docker Desktop
2. Wait for it to fully start (you'll see a green "running" status)
3. Keep Docker Desktop running in the background

### 2. Install Git (if you don't have it)

**Check if you have Git:**
```bash
git --version
```

If not installed:
- **Mac**: `brew install git` or download from https://git-scm.com/
- **Windows**: Download from https://git-scm.com/
- **Linux**: `sudo apt-get install git` or `sudo yum install git`

---

## 🔽 Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone the repository
git clone <YOUR_REPO_URL>

# Navigate into the project directory
cd HackUTD-2025
```

Replace `<YOUR_REPO_URL>` with your actual GitHub repository URL (e.g., `https://github.com/yourusername/HackUTD-2025.git`)

---

## ✅ Step 2: Verify Docker is Running

Before building, make sure Docker Desktop is running:

```bash
# Check Docker is working
docker --version

# Should show something like: Docker version 28.4.0
```

If you get "command not found", make sure Docker Desktop is:
1. Installed
2. Running (check your menu bar/system tray)

---

## 🐳 Step 3: Build and Start the Application

From the project root directory (`HackUTD-2025`), run:

```bash
docker compose up --build
```

**What this does:**
- Downloads required Docker images (Python, Node.js)
- Installs all dependencies for frontend and backend
- Builds both applications
- Starts both containers

**Expected time:**
- First run: **5-8 minutes** (downloads everything)
- Subsequent runs: **30-60 seconds** (uses cache)

---

## 📺 Step 4: Watch the Build Process

You'll see output like this:

```
[+] Building...
=> [backend] installing dependencies...
=> [frontend] building Next.js app...
[+] Running 5/5
✔ Container toyota-ai-backend   Started
✔ Container toyota-ai-frontend  Started
```

**Wait for these messages:**

✅ **Backend Ready:**
```
toyota-ai-backend  | INFO: Uvicorn running on http://0.0.0.0:8000
```

✅ **Frontend Ready:**
```
toyota-ai-frontend | ✓ Ready in 27ms
```

When you see both, the app is running! 🎉

---

## 🌐 Step 5: Access the Application

Open your web browser and go to:

### **Frontend (Main App)**
```
http://localhost:3000
```
You should see the Toyota AI Assistant chat interface with:
- TOYOTA logo and header
- Chat interface
- Welcome message from the AI

### **Backend API**
```
http://localhost:8000
```
You should see a JSON response:
```json
{
  "message": "Welcome to Toyota AI Assistant API",
  "docs": "/docs",
  "health": "/health"
}
```

### **API Documentation**
```
http://localhost:8000/docs
```
Interactive API documentation (Swagger UI) where you can test all endpoints.

---

## 🧪 Step 6: Test the Chat

1. Go to `http://localhost:3000`
2. You should see a chat interface
3. Type a message like: **"I have a 60-mile commute"**
4. Press **Send**
5. The AI should respond with information about fuel-efficient vehicles

**Expected response:**
> "Got it! A long commute means fuel efficiency is important. Let me find you some fuel-efficient Toyota vehicles. Our Prius gets 54 MPG city and 50 MPG highway..."

---

## 🛑 Step 7: Stopping the Application

When you're done:

**Option 1: Stop with Ctrl+C**
1. Go to the terminal where Docker is running
2. Press `Ctrl+C`
3. Wait for containers to stop

**Option 2: Stop with Command**
```bash
# In a new terminal
docker compose down
```

---

## 🔄 Step 8: Restarting the Application

Next time you want to run the app:

```bash
# Navigate to project directory
cd HackUTD-2025

# Start (no need to rebuild if no code changes)
docker compose up
```

**Much faster!** Uses cached images, starts in ~30 seconds.

---

## 📂 Project Structure

Once cloned, your directory will look like:

```
HackUTD-2025/
├── frontend/              # Next.js React app
├── backend/               # FastAPI Python app
├── docker-compose.yml     # Orchestrates both services
├── README.md             # Project overview
├── SETUP_GUIDE.md        # This file
└── DOCKER.md             # Advanced Docker info
```

---

## 🔍 Verification Checklist

Make sure everything is working:

- [ ] Docker Desktop is running
- [ ] `docker compose up --build` completed without errors
- [ ] Backend shows "Uvicorn running on http://0.0.0.0:8000"
- [ ] Frontend shows "✓ Ready in XXms"
- [ ] http://localhost:3000 shows chat interface
- [ ] http://localhost:8000 shows JSON response
- [ ] http://localhost:8000/docs shows API documentation
- [ ] Chat responds when you send a message

If all checked ✅, you're ready to go! 🎊

---

## 🐛 Troubleshooting

### Problem: "docker: command not found"

**Solution:**
1. Make sure Docker Desktop is installed
2. Open Docker Desktop and wait for it to start
3. Restart your terminal
4. Try again

### Problem: "port is already allocated"

**Solution:**
```bash
# Stop any existing containers
docker compose down

# Or kill processes on those ports
# Mac/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Try again
docker compose up --build
```

### Problem: "Cannot connect to Docker daemon"

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (green icon)
3. Try the command again

### Problem: Build fails with "no space left on device"

**Solution:**
```bash
# Clean up Docker
docker system prune -a

# Try again
docker compose up --build
```

### Problem: Frontend can't connect to backend

**Solution:**
1. Check both containers are running:
   ```bash
   docker compose ps
   ```
2. Both should show "Up" status
3. Restart:
   ```bash
   docker compose down
   docker compose up
   ```

### Problem: "Module not found" errors

**Solution:**
```bash
# Rebuild without cache
docker compose down
docker compose build --no-cache
docker compose up
```

---

## 🎯 Quick Command Reference

```bash
# Start everything
docker compose up

# Start with rebuild
docker compose up --build

# Start in background (detached)
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v

# Check status
docker compose ps

# Restart a service
docker compose restart backend

# Rebuild specific service
docker compose build frontend
docker compose up frontend

# Clean everything and start fresh
docker compose down -v --rmi all
docker compose up --build
```

---

## 🔐 Optional: Environment Variables

If you want to add API keys (for AI features):

1. **Create a `.env` file** in the root directory:
   ```bash
   # Copy the example
   cp .env.docker.example .env
   ```

2. **Edit `.env` and add your keys:**
   ```env
   NEMOTRON_API_KEY=your-key-here
   # or
   OPENAI_API_KEY=your-key-here
   ```

3. **Restart Docker:**
   ```bash
   docker compose down
   docker compose up
   ```

The application will automatically use these keys!

---

## 📱 Accessing from Other Devices

Want to access the app from your phone or another computer on the same network?

1. **Find your computer's IP address:**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.xxx`

2. **Access from other device:**
   - Frontend: `http://YOUR_IP:3000`
   - Backend: `http://YOUR_IP:8000`

3. **Make sure your firewall allows connections** on ports 3000 and 8000

---

## 💡 Tips for Development

### Working on Frontend
```bash
# After making changes to frontend code
docker compose restart frontend
```

### Working on Backend
```bash
# After making changes to backend code
docker compose restart backend
```

### Viewing Real-Time Logs
```bash
# Open a new terminal and run:
docker compose logs -f
```

### Accessing Container Shell
```bash
# Backend
docker compose exec backend bash

# Frontend
docker compose exec frontend sh
```

---

## 🎓 What's Next?

Now that everything is running:

1. **Explore the code**
   - Frontend: `frontend/app/page.tsx` (main chat page)
   - Backend: `backend/app/api/chat.py` (chat endpoint)

2. **Integrate AI**
   - Edit `backend/app/services/ai_agent.py`
   - Add LangChain and your LLM of choice

3. **Customize**
   - Update vehicle data: `backend/app/data/cars.json`
   - Change UI: `frontend/components/`
   - Add features: Follow the existing pattern

4. **Deploy**
   - The Docker setup is production-ready!
   - Can deploy to AWS, Google Cloud, Azure, etc.

---

## 📚 Additional Resources

- **Project README**: `README.md` - Complete project overview
- **Docker Guide**: `DOCKER.md` - Advanced Docker documentation
- **Quick Start**: `QUICKSTART.md` - 5-minute setup guide
- **API Docs**: http://localhost:8000/docs (when running)

---

## 🆘 Still Having Issues?

1. **Check Docker Desktop is running** (most common issue)
2. **Try rebuilding without cache**: `docker compose build --no-cache`
3. **Check your internet connection** (needed to download images)
4. **Restart your computer** (sometimes helps with Docker)
5. **Check the logs**: `docker compose logs`

---

## ✅ Success Indicators

You'll know everything is working when:

✅ Docker Desktop shows 2 running containers  
✅ Terminal shows "Uvicorn running" and "✓ Ready"  
✅ http://localhost:3000 loads the chat interface  
✅ http://localhost:8000 returns JSON  
✅ Chat responds to your messages  

---

## 🎉 You're All Set!

Congratulations! You now have:
- ✅ A fully functional frontend (Next.js)
- ✅ A fully functional backend (FastAPI)
- ✅ Both running in Docker containers
- ✅ Everything connected and communicating

**Time to build something amazing!** 🚗💨

For questions or issues, check the troubleshooting section above or refer to the other documentation files.

Happy coding! 🚀

---

**Last Updated**: November 2025  
**Tested On**: macOS (Intel & Apple Silicon), Windows 10/11, Ubuntu 20.04+

