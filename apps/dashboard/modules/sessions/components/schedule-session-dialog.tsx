'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { useScheduleSessionMutation } from '../services/sessions.mutation';
import { scheduleSessionSchema, type ScheduleSessionValues } from '../validations/sessions';

export function ScheduleSessionDialog() {
  const [open, setOpen] = useState(false);
  const { data: classes } = useClassesQuery();
  const { mutate: schedule, error, isPending } = useScheduleSessionMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleSessionValues>({
    resolver: zodResolver(scheduleSessionSchema),
    defaultValues: { classId: '', startsAt: '', endsAt: '' },
  });

  const onSubmit = (values: ScheduleSessionValues) => {
    schedule(values, {
      onSuccess: () => {
        toast.success('Session scheduled');
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Schedule session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule session</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <ErrorMessage message={error.errors} fallback="Couldn't schedule the session." />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-class">Class</Label>
            <Controller
              control={control}
              name="classId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="session-class" className="w-full">
                    <SelectValue placeholder={classes?.length ? 'Select a class' : 'No classes yet'} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((klass) => (
                      <SelectItem key={klass.id} value={klass.id}>
                        {klass.name} ({klass.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.classId && <span className="text-xs text-destructive">{errors.classId.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="starts-at">Starts at</Label>
            <Controller control={control} name="startsAt" render={({ field }) => <Input id="starts-at" type="datetime-local" {...field} />} />
            {errors.startsAt && <span className="text-xs text-destructive">{errors.startsAt.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ends-at">Ends at</Label>
            <Controller control={control} name="endsAt" render={({ field }) => <Input id="ends-at" type="datetime-local" {...field} />} />
            {errors.endsAt && <span className="text-xs text-destructive">{errors.endsAt.message}</span>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
