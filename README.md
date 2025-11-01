## Pixel Trial Manager Portal

An interactive portal for tracking personal and team trial accounts, crafted with a voxel-inspired, pixel-art aesthetic. The app couples a responsive Next.js frontend with animated UI primitives, React Query data orchestration, and Supabase-ready CRUD workflows.

✨ **NEW**: Server-side real-time countdown that works even when users are inactive! See [QUICK_START_REALTIME.md](QUICK_START_REALTIME.md) for setup.

### Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling & Theme**: Tailwind CSS, custom pixel CSS utilities, Framer Motion, GSAP
- **3D/Visuals**: `@react-three/fiber`, `@react-three/drei`, bespoke voxel scene
- **State/Data**: React Query, Zustand, Supabase client helpers
- **Tooling**: ESLint, Prettier, Vitest, Testing Library

### Prerequisites

- Node.js 18+
- npm (bundled with Node) or pnpm/yarn if preferred

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables. Copy the example file (`env.example`) to `.env.local` and supply Supabase keys if you want to persist data. Without credentials, the app falls back to rich mock data.

   ```bash
   cp env.example .env.local
   ```

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client queries |
   | `SUPABASE_SERVICE_ROLE_KEY` | **REQUIRED** for server-side operations and cron jobs |
   | `SUPABASE_JWT_SECRET` | JWT secret if custom auth is required |
   | `NEXT_PUBLIC_SITE_URL` | Base site URL for links |
   | `CRON_SECRET` | (Optional) Secret for Vercel Cron authentication |

3. Run the development server:

   ```bash
   npm run dev
   ```

   Navigate to <http://localhost:3000> to explore the dashboard, trial detail pages, and admin center.

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with HMR |
| `npm run build` | Generate the production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |
| `npm run test` | Execute Vitest test suite |
| `npm run format` / `format:write` | Check or apply Prettier formatting |

### Project Highlights

- **Real-Time Countdown**: Server-side countdown that updates automatically even when users are offline
- **Portal Experience**: Pixel-themed dashboard with live countdown timers, voxel 3D stage, and filterable trial grid
- **Trial Detail Lens**: Rich account overview, scanline-glow cards, contextual alerts, and actionable controls
- **Admin Command Center**: CRUD form wired to server actions & Supabase-ready repository, with API routes under `/api/trials`
- **Design System**: `pixel-border`, CRT overlays, retro audio hooks, and responsive primitives for quick reuse
- **Real-Time Sync**: Supabase real-time subscriptions keep all clients synchronized instantly

### API & Data Layer

- REST endpoints: `/api/trials` (list/create), `/api/trials/[id]` (read/update/delete), and `/api/trials/closest` (countdown)
- Real-time subscriptions via Supabase for instant synchronization across all clients
- Database triggers automatically update trial status on every write
- Scheduled cron jobs (pg_cron/Vercel/GitHub Actions) keep statuses fresh every 5 minutes
- Repository gracefully falls back to mock data when Supabase credentials are absent
- Client data flows through React Query with optimistic cache invalidation after mutations

### Testing & Quality

- Linting (`npm run lint`) enforces code style & purity
- Vitest sanity test ensures the harness executes (`npm run test`)
- Accessibility-minded design: high contrast palette, focus styles, reduced-motion aware animations

### Real-Time Countdown Setup

Ready to enable the server-side real-time countdown? Follow these guides:

- **Quick Start**: [QUICK_START_REALTIME.md](QUICK_START_REALTIME.md) - Get it working in 5 minutes
- **Full Documentation**: [REALTIME_COUNTDOWN_SETUP.md](REALTIME_COUNTDOWN_SETUP.md) - Comprehensive setup guide

**Key Features:**
- ✅ Countdown works 24/7, even when users are offline
- ✅ Automatic status updates via database triggers
- ✅ Real-time synchronization across all clients
- ✅ Multiple cron options (pg_cron, Vercel, GitHub Actions, or external)
- ✅ Landing page shows the closest expiring trial

### Future Enhancements

- Email notifications when trials are about to expire
- SMS alerts for critical trials (24 hours before)
- Expand test coverage for hooks and components
- Webhook support for external integrations
- Admin analytics dashboard

Enjoy the CRT glow ✨
