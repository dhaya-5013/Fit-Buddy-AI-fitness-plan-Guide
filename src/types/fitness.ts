/**
 * FitBuddy – AI Fitness Plan Generator
 * Type Definitions & Data Models
 * 
 * Clean, well-typed models for student and academic presentation.
 */

export type FitnessGoal =
  | 'Weight Loss'
  | 'Muscle Gain'
  | 'General Wellness'
  | 'Endurance & Stamina'
  | 'Strength & Power';

export type IntensityLevel = 'Low' | 'Medium' | 'High';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type EquipmentOption =
  | 'No equipment (Bodyweight)'
  | 'Dumbbells only'
  | 'Home gym (Bands & Dumbbells)'
  | 'Full commercial gym';

export type SessionDuration =
  | '20 minutes'
  | '30 minutes'
  | '45 minutes'
  | '60 minutes';

/**
 * User Profile record stored in localStorage
 */
export interface User {
  id: string; // Unique User ID (used for feedback lookup)
  name: string; // Full Name
  age: number; // Sensible range: 14 to 99
  weight: number; // In kilograms (kg)
  goal: FitnessGoal;
  intensity: IntensityLevel;
  experience_level: ExperienceLevel;
  equipment: string;
  session_time: string;
  created_at: string;
  updated_at: string;
}

/**
 * Workout Plan record stored in localStorage
 */
export interface WorkoutPlanRecord {
  user_id: string;
  original_plan: string; // Generated via Gemini Pro-tier model
  updated_plan: string | null; // Null if no feedback submitted yet, or updated via Gemini Pro
  nutrition_tip: string; // Generated via Gemini Flash-tier model
  created_at: string;
  updated_at: string;
}

/**
 * Form input state before submission
 */
export interface PlanFormData {
  fullName: string;
  userId: string;
  age: string | number;
  weight: string | number;
  goal: FitnessGoal;
  intensity: IntensityLevel;
  experienceLevel: ExperienceLevel;
  equipment: string;
  sessionTime: string;
}

/**
 * API request/response structures
 */
export interface GenerateWorkoutParams {
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  experience_level: string;
  equipment: string;
  session_time: string;
}

export interface UpdateWorkoutParams {
  originalPlan: string;
  userFeedback: string;
}

export interface GenerateNutritionParams {
  age: number;
  weight: number;
  goal: string;
  planSummary?: string;
}
