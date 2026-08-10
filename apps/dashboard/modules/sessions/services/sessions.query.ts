import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, QrTokenResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { sessionKeys } from '@/modules/shared/services/query-keys';
import type { ClassSession } from '../types';
import { SESSIONS_ENDPOINTS } from './sessions.endpoints';

export const useSessionsQuery = () => {
  return useQuery({
    queryKey: sessionKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClassSession[]>>(SESSIONS_ENDPOINTS.list);
      return data.data ?? [];
    },
  });
};

// Polls the rotating QR token so the displayed code stays live. Every call to the endpoint
// rotates the token server-side (fresh value overwrites the old one in Redis, ~90s TTL) — a
// 60s refetch interval is comfortably under that. `enabled` lets the caller pause polling once
// the session's `[startsAt, endsAt]` window has closed (the endpoint 400s otherwise).
export const useQrTokenQuery = (sessionId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...sessionKeys.detail(sessionId), 'qr-token'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<QrTokenResponse>>(SESSIONS_ENDPOINTS.qrToken(sessionId));
      return data.data ?? null;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: 60_000,
    retry: false,
  });
};
