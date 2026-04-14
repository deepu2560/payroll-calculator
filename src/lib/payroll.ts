export type SalaryInputs = {
  monthlySalary: number;
  leaves: number;
  overtimeHours: number;
  overtimeRate: number;
  bonus: number;
};

export type SalaryResult = {
  perDaySalary: number;
  leaveDeduction: number;
  overtimePay: number;
  finalSalary: number;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSalary(inputs: SalaryInputs): SalaryResult {
  const values = Object.values(inputs);
  if (values.some((v) => Number.isNaN(v) || v < 0)) {
    throw new Error('Invalid input: values must be non-negative numbers.');
  }

  const perDaySalary = inputs.monthlySalary / 30;
  const leaveDeduction = perDaySalary * inputs.leaves;
  const overtimePay = inputs.overtimeHours * inputs.overtimeRate;
  const finalSalary = inputs.monthlySalary - leaveDeduction + overtimePay + inputs.bonus;

  return {
    perDaySalary: round2(perDaySalary),
    leaveDeduction: round2(leaveDeduction),
    overtimePay: round2(overtimePay),
    finalSalary: round2(Math.max(0, finalSalary))
  };
}

export function buildWhatsappSummary(params: {
  month: number;
  year: number;
  employeeName: string;
  finalSalary: number;
  deductions: number;
  additions: number;
}) {
  return `Simple Payroll - ${params.month}/${params.year}\n${params.employeeName}\nFinal payout: ₹${params.finalSalary.toFixed(2)}\nDeductions: ₹${params.deductions.toFixed(2)}\nExtra earnings: ₹${params.additions.toFixed(2)}`;
}
