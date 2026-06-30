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
import LoadingSpinner from '../components/LoadingSpinner';
import BottomNavigation from '../components/BottomNavigation';
import { useBabyContext } from '../context/BabyContext';
import { getCurrentUser, getAuthToken, getReminders, getUserVaccineReminders } from '../api';
import { calculateBabyAgeDetailed, getBabyAgeMonths } from '../utils/babyAge';
import '../styles/Home.css';

const HOME_USER_TYPE = 'newParent';

export default function Home() {
  const navigate = useNavigate();
  const { babies, selectedBaby, setSelectedBaby, refreshBabies } = useBabyContext();
  const storedUserType = localStorage.getItem('userType') || localStorage.getItem('selectedStage');
  
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
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

  useEffect(() => {
    let isMounted = true;
    const initializeAndFetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          if (isMounted) {
            setUserData(prev => ({ ...prev, userName: "Guest" }));
            setLoading(false);
          }
          return;
        }

        const user = await getCurrentUser();
        const serverUserType = user.user_type || storedUserType;
        if (serverUserType === 'pregnant') {
          localStorage.setItem('userType', 'pregnant');
          navigate('/pregnant/home');
          return;
        }

        localStorage.setItem('userType', HOME_USER_TYPE);
        
        let babyAgeLabel = 'Age unknown', babyAgeMonths = null, babyAgeWeeks = null, babyDob = null;
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

        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Error in initializeAndFetchData:', error);
        if (isMounted) setLoading(false);
      }
    };
    initializeAndFetchData();
    return () => { isMounted = false; };
  }, [selectedBaby, navigate, storedUserType]); 

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const [remindersData, vaccineReminders] = await Promise.all([
        getReminders().catch(() => []),
        selectedBaby ? getUserVaccineReminders(selectedBaby.id).catch(() => []) : Promise.resolve([]),
      ]);
      const all = [
        ...vaccineReminders.map(v => ({ ...v, type: 'vaccine', icon: '💉' })),
        ...remindersData.map(r => ({ ...r, type: 'reminder', icon: '📅' })),
      ];
      all.sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date));
      setNotifications(all);
    } catch (e) {
      console.error(e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="home-container">
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Main Content */}
      <div className="home-content">

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
          onNotificationClick={handleOpenNotifications}
        />

        {/* Baby Profile Card */}
        <BabyProfileCard
          babyAgeLabel={userData.babyAgeLabel}
          babyDob={userData.babyDob}
        />

        {/* Important Baby Documents */}
        <div className="doc-section">
          <div className="doc-section-header">
            <h2>Important Baby Documents</h2>
          </div>
          <div className="doc-grid">
            <div className="doc-card" onClick={() => navigate('/documents/discharge-summary')}>
              <span className="doc-icon">🏥</span>
              <span className="doc-card-title">Hospital<br/>Discharge Summary</span>
            </div>
            <div className="doc-card" onClick={() => navigate('/documents/immunization-card')}>
              <span className="doc-icon">💉</span>
              <span className="doc-card-title">Immunization<br/>Card (खोप कार्ड)</span>
            </div>
            <div className="doc-card" onClick={() => navigate('/documents/birth-registration')}>
              <span className="doc-icon">📜</span>
              <span className="doc-card-title">Birth<br/>Registration<br/>(जन्म दर्ता)</span>
            </div>
            <div className="doc-card" onClick={() => navigate('/documents/medical-records')}>
              <span className="doc-icon">📁</span>
              <span className="doc-card-title">Medical<br/>Records</span>
            </div>
          </div>
        </div>

      </div>

      {/* Notification Modal */}
      {showNotifications && (
        <div className="notif-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notif-panel" onClick={e => e.stopPropagation()}>
            <div className="notif-panel-header">
              <h2>🔔 Notifications</h2>
              <button className="notif-close-btn" onClick={() => setShowNotifications(false)}>✕</button>
            </div>
            <div className="notif-panel-body">
              {notifLoading ? (
                <p className="notif-empty">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="notif-empty">No notifications yet.</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={n.id || i} className="notif-item">
                    <span className="notif-icon">{n.icon}</span>
                    <div className="notif-content">
                      <p className="notif-title">{n.title || n.vaccine_name}</p>
                      {n.description && <p className="notif-desc">{n.description}</p>}
                      {(n.dose_number != null) && (
                        <p className="notif-desc">Dose {n.dose_number}{n.total_doses ? ` of ${n.total_doses}` : ''}</p>
                      )}
                      <p className="notif-date">
                        {new Date(n.reminder_date || n.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                    {n.status === 'completed' && <span className="notif-status">✅</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
