/**
 * FEEDING HEADER COMPONENT
 * ========================
 * Reusable header for feeding page
 * Displays title, subtitle with back button
 */

export default function FeedingHeader({ onBack = () => {} }) {
  return (
    <div className="feeding-header">
      <button className="feeding-header-back" onClick={onBack}>
        ←
      </button>
      <div className="feeding-header-content">
        <h1>Feeding Guide</h1>
        <p>Age-appropriate feeding recommendations</p>
      </div>
    </div>
  );
}
