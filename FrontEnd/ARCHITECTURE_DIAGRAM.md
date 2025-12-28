# 🗺️ NutriTrack App - Navigation Map & Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN PAGE                               │
│                        (/login)                                  │
│                   [Email & Password]                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP PAGE (Optional)                      │
│                       (/signup)                                  │
│            [Name, Email, User Type, Due Date]                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        HOME PAGE                                 │
│                       (/home)                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Greeting Card]  [Profile Avatar]                      │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ Hi Sarah Johnson!                              │     │   │
│  │  │ Trimester 2 | Due: June 15, 2025              │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Reminders Section]                                     │   │
│  │ ├─ 💉 Vaccine Due Tomorrow                              │   │
│  │ └─ 📅 Doctor Appointment - Dec 5                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Quick Access Grid (2x2)                                 │   │
│  │  ┌──────────┬──────────┐                               │   │
│  │  │🍎        │💉        │                               │   │
│  │  │Nutrition │Vaccines  │◄────┐                         │   │
│  │  ├──────────┼──────────┤     │                         │   │
│  │  │👶        │📈        │     │                         │   │
│  │  │Feeding   │Growth    │     │                         │   │
│  │  └──────────┴──────────┘     │                         │   │
│  └─────────────────────────────────┼─────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💡 Today's Tip                                          │   │
│  │ Stay hydrated! Aim for 8-10 glasses of water daily...   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Bottom Navigation Bar]                                 │   │
│  │ 🏠 Home │ 🍎 Nutrition │ 💉 Vaccines │ 👶 Feeding │ 📈   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────┬──────────────┬──────────────┬──────────────┬────────────┘
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
  (/nutrition)  (/vaccines)   (/feeding)    (/growth)
