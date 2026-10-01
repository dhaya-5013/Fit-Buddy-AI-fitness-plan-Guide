# FitBuddy – AI Fitness Plan Generator

**FitBuddy** is a full-stack AI-powered fitness planning application engineered as an academic/college-level demonstration. It generates personalized 7-day periodized workout plans and dynamic nutritional/recovery advice using Google Gemini AI models. Athletes can submit iterative feedback to refine their plans, while trainers and admins can audit and manage all athletes through a passcode-protected dashboard.

---

## 🌟 Key Features & AI Model Allocation

1. **Scenario 1 – Personalized 7-Day Plan (Gemini Pro-Tier Model)**
   - Inputs: Full Name, Unique User ID, Age (14–99), Current Weight (30–250 kg), Primary Objective (5 distinct goals), Workout Intensity (Low/Medium/High), Experience Level (Beginner/Intermediate/Advanced), Equipment, and Target Session Time.
   - Generates a structured 7-day workout routine with Warm-up, Main Workout (sets, reps, rest intervals), and Cooldown.
   - Preserves this as the user's **Original Plan**.

2. **Scenario 2 – Feedback Submission & Plan Refinement (Gemini Pro-Tier Model)**
   - Allows users to enter their User ID and feedback (e.g., *"more focus on cardio"*, *"include more rest days"*).
   - Retrieves the Original Plan, sends it with the feedback to Gemini Pro, and updates the relevant sections while preserving existing structure.
   - Saves the result in a separate `updated_plan` field to maintain full audit history.
   - Provides an interactive **Side-by-Side Diff View** between original and updated versions.

3. **Scenario 3 – Practical Nutrition & Recovery Tips (Gemini Flash-Tier Model)**
   - Uses the lightweight and ultra-fast Gemini Flash model.
   - Generates concise, practical nutritional or recovery advice tailored to the user's specific age, weight, and fitness objective.
   - Automatically regenerates whenever the workout plan is modified by feedback.
   - Supports on-demand instant refresh.

4. **Scenario 4 – Trainer & Admin Management Dashboard**
   - Protected behind a passcode screen (`admin123` or `trainer2026`).
   - Summary KPI metrics: Total Athletes, Feedback Revisions, Most Popular Goal, and AI Model status.
   - Searchable and filterable by Name, User ID, Fitness Goal, and Revision status.
   - Inspection modal featuring scrollable monospace side-by-side plan comparisons.
   - Athlete deletion capability with safety confirmation.

---

## 🛠️ Architecture & Core Modules

The codebase is organized into cleanly separated, well-commented modules:

| Function | Module | Purpose |
|---|---|---|
| `generateWorkout()` | `src/services/fitnessApi.ts` | Invokes Gemini Pro-tier model for 7-day workout generation |
| `updateWorkoutPlan()` | `src/services/fitnessApi.ts` | Invokes Gemini Pro-tier model to revise plan based on feedback |
| `generateNutritionTip()` | `src/services/fitnessApi.ts` | Invokes Gemini Flash-tier model for rapid recovery tips |
| `saveUser()` | `src/services/storage.ts` | Saves user details to localStorage (updates if existing) |
| `getUser()` | `src/services/storage.ts` | Retrieves single user profile by User ID |
| `getAllUsers()` | `src/services/storage.ts` | Retrieves list of all registered users |
| `deleteUser()` | `src/services/storage.ts` | Removes user profile and associated workout plans |
| `savePlan()` | `src/services/storage.ts` | Stores original workout plan and nutrition tip |
| `updatePlan()` | `src/services/storage.ts` | Stores updated plan in a separate field |
| `getOriginalPlan()` | `src/services/storage.ts` | Retrieves the immutable original plan for feedback |

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js 18+
- Gemini API key configured in `.env`:
  ```bash
  GEMINI_API_KEY="your-api-key-here"
  ```

### Development Server
```bash
npm install
npm run dev
```
The server boots up at `http://localhost:3000` via Express + Vite middleware, keeping the API key strictly server-side.

### Production Build
```bash
npm run build
npm start
```

---

## 🧪 How to Test Each Scenario (Grading & Presentation Guide)

### Scenario 1: Generate Personalized Plan
1. Open the app on the **1. Create Plan** tab.
2. Click **"✨ Auto-fill Sample Student Profile"** (or enter custom details).
3. Verify that validation triggers if Age < 14 or Weight < 30.
4. Click **Generate Plan with Gemini**.
5. Observe the loading state and verify navigation to the Result page showing the 7-day schedule and Flash-generated nutrition tip.

### Scenario 2: Submit Feedback
1. On the **2. View Plan & Feedback** screen, scroll down to **Share Your Feedback & Refine Plan**.
2. Verify your User ID is populated.
3. Click a suggestion chip like *"More focus on cardio and fat-burning intervals"*, or type your own request.
4. Click **Submit Feedback & Update Plan**.
5. Observe the success message: `✅ Your plan has been updated based on your feedback!`.
6. Toggle between **Updated Plan (Revised)**, **Original Plan**, and **Side-by-Side Diff**.

### Scenario 3: Verify Nutrition Tip
1. Check the **💡 Nutrition & Recovery Tip** card at the top of the plan.
2. Click the refresh button on the right to test on-demand Gemini Flash generation.
3. Verify that submitting new feedback also triggers a fresh nutrition tip relevant to the new focus.

### Scenario 4: Trainer / Admin Dashboard
1. Click **3. Trainer Dashboard** in the navigation header.
2. Enter passcode: `admin123` or `trainer2026`.
3. Check the summary bar showing total athletes and revision rate.
4. Use the search input or goal dropdown to filter records.
5. Click the eye icon (<Eye />) to inspect the side-by-side plan comparison modal.
6. Test deleting a profile or resetting seed demo data.

---

## ⚠️ Medical Disclaimer
*This plan is a general guide. Consult a doctor before starting a new workout routine.*
