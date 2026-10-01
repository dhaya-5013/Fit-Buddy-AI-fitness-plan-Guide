import React from 'react';
import { AlertCircle, Dumbbell, Heart, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-900 bg-black/95 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Required Medical Disclaimer */}
        <div className="inline-flex items-center justify-center gap-2 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 max-w-xl text-center">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
          <p className="font-medium text-xs">
            <strong>Medical Disclaimer:</strong> This plan is a general guide. Consult a doctor before starting a new workout routine.
          </p>
        </div>

        {/* Project Details */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Dumbbell className="w-4 h-4 text-blue-400" />
            FitBuddy – AI Fitness Plan Generator
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>College Project Edition</span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span>Powered by Gemini Pro & Gemini Flash</span>
        </div>

        <p className="text-[11px] text-slate-600">
          Built with React 19, TypeScript, Tailwind CSS, Express, and @google/genai SDK.
        </p>
      </div>
    </footer>
  );
};
