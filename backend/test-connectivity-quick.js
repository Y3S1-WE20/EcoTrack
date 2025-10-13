// Quick test to verify backend connectivity
const http = require('http');

const testUrls = [
  'http://localhost:4000',
  'http://192.168.1.10:4000',
  'http://192.168.56.1:4000'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`⏱️  ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testConnectivity() {
  console.log('🔍 Testing backend connectivity...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
  }
  
  console.log('\n🔧 If mobile still can\'t connect:');
  console.log('1. Make sure ADB reverse is set: adb reverse tcp:4000 tcp:4000');
  console.log('2. Check if phone and computer are on same WiFi');
  console.log('3. Try restarting Expo app');
}

testConnectivity();