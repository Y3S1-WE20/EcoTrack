const http = require('http');

const data = JSON.stringify({ message: "Hi! Who are you?" });

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

console.log('Testing: "Hi! Who are you?"');

const req = http.request(options, (res) => {
  let response = '';
  
  res.on('data', (chunk) => {
    response += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(response);
      console.log('\n✅ SUCCESS!');
      console.log('Chatbot Response:', parsed.message);
      console.log('Type:', parsed.type || 'activity');
      console.log('AI Enhanced:', parsed.aiEnhanced || false);
    } catch (err) {
      console.log('❌ Parse Error:', err.message);
      console.log('Raw Response:', response);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request Error:', e.message);
});

req.write(data);
req.end();