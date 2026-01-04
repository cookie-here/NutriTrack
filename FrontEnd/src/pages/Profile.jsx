/**
 * PROFILE PAGE COMPONENT
 * ======================
 * Edit Profile page for NutriTrack app
 * Displays user avatar, profile info, and settings
 * Features: Sync Partner, Emergency Contacts, Legal Notice
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { 
  getCurrentUser,
  getUserProfile,
  saveEmergencyContact,
  getEmergencyContact,
  sendPartnerInvite,
  clearAuthToken
} from '../api';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State for settings
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  
  // User data - fetch from API
  const [userData, setUserData] = useState({
    name: "User",
    email: "user@email.com",
    profileImage: null
  });

  // Emergency contact data
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  });

  // Partner sync data
  const [partnerEmail, setPartnerEmail] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getUserProfile();
        setUserData({
          name: user.full_name || "User",
          email: user.email || "user@email.com",
          profileImage: null
        });
        
        // Load emergency contact if exists
        if (user.emergency_contact) {
          setEmergencyContact(user.emergency_contact);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle emergency contact save
  const handleEmergencyContactSave = async () => {
    try {
      await saveEmergencyContact(emergencyContact);
      console.log('Emergency contact saved:', emergencyContact);
      setShowEmergencyModal(false);
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      alert('Failed to save emergency contact');
    }
  };

  // Handle partner sync
  const handlePartnerSync = async () => {
    try {
      await sendPartnerInvite(partnerEmail);
      console.log('Partner invite sent to:', partnerEmail);
      setShowPartnerModal(false);
      setPartnerEmail("");
      alert('Partner invite sent successfully!');
    } catch (error) {
      console.error('Error sending partner invite:', error);
      alert('Failed to send partner invite');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        
        {/* Header */}
        <div className="profile-header">
          <button className="profile-back-button" onClick={() => navigate('/home')}>
            <span>‹</span>
          </button>
          <h1 className="profile-title">Profile</h1>
          <div className="profile-header-spacer"></div>
        </div>

        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="Profile" />
              ) : (
                <span className="avatar-placeholder">👤</span>
              )}
            </div>
            <label className="camera-button" htmlFor="profile-image-input">
              <span>📷</span>
            </label>
            <input
              type="file"
              id="profile-image-input"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <h2 className="profile-name">{userData.name}</h2>
          <p className="profile-email">{userData.email}</p>
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <h3 className="section-title">Settings</h3>
          
          {/* Dark Mode Toggle */}
          <div className="settings-item">
            <div className="settings-item-left">
              <span className="settings-icon">🔔</span>
              <div className="settings-info">
                <p className="settings-label">Notifications</p>
                <p className="settings-description">Manage notification preferences</p>
              </div>
            </div>
            <span className="chevron">›</span>
          </div>

          {/* Sync Partner */}
          <div className="settings-item" onClick={() => setShowPartnerModal(true)}>
            <div className="settings-item-left">
              <span className="settings-icon">👥</span>
              <div className="settings-info">
                <p className="settings-label">Sync Partner</p>
                <p className="settings-description">Share updates with your partner</p>
              </div>
            </div>
            <span className="chevron">›</span>
          </div>

          {/* Emergency Contact */}
          <div className="settings-item" onClick={() => setShowEmergencyModal(true)}>
            <div className="settings-item-left">
              <span className="settings-icon">🚨</span>
              <div className="settings-info">
                <p className="settings-label">Emergency Contact</p>
                <p className="settings-description">Add emergency contact details</p>
              </div>
            </div>
            <span className="chevron">›</span>
          </div>

          {/* Legal Notice */}
          <div className="settings-item" onClick={() => setShowLegalModal(true)}>
            <div className="settings-item-left">
              <span className="settings-icon">📜</span>
              <div className="settings-info">
                <p className="settings-label">Legal Notice</p>
                <p className="settings-description">Terms, privacy & policies</p>
              </div>
            </div>
            <span className="chevron">›</span>
          </div>
        </div>

        {/* Logout Button */}
        <button className="logout-button" onClick={() => {
          clearAuthToken();
          navigate('/login');
        }}>
          <span className="logout-icon">🚪</span>
          <span>Log Out</span>
        </button>

        {/* App Version */}
        <p className="app-version">NutriTrack v1.0.0</p>

      </div>

      {/* Partner Sync Modal */}
      {showPartnerModal && (
        <div className="modal-overlay" onClick={() => setShowPartnerModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sync Partner</h3>
              <button className="modal-close" onClick={() => setShowPartnerModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Invite your partner to sync and share pregnancy updates, reminders, and milestones together.
              </p>
              <div className="form-group">
                <label className="form-label">Partner's Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="partner@email.com"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setShowPartnerModal(false)}>
                Cancel
              </button>
              <button className="modal-button primary" onClick={handlePartnerSync}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Modal */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Emergency Contact</h3>
              <button className="modal-close" onClick={() => setShowEmergencyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Add an emergency contact who can be reached quickly in case of any emergency.
              </p>
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={emergencyContact.name}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={emergencyContact.phone}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-input"
                  value={emergencyContact.relationship}
                  onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="doctor">Doctor</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button secondary" onClick={() => setShowEmergencyModal(false)}>
                Cancel
              </button>
              <button className="modal-button primary" onClick={handleEmergencyContactSave}>
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Notice Modal */}
      {showLegalModal && (
        <div className="modal-overlay" onClick={() => setShowLegalModal(false)}>
          <div className="modal-content legal-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Legal Notice</h3>
              <button className="modal-close" onClick={() => setShowLegalModal(false)}>×</button>
            </div>
            <div className="modal-body legal-body">
              <div className="legal-section">
                <h4>Terms of Service</h4>
                <p>By using NutriTrack, you agree to our terms and conditions. This app provides nutritional guidance and pregnancy tracking information for educational purposes only.</p>
              </div>
              <div className="legal-section">
                <h4>Privacy Policy</h4>
                <p>We respect your privacy. Your personal data is encrypted and stored securely. We do not share your information with third parties without your consent.</p>
              </div>
              <div className="legal-section">
                <h4>Medical Disclaimer</h4>
                <p>NutriTrack is not a substitute for professional medical advice. Always consult with your healthcare provider for medical decisions.</p>
              </div>
              <div className="legal-section">
                <h4>Data Collection</h4>
                <p>We collect minimal data necessary to provide our services, including profile information, health tracking data, and app usage analytics.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button primary" onClick={() => setShowLegalModal(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Home" />
    </div>
  );
}
