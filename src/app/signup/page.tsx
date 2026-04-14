import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full space-y-4">
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-slate-600">
          Already have account? <Link href="/login" className="text-brand-700">Login</Link>
        </p>
      </div>
    </main>
  );
}
