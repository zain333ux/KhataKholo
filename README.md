# KhataKholo

KhataKholo is a mobile-first roommate khata app for hostel rooms. One roommate adds a shared expense, chooses the included roommates, and the app keeps private pairwise balances so users only see dues where they are personally involved.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase Free Tier PostgreSQL
- Cloudinary Free Tier for receipt uploads
- Vercel deployment
- PWA manifest and service worker for mobile home-screen install

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Start the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a Supabase project.
2. For a new project, open SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. If you already ran the older email-based schema, run `supabase/migrations/002_custom_pin_auth_refactor.sql` after it.
4. Copy the project URL and service role key into `.env.local`.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it in browser code.

The app does not use email-based authentication. Roommates log in with room code, username/phone, and a 6-digit PIN. PINs are stored as hashes in `roommates.pin_hash`, and login state uses an HTTP-only custom session cookie backed by `roommate_sessions`.

## Cloudinary Setup

1. Create a free Cloudinary account.
2. Copy cloud name, API key, and API secret into `.env.local`.
3. Receipt uploads use a signed route at `POST /api/cloudinary/sign`.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Add all variables from `.env.example` in Vercel Project Settings.
4. Deploy.

No SQLite, Firebase, paid APIs, SMS login, recurring expenses, or approve/decline expense workflow is used.

## Useful Commands

```bash
npm run lint
npm run test
npm run build
```

## Privacy Model

- `balances`, `payments`, and `reminders` are private pairwise records.
- Server-side queries identify the current roommate from the custom session cookie and explicitly filter private pairwise data.
- Admins can manage roommates and see general room expenses, but the UI does not show private balances between other roommates.
- Server actions also validate group membership before mutating expenses, payments, disputes, or reminders.

## Main Routes

- `/create-room`: create room and first admin roommate
- `/login`: room code + username/phone + PIN login
- `/home`: dashboard
- `/add-expense`: equal/custom split expense form
- `/khata`: private balances and payment/reminder actions
- `/history`: private activity timeline
- `/profile`: profile, PIN change, logout
- `/admin/roommates`: admin roommate management
