export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: HabitSubcategory[];
}

export interface HabitSubcategory {
  id: string;
  name: string;
  icon: string;
  co2PerUnit: number; // kg CO2 per unit
  unit: string;
  suggestions: string[];
  requiresQuantity: boolean;
  supportsPhoto: boolean;
  supportsVoice: boolean;
}

export const habitCategories: HabitCategory[] = [
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#2196F3',
    description: 'Track your travel and commuting habits',
    subcategories: [
      {
        id: 'car_drive',
        name: 'Car Drive',
        icon: '🚗',
        co2PerUnit: 0.21, // kg CO2 per km
        unit: 'km',
        suggestions: ['10 km commute', '5 km shopping', '20 km visit'],
        requiresQuantity: true,
        supportsPhoto: false,
        supportsVoice: true,
      },
      {
        id: 'public_transport',
        name: 'Public Transport',
        icon: '🚌',
        co2PerUnit: 0.05, // kg CO2 per km
        unit: 'km',
        suggestions: ['Bus to work', 'Train journey', 'Metro ride'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'walking',
        name: 'Walking',
        icon: '🚶',
        co2PerUnit: 0, // No emissions
        unit: 'km',
        suggestions: ['Walk to store', 'Morning walk', 'Evening stroll'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'cycling',
        name: 'Cycling',
        icon: '🚲',
        co2PerUnit: 0, // No emissions
        unit: 'km',
        suggestions: ['Bike to work', 'Weekend cycling', 'Grocery run'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'flight',
        name: 'Flight',
        icon: '✈️',
        co2PerUnit: 0.25, // kg CO2 per km (average)
        unit: 'km',
        suggestions: ['Domestic flight', 'International trip'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍽️',
    color: '#4CAF50',
    description: 'Monitor your dietary choices and food consumption',
    subcategories: [
      {
        id: 'meat_meal',
        name: 'Meat Meal',
        icon: '🥩',
        co2PerUnit: 3.3, // kg CO2 per meal
        unit: 'meal',
        suggestions: ['Beef lunch', 'Chicken dinner', 'Pork meal'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'vegetarian_meal',
        name: 'Vegetarian Meal',
        icon: '🥗',
        co2PerUnit: 0.9, // kg CO2 per meal
        unit: 'meal',
        suggestions: ['Salad lunch', 'Veggie dinner', 'Plant-based meal'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'local_food',
        name: 'Local/Organic Food',
        icon: '🌱',
        co2PerUnit: 0.5, // kg CO2 per meal
        unit: 'meal',
        suggestions: ['Farmers market', 'Local produce', 'Organic meal'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'takeout',
        name: 'Takeout/Delivery',
        icon: '🥡',
        co2PerUnit: 2.1, // kg CO2 per meal (includes packaging)
        unit: 'meal',
        suggestions: ['Pizza delivery', 'Fast food', 'Restaurant takeout'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    color: '#FF9800',
    description: 'Track your home and workplace energy usage',
    subcategories: [
      {
        id: 'electricity_usage',
        name: 'Electricity Usage',
        icon: '💡',
        co2PerUnit: 0.4, // kg CO2 per kWh
        unit: 'kWh',
        suggestions: ['Daily usage', 'AC usage', 'High consumption day'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'heating_cooling',
        name: 'Heating/Cooling',
        icon: '🌡️',
        co2PerUnit: 0.6, // kg CO2 per hour
        unit: 'hours',
        suggestions: ['AC 4 hours', 'Heating all day', 'Fan usage'],
        requiresQuantity: true,
        supportsPhoto: false,
        supportsVoice: true,
      },
      {
        id: 'energy_saving',
        name: 'Energy Saving Action',
        icon: '🔋',
        co2PerUnit: -0.5, // Negative = carbon saved
        unit: 'action',
        suggestions: ['LED bulb switch', 'Unplugged devices', 'Solar usage'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
    ],
  },
  {
    id: 'waste',
    name: 'Waste',
    icon: '🗑️',
    color: '#F44336',
    description: 'Log waste generation and recycling activities',
    subcategories: [
      {
        id: 'recycling',
        name: 'Recycling',
        icon: '♻️',
        co2PerUnit: -0.2, // Negative = carbon saved
        unit: 'kg',
        suggestions: ['Plastic bottles', 'Paper recycling', 'Glass containers'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'composting',
        name: 'Composting',
        icon: '🌱',
        co2PerUnit: -0.3, // Negative = carbon saved
        unit: 'kg',
        suggestions: ['Food scraps', 'Garden waste', 'Organic waste'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'waste_generation',
        name: 'General Waste',
        icon: '🗑️',
        co2PerUnit: 0.5, // kg CO2 per kg of waste
        unit: 'kg',
        suggestions: ['Household trash', 'Non-recyclable waste'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'plastic_use',
        name: 'Single-use Plastic',
        icon: '🥤',
        co2PerUnit: 0.1, // kg CO2 per item
        unit: 'items',
        suggestions: ['Plastic bottles', 'Disposable cups', 'Plastic bags'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
    ],
  },
  {
    id: 'consumption',
    name: 'Consumption',
    icon: '🛍️',
    color: '#9C27B0',
    description: 'Track purchases and consumption patterns',
    subcategories: [
      {
        id: 'new_clothing',
        name: 'New Clothing',
        icon: '👕',
        co2PerUnit: 8.0, // kg CO2 per item
        unit: 'items',
        suggestions: ['New shirt', 'Pair of jeans', 'Shoes'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'secondhand',
        name: 'Secondhand Purchase',
        icon: '🔄',
        co2PerUnit: 1.0, // Much lower CO2 per item
        unit: 'items',
        suggestions: ['Thrift store find', 'Used electronics', 'Vintage item'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'electronics',
        name: 'Electronics',
        icon: '📱',
        co2PerUnit: 50.0, // kg CO2 per device
        unit: 'items',
        suggestions: ['New phone', 'Laptop', 'Gadget'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
      {
        id: 'repair_reuse',
        name: 'Repair/Reuse',
        icon: '🔧',
        co2PerUnit: -2.0, // Negative = carbon saved
        unit: 'items',
        suggestions: ['Fixed appliance', 'Repaired clothing', 'Reused item'],
        requiresQuantity: true,
        supportsPhoto: true,
        supportsVoice: true,
      },
    ],
  },
];

export const getHabitCategoryById = (id: string): HabitCategory | undefined => {
  return habitCategories.find(category => category.id === id);
};

export const getHabitSubcategoryById = (categoryId: string, subcategoryId: string): HabitSubcategory | undefined => {
  const category = getHabitCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getAllSubcategories = (): Array<HabitSubcategory & { categoryId: string; categoryName: string }> => {
  const allSubs: Array<HabitSubcategory & { categoryId: string; categoryName: string }> = [];
  
  habitCategories.forEach(category => {
    category.subcategories.forEach(sub => {
      allSubs.push({
        ...sub,
        categoryId: category.id,
        categoryName: category.name,
      });
    });
  });
  
  return allSubs;
};

export const getQuickSuggestions = (limit: number = 5): Array<{ 
  categoryId: string; 
  subcategoryId: string; 
  suggestion: string;
  co2Impact: number;
}> => {
  const suggestions: Array<{ 
    categoryId: string; 
    subcategoryId: string; 
    suggestion: string;
    co2Impact: number;
  }> = [];

  habitCategories.forEach(category => {
    category.subcategories.forEach(sub => {
      sub.suggestions.forEach(suggestion => {
        suggestions.push({
          categoryId: category.id,
          subcategoryId: sub.id,
          suggestion,
          co2Impact: sub.co2PerUnit,
        });
      });
    });
  });

  // Shuffle and return limited suggestions
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, limit);
};