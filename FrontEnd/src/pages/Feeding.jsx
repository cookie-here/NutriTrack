import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedingHeader from '../components/FeedingHeader';
import BottomNavigation from '../components/BottomNavigation';
import { useBabyContext } from '../context/BabyContext';
import { getAuthToken } from '../api';
import { getBabyAgeMonths, calculateBabyAgeDetailed } from '../utils/babyAge';
import '../styles/Feeding.css';

// Dynamic feeding schedules based on baby age
const FEEDING_SCHEDULES = {
  0: {
    title: '0-1 Months',
    schedules: [
      {
        id: 1,
        type: 'Breastfeeding',
        frequency: '8-12 times per day',
        amount: 'Until satisfied (usually 10-20 minutes per side)',
        notes: ['Cluster feeding common', 'Feed on demand', 'Look for 6-8 wet diapers daily']
      },
      {
        id: 2,
        type: 'Formula Feeding',
        frequency: 'Every 2-3 hours',
        amount: '2-3 oz per feeding',
        notes: ['Feed on demand', 'Burp frequently', 'Gradually increase amounts']
      }
    ]
  },
  1: {
    title: '1-3 Months',
    schedules: [
      {
        id: 1,
        type: 'Breastfeeding',
        frequency: '7-9 times per day',
        amount: 'Until satisfied',
        notes: ['Nursing typically 10-15 minutes', 'More predictable patterns emerging', 'Milk supply is established']
      },
      {
        id: 2,
        type: 'Formula Feeding',
        frequency: 'Every 3-4 hours',
        amount: '3-5 oz per feeding',
        notes: ['Regular feeding schedule', 'Total ~20-30 oz daily', 'Watch for satiety cues']
      }
    ]
  },
  3: {
    title: '3-5 Months',
    schedules: [
      {
        id: 1,
        type: 'Breastfeeding',
        frequency: '6-8 times per day',
        amount: 'Until satisfied',
        notes: ['More efficient nursing', 'Feeds may be shorter', 'May go longer between feeds']
      },
      {
        id: 2,
        type: 'Formula Feeding',
        frequency: 'Every 4 hours',
        amount: '4-6 oz per feeding',
        notes: ['More structured schedule', 'Total ~24-32 oz daily', 'Baby showing more control']
      },
      {
        id: 3,
        type: 'Night Feeds',
        frequency: 'May drop to 1-2 times',
        amount: 'Smaller feeds as needed',
        notes: ['Some babies may sleep through night', 'Continue feeding if baby wakes hungry', 'Do not force night feeds']
      }
    ]
  },
  6: {
    title: '6+ Months',
    schedules: [
      {
        id: 1,
        type: 'Breastfeeding',
        frequency: '4-6 times per day',
        amount: 'Until satisfied',
        notes: ['Continue alongside solids', 'Still primary nutrition source', 'Can introduce from cup']
      },
      {
        id: 2,
        type: 'Formula Feeding',
        frequency: '3-4 times per day',
        amount: '6-8 oz per feeding',
        notes: ['Total ~24-32 oz daily', 'Combined with solid foods', 'Transition to sippy cup']
      },
      {
        id: 3,
        type: 'Starting Solids',
        frequency: '1-2 times daily to start',
        amount: '1-2 tablespoons, increase gradually',
        notes: ['Iron-fortified cereal first', 'Single ingredient foods', 'Introduce new foods every 3-5 days', 'Watch for allergic reactions']
      },
      {
        id: 4,
        type: 'Finger Foods',
        frequency: 'Alongside milk feeds',
        amount: 'Small, soft pieces',
        notes: ['Soft fruits and vegetables', 'Well-cooked grains', 'Age-appropriate textures only']
      }
    ]
  },
  9: {
    title: '9+ Months',
    schedules: [
      {
        id: 1,
        type: 'Breastfeeding',
        frequency: '3-4 times per day',
        amount: 'Until satisfied',
        notes: ['Continue through first year', 'Feed and solid food pattern forming']
      },
      {
        id: 2,
        type: 'Formula Feeding',
        frequency: '2-3 times per day',
        amount: '7-9 oz per feeding',
        notes: ['Continue with meals and snacks', 'Can offer from cup more often']
      },
      {
        id: 3,
        type: 'Three Meals + Snacks',
        frequency: '3 meals + 1-2 snacks',
        amount: '3-4 tablespoons per meal',
        notes: ['Soft mashed or chopped foods', 'Finger foods baby can self-feed', 'Remove choking hazards']
      }
    ]
  }
};

