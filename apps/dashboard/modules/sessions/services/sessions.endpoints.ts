export const SESSIONS_ENDPOINTS = {
  list: '/api/sessions',
  create: '/api/sessions',
  qrToken: (id: string) => `/api/sessions/${id}/qr-token`,
  end: (id: string) => `/api/sessions/${id}/end`,
} as const;
