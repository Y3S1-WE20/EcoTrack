// Test the new EcoTrack AI Assistant
const http = require('http');

async function testEcoTrackAI() {
  console.log('🧪 Testing EcoTrack AI Assistant...\n');

  // Test 1: Check AI status
  console.log('1️⃣ Checking AI Status...');
  try {
    const statusResponse = await makeRequest('GET', '/api/v1/chat/status');
    console.log('✅ Status Response:', JSON.stringify(statusResponse, null, 2));
  } catch (error) {
    console.log('❌ Status Error:', error.message);
  }

  // Test 2: Simple greeting
  console.log('\n2️⃣ Testing Simple Greeting...');
  try {
    const greetingResponse = await makeRequest('POST', '/api/v1/chat/message', {
      message: 'Hello! How are you?'
    });
    console.log('✅ Greeting Response:', JSON.stringify(greetingResponse, null, 2));
  } catch (error) {
    console.log('❌ Greeting Error:', error.message);
  }

  // Test 3: Environmental question
  console.log('\n3️⃣ Testing Environmental Question...');
  try {
    const envResponse = await makeRequest('POST', '/api/v1/chat/message', {
      message: 'How can I reduce my carbon footprint?'
    });
    console.log('✅ Environmental Response:', JSON.stringify(envResponse, null, 2));
  } catch (error) {
    console.log('❌ Environmental Error:', error.message);
  }

  console.log('\n🎉 Testing Complete!');
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': data.length })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Invalid JSON: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Run the test
testEcoTrackAI();