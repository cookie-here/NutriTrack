import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  saveEmergencyContact,
  getEmergencyContact,
  deleteEmergencyContact,
  clearAuthToken,
} from '../api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/Profile.css';

const HOME_USER_TYPE = 'newParent';

function MenuItem({ icon, title, desc, onClick, right }) {
  return (
    <div className="pf-menu-item" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.() }}>
      <span className="pf-menu-icon">{icon}</span>
      <div className="pf-menu-text">
        <span className="pf-menu-title">{title}</span>
        {desc && <span className="pf-menu-desc">{desc}</span>}
      </div>
      {right !== undefined ? right : <span className="pf-chevron">›</span>}
    </div>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="pf-overlay" onClick={onClose}>
      <div className="pf-modal" onClick={e => e.stopPropagation()}>
        <div className="pf-modal-header">
          <h3>{title}</h3>
          <button className="pf-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="pf-modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) {
  if (!show) return null;
  return (
    <div className="pf-overlay" onClick={onCancel}>
      <div className="pf-confirm" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="pf-confirm-actions">
          <button className="pf-btn pf-btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`pf-btn ${danger ? 'pf-btn-danger' : 'pf-btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { darkMode, toggleDarkMode } = useTheme();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({ full_name: '', email: '', phone_number: '', profile_image: null });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', relationship: '' });
  const [uploading, setUploading] = useState(false);

  const [modals, setModals] = useState({
    editProfile: false, changePassword: false, changeEmail: false,
    notifications: false, emergency: false,
    privacy: false, terms: false,
  });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone_number: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });

  const toggleModal = (key) => setModals(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getUserProfile().catch(() => ({ full_name: 'User', email: 'user@email.com' }));
        setUserData(user);
        if (user.emergency_contact) setEmergencyContact(user.emergency_contact);

        const ec = await getEmergencyContact().catch(() => null);
        if (ec) setEmergencyContact(ec);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const result = await uploadProfileImage(fd);
      setUserData(prev => ({ ...prev, profile_image: result.profile_image }));
      addToast('Profile picture updated', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      const updated = await updateUserProfile(editForm);
      setUserData(prev => ({ ...prev, full_name: updated.full_name, phone_number: updated.phone_number }));
      toggleModal('editProfile');
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  const handleEmergencySave = async () => {
    try {
      await saveEmergencyContact(emergencyContact);
      toggleModal('emergency');
      addToast('Emergency contact saved', 'success');
    } catch (err) {
      addToast(err.message || 'Save failed', 'error');
    }
  };

  const handleEmergencyDelete = async () => {
    try {
      await deleteEmergencyContact();
      setEmergencyContact({ name: '', phone: '', relationship: '' });
      toggleModal('emergency');
      addToast('Emergency contact deleted', 'success');
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  const profileImageUrl = userData.profile_image
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${userData.profile_image}`
    : null;

  return (
    <div className="pf-container">
      <div className="pf-content">

        {/* ===== HEADER ===== */}
        <div className="pf-header">
          <button className="pf-back" onClick={() => navigate('/home')}>←</button>
          <h1 className="pf-page-title">Profile</h1>
        </div>

        {/* ===== PROFILE CARD ===== */}
        <div className="pf-profile-card">
          <div className="pf-avatar-wrap">
            <div className="pf-avatar" onClick={() => fileInputRef.current?.click()}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" />
              ) : (
                <span className="pf-avatar-placeholder">👤</span>
              )}
              <div className="pf-avatar-overlay">
                <span>{uploading ? '...' : '📷'}</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </div>
          <h2 className="pf-name">{userData.full_name || 'User'}</h2>
          <p className="pf-email">{userData.email}</p>

          <button className="pf-edit-profile-btn" onClick={() => { setEditForm({ full_name: userData.full_name, phone_number: userData.phone_number || '' }); toggleModal('editProfile'); }}>
            <span>✏️</span> Edit Profile
          </button>
        </div>

        {/* ===== ACCOUNT ===== */}
        <div className="pf-section">
          <h3 className="pf-section-title">ACCOUNT</h3>
          <div className="pf-card">
            <MenuItem icon="👤" title="Edit Profile" desc="Update your personal information" onClick={() => { setEditForm({ full_name: userData.full_name, phone_number: userData.phone_number || '' }); toggleModal('editProfile'); }} />
            <MenuItem icon="🔑" title="Change Password" desc="Update your password" onClick={() => toggleModal('changePassword')} />
            <MenuItem icon="📧" title="Change Email" desc="Update your email address" onClick={() => toggleModal('changeEmail')} />
          </div>
        </div>

        {/* ===== SETTINGS ===== */}
        <div className="pf-section">
          <h3 className="pf-section-title">SETTINGS</h3>
          <div className="pf-card">
            <MenuItem icon={darkMode ? '🌙' : '☀️'} title="Dark Mode" desc="Toggle application theme"
              right={
                <div className="pf-toggle" onClick={e => { e.stopPropagation(); toggleDarkMode(); }} role="switch" aria-checked={darkMode} tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); toggleDarkMode(); } }}>
                  <div className={`pf-toggle-track ${darkMode ? 'on' : ''}`}>
                    <div className="pf-toggle-thumb" />
                  </div>
                </div>
              } />
            <MenuItem icon="🔔" title="Notifications" desc="Manage notification preferences" onClick={() => toggleModal('notifications')} />
            <MenuItem icon="🚨" title="Emergency Contact" desc={emergencyContact.name || 'Add emergency contact'} onClick={() => toggleModal('emergency')} />
          </div>
        </div>

        {/* ===== ABOUT ===== */}
        <div className="pf-section">
          <h3 className="pf-section-title">ABOUT</h3>
          <div className="pf-card">
            <MenuItem icon="📜" title="Privacy Policy" desc="How we handle your data" onClick={() => toggleModal('privacy')} />
            <MenuItem icon="📄" title="Terms & Conditions" desc="Terms of service" onClick={() => toggleModal('terms')} />
            <MenuItem icon="⭐" title="Rate App" desc="Leave a review" onClick={() => addToast('Thanks for your support!', 'info')} />
            <MenuItem icon="📤" title="Share App" desc="Share NutriTrack with others" onClick={() => {
              if (navigator.share) navigator.share({ title: 'NutriTrack', text: 'Track your baby\'s health with NutriTrack!' }).catch(() => {});
              else addToast('Share not supported on this device', 'info');
            }} />
            <MenuItem icon="ℹ" title="Version" desc="NutriTrack v1.0.0" onClick={() => {}} right={null} />
          </div>
        </div>

        {/* ===== LOGOUT ===== */}
        <button className="pf-logout" onClick={() => setConfirmLogout(true)}>
          🚪 Log Out
        </button>

        <p className="pf-footer-text">NutriTrack v1.0.0</p>
      </div>

      <BottomNavigation activeTab="Profile" />

      {/* ===== MODALS ===== */}

      {/* Edit Profile */}
      <Modal show={modals.editProfile} onClose={() => toggleModal('editProfile')} title="Edit Profile">
        <label className="pf-field-label">Full Name</label>
        <input className="pf-input" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} />
        <label className="pf-field-label">Phone Number</label>
        <input className="pf-input" value={editForm.phone_number} onChange={e => setEditForm(p => ({ ...p, phone_number: e.target.value }))} placeholder="+977 98XXXXXXXX" />
        <button className="pf-btn pf-btn-primary pf-btn-full" onClick={handleEditProfile}>Save Changes</button>
      </Modal>

      {/* Change Password */}
      <Modal show={modals.changePassword} onClose={() => toggleModal('changePassword')} title="Change Password">
        <label className="pf-field-label">Current Password</label>
        <input className="pf-input" type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
        <label className="pf-field-label">New Password</label>
        <input className="pf-input" type="password" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} />
        <label className="pf-field-label">Confirm New Password</label>
        <input className="pf-input" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
        <button className="pf-btn pf-btn-primary pf-btn-full" onClick={() => { addToast('Password change coming soon', 'info'); toggleModal('changePassword'); }}>Update Password</button>
      </Modal>

      {/* Change Email */}
      <Modal show={modals.changeEmail} onClose={() => toggleModal('changeEmail')} title="Change Email">
        <label className="pf-field-label">New Email Address</label>
        <input className="pf-input" type="email" value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} placeholder="new@email.com" />
        <button className="pf-btn pf-btn-primary pf-btn-full" onClick={() => { addToast('Email change coming soon', 'info'); toggleModal('changeEmail'); }}>Update Email</button>
      </Modal>

      {/* Notifications */}
      <Modal show={modals.notifications} onClose={() => toggleModal('notifications')} title="Notifications">
        {[
          { key: 'vaccine', label: 'Vaccination reminders', icon: '💉' },
          { key: 'growth', label: 'Growth reminders', icon: '📈' },
          { key: 'appointment', label: 'Appointment reminders', icon: '📅' },
          { key: 'nutrition', label: 'Nutrition reminders', icon: '🥗' },
        ].map(item => (
          <div key={item.key} className="pf-notif-row">
            <span>{item.icon} {item.label}</span>
            <div className="pf-toggle" role="switch" aria-checked={true} tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') addToast('Toggle coming soon', 'info'); }}>
              <div className="pf-toggle-track on">
                <div className="pf-toggle-thumb" />
              </div>
            </div>
          </div>
        ))}
      </Modal>

      {/* Emergency Contact */}
      <Modal show={modals.emergency} onClose={() => toggleModal('emergency')} title="Emergency Contact">
        {emergencyContact.name && (
          <div className="pf-existing-ec">
            <p><strong>{emergencyContact.name}</strong> — {emergencyContact.phone}</p>
            <p className="pf-ec-rel">{emergencyContact.relationship}</p>
            <button className="pf-btn pf-btn-danger pf-btn-full" onClick={handleEmergencyDelete}>Delete Contact</button>
          </div>
        )}
        <p className="pf-modal-desc">{emergencyContact.name ? 'Update your' : 'Add an'} emergency contact.</p>
        <label className="pf-field-label">Contact Name</label>
        <input className="pf-input" value={emergencyContact.name} onChange={e => setEmergencyContact(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
        <label className="pf-field-label">Phone Number</label>
        <input className="pf-input" value={emergencyContact.phone} onChange={e => setEmergencyContact(p => ({ ...p, phone: e.target.value }))} placeholder="+977 98XXXXXXXX" />
        <label className="pf-field-label">Relationship</label>
        <select className="pf-input" value={emergencyContact.relationship} onChange={e => setEmergencyContact(p => ({ ...p, relationship: e.target.value }))}>
          <option value="">Select relationship</option>
          <option value="spouse">Spouse</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="friend">Friend</option>
          <option value="doctor">Doctor</option>
          <option value="other">Other</option>
        </select>
        <button className="pf-btn pf-btn-primary pf-btn-full" onClick={handleEmergencySave}>Save Contact</button>
      </Modal>

      {/* Privacy Policy */}
      <Modal show={modals.privacy} onClose={() => toggleModal('privacy')} title="Privacy Policy">
        <div className="pf-legal-body">
          <h4>Data Collection</h4>
          <p>We collect minimal data necessary to provide our services, including profile information, health tracking data, and app usage analytics.</p>
          <h4>Data Security</h4>
          <p>Your personal data is encrypted and stored securely. We do not share your information with third parties without your consent.</p>
          <h4>Your Rights</h4>
          <p>You can request deletion of your data at any time by contacting our support team.</p>
        </div>
      </Modal>

      {/* Terms & Conditions */}
      <Modal show={modals.terms} onClose={() => toggleModal('terms')} title="Terms & Conditions">
        <div className="pf-legal-body">
          <h4>Terms of Service</h4>
          <p>By using NutriTrack, you agree to our terms and conditions. This app provides nutritional guidance and health tracking for educational purposes only.</p>
          <h4>Medical Disclaimer</h4>
          <p>NutriTrack is not a substitute for professional medical advice. Always consult with your healthcare provider for medical decisions.</p>
          <h4>Usage</h4>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
        </div>
      </Modal>

      {/* Confirm Logout */}
      <ConfirmDialog
        show={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        danger
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
