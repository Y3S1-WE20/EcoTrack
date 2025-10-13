const ecotrackAI = require('../services/ecotrackAI');
const CommunityPost = require('../models/CommunityPost');

// AI-generated motivational quotes
const getMotivationalQuotes = async (req, res) => {
  try {
    // Get AI-generated motivational quotes
    const quotes = await generateQuotes();
    
    res.json({
      success: true,
      quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch motivational quotes',
      error: error.message
    });
  }
};

const generateNewQuote = async (req, res) => {
  try {
    const aiResponse = await ecotrackAI.chat(
      "Generate a short, inspiring motivational quote about environmental consciousness, sustainability, or eco-friendly living. Make it uplifting and actionable. Return only the quote without additional text."
    );
    
    const quote = aiResponse.success ? aiResponse.message : "Every small eco-friendly action creates ripples of positive change! 🌱";
    
    res.json({
      success: true,
      quote,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quote',
      quote: "The Earth does not belong to us; we belong to the Earth. 🌍"
    });
  }
};

// Community forum functionality
const getCommunityPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    const totalPosts = await CommunityPost.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: skip + posts.length < totalPosts
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts',
      error: error.message
    });
  }
};

const createCommunityPost = async (req, res) => {
  try {
    const { content, achievement, impactData, author } = req.body;
    
    // Use provided author or fallback to demo user
    const postAuthor = author || 'Demo User';
    console.log('Creating post with author:', postAuthor);
    
    const newPost = new CommunityPost({
      author: postAuthor,
      content,
      achievement,
      impactData,
      createdAt: new Date()
    });

    await newPost.save();

    res.json({
      success: true,
      message: 'Post created successfully!',
      post: newPost
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

const likeCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Get user ID from request body
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const hasLiked = post.likes.includes(userId);
    
    if (hasLiked) {
      post.likes = post.likes.filter(like => like !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Content and author are required'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      author: author,
      content,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Featured articles with real links
const getFeaturedArticles = async (req, res) => {
  try {
    const articles = [
      {
        id: 1,
        title: "Climate Change: How Individual Actions Matter",
        author: "NASA Climate Change",
        readTime: "8 min read",
        description: "Understanding the science behind individual climate action and its collective impact on global warming.",
        url: "https://climate.nasa.gov/evidence/",
        category: "Climate Science",
        icon: "🌡️",
        publishedAt: "2024-01-15T00:00:00Z"
      },
      {
        id: 2,
        title: "Sustainable Living: A Beginner's Guide",
        author: "EPA Environmental Protection",
        readTime: "6 min read",
        description: "Practical steps everyone can take to reduce their environmental footprint in daily life.",
        url: "https://www.epa.gov/sustainability",
        category: "Lifestyle",
        icon: "🌱",
        publishedAt: "2024-01-10T00:00:00Z"
      },
      {
        id: 3,
        title: "Renewable Energy: The Future is Now",
        author: "International Energy Agency",
        readTime: "10 min read",
        description: "Latest developments in renewable energy technology and how they're changing our world.",
        url: "https://www.iea.org/topics/renewables",
        category: "Energy",
        icon: "⚡",
        publishedAt: "2024-01-08T00:00:00Z"
      },
      {
        id: 4,
        title: "Ocean Conservation: Protecting Marine Life",
        author: "National Ocean Service",
        readTime: "7 min read",
        description: "How plastic pollution affects marine ecosystems and what you can do to help.",
        url: "https://oceanservice.noaa.gov/ocean/",
        category: "Conservation",
        icon: "🌊",
        publishedAt: "2024-01-05T00:00:00Z"
      },
      {
        id: 5,
        title: "Carbon Footprint: Measurement and Reduction",
        author: "Carbon Trust",
        readTime: "9 min read",
        description: "Learn how to accurately measure and effectively reduce your carbon footprint.",
        url: "https://www.carbontrust.com/our-work/guides-reports-and-tools/carbon-footprinting",
        category: "Carbon Management",
        icon: "📊",
        publishedAt: "2024-01-01T00:00:00Z"
      }
    ];

    res.json({
      success: true,
      articles
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
};

// Personalized challenges
const getPersonalizedChallenges = async (req, res) => {
  try {
    const challenges = [
      {
        id: 1,
        title: "Zero Waste Week",
        description: "Reduce your household waste to near zero for 7 days",
        difficulty: "Medium",
        duration: "7 days",
        impact: "Save 15kg waste from landfill",
        icon: "♻️",
        participants: 1247,
        progress: 0,
        category: "Waste Reduction"
      },
      {
        id: 2,
        title: "Public Transport Champion",
        description: "Use public transport or walk for all trips under 5km",
        difficulty: "Easy",
        duration: "14 days",
        impact: "Reduce 25kg CO₂ emissions",
        icon: "🚌",
        participants: 892,
        progress: 0,
        category: "Transportation"
      },
      {
        id: 3,
        title: "Plant-Based Power",
        description: "Try plant-based meals for lunch and dinner",
        difficulty: "Medium",
        duration: "10 days",
        impact: "Save 30kg CO₂ equivalent",
        icon: "🌱",
        participants: 2156,
        progress: 0,
        category: "Diet"
      },
      {
        id: 4,
        title: "Energy Saver Pro",
        description: "Reduce home energy consumption by 20%",
        difficulty: "Hard",
        duration: "30 days",
        impact: "Save 80kg CO₂ emissions",
        icon: "💡",
        participants: 543,
        progress: 0,
        category: "Energy"
      }
    ];

    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = 'demo-user'; // In production, get from auth middleware

    // Here you would typically save the user's participation in the challenge
    // For now, we'll just return a success response

    res.json({
      success: true,
      message: 'Successfully joined the challenge!',
      challengeId: id,
      joinedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join challenge',
      error: error.message
    });
  }
};

// Helper function to generate quotes
async function generateQuotes() {
  const fallbackQuotes = [
    "Every small step towards sustainability creates waves of positive change! 🌱",
    "The best time to plant a tree was 20 years ago. The second best time is now. 🌳",
    "Be the change you wish to see in the world - start with your carbon footprint! 🌍",
    "Sustainability is not about perfection, it's about making better choices every day. ♻️",
    "Your eco-friendly actions today are gifts to future generations. 🎁"
  ];

  try {
    const quotes = [];
    
    // Try to generate AI quotes
    for (let i = 0; i < 3; i++) {
      try {
        const aiResponse = await ecotrackAI.chat(
          `Generate a unique, inspiring motivational quote about environmental action, sustainability, or eco-living. Make it encouraging and actionable. Keep it under 100 characters. Return only the quote.`
        );
        
        if (aiResponse.success && aiResponse.message) {
          quotes.push({
            id: i + 1,
            text: aiResponse.message,
            author: "EcoTrack AI",
            category: "AI Generated",
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log('AI quote generation failed, using fallback');
      }
    }
    
    // Add fallback quotes if AI failed
    if (quotes.length === 0) {
      fallbackQuotes.forEach((quote, index) => {
        quotes.push({
          id: index + 1,
          text: quote,
          author: "EcoTrack Community",
          category: "Inspiration",
          createdAt: new Date().toISOString()
        });
      });
    }
    
    return quotes.slice(0, 5); // Return maximum 5 quotes
  } catch (error) {
    console.error('Error generating quotes:', error);
    return fallbackQuotes.map((quote, index) => ({
      id: index + 1,
      text: quote,
      author: "EcoTrack Community",
      category: "Inspiration",
      createdAt: new Date().toISOString()
    }));
  }
}

module.exports = {
  getMotivationalQuotes,
  generateNewQuote,
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  addComment,
  getFeaturedArticles,
  getPersonalizedChallenges,
  joinChallenge
};