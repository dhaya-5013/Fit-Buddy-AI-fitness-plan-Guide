/**
 * FitBuddy – Storage Module (localStorage persistence)
 * 
 * Manages two collections stored in the browser:
 * 1. 'fitbuddy_users': user profile records
 * 2. 'fitbuddy_plans': original and updated workout plans + nutrition tips
 * 
 * Includes the explicitly requested module functions:
 * - saveUser()
 * - savePlan()
 * - updatePlan()
 * - getOriginalPlan()
 * - getUser()
 * - getAllUsers()
 */

import { User, WorkoutPlanRecord } from '../types/fitness';

const USERS_STORAGE_KEY = 'fitbuddy_users';
const PLANS_STORAGE_KEY = 'fitbuddy_plans';

/**
 * Reads all users from localStorage.
 */
export function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse users from localStorage:', err);
    return [];
  }
}

/**
 * Finds a single user by their unique User ID.
 * Returns null if not found.
 */
export function getUser(userId: string): User | null {
  const users = getAllUsers();
  const found = users.find((u) => u.id.trim().toLowerCase() === userId.trim().toLowerCase());
  return found || null;
}

/**
 * Saves a user to localStorage.
 * If the user ID already exists, updates that user instead of duplicating.
 */
export function saveUser(user: User): void {
  const users = getAllUsers();
  const normalizedId = user.id.trim().toLowerCase();
  const existingIndex = users.findIndex((u) => u.id.trim().toLowerCase() === normalizedId);

  const timestamp = new Date().toISOString();
  const userToSave: User = {
    ...user,
    id: user.id.trim(),
    updated_at: timestamp,
    created_at: existingIndex >= 0 ? users[existingIndex].created_at : timestamp,
  };

  if (existingIndex >= 0) {
    users[existingIndex] = userToSave;
  } else {
    users.unshift(userToSave);
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Deletes a user and their associated workout plans by User ID.
 */
export function deleteUser(userId: string): boolean {
  try {
    const normalizedId = userId.trim().toLowerCase();
    const users = getAllUsers().filter((u) => u.id.trim().toLowerCase() !== normalizedId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const plans = getAllPlans().filter((p) => p.user_id.trim().toLowerCase() !== normalizedId);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    return true;
  } catch (err) {
    console.error(`Failed to delete user ${userId}:`, err);
    return false;
  }
}

/**
 * Reads all plans from localStorage.
 */
export function getAllPlans(): WorkoutPlanRecord[] {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse plans from localStorage:', err);
    return [];
  }
}

/**
 * Retrieves a plan record for a given user ID.
 */
export function getPlanByUserId(userId: string): WorkoutPlanRecord | null {
  const plans = getAllPlans();
  const found = plans.find((p) => p.user_id.trim().toLowerCase() === userId.trim().toLowerCase());
  return found || null;
}

/**
 * Retrieves the original 7-day workout plan for a user.
 * Returns null if not found.
 */
export function getOriginalPlan(userId: string): string | null {
  const planRecord = getPlanByUserId(userId);
  return planRecord ? planRecord.original_plan : null;
}

/**
 * Saves a new workout plan or updates an existing record.
 * Preserves the original plan and separates updated plan.
 */
export function savePlan(plan: WorkoutPlanRecord): void {
  const plans = getAllPlans();
  const normalizedId = plan.user_id.trim().toLowerCase();
  const existingIndex = plans.findIndex((p) => p.user_id.trim().toLowerCase() === normalizedId);

  const timestamp = new Date().toISOString();
  const planToSave: WorkoutPlanRecord = {
    ...plan,
    user_id: plan.user_id.trim(),
    updated_at: timestamp,
    created_at: existingIndex >= 0 ? plans[existingIndex].created_at : timestamp,
  };

  if (existingIndex >= 0) {
    plans[existingIndex] = planToSave;
  } else {
    plans.unshift(planToSave);
  }

  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
}

/**
 * Updates an existing plan with user-feedback revisions.
 * Saves the result as "updated_plan" in a SEPARATE field so both versions are preserved.
 */
export function updatePlan(
  userId: string,
  updatedPlanText: string,
  newNutritionTip?: string
): WorkoutPlanRecord | null {
  const plans = getAllPlans();
  const normalizedId = userId.trim().toLowerCase();
  const existingIndex = plans.findIndex((p) => p.user_id.trim().toLowerCase() === normalizedId);

  if (existingIndex === -1) {
    return null;
  }

  const existing = plans[existingIndex];
  const updatedRecord: WorkoutPlanRecord = {
    ...existing,
    updated_plan: updatedPlanText,
    nutrition_tip: newNutritionTip !== undefined ? newNutritionTip : existing.nutrition_tip,
    updated_at: new Date().toISOString(),
  };

  plans[existingIndex] = updatedRecord;
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  return updatedRecord;
}

/**
 * Initial seed data generator so college evaluators immediately see sample data
 * in the Admin Dashboard without having to manually create multiple accounts first.
 */
export function seedInitialDataIfNeeded(): void {
  const users = getAllUsers();
  if (users.length > 0) return; // Already has data

  const sampleUsers: User[] = [
    {
      id: 'alex-fit99',
      name: 'Alex Johnson',
      age: 22,
      weight: 74,
      goal: 'Muscle Gain',
      intensity: 'High',
      experience_level: 'Intermediate',
      equipment: 'Dumbbells only',
      session_time: '45 minutes',
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 'sarah-wellness',
      name: 'Sarah Chen',
      age: 24,
      weight: 62,
      goal: 'Weight Loss',
      intensity: 'Medium',
      experience_level: 'Beginner',
      equipment: 'No equipment (Bodyweight)',
      session_time: '30 minutes',
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
  ];

  const samplePlans: WorkoutPlanRecord[] = [
    {
      user_id: 'alex-fit99',
      original_plan: `Day 1: Upper Body Push
Warm-up: 5 mins arm circles, cat-cow, band pull-aparts.
Main Workout: Dumbbell Floor Press (4x10 reps, 60s rest), Dumbbell Overhead Shoulder Press (3x12 reps, 60s rest), Incline Push-ups (3x15 reps, 45s rest), Overhead Tricep Extension (3x12 reps).
Cooldown: 5 mins chest door-frame stretch and tricep stretch.

Day 2: Lower Body Quad & Core
Warm-up: 5 mins bodyweight squats, leg swings, hip circles.
Main Workout: Dumbbell Goblet Squats (4x12 reps, 90s rest), Dumbbell Romanian Deadlifts (4x10 reps, 90s rest), Walking Lunges (3x12 reps per leg), Plank holds (3x45s).
Cooldown: 5 mins quad stretch, hamstring stretch.

Day 3: Active Recovery & Mobility
Warm-up: 5 mins gentle torso twists.
Main Workout: 30 mins brisk outdoor walking and foam rolling major muscle groups.
Cooldown: 10 mins deep diaphragmatic breathing and child's pose.

Day 4: Upper Body Pull & Posterior Chain
Warm-up: 5 mins arm swings and downward dog to cobra flow.
Main Workout: Dumbbell Bent-Over Rows (4x10 reps, 60s rest), Dumbbell Hammer Curls (3x12 reps), Rear Delt Flyes (3x15 reps), Shrugs (3x15 reps).
Cooldown: 5 mins lat stretch and upper back stretch.

Day 5: Full Body Functional Conditioning
Warm-up: 5 mins jumping jacks and mountain climbers.
Main Workout: Dumbbell Thrusters (4x10 reps, 60s rest), Dumbbell Renegade Rows (3x8 reps per side), Mountain Climbers (3x30s), Glute Bridges (3x15 reps).
Cooldown: 5 mins full body spinal twist.

Day 6: Core, Calves & Forearms
Warm-up: 5 mins high knees and wrist circles.
Main Workout: Standing Dumbbell Calf Raises (4x20 reps), Dumbbell Farmer's Walk (3x60s), Russian Twists with Dumbbell (3x20 reps), Dead Bug (3x12 reps).
Cooldown: 5 mins cobra stretch and calf wall stretch.

Day 7: Full Rest & Regeneration Day
Active recovery or complete rest to allow central nervous system and muscular tissue repair.

Important Notes:
1. Progressive Overload: Aim to increase dumbbell weight by 1-2 kg or add 1-2 reps every two weeks.
2. Form: Keep core braced and neutral spine throughout all compound presses and rows.
3. Hydration: Drink at least 3 liters of water daily, especially around training hours.`,
      updated_plan: `Day 1: Upper Body Push (Increased Cardio Focus)
Warm-up: 8 mins light jogging in place, arm circles, and dynamic jumping jacks.
Main Workout: Dumbbell Floor Press (4x10 reps, 45s rest), Dumbbell Overhead Shoulder Press (3x12 reps, 45s rest), Incline Push-ups (3x15 reps, 30s rest), Overhead Tricep Extension (3x12 reps) followed by 5 mins jump rope interval.
Cooldown: 5 mins chest door-frame stretch and tricep stretch.

Day 2: Lower Body & High Intensity Cardio
Warm-up: 6 mins bodyweight squats, butt kicks, hip circles.
Main Workout: Dumbbell Goblet Squats (4x12 reps, 60s rest), Dumbbell Romanian Deadlifts (4x10 reps, 60s rest), Walking Lunges (3x12 reps per leg), Burpees (3x40s intervals for cardio boost).
Cooldown: 5 mins quad stretch, hamstring stretch.

Day 3: Active Recovery & Cardio Walk
Warm-up: 5 mins gentle torso twists.
Main Workout: 45 mins brisk cardio power walk or stationary bike ride to enhance stamina.
Cooldown: 10 mins deep diaphragmatic breathing and child's pose.

Day 4: Upper Body Pull & Core Conditioning
Warm-up: 5 mins arm swings and downward dog to cobra flow.
Main Workout: Dumbbell Bent-Over Rows (4x10 reps, 45s rest), Dumbbell Hammer Curls (3x12 reps), Mountain Climbers (4x30s), Dumbbell Renegade Rows (3x8 reps).
Cooldown: 5 mins lat stretch and upper back stretch.

Day 5: Full Body Functional HIIT Conditioning
Warm-up: 5 mins high knees and jumping jacks.
Main Workout: Dumbbell Thrusters (4x10 reps, 45s rest), Shadow boxing intervals (3x60s), Plank jacks (3x30s), Glute Bridges (3x15 reps).
Cooldown: 5 mins full body spinal twist.

Day 6: Core & Cardiovascular Conditioning
Warm-up: 5 mins high knees and wrist circles.
Main Workout: Standing Dumbbell Calf Raises (4x20 reps), Dumbbell Farmer's Walk (3x60s), Russian Twists with Dumbbell (3x20 reps), 15 mins moderate tempo cardio jog.
Cooldown: 5 mins cobra stretch and calf wall stretch.

Day 7: Full Rest & Regeneration Day
Active recovery or complete rest to allow muscular and cardiovascular recovery.

Important Notes:
1. Progressive Overload: Aim to increase dumbbell weight or maintain strict pacing on cardio intervals.
2. Form: Maintain a braced core during high-tempo compound movements.
3. Hydration: Drink 3-3.5 liters of water daily to replenish electrolytes lost during higher cardio output.`,
      nutrition_tip: `Since your revised routine includes higher-intensity cardio intervals, consume a balanced post-workout meal with 25-30g of protein and complex carbohydrates (like brown rice or sweet potatoes) within 60 minutes to replenish muscle glycogen and support muscle hypertrophy.`,
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      user_id: 'sarah-wellness',
      original_plan: `Day 1: Total Body Calisthenics
Warm-up: 5 mins marching in place, hip rotations, shoulder rolls.
Main Workout: Bodyweight Box Squats (3x12 reps, 45s rest), Incline Wall Push-ups (3x10 reps), Glute Bridges (3x15 reps), Bird-Dogs (3x10 reps per side).
Cooldown: 5 mins gentle hamstring stretch and child's pose.

Day 2: Cardio & Low-Impact Mobility
Warm-up: 5 mins neck rolls and arm swings.
Main Workout: 25 mins brisk interval walk (2 mins fast, 1 min normal) followed by standing knee-to-elbow crunches (3x12 reps).
Cooldown: 5 mins calf and quad stretches.

Day 3: Rest & Hydration Day
Complete rest. Focus on gentle 15-min leisurely walk and relaxation.

Day 4: Core & Lower Body Strength
Warm-up: 5 mins light ankle and knee mobilizations.
Main Workout: Stationary Lunges (3x10 reps each leg, 60s rest), Step-ups onto a sturdy low step (3x12 reps), Dead Bug exercise (3x10 reps), Modified side plank (3x20s per side).
Cooldown: 5 mins seated forward fold and butterfly stretch.

Day 5: Low-Impact HIIT & Upper Body Toning
Warm-up: 5 mins step-touch and torso twists.
Main Workout: Low-impact Jumping Jacks (3x30s), Knee Push-ups (3x8 reps), Chair Dips (3x10 reps), Standing high-knee march (3x45s).
Cooldown: 5 mins chest opener and upper back stretch.

Day 6: Mobility, Core & Flow
Warm-up: 5 mins cat-cow and gentle side reaches.
Main Workout: 20 mins beginner yoga flow including warrior poses, downward dog, and cobra.
Cooldown: 5 mins corpse pose (savasana) with deep breathing.

Day 7: Full Rest Day
Enjoy relaxing rest and healthy nutrition preparation for the upcoming week.

Important Notes:
1. Consistency is key: Focus on completing the full 30-minute block each scheduled day.
2. Form: Keep shoulders relaxed away from your ears during push-ups and planks.
3. Hydration: Aim for 2 to 2.5 liters of clean water daily to boost energy and metabolism.`,
      updated_plan: null,
      nutrition_tip: `Prioritize fiber-rich vegetables and lean protein sources in every meal; drinking a large glass of water 15 minutes before meals will naturally aid portion control and support healthy weight loss.`,
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
  ];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sampleUsers));
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(samplePlans));
}
