/**
 * PASSWORD STRENGTH INDICATOR COMPONENT
 * ====================================
 * Provides real-time visual feedback on password strength
 * Shows requirements checklist and strength bar
 */

import '../styles/PasswordStrengthIndicator.css';

export default function PasswordStrengthIndicator({ password }) {
  // Check each requirement
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate strength
  const strengthCount = Object.values(requirements).filter(Boolean).length;
  const strengthPercentage = (strengthCount / 5) * 100;
  
  const getStrengthLevel = () => {
    if (strengthCount === 0) return { label: 'Very Weak', color: '#999' };
    if (strengthCount === 1) return { label: 'Weak', color: '#ff4444' };
    if (strengthCount === 2) return { label: 'Fair', color: '#ff9900' };
    if (strengthCount === 3) return { label: 'Good', color: '#ffcc00' };
    if (strengthCount === 4) return { label: 'Strong', color: '#99cc00' };
    return { label: 'Very Strong', color: '#00cc00' };
  };

  const strength = getStrengthLevel();

  return (
    <div className="password-strength-container">
      {password && (
        <>
          {/* Strength Bar */}
          <div className="strength-bar-container">
            <div 
              className="strength-bar" 
              style={{
                width: `${strengthPercentage}%`,
                backgroundColor: strength.color,
              }}
            ></div>
          </div>
          
          {/* Strength Label */}
          <p className="strength-label" style={{ color: strength.color }}>
            Strength: {strength.label}
          </p>

          {/* Requirements Checklist */}
          <div className="requirements-list">
            <div className={`requirement ${requirements.minLength ? 'met' : ''}`}>
              <span className="check-icon">
                {requirements.minLength ? '✓' : '○'}
              </span>
              <span>At least 8 characters</span>
            </div>
            
            <div className={`requirement ${requirements.uppercase ? 'met' : ''}`}>
              <span className="check-icon">
                {requirements.uppercase ? '✓' : '○'}
              </span>
              <span>One uppercase letter (A-Z)</span>
            </div>
            
            <div className={`requirement ${requirements.lowercase ? 'met' : ''}`}>
              <span className="check-icon">
                {requirements.lowercase ? '✓' : '○'}
              </span>
              <span>One lowercase letter (a-z)</span>
            </div>
            
            <div className={`requirement ${requirements.number ? 'met' : ''}`}>
              <span className="check-icon">
                {requirements.number ? '✓' : '○'}
              </span>
              <span>One number (0-9)</span>
            </div>
            
            <div className={`requirement ${requirements.special ? 'met' : ''}`}>
              <span className="check-icon">
                {requirements.special ? '✓' : '○'}
              </span>
              <span>One special character (!@#$%^&*)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
