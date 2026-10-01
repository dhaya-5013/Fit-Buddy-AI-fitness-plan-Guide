import React, { useState } from 'react';
import {
  User as UserIcon,
  Flame,
  Gauge,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Target,
  Zap,
  Shield,
  Layers,
  HeartHandshake,
  Activity,
} from 'lucide-react';
import {
  FitnessGoal,
  IntensityLevel,
  ExperienceLevel,
  PlanFormData,
  User,
  WorkoutPlanRecord,
} from '../types/fitness';
import { generateWorkout, generateNutritionTip } from '../services/fitnessApi';
import { saveUser, savePlan, getUser } from '../services/storage';

interface PlanFormProps {
  onPlanGenerated: (user: User, planRecord: WorkoutPlanRecord) => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({ onPlanGenerated }) => {
  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    fullName: '',
    userId: '',
    age: '',
    weight: '',
    goal: 'Muscle Gain',
    intensity: 'Medium',
    experienceLevel: 'Beginner',
    equipment: 'Dumbbells only',
    sessionTime: '45 minutes',
  });

  // Validation & Loading state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Objective options with descriptions and icons
  const GOAL_OPTIONS: { id: FitnessGoal; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'Weight Loss',
      label: 'Weight Loss',
      desc: 'Burn fat, increase calorie deficit, maintain lean muscle',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'Muscle Gain',
      label: 'Muscle Gain',
      desc: 'Hypertrophy-focused volume for muscle growth & size',
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'General Wellness',
      label: 'General Wellness',
      desc: 'Joint mobility, cardiovascular health, daily vitality',
      icon: <HeartHandshake className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'Endurance & Stamina',
      label: 'Endurance & Stamina',
      desc: 'Boost VO2 max, aerobic capacity, and muscular stamina',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'Strength & Power',
      label: 'Strength & Power',
      desc: 'Heavy compound lifts, neuromuscular recruitment, power output',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
    },
  ];

  // Auto-generate random user ID helper
  const handleGenerateUserId = () => {
    const cleanName = formData.fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefix = cleanName ? cleanName.slice(0, 6) : 'fituser';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `${prefix}${randomNum}`;
    setFormData((prev) => ({ ...prev, userId: newId }));
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: '' }));
    }
  };

  // Quick autofill for college presentation & grading
  const handleAutofillDemo = () => {
    const demoId = `student_${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      fullName: 'Jordan Miller',
      userId: demoId,
      age: 21,
      weight: 72,
      goal: 'Muscle Gain',
      intensity: 'Medium',
      experienceLevel: 'Intermediate',
      equipment: 'Dumbbells only',
      sessionTime: '45 minutes',
    });
    setErrors({});
    setErrorMessage(null);
  };

  // Field validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = 'Unique User ID is required (e.g. jordan21).';
    } else if (formData.userId.trim().length < 3) {
      newErrors.userId = 'User ID must be at least 3 characters.';
    }

    const ageNum = Number(formData.age);
    if (!formData.age || isNaN(ageNum)) {
      newErrors.age = 'Age is required.';
    } else if (ageNum < 14 || ageNum > 99) {
      newErrors.age = 'Please enter a sensible age between 14 and 99.';
    }

    const weightNum = Number(formData.weight);
    if (!formData.weight || isNaN(weightNum)) {
      newErrors.weight = 'Weight is required.';
    } else if (weightNum < 30 || weightNum > 250) {
      newErrors.weight = 'Please enter a sensible weight between 30 kg and 250 kg.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLoadingStep('Saving user profile to local storage...');

    try {
      const age = Number(formData.age);
      const weight = Number(formData.weight);
      const cleanUserId = formData.userId.trim();

      // 1. Save User Details (Update if existing, or create new)
      const userRecord: User = {
        id: cleanUserId,
        name: formData.fullName.trim(),
        age,
        weight,
        goal: formData.goal,
        intensity: formData.intensity,
        experience_level: formData.experienceLevel,
        equipment: formData.equipment,
        session_time: formData.sessionTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveUser(userRecord);

      // 2. Call Gemini Pro-tier model for 7-day workout plan
      setLoadingStep('Consulting Gemini Pro-tier model for customized 7-day plan...');
      const workoutPlanText = await generateWorkout({
        age,
        weight,
        goal: formData.goal,
        intensity: formData.intensity,
        experience_level: formData.experienceLevel,
        equipment: formData.equipment,
        session_time: formData.sessionTime,
      });

      // 3. Call Gemini Flash-tier model for quick practical nutrition/recovery tip
      setLoadingStep('Generating nutrition & recovery guidance with Gemini Flash...');
      let nutritionTipText = '';
      try {
        nutritionTipText = await generateNutritionTip({
          age,
          weight,
          goal: formData.goal,
          planSummary: `7-day ${formData.intensity} intensity ${formData.goal} routine using ${formData.equipment}`,
        });
      } catch (nutritionErr) {
        console.warn('Nutrition tip generation failed, using fallback:', nutritionErr);
        nutritionTipText = `Focus on consistent whole-food nutrition, adequate protein intake (1.6-2g/kg), and at least 7-8 hours of sleep to support your ${formData.goal} training.`;
      }

      // 4. Save generated plan as "original plan"
      setLoadingStep('Finalizing and saving your personalized routine...');
      const planRecord: WorkoutPlanRecord = {
        user_id: cleanUserId,
        original_plan: workoutPlanText,
        updated_plan: null, // Initial plan has no feedback revisions yet
        nutrition_tip: nutritionTipText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      savePlan(planRecord);

      // 5. Navigate to Result Page
      onPlanGenerated(userRecord, planRecord);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while generating your workout plan.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Scenario 1 • Personalized 7-Day Plan
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Generate Your <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Custom Fitness Plan</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Powered by Gemini Pro-tier for detailed 7-day periodized workout structures and Gemini Flash for rapid nutrition and recovery tips.
        </p>

        {/* Quick Demo Autofill Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-blue-300 border border-blue-500/30 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            ✨ Auto-fill Sample Student Profile
          </button>
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-red-200">Generation Notice</p>
            <p>{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Card Form */}
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="space-y-8">
          {/* SECTION 1: Personal Information */}
          <div className="border-b border-slate-800/80 pb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-400">
                  User ID will be used later for feedback updates and dashboard lookup.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="e.g. Jordan Miller"
                  className={`w-full bg-black/70 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.fullName ? 'border-red-500/70' : 'border-slate-700/60'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Unique User ID */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Unique User ID <span className="text-blue-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUserId}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    Generate ID
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => {
                    setFormData({ ...formData, userId: e.target.value.toLowerCase().trim() });
                    if (errors.userId) setErrors({ ...errors, userId: '' });
                  }}
                  placeholder="e.g. jordan21"
                  className={`w-full bg-black/70 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.userId ? 'border-red-500/70' : 'border-slate-700/60'
                  }`}
                />
                {errors.userId && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.userId}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Age (years) <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  min="14"
                  max="99"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value });
                    if (errors.age) setErrors({ ...errors, age: '' });
                  }}
                  placeholder="e.g. 22"
                  className={`w-full bg-black/70 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.age ? 'border-red-500/70' : 'border-slate-700/60'
                  }`}
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.age}
                  </p>
                )}
              </div>

              {/* Current Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Current Weight (kg) <span className="text-blue-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="250"
                  value={formData.weight}
                  onChange={(e) => {
                    setFormData({ ...formData, weight: e.target.value });
                    if (errors.weight) setErrors({ ...errors, weight: '' });
                  }}
                  placeholder="e.g. 74"
                  className={`w-full bg-black/70 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.weight ? 'border-red-500/70' : 'border-slate-700/60'
                  }`}
                />
                {errors.weight && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.weight}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Primary Fitness Objective */}
          <div className="border-b border-slate-800/80 pb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Primary Fitness Objective
                </h2>
                <p className="text-xs text-slate-400">
                  Select the primary focus for your 7-day periodization plan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GOAL_OPTIONS.map((item) => {
                const isSelected = formData.goal === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, goal: item.id })}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                        : 'bg-black/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {item.icon}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-400 bg-blue-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-3">{item.label}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Workout Intensity */}
          <div className="border-b border-slate-800/80 pb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Workout Intensity
                </h2>
                <p className="text-xs text-slate-400">
                  Dictates work-to-rest intervals, set density, and heart rate targets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Low',
                  label: 'Low Intensity',
                  desc: 'Gentle progression, higher rest, low injury risk, active mobility',
                },
                {
                  id: 'Medium',
                  label: 'Medium Intensity',
                  desc: 'Balanced volume, standard compound loading, moderate rest',
                },
                {
                  id: 'High',
                  label: 'High Intensity',
                  desc: 'High output, supersets, shorter rest, challenging metabolic load',
                },
              ].map((lvl) => {
                const isSelected = formData.intensity === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setFormData({ ...formData, intensity: lvl.id as IntensityLevel })}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-black/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{lvl.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-400 bg-blue-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{lvl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Equipment & Experience */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Equipment & Experience
                </h2>
                <p className="text-xs text-slate-400">
                  Ensures exercises are realistic and match your current training background.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: exp })}
                      className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        formData.experienceLevel === exp
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                          : 'bg-black/60 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Equipment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Available Equipment
                </label>
                <select
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="w-full bg-black/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="No equipment (Bodyweight)">No equipment (Bodyweight & Calisthenics)</option>
                  <option value="Dumbbells only">Dumbbells only (Pairs / Adjustable)</option>
                  <option value="Home gym (Bands & Dumbbells)">Home gym (Resistance Bands, Dumbbells, Pull-up bar)</option>
                  <option value="Full commercial gym">Full commercial gym (Barbells, Cables, Machines, Free weights)</option>
                </select>
              </div>

              {/* Target Session Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Session Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['20 minutes', '30 minutes', '45 minutes', '60 minutes'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionTime: time })}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        formData.sessionTime === time
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                          : 'bg-black/60 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button & Status */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-blue-400 font-semibold">Gemini Pro</span> generates your 7-day plan •{' '}
            <span className="text-sky-400 font-semibold">Gemini Flash</span> generates recovery & nutrition tips.
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-3 ${
              loading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-5 h-5" />
                <span>Generate Plan with Gemini</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-xl shadow-blue-500/30">
              <Dumbbell className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">
              FitBuddy AI is Crafting Your Routine
            </h3>
            <p className="text-sm text-blue-400 font-medium animate-pulse max-w-md">
              {loadingStep || 'Building your periodized 7-day schedule...'}
            </p>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Invoking Gemini Pro-tier model for athletic periodization & structure
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
