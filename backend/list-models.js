// List available Gemini models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('🔍 Fetching available models...');
    
    // Use the REST API directly to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('📋 Available models:');
    if (data.models) {
      data.models.forEach(model => {
        console.log(`  ✅ ${model.name} - ${model.displayName || 'No display name'}`);
        if (model.supportedGenerationMethods) {
          console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('No models found in response:', data);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();