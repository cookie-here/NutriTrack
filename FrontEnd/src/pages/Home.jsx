/**
 * HOME PAGE COMPONENT
 * ===================
 * Main dashboard/home page for NutriTrack app
 * Displays greeting, reminders, quick access, and daily tips
 * Fully modular with reusable sub-components
 */

import { useEffect, useState } from 'react';
import GreetingCard from '../components/GreetingCard';
import ReminderCard from '../components/ReminderCard';
import QuickAccessGrid from '../components/QuickAccessGrid';
import TipCard from '../components/TipCard';
import BottomNavigation from '../components/BottomNavigation';
import { getDailyTip } from '../api';
import '../styles/Home.css';

export default function Home() {
  const [tip, setTip] = useState('Stay hydrated! Aim for 8-10 glasses of water daily to support your baby\'s development.');
  const [tipError, setTipError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getDailyTip()
      .then((data) => {
        if (isMounted && data?.tip) {
          setTip(data.tip);
        }
      })
      .catch((err) => {
        if (isMounted) setTipError(err.message || 'Could not load tip');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sample data - would come from props or API in production
  const userData = {
    userName: "Sarah Johnson",
    trimester: "Trimester 2",
    dueDate: "2025-06-15"
  };

  const reminders = [
    {
      id: 1,
      title: "Vaccine Due Tomorrow",
      description: "2nd dose of Hepatitis B",
      icon: "💉"
    },
    {
      id: 2,
      title: "Doctor Appointment",
      description: "Dec 5, 2025 at 10:00 AM",
      icon: "📅"
    }
  ];

  const quickAccessItems = [
    { id: 1, title: "Nutrition Tips", icon: "🍎", color: "#e8f5e9" },
    { id: 2, title: "Vaccines", icon: "💉", color: "#e3f2fd" },
    { id: 3, title: "Feeding Guide", icon: "👶", color: "#fce4ec" },
    { id: 4, title: "Growth", icon: "📈", color: "#f3e5f5" }
  ];

  return (
    <div className="home-container">
      {/* Main Content */}
      <div className="home-content">
        
        {/* Greeting Section */}
        <GreetingCard 
          userName={userData.userName}
          trimester={userData.trimester}
          dueDate={userData.dueDate}
        />

        {/* Reminders Section */}
        <ReminderCard reminders={reminders} />

        {/* Quick Access Section */}
        <QuickAccessGrid items={quickAccessItems} />

        {/* Daily Tip Section */}
        <TipCard 
          title="Today's Tip"
          content={tipError ? `Tip unavailable: ${tipError}` : tip}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Home" />
    </div>
  );
}
