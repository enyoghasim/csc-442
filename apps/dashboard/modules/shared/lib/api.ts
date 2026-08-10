import axios from 'axios';
import { env } from './env';

// `withCredentials: true` makes the browser store/resend the httpOnly `connect.sid` session
// cookie the backend sets on login — the same story as apps/mobile's axios instance, just with a
// real cookie jar instead of one axios manages itself. No session id is ever read or stored by
// app code.
export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
});
