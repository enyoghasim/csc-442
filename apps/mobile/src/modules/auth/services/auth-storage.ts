import * as SecureStore from 'expo-secure-store';

const SESSION_ID_KEY = 'session_id';

// Stub — no login flow wired yet (Sprint 1). expo-secure-store is installed and this is the one
// place the session id will ever be read/written from once login lands.
export async function getSessionId(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_ID_KEY);
}

export async function setSessionId(sessionId: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
}

export async function clearSessionId(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_ID_KEY);
}
