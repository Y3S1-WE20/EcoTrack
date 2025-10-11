/**
 * Enhanced EcoTrack AI Chat Controller with Multilingual Support
 */

const ecotrackAI = require('../services/ecotrackAI');

// Language detection patterns
const SINHALA_PATTERNS = [
  /[\u0D80-\u0DFF]/,  // Sinhala Unicode block
  /(?:මම|ඔබ|කරන්න|කොහොමද|ගැන|වගේ|තියෙන්නේ|එක|දෙක|තුන|හතර|පහ)/,  // Common Sinhala words
  /(?:කියන්න|එන්න|යන්න|ඇවිත්|ගියා|කළා|කරනවා|තියෙනවා)/,  // Sinhala verbs
];

const ENGLISH_PATTERNS = [
  /^[a-zA-Z\s\d\.,!?;:'"()-]*$/,  // Only English characters, numbers, and punctuation
];

/**
 * Detect the language of input text
 */
const detectLanguage = (text) => {
  const cleanText = text.trim();
  
  // Check for Sinhala
  for (const pattern of SINHALA_PATTERNS) {
    if (pattern.test(cleanText)) {
      return 'si'; // Sinhala
    }
  }
  
  // Check for English (fallback)
  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(cleanText)) {
      return 'en'; // English
    }
  }
  
  return 'auto'; // Mixed or unknown
};

/**
 * Get system prompt based on language
 */
const getSystemPrompt = (language) => {
  if (language === 'si') {
    return `ඔබ EcoTrack නම් පරිසර හිතකාමී AI සහායකයෙකි. ඔබගේ කාර්යය:

1. සිංහල භාෂාවෙන් පිළිතුරු දීම
2. කාබන් අඩුකිරීම් ගණනය කිරීම
3. පරිසර හිතකාමී ජීවන විලාසය ගැන උපදෙස් දීම
4. දෛනික ක්‍රියාකාරකම් ට්‍රැක් කිරීම

ගමන්: 'මම කිලෝමීටර් 10 ක් වාහනයෙන් ගියා' = 2.3 kg CO₂
පොදු ප්‍රවාහනය: 'මම බස් එකේ ගියා' = CO₂ අඩුවීම
පයින් ගමන්: 'මම කිලෝමීටර් 5 ක් ඇවිද්දා' = CO₂ අඩුවීම

සෑම පිළිතුරකම සිංහලෙන් ලියන්න. සරල හා මිත්‍රශීලී වන්න.`;
  }
  
  return `You are EcoTrack, a friendly environmental AI assistant. You help users:

1. Track daily activities and calculate carbon impact
2. Provide eco-friendly living advice  
3. Answer environmental questions
4. Support sustainable lifestyle choices

For driving: "I drove 10 km" = calculate ~2.3 kg CO₂
For public transport: "I took the bus" = CO₂ savings
For walking/cycling: "I walked 5 km" = CO₂ savings  

Always be encouraging and provide actionable eco-tips!`;
};

/**
 * Process multimedia attachments
 */
const processAttachments = async (attachments) => {
  if (!attachments || attachments.length === 0) {
    return '';
  }

  const attachmentDescriptions = [];

  for (const attachment of attachments) {
    switch (attachment.type) {
      case 'image':
        attachmentDescriptions.push(`[User shared an image: ${attachment.name || 'image'}]`);
        break;
      case 'document':
        attachmentDescriptions.push(`[User shared a document: ${attachment.name || 'document'}]`);
        break;
      case 'voice':
        attachmentDescriptions.push(`[User sent a voice message]`);
        break;
    }
  }

  return attachmentDescriptions.join(' ');
};

/**
 * Enhanced chat message processing with multilingual support
 */
