/**
 * HOME PAGE COMPONENT
 * ===================
 * Main dashboard/home page for NutriTrack app
 * Displays greeting, reminders, and daily tips
 * Fully modular with reusable sub-components
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GreetingCard from '../components/GreetingCard';
import ReminderCard from '../components/ReminderCard';
import NotificationCard from '../components/NotificationCard';
import NotificationBanner from '../components/NotificationBanner';
import TipCard from '../components/TipCard';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import { getReminders, getDailyTip, getCurrentUser, getAuthToken } from '../api';
import '../styles/Home.css';
import '../styles/NotificationCard.css';

const DAY_MS = 24 * 60 * 60 * 1000;

// Derive trimester using a 40-week gestation counted from estimated conception (LMP) based on due date
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

// Derive baby age in weeks/months from date of birth
const calculateBabyAge = (dobString) => {
  if (!dobString) return { label: 'Age unknown', monthsValue: null, weeks: null };

  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return { label: 'Age unknown', monthsValue: null, weeks: null };

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedDob = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());

  const daysOld = Math.floor((normalizedToday - normalizedDob) / DAY_MS);
  if (daysOld < 0) return { label: 'Baby not born yet', monthsValue: 0, weeks: 0 };

  const weeks = Math.floor(daysOld / 7);
  const monthsValue = Math.min(24, daysOld / 30.44); // cap at 24 months for UI

  let label;
  if (monthsValue < 1) {
    label = `${weeks}w`;
  } else {
    const wholeMonths = Math.floor(monthsValue);
    const remainingDays = Math.floor(daysOld - wholeMonths * 30.44);
    label = `${wholeMonths}m${remainingDays > 0 ? ` ${remainingDays}d` : ''}`;
  }

  return { label, monthsValue, weeks };
};

export default function Home() {
  const navigate = useNavigate();
  // State for notification permission
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [tip, setTip] = useState("Stay hydrated! Drink at least 8 glasses of water daily.");
  const [tipError, setTipError] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    userName: "Loading...",
    trimester: "Calculating...",
    dueDate: null,
    weeksPregnant: null,
    userType: 'pregnant',
    babyAgeLabel: 'Age unknown',
    babyAgeMonths: null,
    babyAgeWeeks: null,
    babyDob: null
  });

  // Vaccine data placeholder; should be populated from backend schedule
  const vaccinesData = [];

  // Initialize notification service on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await NotificationService.initialize();
      setNotificationPermission(hasPermission);

      // Get vaccines due within 7 days
      const upcomingVaccines = vaccinesData.filter(vaccine => {
        if (vaccine.status === 'taken') return false;
        return NotificationService.isDueWithinWeek(vaccine.dueDate);
      });

      // Send system notification if there are vaccines due
      if (upcomingVaccines.length > 0 && hasPermission) {
        // Add a small delay to ensure app is ready
        setTimeout(() => {
          NotificationService.sendVaccineReminders(upcomingVaccines);
        }, 1000);
      }
    };

    const fetchData = async () => {
      try {
        // Check if user is logged in
        const token = getAuthToken();
        if (!token) {
          console.log('No authentication token found');
          setUserData({
            userName: "Guest",
            trimester: "Unknown",
            dueDate: null,
            weeksPregnant: null,
            userType: 'pregnant',
            babyAgeLabel: 'Age unknown',
            babyAgeMonths: null,
            babyAgeWeeks: null,
            babyDob: null
          });
          setLoading(false);
          return;
        }

        // Fetch current user from backend
        const user = await getCurrentUser();
        console.log('User data fetched:', user);

        const userType = user.user_type || 'pregnant';
        localStorage.setItem('userType', userType);

        const { trimester, weeksPregnant } = calculateTrimester(user.due_date);
        const babyAge = calculateBabyAge(user.baby_date_of_birth);

        setUserData({
          userName: user.full_name || "User",
          trimester: userType === 'pregnant' ? trimester : babyAge.label,
          dueDate: userType === 'pregnant' ? user.due_date : user.baby_date_of_birth,
          weeksPregnant: userType === 'pregnant' ? weeksPregnant : null,
          userType,
          babyAgeLabel: babyAge.label,
          babyAgeMonths: babyAge.monthsValue,
          babyAgeWeeks: babyAge.weeks,
          babyDob: user.baby_date_of_birth
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          userName: "Guest",
          trimester: "Unknown",
          dueDate: null,
          weeksPregnant: null,
          userType: 'pregnant',
          babyAgeLabel: 'Age unknown',
          babyAgeMonths: null,
          babyAgeWeeks: null,
          babyDob: null
        });
      }

      try {
        // Fetch reminders from backend
        const remindersData = await getReminders();
        setReminders(remindersData.map(r => ({
          id: r.id,
          title: r.title,
          description: new Date(r.reminder_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          icon: r.type === 'vaccine' ? '💉' : '📅'
        })));
      } catch (error) {
        console.error('Error fetching reminders:', error);
        // Keep empty array if fetch fails
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

        {/* Greeting Section */}
        <GreetingCard 
          userName={userData.userName}
          trimester={userData.trimester}
          dueDate={userData.dueDate}
          weeksPregnant={userData.weeksPregnant}
          userType={userData.userType}
          babyAgeLabel={userData.babyAgeLabel}
          babyAgeMonths={userData.babyAgeMonths}
          babyAgeWeeks={userData.babyAgeWeeks}
          babyDob={userData.babyDob}
        />

        {/* Vaccine Notifications - Shows alerts for vaccines due within 7 days */}
        <NotificationCard 
          vaccinesData={vaccinesData}
          onDismiss={() => console.log('Notification dismissed')}
        />

        {/* Reminders Section */}
        <ReminderCard reminders={reminders} />

        {/* Daily Tip Section */}
        <TipCard 
          title="Today's Tip"
          content={tipError ? `Tip unavailable: ${tipError}` : tip}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Home" userType={userData.userType} />
    </div>
  );
}
