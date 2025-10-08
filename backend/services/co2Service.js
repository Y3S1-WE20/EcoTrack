/**
 * CO2 Calculation Service
 * Calculates carbon emissions and savings based on activities
 * Uses EPA and scientific emission factors
 */

class CO2Service {
  constructor() {
    // CO2 emission factors (kg CO2 per unit)
    this.emissionFactors = {
      transportation: {
        // Per km
        driving: 0.21,        // Average car emissions kg CO2/km
        bus: 0.089,          // Public bus kg CO2/km per passenger
        train: 0.041,        // Electric train kg CO2/km per passenger
        walking: 0,          // Zero emissions
        cycling: 0,          // Zero emissions
        flying: 0.255,       // Domestic flight kg CO2/km
        motorcycle: 0.113,   // kg CO2/km
        carpool: 0.105,      // Shared car (half of driving)
        electric_car: 0.053, // Electric vehicle kg CO2/km (grid average)
        hybrid_car: 0.109    // Hybrid vehicle kg CO2/km
      },
      
      energy: {
        // Per kWh or per liter
        electricity: 0.42,   // kg CO2/kWh (grid average)
        natural_gas: 2.0,    // kg CO2/L (natural gas)
        heating_oil: 2.5,    // kg CO2/L
        propane: 1.5,        // kg CO2/L
        solar: 0,            // Zero emissions
        wind: 0,             // Zero emissions
        renewable: 0         // Zero emissions
      },
      
      food: {
        // Per kg
        beef: 27.0,          // kg CO2/kg beef
        lamb: 24.5,          // kg CO2/kg lamb
        pork: 7.6,           // kg CO2/kg pork
        chicken: 4.3,        // kg CO2/kg chicken
        fish: 3.0,           // kg CO2/kg fish (average)
        dairy: 2.5,          // kg CO2/kg dairy products
        cheese: 8.5,         // kg CO2/kg cheese
        eggs: 1.9,           // kg CO2/kg eggs
        vegetables: 0.4,     // kg CO2/kg vegetables
        fruits: 0.3,         // kg CO2/kg fruits
        grains: 0.5,         // kg CO2/kg grains
        plant_protein: 0.8   // kg CO2/kg plant-based protein
      },
      
      waste: {
        // Per kg
        general_waste: 0.5,  // kg CO2/kg general waste
        food_waste: 0.8,     // kg CO2/kg food waste
        recycling: -0.2,     // Negative emissions (savings)
        composting: -0.1     // Small savings from composting
      }
    };

    // Alternative low-carbon options for suggestions
    this.alternatives = {
      driving: ['walking', 'cycling', 'bus', 'train', 'carpool', 'electric_car'],
      flying: ['train', 'bus', 'carpool'],
      beef: ['chicken', 'fish', 'plant_protein', 'vegetables'],
      electricity: ['solar', 'wind', 'renewable'],
      general_waste: ['recycling', 'composting']
    };

    // Activity categories for environmental impact
    this.impactCategories = {
      low: ['walking', 'cycling', 'train', 'vegetables', 'fruits', 'solar', 'wind'],
      medium: ['bus', 'chicken', 'fish', 'electric_car', 'hybrid_car'],
      high: ['driving', 'motorcycle', 'pork', 'dairy'],
      very_high: ['flying', 'beef', 'lamb', 'heating_oil']
    };
  }

