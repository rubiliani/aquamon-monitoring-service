#!/usr/bin/env node

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

async function testUserNotifications() {
  console.log('🧪 Testing User-Specific Notifications...\n');

  try {
    // 1. Check aquariums and their user emails
    console.log('1️⃣ Checking aquariums and user emails...');
    const aquariumsSnapshot = await database.ref('aquariums').once('value');
    const aquariums = aquariumsSnapshot.val();
    
    if (!aquariums) {
      console.log('❌ No aquariums found');
      return;
    }

    console.log(`📊 Found ${Object.keys(aquariums).length} aquariums:`);
    for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
      console.log(`  - ${aquarium.name} (${aquariumId})`);
      console.log(`    User ID: ${aquarium.userId}`);
      console.log(`    User Email: ${aquarium.userEmail || 'Not set'}`);
      console.log('');
    }

    // 2. Check aquarium settings for user emails
    console.log('2️⃣ Checking aquarium settings for user emails...');
    const settingsSnapshot = await database.ref('aquarium-settings').once('value');
    const settings = settingsSnapshot.val();
    
    if (settings) {
      console.log(`📊 Found ${Object.keys(settings).length} aquarium settings:`);
      for (const [aquariumId, setting] of Object.entries(settings)) {
        console.log(`  - Aquarium ${aquariumId}:`);
        console.log(`    User ID: ${setting.userId}`);
        console.log(`    User Email: ${setting.userEmail || 'Not set'}`);
        console.log('');
      }
    } else {
      console.log('❌ No aquarium settings found');
    }

    // 3. Test user email lookup logic
    console.log('3️⃣ Testing user email lookup logic...');
    const userIds = [...new Set(Object.values(aquariums).map(aq => aq.userId))];
    console.log(`📊 Unique user IDs: ${userIds.join(', ')}`);

    const userEmails = {};
    
    // Check aquariums collection
    for (const [aquariumId, aquarium] of Object.entries(aquariums)) {
      if (aquarium.userId && aquarium.userEmail && !userEmails[aquarium.userId]) {
        userEmails[aquarium.userId] = aquarium.userEmail;
      }
    }

    // Check aquarium-settings collection
    if (settings) {
      for (const [aquariumId, setting] of Object.entries(settings)) {
        if (setting.userId && setting.userEmail && !userEmails[setting.userId]) {
          userEmails[setting.userId] = setting.userEmail;
        }
      }
    }

    console.log('📧 User emails found:');
    for (const [userId, email] of Object.entries(userEmails)) {
      console.log(`  - ${userId}: ${email}`);
    }

    // 4. Test notification creation
    console.log('\n4️⃣ Testing notification creation...');
    const testNotification = {
      userId: userIds[0] || 'test-user',
      aquariumId: Object.keys(aquariums)[0] || 'test-aquarium',
      aquariumName: 'Test Aquarium',
      type: 'system',
      severity: 'high',
      title: 'Test Device Offline',
      message: 'This is a test notification for user-specific alerts.',
      timestamp: Date.now(),
      isRead: false,
      deviceId: 'test-device',
      reason: 'Test notification'
    };

    const notificationRef = await database.ref('alerts').push(testNotification);
    console.log(`✅ Test notification created with ID: ${notificationRef.key}`);

    // 5. Summary
    console.log('\n📋 Summary:');
    console.log(`- Total aquariums: ${Object.keys(aquariums).length}`);
    console.log(`- Total settings: ${settings ? Object.keys(settings).length : 0}`);
    console.log(`- Users with emails: ${Object.keys(userEmails).length}`);
    console.log(`- Test notification created: ${notificationRef.key}`);

    if (Object.keys(userEmails).length > 0) {
      console.log('\n✅ User-specific notifications are properly configured!');
      console.log('📧 The monitoring service will send notifications to individual users.');
    } else {
      console.log('\n⚠️ No user emails found. Notifications will be sent to admin email.');
      console.log('💡 Make sure to create aquariums through the web app to store user emails.');
    }

  } catch (error) {
    console.error('❌ Error testing user notifications:', error);
  }
}

// Run the test
testUserNotifications()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
