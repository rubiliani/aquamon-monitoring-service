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

// Email configuration with multiple providers support
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (emailService === 'sendgrid') {
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else if (emailService === 'mailgun') {
    return nodemailer.createTransporter({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASS
      }
    });
  } else {
    // Default to Gmail
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

const transporter = createTransporter();

// Store device status and notification history
const deviceStatus = new Map();
const notificationHistory = new Map();
const serviceStats = {
  startTime: Date.now(),
  totalChecks: 0,
  offlineDevices: 0,
  notificationsSent: 0,
  errors: 0
};

class AquaMonMonitoringService {
  constructor() {
    this.checkInterval = 60000; // Check every minute
    this.offlineDevices = new Set();
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async start() {
    console.log('🚀 Starting AquaMon Monitoring Service...');
    console.log(`📊 Service started at: ${new Date().toISOString()}`);
    
    // Test Firebase connection
    await this.testFirebaseConnection();
    
    // Test email configuration
    await this.testEmailConfiguration();
    
    // Start the monitoring loop
    this.startMonitoring();
    
    // Start the web server for health checks
    this.startWebServer();
    
    console.log('✅ AquaMon Monitoring Service started successfully');
  }

  async testFirebaseConnection() {
    try {
      const snapshot = await database.ref('aquariums').limitToFirst(1).once('value');
      console.log('✅ Firebase connection successful');
    } catch (error) {
      console.error('❌ Firebase connection failed:', error.message);
      throw error;
    }
  }

  async testEmailConfiguration() {
    try {
      await transporter.verify();
      console.log('✅ Email configuration successful');
    } catch (error) {
      console.error('❌ Email configuration failed:', error.message);
      throw error;
    }
  }

  async getUserEmails(userIds) {
    const userEmails = {};
    
    try {
      // Try to get user emails from a users collection first
      const usersSnapshot = await database.ref('users').once('value');
      const users = usersSnapshot.val();
      
      if (users) {
        // If users collection exists, use it
        for (const [userId, userData] of Object.entries(users)) {
          if (userData.email) {
            userEmails[userId] = userData.email;
          }
        }
        console.log(`📧 Found ${Object.keys(userEmails).length} user emails from users collection`);
      } else {
        // Fallback: try to get user info from Firebase Auth (requires additional setup)
        console.log('ℹ️ No users collection found, using fallback method');
        
        // Fallback: get user emails from aquarium-settings
        console.log('ℹ️ No users collection found, using aquarium-settings fallback');
        
        for (const userId of userIds) {
          // Try to get from aquarium-settings as fallback
          const settingsSnapshot = await database.ref(`aquarium-settings`).once('value');
          const allSettings = settingsSnapshot.val();
          
          if (allSettings) {
            for (const [aquariumId, settings] of Object.entries(allSettings)) {
              if (settings.userId === userId) {
                // Prioritize notificationEmail over userEmail
                const email = settings.notificationEmail || settings.userEmail;
                if (email) {
                  userEmails[userId] = email;
                  break;
                }
              }
            }
          }
        }
        
        // Also try to get from aquariums collection as another fallback
        if (Object.keys(userEmails).length === 0) {
          console.log('ℹ️ Trying aquariums collection as fallback');
          const aquariumsSnapshot = await database.ref('aquariums').once('value');
          const aquariums = aquariumsSnapshot.val();
          
          if (aquariums) {
            for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
              if (aquarium.userId && aquarium.userEmail && !userEmails[aquarium.userId]) {
                userEmails[aquarium.userId] = aquarium.userEmail;
              }
            }
          }
        }
      }
      
      console.log(`📧 User emails loaded:`, userEmails);
      return userEmails;
    } catch (error) {
      console.error('❌ Error getting user emails:', error);
      return {};
    }
  }

  startWebServer() {
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        offlineDevices: Array.from(this.offlineDevices),
        stats: serviceStats
      });
    });

    app.get('/status', (req, res) => {
      res.json({
        service: 'AquaMon Monitoring Service',
        version: '1.0.0',
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        offlineDevices: Array.from(this.offlineDevices),
        stats: serviceStats,
        lastCheck: new Date().toISOString()
      });
    });

    app.get('/devices', async (req, res) => {
      try {
        const devices = await this.getAllDevicesStatus();
        res.json(devices);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/test-notification', async (req, res) => {
      try {
        const { email } = req.body;
        await this.sendTestNotification(email || process.env.ADMIN_EMAIL);
        res.json({ message: 'Test notification sent successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
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
        serviceStats.totalChecks++;
      } catch (error) {
        console.error('❌ Error in monitoring cycle:', error);
        serviceStats.errors++;
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

      const aquariumCount = Object.keys(aquariums).length;
      console.log(`📊 Found ${aquariumCount} aquariums to check`);

      // Get user information for all unique user IDs
      const userIds = [...new Set(Object.values(aquariums).map(aq => aq.userId))];
      const userEmails = await this.getUserEmails(userIds);

      // Process each aquarium
      for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
        try {
          // Add user email to aquarium data
          const aquariumWithEmail = {
            ...aquarium,
            userEmail: userEmails[aquarium.userId] || null
          };
          await this.checkAquariumDevices(aquariumId, aquariumWithEmail);
        } catch (error) {
          console.error(`❌ Error checking aquarium ${aquariumId}:`, error);
          serviceStats.errors++;
        }
      }

      serviceStats.offlineDevices = this.offlineDevices.size;
    } catch (error) {
      console.error('❌ Error checking devices:', error);
      serviceStats.errors++;
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
      // Determine recipient email
      const recipientEmail = aquarium.userEmail || process.env.ADMIN_EMAIL;
      
      if (!recipientEmail) {
        console.log(`⚠️ No email address found for user ${aquarium.userId}, skipping notification`);
        return;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `🚨 AquaMon Alert: Device ${deviceId} is Offline`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Device Offline Alert</h2>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p><strong>Aquarium:</strong> ${aquarium.name}</p>
              <p><strong>Location:</strong> ${aquarium.location}</p>
              <p><strong>Device ID:</strong> ${deviceId}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please check your device connection and ensure it's powered on.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from AquaMon Monitoring Service.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Offline notification sent to ${recipientEmail} for device ${deviceId}`);
      serviceStats.notificationsSent++;
    } catch (error) {
      console.error('❌ Error sending offline notification:', error);
      serviceStats.errors++;
    }
  }

  async sendRecoveryNotification(aquariumId, aquarium, deviceId) {
    try {
      // Determine recipient email
      const recipientEmail = aquarium.userEmail || process.env.ADMIN_EMAIL;
      
      if (!recipientEmail) {
        console.log(`⚠️ No email address found for user ${aquarium.userId}, skipping recovery notification`);
        return;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `✅ AquaMon Recovery: Device ${deviceId} is Back Online`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Device Recovery Alert</h2>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p><strong>Aquarium:</strong> ${aquarium.name}</p>
              <p><strong>Location:</strong> ${aquarium.location}</p>
              <p><strong>Device ID:</strong> ${deviceId}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Your device is now back online and sending data normally.</p>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from AquaMon Monitoring Service.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Recovery notification sent to ${recipientEmail} for device ${deviceId}`);
      serviceStats.notificationsSent++;
    } catch (error) {
      console.error('❌ Error sending recovery notification:', error);
      serviceStats.errors++;
    }
  }

  async sendTestNotification(email) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🧪 AquaMon Test Notification`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">🧪 Test Notification</h2>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p>This is a test notification from AquaMon Monitoring Service.</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>If you received this email, your notification system is working correctly!</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Test notification sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
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
      serviceStats.errors++;
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
      serviceStats.errors++;
    }
  }

  async getAllDevicesStatus() {
    try {
      const aquariumsSnapshot = await database.ref('aquariums').once('value');
      const aquariums = aquariumsSnapshot.val();
      
      if (!aquariums) return [];

      const devices = [];
      
      for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
        const settingsSnapshot = await database.ref(`aquarium-settings/${aquariumId}`).once('value');
        const settings = settingsSnapshot.val();
        
        if (!settings || !settings.device_config?.sensorDataProviderId) continue;

        const deviceId = settings.device_config.sensorDataProviderId;
        const offlineTimeoutMinutes = settings.device_config.offlineTimeoutMinutes || 10;
        
        // Get latest sensor data
        const sensorDataSnapshot = await database.ref(`devices/${deviceId}/sensor_data`).once('value');
        const sensorData = sensorDataSnapshot.val();
        
        let status = 'unknown';
        let lastUpdate = null;
        let timeSinceUpdate = null;
        
        if (sensorData) {
          const dataPoints = Object.values(sensorData);
          if (dataPoints.length > 0) {
            const latestData = dataPoints.sort((a, b) => b.timestamp - a.timestamp)[0];
            lastUpdate = new Date(latestData.timestamp * 1000);
            timeSinceUpdate = Date.now() - (latestData.timestamp * 1000);
            
            const offlineTimeoutMs = offlineTimeoutMinutes * 60 * 1000;
            status = timeSinceUpdate > offlineTimeoutMs ? 'offline' : 'online';
          }
        }
        
        devices.push({
          aquariumId,
          aquariumName: aquarium.name,
          deviceId,
          status,
          lastUpdate,
          timeSinceUpdate,
          offlineTimeoutMinutes,
          location: aquarium.location
        });
      }
      
      return devices;
    } catch (error) {
      console.error('❌ Error getting devices status:', error);
      throw error;
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
