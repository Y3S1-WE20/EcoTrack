// Simple test to check motivation API health
const fetch = require('node-fetch');

async function testMotivationHealth() {
  const testUrls = [
    'http://localhost:4000/api/v1/motivation/health',
    'http://192.168.1.10:4000/api/v1/motivation/health'
  ];

  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { timeout: 5000 });
      const data = await response.json();
      console.log(`✅ Success: ${url}`, data);
      return;
    } catch (error) {
      console.log(`❌ Failed: ${url}`, error.message);
    }
  }
  
  console.log('❌ All motivation API health checks failed');
}

testMotivationHealth();