/**
 * NUTRITION CARD COMPONENT
 * =======================
 * Displays individual nutrition/food item cards
 * Shows emoji, name, category, and description
 */

export default function NutritionCard({ 
  food,
  id = 1,
  name = "Food Name", 
  category = "Category",
  emoji = "🍎",
  description = "Food description",
  onClick = () => {}
}) {
  // If food object is passed, use its properties
  const displayName = food?.name || name;
  const displayCategory = food?.category || category;
  const displayEmoji = food?.emoji || emoji;
  const displayDescription = food?.description || description;
  const displayId = food?.id || id;

  return (
    <div className="nutrition-item-card" onClick={onClick}>
      <div className="nutrition-item-emoji">{displayEmoji}</div>
      <div className="nutrition-item-content">
        <h4>
          {displayName}
          <span className="nutrition-item-category">{displayCategory}</span>
        </h4>
        <p>{displayDescription}</p>
      </div>
      <span className="nutrition-item-arrow">→</span>
    </div>
  );
}
