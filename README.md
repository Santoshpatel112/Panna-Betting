# Panna Betting – Technical Assessment Submission

Mobile-first betting app with gamified UI, scalable backend, and correct “Panna” sorting logic.

## Objective(TraeAI-4) D:\malvisoftware\panna-betting [0:128] $ git push origin main
To https://github.com/Santoshpatel112/Panna-Betting.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/Santoshpatel112/Panna-Betting.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
(TraeAI-4) D:\malvisoftware\panna-betting [1:1] $ trae-sandbox 'git status'
On branch main
nothing to commit, working tree clean
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ 
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ trae-sandbox 'git remote -v'
origin  https://github.com/Santoshpatel112/Panna-Betting.git (fetch)
origin  https://github.com/Santoshpatel112/Panna-Betting.git (push)
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ 
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ trae-sandbox 'git fetch origin main'
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 872 bytes | 33.00 KiB/s, done.
From https://github.com/Santoshpatel112/Panna-Betting
 * branch            main       -> FETCH_HEAD
 * [new branch]      main       -> origin/main
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ 
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ trae-sandbox 'git log --oneline --decorate --graph --all -n 20'       
* 3feaf62 (HEAD -> main) code base
* 12fa5f2 (origin/main) Initial commit
(TraeAI-4) D:\malvisoftware\panna-betting [0:0] $ trae-sandbox 'git pull --rebase origin main'
From https://github.com/Santoshpatel112/Panna-Betting
 * branch            main       -> FETCH_HEAD
error: could not mark as interactive: No such file or directory
(TraeAI-4) D:\malvisoftware\panna-betting [0:1] $ 
(TraeAI-4) D:\malvisoftware\panna-betting [0:1] $ trae-sandbox 'git pull --no-rebase origin main'
fatal: not a git repository (or any of the parent directories): .git
(TraeAI-4) D:\malvisoftware\panna-betting [0:1] $ 
(TraeAI-4) D:\malvisoftware\panna-betting [0:1] $ git push o
rigin main
fatal: not a git repository (or any of the parent directories): .git
(TraeAI-4) D:\malvisoftware\panna-betting [1:128] $ 

- Gamified UI/UX that feels like a modern game app
- Scalable backend that handles concurrent bets and daily market resets
- Accurate “Panna” rule: treat 0 as greatest digit (value 10), auto-sort inputs

## Tech Stack

- Frontend: Next.js (React, App Router, Tailwind)
- Backend: Next.js API Routes (Node)
- Database: PostgreSQL on Supabase
- Auth: Supabase Auth (Mobile OTP)

## Live Demo & Repository

- GitHub Repo: add URL after pushing this folder to your GitHub account
- Live Demo (Vercel): add URL after importing the repo to Vercel

## Features

- Authentication: Mobile number + OTP via Supabase
- Dashboard (Gamified):
  - Three markets with open/close windows
  - Visual status glow (green open, grey closed)
  - “Time Left to Bet” countdown ticker
- Betting Interface:
  - Smart Autocomplete driven by Panna rules
  - Game Types: Single Digit, Jodi, Single Panna, Double Panna, Triple Panna
  - Wallet starts at ₹50,000 with deduction animation on bet
- Admin Dashboard (to implement next):
  - Market control (open/close times)
  - Daily reset (distinguish today vs yesterday bets)
  - Live bets feed and result declaration

## Core Game Logic (Panna)

- Value order: 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0 (0 valued as 10)
- Auto-sorting of a 3-digit “Panna” by this order
  - Example: 1,4,2 ➝ 124
  - Example: 5,0,2 ➝ 250 (2 < 5 < 0)
- Implementation:
  - Sorting, validation, and suggestions: [panna.ts](file:///d:/malvisoftware/panna-betting/src/lib/panna.ts)
  - Betting UI autocomplete: [bet/page.tsx](file:///d:/malvisoftware/panna-betting/src/app/bet/page.tsx)

## Database Schema (PostgreSQL)

Relational schema for queryable, scalable operations:

- users ➝ wallets ➝ markets ➝ bets ➝ results
- SQL definitions and functions: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
- Key indexes support queries like “How many users bet on Single Panna ‘120’ today?”

### Daily Reset

- Store placed_at timestamps on bets
- Use result_date in results with unique(market_id, result_date)
- Query today vs yesterday via date(placed_at) and result_date

## API Security & Concurrency

- Server-side time checks:
  - Bets API validates if any market is currently open before allowing bets
  - Route stub: [route.ts](file:///d:/malvisoftware/panna-betting/src/app/api/bets/route.ts)
- Concurrency-safe wallet deduction (Supabase RPC):
  - public.place_bet enforces open window and atomic wallet update + bet insert
  - See function in [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)

## Scalability Note

If 100,000 users bet at 11:59 AM, to prevent the database from crashing:

- Use a stored procedure (place_bet) to atomically deduct wallet and insert bet, eliminating double-deduction race conditions
- Enable connection pooling (PgBouncer) and apply API backpressure:
  - Short server timeouts, rate limiting, and “queued” responses when saturation is detected
- Introduce a durable queue for overflow (e.g., Redis + worker) so the API responds fast while workers process bet batches sequentially
- Keep hot-path indexes narrow; partition or index bets by market_id and date(placed_at)
- Cache read-heavy admin metrics (e.g., “today’s counts per selection”) in Redis; backfill from bets asynchronously

## Environment Variables

Place in Vercel Project Settings (and .env.local for local dev):

- NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
- SUPABASE_DB_URL=postgres connection string (server-side only)

## Supabase Setup

1. Create Supabase project
2. Enable Phone OTP in Auth
3. Run schema SQL: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
4. Seed markets:
   - Laxmi Morning: 09:00–12:00
   - Shridevi Morning: 13:00–15:00
   - Karnatak Day: 16:00–19:00
5. Create wallet rows for users with starting balance ₹50,000

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

- Dashboard: /
- Login (OTP): /(auth)/login
- Betting: /bet

## Deployment (Vercel)

1. Push this project to GitHub
2. Import repository into Vercel
3. Add environment variables (see above)
4. Deploy

## Project Structure

- Supabase client: [supabase.ts](file:///d:/malvisoftware/panna-betting/src/lib/supabase.ts)
- Panna logic: [panna.ts](file:///d:/malvisoftware/panna-betting/src/lib/panna.ts)
- Dashboard: [page.tsx](file:///d:/malvisoftware/panna-betting/src/app/page.tsx)
- Betting: [bet/page.tsx](file:///d:/malvisoftware/panna-betting/src/app/bet/page.tsx)
- Bets API: [route.ts](file:///d:/malvisoftware/panna-betting/src/app/api/bets/route.ts)
- Schema: [schema.sql](file:///d:/malvisoftware/panna-betting/db/schema.sql)
