'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loading03Icon, UserAdd02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Controller, useForm } from 'react-hook-form';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useEnrollAllStudentsMutation, useEnrollStudentMutation } from '../services/classes.mutation';
import { enrollStudentSchema, type EnrollStudentValues } from '../validations/classes';
import type { Class } from '../types';

export function EnrollStudentDialog({ klass }: { klass: Class }) {
  const [open, setOpen] = useState(false);
  const { mutate: enroll, error, isPending } = useEnrollStudentMutation(klass.id);
  const { mutate: enrollAll, isPending: isEnrollingAll } = useEnrollAllStudentsMutation(klass.id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnrollStudentValues>({
    resolver: zodResolver(enrollStudentSchema),
    defaultValues: { regNumber: '' },
  });

  const onSubmit = (values: EnrollStudentValues) => {
    enroll(values, {
      onSuccess: () => {
        toast.success(`Enrolled ${values.regNumber} in ${klass.code}`);
        reset();
        setOpen(false);
      },
    });
  };

  const onEnrollAll = () => {
    enrollAll(undefined, {
      onSuccess: (result) => {
        toast.success(
          result.enrolled > 0
            ? `Enrolled ${result.enrolled} student(s) in ${klass.code}`
            : `Everyone was already enrolled in ${klass.code}`,
        );
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
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={UserAdd02Icon} size={16} />
          Enroll student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll student</DialogTitle>
          <DialogDescription>Add a student to {klass.name} by their regNumber.</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <ErrorMessage message={error.errors} fallback="Couldn't enroll that student." />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-number">Reg number</Label>
            <Controller control={control} name="regNumber" render={({ field }) => <Input id="reg-number" placeholder="2022514022" {...field} />} />
            {errors.regNumber && <span className="text-xs text-destructive">{errors.regNumber.message}</span>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              {isPending ? 'Enrolling...' : 'Enroll'}
            </Button>
          </DialogFooter>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isEnrollingAll}>
              <HugeiconsIcon icon={isEnrollingAll ? Loading03Icon : UserGroupIcon} size={16} className={isEnrollingAll ? 'animate-spin' : undefined} />
              {isEnrollingAll ? 'Enrolling everyone...' : 'Allow everyone'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enroll every student?</AlertDialogTitle>
              <AlertDialogDescription>
                This adds every seeded student not already enrolled in {klass.name}. Enrollment can&apos;t be removed
                from the dashboard yet, so there&apos;s no undo for this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onEnrollAll}>Enroll everyone</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
