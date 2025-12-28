# 🚀 Quick Start Guide - New Pages

## How to Use the New Pages

### 1️⃣ **Accessing the Pages**

Once you log in and reach the Home page, you can access the 4 new pages via:

#### **Option A: Quick Access Grid (Home Page)**
```
Click on any card on the Home page:
🍎 Nutrition Tips   →  Nutrition Page
💉 Vaccines          →  Vaccine Tracker
👶 Feeding Guide     →  Feeding Guide
📈 Growth            →  Growth Tracker
```

#### **Option B: Bottom Navigation (All Pages)**
```
Available on every page at the bottom:
🏠 Home  |  🍎 Nutrition  |  💉 Vaccines  |  👶 Feeding  |  📈 Growth
```

---

## 📄 Page Overview

### 🟢 **Nutrition Page** (`/nutrition`)
**Trimester 2 Nutrition Guide**

**Features:**
- ✓ Recommended foods with details
- ✗ Foods to avoid with warnings
- Tab switching between Recommended/Avoid
- Food categories (Vegetables, Protein, Dairy, etc.)

**Data Location:**
```javascript
// src/pages/Nutrition.jsx - Line ~15-68
const nutritionData = {
  trimester: "Trimester 2",
  recommended: [...],  // Edit foods here
  avoid: [...]         // Edit foods here
}
```

---

### 🔵 **Vaccines Page** (`/vaccines`)
**Vaccine Tracker & Schedule**

**Features:**
- ✓ Three status types (Taken, Pending, Upcoming)
- 📊 Statistics dashboard
- 👥 Filter by Mother/Baby/All
- 🔔 Due date tracking
- 🎯 Mark vaccines as completed

**Interactive Features:**
- Click "Mark Done" to update vaccine status
- Change status badge colors
- Toggle between Mother/Baby vaccines

**Data Location:**
```javascript
// src/pages/Vaccines.jsx - Line ~25-55
const [vaccines, setVaccines] = useState([...])
```

---

### 🔴 **Feeding Guide Page** (`/feeding`)
**Age-Appropriate Feeding Recommendations**

**Features:**
- 👶 Baby age display
- 🍼 Feeding schedule & frequency
- 📋 Guidelines and best practices
- 💡 Tips for monitoring baby health
- Tab switching between Schedule/Tips

**Data Location:**
```javascript
// src/pages/Feeding.jsx - Line ~20-60
const feedingData = {
  babyAge: "5 months",
  schedules: [...],
  guidelines: [...],
  tips: [...]
}
```

---

### 🟣 **Growth Page** (`/growth`)
**Growth Tracking & Milestones**

**Features:**
- 📊 Visual growth chart (weight progression)
- 📏 Current weight & height display
- 🎯 Developmental milestones tracker
- ✅ Toggle milestone completion
- ➕ Button to add new records (future)

**Interactive Features:**
- Click milestone card to toggle completion
- Switch between Weight/Height tabs
- Hover over chart bars to see values

**Data Location:**
```javascript
// src/pages/Growth.jsx - Line ~25-65
const growthData = {...}
const [milestones, setMilestones] = useState([...])
```

---

## 🛠️ Modifying Data

### Example: Add a New Food to Nutrition Page

```javascript
// src/pages/Nutrition.jsx - Line ~53

recommended: [
  // ... existing foods ...
  {
    id: 7,
    name: "Broccoli",              // Food name
    emoji: "🥦",                   // Food emoji
    category: "Vegetables",        // Category
    description: "Rich in vitamins and minerals"  // Benefits
  }
]
```

### Example: Add a New Vaccine

```javascript
// src/pages/Vaccines.jsx - Line ~58

{
  id: 7,
  name: "MMR",                     // Vaccine name
  emoji: "💉",                     // Icon
  description: "Measles, mumps, rubella",
  dueDate: "Apr 15, 2026",         // Due date
  status: "upcoming",              // taken | pending | upcoming
  forPerson: "Baby",               // Mother | Baby
  details: "1 of 1"                // Dose info
}
```

