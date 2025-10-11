// Test POST request to chat endpoint
const http = require('http');

function testChatAPI() {
  const data = JSON.stringify({
    message: "Hello! How are you?"
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/chat/message',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🤖 Testing chat API...\n');
  console.log('POST /api/v1/chat/message');
  console.log('Body:', data);

  const req = http.request(options, (res) => {
    console.log(`\n📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('\n🤖 Response:');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('\n✅ Chat API is working correctly!');
        } else {
          console.log('\n❌ Chat API returned error:', parsed.message);
        }
      } catch (err) {
        console.log('Raw response:', responseData);
        console.log('❌ Failed to parse JSON:', err.message);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Request error:', err.message);
  });

  req.write(data);
  req.end();
}

testChatAPI();