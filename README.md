# AquaMon Monitoring Service

A standalone Node.js service that monitors AquaMon ESP32 devices and sends email notifications when devices go offline. This service runs independently of the web application and provides continuous monitoring of your aquarium devices.

## Features

- 🔍 **Continuous Monitoring**: Checks device status every minute
- 📧 **User-Specific Email Notifications**: Sends alerts to individual users for their aquariums only
- 🌐 **Web App Integration**: Creates notifications in the web app's notification center
- ⚙️ **Configurable Timeouts**: Uses the offline timeout settings from your aquarium configuration
- 🚀 **Easy Deployment**: Can be deployed to various cloud platforms
- 📊 **Health Monitoring**: Provides health check endpoints
- 👥 **Multi-User Support**: Each user receives notifications only for their own aquariums

## Prerequisites

- Node.js 16+ 
- Firebase project with Realtime Database
- Gmail account (or other email service)
- AquaMon web app with configured aquariums and devices

## Setup

### 1. Firebase Service Account

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate new private key"
4. Download the JSON file
5. Extract the following values:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`

### 2. Gmail App Password

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings > Security
3. Generate an "App Password" for this service
4. Use this password (not your regular Gmail password)

### 3. Environment Configuration

1. Copy `env.example` to `.env`
2. Fill in your configuration:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

## Deployment Options

### Railway (Recommended - Free Tier Available)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Render (Free Tier Available)

1. Create a new Web Service on Render
2. Connect your repository
3. Set environment variables
4. Deploy

### Heroku (Free Tier Discontinued)

1. Create a new Heroku app
2. Set environment variables: `heroku config:set KEY=value`
3. Deploy: `git push heroku main`

### VPS/Server

1. Install Node.js and PM2
2. Clone the repository
3. Set up environment variables
4. Run with PM2: `pm2 start index.js --name aquamon-monitor`

## How It Works

1. **Device Discovery**: The service reads all aquariums from Firebase
2. **User Email Lookup**: Retrieves user email addresses for each aquarium owner
3. **Settings Retrieval**: Gets offline timeout settings for each aquarium
4. **Data Monitoring**: Checks the latest sensor data for each device
5. **Status Evaluation**: Compares last update time with configured timeout
6. **User-Specific Notifications**: Sends email alerts to individual users for their aquariums only
7. **Web App Integration**: Creates notifications in the web app's notification center
8. **Recovery Detection**: Monitors for devices coming back online

## User-Specific Notifications

The monitoring service automatically sends notifications to the correct user for each aquarium:

- **Email Lookup**: The service looks up user emails from:
  1. `users` collection (if available)
  2. `aquarium-settings` collection (fallback)
  3. `aquariums` collection (fallback)
- **Individual Alerts**: Each user receives notifications only for their own aquariums
- **Admin Fallback**: If no user email is found, notifications are sent to the admin email
- **Privacy**: Users only see alerts for their own devices

## API Endpoints

- `GET /health` - Basic health check
- `GET /status` - Detailed service status and offline devices

## Monitoring

The service logs all activities to the console. Key log messages:

- `🔍 Checking all devices...` - Monitoring cycle started
- `📊 Device {id}: Last update Xs ago` - Device status check
- `🔴 Device {id} is OFFLINE` - Device offline detected
- `🟢 Device {id} is back ONLINE` - Device recovery detected
- `📧 Offline notification sent` - Email notification sent
- `📝 Notification created in database` - Web app notification created

## Troubleshooting

### Common Issues

1. **Firebase Authentication Error**
   - Check your service account credentials
   - Ensure the private key is properly formatted with `\n` characters

2. **Email Not Sending**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail account

3. **No Devices Found**
   - Ensure aquariums are configured in the web app
   - Check that devices are bound to aquariums

4. **Database Permission Errors**
   - Verify Firebase Realtime Database rules allow service account access
   - Check that the service account has proper permissions

### Logs

Check the service logs for detailed error messages and status information.

## Configuration

The service automatically uses the offline timeout settings configured in your aquarium settings. You can adjust these in the web app under Settings > Device Configuration.

## Support

For issues and questions, please check the main AquaMon project documentation or create an issue in the repository.
