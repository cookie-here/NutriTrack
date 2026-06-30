const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const suppressError = options.suppressError || false;
  delete options.suppressError;
  
  // Add auth token to headers if available
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  // Add ngrok bypass header if using ngrok
  if (API_URL.includes('ngrok')) {
    options.headers = {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true',
    };
  }
  
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      let detail = 'Request failed';
      try {
        const data = await res.json();
        detail = data.detail || detail;
      } catch {
        // ignore json parse errors
        detail = `HTTP ${res.status}: ${res.statusText}`;
      }
      
      // Suppress console error for 401s on optional calls
      if (res.status === 401 && suppressError) {
        throw new Error(detail);
      }
      
      throw new Error(detail);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error(`Cannot connect to server at ${API_URL}. Please check your network connection and ensure the backend is running.`);
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return data; // { access_token, token_type }
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token. User not logged in.');
  }
  return request('/api/auth/me', {
    method: 'GET',
    suppressError: true
  });
}

export async function register({ fullName, email, dueDate, userType, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      due_date: dueDate || null,
      user_type: userType,
    }),
  });
}

// ===== Static Data Endpoints =====
export async function getDailyTip() {
  return request('/api/static/daily-tip');
}

export async function getNutritionTips() {
  return request('/api/static/nutrition-tips');
}

export async function getVaccineSchedule() {
  return request('/api/static/vaccine-schedule');
}

export async function getFeedingGuide() {
  return request('/api/static/feeding-guide');
}

export async function getSafeFoods() {
  return request('/api/static/safe-foods');
}

// ===== Growth Records =====
export async function getGrowthRecords() {
  return request('/api/growth/records');
}

export async function createGrowthRecord(recordData) {
  return request('/api/growth/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recordData),
  });
}

export async function deleteGrowthRecord(recordId) {
  return request(`/api/growth/records/${recordId}`, {
    method: 'DELETE',
  });
}

export async function updateGrowthRecord(recordId, recordData) {
  return request(`/api/growth/records/${recordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
}

// ===== Babies =====
export async function getBabies() {
  return request('/api/babies');
}

export async function getBaby(babyId) {
  return request(`/api/babies/${babyId}`);
}

export async function createBaby(babyData) {
  return request('/api/babies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(babyData),
  });
}

export async function updateBaby(babyId, babyData) {
  return request(`/api/babies/${babyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(babyData),
  });
}

export async function deleteBaby(babyId) {
  return request(`/api/babies/${babyId}`, {
    method: 'DELETE',
  });
}

export async function getBabyGrowthRecords(babyId) {
  return request(`/api/babies/${babyId}/growth`);
}

// ===== Static Growth Milestones Reference =====
export async function getGrowthMilestonesStatic() {
  return request('/api/static/growth-milestones');
}

// ===== Per-Baby Milestone Progress =====
export async function getMilestones(babyId) {
  return request(`/api/milestones/${babyId}`);
}

export async function createMilestone(milestoneData) {
  return request('/api/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(milestoneData),
  });
}

export async function updateMilestone(milestoneId, milestoneData) {
  return request(`/api/milestones/${milestoneId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(milestoneData),
  });
}

export async function deleteMilestone(milestoneId) {
  return request(`/api/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
}

// ===== Reminders =====
export async function getReminders() {
  return request('/api/reminders/');
}

export async function createReminder(reminderData) {
  return request('/api/reminders/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reminderData),
  });
}

export async function completeReminder(reminderId) {
  return request(`/api/reminders/${reminderId}/complete`, {
    method: 'PATCH',
  });
}

export async function deleteReminder(reminderId) {
  return request(`/api/reminders/${reminderId}`, {
    method: 'DELETE',
  });
}

// ===== Profile Endpoints =====
export async function getUserProfile() {
  return request('/api/profile', {
    method: 'GET',
  });
}

