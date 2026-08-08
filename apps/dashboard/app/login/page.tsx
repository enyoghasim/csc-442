import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';

// TODO (Sprint 1): wire this form to POST /api/auth/login with `credentials: 'include'` so the
// backend's httpOnly session cookie is set (cross-origin — see apps/backend's CORS config in
// src/main.ts). No fetch logic yet — placeholder only.
export default function LoginPage() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="items-center">
        <Logo size={40} className="mb-2" />
        <CardTitle>Lecturer Login</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input placeholder="Email or matric no." />
        <Input placeholder="Password" type="password" />
        <Button>Log in</Button>
      </CardContent>
    </Card>
  );
}
