/**
 * SIGNUP PAGE COMPONENT (REFACTORED - MODULAR)
 * =============================================
 * Uses reusable components and custom hooks
 * Much cleaner and more maintainable than before
 * 
 * Components Used:
 * - useForm: Custom hook for form state management
 * - FormInput: Reusable input field component
 * - ErrorMessage: Reusable error display component
 * - AuthHeader: Reusable header with icon/title
 * - AuthFooter: Reusable footer with links
 * - UserTypeSelector: Reusable user type selector
 * - DateInput: Custom date input with calendar picker
 * - SubmitButton: Reusable submit button component
 */

import { useNavigate } from 'react-router-dom';
import { useForm } from '../hooks/useForm';
import FormInput from '../components/FormInput';
import DateInput from '../components/DateInput';
import ErrorMessage from '../components/ErrorMessage';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import UserTypeSelector from '../components/UserTypeSelector';
import SubmitButton from '../components/SubmitButton';
import { register } from '../api';
import '../styles/Auth.css';

export default function Signup() {
  // ===== STATE & HOOKS =====
  const { formData, setFormData, error, isLoading, setError, setIsLoading, handleInputChange } = useForm({
    fullName: '',
    email: '',
    password: '',
    userType: 'pregnant',
    dueDate: ''
  });
  const navigate = useNavigate();

  // ===== HANDLE USER TYPE CHANGE =====
  const handleUserTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      userType: type
    }));
  };

  // ===== FORM SUBMISSION HANDLER =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.dueDate) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (formData.fullName.length < 2) {
      setError('Full name must be at least 2 characters');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        dueDate: formData.dueDate,
      });

      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Header with icon and title */}
        <AuthHeader 
          title="Create Account" 
          subtitle="Let's get to know you better"
        />

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Full Name Input */}
          <FormInput
            label="Full Name"
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Enter your name"
            value={formData.fullName}
            onChange={handleInputChange}
          />

          {/* Email Input */}
          <FormInput
            label="Email"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
          />

          {/* Password Input */}
          <FormInput
            label="Password"
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange}
          />

          {/* User Type Selector */}
          <UserTypeSelector 
            userType={formData.userType} 
            onUserTypeChange={handleUserTypeChange}
          />

          {/* Due Date / Baby Date Input with Calendar Picker */}
          <DateInput
            label={formData.userType === 'pregnant' ? 'Due Date' : 'Baby Date of Birth'}
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
          />

          {/* Error Display */}
          <ErrorMessage message={error} />

          {/* Submit Button */}
          <SubmitButton isLoading={isLoading} defaultText="Continue" />
        </form>

        {/* Footer with Sign In link */}
        <AuthFooter 
          text="Already have an account?"
          linkText="Sign In"
          linkPath="/login"
        />
      </div>
    </div>
  );
}
