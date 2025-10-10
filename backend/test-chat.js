const fetch = require('node-fetch');

async function testChatbot() {
  try {
    console.log('Testing chatbot endpoint...');
    
    const response = await fetch('http://localhost:4000/api/v1/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'I drove 10 km today'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testChatbot();