<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=210&color=0:064E3B,50:059669,100:34D399&text=KhataKholo&fontColor=ffffff&fontSize=56&fontAlignY=38&desc=Shared%20expenses.%20Clear%20balances.%20Peaceful%20rooms.&descAlignY=60&animation=fadeIn" alt="KhataKholo animated header" />

<img src="public/icons/icon-192x192.png" alt="KhataKholo app icon" width="104" />

<br />

<a href="https://khata-kholo.vercel.app/login">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=20&duration=2600&pause=700&color=059669&center=true&vCenter=true&repeat=true&width=640&height=52&lines=Add+the+expense.+Pick+the+roommates.;Split+it+equally+or+set+custom+shares.;Know+exactly+who+owes+whom.;Settle+the+khata+without+the+awkwardness." alt="Animated overview of KhataKholo" />
</a>

<p>
  A private, mobile-first expense tracker for hostel rooms and shared homes.<br />
  Built for the everyday question: "Wait, who paid last time?"
</p>

<p>
  <a href="https://khata-kholo.vercel.app/login">
    <img src="https://img.shields.io/badge/OPEN_LIVE_APP-059669?style=for-the-badge&logo=vercel&logoColor=white" alt="Open the live KhataKholo app" />
  </a>
  <a href="https://github.com/zain333ux/KhataKholo">
    <img src="https://img.shields.io/github/last-commit/zain333ux/KhataKholo?style=for-the-badge&color=10B981&label=LAST%20UPDATE" alt="Latest GitHub commit" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js_16-111827?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-1F2937?style=flat-square&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="Progressive Web App" />
</p>

</div>

## The short version

Room expenses have a habit of disappearing into chat messages, screenshots, and half-remembered promises. KhataKholo keeps one shared record for the room, then shows each person only the balances that involve them.

Add an expense. Choose who shared it. Split the amount equally or set custom shares. KhataKholo handles the pairwise math and keeps the result private.

<div align="center">

| Add it | Split it | Settle it |
| :---: | :---: | :---: |
| Record an expense and attach a receipt | Include the right roommates and choose each share | Confirm payments and close the balance |

</div>

## What you can do

| Feature | What it means in the app |
| --- | --- |
| Flexible splits | Divide an expense equally or enter exact custom shares |
| Personal khata | See your own dues without exposing everyone else's balances |
| Confirmed payments | Both roommates take part in the settlement flow |
| Receipt uploads | Compress and upload receipt images through Cloudinary |
| Disputes | Flag an expense when the amount, members, or note looks wrong |
| Reminders | Share a ready-made payment reminder with the person who owes you |
| Room controls | Admins can add roommates, change roles, reset PINs, and remove accounts |
| Private history | Review the activity connected to your own khata |
| Installable PWA | Add KhataKholo to a phone's home screen and get a dedicated offline view |

## Try the live app

<div align="center">

### [khata-kholo.vercel.app/login](https://khata-kholo.vercel.app/login)

Use your room code, username or phone number, and six-digit PIN to sign in.

