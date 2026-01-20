# 📱 Lunch Orders Mobile App - Project Overview

## 🎯 Project Description

Android mobile application that displays lunch orders from Google Sheets in a clean, user-friendly table format. The app reads data from the same Google Sheets document used by your Streamlit web application.

---

## 🏗️ Architecture

### Frontend (Mobile App)
- **Technology**: React Native with Expo
- **Platform**: Android (APK installation)
- **UI Framework**: React Native built-in components
- **Data Fetching**: Axios for HTTP requests
- **Language**: JavaScript

### Backend (API Server)
- **Technology**: Node.js + Express
- **Purpose**: Proxy server for Google Sheets API
- **Authentication**: Service Account credentials
- **API**: RESTful endpoints

### Data Source
- **Source**: Google Sheets
- **Spreadsheet ID**: `1Uj_mn4WmRdeHeB51--az4bq7-sOZuVBDJZH-xlnPOeQ`
- **Sheets Used**:
  - `Orders` - Main orders data
  - `Hora` - Client information
  - `Mandji` - Restaurant information
- **Access**: Read-only via Service Account

---

## 📂 Project Structure

```
mobile-app/
│
├── 📱 MOBILE APP (React Native)
│   ├── App.js                          # Main app component with UI
│   ├── package.json                    # Dependencies
│   ├── app.json                        # Expo configuration
│   ├── eas.json                        # Build configuration
│   ├── babel.config.js                 # Babel transpiler config
│   │
│   ├── services/
│   │   └── googleSheets.js             # API calls to backend
│   │
│   ├── assets/                         # App icons and images
│   │   ├── icon.png                    # App icon (1024x1024)
│   │   ├── adaptive-icon.png           # Android adaptive icon
│   │   └── splash.png                  # Splash screen
│   │
│   └── scripts/                        # Helper scripts
│       ├── setup.bat                   # Automated setup
│       ├── start-backend.bat           # Start backend server
│       └── check-ip.bat                # Find computer IP
│
├── 🔧 BACKEND (Node.js + Express)
│   ├── backend/
│   │   ├── server.js                   # Express API server
│   │   └── package.json                # Backend dependencies
│
└── 📚 DOCUMENTATION
    ├── README.md                       # Main documentation
    ├── QUICKSTART.md                   # Quick start guide
    ├── DEPLOYMENT.md                   # Production deployment
    └── PROJECT_OVERVIEW.md             # This file
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│  Google Sheets  │
│  (Data Source)  │
└────────┬────────┘
         │
         │ Google Sheets API (Service Account)
         │
         ▼
┌─────────────────┐
│  Backend Server │
│  (Node.js/Express)│
│  Port 3001      │
└────────┬────────┘
         │
         │ REST API (HTTP/HTTPS)
         │
         ▼
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
│  Android Device │
└─────────────────┘
```

---

## 🔐 Authentication & Security

### Service Account Access
- **Type**: Google Cloud Service Account
- **Email**: `lunch2@lunch-389713.iam.gserviceaccount.com`
- **Project**: `lunch-389713`
- **Permissions**: Read-only access to Google Sheets
- **Credentials**: Stored in backend (private key)

