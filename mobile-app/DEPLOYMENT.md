# 🚀 Deployment Guide - Production Setup

## Overview

This guide covers deploying the backend to a cloud service and building the final production APK.

---

## Part 1: Deploy Backend to Render.com (Free)

### Step 1: Prepare Backend for Deployment

1. Create a `backend/.gitignore`:
```
node_modules/
.env
npm-debug.log
```

2. Backend is already configured and ready to deploy!

### Step 2: Deploy to Render.com

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up (free account)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repository OR use "Deploy via URL"

3. **Configure the Service**
   - **Name**: `lunch-orders-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `mobile-app/backend`
   - **Plan**: Free

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your service URL: `https://lunch-orders-backend.onrender.com`

### Step 3: Update Mobile App with Production URL

1. Open `mobile-app/services/googleSheets.js`
2. Update BACKEND_URL:
```javascript
const BACKEND_URL = 'https://lunch-orders-backend.onrender.com';
```

---

## Part 2: Alternative Backend Hosting Options

### Option A: Railway.app (Free Tier)

1. Go to https://railway.app/
2. Sign up and create new project
3. Deploy from GitHub or upload backend folder
4. Set start command: `npm start`
5. Copy the generated URL

### Option B: Heroku (Paid but Reliable)

1. Install Heroku CLI: https://devcli.heroku.com/
2. Deploy:
```bash
cd backend
heroku login
heroku create lunch-orders-backend
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option C: VPS (DigitalOcean, Linode, etc.)

1. Create a VPS instance
2. Install Node.js
3. Clone/upload backend code
4. Install dependencies: `npm install`
5. Use PM2 to keep it running:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

---

## Part 3: Build Production APK

### Prerequisites

1. **Expo Account**
   - Create at https://expo.dev/signup
   - Verify email

2. **EAS CLI**
```bash
npm install -g eas-cli
```

### Build Process

1. **Login to Expo**
```bash
eas login
```

2. **Configure Project**
```bash
cd mobile-app
eas build:configure
```

3. **Build APK**
```bash
eas build --platform android --profile production
```

4. **Wait for Build**
   - Build takes 10-20 minutes
   - You'll receive an email when complete
   - Download APK from the link provided

### Build Troubleshooting

If build fails:

1. **Check app.json validity**
```bash
npx expo config --type public
```

2. **Clear cache and rebuild**
```bash
eas build --platform android --profile production --clear-cache
```

3. **Check credentials**
```bash
eas credentials
```

---

## Part 4: Distribute APK to Users

### Method 1: Direct Distribution (Recommended for Small Teams)

1. **Upload APK to Google Drive**
   - Create a shared folder
   - Upload the APK file
   - Share link with users

2. **Send via Email**
   - Attach APK (usually 20-50 MB)
   - Include installation instructions

3. **Use File Sharing Services**
   - Dropbox
   - OneDrive
   - WeTransfer

### Method 2: Self-Hosted Distribution

1. **Host on your website**
```html
<a href="/downloads/lunch-orders.apk" download>Download App</a>
```

2. **QR Code for easy download**
   - Generate QR code linking to APK
   - Users scan and download

### Method 3: Firebase App Distribution (Recommended for Larger Teams)

1. **Setup Firebase**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

2. **Upload to Firebase**
```bash
firebase appdistribution:distribute lunch-orders.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers"
```

---

## Part 5: Update Process

### When you make changes:

1. **Update backend code**
   - Push changes to Git
   - Render will auto-deploy (if connected to Git)
   - Or manually redeploy on Render dashboard

2. **Update mobile app**
   ```bash
   # Increment version in app.json
   # "version": "1.0.1"
   # "android.versionCode": 2

   eas build --platform android --profile production
   ```

3. **Distribute new APK**
   - Users must uninstall old version first
   - Or use version code increment to allow updates

---

## Part 6: Monitoring & Maintenance

### Backend Monitoring

1. **Render Dashboard**
   - Check logs for errors
   - Monitor uptime
   - Set up alerts

2. **Add Health Check Endpoint** (already implemented)
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

### App Analytics (Optional)

Add analytics to track usage:
```bash
npx expo install expo-firebase-analytics
```

---

## Part 7: Security Best Practices

### 1. Environment Variables (Recommended)

Instead of hardcoding credentials, use environment variables:

1. On Render: Add environment variables in dashboard
2. In code: Use `process.env.VARIABLE_NAME`

### 2. Rate Limiting

Add to backend `server.js`:
```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

### 3. HTTPS Only

Render provides free HTTPS automatically.
Ensure your BACKEND_URL uses `https://`

---

## 📋 Deployment Checklist

Before going to production:

- [ ] Backend deployed and accessible
- [ ] BACKEND_URL updated in mobile app
- [ ] App icons created and added to assets/
- [ ] Version number set in app.json
- [ ] Tested on at least 2 different Android devices
- [ ] APK built successfully
- [ ] Distribution method chosen and tested
- [ ] Installation instructions provided to users
- [ ] Monitoring/alerts set up
- [ ] Credentials secured (not in public repos)

---

## 🆘 Emergency Procedures

### Backend is Down

1. Check Render dashboard for errors
2. Check Google Sheets API quota
3. Restart service from Render dashboard
4. Check credentials are still valid

### App Won't Connect

1. Verify BACKEND_URL is correct
2. Test backend directly: `curl https://your-backend.com/api/health`
3. Check Google Sheets permissions
4. Verify service account credentials

### Need to Rollback

1. Keep previous APK versions
2. Redeploy previous backend version from Git
3. Notify users to reinstall previous APK

---

## 📞 Support Resources

- Expo Documentation: https://docs.expo.dev/
- Render Documentation: https://render.com/docs
- Google Sheets API: https://developers.google.com/sheets/api
- React Native: https://reactnative.dev/

---

**You're all set for production! 🎉**
