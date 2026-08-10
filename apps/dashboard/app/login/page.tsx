import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LoginForm } from '@/modules/auth/components/login-form';

export default function LoginPage() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="items-center">
        <Logo size={40} className="mb-2" />
        <CardTitle>Lecturer Login</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
