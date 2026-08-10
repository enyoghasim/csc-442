import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassesTable } from '@/modules/classes/components/classes-table';
import { CreateClassDialog } from '@/modules/classes/components/create-class-dialog';

export default function ClassesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Classes</CardTitle>
        <CreateClassDialog />
      </CardHeader>
      <CardContent>
        <ClassesTable />
      </CardContent>
    </Card>
  );
}
