'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClassesQuery } from '../services/classes.query';
import { EnrollStudentDialog } from './enroll-student-dialog';

export function ClassesTable() {
  const { data: classes, isLoading, isError } = useClassesQuery();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
              Loading classes...
            </TableCell>
          </TableRow>
        )}

        {isError && (
          <TableRow>
            <TableCell colSpan={3} className="py-8 text-center text-destructive">
              Couldn&apos;t load classes.
            </TableCell>
          </TableRow>
        )}

        {!isLoading && !isError && classes?.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
              No classes yet
            </TableCell>
          </TableRow>
        )}

        {classes?.map((klass) => (
          <TableRow key={klass.id}>
            <TableCell className="py-3 font-medium">{klass.name}</TableCell>
            <TableCell className="py-3">{klass.code}</TableCell>
            <TableCell className="py-3 text-right">
              <EnrollStudentDialog klass={klass} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
