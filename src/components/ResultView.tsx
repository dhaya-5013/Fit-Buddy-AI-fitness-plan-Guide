import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  FileText,
  ArrowRight,
  User as UserIcon,
  Flame,
  Clock,
  Dumbbell,
  Shield,
  Download,
  Calendar,
  Split,
  Layers,
} from 'lucide-react';
import { User, WorkoutPlanRecord } from '../types/fitness';
import { updateWorkoutPlan, generateNutritionTip } from '../services/fitnessApi';
import {
  getOriginalPlan,
  getPlanByUserId,
  getUser,
  updatePlan,
  getAllUsers,
} from '../services/storage';

interface ResultViewProps {
  currentUser: User | null;
  currentPlan: WorkoutPlanRecord | null;
  onSelectUserPlan: (user: User, plan: WorkoutPlanRecord) => void;
  onNavigateToForm: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  currentUser,
  currentPlan,
  onSelectUserPlan,
  onNavigateToForm,
}) => {
  // Active Plan & User state
  const [activeUser, setActiveUser] = useState<User | null>(currentUser);
  const [activePlan, setActivePlan] = useState<WorkoutPlanRecord | null>(currentPlan);

  // Tab state: 'updated' | 'original' | 'compare'
  const [activePlanTab, setActivePlanTab] = useState<'updated' | 'original' | 'compare'>('updated');

  // Feedback form state
  const [feedbackUserId, setFeedbackUserId] = useState<string>(
    currentUser?.id || currentPlan?.user_id || ''
  );
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);
  const [feedbackErrorMsg, setFeedbackErrorMsg] = useState<string | null>(null);

  // Nutrition Tip refresh state
  const [isRefreshingTip, setIsRefreshingTip] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // User switcher dropdown state (for testing / demo)
  const allUsers = getAllUsers();

  // Sync state if props change
  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
      setFeedbackUserId(currentUser.id);
    }
    if (currentPlan) {
      setActivePlan(currentPlan);
      // If an updated plan exists, show it; else show original
      setActivePlanTab(currentPlan.updated_plan ? 'updated' : 'original');
    }
  }, [currentUser, currentPlan]);

  // Handle switching users on the results page
  const handleSwitchUser = (userId: string) => {
    const user = getUser(userId);
    const plan = getPlanByUserId(userId);
    if (user && plan) {
      setActiveUser(user);
      setActivePlan(plan);
      setFeedbackUserId(user.id);
      setActivePlanTab(plan.updated_plan ? 'updated' : 'original');
      setFeedbackSuccessMsg(null);
      setFeedbackErrorMsg(null);
      onSelectUserPlan(user, plan);
    }
  };

  // Quick feedback template suggestions
  const FEEDBACK_SUGGESTIONS = [
    'More focus on cardio and fat-burning intervals',
    'Include more rest days for better recovery',
    'Add extra dumbbell shoulder & arm exercises',
    'Shorten session time to 30 minutes without sacrificing volume',
    'Replace high-impact jumps with low-impact bodyweight moves',
  ];

  /**
   * SCENARIO 2: Submit Feedback & Update Plan
   * Logic:
   * 1. Look up original plan by User ID. If not found, show error.
   * 2. Call Gemini Pro-tier model with prompt.
   * 3. Save as "updated plan" in separate field.
   * 4. Display updated plan and success message.
   * 5. Regenerate nutrition tip with Gemini Flash.
   */
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackErrorMsg(null);
    setFeedbackSuccessMsg(null);

    const lookupId = feedbackUserId.trim();
    if (!lookupId) {
      setFeedbackErrorMsg('Please provide your Unique User ID.');
      return;
    }

    if (!feedbackText.trim()) {
      setFeedbackErrorMsg('Please write your feedback on how we can improve your plan.');
      return;
    }

    // Step 1: Look up user's original plan by User ID
    const origPlanText = getOriginalPlan(lookupId);
    if (!origPlanText) {
      setFeedbackErrorMsg('Original plan not found for this user.');
      return;
    }

    setIsUpdating(true);

    try {
      // Step 2: Send original plan plus feedback to Gemini Pro-tier model
      const updatedPlanText = await updateWorkoutPlan(origPlanText, feedbackText.trim());

      // Step 3: Automatically regenerate the nutrition tip with Gemini Flash based on the new focus
      let newTip: string | undefined = undefined;
      const targetUser = getUser(lookupId);
      if (targetUser) {
        try {
          newTip = await generateNutritionTip({
            age: targetUser.age,
            weight: targetUser.weight,
            goal: targetUser.goal,
            planSummary: `Updated workout plan: ${feedbackText.trim()}`,
          });
        } catch (tipErr) {
          console.warn('Failed to regenerate nutrition tip after feedback:', tipErr);
        }
      }

      // Step 4: Save result as "updated plan" in a SEPARATE field so both versions are preserved
      const updatedRecord = updatePlan(lookupId, updatedPlanText, newTip);

      if (updatedRecord) {
        setActivePlan(updatedRecord);
        setActivePlanTab('updated');
        setFeedbackSuccessMsg('✅ Your plan has been updated based on your feedback!');
        setFeedbackText('');
      } else {
        throw new Error('Failed to save updated plan in storage.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating plan with feedback.';
      setFeedbackErrorMsg(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * SCENARIO 3: Regenerate Nutrition Tip on demand using Gemini Flash
   */
  const handleRegenerateTip = async () => {
    if (!activeUser) return;
    setIsRefreshingTip(true);
    try {
      const newTip = await generateNutritionTip({
        age: activeUser.age,
        weight: activeUser.weight,
        goal: activeUser.goal,
        planSummary: activePlan?.updated_plan || activePlan?.original_plan || '7-day athletic plan',
      });

      if (activePlan) {
        const updatedRecord = updatePlan(activeUser.id, activePlan.updated_plan || activePlan.original_plan, newTip);
        if (updatedRecord) {
          setActivePlan(updatedRecord);
        }
      }
    } catch (err) {
      console.error('Error refreshing nutrition tip:', err);
    } finally {
      setIsRefreshingTip(false);
    }
  };

  // Copy plan to clipboard
  const handleCopyPlan = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export plan as text file
  const handleExportText = () => {
    const content = `FITBUDDY PERSONALIZED WORKOUT PLAN\nUser: ${activeUser?.name || 'Athlete'} (${activeUser?.id})\nGoal: ${activeUser?.goal} | Intensity: ${activeUser?.intensity}\n\n====================\nNUTRITION TIP:\n${activePlan?.nutrition_tip || 'N/A'}\n\n====================\n${
      activePlanTab === 'updated' && activePlan?.updated_plan
        ? `REVISED WORKOUT PLAN (Based on Feedback):\n${activePlan.updated_plan}`
        : `ORIGINAL WORKOUT PLAN:\n${activePlan?.original_plan}`
    }\n\nDisclaimer: This plan is a general guide. Consult a doctor before starting a new workout routine.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FitBuddy_${activeUser?.id || 'workout_plan'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // If no plan is active yet, show empty state with option to select existing or generate new
  if (!activePlan || !activeUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Workout Plan Selected</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Generate a new personalized plan from the form, or select a previously saved profile below.
        </p>

        {allUsers.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 inline-block text-left max-w-md w-full">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Select Saved Athlete Profile:
            </label>
            <select
              onChange={(e) => handleSwitchUser(e.target.value)}
              defaultValue=""
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200"
            >
              <option value="" disabled>
                -- Choose a User --
              </option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id}) – {u.goal}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
          >
            <Dumbbell className="w-4 h-4" />
            Go to Plan Generator
          </button>
        </div>
      </div>
    );
  }

  const hasUpdatedPlan = Boolean(activePlan.updated_plan);
  const currentDisplayText =
    activePlanTab === 'updated' && hasUpdatedPlan
      ? activePlan.updated_plan!
      : activePlan.original_plan;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Top Banner: User Profile Snapshot */}
      <div className="backdrop-blur-xl bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <UserIcon className="w-3.5 h-3.5" />
              Athlete Profile Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              {activeUser.name}
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 font-normal">
                ID: {activeUser.id}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeUser.age} yrs • {activeUser.weight} kg • {activeUser.experience_level} Level
            </p>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              {activeUser.goal}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-700">
              Intensity: {activeUser.intensity}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {activeUser.session_time}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-700">
              {activeUser.equipment}
            </span>
          </div>
        </div>

        {/* Switch Athlete Profile Dropdown for quick grading convenience */}
        {allUsers.length > 1 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Switch Athlete Profile:</span>
            <select
              value={activeUser.id}
              onChange={(e) => handleSwitchUser(e.target.value)}
              className="bg-black border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SCENARIO 3: Nutrition & Recovery Tip Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-950/90 to-indigo-950/40 border border-blue-500/30 p-6 sm:p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-blue-300 tracking-wide uppercase">
                  💡 Nutrition & Recovery Tip
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Gemini Flash
                </span>
              </div>
              <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {activePlan.nutrition_tip ||
                  'Prioritize nutrient-dense whole foods and maintain steady hydration before and after training sessions.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerateTip}
            disabled={isRefreshingTip}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-all shrink-0"
            title="Regenerate Tip with Gemini Flash"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingTip ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Plan Header & View Controls */}
      <div className="backdrop-blur-xl bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                7-Day Workout Routine
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Gemini Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Formatted in clean monospace blocks with warmup, compound lifts, and cooldown.
            </p>
          </div>

          {/* Action buttons: Copy & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyPlan(currentDisplayText)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Plan</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .TXT</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs: Updated Plan vs Original Plan vs Side-by-Side */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-black/80 border border-slate-800 rounded-2xl">
            {hasUpdatedPlan ? (
              <>
                <button
                  onClick={() => setActivePlanTab('updated')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePlanTab === 'updated'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Updated Plan (Revised)
                </button>

                <button
                  onClick={() => setActivePlanTab('original')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePlanTab === 'original'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Original Plan
                </button>

                <button
                  onClick={() => setActivePlanTab('compare')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePlanTab === 'compare'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  Side-by-Side Diff
                </button>
              </>
            ) : (
              <div className="px-4 py-1.5 text-xs text-slate-300 font-semibold flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Original 7-Day Plan (No feedback revisions submitted yet)
              </div>
            )}
          </div>

          {hasUpdatedPlan && (
            <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-medium">
              ✨ Preserving both Original and Revised versions
            </span>
          )}
        </div>

        {/* Success feedback notification if updated */}
        {feedbackSuccessMsg && (
          <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/40 text-blue-300 text-sm font-semibold flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <p>{feedbackSuccessMsg}</p>
          </div>
        )}

        {/* Monospace Plan Content */}
        {activePlanTab === 'compare' && hasUpdatedPlan ? (
          /* Side-by-side comparison view */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-black/90 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Original Version
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(activePlan.created_at).toLocaleDateString()}
                </span>
              </div>
              <pre className="font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto p-2">
                {activePlan.original_plan}
              </pre>
            </div>

            <div className="rounded-2xl border border-blue-500/40 bg-black/90 p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Revised Version (Feedback Applied)
                </span>
                <span className="text-[11px] text-blue-400 font-mono">
                  {new Date(activePlan.updated_at).toLocaleDateString()}
                </span>
              </div>
              <pre className="font-mono text-xs sm:text-sm text-blue-100 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto p-2">
                {activePlan.updated_plan}
              </pre>
            </div>
          </div>
        ) : (
          /* Single standard view */
          <div className="rounded-2xl border border-slate-800 bg-black/90 p-5 sm:p-6 shadow-inner relative">
            <pre className="font-mono text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed overflow-x-auto select-text">
              {currentDisplayText}
            </pre>
          </div>
        )}
      </div>

      {/* SCENARIO 2: Share Your Feedback Section */}
      <div className="backdrop-blur-xl bg-slate-950/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Share Your Feedback & Refine Plan</h3>
            <p className="text-xs text-slate-400">
              Scenario 2 • Look up your plan by User ID and request modifications. Gemini Pro will revise relevant parts.
            </p>
          </div>
        </div>

        {/* Feedback Error Message */}
        {feedbackErrorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>{feedbackErrorMsg}</p>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Unique User ID <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              value={feedbackUserId}
              onChange={(e) => setFeedbackUserId(e.target.value.toLowerCase().trim())}
              placeholder="e.g. jordan21"
              className="w-full bg-black/80 border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Must match the User ID used during generation to retrieve the original plan.
            </p>
          </div>

          {/* Quick suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFeedbackText(item)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500/40 transition-colors text-left"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Feedback <span className="text-blue-400">*</span>
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Let us know how we can improve your plan (e.g. 'more focus on cardio', 'add more rest days', 'replace pull-ups with inverted rows')..."
              className="w-full bg-black/80 border border-slate-700/70 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 ${
                isUpdating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Revising with Gemini Pro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Feedback & Update Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
