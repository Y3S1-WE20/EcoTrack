const http = require('http');

async function testMessage(message, testName) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ message });

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

    const req = http.request(options, (res) => {
      let response = '';
      
      res.on('data', (chunk) => {
        response += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(response);
          console.log(`\n=== ${testName} ===`);
          console.log(`Message: "${message}"`);
          console.log(`Status: ${res.statusCode}`);
          console.log(`Response: ${parsed.message}`);
          console.log(`Type: ${parsed.type || 'activity'}`);
          console.log(`AI Enhanced: ${parsed.aiEnhanced || false}`);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testChatbot() {
  try {
    console.log('🤖 Testing EcoTrack AI Chatbot...\n');
    
    // Test greetings and conversation
    await testMessage('Hi!', 'Greeting Test');
    await testMessage('Who are you?', 'Identity Test');
    await testMessage('What can you do?', 'Capability Test');
    
    // Test activity parsing (should still work as fallback)
    await testMessage('I drove 10 km today', 'Activity Test');
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testChatbot();