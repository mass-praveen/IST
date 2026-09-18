import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import FloatingCoachAI from './FloatingCoachAI';
import OnboardingTour from '../common/OnboardingTour';
import './MainLayout.css';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="layout-root">
      {/* Top Navbar */}
      <Navbar />

      <OnboardingTour />

      <div className="layout-body">
        {/* Main Page Body Container */}
        <div className="main-viewport-container">
          <AnimatePresence mode="wait">
            <motion.main 
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="main-viewport-content"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      {/* App-wide Floating Coach AI Assistant */}
      <FloatingCoachAI />
    </div>
  );
}