```

---

## Individual Page Architecture

### 🟢 NUTRITION PAGE (`/nutrition`)

```
┌────────────────────────────────────────────────────┐
│          NUTRITION HEADER                          │
│  [← Back Button] Nutrition Guide                  │
│                  Personalized tips for your stage  │
├────────────────────────────────────────────────────┤
│                                                    │
│  ℹ️ Nutrition Tip Card                            │
│  └─ Focus on nutrient-dense foods...              │
│                                                    │
│  ┌──────────────┬──────────────┐                 │
│  │ Recommended  │ Foods to     │                 │
│  │ Foods        │ Avoid        │ ◄─ TABS         │
│  └──────────────┴──────────────┘                 │
│                                                    │
│  ✓ RECOMMENDED FOODS:                            │
│  ├─ [🥬] Leafy Greens           (Vegetables)    │
│  ├─ [🐟] Salmon                 (Protein)       │
│  ├─ [🥛] Greek Yogurt           (Dairy)         │
│  ├─ [🥚] Eggs                   (Protein)       │
│  ├─ [🍠] Sweet Potatoes         (Vegetables)    │
│  └─ [🥑] Avocado                (Fruits)        │
│                                                    │
│  X FOODS TO AVOID:                               │
│  ├─ [🍣] Raw Fish               (Risk)          │
│  ├─ [🧀] Soft Cheeses           (Risk)          │
│  └─ [...]                                        │
│                                                    │
├────────────────────────────────────────────────────┤
│  [Bottom Navigation: 🍎 Active]                   │
└────────────────────────────────────────────────────┘
```

### 🔵 VACCINES PAGE (`/vaccines`)

```
┌────────────────────────────────────────────────────┐
│          VACCINES HEADER                           │
│  [← Back Button] Vaccine Tracker                  │
│                  Track vaccination schedule        │
├────────────────────────────────────────────────────┤
│                                                    │
│  STATISTICS:                                       │
│  ┌──────────┬──────────┬──────────┐              │
│  │ ✓        │ ⏱        │ 3        │              │
│  │ 1        │ 2        │ Upcoming │              │
│  │ Completed│ Pending  │          │              │
│  └──────────┴──────────┴──────────┘              │
│                                                    │
│  [All Vaccines] [Mother] [Baby] ◄─ TABS          │
│                                                    │
│  VACCINE CARDS:                                    │
│  ├─ [💉] Tdap                    ✓ Taken        │
│  │   Tetanus, diphtheria, pertussis              │
│  │   👤 Mother | Single dose                      │
│  │   📅 Due: Mar 15, 2025                        │
│  │                                                │
│  ├─ [💉] Flu Shot                ⏰ Upcoming    │
│  │   Annual influenza vaccine                     │
│  │   👤 Mother | Yearly                          │
│  │   📅 Due: Dec 1, 2025                         │
│  │   [Mark Done]                                 │
│  │                                                │
│  ├─ [💉] Hepatitis B              ✓ Taken       │
│  │   First dose at birth                          │
│  │   👤 Baby | 1 of 3                            │
│  │   📅 Due: Jan 15, 2025                        │
│  │                                                │
│  └─ [...]                                        │
│                                                    │
├────────────────────────────────────────────────────┤
│  [Bottom Navigation: 💉 Active]                   │
└────────────────────────────────────────────────────┘
```

### 🔴 FEEDING PAGE (`/feeding`)

```
┌────────────────────────────────────────────────────┐
│          FEEDING HEADER                            │
│  [← Back Button] Feeding Guide                    │
│                  Age-appropriate recommendations  │
├────────────────────────────────────────────────────┤
│                                                    │
│  [👶] BABY AGE: 5 months                          │
│  Age-appropriate feeding recommendations          │
│                                                    │
│  [Feeding Schedule] [Tips & Guidance] ◄─ TABS    │
│                                                    │
│  ℹ️ Feeding Guideline                            │
│  Exclusive breastfeeding or formula feeding       │
│  recommended for the first 6 months.              │
│                                                    │
│  🍼 FEEDING SCHEDULE                              │
│  ├─ Every 2-3 hours                              │
│  ├─ Breast/Formula                               │
│  ├─ 8-12 times per day                           │
│  │                                                │
│  ├─ Recommended Amount:                           │
│  │  2-4 oz per feeding (formula)                  │
│  │  Until satisfied (breastfeeding)              │
│  │                                                │
│  └─ Feeding Tips:                                │
│     ◆ Feed on demand                             │
│     ◆ 2-4 oz per feeding                         │
│     ◆ Until satisfied                            │
│     ◆ Watch for hunger cues                      │
│                                                    │
├────────────────────────────────────────────────────┤
│  [Bottom Navigation: 👶 Active]                   │
└────────────────────────────────────────────────────┘
```

### 🟣 GROWTH PAGE (`/growth`)

```
┌────────────────────────────────────────────────────┐
│          GROWTH HEADER                             │
│  [← Back Button] Growth Tracker          [+ Add]  │
│                  Track baby's development         │
├────────────────────────────────────────────────────┤
│                                                    │
│  CURRENT STATS:                                    │
│  ├─ [⬆️]  Current Weight: 7.1 kg                  │
│  │        Last updated: Nov 30, 2025              │
│  │                                                │
│  └─ [📏] Current Height: 68 cm                   │
│         5 months old                              │
│                                                    │
│  [Weight (kg)] [Height (cm)] ◄─ TABS             │
│                                                    │
│  GROWTH CHART:                                     │
│  │                                        │8      │
│  │                    ▁╔╗                 ▎ 6      │
│  │              ▁╔╗╔╦╦╩╚╗╔╗               ▎ 4      │
│  │       ▁╔╦╦╦═╝╚╩╩╩  └─╝╚╗              ▎ 2      │
│  ├─┬──┬─╨┴┴┴──────────────┴──┬───┬───┬──────────┤
│  │0m│1m│2m│3m│4m│5m              │
│  │  ○─ Average                    │
│  │  ●─ Baby's weight              │
│                                                    │
│  DEVELOPMENTAL MILESTONES:                        │
│  ├─ [😊] First smile             ✓ 2 months    │
│  ├─ [💪] Holds head up           ✓ 3 months    │
│  ├─ [🔄] Rolls over              ✓ 4 months    │
│  ├─ [🪑] Sits up                   6 months    │
│  └─ [🍃] Crawls                    8 months    │
│                                                    │
├────────────────────────────────────────────────────┤
│  [Bottom Navigation: 📈 Active]                   │
└────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App (Router)
│
├── Login
├── Signup
├── Home
│   ├── GreetingCard
│   ├── ReminderCard
│   ├── QuickAccessGrid
│   │   └── [Navigates to → Nutrition, Vaccines, Feeding, Growth]
│   ├── TipCard
│   └── BottomNavigation
│       └── [Navigates to → All pages]
│
├── Nutrition
│   ├── NutritionHeader
│   ├── NutritionCard (multiple)
│   └── BottomNavigation
│
├── Vaccines
│   ├── VaccinesHeader
│   ├── VaccineCard (multiple)
│   └── BottomNavigation
│
├── Feeding
│   ├── FeedingHeader
│   ├── [Various info cards]
│   └── BottomNavigation
│
└── Growth
    ├── GrowthHeader
    ├── MilestoneCard (multiple)
    ├── [Growth chart section]
    └── BottomNavigation
