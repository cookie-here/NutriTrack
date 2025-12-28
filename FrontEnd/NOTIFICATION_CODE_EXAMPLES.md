# 📱 System Notification Code Examples

## Basic Usage Examples

### 1. Send a Simple Notification
```javascript
import NotificationService from '../services/NotificationService';

// Send a basic notification
await NotificationService.sendNotification('Hello', {
  body: 'This is a test notification'
});
```

### 2. Request Permission
```javascript
const hasPermission = await NotificationService.requestPermission();
if (hasPermission) {
  console.log('User granted notification permission');
}
```

### 3. Check if Vaccine is Due in 7 Days
```javascript
const dueDate = "2025-01-04";
if (NotificationService.isDueWithinWeek(dueDate)) {
  console.log('This vaccine is due within 7 days!');
}
```

### 4. Calculate Days Remaining
```javascript
const daysLeft = NotificationService.calculateDaysRemaining("2025-01-04");
console.log(`Vaccine due in ${daysLeft} days`);
```

### 5. Send Vaccine Reminders
```javascript
const upcomingVaccines = [
  {
    id: 1,
    name: "Tdap",
    dueDate: "2025-01-05",
    status: "upcoming",
    forPerson: "Mother"
  },
  {
    id: 2,
    name: "Flu Shot",
    dueDate: "2025-01-10",
    status: "pending",
    forPerson: "Mother"
  }
];

await NotificationService.sendVaccineReminders(upcomingVaccines);
```

### 6. Initialize on App Load
```javascript
import { useEffect } from 'react';
import NotificationService from '../services/NotificationService';

export default function App() {
  useEffect(() => {
    const init = async () => {
      const hasPermission = await NotificationService.initialize();
      console.log('Notifications:', hasPermission ? 'enabled' : 'disabled');
    };
    init();
  }, []);

  return <div>App Content</div>;
}
```

---

## Real-World Integration Examples

### Example 1: Home Page Notification on Load
```javascript
// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import NotificationService from '../services/NotificationService';

export default function Home() {
  const [vaccinesData] = useState([
    { id: 1, name: "Tdap", dueDate: "2025-01-05", status: "taken", forPerson: "Mother" },
    { id: 2, name: "Flu", dueDate: "2026-01-04", status: "upcoming", forPerson: "Mother" }
  ]);

  useEffect(() => {
    const initNotifications = async () => {
      // Initialize notifications (requests permission if needed)
      const hasPermission = await NotificationService.initialize();

      if (hasPermission) {
        // Get vaccines due within 7 days
        const upcoming = vaccinesData.filter(v => 
          v.status !== 'taken' && NotificationService.isDueWithinWeek(v.dueDate)
        );

        if (upcoming.length > 0) {
          // Send notification with 1 second delay
          setTimeout(() => {
            NotificationService.sendVaccineReminders(upcoming);
          }, 1000);
        }
      }
    };

    initNotifications();
  }, []);

  return <div>Home Page Content</div>;
}
```

### Example 2: Marking Vaccine as Complete
```javascript
// src/pages/Vaccines.jsx
import { useState } from 'react';
import NotificationService from '../services/NotificationService';

export default function Vaccines() {
  const [vaccines, setVaccines] = useState([...]);

  const handleMarkDone = (id) => {
    const vaccine = vaccines.find(v => v.id === id);

    // Update vaccine status
    setVaccines(vaccines.map(v => 
      v.id === id ? { ...v, status: 'taken' } : v
    ));

    // Send completion notification
    if (Notification.permission === 'granted') {
      NotificationService.sendNotification(
        `✓ ${vaccine.name} Completed`,
        {
          body: `You've completed the ${vaccine.name} vaccine for ${vaccine.forPerson}.`,
          tag: `completed-${id}`,
          vibrate: [200, 100, 200]
        }
      );
    }
  };

  return (
    <button onClick={() => handleMarkDone(1)}>Mark Done</button>
  );
}
```

### Example 3: Permission Request Banner
```javascript
// src/components/NotificationBanner.jsx
import { useState } from 'react';
import NotificationService from '../services/NotificationService';

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(
    NotificationService.isSupported() && 
    NotificationService.getPermission() === 'default'
  );

  const handleEnable = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="banner">
      <h3>Enable Notifications</h3>
      <p>Get reminders for upcoming vaccines</p>
      <button onClick={handleEnable}>Enable</button>
      <button onClick={() => setIsVisible(false)}>Not Now</button>
    </div>
  );
}
```

---

## Advanced Usage

### Example 4: Custom Notification with Actions
```javascript
// Send notification with action buttons
await NotificationService.sendNotification('Vaccine Due', {
  body: 'Tdap vaccine is due in 3 days',
  tag: 'tdap-reminder',
  requireInteraction: true,
  vibrate: [200, 100, 200],
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
});
```

### Example 5: Batch vs Single Vaccines
```javascript
// NotificationService automatically handles this:
// - 1 vaccine → Detailed notification
// - 2+ vaccines → Summary notification

