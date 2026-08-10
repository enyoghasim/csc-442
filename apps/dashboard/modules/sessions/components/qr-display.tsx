'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useQrTokenQuery } from '../services/sessions.query';
import type { ClassSession } from '../types';

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

  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!dataUpdatedAt) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      setSecondsLeft(Math.max(0, 60 - elapsed));
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-4">
        <QRCodeSVG value={payload} size={224} />
      </div>
      <p className="text-sm text-muted-foreground">Refreshes in {secondsLeft}s</p>
    </div>
  );
}
