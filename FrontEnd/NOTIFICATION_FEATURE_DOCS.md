# 🔔 System Notification Feature Documentation

## Overview
The NutriTrack app now includes a comprehensive system notification feature that alerts users about upcoming vaccines via:
1. **Home Page Alert** - In-app notification card showing vaccines due within 7 days
2. **System Notifications** - Browser push notifications on device
3. **Vaccine Page Highlighting** - Visual indicators (URGENT badge) on vaccine tracker

---

## Features

### 1. Permission Banner
- **Location**: Displayed on Home page if permissions not granted
- **Purpose**: Requests user permission to send notifications
- **Behavior**: 
  - Only shows once (can be dismissed)
  - "Enable" button requests permission
  - "Not Now" dismisses temporarily
  - Close button hides banner

### 2. Automatic Vaccine Reminders
- **Trigger**: On app load, checks for vaccines due within 7 days
- **Notification Types**:
  - **Single Vaccine**: If 1 vaccine due
    ```
    Title: "💉 Vaccine Name - URGENT REMINDER"
    Body: "Due in X days for Person. Please schedule appointment."
    ```
  - **Multiple Vaccines**: If 2+ vaccines due
    ```
    Title: "🔔 X Vaccine Reminders - URGENT"
    Body: "Vaccine1, Vaccine2... are due within 7 days. Please check schedule."
    ```

### 3. Completion Notifications
- **Trigger**: When user marks vaccine as done on Vaccines page
- **Notification**:
  ```
  Title: "✓ Vaccine Name Completed"
  Body: "Great! You've completed the Vaccine Name vaccine for Person."
  ```

### 4. Visual Indicators
- **Home Page**: NotificationCard component with:
  - Orange/yellow theme
  - Pulsing bell icon 🔔
  - List of upcoming vaccines
  - Dismissible with close button
  - "X days left" badges

- **Vaccines Page**: 
  - Orange left border on urgent vaccines
  - Pulsing "⚠ URGENT" badge
  - Enhanced visual prominence

---

## Technical Implementation

### NotificationService (`src/services/NotificationService.js`)

**Static Methods:**

#### `isSupported()`
Checks if browser supports Notification API
```javascript
const supported = NotificationService.isSupported();
```

#### `getPermission()`
Returns current permission status: 'granted', 'denied', or 'default'
```javascript
const permission = NotificationService.getPermission();
```

#### `requestPermission()`
Async function to request notification permissions
```javascript
const granted = await NotificationService.requestPermission();
```

#### `sendNotification(title, options)`
Sends a single system notification
```javascript
await NotificationService.sendNotification('Title', {
  body: 'Message',
  tag: 'unique-id',
  vibrate: [200, 100, 200],
  requireInteraction: true
});
```

#### `sendVaccineReminders(vaccines)`
Sends vaccine reminders (single or batch)
```javascript
const upcomingVaccines = [...];
await NotificationService.sendVaccineReminders(upcomingVaccines);
```

#### `isDueWithinWeek(dateString)`
Checks if vaccine is due within 7 days
```javascript
const isDue = NotificationService.isDueWithinWeek('2025-01-04');
```

#### `calculateDaysRemaining(dateString)`
Returns number of days until vaccine is due
```javascript
const days = NotificationService.calculateDaysRemaining('2025-01-04');
```

#### `initialize()`
Async initialization - requests permissions on app load
```javascript
const hasPermission = await NotificationService.initialize();
```

### NotificationBanner Component (`src/components/NotificationBanner.jsx`)
- Displays permission request banner
- Checks if notifications are supported
- Only shows if permission is 'default' (not yet granted)
- Provides "Enable" and "Not Now" buttons

