// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000' // Development server
    : 'https://your-production-api.com', // Replace with your production URL
  TIMEOUT: 10000, // 10 seconds
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Request Config
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

// Authentication Types
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string | null;
  handle: string | null;
  country: string | null;
  tz: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AuthenticationResponse {
  user: AuthenticatedUser;
}