export async function updateUserProfile(profileData) {
  return request('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
}

export async function saveEmergencyContact(contactData) {
  return request('/api/profile/emergency-contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });
}

export async function getEmergencyContact() {
  return request('/api/profile/emergency-contact', {
    method: 'GET',
  });
}

export async function deleteEmergencyContact() {
  return request('/api/profile/emergency-contact', {
    method: 'DELETE',
  });
}

export async function sendPartnerInvite(partnerEmail) {
  return request('/api/profile/partner-invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partner_email: partnerEmail }),
  });
}

export async function getPartnerInvitations() {
  return request('/api/profile/partner-invitations', {
    method: 'GET',
  });
}

export async function acceptPartnerInvitation(invitationId) {
  return request(`/api/profile/partner-invitations/${invitationId}/accept`, {
    method: 'PATCH',
  });
}

export async function declinePartnerInvitation(invitationId) {
  return request(`/api/profile/partner-invitations/${invitationId}/decline`, {
    method: 'PATCH',
  });
}

// ===== Vaccine Endpoints =====
export async function getAllVaccines() {
  return request('/api/vaccines');
}

export async function getVaccineById(vaccineId) {
  return request(`/api/vaccines/${vaccineId}`);
}

export async function getUserVaccineReminders(babyId = null) {
  const query = babyId ? `?baby_id=${babyId}` : '';
  return request(`/api/vaccines/reminders/user${query}`);
}

export async function createVaccineReminder(vaccineData) {
  return request('/api/vaccines/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vaccineData),
  });
}

export async function updateVaccineReminderStatus(reminderId, statusData) {
  return request(`/api/vaccines/reminders/${reminderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });
}

export async function deleteVaccineReminder(reminderId) {
  return request(`/api/vaccines/reminders/${reminderId}`, {
    method: 'DELETE',
  });
}

// ===== Food Items =====
export async function getAllFoods() {
  return request('/api/foods/all');
}

export async function getPregnancyFoods() {
  return request('/api/foods/pregnancy');
}

export async function getFoodsByType(type) {
  return request(`/api/foods/type/${type}`);
}

export async function getFoodsByCategory(category) {
  return request(`/api/foods/category/${category}`);
}

export async function createFood(foodData) {
  return request('/api/foods/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData),
  });
}

export async function updateFood(foodId, foodData) {
  return request(`/api/foods/update/${foodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodData),
  });
}

export async function deleteFood(foodId) {
  return request(`/api/foods/delete/${foodId}`, {
    method: 'DELETE',
  });
}

export async function getFoodsByNutrientGroup(group) {
  return request(`/api/foods/nutrient-group/${encodeURIComponent(group)}`);
}

export async function getFoodsByTrimester(trimester) {
  return request(`/api/foods/trimester/${trimester}`);
}

export async function getFoodsByDietType(dietType) {
  return request(`/api/foods/diet-type/${encodeURIComponent(dietType)}`);
}

export async function searchFoods(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.dietType) query.set('dietType', params.dietType);
  const qs = query.toString();
  return request(`/api/foods/search${qs ? '?' + qs : ''}`);
}

export async function getNutrientGroups() {
  return request('/api/foods/nutrient-groups');
}

// ===== Profile Statistics =====
export async function getProfileStatistics() {
  return request('/api/profile/statistics');
}

export async function uploadProfileImage(formData) {
  return request('/api/profile/image', {
    method: 'POST',
    body: formData,
  });
}

// ===== Auth Token Management =====
export function setAuthToken(token) {
  if (!token) return;
  localStorage.setItem('auth_token', token);
  
  // Dispatch custom event to notify BabyContext to refetch babies for new user
  window.dispatchEvent(new Event('login'));
}

// ===== Baby Documents =====
export async function uploadDocument(babyId, formData) {
  return request('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function getDocuments(babyId, category) {
  return request(`/api/documents/${babyId}/${category}`);
}

export async function deleteDocument(docId) {
  return request(`/api/documents/${docId}`, {
    method: 'DELETE',
  });
}

export async function getDocumentFileUrl(docId) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${API_URL}/api/documents/file/${docId}`;
}

export async function getDocumentFileBlob(docId) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/api/documents/file/${docId}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch document file');
  return res.blob();
}

export async function getDocumentCounts(babyId) {
  return request(`/api/documents/counts/${babyId}`);
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('selectedBabyId');
  localStorage.removeItem('userType');
  localStorage.removeItem('selectedStage');
  
  // Dispatch custom event to notify BabyContext to clear state
  window.dispatchEvent(new Event('logout'));
}

