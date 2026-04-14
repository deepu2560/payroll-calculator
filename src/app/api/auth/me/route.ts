import { NextResponse } from 'next/server';
import { getCurrentUserOrThrow } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
