/**
 * QUICK ACCESS GRID COMPONENT
 * ===========================
 * Displays quick access buttons in a 2x2 grid
 * Each item has an icon and label
 * Now navigable with routing
 */

import { useNavigate } from 'react-router-dom';

export default function QuickAccessGrid({ items = [] }) {
  const navigate = useNavigate();

  const defaultItems = [
    {
      id: 1,
      title: "Nutrition Tips",
      icon: "🍎",
      color: "#e8f5e9",
      path: "/nutrition"
    },
    {
      id: 2,
      title: "Vaccines",
      icon: "💉",
      color: "#e3f2fd",
      path: "/vaccines"
    },
    {
      id: 3,
      title: "Feeding Guide",
      icon: "👶",
      color: "#fce4ec",
      path: "/feeding"
    },
    {
      id: 4,
      title: "Growth",
      icon: "📈",
      color: "#f3e5f5",
      path: "/growth"
    }
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <div className="quick-access-section">
      <h2>Quick Access</h2>
      <div className="grid-container">
        {displayItems.map((item) => (
          <div 
            key={item.id} 
            className="grid-item"
            style={{ backgroundColor: item.color, cursor: 'pointer' }}
            onClick={() => item.path && navigate(item.path)}
          >
            <div className="grid-icon">{item.icon}</div>
            <p className="grid-label">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
