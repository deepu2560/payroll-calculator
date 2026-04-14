import { NextResponse } from 'next/server';
import { authSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { authCookieName, hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const parsed = authSchema.parse(await req.json());
    const exists = await db.user.findUnique({ where: { email: parsed.email } });

    if (exists) {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email: parsed.email,
        password: await hashPassword(parsed.password)
      }
    });

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
    return NextResponse.json({ error: 'Invalid signup request.' }, { status: 400 });
  }
}
