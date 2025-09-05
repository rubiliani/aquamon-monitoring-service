# AquaMon Monitoring Service - Deployment Guide

This guide covers deploying the AquaMon Monitoring Service to various cloud platforms.

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd AquaMon-Monitoring-Service
   npm install
   node setup.js
   ```

2. **Test Locally**
   ```bash
   npm start
   ```

3. **Deploy to Cloud Platform** (see sections below)

## ☁️ Deployment Options

### 1. Railway (Recommended - Free Tier Available)

Railway is the easiest platform for Node.js applications with a generous free tier.

#### Steps:
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Connect your GitHub repository
   - Select the monitoring service folder
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
   - Go to your project dashboard
   - Navigate to Variables tab
   - Add all variables from `env.example`

4. **Deploy**
   - Railway will automatically deploy on every push
   - Your service will be available at `https://your-app.railway.app`

#### Railway Configuration:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/health`

### 2. Render (Free Tier Available)

Render provides free hosting for web services with automatic deployments.

#### Steps:
1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the monitoring service folder
   - Choose "Web Service"

3. **Configure Service**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

4. **Set Environment Variables**
   - Add all variables from `env.example`
   - Use the Render dashboard

5. **Deploy**
   - Render will build and deploy automatically
   - Your service will be available at `https://your-app.onrender.com`

### 3. Heroku (Paid Plans Only)

Heroku no longer offers free tiers, but provides reliable hosting.

#### Steps:
1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-aquamon-monitor
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set FIREBASE_PROJECT_ID=your-project-id
   heroku config:set FIREBASE_PRIVATE_KEY_ID=your-key-id
   # ... set all other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### 4. DigitalOcean App Platform

DigitalOcean offers a simple platform for deploying applications.

#### Steps:
1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Sign up

2. **Create New App**
   - Connect your GitHub repository
   - Select the monitoring service folder
   - Choose "Web Service"

3. **Configure App**
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Health Check**: `/health`

4. **Set Environment Variables**
   - Add all variables from the app dashboard

5. **Deploy**
   - DigitalOcean will build and deploy automatically

### 5. VPS/Server Deployment

For self-hosted solutions on VPS or dedicated servers.

#### Using PM2 (Recommended):
1. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd AquaMon-Monitoring-Service
   npm install
   node setup.js
   ```

3. **Start with PM2**
   ```bash
   pm2 start monitor.js --name aquamon-monitor
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Using Docker:
1. **Build Docker Image**
   ```bash
   docker build -t aquamon-monitor .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name aquamon-monitor \
     --env-file .env \
     -p 3000:3000 \
     aquamon-monitor
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     aquamon-monitor:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env
       restart: unless-stopped
   ```

## 🔧 Environment Variables

All platforms require these environment variables:

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

## 📊 Monitoring and Health Checks

All deployments include health check endpoints:

- **Health Check**: `GET /health`
- **Status**: `GET /status`
- **Devices**: `GET /devices`
- **Test Notification**: `POST /test-notification`

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Firebase Security**: Use service accounts with minimal permissions
3. **Email Security**: Use app passwords, not regular passwords
4. **HTTPS**: Use HTTPS in production (most platforms provide this automatically)
5. **Firewall**: Restrict access to monitoring endpoints if needed

## 🚨 Troubleshooting

### Common Issues:

1. **Firebase Connection Failed**
   - Check service account credentials
   - Verify database URL format
   - Ensure private key is properly formatted

2. **Email Not Sending**
   - Verify email credentials
   - Check if 2FA is enabled (use app password)
   - Test with different email service

3. **Service Not Starting**
   - Check all environment variables are set
   - Verify Node.js version compatibility
   - Check logs for specific errors

4. **Memory Issues**
   - Monitor memory usage
   - Consider upgrading to higher tier
   - Optimize code if needed

### Logs and Debugging:

- **Railway**: Check logs in dashboard
- **Render**: View logs in service dashboard
- **Heroku**: `heroku logs --tail`
- **PM2**: `pm2 logs aquamon-monitor`
- **Docker**: `docker logs aquamon-monitor`

## 📈 Scaling

For high-volume deployments:

1. **Horizontal Scaling**: Deploy multiple instances
2. **Load Balancing**: Use load balancer for multiple instances
3. **Database Optimization**: Consider Firebase quotas
4. **Monitoring**: Set up external monitoring (UptimeRobot, etc.)

## 🔄 Updates and Maintenance

1. **Automatic Updates**: Most platforms support auto-deploy from Git
2. **Manual Updates**: Pull latest changes and redeploy
3. **Backup**: Regular backup of configuration
4. **Monitoring**: Set up alerts for service downtime

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Railway | ✅ 500 hours/month | $5/month | Easy setup |
| Render | ✅ 750 hours/month | $7/month | Simple hosting |
| Heroku | ❌ | $7/month | Enterprise |
| DigitalOcean | ❌ | $5/month | VPS control |
| VPS | ❌ | $3-10/month | Full control |

Choose the platform that best fits your needs and budget!
