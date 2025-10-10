const axios = require('axios');

async function testChatbot() {
  try {
    console.log('Testing chatbot with greeting...');
    
    const response = await axios.post('http://localhost:4000/api/v1/chat', {
      message: 'Hi! Who are you?'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Chatbot responded to greeting:');
    console.log(response.data);
    
    console.log('\n\nTesting chatbot with activity...');
    
    const activityResponse = await axios.post('http://localhost:4000/api/v1/chat', {
      message: 'I walked 5 miles today'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Chatbot responded to activity:');
    console.log(activityResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing chatbot:', error.response?.data || error.message);
  }
}

testChatbot();