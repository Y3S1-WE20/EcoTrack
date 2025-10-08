import { QuizQuestion, ChallengeTemplate, Badge } from '../types/onboarding';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'transport-primary',
    question: 'What is your primary mode of transportation for daily commuting?',
    type: 'single',
    category: 'transport',
    options: [
      { id: 'car-alone', text: 'Car (driving alone)', co2Impact: 15.2, icon: '🚗' },
      { id: 'car-carpool', text: 'Car (carpooling)', co2Impact: 7.6, icon: '🚙' },
      { id: 'public-transport', text: 'Public transportation', co2Impact: 3.2, icon: '🚌' },
      { id: 'bike', text: 'Bicycle', co2Impact: 0.1, icon: '🚴' },
      { id: 'walk', text: 'Walking', co2Impact: 0, icon: '🚶' },
      { id: 'work-from-home', text: 'Work from home', co2Impact: 0, icon: '🏠' }
    ]
  },
  {
    id: 'transport-distance',
    question: 'How far do you typically commute daily (round trip)?',
    type: 'single',
    category: 'transport',
    options: [
      { id: 'distance-0', text: 'Work from home', co2Impact: 0 },
      { id: 'distance-5', text: 'Less than 5 km', co2Impact: 1 },
      { id: 'distance-15', text: '5-15 km', co2Impact: 1.5 },
      { id: 'distance-30', text: '15-30 km', co2Impact: 2 },
      { id: 'distance-50', text: '30-50 km', co2Impact: 2.5 },
      { id: 'distance-more', text: 'More than 50 km', co2Impact: 3 }
    ]
  },
  {
    id: 'energy-home',
    question: 'What type of energy does your home primarily use?',
    type: 'single',
    category: 'energy',
    options: [
      { id: 'renewable', text: 'Renewable energy (solar, wind)', co2Impact: 2.1, icon: '🌱' },
      { id: 'mixed-green', text: 'Mixed with some renewable', co2Impact: 8.4, icon: '🔋' },
      { id: 'natural-gas', text: 'Natural gas', co2Impact: 12.6, icon: '🔥' },
      { id: 'electricity-grid', text: 'Standard electricity grid', co2Impact: 16.8, icon: '⚡' },
      { id: 'not-sure', text: 'Not sure', co2Impact: 12.6, icon: '❓' }
    ]
  },
  {
    id: 'energy-habits',
    question: 'Which energy-saving habits do you currently practice?',
    type: 'multiple',
    category: 'energy',
    options: [
      { id: 'led-bulbs', text: 'Use LED light bulbs', co2Impact: -0.5, icon: '💡' },
      { id: 'unplug-devices', text: 'Unplug devices when not in use', co2Impact: -0.8, icon: '🔌' },
      { id: 'efficient-appliances', text: 'Use energy-efficient appliances', co2Impact: -1.2, icon: '📱' },
      { id: 'programmable-thermostat', text: 'Have programmable thermostat', co2Impact: -2.1, icon: '🌡️' },
      { id: 'none', text: 'None of the above', co2Impact: 0, icon: '❌' }
    ]
  },
  {
    id: 'food-diet',
    question: 'Which best describes your diet?',
    type: 'single',
    category: 'food',
    options: [
      { id: 'vegan', text: 'Vegan', co2Impact: 4.2, icon: '🌱' },
      { id: 'vegetarian', text: 'Vegetarian', co2Impact: 6.3, icon: '🥗' },
      { id: 'flexitarian', text: 'Flexitarian (occasional meat)', co2Impact: 9.8, icon: '🥙' },
      { id: 'omnivore-moderate', text: 'Omnivore (moderate meat)', co2Impact: 14.7, icon: '🍽️' },
      { id: 'omnivore-heavy', text: 'Omnivore (meat daily)', co2Impact: 21.0, icon: '🥩' }
    ]
  },
  {
    id: 'food-local',
    question: 'How often do you buy local/seasonal produce?',
    type: 'single',
    category: 'food',
    options: [
      { id: 'always', text: 'Almost always', co2Impact: -1.4, icon: '🌽' },
      { id: 'often', text: 'Often', co2Impact: -0.7, icon: '🍅' },
      { id: 'sometimes', text: 'Sometimes', co2Impact: 0, icon: '🛒' },
      { id: 'rarely', text: 'Rarely', co2Impact: 0.7, icon: '📦' },
      { id: 'never', text: 'Never', co2Impact: 1.4, icon: '✈️' }
    ]
  },
  {
    id: 'consumption-shopping',
    question: 'How would you describe your shopping habits?',
    type: 'single',
    category: 'consumption',
    options: [
      { id: 'minimal', text: 'Buy only what I need', co2Impact: 2.8, icon: '♻️' },
      { id: 'conscious', text: 'Conscious consumer, research purchases', co2Impact: 4.9, icon: '🔍' },
      { id: 'average', text: 'Average shopper', co2Impact: 8.4, icon: '🛍️' },
      { id: 'frequent', text: 'I enjoy shopping regularly', co2Impact: 12.6, icon: '💳' },
      { id: 'impulse', text: 'Frequent impulse buyer', co2Impact: 16.8, icon: '🛒' }
    ]
  },
  {
    id: 'lifestyle-motivation',
    question: 'What motivates you most to reduce your carbon footprint?',
    type: 'single',
    category: 'lifestyle',
    options: [
      { id: 'environment', text: 'Environmental protection', co2Impact: 0, icon: '🌍' },
      { id: 'future-generations', text: 'Future generations', co2Impact: 0, icon: '👶' },
      { id: 'cost-savings', text: 'Cost savings', co2Impact: 0, icon: '💰' },
      { id: 'health', text: 'Personal health benefits', co2Impact: 0, icon: '💪' },
      { id: 'social', text: 'Social responsibility', co2Impact: 0, icon: '🤝' }
    ]
  }
];

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
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

