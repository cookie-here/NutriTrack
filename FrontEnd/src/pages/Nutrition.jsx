/**
 * NUTRITION PAGE COMPONENT
 * ========================
 * Displays nutrition guide with recommended foods and tips
 * Trimester-specific nutrition advice
 * Fully modular with reusable sub-components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionHeader from '../components/NutritionHeader';
import NutritionCard from '../components/NutritionCard';
import BottomNavigation from '../components/BottomNavigation';
import '../styles/Nutrition.css';

export default function Nutrition() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recommended');

  // Sample nutrition data - would come from props or API in production
  const nutritionData = {
    trimester: "Trimester 2",
    recommended: [
      {
        id: 1,
        name: "Leafy Greens",
        emoji: "🥬",
        category: "Vegetables",
        description: "Rich in folate and iron"
      },
      {
        id: 2,
        name: "Salmon",
        emoji: "🐟",
        category: "Protein",
        description: "Omega-3 for baby's brain"
      },
      {
        id: 3,
        name: "Greek Yogurt",
        emoji: "🥛",
        category: "Dairy",
        description: "Calcium and protein"
      },
      {
        id: 4,
        name: "Eggs",
        emoji: "🥚",
        category: "Protein",
        description: "Complete protein source"
      },
      {
        id: 5,
        name: "Sweet Potatoes",
        emoji: "🍠",
        category: "Vegetables",
        description: "Vitamin A and fiber"
      },
      {
        id: 6,
        name: "Avocado",
        emoji: "🥑",
        category: "Fruits",
        description: "Healthy fats and folate"
      }
    ],
    avoid: [
      {
        id: 7,
        name: "Raw Fish",
        emoji: "🍣",
        category: "Risk",
        description: "Risk of harmful bacteria"
      },
      {
        id: 8,
        name: "High Mercury Fish",
        emoji: "🐠",
        category: "Risk",
        description: "Can harm baby's development"
      },
      {
        id: 9,
        name: "Soft Cheeses",
        emoji: "🧀",
        category: "Risk",
        description: "Risk of Listeria"
      },
      {
        id: 10,
        name: "Unpasteurized Dairy",
        emoji: "🥛",
        category: "Risk",
        description: "Can contain harmful bacteria"
      }
    ]
  };

  const tips = [
    {
      title: "Focus on nutrient-dense foods",
      description: "Focus on nutrient-dense foods rich in folate, iron, calcium, and protein during pregnancy."
    }
  ];

  return (
    <div className="nutrition-container">
      {/* Nutrition Header */}
      <NutritionHeader onBack={() => navigate('/home')} />

      {/* Main Content */}
      <div className="nutrition-main">
        
        {/* Nutrition Tip */}
        <div className="nutrition-tip-card">
          <div className="nutrition-tip-icon">ℹ️</div>
          <div className="nutrition-tip-content">
            <h3>{tips[0].title}</h3>
            <p>{tips[0].description}</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="nutrition-tabs">
          <button 
            className={`nutrition-tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended Foods
          </button>
          <button 
            className={`nutrition-tab-btn ${activeTab === 'avoid' ? 'active' : ''}`}
            onClick={() => setActiveTab('avoid')}
          >
            Foods to Avoid
          </button>
        </div>

        {/* Foods List */}
        {activeTab === 'recommended' && (
          <div>
            <h3 className="nutrition-section-title">✓ Recommended Foods</h3>
            <div className="nutrition-items-list">
              {nutritionData.recommended.map((food) => (
                <NutritionCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  category={food.category}
                  emoji={food.emoji}
                  description={food.description}
                  onClick={() => console.log(`Clicked: ${food.name}`)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'avoid' && (
          <div>
            <h3 className="nutrition-section-title">⚠ Foods to Avoid</h3>
            <div className="nutrition-items-list">
              {nutritionData.avoid.map((food) => (
                <NutritionCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  category={food.category}
                  emoji={food.emoji}
                  description={food.description}
                  onClick={() => console.log(`Clicked: ${food.name}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Nutrition" />
    </div>
  );
}
