// Always use the local proxy path — Next.js rewrites handle routing to the backend.
// This ensures the browser only ever calls the same origin (HTTPS on Vercel),
// preventing blocked:mixed-content errors.
const API_BASE_URL = '/api-proxy';

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function saveTokens(access: string, refresh: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }
}

export function saveUser(name: string, role: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_role', role);
  }
}

export function getUserInfo() {
  if (typeof window !== 'undefined') {
    return {
      name: localStorage.getItem('user_name') || 'User',
      role: localStorage.getItem('user_role') || 'TEACHER',
    };
  }
  return { name: 'User', role: 'TEACHER' };
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function request(endpoint: string, options: RequestOptions = {}) {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryStr = searchParams.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
  }

  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Session expired, redirect to login
    clearTokens();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
}
