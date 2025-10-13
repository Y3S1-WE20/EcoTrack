// Test motivation APIs
const axios = require('axios');

async function testMotivationAPIs() {
  const baseURL = 'http://localhost:4000/api/v1/motivation';
  
  console.log('🧪 Testing Motivation Hub APIs...\n');

  try {
    // Test 1: Get motivational quotes
    console.log('1. Testing AI Quotes API...');
    const quotesResponse = await axios.get(`${baseURL}/quotes`);
    console.log('✅ Quotes Response:', JSON.stringify(quotesResponse.data, null, 2));
    console.log('');

    // Test 2: Get community posts
    console.log('2. Testing Community Posts API...');
    const postsResponse = await axios.get(`${baseURL}/community/posts`);
    console.log('✅ Posts Response:');
    console.log('Posts count:', postsResponse.data.posts.length);
    console.log('First post:', postsResponse.data.posts[0]?.content.substring(0, 100) + '...');
    console.log('');

    // Test 3: Get featured articles
    console.log('3. Testing Articles API...');
    const articlesResponse = await axios.get(`${baseURL}/articles`);
    console.log('✅ Articles Response:');
    console.log('Articles count:', articlesResponse.data.articles.length);
    console.log('First article:', articlesResponse.data.articles[0]?.title);
    console.log('');

    // Test 4: Get challenges
    console.log('4. Testing Challenges API...');
    const challengesResponse = await axios.get(`${baseURL}/challenges`);
    console.log('✅ Challenges Response:');
    console.log('Challenges count:', challengesResponse.data.challenges.length);
    console.log('First challenge:', challengesResponse.data.challenges[0]?.title);
    console.log('');

    console.log('🎉 All motivation APIs are working!');

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

testMotivationAPIs();