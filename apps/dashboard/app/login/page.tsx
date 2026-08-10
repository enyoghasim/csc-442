import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LoginForm } from '@/modules/auth/components/login-form';

export default function LoginPage() {
  return (
    <Card className="mx-auto w-full max-w-md py-8">
      <CardHeader className="items-center">
        <Logo size={48} className="mb-2" />
        <CardTitle className="text-xl">Lecturer Login</CardTitle>
      </CardHeader>
      <CardContent className="px-8">
        <LoginForm />
      </CardContent>
    </Card>
  );
}
