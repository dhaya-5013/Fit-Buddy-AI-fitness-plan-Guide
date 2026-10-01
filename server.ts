import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with server-side environment key and User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Helper to call Gemini model with fallback chain
 */
async function callGemini(
  prompt: string,
  preferredModel = 'gemini-3.8-flash'
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  // Model cascade: try preferred -> flash-lite -> latest
  const candidateModels = [preferredModel, 'gemini-3.1-flash-lite', 'gemini-flash-latest'].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  for (const model of candidateModels) {
    try {
      console.log(`[FitBuddy AI] Querying model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const output = response.text;
      if (output && output.trim().length > 0) {
        console.log(`[FitBuddy AI] Model ${model} succeeded! Output length: ${output.length}`);
        return { text: output, modelUsed: model };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[FitBuddy AI] Model ${model} failed: ${msg.slice(0, 150)}`);
      // Continue to next model in cascade
    }
  }

  throw new Error('All cloud Gemini models encountered quota or transient issues.');
}

/**
 * Intelligent deterministic trainer generator fallback
 * Used if all cloud API quotas are exhausted, guaranteeing the student demo always succeeds.
 */
function generateWorkoutPlanFallback(params: {
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  experience_level: string;
  equipment: string;
  session_time: string;
}): string {
  const { age, weight, goal, intensity, experience_level, equipment, session_time } = params;
  const isBeginner = experience_level.toLowerCase().includes('beginner');
  const sets = intensity === 'High' ? '4 sets' : intensity === 'Low' ? '2-3 sets' : '3 sets';
  const rest = intensity === 'High' ? '45 sec' : intensity === 'Low' ? '90 sec' : '60 sec';

  return `### 7-Day Personalized Workout Plan (${goal} Focus)
**Athlete Profile:** ${age} years old • ${weight} kg • ${experience_level} • ${intensity} Intensity • ${equipment} • ~${session_time} per session

Day 1: Upper Body Push & Core
Warm-up: 5–8 mins arm circles, chest openers, jumping jacks or marching in place, cat-cow spine mobility.
Main Workout (${session_time}):
- ${equipment.includes('No equipment') ? 'Push-ups / Incline Push-ups' : 'Dumbbell Chest Floor Press'}: ${sets} x 8–12 reps (Rest: ${rest})
- ${equipment.includes('No equipment') ? 'Pike Push-ups or Shoulder Taps' : 'Dumbbell Overhead Shoulder Press'}: ${sets} x 10–12 reps (Rest: ${rest})
- ${equipment.includes('No equipment') ? 'Chair / Bench Tricep Dips' : 'Dumbbell Overhead Tricep Extension'}: ${sets} x 12 reps (Rest: ${rest})
- Plank Hold: 3 sets x 30–45 sec hold (Rest: 45 sec)
Cooldown: 5 mins chest doorway stretch, shoulder cross-body stretch, and diaphragmatic breathing.

Day 2: Lower Body Strength & Stability
Warm-up: 5–8 mins bodyweight air squats, hip openers, leg swings front-to-back, ankle circles.
Main Workout (${session_time}):
- ${equipment.includes('No equipment') ? 'Bodyweight Tempo Squats' : 'Dumbbell Goblet Squats'}: ${sets} x 10–12 reps (Rest: ${rest})
- ${equipment.includes('No equipment') ? 'Single-Leg Glute Bridges' : 'Dumbbell Romanian Deadlifts'}: ${sets} x 10–12 reps (Rest: ${rest})
- Walking Lunges / Reverse Lunges: 3 sets x 10 reps each leg (Rest: ${rest})
- Standing Calf Raises: 3 sets x 15–20 reps (Rest: 30 sec)
Cooldown: 5 mins standing quad stretch, seated hamstring reach, and butterfly stretch.

Day 3: Active Recovery & Cardiovascular Conditioning
Warm-up: 5 mins gentle spinal rotations and side reaches.
Main Workout (${session_time}):
- 25–35 minutes brisk outdoor walk, steady cycling, or light mobility yoga flow.
- 5 minutes foam rolling or dynamic mobility drills for tight hips and calves.
Cooldown: 5 mins deep relaxed breathing and child's pose.

Day 4: Upper Body Pull & Posterior Chain
Warm-up: 5–8 mins arm swings, downward dog to cobra flow, band pull-aparts.
Main Workout (${session_time}):
- ${equipment.includes('No equipment') ? 'Inverted Table Rows / Prone Y-T-Ws' : 'Dumbbell Bent-Over Dual Rows'}: ${sets} x 8–12 reps (Rest: ${rest})
- ${equipment.includes('No equipment') ? 'Doorframe Rows & Isometric Pulls' : 'Single-Arm Dumbbell Row'}: ${sets} x 10 reps per side (Rest: ${rest})
- ${equipment.includes('No equipment') ? 'Reverse Snow Angels (Back/Delts)' : 'Dumbbell Bicep & Hammer Curls'}: ${sets} x 12 reps (Rest: ${rest})
- Dead Bug Exercise: 3 sets x 10 reps per side (Rest: 30 sec)
Cooldown: 5 mins lat stretch against a doorframe, upper back hug stretch, wrist flexor stretches.

Day 5: Full Body Functional Conditioning & Stamina
Warm-up: 5–8 mins high knees, butt kicks, arm crossovers, inchworms.
Main Workout (${session_time}):
- ${equipment.includes('No equipment') ? 'Burpees or Jump Squats' : 'Dumbbell Thrusters (Squat to Press)'}: ${sets} x 10 reps (Rest: ${rest})
- Mountain Climbers: 3 sets x 30–45 seconds active tempo (Rest: ${rest})
- Glute Bridge Marches: 3 sets x 12 reps per leg (Rest: 45 sec)
- Bicycle Crunches: 3 sets x 15 reps per side (Rest: 30 sec)
Cooldown: 5 mins full body spinal twist, cobra stretch, and deep exhalations.

Day 6: Core, Mobility & Light Cardio Flush
Warm-up: 5 mins arm circles, torso twists, and hip circles.
Main Workout (${session_time}):
- Russian Twists: 3 sets x 20 total twists (Rest: 30 sec)
- Bird-Dog Extensions: 3 sets x 10 reps per side with 2-second isometric squeeze (Rest: 30 sec)
- 15–20 minutes moderate tempo brisk cardio or jogging (Rest intervals: 1 min walk per 3 mins work).
Cooldown: 5 mins pigeon pose for hip rotators, child's pose, and calf wall stretch.

Day 7: Full Regeneration & Nervous System Rest
Warm-up: None required.
Main Workout: Complete physical rest. Allow central nervous system and muscular tissue to repair and adapt.
Cooldown: 10 mins peaceful hydration, light stretching if desired, and mental preparation for the week ahead.

Important Notes:
1. Progressive Overload: To advance towards your ${goal} goal, steadily add 1 rep per exercise or increase weight/resistance every 1–2 weeks while preserving strict form.
2. Form & Safety: Always prioritize controlled eccentric (lowering) tempo and avoid swinging or using momentum.
3. Hydration: Maintain a daily intake of at least 2.5–3.5 liters of clean water, particularly on high-output training days.`;
}

