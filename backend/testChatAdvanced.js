const fetch = require('node-fetch');

async function testChatbot() {
  try {
    console.log('🤖 Testing EcoTrack AI Assistant...\n');
    
    // Test 1: Greeting
    console.log('Test 1: Greeting');
    const greetingResponse = await fetch('http://localhost:4000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hi! Who are you?'
      }),
    });

    const greetingResult = await greetingResponse.json();
    console.log('Response:', greetingResult);
    console.log('---\n');

    // Test 2: General conversation
    console.log('Test 2: General conversation');
    const conversationResponse = await fetch('http://localhost:4000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What can you help me with?'
      }),
    });

    const conversationResult = await conversationResponse.json();
    console.log('Response:', conversationResult);
    console.log('---\n');

    // Test 3: Activity tracking
    console.log('Test 3: Activity tracking');
    const activityResponse = await fetch('http://localhost:4000/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'I walked 5 miles today'
      }),
    });

    const activityResult = await activityResponse.json();
    console.log('Response:', activityResult);
    console.log('---\n');

    console.log('✅ All chatbot tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing chatbot:', error.message);
  }
}

testChatbot();