export const INITIAL_BADGES: Badge[] = [
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

// CO2 calculation helper
export function calculateCO2Baseline(answers: { questionId: string; selectedOptions: string[] }[]): number {
  let totalWeeklyCO2 = 0;
  
  const answerMap = new Map(
    answers.map(answer => [answer.questionId, answer.selectedOptions])
  );
  
  QUIZ_QUESTIONS.forEach(question => {
    const selectedOptions = answerMap.get(question.id) || [];
    
    if (question.type === 'single' && selectedOptions.length > 0) {
      const option = question.options.find(opt => opt.id === selectedOptions[0]);
      if (option) {
        totalWeeklyCO2 += option.co2Impact;
        
        // Apply multiplier for transport distance
        if (question.id === 'transport-distance') {
          const primaryTransport = answerMap.get('transport-primary')?.[0];
          if (primaryTransport && ['car-alone', 'car-carpool'].includes(primaryTransport)) {
            totalWeeklyCO2 *= option.co2Impact;
          }
        }
      }
    } else if (question.type === 'multiple') {
      selectedOptions.forEach(optionId => {
        const option = question.options.find(opt => opt.id === optionId);
        if (option) {
          totalWeeklyCO2 += option.co2Impact;
        }
      });
    }
  });
  
  return Math.max(0, totalWeeklyCO2); // Ensure non-negative
}

// Challenge selection helper
export function selectWeeklyChallenge(
  answers: { questionId: string; selectedOptions: string[] }[],
  completedChallenges: string[]
): ChallengeTemplate | null {
  const answerOptions = answers.flatMap(answer => answer.selectedOptions);
  
  // Filter available challenges based on prerequisites and completion status
  const availableChallenges = CHALLENGE_TEMPLATES.filter(template => {
    // Skip if already completed
    if (completedChallenges.includes(template.id)) {
      return false;
    }
    
    // Check prerequisites
    if (template.prerequisites) {
      return template.prerequisites.some(prereq => answerOptions.includes(prereq));
    }
    
    return true;
  });
  
  // Sort by difficulty (easy first) and return the first available
  availableChallenges.sort((a, b) => {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });
  
  return availableChallenges[0] || null;
}