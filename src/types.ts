export interface FoodItemBreakdown {
  name: string;
  calories: number;
  weight: number;
}

export interface FoodAnalysis {
  isFood: boolean;
  foodName: string;
  calories: number;
  portionWeight: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence: number;
  tips: string[];
  ingredients: string[];
  items?: FoodItemBreakdown[];
}

export interface ScanResponse {
  success: boolean;
  data?: FoodAnalysis;
  error?: string;
}

export interface ScanHistoryEntry {
  id: string;
  timestamp: string;
  analysis: FoodAnalysis;
  imageUrl: string;
}
