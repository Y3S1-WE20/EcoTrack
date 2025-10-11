// Simple test script for chatbot API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testChatbot() {
  const API_URL = 'http://localhost:4000/api/v1';
  
  try {
    console.log('Testing chatbot API...\n');

    // Test 1: Simple driving activity
    console.log('Test 1: "I drove 10 km to work today"');
    const response1 = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I drove 10 km to work today' })
    });
    
    const result1 = await response1.json();
    console.log('Response:', JSON.stringify(result1, null, 2));
    console.log('\n---\n');

    // Test 2: Walking activity
    console.log('Test 2: "I walked 3 km this morning"');
    const response2 = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I walked 3 km this morning' })
    });
    
    const result2 = await response2.json();
    console.log('Response:', JSON.stringify(result2, null, 2));
    console.log('\n---\n');

    // Test 3: Unclear message
    console.log('Test 3: "hello there"');
    const response3 = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello there' })
    });
    
    const result3 = await response3.json();
    console.log('Response:', JSON.stringify(result3, null, 2));
    
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChatbot();