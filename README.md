## Pixel Trial Manager Portal

An interactive portal for tracking personal and team trial accounts, crafted with a voxel-inspired, pixel-art aesthetic. The app couples a responsive Next.js frontend with animated UI primitives, React Query data orchestration, and Supabase-ready CRUD workflows.

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
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin mutations |
   | `SUPABASE_JWT_SECRET` | JWT secret if custom auth is required |
   | `NEXT_PUBLIC_SITE_URL` | Base site URL for links |

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

- **Portal Experience**: Pixel-themed dashboard with live countdown timers, voxel 3D stage, and filterable trial grid.
- **Trial Detail Lens**: Rich account overview, scanline-glow cards, contextual alerts, and actionable controls.
- **Admin Command Center**: CRUD form wired to server actions & Supabase-ready repository, with API routes under `/api/trials`.
- **Design System**: `pixel-border`, CRT overlays, retro audio hooks, and responsive primitives for quick reuse.

### API & Data Layer

- REST endpoints: `/api/trials` (list/create) and `/api/trials/[id]` (read/update/delete)
- Repository gracefully falls back to mock data when Supabase credentials are absent
- Client data flows through React Query with optimistic cache invalidation after mutations

### Testing & Quality

- Linting (`npm run lint`) enforces code style & purity
- Vitest sanity test ensures the harness executes (`npm run test`)
- Accessibility-minded design: high contrast palette, focus styles, reduced-motion aware animations

### Future Enhancements

- Connect Supabase migrations / seeding for live data
- Expand test coverage for hooks and components
- Integrate background jobs for renewal reminders

Enjoy the CRT glow ✨