```

---

## State Management Flow

```
Page Component
│
├── useState(activeTab)
│   └── Controls which tab content is displayed
│
├── useState(data)
│   └── Stores page-specific data
│
├── useState(items)
│   └── Stores list items (vaccines, milestones, etc.)
│
└── Event Handlers
    ├── onClick → Navigate or toggle state
    ├── onChange → Update form inputs
    ├── onMarkDone → Update item status
    └── onAddRecord → Add new item

(Future: Replace with useContext or Redux for global state)
```

---

## Routing Structure

```
/                      → Redirect to /login
/login                 → Login Page
/signup                → Signup Page
/home                  → Home Dashboard
│
├── /nutrition         → Nutrition Guide Page
├── /vaccines          → Vaccine Tracker Page
├── /feeding           → Feeding Guide Page
└── /growth            → Growth Tracker Page

Navigation:
• Quick Access Grid (Home) → Click card → Navigate to page
• Bottom Navigation (All pages) → Click icon → Navigate to page
• Header back button → Navigate to /home
```

---

## Data Flow

```
Render Page
    ↓
Define/Load Data
    ↓
Render Components
    ├── Pass data via props
    ├── Pass handlers via props
    └── Components render UI
    ↓
User Interaction
    ├── Click button
    ├── Toggle state
    └── Update display
    ↓
Re-render (if state changed)
    ↓
Display updated content

(Production: Replace with API calls in useEffect)
```

---

## Styling Architecture

```
App Styles
├── :root (CSS Variables)
├── Global styles
└── Page-specific styles

Nutrition.css
├── CSS Variables (--nutrition-green, etc.)
├── Container styles (.nutrition-container)
├── Header styles (.nutrition-header)
├── Content styles (.nutrition-main)
├── Card styles (.nutrition-item-card)
└── Utility styles

Vaccines.css
├── CSS Variables (--vaccine-blue, etc.)
├── Container styles
├── Header styles
├── Stats styles
├── Card styles
└── Status badges

Feeding.css
├── CSS Variables (--feeding-pink, etc.)
├── Similar structure to others

Growth.css
├── CSS Variables (--growth-purple, etc.)
├── Chart container styles
├── Milestone card styles
└── Progress indicators
```

---

## Color Theming

```
🟢 Nutrition (Green Theme)
   Primary: #00c853
   Light: #e8f5e9
   Dark: #00701a

🔵 Vaccines (Blue Theme)
   Primary: #2196f3
   Light: #e3f2fd
   Dark: #1565c0

🔴 Feeding (Pink Theme)
   Primary: #e91e63
   Light: #fce4ec
   Dark: #ad1457

🟣 Growth (Purple Theme)
   Primary: #9c27b0
   Light: #f3e5f5
   Dark: #6a1b9a
```

---

## Feature Availability

```
LOGIN        → Email, Password
    ↓
SIGNUP       → Name, Email, User Type, Due Date
    ↓
HOME         → Greeting, Reminders, Quick Access, Tips
    ↓
NUTRITION    → Food cards, Categories, Tabs
    ↓
VACCINES     → Status tracking, Filtering, Mark Done
    ↓
FEEDING      → Age-based guide, Schedule, Tips
    ↓
GROWTH       → Charts, Milestones, Toggle progress
```

---

## Responsive Breakpoints

```
Mobile (< 600px)
├── Full width pages
├── Single column layout
├── Large touch targets
└── Readable fonts

Tablet (600px - 900px)
├── Optimized spacing
├── 2-column grids
└── Balanced layout

Desktop (> 900px)
├── Max-width container
├── Optimal readability
└── Full feature access

(All pages scale perfectly)
```

---

## Accessibility Features

✓ Semantic HTML
✓ Clear headings hierarchy
✓ Good color contrast
✓ Touch-friendly buttons
✓ Clear visual feedback
✓ Readable fonts
✓ Proper spacing

---

*Architecture Diagram - Last Updated: December 28, 2025*

