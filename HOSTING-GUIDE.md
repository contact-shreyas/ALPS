# ========================================
#  ALPS Vercel Deployment Guide
# ========================================

## Prerequisites

1. Git installed on your system
2. GitHub account: https://github.com/contact-shreyas
3. Vercel account (sign up with GitHub): https://vercel.com

## Step 1: Install Git (if not installed)

Download and install: https://git-scm.com/download/win

## Step 2: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `agentic-light-sentinel`
3. Description: `Agentic Light Pollution Sentinel (ALPS) - Real-time light pollution monitoring system`
4. **Keep it PUBLIC** (required for free Vercel hosting)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 3: Push Code to GitHub

Open PowerShell in the project directory and run:

```powershell
cd C:\transfer\agentic-light-sentinel-master

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Agentic Light Pollution Sentinel (ALPS)"

# Set main branch
git branch -M main

# Add remote
git remote add origin https://github.com/contact-shreyas/agentic-light-sentinel.git

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to: https://vercel.com
2. Click "Sign Up" → Choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Click "Add New..." → "Project"
5. Import `contact-shreyas/agentic-light-sentinel`
6. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

## Step 5: Add Environment Variables

In Vercel project settings, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NASA_API_KEY=bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf
NASA_API_BASE_URL=https://api.nasa.gov
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=erbfbxqkbkxfssfv
EMAIL_FROM=noreply@alps.app
JWT_SECRET=your-secure-jwt-secret-min-64-chars-long
SESSION_SECRET=your-session-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here
SKIP_REDIS=true
NEXT_TELEMETRY_DISABLED=1
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-app.vercel.app` with your actual Vercel URL (you'll get this after first deployment)
- Generate strong secrets for JWT_SECRET, SESSION_SECRET, and NEXTAUTH_SECRET

## Step 6: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at: `https://agentic-light-sentinel.vercel.app`

## Step 7: Update NEXTAUTH_URL

1. Copy your Vercel app URL
2. Go to Vercel → Settings → Environment Variables
3. Edit `NEXTAUTH_URL` to match your actual URL
4. Redeploy (Deployments → Click ⋯ → Redeploy)

## Step 8: Initialize Database

After deployment, run in terminal:

```bash
vercel env pull
pnpm prisma generate
pnpm prisma db push
pnpm seed
```

## Troubleshooting

### Build fails
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Check build logs for specific errors

### Database issues
- Vercel uses ephemeral storage for SQLite
- Consider upgrading to PostgreSQL for production
- Free option: Supabase (https://supabase.com)

### Real-time not working
- Vercel free tier has limitations on WebSockets
- App uses Server-Sent Events (SSE) as fallback
- Consider Railway for native WebSocket support

## Alternative: Deploy to Railway (Better for Real-time)

1. Go to: https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `contact-shreyas/agentic-light-sentinel`
5. Add environment variables (same as above)
6. Railway provides PostgreSQL database for free
7. Native WebSocket support included

## Cost Comparison

### Vercel (Recommended for Next.js)
- ✅ Free tier: Unlimited bandwidth
- ✅ Global CDN
- ✅ Automatic HTTPS
- ❌ Limited WebSocket support
- ❌ Serverless functions (10-second timeout)

### Railway (Best for Real-time)
- ✅ Free tier: 500 hours/month
- ✅ Native WebSocket support
- ✅ PostgreSQL database included
- ✅ No function timeout limits
- ❌ Limited monthly hours

## Support

- GitHub Issues: https://github.com/contact-shreyas/agentic-light-sentinel/issues
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

## Success! 🎉

Your app is now live and accessible worldwide with real-time updates!
