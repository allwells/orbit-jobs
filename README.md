# 🪐 OrbitJobs

**Monetizing high-value job listings on X (Twitter) through human-in-the-loop automation.**

OrbitJobs is a specialized content engine designed to bridge the gap between job platforms (like LinkedIn) and X's Ads Revenue Sharing program. It hunts for high-paying tech jobs, uses Gemini Pro to rewrite them into viral-ready "hooks," and delivers them to a command center for review and posting.

---

## 🚀 The Vision

OrbitJobs removes the heavy lifting of sourcing and writing while maintaining the "human" feel essential for modern social algorithms.

- **Source:** Stealth scraping of public job data.
- **Polish:** Gemini Pro optimized "Hook + Reply" thread generation.
- **Notify:** Real-time Telegram alerts for new high-value leads.
- **Publish:** A mobile-responsive command center for manual or semi-automated posting.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun
- **Styling:** Mantine UI v8 + Vanilla CSS
- **Theme:** Strict Dark Mode (`#101010`) with Electric Indigo (`#6366F1`)
- **Intelligence:** Gemini Pro (Google AI SDK)
- **Scraper:** Playwright (Stealth Mode)
- **Database:** Supabase
- **Icons:** Lucide React

---

## 📈 Implementation Roadmap

### Phase 1: Infrastructure & Mantine Theming ✅

- Initialize Next.js + TypeScript + Bun.
- Custom Mantine theme with strict `#101010` background.
- Responsive AppShell with theme toggle (Vercel-style).
- Supabase integration and core database types.

### Phase 2: "The Seeker" (Stealth Scraper) 🏗️

- Playwright-based LinkedIn scraping (logged-out state).
- Jitter, human-like scrolling, and user-agent rotation.
- Search keyword management UI.

### Phase 3: "The Brain" (Gemini Pro) 🧪

- Automated Hook/Reply thread generation.
- Strict "No Links in Main Tweet" rule.
- Content draft archival.

### Phase 4: "The Messenger" (Telegram) 📬

- Push notifications for new jobs.
- Direct deep-links to the OrbitJobs dashboard.

### Phase 5: "The Command Center" (Posting) 🖥️

- Job queue management.
- Dual posting (Manual Copy or X API v2).
- API rate limit tracking.

---

## 📦 Getting Started

### 1. Environment Configuration

Create a `.env.local` file in the root directory and add the following:

```env
# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres.project:password@aws-0-region.pooler.supabase.com:5432/postgres

# ── Better Auth ────────────────────────
BETTER_AUTH_SECRET=your_generated_secret_base64
BETTER_AUTH_URL=http://localhost:3000

# ── Admin Credentials (for seeding) ────
ADMIN_USERNAME=orbitjobsadmin
ADMIN_PASSWORD=OrbitJobs@1#
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Initialize Database & Admin User

Run the seed script to create the database schema and the initial admin user.

```bash
bun run scripts/seed-admin.ts
```

### 4. Run Development Server

```bash
bun run dev
```

### 5. Access Command Center

Visit `http://localhost:3000/login` and sign in with your configured admin credentials.

---

## 🛠️ Commands

```bash
# Run development server
bun run dev

# Build for production
bun run build

# Run type check
bun run typecheck
```

## 📸 Phase 1 Preview

- **Theme:** Electric Indigo primary, `#101010` background.
- **Toggle:** Vercel-style System/Light/Dark mode.
- **Mobile:** Fully responsive layout for on-the-go approvals.

---

Developed for **@TheOrbitJobs**
