import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simple Payroll',
  description: '1-click salary calculator for small teams'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
