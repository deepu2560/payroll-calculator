import { NextResponse } from 'next/server';
import { calculateSalary } from '@/lib/payroll';
import { calculatePayrollSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { getCurrentUserOrThrow } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserOrThrow();
    const parsed = calculatePayrollSchema.parse(await req.json());

    const employees = await db.employee.findMany({
      where: {
        userId: user.id,
        id: { in: parsed.entries.map((entry) => entry.employeeId) }
      }
    });

    const employeeMap = new Map(employees.map((employee) => [employee.id, employee]));

    const computedEntries = parsed.entries.map((entry) => {
      const employee = employeeMap.get(entry.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const result = calculateSalary({
        monthlySalary: employee.monthlySalary,
        leaves: entry.leaves,
        overtimeHours: entry.overtimeHours,
        overtimeRate: employee.overtimeRate,
        bonus: entry.bonus
      });

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        monthlySalary: employee.monthlySalary,
        daysWorked: entry.daysWorked,
        leaves: entry.leaves,
        overtimeHours: entry.overtimeHours,
        bonus: entry.bonus,
        leaveDeduction: result.leaveDeduction,
        overtimePay: result.overtimePay,
        finalSalary: result.finalSalary
      };
    });

    const payroll = await db.payroll.create({
      data: {
        userId: user.id,
        month: parsed.month,
        year: parsed.year,
        entries: {
          create: computedEntries.map((entry) => ({
            employeeId: entry.employeeId,
            daysWorked: entry.daysWorked,
            leaves: entry.leaves,
            overtimeHours: entry.overtimeHours,
            bonus: entry.bonus,
            finalSalary: entry.finalSalary
          }))
        }
      }
    });

    const totalPayout = computedEntries.reduce((acc, row) => acc + row.finalSalary, 0);

    return NextResponse.json({
      payrollId: payroll.id,
      totalEmployees: computedEntries.length,
      totalPayout: Math.round(totalPayout * 100) / 100,
      entries: computedEntries
    });
  } catch {
    return NextResponse.json({ error: 'Unable to calculate payroll.' }, { status: 400 });
  }
}
