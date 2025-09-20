const admin = require('firebase-admin');
require('dotenv').config();

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
const messaging = admin.messaging();

async function testDeviceOfflineNotification() {
  try {
    console.log('🔍 Testing device offline notification...');
    
    // Get FCM tokens from database
    const tokensSnapshot = await database.ref('fcm-tokens').once('value');
    const tokens = tokensSnapshot.val();
    
    if (!tokens) {
      console.log('❌ No FCM tokens found in database');
      return;
    }
    
    // Find the first user with active tokens
    let targetUserId = null;
    let targetTokens = [];
    
    for (const [userId, userTokens] of Object.entries(tokens)) {
      if (userTokens && typeof userTokens === 'object') {
        const activeTokens = Object.values(userTokens).filter(token => token.isActive);
        if (activeTokens.length > 0) {
          targetUserId = userId;
          targetTokens = activeTokens.map(token => token.token);
          console.log(`✅ Found ${activeTokens.length} active tokens for user ${userId}`);
          break;
        }
      }
    }
    
    if (targetTokens.length === 0) {
      console.log('❌ No active FCM tokens found');
      return;
    }
    
    // Simulate device offline notification
    const message = {
      notification: {
        title: '🔴 Device Offline Alert',
        body: 'Test Aquarium: ESP32-001 is offline - No data for 15 minutes'
      },
      data: {
        type: 'device_offline',
        aquariumId: 'test-aquarium-123',
        deviceId: 'ESP32-001',
        reason: 'No data for 15 minutes',
        severity: 'high',
        timestamp: Date.now().toString()
      },
      tokens: targetTokens,
    };
    
    console.log('📤 Sending device offline notification...');
    const response = await messaging.sendEachForMulticast(message);
    
    console.log('✅ Device offline notification sent successfully!');
    console.log(`📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);
    
    // Wait 3 seconds then send recovery notification
    console.log('⏳ Waiting 3 seconds before sending recovery notification...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const recoveryMessage = {
      notification: {
        title: '🟢 Device Online Alert',
        body: 'Test Aquarium: ESP32-001 is back online'
      },
      data: {
        type: 'device_online',
        aquariumId: 'test-aquarium-123',
        deviceId: 'ESP32-001',
        severity: 'low',
        timestamp: Date.now().toString()
      },
      tokens: targetTokens,
    };
    
    console.log('📤 Sending device recovery notification...');
    const recoveryResponse = await messaging.sendEachForMulticast(recoveryMessage);
    
    console.log('✅ Device recovery notification sent successfully!');
    console.log(`📊 Success: ${recoveryResponse.successCount}, Failed: ${recoveryResponse.failureCount}`);
    
  } catch (error) {
    console.error('❌ Error sending device offline notification:', error);
  } finally {
    process.exit(0);
  }
}

testDeviceOfflineNotification();
