import React from 'react';
import { X, BookOpen, CheckCircle, Cpu, Database, Shield, Zap, Layers, Sparkles, Eye } from 'lucide-react';

interface ProjectGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectGuideModal: React.FC<ProjectGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                FitBuddy – College Project Guide & Testing README
              </h2>
              <p className="text-xs text-slate-400">
                AI Fitness Plan Generator • Gemini Pro & Gemini Flash Architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="p-4 rounded-2xl bg-black/70 border border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              1. Project Overview & Architecture
            </h3>
            <p className="text-xs text-slate-400">
              FitBuddy is an academic-grade AI health and wellness application engineered with a clean full-stack TypeScript architecture. It generates structured 7-day workout plans, accommodates user feedback through AI plan refinement, issues nutritional/recovery tips, and provides a protected trainer/admin management dashboard.
            </p>
          </div>

          {/* Section 2: AI Model Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                <Cpu className="w-4 h-4" />
                Gemini Pro-Tier Model
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Utilized for <strong>Workout Plan Generation</strong> and <strong>Feedback-based Plan Updates</strong>.
              </p>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                <li>Understands exercise physiology, periodization, and recovery splits.</li>
                <li>Takes 7 user variables: age, weight, goal, intensity, experience, equipment, session time.</li>
                <li>Refines relevant sections when user feedback is provided while preserving existing schedule.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <Zap className="w-4 h-4" />
                Gemini Flash-Tier Model
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Utilized for <strong>Nutrition & Recovery Tips</strong>.
              </p>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                <li>High speed and lightweight response generation.</li>
                <li>Synthesizes user metrics with plan objectives (e.g. caloric deficit vs hypertrophy).</li>
                <li>Automatically regenerates when a plan is updated through feedback.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Scenario Testing Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              2. How to Test Each Scenario (Examiner / Grader Checklist)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                <span className="font-bold text-blue-400">Scenario 1 – Personalized Plan (Home Form):</span>
                <p className="text-slate-400 mt-1">
                  1. Navigate to <strong>1. Create Plan</strong> tab.<br />
                  2. Click <em>"✨ Auto-fill Sample Student Profile"</em> or fill the 4 sections manually (Name, User ID, Age, Weight, Goal, Intensity, Experience, Equipment, Time).<br />
                  3. Click <strong>Generate Plan with Gemini</strong>. The app saves the user in browser storage, generates a 7-day schedule with Gemini Pro, generates a nutrition tip with Gemini Flash, and navigates to the Result page.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                <span className="font-bold text-blue-400">Scenario 2 – Feedback Submission (Result Page):</span>
                <p className="text-slate-400 mt-1">
                  1. On the <strong>2. View Plan & Feedback</strong> screen, scroll to <em>"Share Your Feedback & Refine Plan"</em>.<br />
                  2. Confirm your User ID (prefilled).<br />
                  3. Enter feedback like <em>"more focus on cardio"</em> or click one of the quick suggestions.<br />
                  4. Click <strong>Submit Feedback & Update Plan</strong>.<br />
                  5. The app verifies the original plan exists, sends both to Gemini Pro, stores the revision in a <em>separate field</em>, displays the success banner, and lets you view the original, revised, and side-by-side diff!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                <span className="font-bold text-blue-400">Scenario 3 – Nutrition Tip:</span>
                <p className="text-slate-400 mt-1">
                  1. Observe the <strong>"💡 Nutrition & Recovery Tip"</strong> card rendered right above the workout plan.<br />
                  2. Notice the tip is tailored to the goal (e.g. protein intake for muscle gain).<br />
                  3. Click the refresh icon to re-query Gemini Flash on demand.<br />
                  4. Notice the tip automatically updates when feedback changes the workout routine.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-slate-800">
                <span className="font-bold text-blue-400">Scenario 4 – Admin / Trainer Dashboard:</span>
                <p className="text-slate-400 mt-1">
                  1. Click <strong>3. Trainer Dashboard</strong> in the top navigation.<br />
                  2. Enter passcode: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">admin123</code> (or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">trainer2026</code>).<br />
                  3. Review the KPI metrics bar (Total Users, Feedback Revisions, Top Objective).<br />
                  4. Search or filter by name or goal.<br />
                  5. Click the eye icon (<Eye className="w-3 h-3 inline" />) to open the side-by-side comparison modal.<br />
                  6. Test the delete button to delete a user profile with confirmation dialog.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Required Modular Functions */}
          <div className="p-4 rounded-2xl bg-black/70 border border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              3. Modular Function Implementation Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">generateWorkout()</span>: calls Gemini Pro
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">generateNutritionTip()</span>: calls Gemini Flash
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">updateWorkoutPlan()</span>: feedback revision
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">saveUser()</span>: browser storage persist
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">getUser()</span>: lookup by User ID
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">getAllUsers()</span>: table & audit records
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">savePlan()</span>: saves original plan
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">updatePlan()</span>: saves in separate field
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">getOriginalPlan()</span>: retrieves original
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-black/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            FitBuddy Academic Project • Full-Stack Vite + Express + @google/genai
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
