// Test Gemini-only chatbot
const http = require('http');

const testMessages = [
  "Hi! Who are you?",
  "What can you help me with?",
  "Tell me about climate change",
  "How are you today?"
];

async function testMessage(message) {
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
          console.log(`\n📱 Message: "${message}"`);
          console.log(`🤖 Response: ${parsed.message}`);
          console.log(`✅ AI Enhanced: ${parsed.aiEnhanced}`);
          console.log(`📊 Type: ${parsed.type}`);
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

async function runTests() {
  console.log('🚀 Testing Gemini-only Chatbot...\n');
  
  for (const message of testMessages) {
    try {
      await testMessage(message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    } catch (error) {
      console.error(`❌ Error testing "${message}":`, error.message);
    }
  }
  
  console.log('\n✅ All tests completed!');
}

runTests();