const processEnhancedMessage = async (req, res) => {
  try {
    const { message, attachments, language } = req.body;

    // Validate input
    if ((!message || message.trim().length === 0) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or attachment',
        error: 'INVALID_INPUT'
      });
    }

    console.log('\n📨 Enhanced chat message received:');
    console.log('Message:', message);
    console.log('Attachments:', attachments?.length || 0);
    console.log('Language hint:', language);

    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(message || '');
    console.log('🌐 Detected language:', detectedLanguage);

    // Check AI status
    const aiStatus = ecotrackAI.getStatus();
    console.log('🔍 AI Status:', aiStatus);

    if (!ecotrackAI.isReady()) {
      console.log('⚠️ AI not ready, returning error');
      
      const errorMessage = detectedLanguage === 'si' 
        ? 'EcoTrack AI සහායකයා දැනට ක්‍රියා නොකරයි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.'
        : 'EcoTrack AI Assistant is currently offline. Please try again in a moment.';
      
      return res.status(503).json({
        success: false,
        message: errorMessage,
        error: 'AI_OFFLINE',
        language: detectedLanguage,
        debug: aiStatus
      });
    }

    // Process attachments
    const attachmentContext = await processAttachments(attachments);
    
    // Combine message with attachment context
    const fullMessage = [message, attachmentContext].filter(Boolean).join(' ');
    
    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(detectedLanguage);

    // Get AI response with language context
    console.log('🚀 Sending enhanced message to AI...');
    console.log('System prompt language:', detectedLanguage);
    
    const aiResponse = await ecotrackAI.chatWithContext(fullMessage.trim(), {
      systemPrompt,
      language: detectedLanguage,
      hasAttachments: (attachments && attachments.length > 0)
    });
    
    // Add language metadata to response
    const enhancedResponse = {
      ...aiResponse,
      language: detectedLanguage,
      originalMessage: message,
      processedAttachments: attachments?.length || 0
    };
    
    console.log('📤 Sending enhanced response to client');
    console.log('Response language:', detectedLanguage);
    
    // Return response
    res.json(enhancedResponse);

  } catch (error) {
    console.error('\n❌ Enhanced Chat Controller Error:', error);
    
    const detectedLanguage = detectLanguage(req.body.message || '');
    const errorMessage = detectedLanguage === 'si'
      ? 'කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
      : 'Sorry, something went wrong. Please try again.';
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      language: detectedLanguage,
      error: 'INTERNAL_ERROR',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Original simple chat handler for backward compatibility
 */
const processMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message',
        error: 'INVALID_INPUT'
      });
    }

    console.log('\n📨 Simple chat message received:', message);

    // Detect language for simple messages too
    const detectedLanguage = detectLanguage(message);
    
    // Check AI status
    const aiStatus = ecotrackAI.getStatus();
    console.log('🔍 AI Status:', aiStatus);

    if (!ecotrackAI.isReady()) {
      console.log('⚠️ AI not ready, returning error');
      
      const errorMessage = detectedLanguage === 'si' 
        ? 'EcoTrack AI සහායකයා දැනට ක්‍රියා නොකරයි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.'
        : 'EcoTrack AI Assistant is currently offline. Please try again in a moment.';
      
      return res.status(503).json({
        success: false,
        message: errorMessage,
        error: 'AI_OFFLINE',
        language: detectedLanguage,
        debug: aiStatus
      });
    }

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(detectedLanguage);

    // Get AI response
    console.log('🚀 Sending message to AI with language context...');
    const aiResponse = await ecotrackAI.chatWithContext(message.trim(), {
      systemPrompt,
      language: detectedLanguage
    });
    
    // Add language metadata
    const enhancedResponse = {
      ...aiResponse,
      language: detectedLanguage
    };
    
    console.log('📤 Sending response to client with language:', detectedLanguage);
    
    // Return response
    res.json(enhancedResponse);

  } catch (error) {
    console.error('\n❌ Simple Chat Controller Error:', error);
    
    const detectedLanguage = detectLanguage(req.body.message || '');
    const errorMessage = detectedLanguage === 'si'
      ? 'කණගාටුයි, දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
      : 'Sorry, something went wrong. Please try again.';
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      language: detectedLanguage,
      error: 'INTERNAL_ERROR',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  processMessage,
  processEnhancedMessage,
  detectLanguage
};