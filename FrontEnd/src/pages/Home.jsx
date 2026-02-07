/**
 * HOME PAGE COMPONENT
 * ===================
 * Main dashboard/home page for NutriTrack app
 * Displays greeting, reminders, and notifications
 * Fully modular with reusable sub-components
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GreetingCard from '../components/GreetingCard';
import BabyProfileCard from '../components/BabyProfileCard';
import ReminderCard from '../components/ReminderCard';
import NotificationCard from '../components/NotificationCard';
import NotificationBanner from '../components/NotificationBanner';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import { useBabyContext } from '../context/BabyContext';
import { getReminders, getCurrentUser, getAuthToken, getUserVaccineReminders, getBabies } from '../api';
import { isVaccineDueWithin } from '../utils/vaccineSchedule';
import { calculateBabyAgeDetailed, getBabyAgeMonths } from '../utils/babyAge';
import '../styles/Home.css';
import '../styles/NotificationCard.css';

const HOME_USER_TYPE = 'newParent';

export default function Home() {
  const navigate = useNavigate();
  const { babies, selectedBaby, setSelectedBaby, refreshBabies } = useBabyContext();
  const storedUserType = localStorage.getItem('userType') || localStorage.getItem('selectedStage');
  
  // State for notification permission
  const [_notificationPermission, setNotificationPermission] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    userName: "Loading...",
    trimester: "Baby Age",
    dueDate: null,
    weeksPregnant: null,
    userType: HOME_USER_TYPE,
    babyAgeLabel: 'Age unknown',
    babyAgeMonths: null,
    babyAgeWeeks: null,
    babyDob: null
  });

  // Vaccine data placeholder; should be populated from backend schedule
  const [vaccinesData, setVaccinesData] = useState([]);

  // Initialize notification service and fetch data on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeAndFetchData = async () => {
      try {
        // Check if user is logged in
        const token = getAuthToken();
        if (!token) {
          console.log('No authentication token found');
          if (isMounted) {
            setUserData({
              userName: "Guest",
              trimester: "Baby Age",
              dueDate: null,
              weeksPregnant: null,
              userType: HOME_USER_TYPE,
              babyAgeLabel: 'Age unknown',
              babyAgeMonths: null,
              babyAgeWeeks: null,
              babyDob: null
            });
            setLoading(false);
          }
          return;
        }

        // Initialize notifications
        const hasPermission = await NotificationService.initialize();
        if (isMounted) {
          setNotificationPermission(hasPermission);
        }

        // Fetch current user from backend
        const user = await getCurrentUser();
        console.log('User data fetched:', user);

        const serverUserType = user.user_type || storedUserType;
        if (serverUserType === 'pregnant') {
          localStorage.setItem('userType', 'pregnant');
          navigate('/pregnant/home');
          return;
        }

        localStorage.setItem('userType', HOME_USER_TYPE);
        
        let babyAgeLabel = 'Age unknown';
        let babyAgeMonths = null;
        let babyAgeWeeks = null;
        let babyDob = null;

        // Use selectedBaby from context (already fetched by BabyContext)
        if (selectedBaby && selectedBaby.date_of_birth) {
          babyDob = selectedBaby.date_of_birth;
          const babyAge = calculateBabyAgeDetailed(babyDob);
          babyAgeLabel = babyAge.label;
          babyAgeMonths = getBabyAgeMonths(babyDob);
          babyAgeWeeks = babyAge.weeks;
        }

        if (isMounted) {
          setUserData({
            userName: user.full_name || "User",
            trimester: babyAgeLabel,
            dueDate: null,
            weeksPregnant: null,
            userType: HOME_USER_TYPE,
            babyAgeLabel: babyAgeLabel,
            babyAgeMonths: babyAgeMonths,
            babyAgeWeeks: babyAgeWeeks,
            babyDob: babyDob
          });
        }

        // Fetch reminders and vaccine data
        const [remindersData, vaccineRemindersData] = await Promise.all([
          getReminders().catch(() => []),
          selectedBaby ? getUserVaccineReminders(selectedBaby.id).catch(() => []) : Promise.resolve([])
        ]);
        
        console.log('📅 Fetched general reminders:', remindersData);
        console.log('💉 Fetched vaccine reminders:', vaccineRemindersData);

        if (isMounted) {
          setVaccinesData(vaccineRemindersData || []);

          // Get vaccines due within 7 days for notifications
          const upcomingVaccines = (vaccineRemindersData || []).filter(vaccine => {
            if (vaccine.status === 'completed') return false;
            return isVaccineDueWithin(vaccine.reminder_date, 7);
          });

          // Send system notification if there are vaccines due
          if (upcomingVaccines.length > 0 && hasPermission) {
            setTimeout(() => {
              upcomingVaccines.forEach(vaccine => {
                NotificationService.sendNotification(
                  `💉 ${vaccine.vaccine_name} - Dose ${vaccine.dose_number}`,
                  {
                    body: `Due on ${new Date(vaccine.reminder_date).toDateString()}`,
                    tag: `vaccine-reminder-${vaccine.id}`,
                  }
                );
              });
            }, 1000);
          }
        }
        
        // Combine all reminders
        const allRemindersList = [
          ...remindersData,
          ...vaccineRemindersData
        ];
        
        console.log('📋 All reminders combined:', allRemindersList);
        
        // Filter reminders to show upcoming reminders (today and next 14 days)
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 14);
        
        console.log('🗓️ Filtering reminders from', todayStart.toDateString(), 'to', futureDate.toDateString());
        
        const todayReminders = allRemindersList.filter(r => {
          const reminderDate = new Date(r.reminder_date);
          const isInRange = reminderDate >= todayStart && reminderDate <= futureDate;
          if (!isInRange) {
            console.log('⏭️ Skipping reminder (out of range):', r.title || r.vaccine_name, 'scheduled for', reminderDate.toDateString());
          }
          return isInRange;
        });
        
        console.log('✅ Filtered reminders:', todayReminders);
        
        // Deduplicate reminders
        const reminderMap = new Map();
        todayReminders.forEach(r => {
          const reminderDateTime = new Date(r.reminder_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const key = `${r.title || r.vaccine_name}|${reminderDateTime}`;
          
          if (!reminderMap.has(key)) {
            reminderMap.set(key, r);
          }
        });
        
        const uniqueReminders = Array.from(reminderMap.values());
        uniqueReminders.sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));
        
        console.log('🎯 Final reminders to display:', uniqueReminders);
        
        if (isMounted) {
          setReminders(uniqueReminders.map(r => ({
            id: r.id,
            title: r.title || r.vaccine_name,
            description: r.description || (r.dose_number ? `Dose ${r.dose_number} of ${r.total_doses}` : ''),
            formattedDate: new Date(r.reminder_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: (r.type === 'vaccine' || r.vaccine_name) ? '💉' : '📅'
          })));
          setLoading(false);
        }

      } catch (error) {
        console.error('Error in initializeAndFetchData:', error);
        if (isMounted) {
          setUserData({
            userName: "Guest",
            trimester: "Baby Age",
            dueDate: null,
            weeksPregnant: null,
            userType: HOME_USER_TYPE,
            babyAgeLabel: 'Age unknown',
            babyAgeMonths: null,
            babyAgeWeeks: null,
            babyDob: null
          });
          setLoading(false);
        }
      }
    };

    initializeAndFetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedBaby]); // Only re-run when selectedBaby changes

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
          userType={HOME_USER_TYPE}
          babyAgeLabel={userData.babyAgeLabel}
          babyAgeMonths={userData.babyAgeMonths}
          babyAgeWeeks={userData.babyAgeWeeks}
          babyDob={userData.babyDob}
        />

        {babies && babies.length > 1 && (
          <div className="home-baby-selector">
            <label htmlFor="home-baby-select">Select Baby</label>
            <select
              id="home-baby-select"
              value={selectedBaby?.id || ''}
              onChange={(event) => {
                const selectedId = parseInt(event.target.value, 10);
                const nextBaby = babies.find(b => b.id === selectedId);
                if (nextBaby) {
                  setSelectedBaby(nextBaby);
                }
              }}
            >
              {babies.map((baby) => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Baby Profile Card - Shows age graph and DOB */}
        <BabyProfileCard
          babyAgeLabel={userData.babyAgeLabel}
          babyAgeMonths={userData.babyAgeMonths}
          babyDob={userData.babyDob}
        />

        {/* Vaccine Notifications - Shows alerts for vaccines due within 7 days */}
        <NotificationCard 
          vaccinesData={vaccinesData}
          onDismiss={() => console.log('Notification dismissed')}
        />

        {/* Reminders Section */}
        <ReminderCard 
          reminders={reminders} 
          onReminderDeleted={() => {
            // Refresh reminders after deletion
            window.location.reload();
          }}
        />
      </div>

      {/* Floating Add Baby Button */}
      <button 
        className="floating-add-button"
        onClick={() => navigate('/add-baby')}
        title="Add Baby"
        aria-label="Add Baby"
      >
        +
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Home" userType={HOME_USER_TYPE} />
    </div>
  );
}
