# Upload ALPS to GitHub

## Method 1: GitHub Desktop (EASIEST - Recommended)

### Step 1: Download GitHub Desktop
- Go to: **https://desktop.github.com**
- Click **"Download for Windows"**
- Install and launch the app

### Step 2: Sign In
- Click **"Sign in to GitHub.com"**
- Enter your GitHub credentials: `contact-shreyas`
- Click **"Authorize desktop"**
- Complete any 2FA if prompted

### Step 3: Add Your Local Repository
1. Click **File** → **Add Local Repository**
2. Click **"Choose..."**
3. Navigate to: `C:\transfer\agentic-light-sentinel-master`
4. Select it and click **"Open"**
5. GitHub Desktop will recognize it as a new repository

### Step 4: Create Repository
1. You'll see a prompt asking to create a repository
2. Fill in:
   - **Name**: `ALPS`
   - **Description**: `Agentic Light Pollution Sentinel (ALPS) - Real-time light pollution monitoring`
   - **Local Path**: `C:\transfer\agentic-light-sentinel-master`
   - **Initialize this repository with a README**: Uncheck
   - **Git ignore**: Select `Node`
   - **License**: `MIT`
3. Click **"Create Repository"**

### Step 5: Publish to GitHub
1. Click the **"Publish repository"** button (top right)
2. Confirm details:
   - **Name**: `ALPS`
   - **Description**: Same as above
   - **Keep this code private**: UNCHECK (must be PUBLIC for free Vercel)
3. Click **"Publish Repository"**

### Step 6: Verify Upload
- All your files will upload to GitHub
- You'll see a progress bar
- Once complete, you can view at: **https://github.com/contact-shreyas/ALPS**

---

## Method 2: Manual GitHub Web Upload (If GitHub Desktop Doesn't Work)

### Step 1: Create Repository on GitHub
1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `ALPS`
   - **Description**: `Agentic Light Pollution Sentinel (ALPS) - Real-time light pollution monitoring`
   - **Public** (IMPORTANT - required for free Vercel)
   - Uncheck: "Initialize this repository with README"
3. Click **"Create repository"**

### Step 2: Upload Files
1. You'll see: **"…or upload an existing file"** link
2. Click that link
3. Drag and drop your entire project folder OR click "choose your files"
4. Select everything from `C:\transfer\agentic-light-sentinel-master`
5. Click **"Commit changes"**

---

## After Upload: Deploy to Vercel

Once your repository is on GitHub, click this link to deploy:

```
https://vercel.com/new/clone?repository-url=https://github.com/contact-shreyas/ALPS&env=NODE_ENV=production,NASA_API_KEY=bVXv3MSTqriDB9W6LgWDGp7iTU6mNwWXSFtaFWzf,SKIP_REDIS=true
```

Your app will be live in 2-3 minutes!

---

## Troubleshooting

### GitHub Desktop Won't Recognize Folder
- Make sure folder is: `C:\transfer\agentic-light-sentinel-master`
- Try closing and reopening GitHub Desktop
- Restart your computer if needed

### Upload is Too Slow
- Manual web upload is faster for large projects
- Use Method 2 instead

### "Private Repository" Warning
- Make sure you UNCHECK "Keep this code private"
- Vercel free tier requires public repository

---

## Next Steps

1. ✅ Upload to GitHub (using Method 1 or 2)
2. 🔗 Deploy to Vercel (using the link above)
3. 🚀 Your app will be LIVE!

**Need help?** Check the repository at: https://github.com/contact-shreyas/ALPS