### Example: Add a New Milestone

```javascript
// src/pages/Growth.jsx - Line ~40

{
  id: 6,
  name: "Stands up",
  emoji: "🧍",
  ageInMonths: 9,
  completed: false
}
```

---

## 🎨 Customizing Appearance

### Change Theme Colors

Edit CSS Variables in the respective `.css` files:

**Nutrition.css** (Line ~5)
```css
--nutrition-green: #00c853;        /* Change green theme */
--light-nutrition-green: #e8f5e9;
```

**Vaccines.css** (Line ~6)
```css
--vaccine-blue: #2196f3;           /* Change blue theme */
--light-vaccine-blue: #e3f2fd;
```

**Feeding.css** (Line ~6)
```css
--feeding-pink: #e91e63;           /* Change pink theme */
--light-feeding-pink: #fce4ec;
```

**Growth.css** (Line ~7)
```css
--growth-purple: #9c27b0;          /* Change purple theme */
--light-growth-purple: #f3e5f5;
```

---

## 🔗 Component Reference

### Using NutritionCard
```jsx
<NutritionCard
  id={1}
  name="Leafy Greens"
  category="Vegetables"
  emoji="🥬"
  description="Rich in folate and iron"
  onClick={() => handleClick()}
/>
```

### Using VaccineCard
```jsx
<VaccineCard
  id={1}
  name="Tdap"
  emoji="💉"
  description="Tetanus, diphtheria, pertussis"
  dueDate="Mar 15, 2025"
  status="taken"  // taken | pending | upcoming
  forPerson="Mother"
  details="Single dose"
  onMarkDone={() => handleMarkDone()}
/>
```

### Using MilestoneCard
```jsx
<MilestoneCard
  id={1}
  name="First smile"
  emoji="😊"
  ageInMonths={2}
  completed={true}
  onClick={() => toggleMilestone()}
/>
```

---

## 🔄 Integrating with Backend API

### Example: Fetch Nutrition Data from API

Replace the hardcoded data with API calls:

```jsx
// src/pages/Nutrition.jsx

import { useState, useEffect } from 'react';

export default function Nutrition() {
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from your backend
    fetch('/api/nutrition/trimester-2')
      .then(res => res.json())
      .then(data => {
        setNutritionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // ... rest of the component
  );
}
```

---

## 📌 Important Notes

1. **No Breaking Changes**: All existing pages (Login, Signup, Home) work as before
2. **Fully Modular**: Each page is independent and can be developed separately
3. **Sample Data**: All pages come with sample data for testing
4. **Easy Integration**: Simply replace sample data with API calls
5. **Responsive**: All pages work perfectly on mobile and desktop

---

## 🐛 Troubleshooting

### Pages not showing after navigation?
- Ensure `react-router-dom` is installed
- Check that routes are added in `App.jsx`
- Verify import statements in page files

### Styling not applying?
- Ensure CSS file is imported at top of page component
- Check CSS file path is correct
- Clear browser cache

### Data not updating?
- Use `useState` hook to manage state changes
- Ensure state setter is called on action
- Check console for errors

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routes configuration |
| `src/pages/Nutrition.jsx` | Nutrition page |
| `src/pages/Vaccines.jsx` | Vaccines page |
| `src/pages/Feeding.jsx` | Feeding page |
| `src/pages/Growth.jsx` | Growth page |
| `src/components/BottomNavigation.jsx` | Navigation bar |
| `src/styles/Nutrition.css` | Nutrition styles |
| `src/styles/Vaccines.css` | Vaccines styles |
| `src/styles/Feeding.css` | Feeding styles |
| `src/styles/Growth.css` | Growth styles |

---

**Last Updated**: December 28, 2025
**Status**: ✅ Complete and Ready to Use