const vaccines = [
  { id: 1, name: 'Tdap', dueDate: '2025-01-05', status: 'upcoming', forPerson: 'Mother' },
  { id: 2, name: 'Flu', dueDate: '2025-01-10', status: 'pending', forPerson: 'Mother' }
];

// Single vaccine example
await NotificationService.sendVaccineReminders([vaccines[0]]);
// Output: "💉 Tdap - URGENT REMINDER"
// Body: "Due in X days for Mother. Please schedule appointment."

// Multiple vaccines example
await NotificationService.sendVaccineReminders(vaccines);
// Output: "🔔 2 Vaccine Reminders - URGENT"
// Body: "Tdap, Flu are due within 7 days. Please check schedule."
```

### Example 6: Check Permission Status
```javascript
import NotificationService from '../services/NotificationService';

// Method 1: Check if browser supports notifications
if (!NotificationService.isSupported()) {
  console.log('Browser does not support notifications');
}

// Method 2: Get current permission status
const status = NotificationService.getPermission();
switch (status) {
  case 'granted':
    console.log('Notifications are enabled');
    break;
  case 'denied':
    console.log('User denied notifications');
    break;
  case 'default':
    console.log('Permission not yet requested');
    break;
}

// Method 3: Request permission
const granted = await NotificationService.requestPermission();
```

---

## Testing Examples

### Test 1: Create Test Vaccine Due Tomorrow
```javascript
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const testVaccine = {
  id: 999,
  name: "Test Vaccine",
  dueDate: tomorrow.toISOString().split('T')[0],
  status: "pending",
  forPerson: "Test"
};

// Should return true
console.log(NotificationService.isDueWithinWeek(testVaccine.dueDate));
```

### Test 2: Test Permission Flow
```javascript
async function testNotifications() {
  // Step 1: Check support
  console.log('Support:', NotificationService.isSupported());

  // Step 2: Request permission
  const granted = await NotificationService.requestPermission();
  console.log('Permission:', granted);

  // Step 3: Send test notification
  if (granted) {
    await NotificationService.sendNotification('Test', {
      body: 'This is a test notification'
    });
    console.log('Notification sent');
  }
}

testNotifications();
```

### Test 3: Send All Vaccine Types
```javascript
const testVaccines = [
  {
    id: 1,
    name: "Tdap",
    dueDate: "2025-01-05",
    status: "pending",
    forPerson: "Mother"
  },
  {
    id: 2,
    name: "Hepatitis B",
    dueDate: "2025-01-08",
    status: "upcoming",
    forPerson: "Baby"
  },
  {
    id: 3,
    name: "DtaP",
    dueDate: "2025-01-10",
    status: "pending",
    forPerson: "Baby"
  }
];

// This will send a batch notification for 3 vaccines
await NotificationService.sendVaccineReminders(testVaccines);
```

---

## Troubleshooting Examples

### Issue: Notifications Not Appearing
```javascript
// Check 1: Browser support
if (!NotificationService.isSupported()) {
  console.error('Notifications not supported');
}

// Check 2: Permission status
const permission = NotificationService.getPermission();
console.log('Permission:', permission);

// Check 3: Protocol
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('Notifications require HTTPS');
}

// Check 4: Service Worker (if using)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations);
  });
}
```

### Issue: Date Calculation Wrong
```javascript
// Check date format
const dateString = "2025-01-04";
const date = new Date(dateString);
console.log('Parsed date:', date);

// Verify days calculation
const days = NotificationService.calculateDaysRemaining(dateString);
console.log('Days remaining:', days);

// Manually calculate
const today = new Date();
const dueDate = new Date(dateString);
const msPerDay = 1000 * 60 * 60 * 24;
const manualDays = Math.ceil((dueDate - today) / msPerDay);
console.log('Manual calculation:', manualDays);
```

---

## Best Practices

✅ **DO:**
- Request permission on user interaction (button click)
- Show permission banner only once
- Use descriptive notification titles
- Include vaccine name and days remaining
- Send notifications in relevant timezone
- Test on actual devices

❌ **DON'T:**
- Auto-request permission on page load
- Send spam notifications
- Use generic titles like "Alert"
- Request permission multiple times
- Assume HTTPS in development
- Send notifications without user action

