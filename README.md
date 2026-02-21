# Panna Betting

Mobile-first betting platform with a gamified UX, scalable backend, and correct “Panna” logic.

## Highlights

- Gamified UI with real-time market status and countdowns
- Mobile OTP login via Supabase Auth
- Smart autocomplete powered by Panna rules
- Relational Postgres schema for analytics and daily resets
- API-level time validation and concurrency-safe wallet deduction

## Architecture

- Frontend: Next.js (App Router, React, Tailwind)
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth (Phone OTP)
- Deployment: Vercel (CI/CD)

## Features

- Authentication:
  - Mobile number + OTP (client verifies via Supabase)
  - Login page marked dynamic to avoid prerender issues
- Markets Dashboard:
  - Laxmi Morning (09:00–12:00)
  - Shridevi Morning (13:00–15:00)
  - Karnatak Day (16:00–19:00)
  - Open/Closed glow, “Time Left to Bet” countdown
- Betting:
  - Game Types: Single Digit, Jodi, Single/Double/Triple Panna
  - Panna sorting with zero as greatest digit (value 10)
  - Wallet starts at ₹50,000 with deduction animation
- Admin (Roadmap):
  - Market window control, daily reset
  - Live bet feed, result declaration

## Panna Logic

- Order: 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0 (0 = 10)
- Auto-sort 3 digits to normalized ascending order by this value
  - 1,4,2 → 124
  - 5,0,2 → 250
- Implementation:
  - Utilities: [panna.ts](file:///d:/malvisoftware/panna-betting/src/lib/panna.ts)
  - Betting UI: [bet/page.tsx](file:///d:/malvisoftware/panna-betting/src/app/bet/page.tsx)

## Data Model (Postgres)

Relational schema for queryable, scalable operations:

- Entities: users, wallets, markets, bets, results
- SQL: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
- Queryable design supports: “How many users bet Single Panna ‘120’ today?”

### Daily Reset

- Store placed_at timestamps on bets
- Use result_date in results with unique(market_id, result_date)
- Query today vs yesterday via date(placed_at) and result_date

## APIs & Security

- Bets API: [route.ts](file:///d:/malvisoftware/panna-betting/src/app/api/bets/route.ts)
  - Server-side validation of selection format and market open window
  - Future: call Supabase RPC public.place_bet for atomic wallet deduction
- Supabase client:
  - Runtime getter avoids build-time env reliance: [supabase.ts](file:///d:/malvisoftware/panna-betting/src/lib/supabase.ts)

## Scalability

If 100,000 users bet at 11:59 AM, to prevent the database from crashing:

- Atomic wallet deduction + bet insert via stored procedure (RPC)
- Connection pooling (PgBouncer) and API backpressure (rate limits, timeouts)
- Overflow queue with worker to batch writes at peak
- Partition/index bets by market_id and date(placed_at)
- Cache “today’s counts per selection” for admin analytics

## Environment

Place in Vercel Project Settings (and .env.local for local dev):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Optional: NEXT_TELEMETRY_DISABLED=1
- SUPABASE_DB_URL (server-side only)

## Supabase Setup

1. Create Supabase project
2. Enable Phone OTP in Auth
3. Run schema SQL: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
4. Seed markets:
   - Laxmi Morning: 09:00–12:00
   - Shridevi Morning: 13:00–15:00
   - Karnatak Day: 16:00–19:00
5. Create wallet rows for users with starting balance ₹50,000

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

- Dashboard: /
- Login: /(auth)/login
- Bet: /bet

## Deploy

1. Push this project to GitHub
2. Import repository into Vercel
3. Add environment variables (see above)
4. Deploy

## Project Links

- Dashboard: [page.tsx](file:///d:/malvisoftware/panna-betting/src/app/page.tsx)
- Auth Login: [login/page.tsx](file:///d:/malvisoftware/panna-betting/src/app/(auth)/login/page.tsx)
- Betting: [bet/page.tsx](file:///d:/malvisoftware/panna-betting/src/app/bet/page.tsx)
- Supabase Client: [supabase.ts](file:///d:/malvisoftware/panna-betting/src/lib/supabase.ts)
- Panna Utils: [panna.ts](file:///d:/malvisoftware/panna-betting/src/lib/panna.ts)
- Bets API: [route.ts](file:///d:/malvisoftware/panna-betting/src/app/api/bets/route.ts)
- Schema: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