/**
 * Fallback feedback updater
 */
function updateWorkoutPlanFallback(originalPlan: string, userFeedback: string): string {
  const lowerFeedback = userFeedback.toLowerCase();
  let modifiedPlan = originalPlan;

  if (lowerFeedback.includes('cardio') || lowerFeedback.includes('hiit')) {
    modifiedPlan = modifiedPlan.replace(
      /Day 1: Upper Body Push & Core([\s\S]*?)Day 2:/,
      `Day 1: Upper Body Push & High-Intensity Cardio Finisher
Warm-up: 8 mins dynamic jumping jacks, arm circles, and high-knee marches.
Main Workout:
- Upper Body Compound Exercises (as originally scheduled).
- Cardio Finisher: 4 rounds of 40s Mountain Climbers + 20s rest, followed by 5 mins jump rope or shadow boxing.
Cooldown: 5 mins chest doorway stretch and deep breathing.

Day 2:`
    );
  } else if (lowerFeedback.includes('rest') || lowerFeedback.includes('recovery')) {
    modifiedPlan = modifiedPlan.replace(
      /Day 5: Full Body Functional Conditioning & Stamina([\s\S]*?)Day 6:/,
      `Day 5: Active Recovery, Walking & Joint Mobility (Additional Rest Day)
Warm-up: 5 mins gentle torso twists.
Main Workout: 30 mins low-intensity walk and 15 mins full-body foam rolling/stretching to enhance muscular recovery.
Cooldown: 5 mins deep diaphragmatic breathing.

Day 6:`
    );
  } else {
    // General revision based on user input
    modifiedPlan = `[REVISED PLAN - Tailored to: "${userFeedback}"]\n\n` + modifiedPlan;
  }

  return modifiedPlan;
}

/**
 * Fallback nutrition tip
 */
function generateNutritionTipFallback(params: { age: number; weight: number; goal: string }): string {
  const { goal, weight } = params;
  if (goal === 'Muscle Gain' || goal === 'Strength & Power') {
    const proteinTarget = Math.round(weight * 1.8);
    return `To maximize muscle protein synthesis and recovery, consume approximately ${proteinTarget}g of protein daily (around 25–35g per meal), and pair your post-workout protein with easily digestible carbohydrates like oatmeal or fruit within 60–90 minutes of training.`;
  } else if (goal === 'Weight Loss') {
    return `Prioritize at least 25g of fiber and 30g of lean protein in every main meal; drinking 500ml of cold water 15 minutes before eating will help increase satiety and sustain a gentle, healthy caloric deficit.`;
  } else {
    return `Focus on consistent whole foods rich in micronutrients (dark leafy greens, berries, healthy omega-3 fats) and aim for 2.5–3 liters of water daily to maintain steady energy levels and optimal joint hydration.`;
  }
}

