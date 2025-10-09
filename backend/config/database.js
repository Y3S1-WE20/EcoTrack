const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGODB_URI directly if it already includes database name
    // Otherwise append DATABASE_NAME
    let mongoURI = process.env.MONGODB_URI;
    if (!mongoURI.includes('/') || mongoURI.endsWith('/')) {
      mongoURI = mongoURI.endsWith('/') 
        ? `${mongoURI}${process.env.DATABASE_NAME}`
        : `${mongoURI}/${process.env.DATABASE_NAME}`;
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Ensure text indexes for search functionality
    const Activity = require('../models/Activity');
    const HabitLog = require('../models/HabitLog');
    
    await Activity.collection.createIndex({ name: 'text', description: 'text' });
    console.log('Text indexes created successfully');
  } catch (error) {
    console.log('Index creation skipped or failed:', error.message);
  }
};

const seedInitialData = async () => {
  try {
    const Category = require('../models/Category');
    const Activity = require('../models/Activity');
    
    // Check if categories already exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('Categories already exist, skipping seed');
      return;
    }

    // Create initial categories
    const categories = await Category.insertMany([
      {
        name: 'Transport',
        icon: '🚗',
        color: '#FF6B6B',
        description: 'Transportation and travel activities'
      },
      {
        name: 'Food',
        icon: '🍽️',
        color: '#4ECDC4',
        description: 'Food consumption and dietary choices'
      },
      {
        name: 'Energy',
        icon: '⚡',
        color: '#45B7D1',
        description: 'Energy consumption and utilities'
      },
      {
        name: 'Waste',
        icon: '🗑️',
        color: '#96CEB4',
        description: 'Waste production and recycling'
      },
      {
        name: 'Consumption',
        icon: '🛍️',
        color: '#FFEAA7',
        description: 'Shopping and consumption habits'
      }
    ]);

    console.log('Categories seeded successfully');

    // Get category IDs for activities
    const transportCat = categories.find(c => c.name === 'Transport')._id;
    const foodCat = categories.find(c => c.name === 'Food')._id;
    const energyCat = categories.find(c => c.name === 'Energy')._id;
    const wasteCat = categories.find(c => c.name === 'Waste')._id;
    const consumptionCat = categories.find(c => c.name === 'Consumption')._id;

    // Create initial activities
    await Activity.insertMany([
      // Transport activities
      {
        name: 'Car - Gasoline',
        category: transportCat,
        icon: '🚗',
        description: 'Driving a gasoline-powered car',
        co2PerUnit: 0.21,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 1
      },
      {
        name: 'Car - Electric',
        category: transportCat,
        icon: '🔋',
        description: 'Driving an electric car',
        co2PerUnit: 0.05,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 2
      },
      {
        name: 'Bus',
        category: transportCat,
        icon: '🚌',
        description: 'Public bus transportation',
        co2PerUnit: 0.08,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 3
      },
      {
        name: 'Train',
        category: transportCat,
        icon: '🚆',
        description: 'Train transportation',
        co2PerUnit: 0.04,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 4
      },
      {
        name: 'Flight - Domestic',
        category: transportCat,
        icon: '✈️',
        description: 'Domestic flight',
        co2PerUnit: 0.25,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 5
      },
      {
        name: 'Flight - International',
        category: transportCat,
        icon: '🌍',
        description: 'International flight',
        co2PerUnit: 0.3,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 6
      },
      // Energy activities
      {
        name: 'Electricity',
        category: energyCat,
        icon: '💡',
        description: 'Household electricity consumption',
        co2PerUnit: 0.4,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 1
      },
      {
        name: 'Natural Gas',
        category: energyCat,
        icon: '🔥',
        description: 'Natural gas heating',
        co2PerUnit: 2.0,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 2
      },
      // Food activities
      {
        name: 'Beef Meal',
        category: foodCat,
        icon: '🥩',
        description: 'Beef-based meal',
        co2PerUnit: 27,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 1
      },
      {
        name: 'Chicken Meal',
        category: foodCat,
        icon: '🍗',
        description: 'Chicken-based meal',
        co2PerUnit: 6.9,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 2
      },
      {
        name: 'Vegetarian Meal',
        category: foodCat,
        icon: '🥗',
        description: 'Plant-based meal',
        co2PerUnit: 1.9,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 3
      }
    ]);

    console.log('Activities seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = { connectDB, seedInitialData };