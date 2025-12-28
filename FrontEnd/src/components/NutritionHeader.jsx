/**
 * NUTRITION HEADER COMPONENT
 * ==========================
 * Reusable header for nutrition page
 * Displays title, subtitle with back button
 */

export default function NutritionHeader({ onBack = () => {} }) {
  return (
    <div className="nutrition-header">
      <button className="nutrition-header-back" onClick={onBack}>
        ←
      </button>
      <div className="nutrition-header-content">
        <h1>Nutrition Guide</h1>
        <p>Personalized tips for your stage</p>
      </div>
    </div>
  );
}
