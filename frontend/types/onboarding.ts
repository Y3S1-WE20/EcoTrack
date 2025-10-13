// Onboarding Quiz Types

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options: QuizOption[];
  category: 'transport' | 'energy' | 'food' | 'consumption' | 'lifestyle';
}

export interface QuizOption {
  id: string;
  text: string;
  co2Impact: number; // kg CO2 per week
  icon?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface QuizResult {
  answers: QuizAnswer[];
  co2Baseline: number; // kg CO2 per week
  completedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  quizResult?: QuizResult;
  co2Baseline: number;
  currentChallenge?: WeeklyChallenge;
  completedChallenges: string[];
  badges: Badge[];
  totalCo2Saved: number;
  streakDays: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'consumption';
  targetReduction: number; // kg CO2
  progress: number; // percentage 0-100
  startDate: Date;
  endDate: Date;
  completed: boolean;
  badge?: string; // badge id to award on completion
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'reduction' | 'challenge' | 'milestone';
  criteria: number; // threshold to earn
  earnedAt?: Date;
}

// Challenge templates for rule-based generation
export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'consumption';
  targetReduction: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[]; // quiz answers that unlock this challenge
  badge?: string;
}