import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserOrThrow } from '@/lib/api-auth';
import { employeeSchema } from '@/lib/validation';

export async function GET() {
  try {
    const user = await getCurrentUserOrThrow();
    const employees = await db.employee.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ employees });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserOrThrow();
    const parsed = employeeSchema.parse(await req.json());

    const employee = await db.employee.create({
      data: {
        ...parsed,
        userId: user.id
      }
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
