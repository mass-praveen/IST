import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function OnboardingTour() {
  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem('ist_tour_completed');
    
    if (!hasSeenTour) {
      // Small delay to ensure UI is fully rendered
      const timer = setTimeout(() => {
        const tour = driver({
          showProgress: true,
          animate: true,
          popoverClass: 'ist-tour-theme', // We will style this in index.css
          steps: [
            {
              popover: { 
                title: 'Welcome to Interview Skill Trainer!', 
                description: 'This is your ultimate AI career accelerator. Let us give you a quick 30-second tour of your workspace.',
                position: 'center'
              }
            },
            {
              element: '.header-top-row',
              popover: { 
                title: 'Your Command Center', 
                description: 'From here you can search for topics, check your health status, toggle themes, and access your profile.',
                position: 'bottom'
              }
            },
            {
              element: '.header-nav-bar',
              popover: { 
                title: 'Navigation Hub', 
                description: 'Quickly jump between your Dashboard, Resume Analyzer, MCQ Practice, and the AI Video Interview arena.',
                position: 'bottom'
              }
            },
            {
              element: '.floating-coach-trigger', 
              popover: { 
                title: '24/7 AI Career Coach', 
                description: 'Stuck on a problem or need quick advice? Your AI Coach is always available in the bottom right corner.',
                position: 'left'
              }
            },
            {
              popover: { 
                title: 'You are all set!', 
                description: 'Start by uploading your resume or jumping into a Mock Interview. Good luck!',
                position: 'center'
              }
            }
          ],
          onDestroyStarted: () => {
            if (!tour.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
              localStorage.setItem('ist_tour_completed', 'true');
              tour.destroy();
            }
          },
        });

        tour.drive();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return null; // This component doesn't render any visible DOM on its own
}
