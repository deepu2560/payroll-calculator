import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).max(64)
});

export const employeeSchema = z.object({
  name: z.string().trim().min(1).max(80),
  monthlySalary: z.number().min(1),
  overtimeRate: z.number().min(0).default(0)
});

export const payrollInputSchema = z.object({
  employeeId: z.string().min(1),
  daysWorked: z.number().int().min(0).max(31),
  leaves: z.number().int().min(0).max(31),
  overtimeHours: z.number().min(0).max(300),
  bonus: z.number().min(0).max(1_000_000)
});

export const calculatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  entries: z.array(payrollInputSchema)
});
