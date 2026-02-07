/**
 * PREGNANT NUTRITION PAGE COMPONENT
 * ==================================
 * Minimal nutrition guide specifically for pregnant users
 * Displays trimester-specific nutrition advice and safe foods
 * Clean, easy-to-understand layout
 */

import { useState, useEffect } from 'react';
import NutritionHeader from '../components/NutritionHeader';
import NutritionCard from '../components/NutritionCard';
import BottomNavigation from '../components/BottomNavigation';
import { getPregnancyFoods, getNutritionTips, getCurrentUser } from '../api';
import '../styles/Nutrition.css';

const DAY_MS = 24 * 60 * 60 * 1000;

const calculateTrimester = (dueDateString) => {
  if (!dueDateString) return { trimester: 'Unknown', weeksPregnant: null };

  const dueDate = new Date(dueDateString);
  if (Number.isNaN(dueDate.getTime())) return { trimester: 'Unknown', weeksPregnant: null };

  const today = new Date();
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const estimatedLmp = new Date(dueDate.getTime() - 280 * DAY_MS);
  const normalizedLmp = new Date(estimatedLmp.getFullYear(), estimatedLmp.getMonth(), estimatedLmp.getDate());

  const daysPregnant = Math.floor((normalizedToday - normalizedLmp) / DAY_MS);
  if (daysPregnant < 0) return { trimester: 'Unknown', weeksPregnant: 0 };

  const weeksPregnant = Math.min(40, Math.floor(daysPregnant / 7));

  if (weeksPregnant < 13) {
    return { trimester: 'Trimester 1', weeksPregnant };
  }
  if (weeksPregnant < 28) {
    return { trimester: 'Trimester 2', weeksPregnant };
  }
  return { trimester: 'Trimester 3', weeksPregnant };
};

export default function PregnantNutrition() {
  const [activeTab, setActiveTab] = useState('recommended');
  const [nutritionTips, setNutritionTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrimester, setCurrentTrimester] = useState('Unknown');
  const [foodItems, setFoodItems] = useState({ recommended: [], avoid: [] });

  // Fetch nutrition data on mount
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const [tipsData, foodItemsData, user] = await Promise.all([
          getNutritionTips(),
          getPregnancyFoods(),
          getCurrentUser().catch(() => null)
        ]);
        
        setNutritionTips(tipsData.tips || []);
        
        // Set food items from API, fallback to empty arrays if not available
        if (foodItemsData) {
          setFoodItems({
            recommended: foodItemsData.recommended || [],
            avoid: foodItemsData.avoid || []
          });
        }

        if (user) {
          const { trimester } = calculateTrimester(user.due_date);
          setCurrentTrimester(trimester);
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        // Continue with empty state if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionData();
  }, []);

  // Pregnancy-specific nutrition data
  const pregnancyNutritionData = {
    trimester: currentTrimester,
    recommended: foodItems.recommended,
    avoid: foodItems.avoid
  };

  if (loading) {
    return (
      <div className="nutrition-container">
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        <BottomNavigation activeTab="Nutrition" userType="pregnant" />
      </div>
    );
  }

  return (
    <div className="nutrition-container">
      {/* Header */}
      <NutritionHeader 
        trimester={pregnancyNutritionData.trimester}
        userType="pregnant"
      />

      {/* Main Content */}
      <div className="nutrition-content">
        {/* Tab Navigation */}
        <div className="nutrition-tabs">
          <button
            className={`tab-button ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            ✅ Recommended Foods
          </button>
          <button
            className={`tab-button ${activeTab === 'avoid' ? 'active' : ''}`}
            onClick={() => setActiveTab('avoid')}
          >
            ⚠️ Foods to Avoid
          </button>
        </div>

        {/* Food Cards */}
        <div className="nutrition-grid">
          {activeTab === 'recommended' && 
            pregnancyNutritionData.recommended.map(food => (
              <NutritionCard key={food.id} food={food} />
            ))
          }
          {activeTab === 'avoid' && 
            pregnancyNutritionData.avoid.map(food => (
              <NutritionCard key={food.id} food={food} />
            ))
          }
        </div>

        {/* Tips Section */}
        {nutritionTips.length > 0 && (
          <div className="nutrition-tips-section">
            <h3>💡 Nutrition Tips</h3>
            <div className="tips-list">
              {nutritionTips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Nutrition" userType="pregnant" />
    </div>
  );
}
