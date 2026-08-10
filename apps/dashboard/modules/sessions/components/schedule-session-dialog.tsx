'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar03Icon, Clock01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Controller, useController, useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { useScheduleSessionMutation } from '../services/sessions.mutation';
import { combineDateTime, scheduleSessionSchema, type ScheduleSessionValues } from '../validations/sessions';

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, m) => String(m * 5).padStart(2, '0'));

function TimeSelect({
  control,
  hourName,
  minuteName,
  hourId,
}: {
  control: Control<ScheduleSessionValues>;
  hourName: 'startHour' | 'endHour';
  minuteName: 'startMinute' | 'endMinute';
  hourId: string;
}) {
  const { field: hourField } = useController({ control, name: hourName });
  const { field: minuteField } = useController({ control, name: minuteName });

  return (
    <div className="flex shrink-0 items-center gap-2">
      <HugeiconsIcon icon={Clock01Icon} size={16} className="shrink-0 text-muted-foreground" />
      <Select value={hourField.value} onValueChange={hourField.onChange}>
        <SelectTrigger id={hourId} className="w-18">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minuteField.value} onValueChange={minuteField.onChange}>
        <SelectTrigger className="w-18">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ScheduleSessionDialog() {
  const [open, setOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const { data: classes } = useClassesQuery();
  const { mutate: schedule, error, isPending } = useScheduleSessionMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleSessionValues>({
    resolver: zodResolver(scheduleSessionSchema),
    defaultValues: { classId: '', startHour: '', startMinute: '', endHour: '', endMinute: '' },
  });

  const onSubmit = (values: ScheduleSessionValues) => {
    schedule(
      {
        classId: values.classId,
        startsAt: combineDateTime(values.date, values.startHour, values.startMinute).toISOString(),
        endsAt: combineDateTime(values.date, values.endHour, values.endMinute).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Session scheduled');
          reset();
          setOpen(false);
        },
      },
    );
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
        <Button>
          <HugeiconsIcon icon={Calendar03Icon} size={16} />
          Schedule session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
            <Label htmlFor="start-hour">Starts at</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 min-w-32 justify-start font-normal">
                        <HugeiconsIcon icon={Calendar03Icon} size={16} />
                        {field.value ? field.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDatePopoverOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <TimeSelect control={control} hourId="start-hour" hourName="startHour" minuteName="startMinute" />
            </div>
            {errors.date && <span className="text-xs text-destructive">{errors.date.message}</span>}
            {errors.startHour && <span className="text-xs text-destructive">{errors.startHour.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-hour">Ends at</Label>
            <TimeSelect control={control} hourId="end-hour" hourName="endHour" minuteName="endMinute" />
            {errors.endHour && <span className="text-xs text-destructive">{errors.endHour.message}</span>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              {isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
