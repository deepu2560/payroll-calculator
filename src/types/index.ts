export type Employee = {
  id: string;
  name: string;
  monthlySalary: number;
  overtimeRate: number;
};

export type PayrollEntryInput = {
  employeeId: string;
  daysWorked: number;
  leaves: number;
  overtimeHours: number;
  bonus: number;
};
