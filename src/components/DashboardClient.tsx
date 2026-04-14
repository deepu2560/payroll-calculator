'use client';

import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { buildWhatsappSummary } from '@/lib/payroll';
import type { Employee, PayrollEntryInput } from '@/types';

type CalculationResult = {
  totalEmployees: number;
  totalPayout: number;
  entries: Array<{
    employeeId: string;
    employeeName: string;
    monthlySalary: number;
    leaveDeduction: number;
    overtimePay: number;
    bonus: number;
    finalSalary: number;
  }>;
};

const today = new Date();

export function DashboardClient({ userEmail }: { userEmail: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [form, setForm] = useState({ name: '', monthlySalary: '', overtimeRate: '' });
  const [entries, setEntries] = useState<Record<string, PayrollEntryInput>>({});
  const [message, setMessage] = useState('');

  async function loadEmployees() {
    const response = await fetch('/api/employees');
    if (!response.ok) return;
    const data = await response.json();
    setEmployees(data.employees);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    const initial: Record<string, PayrollEntryInput> = {};
    employees.forEach((employee) => {
      initial[employee.id] = entries[employee.id] ?? {
        employeeId: employee.id,
        daysWorked: 30,
        leaves: 0,
        overtimeHours: 0,
        bonus: 0
      };
    });
    setEntries(initial);
  }, [employees]);

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        monthlySalary: Number(form.monthlySalary),
        overtimeRate: Number(form.overtimeRate || 0)
      })
    });

    if (!response.ok) {
      setMessage('Could not add employee. Check input values.');
      return;
    }

    setForm({ name: '', monthlySalary: '', overtimeRate: '' });
    setMessage('Employee added.');
    await loadEmployees();
  }

  async function deleteEmployee(id: string) {
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    await loadEmployees();
  }

  function seedDemoEmployees() {
    setForm({ name: 'Aarav', monthlySalary: '35000', overtimeRate: '250' });
    setMessage('Demo values filled. Click Add employee.');
  }

  async function calculatePayroll() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/payrolls/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month,
        year,
        entries: Object.values(entries)
      })
    });

    if (!response.ok) {
      setMessage('Could not calculate payroll. Ensure inputs are non-negative.');
      setLoading(false);
      return;
    }

    const data = await response.json();
    setResult(data);
    setLoading(false);
    setMessage('Payroll calculated successfully.');
  }

  function updateEntry(employeeId: string, key: keyof PayrollEntryInput, rawValue: string) {
    const num = Number(rawValue);
    setEntries((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [key]: Number.isFinite(num) ? num : 0
      }
    }));
  }

  const whatsappText = useMemo(() => {
    if (!result?.entries.length) return '';
    const first = result.entries[0];
    return buildWhatsappSummary({
      month,
      year,
      employeeName: first.employeeName,
      finalSalary: first.finalSalary,
      deductions: first.leaveDeduction,
      additions: first.overtimePay + first.bonus
    });
  }, [result, month, year]);

  function exportPdf() {
    if (!result) return;
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text(`Simple Payroll Summary (${month}/${year})`, 10, 12);
    pdf.setFontSize(11);
    let y = 24;
    result.entries.forEach((entry) => {
      pdf.text(`${entry.employeeName} - Final payout: INR ${entry.finalSalary.toFixed(2)}`, 10, y);
      y += 8;
    });
    pdf.text(`Total payout: INR ${result.totalPayout.toFixed(2)}`, 10, y + 6);
    pdf.save(`simple-payroll-${month}-${year}.pdf`);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Simple Payroll</h1>
            <p className="text-sm text-slate-600">Hi {userEmail}, run salary in 1 click.</p>
          </div>
          <button className="rounded-lg border px-3 py-2 text-sm" onClick={logout}>Logout</button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Employees</h2>
            <button onClick={seedDemoEmployees} className="text-xs text-brand-700">Use demo data</button>
          </div>
          <form className="grid gap-2" onSubmit={addEmployee}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <input placeholder="Monthly salary" type="number" min={1} value={form.monthlySalary} onChange={(e) => setForm((p) => ({ ...p, monthlySalary: e.target.value }))} required />
            <input placeholder="Overtime rate (optional)" type="number" min={0} value={form.overtimeRate} onChange={(e) => setForm((p) => ({ ...p, overtimeRate: e.target.value }))} />
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">Add employee</button>
          </form>
          <ul className="mt-4 space-y-2">
            {employees.map((employee) => (
              <li key={employee.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <span>{employee.name} · ₹{employee.monthlySalary}</span>
                <button onClick={() => deleteEmployee(employee.id)} className="text-red-600">Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-medium">Monthly Inputs</h2>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
            <input type="number" min={2020} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="p-2">Name</th>
                  <th className="p-2">Days worked</th>
                  <th className="p-2">Leaves</th>
                  <th className="p-2">Overtime hrs</th>
                  <th className="p-2">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t">
                    <td className="p-2">{employee.name}</td>
                    <td className="p-2"><input type="number" min={0} max={31} value={entries[employee.id]?.daysWorked ?? 30} onChange={(e) => updateEntry(employee.id, 'daysWorked', e.target.value)} /></td>
                    <td className="p-2"><input type="number" min={0} max={31} value={entries[employee.id]?.leaves ?? 0} onChange={(e) => updateEntry(employee.id, 'leaves', e.target.value)} /></td>
                    <td className="p-2"><input type="number" min={0} value={entries[employee.id]?.overtimeHours ?? 0} onChange={(e) => updateEntry(employee.id, 'overtimeHours', e.target.value)} /></td>
                    <td className="p-2"><input type="number" min={0} value={entries[employee.id]?.bonus ?? 0} onChange={(e) => updateEntry(employee.id, 'bonus', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={calculatePayroll} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            {loading ? 'Calculating...' : 'Calculate in 1 click'}
          </button>
          {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}
        </div>
      </section>

      {result && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-medium">Payroll summary</h2>
          <p className="mt-1 text-sm text-slate-600">Total employees: {result.totalEmployees} · Total payout: ₹{result.totalPayout}</p>
          <div className="mt-4 space-y-2">
            {result.entries.map((entry) => (
              <div key={entry.employeeId} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{entry.employeeName}</div>
                <div>Salary: ₹{entry.monthlySalary.toFixed(2)}</div>
                <div>Deductions: ₹{entry.leaveDeduction.toFixed(2)}</div>
                <div>Extra earnings: ₹{(entry.overtimePay + entry.bonus).toFixed(2)}</div>
                <div className="font-semibold">Final payout: ₹{entry.finalSalary.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={exportPdf} className="rounded-lg border px-3 py-2 text-sm">Download PDF</button>
            {whatsappText && (
              <a
                className="rounded-lg border px-3 py-2 text-sm"
                href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noreferrer"
              >
                Share on WhatsApp
              </a>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
