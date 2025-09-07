const admin = require('firebase-admin');

class FCMService {
  constructor() {
    this.messaging = admin.messaging();
  }

  /**
   * Send push notification to user's devices
   */
  async sendNotificationToUser(userId, notification) {
    try {
      console.log(`📱 Sending FCM notification to user ${userId}:`, notification.title);

      // Get user's FCM tokens
      const tokens = await this.getUserFCMTokens(userId);
      
      if (tokens.length === 0) {
        console.log(`ℹ️ No FCM tokens found for user ${userId}, skipping push notification`);
        return { success: false, reason: 'No tokens' };
      }

      // Prepare the message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/logo192.png',
          badge: '/logo192.png'
        },
        data: {
          type: notification.type || 'alert',
          aquariumId: notification.aquariumId || '',
          severity: notification.severity || 'medium',
          timestamp: Date.now().toString(),
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens: tokens
      };

      // Send the notification
      const response = await this.messaging.sendMulticast(message);
      
      console.log(`✅ FCM notification sent successfully:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length
      });

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(`❌ Failed to send to token ${idx}:`, resp.error);
            if (resp.error?.code === 'messaging/invalid-registration-token' || 
                resp.error?.code === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        // Remove invalid tokens
        if (failedTokens.length > 0) {
          await this.removeInvalidTokens(userId, failedTokens);
        }
      }

      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount 
      };

    } catch (error) {
      console.error('❌ Error sending FCM notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get FCM tokens for a user
   */
  async getUserFCMTokens(userId) {
    try {
      const db = admin.database();
      const tokensRef = db.ref(`fcm-tokens/${userId}`);
      const snapshot = await tokensRef.once('value');
      
      if (!snapshot.exists()) {
        return [];
      }

      const tokensData = snapshot.val();
      const activeTokens = [];

      Object.values(tokensData).forEach(tokenData => {
        if (tokenData.isActive) {
          activeTokens.push(tokenData.token);
        }
      });

      console.log(`📱 Found ${activeTokens.length} active FCM tokens for user ${userId}`);
      return activeTokens;

    } catch (error) {
      console.error('❌ Error getting user FCM tokens:', error);
      return [];
    }
  }

  /**
   * Remove invalid FCM tokens
   */
  async removeInvalidTokens(userId, invalidTokens) {
    try {
      const db = admin.database();
      const tokensRef = db.ref(`fcm-tokens/${userId}`);
      const snapshot = await tokensRef.once('value');
      
      if (!snapshot.exists()) {
        return;
      }

      const tokensData = snapshot.val();
      const updates = {};

      // Mark invalid tokens as inactive
      Object.entries(tokensData).forEach(([tokenKey, tokenData]) => {
        if (invalidTokens.includes(tokenData.token)) {
          updates[tokenKey] = {
            ...tokenData,
            isActive: false,
            deactivatedAt: Date.now()
          };
        }
      });

      if (Object.keys(updates).length > 0) {
        await tokensRef.update(updates);
        console.log(`🗑️ Marked ${Object.keys(updates).length} invalid FCM tokens as inactive for user ${userId}`);
      }

    } catch (error) {
      console.error('❌ Error removing invalid FCM tokens:', error);
    }
  }

  /**
   * Send device offline notification
   */
  async sendDeviceOfflineNotification(aquariumId, aquarium, deviceId, reason) {
    const notification = {
      title: `🔴 Device Offline - ${aquarium.name}`,
      body: `Device ${deviceId} has been offline: ${reason}`,
      type: 'device_connectivity',
      aquariumId: aquariumId,
      severity: 'high'
    };

    return await this.sendNotificationToUser(aquarium.userId, notification);
  }

  /**
   * Send device online notification
   */
  async sendDeviceOnlineNotification(aquariumId, aquarium, deviceId) {
    const notification = {
      title: `🟢 Device Online - ${aquarium.name}`,
      body: `Device ${deviceId} is back online and sending data`,
      type: 'device_connectivity',
      aquariumId: aquariumId,
      severity: 'medium'
    };

    return await this.sendNotificationToUser(aquarium.userId, notification);
  }

  /**
   * Send sensor alert notification
   */
  async sendSensorAlertNotification(aquariumId, aquarium, alert) {
    const notification = {
      title: `⚠️ Sensor Alert - ${aquarium.name}`,
      body: `${alert.message} (Value: ${alert.value}, Threshold: ${alert.threshold})`,
      type: 'sensor_alert',
      aquariumId: aquariumId,
      severity: alert.severity
    };

    return await this.sendNotificationToUser(aquarium.userId, notification);
  }

  /**
   * Send system alert notification
   */
  async sendSystemAlertNotification(aquariumId, aquarium, alert) {
    const notification = {
      title: `🔔 System Alert - ${aquarium.name}`,
      body: alert.message,
      type: 'system_alert',
      aquariumId: aquariumId,
      severity: alert.severity
    };

    return await this.sendNotificationToUser(aquarium.userId, notification);
  }
}

module.exports = FCMService;
