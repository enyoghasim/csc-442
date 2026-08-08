import axios from 'axios';
import { env } from './env';
import { getSessionId } from '../../auth/services/auth-storage';

export const api = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

// TODO (Sprint 1): once login is wired, attach the stored session id on every request:
api.interceptors.request.use(async (config) => {
  const sessionId = await getSessionId();
  if (sessionId) {
    config.headers.Authorization = `Session ${sessionId}`;
  }
  return config;
});

// Placeholder call to prove the client is wired — see modules/shared/components/home-screen.tsx
export async function pingHealth() {
  const { data } = await api.get('/api/health');
  return data;
}
