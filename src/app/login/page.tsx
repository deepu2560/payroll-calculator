import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full space-y-4">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-slate-600">
          New here? <Link href="/signup" className="text-brand-700">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
