'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Add01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useCreateClassMutation } from '../services/classes.mutation';
import { createClassSchema, type CreateClassValues } from '../validations/classes';

export function CreateClassDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createClass, error, isPending } = useCreateClassMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { name: '', code: '' },
  });

  const onSubmit = (values: CreateClassValues) => {
    createClass(values, {
      onSuccess: (created) => {
        toast.success(`Class "${created.name}" created`);
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
        <Button>
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Create class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create class</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <ErrorMessage message={error.errors} fallback="Couldn't create the class." />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="class-name">Name</Label>
            <Controller control={control} name="name" render={({ field }) => <Input id="class-name" placeholder="Software Engineering" {...field} />} />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="class-code">Code</Label>
            <Controller control={control} name="code" render={({ field }) => <Input id="class-code" placeholder="CSC 422" {...field} />} />
            {errors.code && <span className="text-xs text-destructive">{errors.code.message}</span>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
