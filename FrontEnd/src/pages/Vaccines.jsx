/**
 * VACCINES PAGE COMPONENT
 * =======================
 * Displays vaccine tracker with status tracking
 * Shows completed, pending, and upcoming vaccines
 * Fully modular with reusable sub-components
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VaccinesHeader from '../components/VaccinesHeader';
import VaccineCard from '../components/VaccineCard';
import KhopCard from '../components/KhopCard';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import { useBabyContext } from '../context/BabyContext';
import { getAllVaccines, getUserVaccineReminders, createVaccineReminder, updateVaccineReminderStatus, getCurrentUser } from '../api';
import vaccineScheduleConfig, { getNextDoseDate, generateAutomaticVaccineReminders, calculateVaccineDateFromBirth } from '../utils/vaccineSchedule';
import '../styles/Vaccines.css';

export default function Vaccines() {
  const navigate = useNavigate();
  const { selectedBaby } = useBabyContext();
  const [activeTab, setActiveTab] = useState('all');
  const [allVaccines, setAllVaccines] = useState([]);
  const [userReminders, setUserReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showKhopCard, setShowKhopCard] = useState(false);
  
  // Fetch all available vaccines and user reminders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vaccinesData, remindersData] = await Promise.all([
          getAllVaccines(),
          getUserVaccineReminders().catch(() => []),
          getCurrentUser().catch(() => null)
        ]);
        
        setAllVaccines(vaccinesData || []);
        setUserReminders(remindersData || []);
        setLoading(false);

        // Check if auto-setup was done for this baby using localStorage
        // Use baby ID to support multiple babies
        const autoSetupKey = selectedBaby ? `vaccine_auto_setup_baby_${selectedBaby.id}` : null;
        const autoSetupDone = autoSetupKey ? localStorage.getItem(autoSetupKey) : false;
        
        // Only auto-create reminders if not done before for this baby
        if (!autoSetupDone) {
          const babyDOB = selectedBaby ? selectedBaby.date_of_birth : null;
          if (babyDOB && vaccinesData && vaccinesData.length > 0) {
            // Run auto-setup in background to avoid blocking UI
            setTimeout(() => {
              autoCreateAllVaccineReminders(vaccinesData, remindersData || [], babyDOB)
                .then(() => {
                  if (autoSetupKey) {
                    localStorage.setItem(autoSetupKey, 'true');
                  }
                })
                .catch((error) => {
                  console.error('Error in auto-setup:', error);
                });
            }, 0);
            // Mark auto-setup as done for this baby
            if (autoSetupKey) {
              localStorage.setItem(autoSetupKey, 'true');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching vaccine data:', error);
      }
    };

    fetchData();
  }, [selectedBaby]);

  // Manual trigger for auto-setup
  const handleManualAutoSetup = async () => {
    if (!selectedBaby || !allVaccines.length) {
      alert('Please select a baby first');
      return;
    }

    setLoading(true);
    try {
      await autoCreateAllVaccineReminders(allVaccines, userReminders, selectedBaby.date_of_birth);
      // Mark auto-setup as done for this baby
      const autoSetupKey = `vaccine_auto_setup_baby_${selectedBaby.id}`;
      localStorage.setItem(autoSetupKey, 'true');
      
      // Refresh vaccine reminders to show newly created reminders
      const remindersData = await getUserVaccineReminders();
      setUserReminders(remindersData || []);
      
      alert('✓ Vaccine reminders auto-created successfully!');
    } catch (error) {
      console.error('Error in manual auto-setup:', error);
      alert('Error creating vaccine reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to check if vaccine is due within 7 days
  const isDueWithinWeek = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 7;
  };

  // Auto-create reminders for vaccines that don't have them yet
  const autoCreateAllVaccineReminders = async (vaccines, existingReminders, babyBirthDate) => {
    try {
      if (!babyBirthDate) {
        console.log('No baby birth date available for auto-setup');
        setUserReminders(existingReminders);
        return;
      }

      // Find vaccines that don't have any reminders yet
      const vaccinesWithReminders = new Set(existingReminders.map(r => r.vaccine_name));
      const vaccinesNeedingReminders = vaccines.filter(v => !vaccinesWithReminders.has(v.name));

      if (vaccinesNeedingReminders.length === 0) {
        console.log('All vaccines already have reminders');
        setUserReminders(existingReminders);
        return;
      }

      console.log(`Auto-creating reminders for ${vaccinesNeedingReminders.length} vaccines...`);

      // Create reminders for each vaccine without reminders
      const createdReminders = [];
      for (const vaccine of vaccinesNeedingReminders) {
        try {
          // Generate reminder data for all doses
          const reminderDataList = generateAutomaticVaccineReminders(
            [vaccine],
            babyBirthDate,
            'baby'
          );

          // Create all doses for this vaccine
          for (const reminderData of reminderDataList) {
            const created = await createVaccineReminder(reminderData);
            createdReminders.push(created);
          }
        } catch (error) {
          console.error(`Error creating reminder for ${vaccine.name}:`, error);
        }
      }

      // Update state with all reminders (existing + newly created)
      const allReminders = [...existingReminders, ...createdReminders];
      setUserReminders(allReminders);

      // Show success notification
      if (createdReminders.length > 0 && Notification.permission === 'granted') {
        NotificationService.sendNotification(
          'Vaccine Reminders Created! 🎉',
          {
            body: `${createdReminders.length} vaccine reminders auto-created.`,
            tag: 'vaccine-auto-setup',
          }
        );
      }
    } catch (error) {
      console.error('Error in auto-create vaccine reminders:', error);
      setUserReminders(existingReminders);
    }
  };

  // Get display vaccines: scheduled reminders + available vaccines with no reminders
  const displayVaccines = useMemo(() => {
    // Deduplicate userReminders by vaccine_name + dose_number combination
    // Keep the most recent version if duplicates exist
    const reminderMap = new Map();
    userReminders.forEach(reminder => {
      const key = `${reminder.vaccine_name}|${reminder.dose_number || 1}`;
      
      // If key doesn't exist, or new reminder is more recent, update it
      if (!reminderMap.has(key)) {
        reminderMap.set(key, reminder);
      } else {
        const existing = reminderMap.get(key);
        // Compare by updatedAt or id to keep the most recent
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : existing.id;
        const newTime = reminder.updatedAt ? new Date(reminder.updatedAt).getTime() : reminder.id;
        
        if (newTime > existingTime) {
          reminderMap.set(key, reminder);
        }
      }
    });

    const uniqueReminders = Array.from(reminderMap.values());

    // Track vaccines already scheduled
    const vaccinesWithReminders = new Set(uniqueReminders.map(r => r.vaccine_name));

    // Build display list starting with reminders - add recommended property from original vaccine data
    const displayVaccines = uniqueReminders.map(reminder => {
      const originalVaccine = allVaccines.find(v => v.name === reminder.vaccine_name);
      return {
        ...reminder,
        recommended: originalVaccine?.recommended || false
      };
    });

    // Add available vaccines that have no reminders yet (only baby vaccines)
    allVaccines.forEach(vaccine => {
      // Filter out mother vaccines - only show baby vaccines
      if (vaccine.recipient_type === 'mother') {
        return;
      }

      if (!vaccinesWithReminders.has(vaccine.name)) {
        // Estimate first dose date from baby's DOB using schedule config
        let reminderDate = '';
        const schedule = vaccineScheduleConfig[vaccine.name];
        const firstDose = schedule?.spacing?.[0];
        if (firstDose && selectedBaby?.date_of_birth) {
          const date = calculateVaccineDateFromBirth(selectedBaby.date_of_birth, firstDose.ageMonths);
          if (date) {
            reminderDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }
        }

        displayVaccines.push({
          id: `available-${vaccine.id || vaccine.name}`,
          vaccine_name: vaccine.name,
          vaccine_icon: vaccine.emoji,
          description: vaccine.description,
          reminder_date: reminderDate,
          status: 'available',
          recipient: 'baby',
          recipient_type: vaccine.recipient_type,
          total_doses: vaccine.total_doses,
          dose_number: 0,
          recommended: vaccine.recommended,
        });
      }
    });

    return displayVaccines;
  }, [userReminders, allVaccines, selectedBaby]);

  // Filter vaccines based on active tab
  const filteredVaccines = useMemo(() => {
    
    // Show only completed vaccines
    if (activeTab === 'completed') {
      return displayVaccines.filter(v => v.status === 'completed');
    }
    
    // Hide completed vaccines from other tabs
    const nonCompletedVaccines = displayVaccines.filter(v => v.status !== 'completed');
    
    if (activeTab === 'recommended') {
      return nonCompletedVaccines.filter(v => v.recommended === true);
    }
    return nonCompletedVaccines;
  }, [displayVaccines, activeTab]);

  // Vaccine statistics for header cards (aligned with displayed data)
  const stats = useMemo(() => ({
    completed: displayVaccines.filter(v => v.status === 'completed').length,
    pending: displayVaccines.filter(v => v.status !== 'completed').length,
    overdue: displayVaccines.filter(v => v.status === 'overdue').length,
  }), [displayVaccines]);

  const handleMarkDone = async (id) => {
    try {
      const vaccineToMark = userReminders.find(v => v.id === id);
      if (!vaccineToMark) return;

      // Step 1: Mark current dose as completed on backend
      await updateVaccineReminderStatus(id, {
        status: 'completed',
        last_dose_date: new Date().toISOString(),
      });

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

      // Step 2: Check if next dose needs to be created
      const currentDose = vaccineToMark.dose_number || 1;
      const totalDoses = vaccineToMark.total_doses || 1;

      if (currentDose < totalDoses) {
        // Check if next dose already exists
        const nextDoseExists = userReminders.some(
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

            await createVaccineReminder(nextDoseReminder);

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

      // Step 3: Refresh all vaccine reminders from server to ensure UI is up to date
      const refreshedReminders = await getUserVaccineReminders();
      setUserReminders(refreshedReminders || []);
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
      {/* Khop Card Modal */}
      <KhopCard 
        isOpen={showKhopCard}
        onClose={() => setShowKhopCard(false)}
        babyName={selectedBaby?.name || 'Baby'}
        babyDOB={selectedBaby?.date_of_birth}
        completedVaccines={userReminders.filter(v => v.status === 'completed')}
      />

      {/* Vaccines Header */}
      <VaccinesHeader 
        onBack={() => navigate('/home')}
        onKhopCard={() => setShowKhopCard(true)}
      />

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

        {/* Tab Selection */}
        <div className="vaccine-tabs">
          <button 
            className={`vaccine-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Vaccines
          </button>
          <button 
            className={`vaccine-tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            ⭐ Recommended
          </button>
          <button 
            className={`vaccine-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            ✓ Completed
          </button>
          <button 
            className="vaccine-tab-btn auto-setup-btn"
            onClick={handleManualAutoSetup}
            disabled={!selectedBaby || loading}
            title="Automatically calculate vaccine dates based on baby's birth date"
          >
            🔄 Auto-Setup
          </button>
        </div>

        {/* Vaccines List */}
        <div className="vaccine-cards-list">
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map((vaccine) => {
              // Find the original vaccine data to get 'recommended' status
              const originalVaccine = allVaccines.find(v => v.name === vaccine.vaccine_name);
              
              return (
                <VaccineCard
                  key={`reminder-${vaccine.id}`}
                  id={vaccine.id}
                  name={vaccine.vaccine_name}
                  emoji={vaccine.vaccine_icon || '💉'}
                  description={vaccine.description}
                  dueDate={vaccine.reminder_date}
                  status={vaccine.status}
                  forPerson="Baby"
                  details={vaccine.total_doses ? `${vaccine.dose_number || 1} of ${vaccine.total_doses}` : 'Single dose'}
                  isDueWithinWeek={isDueWithinWeek(vaccine.reminder_date)}
                  recommended={originalVaccine?.recommended || false}
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
