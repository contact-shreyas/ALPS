# Agentic Light Pollution Sentinel (ALPS)

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/contact-shreyas/agentic-light-sentinel)

## Environment Variables

Required environment variables for deployment:

```env
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NASA_API_KEY=your-nasa-api-key
NASA_API_BASE_URL=https://api.nasa.gov
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=noreply@alps.app
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-session-secret
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
SKIP_REDIS=true
```

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - ALPS"
git branch -M main
git remote add origin https://github.com/contact-shreyas/agentic-light-sentinel.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository: `contact-shreyas/agentic-light-sentinel`
5. Configure environment variables (copy from .env.local)
6. Click "Deploy"

### 3. Configure Database

After deployment, run migrations:

```bash
vercel env pull
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

## Real-time Features

The application supports real-time updates through:
- Server-Sent Events (SSE) for live data streaming
- Polling fallback for compatibility
- WebSocket-ready architecture

## Free Hosting Options

1. **Vercel** (Recommended)
   - Free tier: Unlimited bandwidth
   - Automatic HTTPS
   - Global CDN
   - Built-in analytics

2. **Railway** (Alternative)
   - Free tier: 500 hours/month
   - Native WebSocket support
   - PostgreSQL database included

3. **Render** (Alternative)
   - Free tier: Web services
   - Auto-deploy from GitHub
   - Native WebSocket support

## Production Checklist

- [x] Environment variables configured
- [x] Vercel deployment configured
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project deployed
- [ ] Database initialized
- [ ] Custom domain configured (optional)

## API Keys

- NASA API: Get from [NASA API Portal](https://api.nasa.gov)
- Gmail App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)

## Support

For issues or questions, visit the [GitHub repository](https://github.com/contact-shreyas/agentic-light-sentinel).
