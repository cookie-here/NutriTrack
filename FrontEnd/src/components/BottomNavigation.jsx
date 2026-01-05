/**
 * BOTTOM NAVIGATION COMPONENT
 * ===========================
 * Mobile navigation bar with 5 main sections
 * Active state indicated by color
 * Now navigable with routing
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BottomNavigation({ activeTab = "Home", userType: userTypeProp }) {
  const navigate = useNavigate();

  const inferredUserType = userTypeProp || localStorage.getItem('userType') || localStorage.getItem('selectedStage') || 'pregnant';

  const tabs = useMemo(() => {
    if (inferredUserType === 'pregnant') {
      return [
        { id: 1, label: "Home", icon: "🏠", path: "/home" },
        { id: 2, label: "Nutrition", icon: "🍎", path: "/nutrition" },
        { id: 3, label: "Vaccines", icon: "💉", path: "/vaccines" }
      ];
    }

    // new parents keep full set
    return [
      { id: 1, label: "Home", icon: "🏠", path: "/home" },
      { id: 2, label: "Nutrition", icon: "🍎", path: "/nutrition" },
      { id: 3, label: "Vaccines", icon: "💉", path: "/vaccines" },
      { id: 4, label: "Feeding", icon: "👶", path: "/feeding" },
      { id: 5, label: "Growth", icon: "📈", path: "/growth" }
    ];
  }, [inferredUserType]);

  return (
    <nav className="bottom-navigation">
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
