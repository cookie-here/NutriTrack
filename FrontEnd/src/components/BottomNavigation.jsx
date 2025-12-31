/**
 * BOTTOM NAVIGATION COMPONENT
 * ===========================
 * Mobile navigation bar with 5 main sections
 * Active state indicated by color
 * Now navigable with routing
 */

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function BottomNavigation({ activeTab = "Home" }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const tabs = [
    { id: 1, label: "Home", icon: "🏠", path: "/home" },
    { id: 2, label: "Nutrition", icon: "🍎", path: "/nutrition" },
    { id: 3, label: "Vaccines", icon: "💉", path: "/vaccines" },
    { id: 4, label: "Feeding", icon: "👶", path: "/feeding" },
    { id: 5, label: "Growth", icon: "📈", path: "/growth" }
  ];

  return (
    <nav className={`bottom-navigation ${darkMode ? 'dark-mode' : ''}`}>
      {tabs.map((tab) => (
        <div 
          key={tab.id} 
          className={`nav-item ${activeTab === tab.label ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
          style={{ cursor: 'pointer' }}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </div>
      ))}
    </nav>
  );
}
