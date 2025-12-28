/**
 * FEEDING PAGE COMPONENT
 * =====================
 * Displays age-appropriate feeding guide
 * Shows feeding schedule and guidelines
 * Fully modular with reusable sub-components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedingHeader from '../components/FeedingHeader';
import BottomNavigation from '../components/BottomNavigation';
import '../styles/Feeding.css';

export default function Feeding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');

  // Sample feeding data - would come from props or API in production
  const feedingData = {
    babyAge: "5 months",
    ageInMonths: 5,
    schedules: [
      {
        id: 1,
        frequency: "Every 2-3 hours",
        type: "Breast/Formula",
        amount: "8-12 times per day",
        instructions: [
          "Feed on demand, typically 8-12 times per day",
          "2-4 oz per feeding (formula)",
          "Until satisfied (breastfeeding)",
          "Watch for hunger cues"
        ]
      }
    ],
    guidelines: [
      {
        title: "Feeding Guideline",
        icon: "ℹ️",
        content: "Exclusive breastfeeding or formula feeding recommended for the first 6 months."
      }
    ],
    tips: [
      {
        title: "Monitor Wet Diapers",
        description: "Baby should have 6-8 wet diapers per day"
      },
      {
        title: "Weight Gain",
        description: "Average weight gain of 5-7 oz per week at this stage"
      },
      {
        title: "Feeding Cues",
        description: "Learn to recognize hunger and fullness cues"
      }
    ]
  };

  return (
    <div className="feeding-container">
      {/* Feeding Header */}
      <FeedingHeader onBack={() => navigate('/home')} />

      {/* Main Content */}
      <div className="feeding-main">
        
        {/* Baby Age Info */}
        <div className="baby-age-card">
          <div className="baby-age-emoji">👶</div>
          <div className="baby-age-content">
            <h3>Baby Age: {feedingData.babyAge}</h3>
            <p>Age-appropriate feeding recommendations</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="feeding-tabs">
          <button 
            className={`feeding-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Feeding Schedule
          </button>
          <button 
            className={`feeding-tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            Tips & Guidance
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === 'schedule' && (
          <div>
            {/* Feeding Guideline */}
            {feedingData.guidelines.map((guideline) => (
              <div key={guideline.title} className="feeding-guideline-card">
                <div className="feeding-guideline-icon">{guideline.icon}</div>
                <div className="feeding-guideline-content">
                  <h3>{guideline.title}</h3>
                  <p>{guideline.content}</p>
                </div>
              </div>
            ))}

            {/* Feeding Schedule */}
            {feedingData.schedules.map((schedule) => (
              <div key={schedule.id} className="feeding-schedule-card">
                <div className="feeding-schedule-header">
                  <div className="feeding-schedule-icon">🍼</div>
                  <h3>{schedule.type}</h3>
                </div>
                
                <div className="feeding-frequency">
                  {schedule.frequency}
                </div>

                <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#333' }}>
                  Recommended Amount:
                </h4>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  {schedule.amount}
                </p>

                <h4 style={{ marginBottom: '8px', color: '#333' }}>
                  Feeding Tips:
                </h4>
                {schedule.instructions.map((instruction, idx) => (
                  <div key={idx} className="feeding-instruction">
                    {instruction}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div>
            <h3 className="feeding-section-title">Tips & Guidance</h3>
            {feedingData.tips.map((tip, idx) => (
              <div key={idx} className="feeding-guideline-card">
                <div className="feeding-guideline-icon">💡</div>
                <div className="feeding-guideline-content">
                  <h3>{tip.title}</h3>
                  <p>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Feeding" />
    </div>
  );
}
