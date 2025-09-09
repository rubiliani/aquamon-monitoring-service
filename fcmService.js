const admin = require('firebase-admin');

class FCMService {
  constructor() {
    this.database = admin.database();
    this.messaging = admin.messaging();
    this.FCM_TOKENS_PATH = 'fcm-tokens';
  }

  async getUserFCMTokens(userId) {
    try {
      const snapshot = await this.database
        .ref(`${this.FCM_TOKENS_PATH}/${userId}`)
        .once('value');
      
      const tokens = snapshot.val();
      if (!tokens) {
        console.log(`No FCM tokens found for user ${userId}`);
        return [];
      }

      // Filter out inactive tokens and return active ones
      const activeTokens = Object.values(tokens).filter(token => token.isActive);
      console.log(`Found ${activeTokens.length} active FCM tokens for user ${userId}`);
      
      return activeTokens.map(token => token.token);
    } catch (error) {
      console.error(`Error getting FCM tokens for user ${userId}:`, error);
      return [];
    }
  }

  async sendNotification(userId, title, body, data = {}) {
    try {
      const tokens = await this.getUserFCMTokens(userId);
      if (tokens.length === 0) {
        console.log(`No active FCM tokens found for user ${userId}, skipping push notification.`);
        return { success: false, reason: 'No tokens' };
      }

      const message = {
        notification: { 
          title, 
          body 
        },
        data: { 
          ...data, 
          click_action: 'FLUTTER_NOTIFICATION_CLICK' 
        },
        tokens: tokens,
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log(`Successfully sent FCM message to user ${userId}:`, response);
      
      // Handle invalid tokens for cleanup
      if (response.responses) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(`Token ${tokens[idx]} failed: ${resp.error?.message}`);
            if (resp.error?.code === 'messaging/invalid-registration-token' ||
                resp.error?.code === 'messaging/registration-token-not-registered') {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        // Remove invalid tokens
        if (invalidTokens.length > 0) {
          await this.removeInvalidTokens(userId, invalidTokens);
        }
      }

      return { success: true, sent: response.successCount, failed: response.failureCount };
    } catch (error) {
      console.error(`Error sending FCM message to user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  async removeInvalidTokens(userId, invalidTokens) {
    try {
      const updates = {};
      invalidTokens.forEach(token => {
        updates[`${this.FCM_TOKENS_PATH}/${userId}/${token}`] = null;
      });
      
      await this.database.ref().update(updates);
      console.log(`Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
    } catch (error) {
      console.error(`Error removing invalid FCM tokens for user ${userId}:`, error);
    }
  }

  async sendDeviceOfflineNotification(aquariumId, aquarium, deviceId, reason) {
    try {
      const notification = {
        title: '🔴 Device Offline',
        body: `${aquarium.name}: ${deviceId} is offline - ${reason}`,
        type: 'device_offline',
        aquariumId: aquariumId,
        deviceId: deviceId,
        reason: reason
      };

      return await this.sendNotificationToUser(aquarium.userId, notification);
    } catch (error) {
      console.error('❌ Error sending device offline notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDeviceOnlineNotification(aquariumId, aquarium, deviceId) {
    try {
      const notification = {
        title: '🟢 Device Online',
        body: `${aquarium.name}: ${deviceId} is back online`,
        type: 'device_online',
        aquariumId: aquariumId,
        deviceId: deviceId
      };

      return await this.sendNotificationToUser(aquarium.userId, notification);
    } catch (error) {
      console.error('❌ Error sending device online notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSensorAlertNotification(aquariumId, aquarium, deviceId, alert) {
    try {
      const notification = {
        title: alert.title,
        body: alert.message,
        type: 'sensor_alert',
        aquariumId: aquariumId,
        severity: alert.severity,
        alertType: alert.type
      };

      return await this.sendNotificationToUser(aquarium.userId, notification);
    } catch (error) {
      console.error('❌ Error sending sensor alert notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendNotificationToUser(userId, notification) {
    try {
      const result = await this.sendNotification(
        userId,
        notification.title,
        notification.body,
        {
          type: notification.type,
          aquariumId: notification.aquariumId,
          deviceId: notification.deviceId || '',
          severity: notification.severity || '',
          alertType: notification.alertType || '',
          reason: notification.reason || ''
        }
      );

      if (result.success) {
        console.log(`📱 Push notification sent to user ${userId}: ${notification.title}`);
      } else {
        console.log(`⚠️ Push notification failed for user ${userId}: ${result.reason || result.error}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error in sendNotificationToUser:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = FCMService;
