# AquaMon Monitoring Service - Complete Solution

## 🎯 Overview

The AquaMon Monitoring Service is a standalone Node.js application that continuously monitors ESP32 devices and sends email notifications when they go offline. It integrates seamlessly with your existing AquaMon web application and Firebase database.

## ✨ Key Features

### 🔍 **Continuous Monitoring**
- Checks device status every minute
- Uses configurable offline timeouts from aquarium settings
- Monitors all aquariums and their bound devices
- Real-time status tracking

### 📧 **Email Notifications**
- Sends alerts when devices go offline
- Sends recovery notifications when devices come back online
- Supports multiple email providers (Gmail, SendGrid, Mailgun)
- HTML-formatted emails with detailed information

### 🌐 **Web App Integration**
- Creates notifications in the web app's notification center
- Maintains consistency with existing notification system
- Shows offline/online status in real-time

### 🚀 **Easy Deployment**
- Ready for Railway, Render, Heroku, DigitalOcean
- Docker support for containerized deployment
- VPS deployment with PM2
- Comprehensive deployment guides

### 📊 **Monitoring & Health Checks**
- Health check endpoints (`/health`, `/status`)
- Device status API (`/devices`)
- Test notification endpoint
- Comprehensive logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ESP32 Device  │───▶│  Firebase DB     │◀───│  Monitoring     │
│                 │    │                  │    │  Service        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Web App        │    │  Email Service  │
                       │   Notifications  │    │  (Gmail/etc)    │
                       └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
AquaMon-Monitoring-Service/
├── index.js              # Basic monitoring service
├── monitor.js            # Advanced monitoring service (recommended)
├── setup.js              # Interactive setup script
├── package.json          # Dependencies and scripts
├── Dockerfile            # Container configuration
├── railway.json          # Railway deployment config
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # Setup and usage guide
├── DEPLOYMENT.md         # Deployment instructions
└── SUMMARY.md            # This file
```

## 🚀 Quick Start

### 1. **Setup**
```bash
git clone <your-repo>
cd AquaMon-Monitoring-Service
npm install
node setup.js
```

### 2. **Test Locally**
```bash
npm start
```

### 3. **Deploy to Cloud**
- **Railway**: Connect GitHub repo, set env vars, deploy
- **Render**: Create web service, set env vars, deploy
- **Heroku**: `heroku create`, set config, `git push heroku main`

## 🔧 Configuration

### Required Environment Variables:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Server Configuration
PORT=3000
NODE_ENV=production
```

## 📊 How It Works

### 1. **Device Discovery**
- Reads all aquariums from Firebase
- Gets device configuration for each aquarium
- Identifies bound ESP32 devices

### 2. **Status Monitoring**
- Checks latest sensor data for each device
- Compares last update time with configured timeout
- Determines if device is online or offline

### 3. **Notification Logic**
- **Offline Detection**: Sends email + creates web app notification
- **Recovery Detection**: Sends recovery email + creates web app notification
- **Duplicate Prevention**: Avoids sending multiple notifications for same issue

### 4. **Integration Points**
- **Firebase**: Reads aquarium settings, device data, creates notifications
- **Email Service**: Sends HTML-formatted notifications
- **Web App**: Creates notifications that appear in notification center

## 🎛️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/status` | GET | Detailed service status |
| `/devices` | GET | All devices status |
| `/test-notification` | POST | Send test email |

## 🔒 Security Features

- **Service Account**: Uses Firebase service account (not user credentials)
- **Environment Variables**: Secure configuration management
- **HTTPS**: Automatic HTTPS on cloud platforms
- **Minimal Permissions**: Only accesses required Firebase paths

## 📈 Monitoring & Logging

### Log Levels:
- `🔍` Info: Normal operations
- `⚠️` Warning: Non-critical issues
- `❌` Error: Critical failures
- `📧` Email: Notification events
- `📝` Database: Firebase operations

### Health Checks:
- Service uptime and memory usage
- Offline devices count
- Total checks and notifications sent
- Error count and rate

## 🚨 Troubleshooting

### Common Issues:

1. **Firebase Connection**
   - Verify service account credentials
   - Check private key formatting
   - Ensure database URL is correct

2. **Email Not Sending**
   - Verify email credentials
   - Use app password for Gmail
   - Check email service configuration

3. **No Devices Found**
   - Ensure aquariums are configured
   - Check device binding in web app
   - Verify Firebase permissions

4. **Service Not Starting**
   - Check all environment variables
   - Verify Node.js version (16+)
   - Review error logs

## 💰 Cost Analysis

### Free Tiers Available:
- **Railway**: 500 hours/month free
- **Render**: 750 hours/month free
- **VPS**: $3-5/month for basic server

### Recommended Setup:
- **Development**: Railway free tier
- **Production**: Railway $5/month or VPS $5/month
- **Enterprise**: Heroku or dedicated server

## 🔄 Maintenance

### Regular Tasks:
- Monitor service health
- Check email delivery
- Review error logs
- Update dependencies

### Updates:
- Automatic deployment from Git
- Manual updates via platform dashboard
- Rollback capability on most platforms

## 🎉 Benefits

### For Users:
- **Peace of Mind**: Know immediately when devices go offline
- **Quick Response**: Faster issue resolution
- **Unified Experience**: Notifications in web app + email

### For System:
- **Reliability**: Continuous monitoring independent of web app
- **Scalability**: Can monitor unlimited devices
- **Flexibility**: Configurable timeouts and notification preferences

## 🚀 Next Steps

1. **Deploy the Service**: Choose your preferred platform
2. **Configure Notifications**: Set up email and test
3. **Monitor Performance**: Check health endpoints
4. **Scale as Needed**: Add more devices or upgrade hosting

## 📞 Support

- **Documentation**: Check README.md and DEPLOYMENT.md
- **Issues**: Create GitHub issue for bugs
- **Questions**: Check troubleshooting section
- **Updates**: Follow repository for new features

---

**The AquaMon Monitoring Service provides enterprise-grade monitoring for your aquarium devices with minimal setup and maximum reliability!** 🐠📊
