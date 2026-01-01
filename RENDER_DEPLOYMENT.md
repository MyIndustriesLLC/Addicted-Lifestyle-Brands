# Render.com Deployment Guide

## Prerequisites
- GitHub account with this repository pushed
- Render.com account (free tier available)
- Neon database URL (or use Render's PostgreSQL)

## Quick Start Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `Addicted-Lifestyle-Brands` repository

### 3. Configure Web Service

Render will auto-detect `render.yaml`, but verify:

- **Name:** `addicted-lifestyle-brands`
- **Region:** Oregon (US West)
- **Branch:** `main` (or your default branch)
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free

### 4. Set Environment Variables

Go to **Settings > Environment** and add:

#### Required Variables:
```bash
# Database (use your Neon URL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-icy-sound-aehqz3rt-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Security
ADMIN_PASSWORD=your-secure-admin-password
SESSION_SECRET=generate-random-32-char-string
WALLET_ENCRYPTION_KEY=generate-random-32-char-string

# Printful
PRINTFUL_API_KEY=your-printful-api-key
PRINTFUL_TSHIRT_VARIANT_ID=4012

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Public URL (update after deployment)
PUBLIC_URL=https://your-app-name.onrender.com
```

#### Optional Variables:
```bash
# Ripple Wallet (will auto-generate if not provided)
RIPPLE_WALLET_SEED=your-seed
RIPPLE_WALLET_ADDRESS=your-address
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build frontend and backend
   - Start the server
   - Assign you a URL: `https://your-app-name.onrender.com`

### 6. Update PUBLIC_URL

After deployment:
1. Copy your Render app URL
2. Go to **Settings > Environment**
3. Update `PUBLIC_URL` to your Render URL
4. Save changes (triggers auto-redeploy)

### 7. Initialize Database

If using a new database:
```bash
# SSH into your Render service (Dashboard > Shell)
npm run db:push
```

## Monitoring

- **Logs:** Dashboard > Logs
- **Metrics:** Dashboard > Metrics
- **Health Check:** Your app responds at `/api/network/status`

## Automatic Deployments

Render auto-deploys when you push to `main`:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Render automatically builds and deploys!
```

## Troubleshooting

### Build Fails
- Check build logs in Render Dashboard
- Verify all dependencies are in `package.json`
- Ensure `npm run build` works locally

### App Won't Start
- Check environment variables are set
- Verify `DATABASE_URL` is correct
- Check logs for errors

### Database Connection Issues
- Ensure Neon database allows external connections
- Verify connection string format
- Check if database exists

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check EMAIL_HOST and EMAIL_PORT

## Cost

- **Free Tier:**
  - 750 hours/month
  - Spins down after 15 min inactivity
  - Slower cold starts (15-30 seconds)

- **Upgrade to Starter ($7/month):**
  - Always-on (no spin down)
  - Faster performance
  - Custom domains

## Using Neon Database (Recommended)

Instead of Render's PostgreSQL, use your Neon database:

1. Remove `databases` section from `render.yaml`
2. Add Neon connection string to `DATABASE_URL` in Render environment variables
3. Neon offers:
   - Better free tier (0.5 GB storage)
   - Serverless (scales to zero)
   - Faster queries

## Security Checklist

- ✅ All secrets in Render environment (not in code)
- ✅ `.env` files in `.gitignore`
- ✅ Strong `ADMIN_PASSWORD`
- ✅ Random `SESSION_SECRET` (32+ chars)
- ✅ Random `WALLET_ENCRYPTION_KEY` (32 chars)
- ✅ Email app-specific password (not main password)

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL (auto-enabled)
3. Set up monitoring/alerts
4. Enable auto-deploy from GitHub

## Support

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Neon Docs](https://neon.tech/docs/introduction)
