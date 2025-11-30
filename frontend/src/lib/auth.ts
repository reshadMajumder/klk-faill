
import { API_BASE_URL } from './api';

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
        try {
            await fetch(`${API_BASE_URL}/api/accounts/logout/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });
        } catch (e) {
            console.error('Server-side logout failed, proceeding with client-side cleanup.', e);
        }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}

async function refreshToken() {
  isRefreshing = true;
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    isRefreshing = false;
    logout();
    return Promise.reject(new Error('No refresh token available.'));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const { access } = await response.json();
    localStorage.setItem('accessToken', access);
    processQueue(null, access);
    return access;
  } catch (error) {
    processQueue(error, null);
    logout();
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
}

export async function authFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('accessToken');

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
    .then(newToken => {
        const newOptions = { ...options };
        const headers = new Headers(newOptions.headers);
        
        if (newOptions.body instanceof FormData) {
          // Let browser set Content-Type for FormData
        } else {
          headers.set('Content-Type', 'application/json');
        }
        headers.set('Authorization', `Bearer ${newToken}`);
        newOptions.headers = headers;
        
        return fetch(`${API_BASE_URL}${url}`, newOptions);
    })
    .then(async response => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Request failed after token refresh');
      }
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }
      return response;
    });
  }

  const initialOptions = { ...options };
  const headers = new Headers(initialOptions.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(initialOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  initialOptions.headers = headers;

  let response = await fetch(`${API_BASE_URL}${url}`, initialOptions);

  if (response.status === 401 && token) {
    try {
      const newAccessToken = await refreshToken();
      const retryOptions = { ...options };
      const retryHeaders = new Headers(retryOptions.headers);
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

      if (!(retryOptions.body instanceof FormData) && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      
      retryOptions.headers = retryHeaders;
      response = await fetch(`${API_BASE_URL}${url}`, retryOptions);

    } catch (refreshError) {
      console.error('Session expired. Please log in again.');
      logout();
      throw refreshError;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
    const error = new Error(errorData.detail || JSON.stringify(errorData));
    (error as any).data = errorData;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
  }
  return response; // For non-JSON responses like file downloads
}
