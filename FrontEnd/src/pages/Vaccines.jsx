/**
 * VACCINES PAGE COMPONENT
 * =======================
 * Displays vaccine tracker with status tracking
 * Shows completed, pending, and upcoming vaccines
 * Fully modular with reusable sub-components
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VaccinesHeader from '../components/VaccinesHeader';
import VaccineCard from '../components/VaccineCard';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import { getAllVaccines, getUserVaccineReminders, createVaccineReminder, updateVaccineReminderStatus, getCurrentUser } from '../api';
import { getNextDoseDate, isVaccineDueWithin, generateAutomaticVaccineReminders } from '../utils/vaccineSchedule';
import '../styles/Vaccines.css';

export default function Vaccines() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [allVaccines, setAllVaccines] = useState([]);
  const [userReminders, setUserReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSetupDone, setAutoSetupDone] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fetch all available vaccines and user reminders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vaccinesData, remindersData, user] = await Promise.all([
          getAllVaccines(),
          getUserVaccineReminders().catch(() => []),
          getCurrentUser().catch(() => null)
        ]);
        
        setAllVaccines(vaccinesData || []);
        setUserReminders(remindersData || []);
        setCurrentUser(user);

        // Auto-generate reminders if user has baby DOB and no reminders exist
        if (user && user.baby_date_of_birth && (!remindersData || remindersData.length === 0)) {
          await autoCreateVaccineReminders(vaccinesData, user.baby_date_of_birth);
        }
      } catch (error) {
        console.error('Error fetching vaccine data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to check if vaccine is due within 7 days
  const isDueWithinWeek = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 7;
  };

  // Auto-create all vaccine reminders based on baby's birth date
  const autoCreateVaccineReminders = async (vaccines, babyBirthDate) => {
    try {
      if (!babyBirthDate) {
        console.log('No baby birth date available for auto-setup');
        return;
      }

      // Generate reminder data for all vaccines
      const reminderDataList = generateAutomaticVaccineReminders(
        vaccines,
        babyBirthDate,
        'baby'
      );

      if (reminderDataList.length === 0) {
        console.log('No reminders to auto-create');
        return;
      }

      console.log(`Auto-creating ${reminderDataList.length} vaccine reminders...`);

      // Create all reminders
      const createdReminders = [];
      for (const reminderData of reminderDataList) {
        try {
          const created = await createVaccineReminder(reminderData);
          createdReminders.push(created);
        } catch (error) {
          console.error(`Error creating reminder for ${reminderData.vaccine_name}:`, error);
        }
      }

      // Update state with all created reminders
      if (createdReminders.length > 0) {
        setUserReminders(prev => [...prev, ...createdReminders]);

        // Show success notification
        if (Notification.permission === 'granted') {
          NotificationService.sendNotification(
            'Vaccine Schedule Created! 🎉',
            {
              body: `${createdReminders.length} vaccine reminders auto-created based on your baby's birth date.`,
              tag: 'vaccine-auto-setup',
            }
          );
        }

        setAutoSetupDone(true);
      }
    } catch (error) {
      console.error('Error in auto-create vaccine reminders:', error);
    }
  };

  // Calculate stats from user reminders
  const stats = {
    completed: userReminders.filter(v => v.status === 'completed').length,
    pending: userReminders.filter(v => v.status === 'pending').length,
    overdue: userReminders.filter(v => v.status === 'overdue').length
  };

  // Combine available vaccines with user reminders
  const getDisplayVaccines = () => {
    // Deduplicate userReminders by ID - if same ID appears multiple times, keep only the latest one
    const reminderMap = new Map();
    userReminders.forEach(reminder => {
      if (!reminderMap.has(reminder.id) || 
          (reminderMap.get(reminder.id).updatedAt && reminder.updatedAt && 
           new Date(reminder.updatedAt) > new Date(reminderMap.get(reminder.id).updatedAt))) {
        reminderMap.set(reminder.id, reminder);
      } else if (!reminderMap.get(reminder.id).updatedAt) {
        // If no updatedAt, use the first one
        reminderMap.set(reminder.id, reminder);
      }
    });

    const uniqueReminders = Array.from(reminderMap.values());
    
    // Start with all unique user reminders (all doses they've scheduled)
    const displayVaccines = [...uniqueReminders];
    
    // Add available vaccines that don't have ANY reminder yet
    const vaccinesWithReminders = new Set(uniqueReminders.map(r => r.vaccine_name));
    
    allVaccines.forEach(vaccine => {
      // Only add as available if NO reminders exist for this vaccine (no doses at all)
      if (!vaccinesWithReminders.has(vaccine.name)) {
        displayVaccines.push({
          ...vaccine,
          status: 'available',
          isAvailable: true,
        });
      }
    });
    
    return displayVaccines;
  };

  // Filter vaccines based on active tab
  const getFilteredVaccines = () => {
    const displayVaccines = getDisplayVaccines();
    
    // Show only completed vaccines
    if (activeTab === 'completed') {
      return displayVaccines.filter(v => v.status === 'completed');
    }
    
    // Hide completed vaccines from other tabs
    const nonCompletedVaccines = displayVaccines.filter(v => v.status !== 'completed');
    
    if (activeTab === 'mother') {
      return nonCompletedVaccines.filter(v => 
        (v.recipient_type === 'mother' || v.recipient_type === 'both') ||
        (v.recipient === 'mother')
      );
    } else if (activeTab === 'baby') {
      return nonCompletedVaccines.filter(v => 
        (v.recipient_type === 'baby' || v.recipient_type === 'both') ||
        (v.recipient === 'baby')
      );
    }
    return nonCompletedVaccines;
  };

  const filteredVaccines = getFilteredVaccines();

  const handleAddVaccine = async (vaccine) => {
    try {
      // Check if this vaccine already has reminders
      const existingReminders = userReminders.filter(r => r.vaccine_name === vaccine.name);
      if (existingReminders.length > 0) {
        alert(`${vaccine.name} already has reminders scheduled!`);
        return;
      }

      // For first dose, use current date as baseline
      const today = new Date();
      const firstDoseDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const reminderData = {
        vaccine_name: vaccine.name,
        reminder_date: firstDoseDate,
        dose_number: 1,
        total_doses: vaccine.total_doses || 1,
        recipient: vaccine.recipient_type === 'baby' ? 'baby' : 'mother',
        age_due_months: 0,
        description: vaccine.description,
        vaccine_icon: vaccine.emoji,
      };

      const newReminder = await createVaccineReminder(reminderData);
      const updatedReminders = [newReminder];
      
      // Auto-create reminders for all remaining doses
      if (vaccine.total_doses && vaccine.total_doses > 1) {
        for (let i = 2; i <= vaccine.total_doses; i++) {
          const nextDoseDate = getNextDoseDate(vaccine.name, i - 1, firstDoseDate);
          
          if (nextDoseDate) {
            const reminderToCreate = {
              vaccine_name: vaccine.name,
              reminder_date: nextDoseDate,
              dose_number: i,
              total_doses: vaccine.total_doses,
              recipient: vaccine.recipient_type === 'baby' ? 'baby' : 'mother',
              age_due_months: 0,
              description: vaccine.description,
              vaccine_icon: vaccine.emoji,
            };
            
            const createdReminder = await createVaccineReminder(reminderToCreate);
            updatedReminders.push(createdReminder);
          }
        }

        // Show notification about all doses scheduled
        if (Notification.permission === 'granted') {
          NotificationService.sendNotification(
            `${vaccine.name} - All ${vaccine.total_doses} Doses Scheduled`,
            {
              body: `All doses scheduled automatically. Check your calendar for dates.`,
              tag: `vaccine-all-doses-${vaccine.id}`,
            }
          );
        }
      } else {
        // Single dose vaccine
        if (Notification.permission === 'granted') {
          NotificationService.sendNotification(
            `${vaccine.name} Added`,
            {
              body: `Reminder scheduled for ${firstDoseDate.toDateString()}`,
              tag: `vaccine-added-${vaccine.id}`,
            }
          );
        }
      }

      // Update state with all created reminders at once
      setUserReminders(prev => [...prev, ...updatedReminders]);
    } catch (error) {
      console.error('Error adding vaccine reminder:', error);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      const vaccineToMark = userReminders.find(v => v.id === id);
      if (!vaccineToMark) return;

      // Step 1: Mark current dose as completed on backend
      await updateVaccineReminderStatus(id, {
        status: 'completed',
        last_dose_date: new Date().toISOString(),
      });

      // Step 2: Update local state - mark current dose as completed
      const updatedReminders = userReminders.map(v => 
        v.id === id ? { ...v, status: 'completed' } : v
      );

      // Send notification when vaccine is completed
      if (Notification.permission === 'granted') {
        NotificationService.sendNotification(
          `✓ ${vaccineToMark.vaccine_name} Completed`,
          {
            body: `Great! You've completed the ${vaccineToMark.vaccine_name} vaccine.`,
            tag: `vaccine-completed-${id}`,
            icon: '✓'
          }
        );
      }

      // Step 3: Check if next dose needs to be created
      const currentDose = vaccineToMark.dose_number || 1;
      const totalDoses = vaccineToMark.total_doses || 1;

      if (currentDose < totalDoses) {
        // Check if next dose already exists
        const nextDoseExists = updatedReminders.some(
          r => r.vaccine_name === vaccineToMark.vaccine_name && 
               r.dose_number === currentDose + 1
        );

        if (!nextDoseExists) {
          // Calculate next dose date
          const nextDoseDate = getNextDoseDate(
            vaccineToMark.vaccine_name,
            currentDose,
            new Date().toISOString()
          );

          if (nextDoseDate) {
            // Create next dose reminder
            const nextDoseReminder = {
              vaccine_name: vaccineToMark.vaccine_name,
              reminder_date: nextDoseDate.toISOString(),
              dose_number: currentDose + 1,
              total_doses: totalDoses,
              recipient: vaccineToMark.recipient,
              age_due_months: 0,
              description: vaccineToMark.description,
              vaccine_icon: vaccineToMark.vaccine_icon,
            };

            const newReminder = await createVaccineReminder(nextDoseReminder);
            updatedReminders.push(newReminder);

            // Notify about next dose
            if (Notification.permission === 'granted') {
              NotificationService.sendNotification(
                `${vaccineToMark.vaccine_name} - Dose ${currentDose + 1} Scheduled`,
                {
                  body: `Next dose scheduled for ${nextDoseDate.toDateString()}`,
                  tag: `vaccine-next-dose-${vaccineToMark.vaccine_name}-${currentDose + 1}`,
                }
              );
            }
          }
        }
      }

      // Step 4: Update state ONCE with all changes
      setUserReminders(updatedReminders);
    } catch (error) {
      console.error('Error marking vaccine as done:', error);
    }
  };

  if (loading) {
    return (
      <div className="vaccines-container">
        <VaccinesHeader onBack={() => navigate('/home')} />
        <div className="vaccines-main" style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading vaccines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccines-container">
      {/* Vaccines Header */}
      <VaccinesHeader onBack={() => navigate('/home')} />

      {/* Main Content */}
      <div className="vaccines-main">
        
        {/* Vaccination Stats */}
        <div className="vaccine-stats">
          <div className="vaccine-stat-card">
            <p className="vaccine-stat-number">✓</p>
            <p className="vaccine-stat-label">{stats.completed} Completed</p>
          </div>
          <div className="vaccine-stat-card">
            <p className="vaccine-stat-number">⏱</p>
            <p className="vaccine-stat-label">{stats.pending} Pending</p>
          </div>
          <div className="vaccine-stat-card">
            <p className="vaccine-stat-number">{stats.overdue}</p>
            <p className="vaccine-stat-label">Overdue</p>
          </div>
        </div>

        {/* Auto-Generate Button - Show if no reminders exist */}
        {userReminders.length === 0 && allVaccines.length > 0 && (
          <div style={{ 
            backgroundColor: '#e8f5e9', 
            border: '2px solid #4caf50',
            borderRadius: '10px',
            padding: '16px',
            margin: '16px 0',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 12px 0', color: '#333', fontWeight: '500' }}>
              📅 No vaccines scheduled yet?
            </p>
            <button
              onClick={() => {
                if (currentUser && currentUser.baby_date_of_birth) {
                  autoCreateVaccineReminders(allVaccines, currentUser.baby_date_of_birth);
                } else {
                  alert('Please complete your profile with your baby\'s birth date first.');
                  navigate('/profile');
                }
              }}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🚀 Auto-Generate Vaccine Schedule
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="vaccine-tabs">
          <button 
            className={`vaccine-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Vaccines
          </button>
          <button 
            className={`vaccine-tab-btn ${activeTab === 'mother' ? 'active' : ''}`}
            onClick={() => setActiveTab('mother')}
          >
            Mother
          </button>
          <button 
            className={`vaccine-tab-btn ${activeTab === 'baby' ? 'active' : ''}`}
            onClick={() => setActiveTab('baby')}
          >
            Baby
          </button>
          <button 
            className={`vaccine-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✓ Completed
          </button>
        </div>

        {/* Vaccines List */}
        <div className="vaccine-cards-list">
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map((vaccine) => {
              // For available vaccines (not yet scheduled)
              if (vaccine.isAvailable) {
                return (
                  <div key={`available-${vaccine.id}`} className="vaccine-card available">
                    <div className="vaccine-card-header">
                      <div className="vaccine-card-icon">{vaccine.emoji}</div>
                      <div className="vaccine-card-title-section">
                        <h3 className="vaccine-card-title">{vaccine.name}</h3>
                        <span className="vaccine-card-status available">
                          ➕ Available
                        </span>
                      </div>
                    </div>
                    <div className="vaccine-card-details">
                      <div className="vaccine-detail-item">
                        <span className="vaccine-detail-label">ℹ</span>
                        <span className="vaccine-detail-value">{vaccine.description}</span>
                      </div>
                      <div className="vaccine-detail-item">
                        <span className="vaccine-detail-label">💉</span>
                        <span className="vaccine-detail-value">
                          {vaccine.total_doses} dose{vaccine.total_doses !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="vaccine-card-action">
                      <button 
                        className="vaccine-action-btn add-vaccine"
                        onClick={() => handleAddVaccine(vaccine)}
                      >
                        Add Reminder
                      </button>
                    </div>
                  </div>
                );
              }

              // For scheduled vaccines (with reminders)
              return (
                <VaccineCard
                  key={`reminder-${vaccine.id}`}
                  id={vaccine.id}
                  name={vaccine.vaccine_name}
                  emoji={vaccine.vaccine_icon || '💉'}
                  description={vaccine.description}
                  dueDate={vaccine.reminder_date}
                  babyBirthDate={currentUser?.baby_date_of_birth}
                  status={vaccine.status}
                  forPerson={vaccine.recipient === 'baby' ? 'Baby' : 'Mother'}
                  details={vaccine.total_doses ? `${vaccine.dose_number || 1} of ${vaccine.total_doses}` : 'Single dose'}
                  isDueWithinWeek={isDueWithinWeek(vaccine.reminder_date)}
                  onMarkDone={() => handleMarkDone(vaccine.id)}
                />
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <p>No vaccines found</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Vaccines" />
    </div>
  );
}
