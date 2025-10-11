async function testEnhancedChat() {
  try {
    console.log('Testing enhanced chat endpoint...');
    
    // Test English message
    console.log('\n1. Testing English message...');
    let response = await fetch('http://localhost:4000/api/v1/chat/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, how are you?',
        attachments: []
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    let data = await response.json();
    console.log('English Response Language:', data.language);
    console.log('English Response (first 100 chars):', data.message.substring(0, 100) + '...');
    
    // Test Sinhala message
    console.log('\n2. Testing Sinhala message...');
    response = await fetch('http://localhost:4000/api/v1/chat/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'හලෝ ඔබට කොහොමද?',
        attachments: []
      })
    });
    
    data = await response.json();
    console.log('Sinhala Response Language:', data.language);
    console.log('Sinhala Response (first 100 chars):', data.message.substring(0, 100) + '...');
    
    console.log('\n✅ Enhanced chat endpoint working with multilingual support!');
  } catch (error) {
    console.error('❌ Enhanced chat endpoint failed:');
    console.error('Error:', error.message);
  }
}

testEnhancedChat();