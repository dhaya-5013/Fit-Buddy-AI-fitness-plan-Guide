import React from 'react';
import { Dumbbell, FileText, ShieldCheck, BookOpen, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'form' | 'result' | 'admin';
  setActiveTab: (tab: 'form' | 'result' | 'admin') => void;
  hasActivePlan: boolean;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActivePlan,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand with Dark Blue Theme */}
          <div
            onClick={() => setActiveTab('form')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-200">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  FitBuddy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  AI Trainer
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                AI Fitness Plan Generator • Gemini Powered
              </p>
            </div>
          </div>

          {/* Nav Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">1. Create Plan</span>
              <span className="sm:hidden">Create</span>
            </button>

            <button
              onClick={() => setActiveTab('result')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'result'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">2. View Plan & Feedback</span>
              <span className="sm:hidden">Plan</span>
              {hasActivePlan && (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse hidden sm:inline-block" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">3. Trainer Dashboard</span>
              <span className="md:hidden">Dashboard</span>
            </button>

            {/* College Project Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors ml-1"
              title="Project Guide & Architecture"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Project Guide</span>
              <Sparkles className="w-3 h-3 text-sky-400" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
