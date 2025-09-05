const https = require('https');
const http = require('http');

// Replace with your actual Render service URL
const SERVICE_URL = process.env.SERVICE_URL || 'https://aquamon-monitoring-service.onrender.com';

console.log('🔍 Testing Full AquaMon Monitoring Service...');
console.log(`📍 Service URL: ${SERVICE_URL}`);
console.log('=' .repeat(60));

// Test function for full monitoring service
async function testFullService() {
  console.log('\n🧪 Testing Full Monitoring Service...');
  console.log('🔗 This will test the complete monitoring functionality');
  
  // Test the monitor endpoint (if available)
  const monitorUrl = `${SERVICE_URL}/monitor`;
  console.log(`🔗 URL: ${monitorUrl}`);
  
  return new Promise((resolve) => {
    const client = monitorUrl.startsWith('https') ? https : http;
    
    const req = client.get(monitorUrl, (res) => {
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
      console.log('💡 This might be expected if the full service is not running');
      resolve({ status: 'error', error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('⏰ Timeout after 10 seconds');
      req.destroy();
      resolve({ status: 'timeout' });
    });
  });
}

// Test Firebase connection
async function testFirebaseConnection() {
  console.log('\n🔥 Testing Firebase Connection...');
  
  try {
    // Run the local Firebase test
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const child = spawn('node', ['test-firebase-connection.js'], {
        cwd: __dirname,
        stdio: 'pipe'
      });
      
      let output = '';
      let error = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      child.on('close', (code) => {
        console.log('📊 Firebase Test Output:');
        console.log(output);
        if (error) {
          console.log('❌ Errors:', error);
        }
        resolve({ code, output, error });
      });
    });
  } catch (error) {
    console.log('❌ Error running Firebase test:', error.message);
    return { error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 Starting comprehensive service testing...\n');
  
  // Test basic service
  await testFullService();
  
  // Test Firebase connection locally
  await testFirebaseConnection();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Comprehensive testing complete!');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check if the service is responding to basic endpoints');
  console.log('2. Verify Firebase connection is working');
  console.log('3. If needed, switch to full monitoring service');
  console.log('4. Monitor your aquariums and ESP32 devices');
}

// Run the tests
main().catch(console.error);
