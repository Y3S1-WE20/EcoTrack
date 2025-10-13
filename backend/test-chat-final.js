// Test the chatbot API directly
const axios = require('axios');

async function testChat() {
  try {
    console.log('🧪 Testing EcoTrack AI chatbot...');
    
    const response = await axios.post('http://localhost:4000/api/v1/simple-chat/message', {
      message: 'Hello! Who are you?'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Chat API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error Response:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('❌ No response received:', error.message);
    } else {
      console.log('❌ Request error:', error.message);
    }
  }
}

testChat();