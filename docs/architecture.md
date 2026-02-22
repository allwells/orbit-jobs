# Architecture & Implementation Decisions

## Phase 1: Infrastructure, Theming & Project Setup

### Technology Choices

- **Package Manager**: `bun` used for faster installs and script execution.
- **Framework**: Next.js 15 (App Router) with TypeScript.
- **UI Library**: Mantine v7.
- **State Management**: React Context/Hooks (standard Next.js patterns).
- **Icons**: `lucide-react` (standard) instead of `@tabler/icons-react`.

### Project Structure

- **Source Directory**: API, components, lib, and app routes are located in `src/`.
- **Documentation**: All project documentation resides in `docs/`.
- **Absolute Imports**: configured as `@/*` mapping to `./src/*`.

### Theming Strategy

- **Strict Dark Mode**: Default background set to `#020202` (Deep Black) to match specific design requirements.
- **Primary Color**: Indigo (`#6366F1`).
- **Theme Toggle**: Custom "Vercel-style" toggle implemented using `SegmentedControl` with sliding pill animation and icon-only labels.

### Deployment & CI

- **Type Checking**: Added `typecheck` script (`tsc --noEmit`) to ensuring rigorous type safety before builds.

## Phase 2: Secure Admin Authentication

### Authentication Strategy

- **Library**: `better-auth` with Supabase adapter (via `pg` pool) for robust session management.
- **Provider**: Username/Password strictly (Email/OAuth disabled) to restrict access to the single admin user.
- **Security**:
  - `httpOnly` and `secure` cookies for session storage.
  - Public registration disabled globally.
  - Middleware establishes a strict boundary: Public (`/login`, `/`) vs. Protected (`/dashboard/*`).

### Implementation Details

- **Database Connection**: Used `pg` connection pool with SSL enabled for reliable Supabase connectivity in server-side auth.
- **Client Handling**: Created `useAuth` hook wrapping `auth-client` to provide typesafe `login`, `logout`, and `session` state to UI components.
- **Seeding**: Implemented idempotent `seed-admin.ts` script to safely initialize the root admin account without risk of duplication.

## Phase 3: Database Schema & Activity Logging

### Database Migration

- **Decision**: Custom Migration Script
- **Context**: Lack of direct Supabase CLI access in the current environment.
- **What We Did**: Created `src/schema/phase3.sql` and `scripts/migrate-phase3.ts` using the `pg` library to execute DDL statements.
- **Trade-offs**: Manual schema management is less robust than full migrations but sufficient for this single-developer project.

### Schema Adjustments

- **Decision**: `user_id` as `TEXT`
- **Context**: BetterAuth defaults to `TEXT` IDs for the `users` table.
- **What We Did**: Updated `jobs`, `activities`, and `settings` tables to use `TEXT` for foreign keys referencing `users.id` instead of `UUID` to prevent type mismatch errors implementation.

### Type Safety

- **Decision**: Manual Type Definitions
- **Context**: Cannot run Supabase CLI type generation.
- **What We Did**: Created `src/types/database.ts` manually mirroring the schema.
- **Trade-offs**: Requires manual updates when schema changes, but ensures strict typing now.

### Activity Logging

- **Decision**: Centralized Logger Service
- **What We Did**: implemented `activityLogger` in `src/lib/activity-logger.ts` with convenience methods for common actions.
- **Why**: Ensures consistent logging formats and simplifies usage across components.
- **Realtime**: `useActivities` hook implements Supabase Realtime subscriptions to update the feed instantly.

## Theme System Implementation

**Decision**: Mantine-based theme system with inverse color relationships
**Date**: 2026-02-14
**Context**: Needed light and dark theme support with consistent component styling.
**What We Did**:

- Created comprehensive color token system with mathematical inverse relationships in `src/lib/theme.ts`.
- Built Vercel-style theme switcher with sliding indicator animation in `src/components/ThemeToggle`.
- Implemented `ThemeContext` with localStorage persistence and system preference detection.
- Converted core components to use theme tokens instead of hardcoded colors.
- Added `Providers` component to handle client-side theme injection into Mantine.
  **Why**:
- Ensures perfect consistency between light and dark themes.
- Provides better TypeScript support than CSS variables.
- Matches modern SaaS application standards.
- Improves accessibility with proper contrast ratios.
  **How to Use**:
- Import theme: `import { useMantineTheme } from '@mantine/core'`
- Access tokens: `theme.other.background.primary`, `theme.other.text.primary`
- Change theme: `import { useTheme } from '@/contexts/ThemeContext'`
- Component styling: Use `style` prop with theme values or Mantine props.
  **Trade-offs**:
- Requires client components for theme access in some cases.
  **Consistency Rules**:
- Sidebar nav hover and dropdown hover must both use `background.hover`.
- All cards use `background.secondary` with `border.default`.
- All inputs use `background.input` with `border.input`.

## Phase 4: Job Fetching System

### Data Fetching Strategy

- **Decision**: Server Actions for Job Fetching
- **Context**: Needed to fetch jobs from third-party API and save to database securely.
- **What We Did**: Implemented `getJobsAction` and `fetchAndStoreJobs` pattern.
- **Why**: Keeps API keys on server, handles database transaction (fetch -> dedupe -> insert) atomically.

### Deduplication Logic

- **Decision**: `job_id` from Provider
- **Context**: JSearch returns a unique `job_id`.
- **What We Did**: Created unique constraint on `jobs.job_id` and implemented "skip if exists" logic in fetch service.
- **Result**: Prevents duplicate entries on subsequent fetches.

## Phase 5: AI Content Generation & Dashboard Optimization

### AI Integration

- **Decision**: Vercel AI SDK
- **Context**: access to multiple models (OpenAI, Anthropic, Google).
- **What We Did**: Configured `ai` SDK with provider registry.
- **UX**: Implemented streaming UI for content generation to provide immediate feedback.

### Dashboard Performance

- **Decision**: Aggregated Data Fetching (`getDashboardDataAction`)
- **Context**: Dashboard was making 3 separate round trips (stats, jobs, activity).
- **What We Did**: Created a single Server Action to fetch all dashboard data in parallel using `Promise.all`.
- **Result**: Reduced initial load latency and prevented waterfalls.

### Settings Management

- **Decision**: `settings` table with JSONB value
- **Context**: Need to store flexible user preferences (e.g., default AI model).
- **What We Did**: Implemented generic `updateSettingAction(key, value)` that upserts into a key-value table.
- **Why**: Allows adding new settings without schema migrations.

## Phase 7: UI Polish & Theme Compliance

### Theme Enforcement

- **Decision**: Global Token Refactor
- **Context**: UI was inconsistent with the theme guide.
- **What We Did**: Audited all components and replaced hex codes with `theme.other.*` tokens.
- **Visuals**: Standardized on `#1A1A1A` (`background.secondary`) for cards in dark mode to create depth against the `#020202` page background.
- **Navigation**: Moved Theme Switch to sidebar footer to clean up the header area.
