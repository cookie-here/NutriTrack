/**
 * APP.JSX - MAIN APPLICATION FILE
 * ================================
 * 
 * PURPOSE:
 * This is the main entry point of our React application.
 * It sets up routing using React Router so users can navigate between different pages.
 * 
 * ROUTING STRUCTURE:
 * 1. /login → Shows Login page (Sign In)
 * 2. /signup → Shows Signup page (Create Account)
 * 3. / (root) → Automatically redirects to /login
 * 
 * HOW ROUTING WORKS:
 * - <Router> wraps the entire app to enable navigation
 * - <Routes> defines all available routes
 * - <Route> sets path and which component to show
 * - <Navigate> redirects from one path to another
 * 
 * FLOW:
 * User visits app → Root path "/" → Gets redirected to "/login" → Login page shows
 * OR
 * User clicks "Sign Up" link → Goes to "/signup" → Signup page shows
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { BabyProvider } from './context/BabyContext'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import AddBaby from './pages/AddBaby'
import Nutrition from './pages/Nutrition'
import Vaccines from './pages/Vaccines'
import Feeding from './pages/Feeding'
import Growth from './pages/Growth'
import DischargeSummary from './pages/documents/DischargeSummary'
import ImmunizationCard from './pages/documents/ImmunizationCard'
import BirthRegistration from './pages/documents/BirthRegistration'
import MedicalRecords from './pages/documents/MedicalRecords'
import Profile from './pages/Profile'
import StageSelect from './pages/StageSelect'
import PregnantHome from './pages/PregnantHome'
import PregnantNutrition from './pages/PregnantNutrition'
import PregnantHealthGuide from './pages/PregnantHealthGuide'
import PregnantVaccines from './pages/PregnantVaccines'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

/**
 * APP COMPONENT
 * =============
 * Main component that sets up routing for the entire application
 */
function App() {
  return (
    <ErrorBoundary>
      <BabyProvider>
        {/* Router: Enables all React Router functionality */}
        <Router>
          {/* Routes: Container for all route definitions */}
          <Routes>
            {/* Route 0: Onboarding - First time user experience */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Route 1: Welcome / Stage selection */}
            <Route path="/welcome" element={<StageSelect />} />
            
            {/* Route 2: Login Page */}
            <Route path="/login" element={<Login />} />
            
            {/* Route 3: Signup Page */}
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/add-baby" element={<AddBaby />} />
              <Route path="/pregnant/home" element={<PregnantHome />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/pregnant/nutrition" element={<PregnantNutrition />} />
              <Route path="/pregnant/health-guide" element={<PregnantHealthGuide />} />
              <Route path="/vaccines" element={<Vaccines />} />
              <Route path="/pregnant/vaccines" element={<PregnantVaccines />} />
              <Route path="/feeding" element={<Feeding />} />
              <Route path="/growth" element={<Growth />} />
              <Route path="/documents/discharge-summary" element={<DischargeSummary />} />
              <Route path="/documents/immunization-card" element={<ImmunizationCard />} />
              <Route path="/documents/birth-registration" element={<BirthRegistration />} />
              <Route path="/documents/medical-records" element={<MedicalRecords />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Route 10: Root Path Redirect */}
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        </Router>
      </BabyProvider>
    </ErrorBoundary>
  )
}

export default App
