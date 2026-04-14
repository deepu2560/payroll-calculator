import { NextResponse } from 'next/server';
import { authSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { authCookieName, signToken, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const parsed = authSchema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: parsed.email } });

    if (!user || !(await verifyPassword(parsed.password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await signToken(user.id, user.email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(authCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }
}
