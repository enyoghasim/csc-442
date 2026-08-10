'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useQrTokenQuery } from '../services/sessions.query';
import type { ClassSession } from '../types';

// Matches config/redis-keys.ts's QR_TOKEN_TTL_SECONDS relationship — the frontend rotates every
// 15s, well inside the backend's 39s buffer, authenticator-app style.
const REFRESH_SECONDS = 15;
const RING_RADIUS = 11;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function isSessionActive(session: ClassSession): boolean {
  const now = Date.now();
  return now >= new Date(session.startsAt).getTime() && now <= new Date(session.endsAt).getTime();
}

// Renders the rotating check-in QR code for a class session. The encoded payload
// (`JSON.stringify({ classSessionId, token })`) must match apps/mobile's scanner byte-for-byte —
// see the root brief's "QR payload contract" section.
export function QrDisplay({ session }: { session: ClassSession }) {
  const [active, setActive] = useState(() => isSessionActive(session));

  // The [startsAt, endsAt] window can open/close while this page is sitting open, so re-check
  // every second rather than only once on mount.
  useEffect(() => {
    const interval = setInterval(() => setActive(isSessionActive(session)), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const {
    data: qrToken,
    isLoading,
    isError,
    dataUpdatedAt,
  } = useQrTokenQuery(session.id, { enabled: active });

  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      setSecondsLeft(Math.max(0, REFRESH_SECONDS - elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  if (!active) {
    return (
      <div className="flex aspect-square w-64 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        This session isn&apos;t active right now — QR codes only issue inside its scheduled window.
      </div>
    );
  }

  if (isLoading && !qrToken) {
    return (
      <div className="flex aspect-square w-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Loading QR code...
      </div>
    );
  }

  if (isError || !qrToken) {
    return (
      <div className="flex aspect-square w-64 items-center justify-center rounded-lg border border-dashed p-4 text-center text-sm text-destructive">
        Couldn&apos;t load a QR code for this session.
      </div>
    );
  }

  const payload = JSON.stringify({ classSessionId: qrToken.classSessionId, token: qrToken.token });
  const ringOffset = RING_CIRCUMFERENCE * (1 - secondsLeft / REFRESH_SECONDS);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-lg bg-white p-4">
        <QRCodeSVG value={payload} size={224} />
      </div>

      {/* Authenticator-app-style shrinking ring, ticking down each 15s rotation. */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
          <circle cx="12" cy="12" r={RING_RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth="2" />
          <circle
            cx="12"
            cy="12"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span>Refreshes in {secondsLeft}s</span>
      </div>
    </div>
  );
}
