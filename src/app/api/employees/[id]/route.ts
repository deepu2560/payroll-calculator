import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserOrThrow } from '@/lib/api-auth';
import { employeeSchema } from '@/lib/validation';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    const parsed = employeeSchema.parse(await req.json());

    const existing = await db.employee.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
    }

    const employee = await db.employee.update({
      where: { id: params.id },
      data: parsed
    });

    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: 'Unable to update employee.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUserOrThrow();
    const existing = await db.employee.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
    }

    await db.employee.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete employee.' }, { status: 400 });
  }
}
