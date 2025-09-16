import axios from 'axios';
import {getEnv} from '../../env';
import {normalizeApiError} from './error';

export const api = axios.create({
  baseURL: getEnv().API_URL,
  timeout: getEnv().API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async config => {
  // Lazy import to avoid circular dependencies
  const {useAppStore} = await import('../state/appStore');
  const token = useAppStore.getState().session?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => Promise.reject(normalizeApiError(error)),
);