  /**
   * Calculate CO2 emissions for an activity
   * @param {string} activityType - Type of activity (transportation, energy, food, waste)
   * @param {string} activity - Specific activity name
   * @param {number} amount - Amount/quantity
   * @param {string} unit - Unit of measurement
   * @returns {Object} CO2 calculation results
   */
  calculateEmissions(activityType, activity, amount, unit) {
    try {
      // Get emission factor
      const emissionFactor = this.getEmissionFactor(activityType, activity);
      
      if (emissionFactor === null) {
        throw new Error(`Unknown activity: ${activityType}/${activity}`);
      }

      // Calculate total emissions
      const totalEmissions = amount * emissionFactor;
      
      // Determine if it's savings or emissions
      const isSavings = emissionFactor < 0;
      const absoluteEmissions = Math.abs(totalEmissions);

      // Get impact category
      const impactCategory = this.getImpactCategory(activity);
      
      // Generate comparison data
      const comparison = this.generateComparison(absoluteEmissions, activityType);
      
      return {
        activity,
        activityType,
        amount,
        unit,
        emissionFactor,
        totalEmissions: totalEmissions,
        absoluteEmissions: absoluteEmissions,
        isSavings,
        impactCategory,
        comparison,
        formattedEmission: this.formatEmissionText(activity, amount, unit, absoluteEmissions, isSavings)
      };

    } catch (error) {
      console.error('CO2 calculation error:', error);
      return {
        error: error.message,
        activity,
        activityType,
        amount,
        unit
      };
    }
  }

  /**
   * Get emission factor for specific activity
   */
  getEmissionFactor(activityType, activity) {
    const categoryFactors = this.emissionFactors[activityType];
    if (!categoryFactors) {
      return null;
    }
    
    return categoryFactors[activity] !== undefined ? categoryFactors[activity] : null;
  }

  /**
   * Get impact category for activity
   */
  getImpactCategory(activity) {
    for (const [category, activities] of Object.entries(this.impactCategories)) {
      if (activities.includes(activity)) {
        return category;
      }
    }
    return 'medium'; // default
  }

  /**
   * Generate emission comparison text
   */
  generateComparison(emissions, activityType) {
    const comparisons = [];

    // Car driving equivalent
    if (activityType !== 'transportation' || emissions > 1) {
      const carKm = emissions / this.emissionFactors.transportation.driving;
      if (carKm >= 1) {
        comparisons.push(`${carKm.toFixed(1)} km of car driving`);
      }
    }

    // Tree absorption equivalent
    const treeDays = emissions / (22 / 365); // Average tree absorbs 22kg CO2/year
    if (treeDays >= 1) {
      comparisons.push(`${treeDays.toFixed(0)} days of tree CO2 absorption`);
    }

    // Smartphone charging equivalent
    const phoneCharges = emissions / (0.005); // ~5g CO2 per smartphone charge
    if (phoneCharges >= 1 && phoneCharges <= 1000) {
      comparisons.push(`${phoneCharges.toFixed(0)} smartphone charges`);
    }

    return comparisons.slice(0, 2); // Return max 2 comparisons
  }

  /**
   * Format emission text for display
   */
  formatEmissionText(activity, amount, unit, emissions, isSavings) {
    const icon = this.getActivityIcon(activity);
    const emissionText = isSavings ? 'saved' : 'emitted';
    const color = isSavings ? '🌱' : '💨';
    
    return `${icon} ${this.capitalizeFirst(activity)} ${amount}${unit} = ${emissions.toFixed(1)} kg CO₂ ${emissionText} ${color}`;
  }

  /**
   * Get appropriate icon for activity
   */
  getActivityIcon(activity) {
    const icons = {
      driving: '🚗',
      bus: '🚌',
      train: '🚆',
      walking: '🚶',
      cycling: '🚴',
      flying: '✈️',
      motorcycle: '🏍️',
      electric_car: '🔋',
      electricity: '⚡',
      natural_gas: '🔥',
      solar: '☀️',
      wind: '💨',
      beef: '🥩',
      chicken: '🐔',
      fish: '🐟',
      vegetables: '🥬',
      fruits: '🍎',
      recycling: '♻️',
      composting: '🌱'
    };
    
    return icons[activity] || '📊';
  }

