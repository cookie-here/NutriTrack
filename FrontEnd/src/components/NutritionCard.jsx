/**
 * NUTRITION CARD COMPONENT
 * =======================
 * Displays individual nutrition/food item cards
 * Shows emoji, name, category, and description
 */

export default function NutritionCard({ 
  id = 1,
  name = "Food Name", 
  category = "Category",
  emoji = "🍎",
  description = "Food description",
  onClick = () => {}
}) {
  return (
    <div className="nutrition-item-card" onClick={onClick}>
      <div className="nutrition-item-emoji">{emoji}</div>
      <div className="nutrition-item-content">
        <h4>
          {name}
          <span className="nutrition-item-category">{category}</span>
        </h4>
        <p>{description}</p>
      </div>
      <span className="nutrition-item-arrow">→</span>
    </div>
  );
}
