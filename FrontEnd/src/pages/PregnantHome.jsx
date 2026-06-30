/**
 * PREGNANT HOME PAGE COMPONENT
 * ============================
 * Minimal and clean home page specifically for pregnant users
 * Displays pregnancy progress, reminders, and daily tips
 * Pregnancy-focused information only
 */

import { useEffect, useState } from 'react';
import GreetingCard from '../components/GreetingCard';
import ReminderCard from '../components/ReminderCard';
import NotificationBanner from '../components/NotificationBanner';
import TipCard from '../components/TipCard';
import PregnancyGuidePreview from '../components/PregnancyGuidePreview';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import { getReminders, getDailyTip, getCurrentUser, getAuthToken } from '../api';
import '../styles/Home.css';

const DAY_MS = 24 * 60 * 60 * 1000;

// Calculate trimester from due date
const calculateTrimester = (dueDateString) => {
  if (!dueDateString) return { trimester: 'Unknown', weeksPregnant: null };

  const dueDate = new Date(dueDateString);
  if (Number.isNaN(dueDate.getTime())) return { trimester: 'Unknown', weeksPregnant: null };

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const estimatedLmp = new Date(dueDate.getTime() - 280 * DAY_MS); // 40 weeks before due date
  const normalizedLmp = new Date(estimatedLmp.getFullYear(), estimatedLmp.getMonth(), estimatedLmp.getDate());

  const daysPregnant = Math.floor((normalizedToday - normalizedLmp) / DAY_MS);
  if (daysPregnant < 0) return { trimester: 'Unknown', weeksPregnant: 0 };

  const weeksPregnant = Math.min(40, Math.floor(daysPregnant / 7));

  if (weeksPregnant < 13) {
    return { trimester: 'Trimester 1', weeksPregnant };
  }
  if (weeksPregnant < 28) {
    return { trimester: 'Trimester 2', weeksPregnant };
  }
  return { trimester: 'Trimester 3', weeksPregnant };
};

export default function PregnantHome() {
  
  const [_notificationPermission, setNotificationPermission] = useState(false);
  const [tip, setTip] = useState("Stay hydrated! Drink at least 8 glasses of water daily.");
  const [tipError, setTipError] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    userName: "Loading...",
    trimester: "Calculating...",
    dueDate: null,
    weeksPregnant: null,
    userType: 'pregnant'
  });

  // Initialize notification service on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await NotificationService.initialize();
      setNotificationPermission(hasPermission);
    };

    const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.log('No authentication token found');
          setUserData({
            userName: "Guest",
            trimester: "Unknown",
            dueDate: null,
            weeksPregnant: null,
            userType: 'pregnant'
          });
          setLoading(false);
          return;
        }

        // Fetch current user from backend
        const user = await getCurrentUser();
        const { trimester, weeksPregnant } = calculateTrimester(user.due_date);
        
        setUserData({
          userName: user.full_name || "Expecting Mom",
          trimester: trimester,
          dueDate: user.due_date,
          weeksPregnant: weeksPregnant,
          userType: 'pregnant'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          userName: "Guest",
          trimester: "Unknown",
          dueDate: null,
          weeksPregnant: null,
          userType: 'pregnant'
        });
      }

      try {
        // Fetch pregnancy-related reminders
        const remindersData = await getReminders().catch(() => []);
        
        // Filter reminders to show only today's reminders
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        const todayReminders = remindersData.filter(r => {
          const reminderDate = new Date(r.reminder_date);
          return reminderDate >= todayStart && reminderDate <= todayEnd;
        });
        
        setReminders(todayReminders.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          formattedDate: new Date(r.reminder_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          icon: '📅'
        })));
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }

      try {
        // Fetch daily tip from backend
        const tipData = await getDailyTip();
        setTip(tipData.tip);
      } catch (error) {
        console.error('Error fetching daily tip:', error);
        setTipError(error.message);
      }
      
      setLoading(false);
    };

    initializeNotifications();
    fetchData();
  }, []);

  return (
    <div className="home-container">
      {/* Main Content */}
      <div className="home-content">
        
        {/* Notification Permission Banner */}
        <NotificationBanner 
          onPermissionChange={(granted) => setNotificationPermission(granted)}
        />

        {/* Greeting Section - Pregnancy specific */}
        <GreetingCard 
          userName={userData.userName}
          trimester={userData.trimester}
          dueDate={userData.dueDate}
          weeksPregnant={userData.weeksPregnant}
          userType="pregnant"
        />

        {/* Reminders Section */}
        <ReminderCard reminders={reminders} />

        {/* Daily Tip Section */}
        <TipCard 
          title="Today's Pregnancy Tip"
          content={tipError ? `Tip unavailable: ${tipError}` : tip}
        />

        <PregnancyGuidePreview />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Home" userType="pregnant" />
    </div>
  );
}
