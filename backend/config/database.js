const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}`;
    
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
      },
      {
        name: 'Other',
        icon: '📝',
        color: '#DDA0DD',
        description: 'Custom manual activities'
      }
    ]);

    console.log('Categories seeded successfully');

    // Get category IDs for activities
    const transportCat = categories.find(c => c.name === 'Transport')._id;
    const foodCat = categories.find(c => c.name === 'Food')._id;
    const energyCat = categories.find(c => c.name === 'Energy')._id;
    const wasteCat = categories.find(c => c.name === 'Waste')._id;
    const consumptionCat = categories.find(c => c.name === 'Consumption')._id;
    const otherCat = categories.find(c => c.name === 'Other')._id;

    // Create initial activities
    await Activity.insertMany([
      // Transport activities
      {
        name: 'Walking',
        category: transportCat,
        icon: '🚶',
        description: 'Walking or hiking',
        co2PerUnit: 0,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 1
      },
      {
        name: 'Cycling',
        category: transportCat,
        icon: '🚴',
        description: 'Bicycle transportation',
        co2PerUnit: 0,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 2
      },
      {
        name: 'E-Scooter',
        category: transportCat,
        icon: '🛴',
        description: 'Electric scooter',
        co2PerUnit: 0.03,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 3
      },
      {
        name: 'Motorcycle',
        category: transportCat,
        icon: '🏍️',
        description: 'Motorcycle transportation',
        co2PerUnit: 0.12,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 4
      },
      {
        name: 'Car - Gasoline',
        category: transportCat,
        icon: '🚗',
        description: 'Driving a gasoline-powered car',
        co2PerUnit: 0.21,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 5
      },
      {
        name: 'Car - Hybrid',
        category: transportCat,
        icon: '🚙',
        description: 'Driving a hybrid car',
        co2PerUnit: 0.12,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 6
      },
      {
        name: 'Car - Electric',
        category: transportCat,
        icon: '🔋',
        description: 'Driving an electric car',
        co2PerUnit: 0.05,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 7
      },
      {
        name: 'Bus',
        category: transportCat,
        icon: '🚌',
        description: 'Public bus transportation',
        co2PerUnit: 0.08,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 8
      },
      {
        name: 'Metro/Subway',
        category: transportCat,
        icon: '🚇',
        description: 'Underground train system',
        co2PerUnit: 0.03,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 9
      },
      {
        name: 'Train',
        category: transportCat,
        icon: '🚆',
        description: 'Train transportation',
        co2PerUnit: 0.04,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 10
      },
      {
        name: 'Taxi/Uber',
        category: transportCat,
        icon: '🚕',
        description: 'Taxi or ride-sharing service',
        co2PerUnit: 0.25,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 11
      },
      {
        name: 'Flight - Domestic',
        category: transportCat,
        icon: '✈️',
        description: 'Domestic flight',
        co2PerUnit: 0.25,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 12
      },
      {
        name: 'Flight - International',
        category: transportCat,
        icon: '🌍',
        description: 'International flight',
        co2PerUnit: 0.3,
        unit: 'km',
        unitLabel: 'kilometers',
        priority: 13
      },

      // Food activities
      {
        name: 'Vegan Meal',
        category: foodCat,
        icon: '🌱',
        description: 'Plant-based vegan meal',
        co2PerUnit: 1.2,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 1
      },
      {
        name: 'Vegetarian Meal',
        category: foodCat,
        icon: '🥗',
        description: 'Vegetarian meal with dairy',
        co2PerUnit: 1.9,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 2
      },
      {
        name: 'Plant-Based Protein',
        category: foodCat,
        icon: '🫘',
        description: 'Legumes, beans, nuts protein meal',
        co2PerUnit: 1.5,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 3
      },
      {
        name: 'Fish Meal',
        category: foodCat,
        icon: '�',
        description: 'Fish-based meal',
        co2PerUnit: 5.4,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 4
      },
      {
        name: 'Chicken Meal',
        category: foodCat,
        icon: '🍗',
        description: 'Chicken-based meal',
        co2PerUnit: 6.9,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 5
      },
      {
        name: 'Pork Meal',
        category: foodCat,
        icon: '🥓',
        description: 'Pork-based meal',
        co2PerUnit: 12.1,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 6
      },
      {
        name: 'Lamb Meal',
        category: foodCat,
        icon: '🐑',
        description: 'Lamb-based meal',
        co2PerUnit: 39.2,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 7
      },
      {
        name: 'Beef Meal',
        category: foodCat,
        icon: '🥩',
        description: 'Beef-based meal',
        co2PerUnit: 27,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 8
      },
      {
        name: 'Local Organic Food',
        category: foodCat,
        icon: '🌾',
        description: 'Locally sourced organic food',
        co2PerUnit: 0.8,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 9
      },
      {
        name: 'Processed Food',
        category: foodCat,
        icon: '🍕',
        description: 'Highly processed packaged food',
        co2PerUnit: 4.2,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 10
      },
      {
        name: 'Fast Food',
        category: foodCat,
        icon: '🍔',
        description: 'Fast food restaurant meal',
        co2PerUnit: 8.5,
        unit: 'piece',
        unitLabel: 'meals',
        priority: 11
      },

      // Energy activities
      {
        name: 'Electricity - Renewable',
        category: energyCat,
        icon: '🌞',
        description: 'Solar/wind renewable electricity',
        co2PerUnit: 0.1,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 1
      },
      {
        name: 'Electricity - Grid',
        category: energyCat,
        icon: '💡',
        description: 'Standard grid electricity',
        co2PerUnit: 0.4,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 2
      },
      {
        name: 'Natural Gas Heating',
        category: energyCat,
        icon: '🔥',
        description: 'Natural gas for heating',
        co2PerUnit: 2.0,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 3
      },
      {
        name: 'Oil Heating',
        category: energyCat,
        icon: '🛢️',
        description: 'Oil-based heating system',
        co2PerUnit: 2.5,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 4
      },
      {
        name: 'Coal Energy',
        category: energyCat,
        icon: '⚫',
        description: 'Coal-powered electricity',
        co2PerUnit: 0.85,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 5
      },
      {
        name: 'Air Conditioning',
        category: energyCat,
        icon: '❄️',
        description: 'Air conditioning usage',
        co2PerUnit: 0.6,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 6
      },
      {
        name: 'Water Heating',
        category: energyCat,
        icon: '🚿',
        description: 'Hot water usage',
        co2PerUnit: 0.3,
        unit: 'kWh',
        unitLabel: 'kilowatt hours',
        priority: 7
      },

      // Waste activities
      {
        name: 'Recycling',
        category: wasteCat,
        icon: '♻️',
        description: 'Recycling materials',
        co2PerUnit: -0.5,
        unit: 'kg',
        unitLabel: 'kilograms',
        priority: 1
      },
      {
        name: 'Composting',
        category: wasteCat,
        icon: '🌿',
        description: 'Organic waste composting',
        co2PerUnit: -0.3,
        unit: 'kg',
        unitLabel: 'kilograms',
        priority: 2
      },
      {
        name: 'General Waste',
        category: wasteCat,
        icon: '🗑️',
        description: 'General household waste',
        co2PerUnit: 0.5,
        unit: 'kg',
        unitLabel: 'kilograms',
        priority: 3
      },
      {
        name: 'Food Waste',
        category: wasteCat,
        icon: '🍎',
        description: 'Wasted food items',
        co2PerUnit: 2.1,
        unit: 'kg',
        unitLabel: 'kilograms',
        priority: 4
      },
      {
        name: 'Electronic Waste',
        category: wasteCat,
        icon: '📱',
        description: 'Electronic device disposal',
        co2PerUnit: 150,
        unit: 'piece',
        unitLabel: 'items',
        priority: 5
      },

      // Consumption activities
      {
        name: 'Second-hand Purchase',
        category: consumptionCat,
        icon: '🔄',
        description: 'Buying used/second-hand items',
        co2PerUnit: 5,
        unit: 'piece',
        unitLabel: 'items',
        priority: 1
      },
      {
        name: 'Local Product',
        category: consumptionCat,
        icon: '🏪',
        description: 'Locally made products',
        co2PerUnit: 8,
        unit: 'piece',
        unitLabel: 'items',
        priority: 2
      },
      {
        name: 'Clothing',
        category: consumptionCat,
        icon: '👕',
        description: 'New clothing purchase',
        co2PerUnit: 25,
        unit: 'piece',
        unitLabel: 'items',
        priority: 3
      },
      {
        name: 'Electronics',
        category: consumptionCat,
        icon: '📱',
        description: 'Electronic device purchase',
        co2PerUnit: 350,
        unit: 'piece',
        unitLabel: 'items',
        priority: 4
      },
      {
        name: 'Furniture',
        category: consumptionCat,
        icon: '�',
        description: 'Furniture purchase',
        co2PerUnit: 180,
        unit: 'piece',
        unitLabel: 'items',
        priority: 5
      },
      {
        name: 'Online Shopping',
        category: consumptionCat,
        icon: '📦',
        description: 'Online purchase with shipping',
        co2PerUnit: 15,
        unit: 'piece',
        unitLabel: 'packages',
        priority: 6
      },
      {
        name: 'Fast Fashion',
        category: consumptionCat,
        icon: '👗',
        description: 'Fast fashion clothing',
        co2PerUnit: 35,
        unit: 'piece',
        unitLabel: 'items',
        priority: 7
      },

      // Other - Manual activities
      {
        name: 'Custom Activity',
        category: otherCat,
        icon: '📝',
        description: 'Manually entered custom activity',
        co2PerUnit: 0,
        unit: 'custom',
        unitLabel: 'units',
        priority: 1
      }
    ]);

    console.log('Activities seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = { connectDB, seedInitialData };