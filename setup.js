#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🚀 AquaMon Monitoring Service Setup');
  console.log('=====================================\n');

  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('📋 Please provide the following information:\n');

  // Firebase Configuration
  console.log('🔥 Firebase Configuration:');
  const firebaseProjectId = await question('Firebase Project ID: ');
  const firebasePrivateKeyId = await question('Firebase Private Key ID: ');
  const firebasePrivateKey = await question('Firebase Private Key (with \\n for newlines): ');
  const firebaseClientEmail = await question('Firebase Client Email: ');
  const firebaseClientId = await question('Firebase Client ID: ');
  const firebaseDatabaseUrl = await question('Firebase Database URL: ');

  console.log('\n📧 Email Configuration:');
  const emailService = await question('Email Service (gmail/sendgrid/mailgun) [gmail]: ') || 'gmail';
  const emailUser = await question('Email User: ');
  const emailPass = await question('Email Password/App Password: ');
  const adminEmail = await question('Admin Email (where notifications will be sent): ');

  console.log('\n⚙️  Server Configuration:');
  const port = await question('Port [3000]: ') || '3000';
  const nodeEnv = await question('Node Environment (development/production) [production]: ') || 'production';

  // Create .env content
  const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=${firebaseProjectId}
FIREBASE_PRIVATE_KEY_ID=${firebasePrivateKeyId}
FIREBASE_PRIVATE_KEY="${firebasePrivateKey}"
FIREBASE_CLIENT_EMAIL=${firebaseClientEmail}
FIREBASE_CLIENT_ID=${firebaseClientId}
FIREBASE_DATABASE_URL=${firebaseDatabaseUrl}

# Email Configuration
EMAIL_SERVICE=${emailService}
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
ADMIN_EMAIL=${adminEmail}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    rl.close();
    return;
  }

  // Test configuration
  console.log('\n🧪 Testing configuration...');
  
  try {
    require('dotenv').config();
    
    // Test Firebase connection
    const admin = require('firebase-admin');
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
    await database.ref('aquariums').limitToFirst(1).once('value');
    console.log('✅ Firebase connection successful');

    // Test email configuration
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Email configuration successful');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📖 Next steps:');
    console.log('1. Run "npm start" to start the monitoring service');
    console.log('2. Visit http://localhost:' + port + '/health to check service status');
    console.log('3. Visit http://localhost:' + port + '/status for detailed information');
    console.log('4. Send a test notification: POST http://localhost:' + port + '/test-notification');

  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again.');
  }

  rl.close();
}

setup().catch(console.error);
