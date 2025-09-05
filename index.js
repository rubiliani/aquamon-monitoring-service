const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const database = admin.database();

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use App Password for Gmail
  }
});

// Store device status to avoid duplicate notifications
const deviceStatus = new Map();
const notificationCooldown = new Map();

class AquaMonMonitoringService {
  constructor() {
    this.checkInterval = 60000; // Check every minute
    this.offlineDevices = new Set();
  }

  async start() {
    console.log('🚀 Starting AquaMon Monitoring Service...');
    
    // Start the monitoring loop
    this.startMonitoring();
    
    // Start the web server for health checks
    this.startWebServer();
    
    console.log('✅ AquaMon Monitoring Service started successfully');
  }

  startWebServer() {
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        offlineDevices: Array.from(this.offlineDevices)
      });
    });

    app.get('/status', (req, res) => {
      res.json({
        service: 'AquaMon Monitoring Service',
        version: '1.0.0',
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        offlineDevices: Array.from(this.offlineDevices)
      });
    });

    app.listen(PORT, () => {
      console.log(`🌐 Web server running on port ${PORT}`);
    });
  }

  startMonitoring() {
    // Run monitoring every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkAllDevices();
      } catch (error) {
        console.error('❌ Error in monitoring cycle:', error);
      }
    });

    // Also run immediately on startup
    setTimeout(() => {
      this.checkAllDevices();
    }, 5000);
  }

  async checkAllDevices() {
    console.log('🔍 Checking all devices...');
    
    try {
      // Get all aquariums and their settings
      const aquariumsSnapshot = await database.ref('aquariums').once('value');
      const aquariums = aquariumsSnapshot.val();
      
      if (!aquariums) {
        console.log('ℹ️ No aquariums found');
        return;
      }

      // Process each aquarium
      for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
        try {
          await this.checkAquariumDevices(aquariumId, aquarium);
        } catch (error) {
          console.error(`❌ Error checking aquarium ${aquariumId}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error checking devices:', error);
    }
  }

  async checkAquariumDevices(aquariumId, aquarium) {
    // Get aquarium settings
    const settingsSnapshot = await database.ref(`aquarium-settings/${aquariumId}`).once('value');
    const settings = settingsSnapshot.val();
    
    if (!settings || !settings.device_config?.sensorDataProviderId) {
      console.log(`ℹ️ No device configured for aquarium ${aquariumId}`);
      return;
    }

    const deviceId = settings.device_config.sensorDataProviderId;
    const offlineTimeoutMinutes = settings.device_config.offlineTimeoutMinutes || 10;
    const offlineTimeoutMs = offlineTimeoutMinutes * 60 * 1000;

    // Get latest sensor data for this device
    const sensorDataSnapshot = await database.ref(`devices/${deviceId}/sensor_data`).once('value');
    const sensorData = sensorDataSnapshot.val();

    if (!sensorData) {
      console.log(`⚠️ No sensor data found for device ${deviceId}`);
      await this.handleDeviceOffline(aquariumId, aquarium, deviceId, 'No sensor data found');
      return;
    }

    // Get the latest data point
    const dataPoints = Object.values(sensorData);
    if (dataPoints.length === 0) {
      console.log(`⚠️ No data points found for device ${deviceId}`);
      await this.handleDeviceOffline(aquariumId, aquarium, deviceId, 'No data points found');
      return;
    }

    // Sort by timestamp and get the latest
    const latestData = dataPoints.sort((a, b) => b.timestamp - a.timestamp)[0];
    const now = Date.now();
    const timeSinceLastUpdate = now - (latestData.timestamp * 1000); // Convert to milliseconds

    console.log(`📊 Device ${deviceId}: Last update ${Math.round(timeSinceLastUpdate / 1000)}s ago`);

    if (timeSinceLastUpdate > offlineTimeoutMs) {
      await this.handleDeviceOffline(aquariumId, aquarium, deviceId, `No data for ${Math.round(timeSinceLastUpdate / 60000)} minutes`);
    } else {
      await this.handleDeviceOnline(aquariumId, aquarium, deviceId);
    }
  }

  async handleDeviceOffline(aquariumId, aquarium, deviceId, reason) {
    const deviceKey = `${aquariumId}-${deviceId}`;
    
    // Check if we already notified about this device being offline
    if (this.offlineDevices.has(deviceKey)) {
      return; // Already offline, no need to notify again
    }

    console.log(`🔴 Device ${deviceId} is OFFLINE: ${reason}`);
    this.offlineDevices.add(deviceKey);

    // Send email notification
    await this.sendOfflineNotification(aquariumId, aquarium, deviceId, reason);
    
    // Create notification in database for web app
    await this.createOfflineNotification(aquariumId, aquarium, deviceId, reason);
  }

  async handleDeviceOnline(aquariumId, aquarium, deviceId) {
    const deviceKey = `${aquariumId}-${deviceId}`;
    
    // Check if device was previously offline
    if (this.offlineDevices.has(deviceKey)) {
      console.log(`🟢 Device ${deviceId} is back ONLINE`);
      this.offlineDevices.delete(deviceKey);
      
      // Send recovery notification
      await this.sendRecoveryNotification(aquariumId, aquarium, deviceId);
      
      // Create recovery notification in database
      await this.createRecoveryNotification(aquariumId, aquarium, deviceId);
    }
  }

  async sendOfflineNotification(aquariumId, aquarium, deviceId, reason) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL, // You can make this configurable per user
        subject: `🚨 AquaMon Alert: Device ${deviceId} is Offline`,
        html: `
          <h2>🚨 Device Offline Alert</h2>
          <p><strong>Aquarium:</strong> ${aquarium.name}</p>
          <p><strong>Location:</strong> ${aquarium.location}</p>
          <p><strong>Device ID:</strong> ${deviceId}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Please check your device connection and ensure it's powered on.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Offline notification sent for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error sending offline notification:', error);
    }
  }

  async sendRecoveryNotification(aquariumId, aquarium, deviceId) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `✅ AquaMon Recovery: Device ${deviceId} is Back Online`,
        html: `
          <h2>✅ Device Recovery Alert</h2>
          <p><strong>Aquarium:</strong> ${aquarium.name}</p>
          <p><strong>Location:</strong> ${aquarium.location}</p>
          <p><strong>Device ID:</strong> ${deviceId}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Your device is now back online and sending data normally.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Recovery notification sent for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error sending recovery notification:', error);
    }
  }

  async createOfflineNotification(aquariumId, aquarium, deviceId, reason) {
    try {
      const notification = {
        userId: aquarium.userId,
        aquariumId: aquariumId,
        aquariumName: aquarium.name,
        type: 'system',
        severity: 'high',
        title: `Device ${deviceId} is Offline`,
        message: `Device ${deviceId} has been offline for ${reason}. Please check the device connection.`,
        timestamp: Date.now(),
        isRead: false,
        deviceId: deviceId,
        reason: reason
      };

      await database.ref('alerts').push(notification);
      console.log(`📝 Offline notification created in database for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error creating offline notification:', error);
    }
  }

  async createRecoveryNotification(aquariumId, aquarium, deviceId) {
    try {
      const notification = {
        userId: aquarium.userId,
        aquariumId: aquariumId,
        aquariumName: aquarium.name,
        type: 'system',
        severity: 'low',
        title: `Device ${deviceId} is Back Online`,
        message: `Device ${deviceId} has recovered and is now sending data normally.`,
        timestamp: Date.now(),
        isRead: false,
        deviceId: deviceId
      };

      await database.ref('alerts').push(notification);
      console.log(`📝 Recovery notification created in database for device ${deviceId}`);
    } catch (error) {
      console.error('❌ Error creating recovery notification:', error);
    }
  }
}

// Start the monitoring service
const monitoringService = new AquaMonMonitoringService();
monitoringService.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down monitoring service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down monitoring service...');
  process.exit(0);
});
