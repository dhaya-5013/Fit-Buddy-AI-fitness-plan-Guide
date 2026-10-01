import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlanForm } from './components/PlanForm';
import { ResultView } from './components/ResultView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectGuideModal } from './components/ProjectGuideModal';
import { Footer } from './components/Footer';
import { User, WorkoutPlanRecord } from './types/fitness';
import {
  seedInitialDataIfNeeded,
  getAllUsers,
  getPlanByUserId,
} from './services/storage';

// Import generated dark gym atmospheric background image
import gymBgImage from './assets/images/gym_background_1790763550342.jpg';

export default function App() {
  // Navigation active tab: 'form' | 'result' | 'admin'
  const [activeTab, setActiveTab] = useState<'form' | 'result' | 'admin'>('form');

  // Currently selected / generated user & plan
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlanRecord | null>(null);

  // Project guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Seed sample data on startup so evaluators can immediately test admin & results
  useEffect(() => {
    seedInitialDataIfNeeded();

    // If an initial user exists, set them as default active user
    const existingUsers = getAllUsers();
    if (existingUsers.length > 0) {
      const firstUser = existingUsers[0];
      const firstPlan = getPlanByUserId(firstUser.id);
      setCurrentUser(firstUser);
      if (firstPlan) {
        setCurrentPlan(firstPlan);
      }
    }
  }, []);

  // When a plan is successfully generated from the form
  const handlePlanGenerated = (user: User, planRecord: WorkoutPlanRecord) => {
    setCurrentUser(user);
    setCurrentPlan(planRecord);
    setActiveTab('result');
  };

  // When a user selects a plan from the result view user-picker
  const handleSelectUserPlan = (user: User, plan: WorkoutPlanRecord) => {
    setCurrentUser(user);
    setCurrentPlan(plan);
  };

  // When admin clicks "Inspect on User Result Page"
  const handleAdminSelectUser = (user: User, plan: WorkoutPlanRecord) => {
    setCurrentUser(user);
    setCurrentPlan(plan);
    setActiveTab('result');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative font-sans selection:bg-blue-600 selection:text-white">
      {/* Dark Gym Background Image with Overlays */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center opacity-10 filter blur-[1px]"
        style={{ backgroundImage: `url(${gymBgImage})` }}
      />
      {/* Gradient Ambient Overlays (Dark Blue & Deep Black) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-slate-950/90 via-black to-black" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Container Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasActivePlan={Boolean(currentPlan)}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {activeTab === 'form' && (
            <PlanForm onPlanGenerated={handlePlanGenerated} />
          )}

          {activeTab === 'result' && (
            <ResultView
              currentUser={currentUser}
              currentPlan={currentPlan}
              onSelectUserPlan={handleSelectUserPlan}
              onNavigateToForm={() => setActiveTab('form')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard onSelectUserForViewing={handleAdminSelectUser} />
          )}
        </main>

        {/* Medical Disclaimer & Academic Footer */}
        <Footer />
      </div>

      {/* College Project Guide Modal */}
      <ProjectGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
