const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    let detail = 'Request failed';
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (_) {
      // ignore json parse errors
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function login({ email, password }) {
  const body = new URLSearchParams({
    username: email,
    password,
  });

  const data = await request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  return data; // { access_token, token_type }
}

export async function register({ fullName, email, dueDate, userType, password }) {
  // Backend expects due_date as datetime string; send start of day if provided
  const dueDateIso = dueDate ? `${dueDate}T00:00:00` : null;

  return request('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      due_date: dueDateIso,
      user_type: userType,
    }),
  });
}

export async function getDailyTip() {
  return request('/static/daily-tip');
}

export async function getNutritionTips() {
  return request('/static/nutrition-tips');
}

export function setAuthToken(token) {
  if (!token) return;
  localStorage.setItem('auth_token', token);
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}