### NotificationBanner Styling (`src/styles/NotificationBanner.css`)
- Blue gradient background (#2196f3 to #1976d2)
- Animated slide-down entrance
- Bouncing bell icon
- Responsive design for mobile
- Hover effects on buttons

---

## Integration Points

### Home Page (`src/pages/Home.jsx`)
```javascript
// Initialization in useEffect
useEffect(() => {
  const initializeNotifications = async () => {
    const hasPermission = await NotificationService.initialize();
    setNotificationPermission(hasPermission);

    const upcomingVaccines = vaccinesData.filter(vaccine => {
      if (vaccine.status === 'taken') return false;
      return NotificationService.isDueWithinWeek(vaccine.dueDate);
    });

    if (upcomingVaccines.length > 0 && hasPermission) {
      setTimeout(() => {
        NotificationService.sendVaccineReminders(upcomingVaccines);
      }, 1000);
    }
  };
  initializeNotifications();
}, []);

// In JSX
<NotificationBanner 
  onPermissionChange={(granted) => setNotificationPermission(granted)}
/>
```

### Vaccines Page (`src/pages/Vaccines.jsx`)
```javascript
const handleMarkDone = (id) => {
  const vaccineToMark = vaccines.find(v => v.id === id);
  
  setVaccines(vaccines.map(v => 
    v.id === id ? { ...v, status: 'taken' } : v
  ));

  if (vaccineToMark && Notification.permission === 'granted') {
    NotificationService.sendNotification(
      `✓ ${vaccineToMark.name} Completed`,
      {
        body: `Great! You've completed the ${vaccineToMark.name} vaccine for ${vaccineToMark.forPerson}.`,
        tag: `vaccine-completed-${id}`
      }
    );
  }
};
```

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge 50+
- ✅ Firefox 48+
- ✅ Safari 16+
- ✅ Opera 37+

### Requirements
- HTTPS connection (required for notifications)
- User grant permission
- Notification API support

---

## User Flow

### 1. First Visit
```
User visits app → NotificationBanner appears
→ User clicks "Enable" → Permission request dialog
→ User approves → App sends vaccination reminders
```

### 2. Vaccine Reminder Triggered
```
App loads → Checks for vaccines due in 7 days
→ Finds upcoming vaccines → Sends system notification
→ User clicks notification → App focuses/navigates
```

### 3. Marking Vaccine as Done
```
User on Vaccines page → Clicks "Mark Done"
→ Vaccine status updated → Completion notification sent
→ User sees success message on device
```

---

## Notification Options

### Default Options Applied
```javascript
{
  icon: '/vite.svg',           // App icon
  badge: '/vite.svg',          // Badge icon
  tag: 'vaccine-reminder',     // Prevent duplicates
  requireInteraction: true,    // Don't auto-dismiss
  vibrate: [200, 100, 200],   // Vibration pattern
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
}
```

---

## Testing

### Manual Testing Steps

1. **Permission Request**
   - Visit app on fresh browser
   - Verify banner appears
   - Click "Enable" → approve in browser dialog
   - Verify notification appears

2. **Automatic Reminder**
   - Create a vaccine with dueDate within 7 days
   - Reload app
   - Verify system notification appears

3. **Completion Notification**
   - Navigate to Vaccines page
   - Click "Mark Done" on upcoming vaccine
   - Verify completion notification appears

4. **Vaccine Page Highlighting**
   - Navigate to Vaccines page
   - Verify vaccines due in 7 days have:
     - Orange left border
     - "⚠ URGENT" badge with pulsing animation

---

## Troubleshooting

### Notifications Not Appearing
1. Check browser supports Notification API
2. Verify HTTPS connection
3. Check notification permission in browser settings
4. Ensure `Notification.permission === 'granted'`

### Permission Denied
- Can't re-request programmatically
- User must change in browser settings
- Each browser has different permission UI

### No Permission Banner
- Already granted/denied → banner won't show
- Check browser console: `Notification.permission`
- To reset: browser → settings → site permissions → notifications → remove

---

## Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| `src/services/NotificationService.js` | NEW | Notification service with all logic |
| `src/components/NotificationBanner.jsx` | NEW | Permission request banner component |
| `src/styles/NotificationBanner.css` | NEW | Banner styling and animations |
| `src/pages/Home.jsx` | UPDATED | Added notification initialization and banner |
| `src/pages/Vaccines.jsx` | UPDATED | Added completion notifications |

---

## Future Enhancements

- [ ] Scheduled notifications using Service Worker
- [ ] Notification history/log
- [ ] Custom notification sound
- [ ] Recurring reminders (daily/weekly)
- [ ] Timezone-aware notifications
- [ ] Integration with calendar apps
- [ ] Rich notifications with images
- [ ] Custom vibration patterns per vaccine type

---

## Notes

- Notifications require HTTPS in production
- Local development (localhost) works without HTTPS
- Service Worker can be added for background notifications
- Data is currently sample; integrate with backend API for real data
