'use client';

import { Loading03Icon, StopCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useEndSessionMutation } from '../services/sessions.mutation';

// Shared by sessions-table.tsx (a row action) and session-detail.tsx (next to the live QR) — one
// confirm-and-mutate flow so the two spots can't drift. Confirmed via AlertDialog since it cuts
// off check-ins immediately, same reasoning as the sidebar's logout confirm.
export function EndSessionButton({ sessionId, size = 'sm' }: { sessionId: string; size?: 'sm' | 'default' }) {
  const { mutate: endSession, isPending } = useEndSessionMutation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size={size} disabled={isPending}>
          <HugeiconsIcon icon={isPending ? Loading03Icon : StopCircleIcon} size={16} className={isPending ? 'animate-spin' : undefined} />
          {isPending ? 'Ending...' : 'End session'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End this session now?</AlertDialogTitle>
          <AlertDialogDescription>
            The QR code stops working immediately and no further check-ins will be accepted, even if the scheduled
            end time hasn&apos;t passed yet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              endSession(sessionId, {
                onSuccess: () => toast.success('Session ended'),
              })
            }
          >
            End session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
