/**
 * DATE INPUT COMPONENT
 * ====================
 * Simple, clean date input using native HTML5 date picker
 * Better UX than custom calendar, works across all devices
 * 
 * Features:
 * - Native date picker (OS native on mobile)
 * - Clear visual feedback
 * - Format display in readable form (Jan 5, 2026)
 * - Direct keyboard input support
 * - Min/max date constraints
 */

export default function DateInput({ 
  label, 
  id, 
  value,
  onChange,
  name,
  minDate,
  maxDate
}) {
  // Format date for display (e.g., "Jan 5, 2026")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      
      <div className="date-input-wrapper">
        {/* NATIVE DATE INPUT */}
        <input
          id={id}
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          min={minDate}
          max={maxDate}
          className="form-input date-input-native"
          required
        />
        
        {/* DISPLAY THE FORMATTED DATE */}
        {value && (
          <span className="date-display-text">
            {formatDisplayDate(value)}
          </span>
        )}
      </div>
    </div>
  );
}
