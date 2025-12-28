/**
 * GROWTH PAGE COMPONENT
 * ====================
 * Displays growth tracking with milestones
 * Shows current weight/height and growth chart
 * Fully modular with reusable sub-components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GrowthHeader from '../components/GrowthHeader';
import MilestoneCard from '../components/MilestoneCard';
import BottomNavigation from '../components/BottomNavigation';
import '../styles/Growth.css';

export default function Growth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weight');
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      name: "First smile",
      emoji: "😊",
      ageInMonths: 2,
      completed: true
    },
    {
      id: 2,
      name: "Holds head up",
      emoji: "💪",
      ageInMonths: 3,
      completed: true
    },
    {
      id: 3,
      name: "Rolls over",
      emoji: "🔄",
      ageInMonths: 4,
      completed: true
    },
    {
      id: 4,
      name: "Sits up",
      emoji: "🪑",
      ageInMonths: 6,
      completed: false
    },
    {
      id: 5,
      name: "Crawls",
      emoji: "🍃",
      ageInMonths: 8,
      completed: false
    }
  ]);

  // Sample growth data
  const growthData = {
    currentWeight: "7.1 kg",
    lastUpdated: "Nov 30, 2025",
    currentHeight: "68 cm",
    weightHistory: [
      { month: "0m", weight: 3.5 },
      { month: "1m", weight: 4.2 },
      { month: "2m", weight: 5.0 },
      { month: "3m", weight: 5.8 },
      { month: "4m", weight: 6.4 },
      { month: "5m", weight: 7.1 }
    ],
    averageHeight: 67.5
  };

  const toggleMilestone = (id) => {
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  // Calculate chart bar heights
  const maxWeight = Math.max(...growthData.weightHistory.map(h => h.weight));
  const chartBars = growthData.weightHistory.map(item => ({
    ...item,
    heightPercent: (item.weight / maxWeight) * 100
  }));

  return (
    <div className="growth-container">
      {/* Growth Header */}
      <GrowthHeader 
        onBack={() => navigate('/home')}
        onAddRecord={() => alert('Add new record - feature coming soon')}
      />

      {/* Main Content */}
      <div className="growth-main">
        
        {/* Current Stats */}
        <div className="current-stats-card">
          <div className="current-stat-item">
            <div className="current-stat-emoji">⬆️</div>
            <div className="current-stat-content">
              <h3>Current Weight</h3>
              <p className="current-stat-value">{growthData.currentWeight}</p>
              <p>Last updated: {growthData.lastUpdated}</p>
            </div>
          </div>

          <div className="current-stat-item">
            <div className="current-stat-emoji">📏</div>
            <div className="current-stat-content">
              <h3>Current Height</h3>
              <p className="current-stat-value">{growthData.currentHeight}</p>
              <p>5 months old</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="growth-tabs">
          <button 
            className={`growth-tab-btn ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            Weight (kg)
          </button>
          <button 
            className={`growth-tab-btn ${activeTab === 'height' ? 'active' : ''}`}
            onClick={() => setActiveTab('height')}
          >
            Height (cm)
          </button>
        </div>

        {/* Growth Chart */}
        {activeTab === 'weight' && (
          <div className="growth-chart-card">
            <h3>Growth Chart</h3>
            <div className="growth-chart-container">
              {chartBars.map((bar, idx) => (
                <div key={idx} className="growth-chart-bar">
                  <div
                    className="growth-bar"
                    style={{ height: `${bar.heightPercent * 1.5}px` }}
                    title={`${bar.weight}kg`}
                  />
                  <div className="growth-bar-label">{bar.month}</div>
                </div>
              ))}
            </div>
            <div className="growth-chart-legend">
              <div className="growth-legend-item">
                <div className="growth-legend-dot" style={{ background: '#bbb' }}></div>
                <span>Average</span>
              </div>
              <div className="growth-legend-item">
                <div className="growth-legend-dot" style={{ background: '#9c27b0' }}></div>
                <span>Baby's weight</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'height' && (
          <div className="growth-chart-card">
            <h3>Height Progression</h3>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '40px', marginBottom: '40px' }}>
              Height tracking data will appear here as baby grows.
            </p>
          </div>
        )}

        {/* Milestones */}
        <div>
          <h3 className="growth-section-title">Developmental Milestones</h3>
          <div className="milestones-list">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                id={milestone.id}
                name={milestone.name}
                emoji={milestone.emoji}
                ageInMonths={milestone.ageInMonths}
                completed={milestone.completed}
                onClick={() => toggleMilestone(milestone.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Growth" />
    </div>
  );
}
