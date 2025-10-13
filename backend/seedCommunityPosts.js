// Seed script to create sample community posts for testing
require('dotenv').config();
const mongoose = require('mongoose');
const CommunityPost = require('./models/CommunityPost');

async function seedCommunityPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing posts
    await CommunityPost.deleteMany({});
    console.log('Cleared existing community posts');

    // Sample posts data
    const samplePosts = [
      {
        author: 'Sarah Green',
        content: 'Just completed my first week of the plastic-free challenge! It was harder than expected but I discovered so many eco-friendly alternatives. My favorite find was bamboo toothbrushes and reusable food wraps. Anyone else trying this challenge?',
        achievement: 'Plastic-Free Week Champion',
        impactData: {
          co2Saved: 2.5,
          wasteReduced: 1.2,
          unit: 'kg'
        },
        category: 'achievement',
        location: {
          city: 'San Francisco',
          country: 'USA'
        },
        likes: ['user1', 'user2', 'user3'],
        comments: [
          {
            author: 'Mike Earth',
            content: 'Amazing work Sarah! I\'m on day 3 of the same challenge. Any tips for avoiding plastic packaging at the grocery store?',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            author: 'Luna Eco',
            content: 'Bamboo toothbrushes are game changers! Also try beeswax wraps for food storage 🐝',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
          }
        ],
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        author: 'Alex Cyclist',
        content: 'Bike commute update: Month 2 complete! 🚴‍♂️ Rain or shine, I\'ve been cycling to work every day. Not only am I feeling more energetic, but I\'ve saved so much money on gas. Plus the mental health benefits are incredible - starting each day with fresh air and exercise!',
        achievement: '30-Day Bike Commute Challenge',
        impactData: {
          co2Saved: 45.8,
          unit: 'kg'
        },
        category: 'achievement',
        location: {
          city: 'Portland',
          country: 'USA'
        },
        likes: ['user1', 'user4', 'user5', 'user6'],
        comments: [
          {
            author: 'Emma Wheels',
            content: 'Inspiring! I\'ve been thinking about bike commuting but worried about the weather. What gear do you recommend for rainy days?',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        author: 'Maya Solar',
        content: 'Question for the community: We\'re considering installing solar panels on our roof. Has anyone here made the switch? I\'d love to hear about your experience - costs, energy savings, installation process, etc. Any recommendations for solar companies?',
        category: 'question',
        location: {
          city: 'Austin',
          country: 'USA'
        },
        likes: ['user2', 'user7'],
        comments: [
          {
            author: 'Tom Sunshine',
            content: 'We installed solar 2 years ago! Best decision ever. Cut our electricity bill by 80%. Happy to share details if you want to DM me!',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
          },
          {
            author: 'Green Home Pro',
            content: 'Check if your state has solar incentives! Many offer tax credits that make it much more affordable.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        author: 'David Gardener',
        content: 'Started my first vegetable garden this spring! 🌱 Growing tomatoes, lettuce, herbs, and peppers. It\'s amazing how much I\'ve learned about sustainable farming practices. Nothing beats the taste of homegrown veggies, and I love knowing exactly where my food comes from.',
        achievement: 'First-Time Gardener',
        impactData: {
          co2Saved: 8.2,
          unit: 'kg'
        },
        category: 'tip',
        location: {
          city: 'Denver',
          country: 'USA'
        },
        likes: ['user3', 'user8', 'user9'],
        comments: [
          {
            author: 'Rose Garden',
            content: 'Love this! Any tips for pest control without chemicals? My tomatoes are getting attacked by aphids 😭',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        author: 'Lisa Minimalist',
        content: 'Minimalism tip: Before buying anything new, I now wait 30 days and ask myself three questions: 1) Do I really need this? 2) Can I borrow/rent it instead? 3) Is there a more sustainable option? This simple practice has reduced my consumption by 70% and saved me so much money!',
        category: 'tip',
        location: {
          city: 'Seattle',
          country: 'USA'
        },
        likes: ['user4', 'user10', 'user11', 'user12'],
        comments: [
          {
            author: 'Mindful Consumer',
            content: 'This is such a great practice! I\'m going to try the 30-day rule. How do you track items you\'re waiting on?',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
          },
          {
            author: 'Sam Simple',
            content: 'I do something similar but with a "one in, two out" rule for clothes. Has really helped declutter my closet!',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
      },
      {
        author: 'Jordan Activist',
        content: 'Just attended my first local environmental town hall meeting! 🏛️ It was incredible to see so many community members passionate about climate action. We discussed local recycling improvements, bike lane expansions, and renewable energy initiatives. Democracy in action!',
        category: 'general',
        location: {
          city: 'Boston',
          country: 'USA'
        },
        likes: ['user5', 'user13'],
        comments: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];

    // Insert sample posts
    await CommunityPost.insertMany(samplePosts);
    console.log(`✅ Successfully seeded ${samplePosts.length} community posts`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding community posts:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCommunityPosts();