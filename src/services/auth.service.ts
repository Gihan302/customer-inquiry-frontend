import type { ApiSuccess, LoginData, User } from '../types';
import { api } from './api';

export async function login(email: string, password: string): Promise<LoginData> {
  const res = await api.post<ApiSuccess<LoginData>>('/auth/login', { email, password });
  return res.data.data;
}

/** Returns the staff member behind the stored token (throws ApiError 401 if it is invalid). */
export async function getCurrentUser(): Promise<User> {
  const res = await api.get<ApiSuccess<{ user: User }>>('/auth/me');
  return res.data.data.user;
}
