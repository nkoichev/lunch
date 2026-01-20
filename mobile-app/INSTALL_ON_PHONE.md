# 📱 How to Install on Your Android Phone

## Two Methods to Install

### Method 1: Quick Testing (Recommended for First Try) ⚡
**No APK build needed - Test immediately!**

### Method 2: Build APK for Permanent Installation 📦
**Create installable APK file**

---

## 🚀 Method 1: Quick Testing with Expo Go (5 Minutes)

This is the **fastest way** to test the app on your phone without building an APK.

### Step 1: Install Expo Go on Your Phone

1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install the app (it's free)
4. Open Expo Go app

### Step 2: Setup on Your Computer

Open Command Prompt/Terminal and run:

```bash
cd c:\Users\nikolay\lunch\mobile-app

# Install dependencies (first time only)
npm install

cd backend
npm install
cd ..
```

### Step 3: Find Your Computer's IP Address

**Option A: Use the helper script**
```bash
scripts\check-ip.bat
```

**Option B: Manual method**
```bash
ipconfig
```
Look for "IPv4 Address" - it will look like `192.168.1.100` or `192.168.0.15`

### Step 4: Update the Backend URL

1. Open file: `mobile-app\services\googleSheets.js`
2. Find line 8:
   ```javascript
   const BACKEND_URL = 'http://192.168.1.100:3001';
   ```
3. Replace `192.168.1.100` with your actual IP address
4. Save the file

### Step 5: Start the Backend Server

Open Command Prompt:
```bash
cd c:\Users\nikolay\lunch\mobile-app\backend
npm start
```

**Keep this window open!** You should see:
```
Backend server running on port 3001
```

### Step 6: Start the Mobile App

Open a **NEW** Command Prompt window:
```bash
cd c:\Users\nikolay\lunch\mobile-app
npm start
```

You'll see a QR code in the terminal.

### Step 7: Connect Your Phone

**IMPORTANT**: Your phone and computer must be on the **same WiFi network**!

1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point your camera at the QR code on your computer screen
4. Wait for the app to load (30-60 seconds)

**Done!** The app should open on your phone! 🎉

### Troubleshooting Method 1

**❌ Can't scan QR code?**
- Make sure Expo Go has camera permission
- Try the manual connection: In Expo Go, type the URL shown below the QR code

**❌ "Unable to connect"?**
- Check both devices are on same WiFi
- Disable VPN if you have one
- Check firewall isn't blocking port 19000

**❌ "Cannot connect to backend"?**
- Make sure backend server is running (Step 5)
- Verify IP address in `services/googleSheets.js` is correct
- Try accessing `http://YOUR_IP:3001/api/health` from your phone's browser

---

## 📦 Method 2: Build APK for Permanent Installation

This creates an installable APK file that can be distributed to multiple phones.

### Prerequisites

1. **Expo Account** (free)
   - Go to https://expo.dev/signup
   - Create an account

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

### Step 1: Prepare for Production (Optional but Recommended)

For the app to work outside your local network, deploy the backend online:

**Quick Deploy to Render.com (Free):**

1. Go to https://render.com/ and sign up
2. Click "New +" → "Web Service"
3. Connect to Git or upload your `backend` folder
4. Settings:
   - **Name**: lunch-orders-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. Copy your URL: `https://lunch-orders-backend.onrender.com`

**Update the app with production URL:**
1. Open `mobile-app\services\googleSheets.js`
2. Change line 8:
   ```javascript
   const BACKEND_URL = 'https://lunch-orders-backend.onrender.com';
   ```

**Skip this if you just want to test locally** - but remember the app will only work on your WiFi network.

### Step 2: Login to Expo

```bash
cd c:\Users\nikolay\lunch\mobile-app
eas login
```

Enter your Expo account credentials.

### Step 3: Configure the Project

```bash
eas build:configure
```

Press Enter to accept defaults.

### Step 4: Build the APK

```bash
eas build --platform android --profile production
```

**What happens:**
- Uploads your code to Expo servers
- Builds the APK in the cloud
- Takes 10-20 minutes
- You can close the terminal and wait for email

You'll see output like:
```
✔ Build finished
https://expo.dev/accounts/yourname/projects/lunch-orders-app/builds/abc123xyz
```

### Step 5: Download the APK

1. Click the link from the terminal (or check your email)
2. Download the APK file to your computer
3. The file will be named something like: `build-abc123.apk`

### Step 6: Transfer APK to Your Phone

**Option A: USB Cable**
1. Connect phone to computer with USB cable
2. Copy the APK file to your phone's Downloads folder

**Option B: Google Drive**
1. Upload APK to Google Drive
2. Open Drive on your phone
3. Download the APK

**Option C: Email**
1. Email the APK to yourself
2. Open email on phone
3. Download the attachment

**Option D: Messaging App**
1. Send APK via WhatsApp/Telegram to yourself
2. Download on phone

### Step 7: Install APK on Your Phone

1. **Enable Unknown Sources**
   - Open **Settings** on your phone
   - Go to **Security** or **Privacy**
   - Find **"Install unknown apps"** or **"Unknown sources"**
   - Enable it for your File Manager or Browser (wherever you downloaded the APK)

2. **Install the App**
   - Open **File Manager** app on your phone
   - Navigate to **Downloads** folder
   - Tap on the APK file (e.g., `build-abc123.apk`)
   - Tap **"Install"**
   - Wait for installation
   - Tap **"Open"**

**Done!** The app is now permanently installed on your phone! 🎉

### Step 8: Share with Others

Now you can share the same APK file with other people:
- Send via WhatsApp/Telegram
- Upload to Google Drive and share link
- Email the APK file

Everyone who installs it will have the app!

---

## 🔄 Updating the App

### If You Made Changes:

1. **Update version** in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

2. **Build new APK**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Users must uninstall old version first**, then install new APK

---

## ❓ Common Issues

### "App not installed"
**Solutions:**
- Uninstall any old version first
- Make sure APK downloaded completely (check file size > 20MB)
- Try downloading APK again
- Restart your phone

### "Parse error"
**Solutions:**
- APK file is corrupted, download again
- Make sure you downloaded the APK, not just a link
- Try transferring via USB instead of wireless

### Can't enable "Unknown sources"
**Solutions:**
- On newer Android, it's per-app permission
- Settings → Apps → Special access → Install unknown apps
- Enable for File Manager or Chrome (wherever you're installing from)

### App opens but shows "Cannot connect to server"
**Solutions:**

**If using local backend (Method 1):**
- Make sure backend server is running on your computer
- Make sure phone and computer on same WiFi
- Check IP address in the app is correct

**If using production backend (deployed to Render):**
- Check backend URL is correct in `services/googleSheets.js`
- Test backend: Open `https://your-backend-url.com/api/health` in phone browser
- Make sure backend is deployed and running

---

## 📊 Comparison: Expo Go vs APK

| Feature | Expo Go (Method 1) | APK (Method 2) |
|---------|-------------------|----------------|
| Speed to test | ⚡ 5 minutes | 🐌 20-30 minutes |
| Needs computer running | ✅ Yes | ❌ No (if backend deployed) |
| Same WiFi needed | ✅ Yes | ❌ No (if backend deployed) |
| Share with others | ❌ Hard | ✅ Easy |
| Permanent install | ❌ No | ✅ Yes |
| Best for | Testing, Development | Production, Distribution |

---

## 🎯 Recommended Workflow

1. **First time**: Use **Method 1** (Expo Go) to test quickly
2. **After confirming it works**: Deploy backend to Render.com
3. **Then**: Build APK with **Method 2**
4. **Share**: Distribute APK to all users

---

## 💡 Tips

### For Local Testing (Same WiFi):
- Keep backend running on computer
- Use Expo Go for quick testing
- Good for development and testing

### For Production (Works Anywhere):
- Deploy backend to Render.com (free)
- Build APK with production backend URL
- Distribute APK to users
- Users can use from anywhere with internet

### For Small Team (Same Office):
- Run backend on one computer in office
- Keep it running during work hours
- Everyone installs APK
- All phones connect to that computer's backend

---

## 🆘 Still Having Issues?

1. Make sure backend server is running and accessible
2. Test backend in browser: `http://YOUR_IP:3001/api/health`
3. Check both phone and computer on same WiFi (for local testing)
4. Verify IP address is correct in `services/googleSheets.js`
5. Check firewall isn't blocking port 3001
6. Try restarting backend server
7. Check backend terminal for error messages

---

## ✅ Checklist

**For Method 1 (Expo Go):**
- [ ] Installed Expo Go on phone
- [ ] Ran `npm install` in mobile-app folder
- [ ] Ran `npm install` in backend folder
- [ ] Found computer IP address
- [ ] Updated IP in `services/googleSheets.js`
- [ ] Started backend server (`npm start` in backend folder)
- [ ] Started mobile app (`npm start` in mobile-app folder)
- [ ] Phone and computer on same WiFi
- [ ] Scanned QR code with Expo Go
- [ ] App loaded on phone

**For Method 2 (APK):**
- [ ] Created Expo account
- [ ] Installed EAS CLI (`npm install -g eas-cli`)
- [ ] (Optional) Deployed backend to Render.com
- [ ] Updated backend URL in `services/googleSheets.js`
- [ ] Logged in to EAS (`eas login`)
- [ ] Ran `eas build:configure`
- [ ] Ran `eas build --platform android`
- [ ] Downloaded APK file
- [ ] Transferred APK to phone
- [ ] Enabled "Install unknown apps"
- [ ] Installed APK
- [ ] App works!

---

**Need help? Check the other documentation files for more details!**

- **QUICKSTART.md** - Overall quick start
- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Backend deployment details
- **PROJECT_OVERVIEW.md** - Technical architecture

Good luck! 🚀📱