[![Launch KhataKholo](https://img.shields.io/badge/Launch_KhataKholo-10B981?style=for-the-badge&logo=googlechrome&logoColor=white)](https://khata-kholo.vercel.app/login)

</div>

New room? Open **Create room**, choose a room code, and create the first admin account. That admin can add the rest of the roommates.

## How the khata moves

```mermaid
flowchart LR
    A["Create or join a room"] --> B["Add an expense"]
    B --> C{"Choose the split"}
    C -->|Equal| D["Divide between selected roommates"]
    C -->|Custom| E["Enter each share"]
    D --> F["Update private balances"]
    E --> F
    F --> G["Record a payment"]
    G --> H["Other roommate confirms"]
    H --> I["Khata settled"]

    style A fill:#ECFDF5,stroke:#059669,color:#064E3B
    style C fill:#FFFBEB,stroke:#D97706,color:#78350F
    style F fill:#EFF6FF,stroke:#2563EB,color:#1E3A8A
    style I fill:#D1FAE5,stroke:#047857,color:#064E3B
```

## Privacy without the fine print

KhataKholo does not turn the room into a public debt scoreboard.

- The signed-in roommate only receives balances, payments, reminders, and history connected to their account.
- Server actions check room membership before changing financial records.
- The database stores hashed PINs, not readable PINs.
- Login sessions use an HTTP-only cookie backed by `roommate_sessions`.
- `SUPABASE_SERVICE_ROLE_KEY` stays on the server.

Room admins can manage accounts and view the room's general expenses. The interface does not show them private balances between two other roommates.

## Built with

<div align="center">

| Part | Choice | Why it is here |
| --- | --- | --- |
| Web app | Next.js 16, React 19, TypeScript | App Router pages, server actions, and typed code |
| Interface | Tailwind CSS 4, Lucide React | A fast, consistent mobile UI |
| Data | Supabase PostgreSQL | Room, expense, balance, and session records |
| Receipts | Cloudinary | Signed image uploads and delivery |
| Validation | Zod | Safer form and environment input |
| Tests | Vitest | Coverage for splits, balances, PINs, and credentials |
| Delivery | Vercel | Production hosting and environment management |
| Mobile | Manifest and service worker | Home-screen installation and offline fallback |

</div>

## Routes at a glance

| Route | What lives there |
| --- | --- |
| `/create-room` | Room setup and the first admin account |
| `/login` | Room code, login ID, and PIN authentication |
| `/home` | Balance summary and recent room activity |
| `/add-expense` | Equal and custom expense splits |
| `/expenses/[id]` | Expense details and disputes |
| `/khata` | Private balances and roommate khata cards |
| `/khata/[roommateId]` | One pairwise balance and its actions |
| `/payments/confirmations` | Payments waiting for confirmation |
| `/history` | Personal financial history |
| `/profile` | Profile, PIN change, and logout |
| `/admin/roommates` | Roommate accounts, roles, PIN resets, and removal |

## Run it locally

### What you need

- Node.js 20 or newer
- A Supabase project
- A Cloudinary account if you want receipt uploads

### 1. Clone the project

```bash
git clone https://github.com/zain333ux/KhataKholo.git
cd KhataKholo
npm install
```

### 2. Add the environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Keep `.env.local` out of Git. The Supabase service-role key must never reach browser code.

### 3. Create the database

Open the Supabase SQL Editor and run the migrations in this order:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_custom_pin_auth_refactor.sql
supabase/migrations/003_performance_indexes.sql
```

### 4. Start developing

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Check code style and common mistakes |
| `npm run test` | Run the Vitest test suite once |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |

## Project map

```text
KhataKholo/
├── public/
│   ├── icons/              # App and maskable PWA icons
│   └── sw.js               # Service worker
├── scripts/                # Icon generation and development data
├── src/
│   ├── app/                # Pages, layouts, and API routes
│   ├── components/         # Forms, cards, navigation, and shared UI
│   ├── lib/
│   │   ├── actions/        # Authenticated server mutations
│   │   ├── auth/           # PIN hashing and session handling
│   │   ├── calculations/   # Split and balance math
│   │   ├── queries/        # Privacy-filtered database reads
│   │   └── supabase/       # Server database client
│   └── types/              # App and database types
└── supabase/
    └── migrations/         # Schema changes and performance indexes
```

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Add every value from `.env.example` under **Project Settings > Environment Variables**.
3. Apply the Supabase migrations.
4. Deploy.
5. Test login, room creation, expense splitting, and payment confirmation in production.

## Current scope

KhataKholo uses custom room-code and PIN authentication. It does not depend on email login, SMS, paid APIs, recurring expenses, or an approval step for every new expense.

<br />

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0:064E3B,50:10B981,100:6EE7B7" width="100%" alt="" />

### Less spreadsheet. Less guesswork. Better roommate math.

[Live app](https://khata-kholo.vercel.app/login) · [Source](https://github.com/zain333ux/KhataKholo) · [Issues](https://github.com/zain333ux/KhataKholo/issues)

<sub>Made for roommates who would rather settle the khata than debate it.</sub>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=110&section=footer&color=0:34D399,50:059669,100:064E3B&animation=fadeIn" alt="KhataKholo footer" />

</div>
