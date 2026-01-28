# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Praxia Insights is an entrepreneurial assessment platform that processes Typeform survey responses and generates personalized PDF reports.

## Build Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client after schema changes
npx prisma db push   # Push schema to database (development)
npx prisma migrate   # Create and apply migrations (production)
```

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page with demo link
│   ├── globals.css             # Tailwind + EP2 custom styles
│   ├── report/
│   │   ├── page.tsx            # Report page (Suspense wrapper)
│   │   └── ReportContent.tsx   # Client component with query params
│   └── api/
│       ├── webhook/typeform/route.ts  # Typeform webhook endpoint
│       └── report/pdf/route.ts        # PDF generation endpoint
├── components/                 # Report section components
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── mock-data.ts           # Mock data for development
│   └── assessment-processor.ts # Typeform data processing logic
├── types/
│   └── report.ts              # TypeScript types & icon mappings
public/icons/                   # EP2 assets (animals, AOI, drivers, etc.)
prisma/
└── schema.prisma              # Database schema
```

### Data Flow
1. User completes Typeform EP2 assessment
2. Typeform sends webhook to `/api/webhook/typeform`
3. `assessment-processor.ts` calculates scores and determines:
   - Animal type (African Dog/Wolf, Lion, Killer Whale, Tiger) based on Risk/Reward matrix
   - Risk level (Low/Medium/High)
   - Reward level (Low/Medium/High)
   - Driver, AOIs, and Strategy from Typeform variables
4. Report saved to PostgreSQL database (or in-memory for development)
5. User views report at `/report?email=<their-email>`
6. PDF can be downloaded via Print button or `/api/report/pdf?email=<email>`

### Key Data Structures
Located in `src/lib/assessment-processor.ts`:
- `ANIMAL_TYPES`: African Dog/Wolf (steady), Lion (balanced), Killer Whale (strategic), Tiger (bold)
- `RISK_LEVELS` / `REWARD_LEVELS`: Score-based descriptions
- `DRIVERS`: Boss, Control, Passion, Money, Solve, Impact, Legacy
- `AOIS`: 11 areas of interest with business recommendations
- `STRATEGIES`: Creator, Consolidator, Franchisee, Contractor

### Database
Uses Prisma with PostgreSQL. Set `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```
Without DATABASE_URL, the app uses in-memory storage (data lost on restart).

### Legacy Files
- `ep2_code_node.js`: Original n8n workflow code (reference only)
- `report.html`: Original HTML template for Gotenberg PDF generation

## Next.js Development Guidelines

### TypeScript Rules
**Never use `any` type** - the codebase enforces `@typescript-eslint/no-explicit-any`. Use proper types:

```typescript
// Page props
function Page({ params }: { params: { slug: string } }) { ... }
function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) { ... }

// Events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... }

// Server actions
async function myAction(formData: FormData) { ... }
```

### Server vs Client Components
- **Default to Server Components** - no directive needed
- Add `'use client'` only when you need: hooks (useState, useEffect), event handlers, or browser APIs
- Never fetch data in Client Components with useEffect - use Server Components

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// Client Component (only when needed)
'use client';
import { useState } from 'react';
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Navigation
- Use `<Link>` from `next/link` for client-side navigation
- Use `redirect()` from `next/navigation` in Server Components
- `useRouter()` requires `'use client'`

### Data Fetching
- Fetch in parallel with `Promise.all()` - never serial awaits
- Use `next: { revalidate: seconds }` for caching
- Access searchParams in page.tsx: `const q = (await searchParams).q || ''`

### Server Actions
- Place in `app/actions.ts` (multiple) or `app/action.ts` (single)
- Use `'use server'` directive
- Form actions must return void; use `useActionState` for return values

### useSearchParams Requirements
Always wrap components using `useSearchParams()` in Suspense:
```typescript
<Suspense fallback={<Loading />}>
  <SearchComponent />
</Suspense>
```

### Metadata
Use exports instead of `next/head`:
```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Description'
};
```

## Package Manager Detection

Always check for lockfiles before installing packages:
- `pnpm-lock.yaml` → use `pnpm`
- `package-lock.json` → use `npm`
- `yarn.lock` → use `yarn`
- `bun.lockb` → use `bun`
