import axios from 'axios';
import { env } from './env';

// `withCredentials: true` makes axios store/resend the httpOnly `connect.sid` session cookie the
// backend sets on login, the same way a browser tab would — no session id ever touches app code.
export const api = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
});

export async function pingHealth() {
  const { data } = await api.get('/api/health');
  return data;
}
