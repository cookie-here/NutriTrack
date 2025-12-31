/**
 * THEME CONTEXT
 * ==============
 * Provides global dark mode state management across the app
 * Persists theme preference in localStorage
 */

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme Provider Component
export function ThemeProvider({ children }) {
  // Initialize state from localStorage or default to false (light mode)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('nutritrack-dark-mode');
    return savedTheme === 'true';
  });

  // Update localStorage and body class when darkMode changes
  useEffect(() => {
    localStorage.setItem('nutritrack-dark-mode', darkMode);
    
    // Apply dark mode class to document body
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Value to be provided to consumers
  const value = {
    darkMode,
    setDarkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
