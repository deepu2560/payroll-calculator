# Simple Payroll (SaaS MVP)

Simple Payroll is a production-ready, India-first payroll SaaS for small teams (1-10 employees). It helps business owners compute monthly payroll in under a minute.

## Tech Stack
- Next.js 14 + React + Tailwind CSS
- Node runtime via Next API routes
- PostgreSQL with Prisma ORM
- JWT auth in secure HTTP-only cookies
- Vitest for unit tests

## Features
- Email + password signup/login
- Employee CRUD (name, monthly salary, overtime rate)
- Monthly payroll input table (days worked, leaves, overtime, bonus)
- 1-click salary calculation
- Payroll summary with deductions, additions, and final payout
- PDF export and WhatsApp-friendly sharing link
- Input validation + auth-protected APIs

## Salary Logic
- Per day salary = monthly salary / 30
- Leave deduction = per day salary * leaves
- Overtime = overtime hours * overtime rate
- Final salary = monthly salary - leave deduction + overtime + bonus

## Project Structure

```text
.
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   └── payrolls/
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── signup/
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   └── DashboardClient.tsx
│   ├── lib/
│   │   ├── api-auth.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── payroll.ts
│   │   └── validation.ts
│   └── types/
└── .env.example
```

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables
   ```bash
   cp .env.example .env
   ```
3. Start PostgreSQL and update `DATABASE_URL` in `.env`
4. Generate Prisma client and run migrations
   ```bash
   npx prisma migrate dev --name init
   ```
5. Run the app
   ```bash
   npm run dev
   ```
6. Run tests
   ```bash
   npm run test
   ```

## API Overview
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `POST /api/payrolls/calculate`

## Future-ready extension points
- Add attendance source and auto-import days/leaves
- Layer tax/compliance modules (PF, ESI, TDS) into `lib/payroll.ts`
- Add i18n localization for multi-language support
- Add UPI payout workflow from payroll summary