const FEEDING_MILESTONES = [
  { age: '0-1 months', milestone: 'Rooting and sucking reflexes working perfectly' },
  { age: '1-3 months', milestone: 'Feeding pattern becomes more predictable' },
  { age: '3-5 months', milestone: 'Baby may start showing interest in watching you eat' },
  { age: '5-6 months', milestone: 'Ready for first solids when can sit with support and show interest' },
  { age: '6-8 months', milestone: 'Progressing to more textured foods and self-feeding exploration' },
  { age: '8-10 months', milestone: 'Pincer grasp developing - can pick up finger foods' },
  { age: '10-12 months', milestone: 'Eating more table foods with family meals' }
];

export default function Feeding() {
  const navigate = useNavigate();
  const { selectedBaby, babies, setSelectedBaby } = useBabyContext();
  const [activeTab, setActiveTab] = useState('schedule');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [_showBabySelector, _setShowBabySelector] = useState(false);
  const [babyData, setBabyData] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [feedingLogs, setFeedingLogs] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [logForm, setLogForm] = useState({
    time: new Date().toISOString().slice(0, 16),
    type: 'breast',
    duration: '15',
    amount: '',
    notes: ''
  });

  const [reminderForm, setReminderForm] = useState({
    type: 'feeding',
    interval: '180',
    enabled: true
  });

  // Fetch baby data on mount
  useEffect(() => {
    const fetchBabyData = async () => {
      try {
        const token = getAuthToken();
        if (token && selectedBaby) {
          setBabyData(selectedBaby);
        }
      } catch (error) {
        console.error('Error fetching baby data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBabyData();
    loadFeedingLogs();
  }, [selectedBaby]);

  // Calculate baby age in months
  const babyAgeMonths = babyData ? getBabyAgeMonths(babyData.date_of_birth) : 0;
  const babyAgeLabel = babyData ? calculateBabyAgeDetailed(babyData.date_of_birth).label : 'Age unknown';

  // Get appropriate schedule for baby age
  const getSchedule = () => {
    if (babyAgeMonths >= 9) return FEEDING_SCHEDULES[9];
    if (babyAgeMonths >= 6) return FEEDING_SCHEDULES[6];
    if (babyAgeMonths >= 3) return FEEDING_SCHEDULES[3];
    if (babyAgeMonths >= 1) return FEEDING_SCHEDULES[1];
    return FEEDING_SCHEDULES[0];
  };

  const currentSchedule = getSchedule();

  // Feeding log functions
  const loadFeedingLogs = () => {
    const logs = JSON.parse(localStorage.getItem('feedingLogs') || '[]');
    setFeedingLogs(logs.sort((a, b) => new Date(b.time) - new Date(a.time)));
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(),
      ...logForm,
      date: new Date().toLocaleDateString()
    };
    const logs = [newLog, ...feedingLogs];
    setFeedingLogs(logs);
    localStorage.setItem('feedingLogs', JSON.stringify(logs));
    setLogForm({
      time: new Date().toISOString().slice(0, 16),
      type: 'breast',
      duration: '15',
      amount: '',
      notes: ''
    });
    alert('Feeding logged successfully!');
    setShowLogModal(false);
  };

  const handleDeleteLog = (logId) => {
    const logs = feedingLogs.filter(log => log.id !== logId);
    setFeedingLogs(logs);
    localStorage.setItem('feedingLogs', JSON.stringify(logs));
  };

  const handleSetReminder = (e) => {
    e.preventDefault();
    const newReminder = {
      id: Date.now(),
      ...reminderForm
    };
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    localStorage.setItem('feedingReminders', JSON.stringify(updatedReminders));
    alert('Reminder set successfully!');
    setShowReminder(false);
  };

  const guidelines = [
    { title: 'Exclusive Feeding Recommendation', icon: 'ℹ️', content: 'Exclusive breastfeeding or iron-fortified formula recommended for the first 6 months.' },
    { title: 'Introducing Solids', icon: '🍽️', content: 'Start solids around 6 months when baby can sit with support and shows interest. Begin with single-ingredient purees.' },
    { title: 'Vitamin D Supplement', icon: '💊', content: 'Babies who are breastfed should receive 400 IU Vitamin D daily; formula-fed babies may need supplementation.' },
    { title: 'Allergy Watch', icon: '⚠️', content: 'Introduce common potential allergens (peanut, egg) around 6 months per pediatric guidance; watch for reactions.' },
    { title: 'Bottle & Paced Feeding Safety', icon: '🍼', content: 'Hold the baby upright and pace bottles to encourage self-regulation. Avoid propping bottles or feeding lying flat.' },
    { title: 'Burping & Reflux', icon: '🫧', content: 'Burp mid-feed and after; if frequent spitting up or discomfort occurs, discuss with your pediatrician.' },
    { title: 'Safe Milk Storage', icon: '🧊', content: 'Store expressed milk in clean, labeled containers. Use within 4 hours at room temp, 4 days refrigerated.' },
    { title: 'Clean Feeding Equipment', icon: '🧼', content: 'Wash and sterilize bottles and nipples regularly. Inspect for wear and replace cracked parts.' },
    { title: 'Feeding When Unwell', icon: '🤒', content: 'Offer small, frequent feeds if baby is sick and contact your pediatrician if feeding drops significantly.' },
    { title: 'When to Contact Provider', icon: '📞', content: 'Call your provider for poor weight gain, very few wet diapers, persistent vomiting, or high fever.' }
  ];

  return (
    <div className="feeding-container">
      <FeedingHeader onBack={() => navigate('/home')} />

      <div className="feeding-main">
        {/* Baby Selector - Show if multiple babies */}
        {babies && babies.length > 1 && (
          <div className="baby-selector-container">
            <label className="baby-selector-label">👶 Baby:</label>
            <select
              value={selectedBaby?.id || ''}
              onChange={(e) => {
                const baby = babies.find(b => b.id === parseInt(e.target.value));
                if (baby) setSelectedBaby(baby);
              }}
              className="baby-selector-dropdown"
            >
              {babies.map((baby) => (
                <option key={baby.id} value={baby.id}>
                  {baby.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Baby Age Card */}
        <div className="baby-age-card">
          <div className="baby-age-emoji">👶</div>
          <div className="baby-age-content">
            <h3>
              {babyData ? babyData.name : 'Baby'} - {babyAgeLabel}
            </h3>
            <p>{currentSchedule.title}</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="feeding-quick-actions">
          <button 
            className="action-btn log-btn"
            onClick={() => setShowLogModal(true)}
            title="Log a feeding session"
          >
            📝 Log Feeding
          </button>
          <button 
            className="action-btn reminder-btn"
            onClick={() => setShowReminder(true)}
            title="Set feeding reminder"
          >
            🔔 Set Reminder
          </button>

        </div>

        {/* Feeding Tabs */}
        <div className="feeding-tabs">
          <button
            className={`feeding-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Feeding Schedule
          </button>
          <button
            className={`feeding-tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            Guidelines & Tips
          </button>
          <button
            className={`feeding-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            📊 Logs ({feedingLogs.length})
          </button>
          <button
            className={`feeding-tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            🏆 Milestones
          </button>
        </div>

        {/* Feeding Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            {currentSchedule.schedules.map((s) => (
              <div key={s.id} className="feeding-schedule-card">
                <div className="feeding-schedule-header">
                  <div className="feeding-schedule-icon">🍼</div>
                  <h3>{s.type}</h3>
                </div>
                <div className="feeding-schedule-details">
                  <div className="detail-row">
                    <span className="label">Frequency:</span>
                    <span className="value">{s.frequency}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">{s.amount}</span>
                  </div>
                </div>
                <h4>Tips</h4>
                <ul className="notes-list">
                  {s.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="tab-content">
            <h3 className="feeding-section-title">Guidelines & Tips</h3>
            {guidelines.map((g) => (
              <div key={g.title} className="feeding-guideline-card">
                <div className="feeding-guideline-icon">{g.icon}</div>
                <div className="feeding-guideline-content">
                  <h4>{g.title}</h4>
                  <p>{g.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feeding Logs Tab */}
        {activeTab === 'logs' && (
          <div className="tab-content">
            <h3 className="feeding-section-title">Feeding History</h3>
            {feedingLogs.length === 0 ? (
              <div className="empty-state">
                <p>No feeding logs yet. Start logging to track patterns!</p>
              </div>
            ) : (
              <div className="logs-list">
                {feedingLogs.map((log) => (
                  <div key={log.id} className="log-entry">
                    <div className="log-header">
                      <span className="log-time">{new Date(log.time).toLocaleString()}</span>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="log-details">
                      <span className="log-type">{log.type === 'breast' ? '🤱' : '🍼'} {log.type}</span>
                      {log.duration && <span className="log-duration">⏱️ {log.duration} min</span>}
                      {log.amount && <span className="log-amount">📊 {log.amount} oz</span>}
                    </div>
                    {log.notes && <p className="log-notes">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="tab-content">
            <h3 className="feeding-section-title">Feeding Milestones</h3>
            <div className="milestones-list">
              {FEEDING_MILESTONES.map((m, idx) => (
                <div key={idx} className="milestone-card">
                  <div className="milestone-age">{m.age}</div>
                  <div className="milestone-content">
                    <p>{m.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Feeding Log Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Feeding</h2>
              <button 
                className="modal-close"
                onClick={() => setShowLogModal(false)}
              >
                ✕
              </button>
            </div>
            <form className="feeding-log-form" onSubmit={handleAddLog}>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="datetime-local"
                  value={logForm.time}
                  onChange={(e) => setLogForm({ ...logForm, time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={logForm.type}
                  onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                >
                  <option value="breast">Breastfeeding</option>
                  <option value="bottle">Bottle</option>
                  <option value="formula">Formula</option>
                  <option value="solids">Solids</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={logForm.duration}
                  onChange={(e) => setLogForm({ ...logForm, duration: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Amount (oz) - if applicable</label>
                <input
                  type="number"
                  value={logForm.amount}
                  onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                  min="0"
                  step="0.5"
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="Any observations..."
                  rows="3"
                />
              </div>
              <button type="submit" className="submit-btn">Log Feeding</button>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminder && (
        <div className="modal-overlay" onClick={() => setShowReminder(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Set Feeding Reminder</h2>
              <button 
                className="modal-close"
                onClick={() => setShowReminder(false)}
              >
                ✕
              </button>
            </div>
            <form className="reminder-form" onSubmit={handleSetReminder}>
              <div className="form-group">
                <label>Reminder Type</label>
                <select
                  value={reminderForm.type}
                  onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value })}
                >
                  <option value="feeding">Feeding Time</option>
                  <option value="bottle-prep">Bottle Preparation</option>
                  <option value="pump">Pumping Time</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reminder Interval (minutes)</label>
                <select
                  value={reminderForm.interval}
                  onChange={(e) => setReminderForm({ ...reminderForm, interval: e.target.value })}
                >
                  <option value="60">Every hour</option>
                  <option value="120">Every 2 hours</option>
                  <option value="180">Every 3 hours</option>
                  <option value="240">Every 4 hours</option>
                  <option value="360">Every 6 hours</option>
                </select>
              </div>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={reminderForm.enabled}
                  onChange={(e) => setReminderForm({ ...reminderForm, enabled: e.target.checked })}
                />
                <label htmlFor="enabled">Enable this reminder</label>
              </div>
              <button type="submit" className="submit-btn">Set Reminder</button>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation activeTab="Feeding" />
    </div>
  );
}
