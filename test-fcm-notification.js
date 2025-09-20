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

async function testFCMNotification() {
  try {
    console.log('🔍 Checking for FCM tokens...');
    
    // Get FCM tokens from database
    const tokensSnapshot = await database.ref('fcm-tokens').once('value');
    const tokens = tokensSnapshot.val();
    
    if (!tokens) {
      console.log('❌ No FCM tokens found in database');
      return;
    }
    
    console.log('📱 Found FCM tokens:', Object.keys(tokens).length, 'users');
    
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
    
    // Send test notification
    const message = {
      notification: {
        title: '🧪 AquaMon Test Notification',
        body: 'This is a test push notification from the monitoring service!'
      },
      data: {
        type: 'test',
        timestamp: Date.now().toString(),
        source: 'monitoring-service'
      },
      tokens: targetTokens,
    };
    
    console.log('📤 Sending test notification...');
    const response = await messaging.sendEachForMulticast(message);
    
    console.log('✅ Notification sent successfully!');
    console.log(`📊 Success: ${response.successCount}, Failed: ${response.failureCount}`);
    
    if (response.responses) {
      response.responses.forEach((resp, idx) => {
        if (resp.success) {
          console.log(`✅ Token ${idx + 1}: Success`);
        } else {
          console.log(`❌ Token ${idx + 1}: ${resp.error?.message}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
  } finally {
    process.exit(0);
  }
}

testFCMNotification();
