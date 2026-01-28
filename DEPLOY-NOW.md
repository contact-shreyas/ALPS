# ALPS - Complete Deployment Instructions

## 🚀 Deploy to Vercel in 3 Minutes

Your Agentic Light Pollution Sentinel (ALPS) is ready to deploy!

### Step 1: Upload Code to GitHub (Manual)

1. Go to: **https://github.com/new**
2. Create repository:
   - **Repository name**: `agentic-light-sentinel`
   - **Description**: `Agentic Light Pollution Sentinel (ALPS) - Real-time light pollution monitoring`
   - **Visibility**: Public (required for free Vercel)
   - **Initialize**: Do NOT initialize with README
3. Click **"Create repository"**

4. **Upload files to GitHub**:
   - Click **"uploading an existing file"** link
   - Or drag-and-drop the entire project folder
   - Or use GitHub Desktop (easier method below)

### Step 2 (Easier): Use GitHub Desktop

1. Download: **https://desktop.github.com**
2. Install and sign in with your GitHub account
3. Click **File → Add Local Repository**
4. Select: `C:\transfer\agentic-light-sentinel-master`
5. Click **Create Repository**
6. Fill in:
   - **Name**: agentic-light-sentinel
   - **Description**: ALPS - Real-time light pollution monitoring
   - **Local Path**: Keep default
7. Click **Create Repository**
8. Click **Publish Repository**
   - Change name if needed
   - Make sure **Public** is selected
   - Click **Publish Repository**

### Step 3: Deploy to Vercel (ONE CLICK)

Click this deployment link:

```
https://vercel.com/new/clone?repository-url=https://github.com/contact-shreyas/agentic-light-sentinel&env=NODE_ENV=production,NASA_API_KEY=bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf,SKIP_REDIS=true
```

**Or manually:**

1. Go to: **https://vercel.com**
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Paste: `https://github.com/contact-shreyas/agentic-light-sentinel`
5. Click **"Import"**
6. Configure:
   - **Framework**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Root Directory**: `./`
7. Add Environment Variables:
   ```
   NODE_ENV=production
   NASA_API_KEY=bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf
   SKIP_REDIS=true
   ```
8. Click **"Deploy"**

### Step 4: Wait & Celebrate! 🎉

- Build takes: 2-3 minutes
- Your app will be at: **https://agentic-light-sentinel.vercel.app**

## Features Included

✅ Real-time alert monitoring
✅ NASA Earth data integration
✅ Live timestamp updates
✅ Email notifications (via Gmail)
✅ Interactive light pollution map
✅ Performance metrics
✅ Global CDN delivery
✅ Automatic HTTPS

## Your Credentials

- **GitHub**: https://github.com/contact-shreyas
- **NASA API**: `bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf`
- **Gmail App Password**: `erbfbxqkbkxfssfv`

## Troubleshooting

### Push to GitHub fails
- Install Git: https://git-scm.com/download/win
- Or use GitHub Desktop (recommended)

### Build fails on Vercel
- Check all environment variables are set
- Verify repository is public
- Check Vercel build logs

### Real-time not working
- Vercel free tier uses Server-Sent Events (SSE)
- Works in all modern browsers
- Alternative: Deploy to Railway for WebSockets

## Next: Monitor Your App

After deployment:
1. Go to: https://agentic-light-sentinel.vercel.app
2. Click "Dashboard" to see real-time data
3. View alerts with live timestamp updates
4. Check map with light pollution visualization

## Free Hosting Comparison

| Feature | Vercel | Railway |
|---------|--------|---------|
| Cost | Free | Free (500 hrs/mo) |
| WebSocket | Fallback | Native |
| Database | SQLite | PostgreSQL |
| CDN | Global | Good |
| Recommended for | Next.js | Real-time apps |

---

**Questions?** Check the HOSTING-GUIDE.md file for detailed setup instructions.
