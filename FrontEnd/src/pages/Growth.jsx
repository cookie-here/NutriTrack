/**
 * GROWTH PAGE COMPONENT
 * ====================
 * Displays growth tracking with babies and milestones
 * Allows adding babies and recording weekly growth measurements
 * Shows growth charts and developmental milestones
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GrowthHeader from '../components/GrowthHeader';
import MilestoneCard from '../components/MilestoneCard';
import BabyCard from '../components/BabyCard';
import BabyForm from '../components/BabyForm';
import GrowthInput from '../components/GrowthInput';
import BottomNavigation from '../components/BottomNavigation';
import { useBabyContext } from '../context/BabyContext';
import { calculateBabyAgeDetailed } from '../utils/babyAge';
import { 
  createBaby, 
  updateBaby,
  deleteBaby,
  getBabyGrowthRecords,
  createGrowthRecord,
  deleteGrowthRecord 
} from '../api';
import '../styles/Growth.css';

export default function Growth() {
  const navigate = useNavigate();
  const { babies, selectedBaby, setSelectedBaby, setBabies } = useBabyContext();
  const [activeTab, setActiveTab] = useState('babies');
  const [growthRecords, setGrowthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBabyForm, setShowBabyForm] = useState(false);
  const [showGrowthInput, setShowGrowthInput] = useState(false);
  const [editingBaby, setEditingBaby] = useState(null);
  const [babyFormLoading, setBabyFormLoading] = useState(false);
  const [growthInputLoading, setGrowthInputLoading] = useState(false);
  
  // Fetch babies on mount
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        if (selectedBaby) {
          fetchGrowthRecords(selectedBaby.id);
        }
      } catch (error) {
        console.error('Error fetching babies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBabies();
  }, [selectedBaby]);

  const fetchGrowthRecords = async (babyId) => {
    try {
      const data = await getBabyGrowthRecords(babyId);
      setGrowthRecords(data.growth_records || []);
    } catch (error) {
      console.error('Error fetching growth records:', error);
    }
  };

  const handleAddBaby = async (babyData) => {
    setBabyFormLoading(true);
    try {
      const newBaby = await createBaby(babyData);
      setBabies([...babies, newBaby]);
      setSelectedBaby(newBaby);
      setShowBabyForm(false);
      setEditingBaby(null);
      fetchGrowthRecords(newBaby.id);
      alert('Baby added successfully!');
    } catch (error) {
      console.error('Error adding baby:', error);
      alert('Failed to add baby: ' + error.message);
    } finally {
      setBabyFormLoading(false);
    }
  };

  const handleUpdateBaby = async (babyData) => {
    setBabyFormLoading(true);
    try {
      const updatedBaby = await updateBaby(editingBaby.id, babyData);
      setBabies(babies.map(b => b.id === updatedBaby.id ? updatedBaby : b));
      setSelectedBaby(updatedBaby);
      setShowBabyForm(false);
      setEditingBaby(null);
      alert('Baby updated successfully!');
    } catch (error) {
      console.error('Error updating baby:', error);
      alert('Failed to update baby: ' + error.message);
    } finally {
      setBabyFormLoading(false);
    }
  };

  const handleDeleteBaby = async (babyId) => {
    if (window.confirm('Are you sure you want to delete this baby record?')) {
      try {
        await deleteBaby(babyId);
        const updatedBabies = babies.filter(b => b.id !== babyId);
        setBabies(updatedBabies);
        
        if (selectedBaby?.id === babyId) {
          if (updatedBabies.length > 0) {
            setSelectedBaby(updatedBabies[0]);
            fetchGrowthRecords(updatedBabies[0].id);
          } else {
            setSelectedBaby(null);
            setGrowthRecords([]);
          }
        }
        alert('Baby record deleted successfully!');
      } catch (error) {
        console.error('Error deleting baby:', error);
        alert('Failed to delete baby: ' + error.message);
      }
    }
  };

  const handleEditBaby = (baby) => {
    setEditingBaby(baby);
    setShowBabyForm(true);
  };

  const handleAddGrowthRecord = async (recordData) => {
    setGrowthInputLoading(true);
    try {
      await createGrowthRecord(recordData);
      setShowGrowthInput(false);
      if (selectedBaby) {
        fetchGrowthRecords(selectedBaby.id);
      }
      alert('Growth record added successfully!');
    } catch (error) {
      console.error('Error adding growth record:', error);
      alert('Failed to add growth record: ' + error.message);
    } finally {
      setGrowthInputLoading(false);
    }
  };

  const handleDeleteGrowthRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this growth record?')) {
      try {
        await deleteGrowthRecord(recordId);
        setGrowthRecords(growthRecords.filter(r => r.id !== recordId));
        alert('Growth record deleted successfully!');
      } catch (error) {
        console.error('Error deleting growth record:', error);
        alert('Failed to delete growth record: ' + error.message);
      }
    }
  };

  const _calculateAge = (dob) => {
    return calculateBabyAgeDetailed(dob).label;
  };

  const [milestones, setMilestones] = useState([
    {
      id: 1,
      name: "First smile",
      emoji: "😊",
      ageInMonths: 2,
      completed: true
    },
    {
      id: 2,
      name: "Holds head up",
      emoji: "💪",
      ageInMonths: 3,
      completed: true
    },
    {
      id: 3,
      name: "Rolls over",
      emoji: "🔄",
      ageInMonths: 4,
      completed: true
    },
    {
      id: 4,
      name: "Sits up",
      emoji: "🪑",
      ageInMonths: 6,
      completed: false
    },
    {
      id: 5,
      name: "Crawls",
      emoji: "🍃",
      ageInMonths: 8,
      completed: false
    }
  ]);

  const toggleMilestone = (id) => {
    setMilestones(milestones.map(m =>
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const [chartMetric, setChartMetric] = useState('weight');

  // Calculate growth chart data
  const chartPoints = growthRecords
    .slice()
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: record.weight_kg,
      height: record.height_cm,
      head: record.head_circumference_cm,
    }));

  const metricConfig = {
    weight: { label: 'Weight', unit: 'kg', icon: '⚖️' },
    height: { label: 'Height', unit: 'cm', icon: '📏' },
    head: { label: 'Head Circumference', unit: 'cm', icon: '🧠' },
  };

  const metric = metricConfig[chartMetric];
  const chartValues = chartPoints
    .map(point => ({ ...point, value: point[chartMetric] }))
    .filter(point => point.value !== null && point.value !== undefined);

  const chartMin = chartValues.length > 0 ? Math.min(...chartValues.map(p => p.value)) : 0;
  const chartMax = chartValues.length > 0 ? Math.max(...chartValues.map(p => p.value)) : 0;
  const chartRange = chartMax - chartMin || 1;

  const buildLinePath = () => {
    if (chartValues.length === 0) return '';
    const width = 300;
    const height = 140;
    const padding = 12;
    const stepX = (width - padding * 2) / Math.max(chartValues.length - 1, 1);
    return chartValues
      .map((point, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((point.value - chartMin) / chartRange) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  if (loading) {
    return <div className="growth-container"><p>Loading...</p></div>;
  }

  return (
    <div className="growth-container">
      {/* Growth Header */}
      <GrowthHeader 
        onBack={() => navigate('/home')}
      />

      {/* Main Content */}
      <div className="growth-main">
        
        {/* Tab Selection */}
        <div className="growth-tabs">
          <button 
            className={`growth-tab-btn ${activeTab === 'babies' ? 'active' : ''}`}
            onClick={() => setActiveTab('babies')}
          >
            👶 Babies
          </button>
          <button 
            className={`growth-tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
            disabled={!selectedBaby}
          >
            📈 Growth Tracking
          </button>
          <button 
            className={`growth-tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
            disabled={!selectedBaby}
          >
            🎯 Milestones
          </button>
        </div>

        {/* Babies Tab */}
        {activeTab === 'babies' && (
          <div className="babies-section">
            <div className="section-header">
              <h2>Your Babies</h2>
              <button 
                className="add-button"
                onClick={() => navigate('/add-baby')}
              >
                + Add Baby
              </button>
            </div>

            {showBabyForm && (
              <BabyForm 
                onSubmit={editingBaby ? handleUpdateBaby : handleAddBaby}
                isLoading={babyFormLoading}
                initialData={editingBaby}
              />
            )}

            {babies.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">👶</p>
                <p className="empty-text">No babies added yet. Click "Add Baby" to get started!</p>
              </div>
            ) : (
              <div className="babies-list">
                {babies.map(baby => (
                  <BabyCard 
                    key={baby.id}
                    baby={baby}
                    onEdit={handleEditBaby}
                    onDelete={handleDeleteBaby}
                    onViewGrowth={(babyId) => {
                      const baby = babies.find(b => b.id === babyId);
                      setSelectedBaby(baby);
                      fetchGrowthRecords(babyId);
                      setActiveTab('tracking');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Growth Tracking Tab */}
        {activeTab === 'tracking' && selectedBaby && (
          <div className="tracking-section">
            <div className="section-header">
              <h2>📈 Growth Tracking: {selectedBaby.name}</h2>
              <button 
                className="add-button"
                onClick={() => setShowGrowthInput(!showGrowthInput)}
              >
                {showGrowthInput ? '✕ Cancel' : '+ Record Measurement'}
              </button>
            </div>

            {showGrowthInput && (
              <GrowthInput 
                babyId={selectedBaby.id}
                onSubmit={handleAddGrowthRecord}
                isLoading={growthInputLoading}
                onCancel={() => setShowGrowthInput(false)}
              />
            )}

            {/* Current Stats */}
            {growthRecords.length > 0 && (
              <>
                <div className="current-stats-card">
                  <div className="current-stat-item">
                    <div className="current-stat-emoji">⬆️</div>
                    <div className="current-stat-content">
                      <h3>Current Weight</h3>
                      <p className="current-stat-value">{growthRecords[0].weight_kg} kg</p>
                      <p>{new Date(growthRecords[0].date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="current-stat-item">
                    <div className="current-stat-emoji">📏</div>
                    <div className="current-stat-content">
                      <h3>Current Height</h3>
                      <p className="current-stat-value">{growthRecords[0].height_cm} cm</p>
                      <p>Age: {_calculateAge(selectedBaby.date_of_birth)}</p>
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="growth-chart-card">
                  <div className="growth-chart-header">
                    <h3>{metric.icon} {metric.label} Progress</h3>
                    <div className="growth-metric-toggle">
                      <button
                        className={`metric-btn ${chartMetric === 'weight' ? 'active' : ''}`}
                        onClick={() => setChartMetric('weight')}
                      >
                        Weight
                      </button>
                      <button
                        className={`metric-btn ${chartMetric === 'height' ? 'active' : ''}`}
                        onClick={() => setChartMetric('height')}
                      >
                        Height
                      </button>
                      <button
                        className={`metric-btn ${chartMetric === 'head' ? 'active' : ''}`}
                        onClick={() => setChartMetric('head')}
                      >
                        Head
                      </button>
                    </div>
                  </div>
                  {chartValues.length > 0 ? (
                    <div className="growth-line-chart">
                      <svg viewBox="0 0 300 140" className="growth-line-svg" role="img" aria-label={`${metric.label} trend`}>
                        <path className="growth-line" d={buildLinePath()} />
                        {chartValues.map((point, index) => {
                          const width = 300;
                          const height = 140;
                          const padding = 12;
                          const stepX = (width - padding * 2) / Math.max(chartValues.length - 1, 1);
                          const x = padding + index * stepX;
                          const y = height - padding - ((point.value - chartMin) / chartRange) * (height - padding * 2);
                          return (
                            <circle
                              key={`${point.date}-${index}`}
                              className="growth-line-point"
                              cx={x}
                              cy={y}
                              r="3"
                            />
                          );
                        })}
                      </svg>
                      <div className="growth-line-meta">
                        <span>{chartValues[0].date}</span>
                        <span>{chartValues[chartValues.length - 1].date}</span>
                      </div>
                      <div className="growth-line-value">
                        Latest: {chartValues[chartValues.length - 1].value} {metric.unit}
                      </div>
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      No growth records yet. Add your first measurement!
                    </p>
                  )}
                </div>

                {/* Growth Records Table */}
                <div className="growth-records-card">
                  <h3>📋 All Measurements</h3>
                  {growthRecords.length > 0 ? (
                    <div className="records-table">
                      <div className="table-header">
                        <div className="table-cell">Date</div>
                        <div className="table-cell">Weight (kg)</div>
                        <div className="table-cell">Height (cm)</div>
                        <div className="table-cell">Head Circumference (cm)</div>
                        <div className="table-cell">Action</div>
                      </div>
                      {growthRecords.map(record => (
                        <div key={record.id} className="table-row">
                          <div className="table-cell">
                            {new Date(record.date).toLocaleDateString()}
                          </div>
                          <div className="table-cell">{record.weight_kg}</div>
                          <div className="table-cell">{record.height_cm}</div>
                          <div className="table-cell">
                            {record.head_circumference_cm || '-'}
                          </div>
                          <div className="table-cell">
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteGrowthRecord(record.id)}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      No measurements recorded yet.
                    </p>
                  )}
                </div>
              </>
            )}

            {growthRecords.length === 0 && !showGrowthInput && (
              <div className="empty-state">
                <p className="empty-icon">📊</p>
                <p className="empty-text">No growth measurements yet. Click "Record Measurement" to add the first one!</p>
              </div>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && selectedBaby && (
          <div className="milestones-section">
            <h2>🎯 Developmental Milestones: {selectedBaby.name}</h2>
            <p className="milestones-subtitle">Age: {_calculateAge(selectedBaby.date_of_birth)} months</p>
            <div className="milestones-list">
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  id={milestone.id}
                  name={milestone.name}
                  emoji={milestone.emoji}
                  ageInMonths={milestone.ageInMonths}
                  completed={milestone.completed}
                  onClick={() => toggleMilestone(milestone.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="Growth" />
    </div>
  );
}