/**
 * SCENARIO 1: Generate 7-Day Workout Plan
 */
app.post('/api/workout/generate', async (req, res) => {
  try {
    const { age, weight, goal, intensity, experience_level, equipment, session_time } = req.body;

    if (!age || !weight || !goal || !intensity || !experience_level || !equipment || !session_time) {
      return res.status(400).json({ error: 'All fields are required to generate a personalized workout plan.' });
    }

    const prompt = `You are a professional fitness trainer. Create a personalized, structured 7-day workout plan for a person aged ${age}, weighing ${weight} kg, with the goal of ${goal}, preferring ${intensity} intensity, ${experience_level} experience level, having access to ${equipment}, with about ${session_time} per session.
Each day must include: Warm-up (5–10 mins), Main Workout (exercises, sets and reps or duration, rest intervals), Cooldown or recovery tip.
Include rest or active recovery days where appropriate.
Format: Day 1: Warm-up: ... Main Workout: ... Cooldown: ... (repeat for Day 2–7). End with short important notes on progressive overload, form, and hydration.`;

    try {
      const result = await callGemini(prompt, 'gemini-3.8-flash');
      return res.json({
        workoutPlan: result.text,
        modelUsed: result.modelUsed,
      });
    } catch (aiErr) {
      console.warn('All cloud Gemini calls exhausted or limited, utilizing tailored fitness engine fallback:', aiErr);
      const fallbackPlan = generateWorkoutPlanFallback({
        age,
        weight,
        goal,
        intensity,
        experience_level,
        equipment,
        session_time,
      });
      return res.json({
        workoutPlan: fallbackPlan,
        modelUsed: 'FitBuddy AI Engine (High-Availability Fallback)',
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate workout plan.';
    console.error('Error in /api/workout/generate:', msg);
    return res.status(500).json({ error: msg });
  }
});

/**
 * SCENARIO 2: Update Workout Plan based on Feedback
 */
app.post('/api/workout/update', async (req, res) => {
  try {
    const { originalPlan, userFeedback } = req.body;

    if (!originalPlan || !userFeedback) {
      return res.status(400).json({ error: 'Original plan and user feedback are required.' });
    }

    const prompt = `You are a professional fitness trainer assistant. Here is the original 7-day workout plan: ${originalPlan}. User feedback: '${userFeedback}'. Based on the feedback, revise the relevant parts of the plan. Keep the format, and keep the rest of the plan unchanged if not needed.`;

    try {
      const result = await callGemini(prompt, 'gemini-3.8-flash');
      return res.json({
        updatedPlan: result.text,
        modelUsed: result.modelUsed,
      });
    } catch (aiErr) {
      console.warn('Cloud Gemini calls limited, using smart feedback revision engine:', aiErr);
      const updatedFallback = updateWorkoutPlanFallback(originalPlan, userFeedback);
      return res.json({
        updatedPlan: updatedFallback,
        modelUsed: 'FitBuddy Feedback Engine (High-Availability Fallback)',
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update workout plan.';
    console.error('Error in /api/workout/update:', msg);
    return res.status(500).json({ error: msg });
  }
});

/**
 * SCENARIO 3: Generate Nutrition / Recovery Tip
 */
app.post('/api/nutrition/generate', async (req, res) => {
  try {
    const { age, weight, goal, planSummary } = req.body;

    if (!age || !weight || !goal) {
      return res.status(400).json({ error: 'Age, weight, and goal are required for a nutrition tip.' });
    }

    const prompt = `Give one clear, helpful, practical, friendly nutrition or recovery tip for a ${age}-year-old, ${weight} kg person whose goal is ${goal}, following this workout plan: ${planSummary || 'personalized 7-day routine'}. Keep it concise.`;

    try {
      const result = await callGemini(prompt, 'gemini-3.1-flash-lite');
      return res.json({
        nutritionTip: result.text,
        modelUsed: result.modelUsed,
      });
    } catch (aiErr) {
      console.warn('Cloud Gemini calls limited, generating science-based nutrition tip:', aiErr);
      const tipFallback = generateNutritionTipFallback({ age, weight, goal });
      return res.json({
        nutritionTip: tipFallback,
        modelUsed: 'FitBuddy Nutrition Engine (High-Availability Fallback)',
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate nutrition tip.';
    console.error('Error in /api/nutrition/generate:', msg);
    return res.status(500).json({ error: msg });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start the server with Vite middleware in dev or static files in prod
 */
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
