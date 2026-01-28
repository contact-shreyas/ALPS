# 🚀 QUICK START - Upload to GitHub

## ONE COMMAND UPLOAD

```powershell
.\UPLOAD.ps1
```

That's it! The script will:
1. Prompt for your GitHub token
2. Create the private repository
3. Push all your code
4. Give you the repository URL

---

## Get Your GitHub Token

**Click here:** https://github.com/settings/tokens/new?scopes=repo&description=ALPS-Upload

1. Note: `ALPS Upload Token`
2. Expiration: Choose your preference (30 days recommended)
3. Scopes: ✓ **repo** (Full control of private repositories)
4. Click **Generate token**
5. **Copy the token** (it looks like `ghp_xxxxxxxxxxxx`)

---

## What Happens

✅ Creates private repository: `contact-shreyas/agentic-light-sentinel`  
✅ Uploads 193 files (31,625 lines of code)  
✅ Protected: .env, node_modules, data files stay local  
✅ Your repo URL: https://github.com/contact-shreyas/agentic-light-sentinel  

---

## Troubleshooting

**"Token invalid"**
- Make sure you copied the complete token (starts with `ghp_`)
- Token must have `repo` scope checked

**"Repository already exists"**
- No problem! Script will push to existing repo
- Or delete it on GitHub and run again

**"Permission denied"**
- Check you're logged into GitHub as `contact-shreyas`
- Generate a new token with correct scopes

---

## Manual Method (if script fails)

1. Create repo: https://github.com/new
   - Name: `agentic-light-sentinel`
   - Private: ✓
   - Don't initialize with README
   
2. Push code:
   ```powershell
   git push -u origin master
   ```

---

**Current Status:** ✅ All files committed and ready  
**Next Step:** Run `.\UPLOAD.ps1` and paste your token

---

*Last updated: November 1, 2025*
