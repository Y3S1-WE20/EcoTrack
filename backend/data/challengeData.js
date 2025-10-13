// Challenge templates and badges for backend use
const CHALLENGE_TEMPLATES = [
  {
    id: 'bike-week',
    title: 'Bike to Work Week',
    description: 'Use a bicycle for commuting at least 3 days this week',
    category: 'transport',
    targetReduction: 7.6,
    difficulty: 'easy',
    prerequisites: ['car-alone', 'car-carpool'],
    badge: 'cyclist'
  },
  {
    id: 'public-transport',
    title: 'Public Transport Champion',
    description: 'Take public transportation instead of driving for 5 trips',
    category: 'transport',
    targetReduction: 12.0,
    difficulty: 'medium',
    prerequisites: ['car-alone'],
    badge: 'commuter'
  },
  {
    id: 'meatless-week',
    title: 'Plant-Based Week',
    description: 'Try a vegetarian diet for 7 days',
    category: 'food',
    targetReduction: 5.2,
    difficulty: 'medium',
    prerequisites: ['omnivore-moderate', 'omnivore-heavy'],
    badge: 'plant-pioneer'
  },
  {
    id: 'local-food',
    title: 'Local Food Explorer',
    description: 'Buy only local/seasonal produce for one week',
    category: 'food',
    targetReduction: 2.1,
    difficulty: 'easy',
    badge: 'local-hero'
  },
  {
    id: 'energy-saver',
    title: 'Energy Conservation Master',
    description: 'Reduce home energy usage by 20% this week',
    category: 'energy',
    targetReduction: 3.4,
    difficulty: 'medium',
    badge: 'energy-saver'
  },
  {
    id: 'no-buy-week',
    title: 'Mindful Consumption Week',
    description: 'Avoid non-essential purchases for 7 days',
    category: 'consumption',
    targetReduction: 4.2,
    difficulty: 'hard',
    badge: 'minimalist'
  }
];

const INITIAL_BADGES = [
  {
    id: 'welcome',
    name: 'Welcome to EcoTrack',
    description: 'Completed your carbon footprint assessment',
    icon: '🌱',
    category: 'milestone',
    criteria: 1
  },
  {
    id: 'first-week',
    name: 'First Week Complete',
    description: 'Used EcoTrack for 7 consecutive days',
    icon: '📅',
    category: 'streak',
    criteria: 7
  },
  {
    id: 'cyclist',
    name: 'Eco Cyclist',
    description: 'Completed the Bike to Work challenge',
    icon: '🚴',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'commuter',
    name: 'Green Commuter',
    description: 'Mastered public transportation',
    icon: '🚌',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'plant-pioneer',
    name: 'Plant Pioneer',
    description: 'Completed a plant-based week',
    icon: '🌿',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'local-hero',
    name: 'Local Food Hero',
    description: 'Supported local food systems',
    icon: '🌽',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'energy-saver',
    name: 'Energy Saver',
    description: 'Reduced home energy consumption',
    icon: '⚡',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'minimalist',
    name: 'Mindful Consumer',
    description: 'Practiced conscious consumption',
    icon: '♻️',
    category: 'challenge',
    criteria: 1
  },
  {
    id: 'carbon-reducer',
    name: 'Carbon Reducer',
    description: 'Saved 50kg of CO2 emissions',
    icon: '🌍',
    category: 'reduction',
    criteria: 50
  },
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Saved 200kg of CO2 emissions',
    icon: '🛡️',
    category: 'reduction',
    criteria: 200
  }
];

module.exports = {
  CHALLENGE_TEMPLATES,
  INITIAL_BADGES
};