### Security Considerations
1. ✅ Backend has read-only access (can't modify sheets)
2. ✅ Service account credentials not exposed in mobile app
3. ⚠️ Backend credentials are in code (use environment variables for production)
4. ⚠️ No authentication on API endpoints (consider adding API keys)
5. ✅ CORS enabled for mobile app access

---

## 📊 Features

### Current Features
- ✅ Display all lunch orders in a scrollable table
- ✅ Summary view showing total per client
- ✅ Pull-to-refresh functionality
- ✅ Manual refresh button
- ✅ Last update timestamp
- ✅ Clean, mobile-optimized UI
- ✅ Bulgarian language interface
- ✅ Offline error handling

### Possible Future Enhancements
- 📱 Push notifications when sheet is updated
- 🔍 Search and filter functionality
- 👤 User-specific views (show only my orders)
- 📊 Charts and statistics
- 🌓 Dark mode support
- 💾 Offline caching
- 🔔 Order confirmation system
- 📅 Historical data view

---

## 🛠️ Technical Details

### Mobile App Technologies
- **React Native**: 0.74.0
- **Expo**: ~51.0.0
- **Axios**: ^1.6.0 (HTTP client)
- **React Native Table Component**: ^1.2.2

### Backend Technologies
- **Express**: ^4.18.2
- **Google APIs**: ^128.0.0
- **CORS**: ^2.8.5

### Development Tools
- **EAS CLI**: For building APK
- **Expo Go**: For testing on device
- **Node.js**: Runtime environment

---

## 🚀 Deployment Options

### Development (Local)
- Backend runs on developer's computer (port 3001)
- Mobile devices connect via local WiFi
- IP address: `http://192.168.x.x:3001`

### Production (Cloud)
- Backend deployed to cloud service:
  - **Render.com** (Free tier available)
  - **Railway.app** (Free tier available)
  - **Heroku** (Paid)
  - **VPS** (DigitalOcean, Linode, etc.)
- Mobile app connects via HTTPS: `https://your-backend.com`

### Distribution
- APK file installation (no Google Play Store)
- Methods:
  1. Google Drive / Dropbox links
  2. Email attachments
  3. USB transfer
  4. Firebase App Distribution
  5. Self-hosted download page

---

## 📋 API Endpoints

### Backend API

#### `GET /api/health`
**Purpose**: Health check
**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-19T10:30:00.000Z"
}
```

#### `GET /api/orders`
**Purpose**: Fetch all orders and summary
**Response**:
```json
{
  "orders": [
    {
      "Client": "John Doe",
      "restorant": "Restaurant Name",
      "desc": "Meal description",
      "price": 12.50,
      "disc_price": 11.00,
      "quant": 1,
      "total": 11.00
    }
  ],
  "summary": [
    {
      "Client": "John Doe",
      "total": 11.00
    }
  ]
}
```

#### `GET /api/last-modified`
**Purpose**: Get spreadsheet last modified time
**Response**:
```json
{
  "modifiedTime": "2024-01-19T10:30:00.000Z"
}
```

---

## 🔧 Configuration Files

### `app.json`
Main Expo configuration:
- App name and slug
- Android package name: `com.lunchorders.app`
- Version information
- Icon and splash screen paths

### `eas.json`
Build configuration:
- Production profile builds APK
- Development profile for testing

### `package.json`
Dependencies and scripts:
- Start development server: `npm start`
- Build Android: `eas build -p android`

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Causes**:
- Backend not running
- Wrong IP address in BACKEND_URL
- Firewall blocking port 3001
- Not on same WiFi network

**Solutions**:
1. Ensure backend is running: `npm start` in backend folder
2. Check IP address: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update BACKEND_URL in `services/googleSheets.js`
4. Disable firewall temporarily to test

### Issue: "App won't install"
**Causes**:
- "Unknown sources" not enabled
- Incompatible Android version
- Corrupted APK file

**Solutions**:
1. Enable "Install unknown apps" in Android settings
2. Ensure Android 5.0+ (API level 21+)
3. Re-download APK file

### Issue: "Build failed on EAS"
**Causes**:
- Invalid app.json
- Missing assets
- Network issues

**Solutions**:
1. Validate app.json syntax
2. Ensure all required assets exist
3. Clear cache: `eas build --clear-cache`

---

## 💡 Best Practices

### Development
1. Always test on real devices before building APK
2. Use Expo Go for rapid development
3. Keep backend running during development
4. Check backend logs for errors

### Production
1. Deploy backend to reliable cloud service
2. Use HTTPS for backend URL
3. Version your APK builds (increment versionCode)
4. Keep old APK versions for rollback
5. Test on multiple Android devices/versions
6. Monitor backend uptime and errors

### Security
1. Never commit credentials to public repos
2. Use environment variables for sensitive data
3. Consider adding API authentication
4. Implement rate limiting on backend
5. Keep dependencies updated

---

## 📦 File Size

- **APK Size**: ~20-50 MB (typical for React Native apps)
- **Backend**: Minimal (< 1 MB without node_modules)
- **Source Code**: ~2-3 MB

---

## 🎨 Customization Guide

### Change App Colors
Edit `App.js` styles:
```javascript
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0066cc', // Change header color
  },
  // ... other styles
});
```

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change App Icon
Replace files in `assets/` folder:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778)

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. Update dependencies monthly
2. Check Google Cloud Service Account status
3. Monitor backend uptime
4. Review error logs
5. Update APK when making changes

### Getting Help
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Google Sheets API**: https://developers.google.com/sheets/api

---

## 📝 Version History

### Version 1.0.0 (Initial Release)
- Basic order display functionality
- Summary by client
- Pull-to-refresh
- Manual refresh button
- Bulgarian language UI

---

## 📄 License

This application is created for internal use.

---

**Created**: January 2026
**Technology Stack**: React Native + Expo + Node.js + Express + Google Sheets API
**Platform**: Android
**Distribution**: APK (Side-loading)

---

## 🎯 Quick Links

- [Main README](README.md) - Complete documentation
- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Assets Guide](assets/README.md) - App icons and images

---

**Ready to build your lunch orders app! 🍽️📱**
