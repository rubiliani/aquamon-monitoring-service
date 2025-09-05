require('dotenv').config();

console.log('🔍 Testing Environment Variables...');
console.log('=' .repeat(50));

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_DATABASE_URL',
  'ADMIN_EMAIL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

let allSet = true;

console.log('📋 Environment Variables Status:');
console.log('');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const displayValue = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'Not set';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    allSet = false;
  }
});

console.log('');
console.log('=' .repeat(50));

if (allSet) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 The monitoring service should work correctly.');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('📝 Please check the fix-render-env.md file for instructions.');
}

console.log('');
console.log('🔗 Firebase Database URL should be:');
console.log('https://aquamon-7a6bf-default-rtdb.europe-west1.firebasedatabase.app');
