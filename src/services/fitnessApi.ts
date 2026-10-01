/**
 * FitBuddy – Fitness AI Client Service
 * 
 * Contains the core AI generation and update functions:
 * - generateWorkout() -> invokes Gemini Pro-tier model
 * - generateNutritionTip() -> invokes Gemini Flash-tier model
 * - updateWorkoutPlan() -> invokes Gemini Pro-tier model for feedback-based revisions
 */

import {
  GenerateNutritionParams,
  GenerateWorkoutParams,
} from '../types/fitness';

export interface GenerateWorkoutResponse {
  workoutPlan: string;
  modelUsed: string;
}

export interface UpdateWorkoutResponse {
  updatedPlan: string;
  modelUsed: string;
}

export interface GenerateNutritionResponse {
  nutritionTip: string;
  modelUsed: string;
}

/**
 * Scenario 1: Generate personalized 7-day workout plan using Gemini Pro-tier model.
 * 
 * Prompt template strictly follows:
 * "You are a professional fitness trainer. Create a personalized, structured 7-day workout plan
 * for a person aged {age}, weighing {weight} kg, with the goal of {goal}, preferring {intensity} intensity,
 * {experience_level} experience level, having access to {equipment}, with about {session_time} per session..."
 */
export async function generateWorkout(params: GenerateWorkoutParams): Promise<string> {
  try {
    const res = await fetch('/api/workout/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server error while generating your workout plan.');
    }

    if (!data.workoutPlan) {
      throw new Error('No workout plan was generated. Please try again.');
    }

    return data.workoutPlan;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error communicating with FitBuddy AI.';
    console.error('generateWorkout error:', message);
    throw new Error(message);
  }
}

/**
 * Scenario 2: Refines and updates an existing workout plan based on user feedback.
 * Uses Gemini Pro-tier model.
 * 
 * Preserves the original plan structure while tailoring the specific days/exercises
 * requested by the user's feedback.
 */
export async function updateWorkoutPlan(originalPlan: string, userFeedback: string): Promise<string> {
  try {
    const res = await fetch('/api/workout/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalPlan, userFeedback }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server error while updating your workout plan.');
    }

    if (!data.updatedPlan) {
      throw new Error('No updated plan received from trainer assistant.');
    }

    return data.updatedPlan;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error communicating with FitBuddy AI.';
    console.error('updateWorkoutPlan error:', message);
    throw new Error(message);
  }
}

/**
 * Scenario 3: Generates a practical nutrition and recovery tip.
 * Uses Gemini Flash-tier model (fast and lightweight).
 */
export async function generateNutritionTip(params: GenerateNutritionParams): Promise<string> {
  try {
    const res = await fetch('/api/nutrition/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server error while generating nutrition tip.');
    }

    if (!data.nutritionTip) {
      throw new Error('No nutrition tip was generated.');
    }

    return data.nutritionTip;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error communicating with FitBuddy AI.';
    console.error('generateNutritionTip error:', message);
    throw new Error(message);
  }
}
