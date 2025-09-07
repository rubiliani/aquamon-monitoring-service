const https = require('https');
const http = require('http');

// Replace with your actual Render service URL
const SERVICE_URL = process.env.SERVICE_URL || 'https://aquamon-monitoring-service.onrender.com';

console.log('🔍 Monitoring AquaMon Service...');
console.log(`📍 Service URL: ${SERVICE_URL}`);
console.log('=' .repeat(50));

// Test function
async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const url = `${SERVICE_URL}${path}`;
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`🔗 URL: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log('📊 Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('📄 Response:', data);
        }
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve({ status: 'error', error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Timeout after 10 seconds');
      req.destroy();
      resolve({ status: 'timeout' });
    });
  });
}

// Main monitoring function
async function monitorService() {
  console.log('🚀 Starting service monitoring...\n');
  
  // Test basic endpoints
  await testEndpoint('/', 'Root endpoint');
  await testEndpoint('/health', 'Health check');
  await testEndpoint('/stats', 'Service statistics');
  await testEndpoint('/test', 'Test endpoint');
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Monitoring complete!');
  
  // If we have Firebase credentials, test the full monitoring service
  if (process.env.FIREBASE_PROJECT_ID) {
    console.log('\n🔧 Testing full monitoring service...');
    console.log('Run: npm run monitor');
  } else {
    console.log('\n💡 To test the full monitoring service with Firebase:');
    console.log('1. Set up environment variables');
    console.log('2. Run: npm run monitor');
  }
}

// Run monitoring
monitorService().catch(console.error);

