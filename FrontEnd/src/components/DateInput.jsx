/**
 * DATE INPUT COMPONENT WITH CALENDAR PICKER
 * ==========================================
 * Custom date input with calendar icon
 * Opens a mini calendar when clicked
 * 
 * Features:
 * - Calendar icon button
 * - Date picker popup
 * - Date formatted display
 * - Keyboard input support
 */

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/DateInput.css';

export default function DateInput({ 
  label, 
  id, 
  value,
  onChange,
  name,
  minDate,
  maxDate
}) {
  // State for date picker visibility
  const [isOpen, setIsOpen] = useState(false);

  // Convert string date to Date object for DatePicker
  const selectedDate = value ? new Date(value) : null;

  // Handle date selection
  const handleDateChange = (date) => {
    // Format date to YYYY-MM-DD format
    const formattedDate = date ? date.toISOString().split('T')[0] : '';
    
    // Create synthetic event to match form input onChange
    const event = {
      target: {
        name: name,
        value: formattedDate
      }
    };
    
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      
      {/* DATE INPUT WRAPPER */}
      <div className="date-input-wrapper">
        
        {/* TEXT INPUT FOR DISPLAY */}
        <input
          id={id}
          type="text"
          className="form-input date-input"
          value={value}
          placeholder="YYYY-MM-DD"
          readOnly
        />

        {/* CALENDAR ICON BUTTON */}
        <button
          type="button"
          className="calendar-icon-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Open Calendar"
        >
          📅
        </button>

        {/* DATE PICKER POPUP */}
        {isOpen && (
          <div className="date-picker-popup">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              minDate={minDate}
              maxDate={maxDate}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        )}
      </div>
    </div>
  );
}
