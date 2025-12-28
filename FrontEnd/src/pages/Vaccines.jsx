/**
 * VACCINES PAGE COMPONENT
 * =======================
 * Displays vaccine tracker with status tracking
 * Shows completed, pending, and upcoming vaccines
 * Fully modular with reusable sub-components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VaccinesHeader from '../components/VaccinesHeader';
import VaccineCard from '../components/VaccineCard';
import BottomNavigation from '../components/BottomNavigation';
import NotificationService from '../services/NotificationService';
import '../styles/Vaccines.css';

export default function Vaccines() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [vaccines, setVaccines] = useState([
    {
      id: 1,
      name: "Tdap",
      emoji: "💉",
      description: "Tetanus, diphtheria, and pertussis",
      dueDate: "Mar 15, 2025",
      status: "taken",
      forPerson: "Mother",
      details: "Single dose"
    },
    {
      id: 2,
      name: "Flu Shot",
      emoji: "💉",
      description: "Annual influenza vaccine",
      dueDate: "Dec 1, 2025",
      status: "upcoming",
      forPerson: "Mother",
      details: "Yearly"
    },
    {
      id: 3,
      name: "Hepatitis B",
      emoji: "💉",
      description: "First dose at birth",
      dueDate: "Jan 15, 2025",
      status: "taken",
      forPerson: "Baby",
      details: "1 of 3"
    },
    {
      id: 4,
      name: "Hepatitis B",
      emoji: "💉",
      description: "Second dose",
      dueDate: "Feb 1, 2025",
      status: "upcoming",
      forPerson: "Baby",
      details: "2 of 3"
    },
    {
      id: 5,
      name: "DtaP",
      emoji: "💉",
      description: "Diphtheria, tetanus, pertussis",
      dueDate: "Feb 28, 2025",
      status: "upcoming",
      forPerson: "Baby",
      details: "1 of 5"
    },
    {
      id: 6,
      name: "Polio",
      emoji: "💉",
      description: "Poliomyelitis vaccine",
      dueDate: "Feb 28, 2025",
      status: "upcoming",
      forPerson: "Baby",
      details: "1 of 4"
    }
  ]);

  // Function to check if vaccine is due within 7 days
  const isDueWithinWeek = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 7;
  };

  // Calculate stats
  const stats = {
    completed: vaccines.filter(v => v.status === 'taken').length,
    pending: vaccines.filter(v => v.status === 'pending').length,
    upcoming: vaccines.filter(v => v.status === 'upcoming').length
  };

  // Filter vaccines based on active tab
  const getFilteredVaccines = () => {
    if (activeTab === 'mother') {
      return vaccines.filter(v => v.forPerson === 'Mother');
    } else if (activeTab === 'baby') {
      return vaccines.filter(v => v.forPerson === 'Baby');
    }
    return vaccines;
  };

  const filteredVaccines = getFilteredVaccines();

  const handleMarkDone = (id) => {
    const vaccineToMark = vaccines.find(v => v.id === id);
    
    setVaccines(vaccines.map(v => 
      v.id === id ? { ...v, status: 'taken' } : v
    ));

    // Send notification when vaccine is completed
    if (vaccineToMark && Notification.permission === 'granted') {
      NotificationService.sendNotification(
        `✓ ${vaccineToMark.name} Completed`,
        {
          body: `Great! You've completed the ${vaccineToMark.name} vaccine for ${vaccineToMark.forPerson}.`,
          tag: `vaccine-completed-${id}`,
          icon: '✓'
        }
      );
    }
  };

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
            <p className="vaccine-stat-number">{stats.upcoming}</p>
            <p className="vaccine-stat-label">Upcoming</p>
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
        </div>

        {/* Vaccines List */}
        <div className="vaccine-cards-list">
          {filteredVaccines.length > 0 ? (
            filteredVaccines.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                id={vaccine.id}
                name={vaccine.name}
                emoji={vaccine.emoji}
                description={vaccine.description}
                dueDate={vaccine.dueDate}
                status={vaccine.status}
                forPerson={vaccine.forPerson}
                details={vaccine.details}
                isDueWithinWeek={isDueWithinWeek(vaccine.dueDate)}
                onMarkDone={() => handleMarkDone(vaccine.id)}
              />
            ))
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
