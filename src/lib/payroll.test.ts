import { describe, expect, it } from 'vitest';
import { calculateSalary } from './payroll';

describe('calculateSalary', () => {
  it('calculates regular salary with no changes', () => {
    const result = calculateSalary({
      monthlySalary: 30000,
      leaves: 0,
      overtimeHours: 0,
      overtimeRate: 0,
      bonus: 0
    });

    expect(result.finalSalary).toBe(30000);
  });

  it('handles 0 days worked via leaves and keeps payout non-negative', () => {
    const result = calculateSalary({
      monthlySalary: 30000,
      leaves: 30,
      overtimeHours: 0,
      overtimeRate: 0,
      bonus: 0
    });

    expect(result.leaveDeduction).toBe(30000);
    expect(result.finalSalary).toBe(0);
  });

  it('supports high overtime correctly', () => {
    const result = calculateSalary({
      monthlySalary: 30000,
      leaves: 1,
      overtimeHours: 120,
      overtimeRate: 250,
      bonus: 500
    });

    expect(result.finalSalary).toBe(59500);
  });

  it('rejects negative inputs', () => {
    expect(() =>
      calculateSalary({
        monthlySalary: 30000,
        leaves: -1,
        overtimeHours: 0,
        overtimeRate: 0,
        bonus: 0
      })
    ).toThrowError('Invalid input: values must be non-negative numbers.');
  });
});
