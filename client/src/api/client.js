import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let refreshToken = null;
let onAuthUpdate = null;
let refreshInFlight = null;

export function setTokens(tokens) {
  accessToken = tokens?.accessToken || null;
  refreshToken = tokens?.refreshToken || null;
  if (accessToken) {
    localStorage.setItem('mp_access', accessToken);
  } else {
    localStorage.removeItem('mp_access');
  }
  if (refreshToken) {
    localStorage.setItem('mp_refresh', refreshToken);
  } else {
    localStorage.removeItem('mp_refresh');
  }
}

export function loadStoredTokens() {
  accessToken = localStorage.getItem('mp_access');
  refreshToken = localStorage.getItem('mp_refresh');
  return { accessToken, refreshToken };
}

export function registerAuthListener(fn) {
  onAuthUpdate = fn;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('no refresh token');
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
      .then((r) => {
        setTokens({
          accessToken: r.data.accessToken,
          refreshToken: r.data.refreshToken,
        });
        if (onAuthUpdate) onAuthUpdate(r.data.user);
        return r.data.accessToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status === 401 && !original._retry && refreshToken && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setTokens(null);
        if (onAuthUpdate) onAuthUpdate(null);
      }
    }
    return Promise.reject(error);
  },
);
