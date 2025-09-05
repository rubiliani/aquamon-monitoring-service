#!/usr/bin/env node

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "aquamon-7a6bf",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "dummy-key-id",
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nDUMMY_KEY\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "dummy@aquamon-7a6bf.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "dummy-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL || "dummy@aquamon-7a6bf.iam.gserviceaccount.com"}`
};

console.log('🧪 Testing Firebase Connection...\n');

// Check if we have proper credentials
if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === "your-project-id") {
  console.log('❌ Firebase credentials not configured');
  console.log('📖 Please follow SETUP_TEST.md to configure Firebase service account');
  console.log('\n🔧 Quick setup:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Generate new private key');
  console.log('3. Create .env file with the credentials');
  console.log('4. Run: npm run test-notifications');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app"
  });

  const database = admin.database();

  async function testConnection() {
    try {
      console.log('🔗 Testing Firebase connection...');
      
      // Test basic connection
      const snapshot = await database.ref('aquariums').limitToFirst(1).once('value');
      console.log('✅ Firebase connection successful');
      
      // Check aquariums
      const aquariums = snapshot.val();
      if (aquariums) {
        console.log(`📊 Found ${Object.keys(aquariums).length} aquariums`);
        
        // Show first aquarium details
        const firstAquarium = Object.values(aquariums)[0];
        console.log('📋 Sample aquarium:');
        console.log(`  - Name: ${firstAquarium.name}`);
        console.log(`  - User ID: ${firstAquarium.userId}`);
        console.log(`  - User Email: ${firstAquarium.userEmail || 'Not set'}`);
      } else {
        console.log('ℹ️ No aquariums found in database');
      }
      
      // Check aquarium settings
      const settingsSnapshot = await database.ref('aquarium-settings').limitToFirst(1).once('value');
      const settings = settingsSnapshot.val();
      if (settings) {
        console.log(`📊 Found ${Object.keys(settings).length} aquarium settings`);
        
        // Show first settings details
        const firstSetting = Object.values(settings)[0];
        console.log('📋 Sample settings:');
        console.log(`  - User ID: ${firstSetting.userId}`);
        console.log(`  - User Email: ${firstSetting.userEmail || 'Not set'}`);
        console.log(`  - Offline Timeout: ${firstSetting.device_config?.offlineTimeoutMinutes || 'Not set'} minutes`);
      } else {
        console.log('ℹ️ No aquarium settings found');
      }
      
      console.log('\n✅ Firebase connection test completed successfully!');
      console.log('🚀 You can now run the full test: npm run test-notifications');
      
    } catch (error) {
      console.error('❌ Firebase connection failed:', error.message);
      
      if (error.message.includes('INVALID_CREDENTIAL')) {
        console.log('\n🔧 Credential issues:');
        console.log('1. Check that FIREBASE_PROJECT_ID is set correctly');
        console.log('2. Verify FIREBASE_PRIVATE_KEY is properly formatted with \\n');
        console.log('3. Ensure FIREBASE_CLIENT_EMAIL matches the service account');
        console.log('4. Download fresh credentials from Firebase Console');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        console.log('\n🔧 Permission issues:');
        console.log('1. Check Firebase Realtime Database rules');
        console.log('2. Ensure service account has proper permissions');
        console.log('3. Verify database URL is correct');
      }
    }
  }

  testConnection()
    .then(() => {
      console.log('\n🏁 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  console.log('\n🔧 Setup required:');
  console.log('1. Create .env file with Firebase credentials');
  console.log('2. Follow SETUP_TEST.md for detailed instructions');
  process.exit(1);
}
