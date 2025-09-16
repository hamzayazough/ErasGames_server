import {api} from '../../core/api/client';
import {
  LoginRequest,
  RegisterRequest,
  Session,
  SessionSchema,
} from '../../core/api/types';

export async function login(credentials: LoginRequest): Promise<Session> {
  const response = await api.post('/auth/login', credentials);
  return SessionSchema.parse(response.data);
}

export async function register(userData: RegisterRequest): Promise<Session> {
  const response = await api.post('/auth/register', userData);
  return SessionSchema.parse(response.data);
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshToken(token: string): Promise<Session> {
  const response = await api.post('/auth/refresh', {refreshToken: token});
  return SessionSchema.parse(response.data);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', {email});
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await api.post('/auth/reset-password', {token, password});
}