  /**
   * Generate personalized suggestions based on activity
   */
  generateSuggestion(activityType, activity, amount, emissions, userProfile = null) {
    const suggestions = [];
    
    // Get alternatives
    const alternatives = this.alternatives[activity] || [];
    
    if (alternatives.length > 0) {
      // Calculate potential savings with alternatives
      const bestAlternative = alternatives[0];
      const alternativeEmissions = this.calculateEmissions(activityType, bestAlternative, amount, 'km');
      
      if (!alternativeEmissions.error && alternativeEmissions.totalEmissions < emissions.totalEmissions) {
        const savings = emissions.totalEmissions - alternativeEmissions.totalEmissions;
        suggestions.push(
          `💡 Try ${bestAlternative} instead! You could save ${savings.toFixed(1)} kg CO₂`
        );
      }
    }

    // Impact-specific suggestions
    switch (emissions.impactCategory) {
      case 'very_high':
        suggestions.push('🌍 Consider if this activity is necessary or if there are greener alternatives');
        break;
      case 'high':
        suggestions.push('🌿 Look for ways to reduce frequency or find more sustainable options');
        break;
      case 'medium':
        suggestions.push('👍 Good choice! Small optimizations can make it even better');
        break;
      case 'low':
        suggestions.push('🌟 Excellent eco-friendly choice! Keep it up!');
        break;
    }

    // Activity-specific tips
    const activityTips = this.getActivitySpecificTips(activity, amount);
    if (activityTips) {
      suggestions.push(activityTips);
    }

    return suggestions.slice(0, 2).join(' '); // Return combined suggestions
  }

  /**
   * Get activity-specific tips
   */
  getActivitySpecificTips(activity, amount) {
    const tips = {
      driving: amount > 10 ? 'For longer distances, consider carpooling or public transport' : 'Perfect for short trips - consider walking/cycling for under 2km',
      flying: 'Consider carbon offsetting for flights, or video calls for business meetings',
      beef: 'Try having one meat-free day per week to reduce your carbon footprint',
      electricity: 'Switch to LED bulbs and unplug devices when not in use',
      bus: 'Great choice for sustainable transport!',
      walking: 'Zero emissions and great for your health!',
      cycling: 'Perfect eco-friendly transport choice!'
    };
    
    return tips[activity];
  }

  /**
   * Calculate weekly/monthly summaries
   */
  calculatePeriodSummary(activities, period = 'week') {
    const summary = {
      totalEmissions: 0,
      totalSavings: 0,
      activityBreakdown: {},
      topEmitters: [],
      achievements: []
    };

    activities.forEach(activity => {
      const result = this.calculateEmissions(
        activity.activityType, 
        activity.activity, 
        activity.amount, 
        activity.unit
      );
      
      if (!result.error) {
        if (result.isSavings) {
          summary.totalSavings += result.absoluteEmissions;
        } else {
          summary.totalEmissions += result.absoluteEmissions;
        }
        
        // Track by activity type
        if (!summary.activityBreakdown[activity.activityType]) {
          summary.activityBreakdown[activity.activityType] = 0;
        }
        summary.activityBreakdown[activity.activityType] += result.absoluteEmissions;
      }
    });

    // Calculate achievements
    summary.achievements = this.calculateAchievements(activities, summary);
    
    return summary;
  }

  /**
   * Calculate achievements and badges
   */
  calculateAchievements(activities, summary) {
    const achievements = [];
    
    // Check for green transport usage
    const greenTransport = activities.filter(a => 
      ['walking', 'cycling', 'bus', 'train'].includes(a.activity)
    );
    
    if (greenTransport.length >= 5) {
      achievements.push({
        name: 'Green Commuter',
        description: 'Used eco-friendly transport 5+ times',
        icon: '🌱'
      });
    }

    // Check for low emissions week
    if (summary.totalEmissions < 10) {
      achievements.push({
        name: 'Low Carbon Week',
        description: 'Kept weekly emissions under 10kg CO₂',
        icon: '🌍'
      });
    }

    return achievements;
  }

  /**
   * Utility method to capitalize first letter
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
  }
}

module.exports = new CO2Service();