import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ApiResponse, PaginatedResponse, QrTokenResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { sessionKeys } from '@/modules/shared/services/query-keys';
import type { ClassSession } from '../types';
import { SESSIONS_ENDPOINTS } from './sessions.endpoints';

export const useSessionsInfiniteQuery = () => {
  return useInfiniteQuery({
    queryKey: sessionKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `${SESSIONS_ENDPOINTS.list}?cursor=${encodeURIComponent(pageParam)}`
        : SESSIONS_ENDPOINTS.list;
      const { data } = await api.get<ApiResponse<PaginatedResponse<ClassSession>>>(url);
      return data.data ?? { items: [], nextCursor: null };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
};

export const useSessionsQuery = () => {
  const query = useSessionsInfiniteQuery();
  const sessions = query.data?.pages.flatMap((page) => page.items) ?? [];
  return { ...query, data: sessions };
};

// Polls the rotating QR token so the displayed code stays live — authenticator-app-style timing:
// rotates every 15s on the frontend, well inside the backend's 39s Redis TTL (see
// config/redis-keys.ts's QR_TOKEN_TTL_SECONDS), which is deliberately a buffer past this interval
// rather than a match to it — a code scanned right as it's about to rotate still has a few
// seconds of slack before the backend would reject it as expired. `enabled` lets the caller pause
// polling once the session's `[startsAt, endsAt]` window has closed (the endpoint 400s otherwise).
export const useQrTokenQuery = (sessionId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...sessionKeys.detail(sessionId), 'qr-token'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<QrTokenResponse>>(SESSIONS_ENDPOINTS.qrToken(sessionId));
      return data.data ?? null;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: 15_000,
    retry: false,
  });
};
