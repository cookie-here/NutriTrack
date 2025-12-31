/**
 * EDIT PROFILE DETAILS PAGE COMPONENT
 * ====================================
 * Allows users to update their profile information
 * Features: Name, Trimester tracking, Food intolerances
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfileDetails.css';

export default function EditProfileDetails() {
  const navigate = useNavigate();
  
  // User profile data
  const [profileData, setProfileData] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dueDate: "2025-06-15"
  });

  // Trimester state
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [currentWeek, setCurrentWeek] = useState(18);

  // Food intolerances state
  const [foodIntolerances, setFoodIntolerances] = useState([]);
  
  const intoleranceOptions = [
    { id: 'none', label: 'None', emoji: '✓' },
    { id: 'gluten-free', label: 'Gluten Free', emoji: '🌾' },
    { id: 'dairy-free', label: 'Dairy Free', emoji: '🥛' },
    { id: 'egg-free', label: 'Egg Free', emoji: '🥚' },
    { id: 'nut-free', label: 'Nut Free', emoji: '🥜' },
    { id: 'soy-free', label: 'Soy Free', emoji: '🫘' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱' },
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
    { id: 'lactose-intolerant', label: 'Lactose Intolerant', emoji: '🧀' },
    { id: 'shellfish-free', label: 'Shellfish Free', emoji: '🦐' },
    { id: 'low-sodium', label: 'Low Sodium', emoji: '🧂' }
  ];

  // Handle intolerance toggle
  const handleIntoleranceToggle = (id) => {
    if (id === 'none') {
      setFoodIntolerances([]);
      return;
    }
    
    setFoodIntolerances(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle trimester change
  const handleTrimesterChange = (trimester) => {
    setCurrentTrimester(trimester);
    // Auto-adjust week range based on trimester
    if (trimester === 1) setCurrentWeek(Math.min(currentWeek, 12));
    else if (trimester === 2) setCurrentWeek(Math.max(13, Math.min(currentWeek, 26)));
    else setCurrentWeek(Math.max(27, currentWeek));
  };

  // Handle save
  const handleSave = () => {
    // In production, save to API
    console.log('Profile saved:', {
      ...profileData,
      trimester: currentTrimester,
      week: currentWeek,
      foodIntolerances
    });
    navigate('/profile');
  };

  // Get week range for trimester
  const getWeekRange = (trimester) => {
    if (trimester === 1) return { min: 1, max: 12 };
    if (trimester === 2) return { min: 13, max: 26 };
    return { min: 27, max: 40 };
  };

  const weekRange = getWeekRange(currentTrimester);

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        
        {/* Header */}
        <div className="edit-profile-header">
          <button className="back-button" onClick={() => navigate('/profile')}>
            <span>‹</span>
          </button>
          <h1 className="edit-profile-title">Edit Profile</h1>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Personal Information Section */}
        <div className="section-card">
          <h2 className="section-heading">Personal Information</h2>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileData.fullName}
              onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={profileData.dueDate}
              onChange={(e) => setProfileData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Trimester Tracking Section */}
        <div className="section-card">
          <h2 className="section-heading">Pregnancy Progress</h2>
          <p className="section-description">Track your current trimester and week</p>
          
          {/* Trimester Selection */}
          <div className="trimester-selector">
            <label className="form-label">Current Trimester</label>
            <div className="trimester-buttons">
              {[1, 2, 3].map((trimester) => (
                <button
                  key={trimester}
                  className={`trimester-button ${currentTrimester === trimester ? 'active' : ''}`}
                  onClick={() => handleTrimesterChange(trimester)}
                >
                  <span className="trimester-number">{trimester}</span>
                  <span className="trimester-label">
                    {trimester === 1 ? 'First' : trimester === 2 ? 'Second' : 'Third'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Week Selection */}
          <div className="week-selector">
            <label className="form-label">Current Week</label>
            <div className="week-input-container">
              <button 
                className="week-adjust-button"
                onClick={() => setCurrentWeek(prev => Math.max(weekRange.min, prev - 1))}
                disabled={currentWeek <= weekRange.min}
              >
                −
              </button>
              <div className="week-display">
                <span className="week-number">{currentWeek}</span>
                <span className="week-label">weeks</span>
              </div>
              <button 
                className="week-adjust-button"
                onClick={() => setCurrentWeek(prev => Math.min(weekRange.max, prev + 1))}
                disabled={currentWeek >= weekRange.max}
              >
                +
              </button>
            </div>
            <p className="week-range-info">
              Trimester {currentTrimester}: Week {weekRange.min} - {weekRange.max}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="pregnancy-progress">
            <div className="progress-header">
              <span>Progress</span>
              <span>{Math.round((currentWeek / 40) * 100)}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${(currentWeek / 40) * 100}%` }}
              />
            </div>
            <p className="progress-info">{40 - currentWeek} weeks to go!</p>
          </div>
        </div>

        {/* Food Intolerances Section */}
        <div className="section-card">
          <h2 className="section-heading">Food Intolerances</h2>
          <p className="section-description">
            Do you have any food intolerances or dietary preferences? 
            Select all that apply to personalize your nutrition recommendations.
          </p>
          
          <div className="intolerance-grid">
            {intoleranceOptions.map((option) => (
              <button
                key={option.id}
                className={`intolerance-chip ${
                  option.id === 'none' 
                    ? foodIntolerances.length === 0 ? 'active' : ''
                    : foodIntolerances.includes(option.id) ? 'active' : ''
                }`}
                onClick={() => handleIntoleranceToggle(option.id)}
              >
                <span className="chip-emoji">{option.emoji}</span>
                <span className="chip-label">{option.label}</span>
                {(option.id === 'none' ? foodIntolerances.length === 0 : foodIntolerances.includes(option.id)) && (
                  <span className="chip-check">✓</span>
                )}
              </button>
            ))}
          </div>

          {foodIntolerances.length > 0 && (
            <div className="selected-intolerances">
              <p className="selected-label">Selected: </p>
              <div className="selected-tags">
                {foodIntolerances.map(id => {
                  const option = intoleranceOptions.find(opt => opt.id === id);
                  return (
                    <span key={id} className="selected-tag">
                      {option?.emoji} {option?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Save Button (Mobile) */}
        <button className="save-button-mobile" onClick={handleSave}>
          Save Changes
        </button>

      </div>
    </div>
  );
}
