## PROJECT OVERVIEW

Project Name: `OrbitJobs`
X Handle: `@TheOrbitJobs`
Repository: `orbit-jobs`
Primary Goal: Monetize high-value job listings on X through AI-powered content curation

This is a PERSONAL PROJECT for personal use only. Build a clean, type-safe, component-based architecture with comprehensive error handling and visual feedback.

================================================================================
ARCHITECTURAL FOUNDATION & NON-NEGOTIABLE RULES
================================================================================

## TECHNOLOGY STACK

- Framework: Next.js (App Router, TypeScript, Turbopack)
- UI Library: Mantine
- Database: Supabase (PostgreSQL)
- Authentication: BetterAuth with Supabase adapter
- AI Models: Vercel AI SDK (multi-provider: OpenAI, Anthropic, Google, etc.)
- Job Data Source: JSearch API via RapidAPI
- Notifications: Telegram Bot API
- Charts/Analytics: Chart.js
- Deployment: Vercel
- Package Manager: bun

## STRICT PROJECT STRUCTURE

Your codebase must follow this exact component-based hierarchy:

```markdown
/app
/api # API routes
/(auth)
/login # Login page
/(dashboard)
/dashboard # Main dashboard
/jobs # Jobs management
/settings # Settings page
/analytics # Analytics page
layout.tsx
page.tsx

/components
/[ComponentName] # Each component gets its own folder
index.tsx # Main component file
/hooks # Component-specific hooks
use-component-logic.ts
constants.ts # Component-specific constants
types.ts # Component-specific types
utils.ts # Component-specific utilities
formatters.ts # Component-specific formatters (if needed)
validators.ts # Component-specific validators (if needed)

/lib
auth.ts # BetterAuth configuration
supabase.ts # Supabase client
jsearch.ts # JSearch API client
telegram.ts # Telegram Bot client
ai.ts # Vercel AI SDK configuration
x-api.ts # X (Twitter) API v2 client

/utils
formatters.ts # Global formatting utilities
validators.ts # Global validation utilities
date-utils.ts # Date/time utilities
helpers.ts # General helper functions

/types
database.ts # Database types (Supabase generated)
job.ts # Job-related types
activity.ts # Activity log types
api.ts # API response types
ui.ts # UI-related types

/hooks
use-auth.ts # Global auth hook
use-activities.ts # Activity logging hook
use-jobs.ts # Jobs management hook

/scripts
seed-admin.ts # Admin user seeding script

/middleware.ts # Auth protection middleware
```

## TYPE SAFETY REQUIREMENTS

1. ZERO `any` types allowed in the entire codebase
2. All function parameters MUST be typed
3. All function return values MUST be typed
4. All component props MUST have TypeScript interfaces
5. All API responses MUST have defined interfaces
6. All database queries MUST return typed results
7. MUST use Supabase's generated types for database operations
8. MUST create custom types/interfaces for all complex objects
9. MUST use strict TypeScript configuration (strict: true in tsconfig.json)

## ERROR HANDLING CONTRACT

Every async operation must implement this pattern:

```typescript
try {
  setLoading(true);
  const result = await someAsyncOperation();

  // Success notification
  notifications.show({
    title: 'Success',
    message: 'Operation completed successfully',
    color: 'green',
    icon: <IconCheck size={16} />,
  });

  return result;
} catch (error) {
  console.error('Operation failed:', error);

  // Error notification
  notifications.show({
    title: 'Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    color: 'red',
    icon: <IconX size={16} />,
  });

  // Optionally rethrow or handle
} finally {
  setLoading(false);
}
```

UI Error States:

- MUST show loading skeletons during async operations
- MUST display inline error messages for form validation
- MUST use Mantine's Alert component for non-blocking errors
- MUST use Mantine's Notification system for async operation feedback
- NEVER leave a user wondering what happened

## DESIGN SYSTEM

Primary Brand Color: Electric Indigo (#6366F1)
Dark Theme Background: Strict #020202
Secondary Background: #101010
Text Primary: #FFFFFF
Text Secondary: #A0A0A0
Border Color: #2A2A2A
Success: #10B981
Error: #EF4444
Warning: #F59E0B

Theme Switcher:

- Vercel-style toggle (current existing one) (System, Light, Dark)
- Use Lucide icons: Sun, Moon, Monitor
- Store preference in localStorage
- Apply theme via Mantine's MantineProvider

Mobile Responsiveness:

- The entire dashboard MUST be fully functional on mobile devices
- All modals MUST be responsive with proper mobile layouts
- Tables should convert to stacked cards on mobile
- All buttons and interactive elements MUST be touch-friendly (min 44px height)
- I will test on viewport widths and give feedback: 375px (mobile), 768px (tablet), 1024px (desktop)

## COMPONENT ARCHITECTURE PRINCIPLES

1. Single Responsibility: Each component does ONE thing well
2. Composition Over Inheritance: Build complex UIs by composing simple components
3. Props Down, Events Up: Parent components pass data down, children emit events up
4. Controlled Components: Form inputs should be controlled via React state
5. Separation of Concerns: Keep business logic in hooks, presentation in components
6. Reusability: If you use something twice, extract it into a shared component
7. Accessibility: All interactive elements must have proper ARIA labels
8. Performance: Use `React.memo` for expensive components, `useMemo` for heavy computations
9. Consistency: Use custom hooks wrapping Supabase queries for all data fetching; maintain uniform error handling patterns and avoid mixing different state management paradigms and component design style should be consistent

## ACTIVITY LOGGING REQUIREMENTS

Every significant action in the application must be logged to the database.

Activities to Log:

- User login/logout
- Job fetch runs (with metadata: query params, results count, duplicates found, results saved)
- Job approvals/rejections
- Jobs marked as posted
- AI content generation runs
- Settings changes
- API errors and failures (with meaning activity title and description)
- X API posts (success/failure)

Activity Log Structure:

```json
{
  id: UUID
  user_id: UUID (reference to auth user)
  activity_type: 'login' | 'job_fetch' | 'job_approved' | 'job_posted' | 'content_generated' | 'settings_updated' | 'api_error'
  title: string (e.g., "Job Fetch Completed")
  description: string (e.g., "Fetched 25 new jobs, 3 duplicates skipped")
  metadata: JSONB (flexible storage for activity-specific data)
  created_at: timestamp
}
```

Activity Metadata Examples:
**Job Fetch**

```typescript
{
	query: string,
	filters: object,
	total_fetched: number,
	duplicates: number,
	new_jobs: number,
	api_response_time: number
}
```

**Content Generated**

```typescript
{
	job_id: UUID,
	model_used: string,
	tokens_used: number,
	generation_time: number
}
```

**Job Posted**

```typescript
{
	job_id: UUID,
	tweet_id: string,
	engagement_metrics: object
}
```

## DATABASE SCHEMA DESIGN

All tables must be created in Supabase with proper indexes, constraints, and RLS policies.

Table: users

- id: UUID (primary key)
- username: VARCHAR(50) UNIQUE NOT NULL
- password_hash: TEXT NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
- last_login: TIMESTAMP

Table: jobs

- id: UUID (primary key)
- job_id: TEXT UNIQUE NOT NULL (JSearch API job_id for deduplication)
- title: TEXT NOT NULL
- company: TEXT NOT NULL
- location: TEXT
- salary_min: INTEGER
- salary_max: INTEGER
- salary_currency: VARCHAR(3) DEFAULT 'USD'
- employment_type: TEXT (full-time, contract, etc.)
- remote_allowed: BOOLEAN DEFAULT FALSE
- description: TEXT
- required_skills: TEXT[]
- apply_url: TEXT NOT NULL
- source: TEXT DEFAULT 'jsearch'
- raw_data: JSONB (store complete API response)
- status: VARCHAR(20) DEFAULT 'pending' ('pending', 'approved', 'rejected', 'posted')
- ai_content_generated: BOOLEAN DEFAULT FALSE
- ai_thread_primary: TEXT
- ai_thread_reply: TEXT
- ai_model_used: TEXT
- posted_to_x: BOOLEAN DEFAULT FALSE
- posted_at: TIMESTAMP
- x_tweet_id: TEXT
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Table: activities

- id: UUID (primary key)
- user_id: UUID REFERENCES users(id)
- activity_type: VARCHAR(50) NOT NULL
- title: TEXT NOT NULL
- description: TEXT
- metadata: JSONB
- created_at: TIMESTAMP DEFAULT NOW()

Table: settings

- id: UUID (primary key)
- user_id: UUID REFERENCES users(id)
- setting_key: VARCHAR(100) NOT NULL
- setting_value: JSONB NOT NULL
- updated_at: TIMESTAMP DEFAULT NOW()
- UNIQUE(user_id, setting_key)

Table: job_fetch_config

- id: UUID (primary key)
- user_id: UUID REFERENCES users(id)
- search_query: TEXT NOT NULL (e.g., "remote react developer")
- location: TEXT
- remote_only: BOOLEAN DEFAULT TRUE
- employment_types: TEXT[] (e.g., ['FULLTIME', 'CONTRACTOR'])
- salary_min: INTEGER
- date_posted: VARCHAR(20) ('all', 'today', 'week', 'month')
- num_results: INTEGER DEFAULT 10
- last_run_at: TIMESTAMP
- last_run_results_count: INTEGER
- last_run_new_jobs: INTEGER
- last_run_duplicates: INTEGER
- is_default: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes to Create:

- CREATE INDEX idx_jobs_status ON jobs(status);
- CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
- CREATE INDEX idx_jobs_job_id ON jobs(job_id);
- CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
- CREATE INDEX idx_activities_user_id ON activities(user_id);
- CREATE INDEX idx_activities_type ON activities(activity_type);

================================================================================
PHASE 1: INFRASTRUCTURE, THEMING & PROJECT SETUP
================================================================================

## OBJECTIVE

Initialize the Next.js application with TypeScript, configure Mantine UI with the custom dark theme, set up Supabase connection, and create the foundational layout with mobile-responsive navigation and theme toggle.

## TECHNICAL REQUIREMENTS

1. Initialize Next.js with TypeScript and App Router using `bunx create next-app`
2. Install and configure required dependencies:
   - @mantine/core @mantine/hooks @mantine/notifications @mantine/dates
   - @supabase/supabase-js
   - better-auth
   - @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
   - ai (Vercel AI SDK)
   - axios (for API calls)
   - chart.js (for charts)
   - lucide-react (for icons)
   - date-fns (for date formatting)

3. Configure Mantine Theme Provider in app/layout.tsx:
   - Dark theme with background color #020202
   - Primary color: Indigo (#6366F1)
   - Enable dark mode by default
   - Configure global styles for scrollbars, focus rings, etc.

4. Set up Supabase client in lib/supabase.ts:
   - Create typed Supabase client
   - Export reusable client instance
   - Add environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (only if they don't exist)

5. Create theme toggle component with Vercel-style switcher:
   - System, Light, Dark modes
   - Use Lucide icons: Sun, Moon, Monitor
   - Store preference in localStorage
   - Smooth transition between themes where the active background slides to the active one

6. Build responsive navigation layout:
   - Desktop: Sidebar navigation with brand logo, menu items, theme toggle
   - Mobile: Bottom navigation bar or hamburger menu
   - Navigation items: Dashboard, Jobs, Analytics, Settings

## COMPONENT STRUCTURE

```markdown
/components/ThemeToggle
index.tsx
constants.ts (theme mode options)
types.ts (ThemeMode type)
hooks/use-theme-toggle.ts

/components/Navigation
index.tsx
constants.ts (nav items)
types.ts (NavItem type)
/MobileNav
index.tsx
/DesktopNav
index.tsx
```

## FILE STRUCTURE TO CREATE

```markdown
app/
layout.tsx (root layout with MantineProvider, Notifications)
page.tsx (home page, redirect to /dashboard)
globals.css (minimal global styles)

lib/
supabase.ts (Supabase client setup)

components/
ThemeToggle/ (as described above)
Navigation/ (as described above)

.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## IMPLEMENTATION CHECKLIST

- [ ] Next.js app initialized with TypeScript and App Router
- [ ] All required npm packages installed via bun
- [ ] Mantine configured with dark theme (#020202 background)
- [ ] Primary color set to Indigo (#6366F1)
- [ ] Supabase client created and typed
- [ ] Environment variables added to .env.local
- [ ] Theme toggle component working (System, Light, Dark)
- [ ] Theme preference persists in localStorage
- [ ] Desktop navigation renders correctly
- [ ] Mobile navigation renders correctly on viewport < 768px
- [ ] Navigation active state highlights current page
- [ ] All components are properly typed with TypeScript interfaces

## ERROR HANDLING FOR THIS PHASE

- If Supabase connection fails, show error message in console and UI
- If theme toggle fails to load from localStorage, default to 'dark' mode
- If navigation fails to render, show fallback minimal navigation

## ACCEPTANCE CRITERIA

1. Running `bun dev` starts the app without errors
2. Visiting localhost:3000 shows a themed page with working navigation
3. Theme toggle switches between light/dark/system modes smoothly
4. Background color is exactly #020202 in dark mode
5. Primary buttons and links use #6366F1 color
6. Navigation is fully responsive on mobile, tablet, and desktop
7. TypeScript compiles without errors (`bun typecheck`)
8. No console errors or warnings in browser

================================================================================
PHASE 2: SECURE ADMIN AUTHENTICATION (BETTERAUTH)
================================================================================

## OBJECTIVE

Implement a secure "Bootstrap Admin" authentication system using BetterAuth that restricts access to a SINGLE pre-defined administrator account. Public sign-ups must be strictly disabled. Only the admin can access the dashboard.

## CREDENTIALS & SECURITY

Target Admin User:
Username: `root`
Password: `OrbitJobs@1#`

CRITICAL SECURITY RULES:

1. NEVER store the password in plain text anywhere in the codebase
2. Create a seed script that hashes the password and inserts it into Supabase
3. Public registration endpoints must be disabled in BetterAuth config
4. Sessions must use secure, HTTP-only cookies
5. All dashboard routes must require authentication

## TECHNICAL REQUIREMENTS

1. Install BetterAuth:
   - better-auth
   - Configure with Supabase adapter

2. Create BetterAuth configuration in lib/auth.ts:
   - Enable username/password authentication
   - Disable email/password and OAuth providers
   - Disable public registration completely
   - Configure secure session cookies (httpOnly, secure, sameSite)
   - Set session expiry to 7 days

3. Create admin seed script in scripts/seed-admin.ts:
   - Hash password using bcrypt or BetterAuth's internal hashing
   - Insert admin user into Supabase users table
   - Script should be idempotent (safe to run multiple times)
   - Add script to package.json: "seed:admin": "tsx scripts/seed-admin.ts"

4. Create middleware.ts for route protection:
   - Protect all routes under /dashboard
   - If user is not authenticated, redirect to /login
   - Check BetterAuth session token from cookies
   - Allow public access only to /login and / (home)

5. Create login page in app/(auth)/login/page.tsx:
   - Dark themed (#020202 background)
   - Centered Mantine Card with OrbitJobs branding (create a reusable logo component using just text, "Orbit" will be medium and Jobs will be bold e.g. Orbit**Jobs** us a fancy font from nextjs google fonts for the logo)
   - Username input (TextInput)
   - Password input (PasswordInput with show/hide toggle)
   - Primary button: "Log In" (Indigo #6366F1)
   - Loading state during authentication (create a button component with loader on the left side of the button when in loading state)
   - Error handling with Mantine Notification
   - On successful login, redirect to `/dashboard`

6. Create auth API routes:
   - app/api/auth/login/route.ts (POST)
   - app/api/auth/logout/route.ts (POST)
   - app/api/auth/session/route.ts (GET)

7. Create `useAuth` hook in `hooks/use-auth.ts`:
   - Manages authentication state
   - Provides login, logout, and session check functions
   - Returns user data and loading state

## DATABASE SCHEMA FOR AUTH

Ensure Supabase users table has this structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

## COMPONENT STRUCTURE

```markdown
/app/(auth)/login
page.tsx (login page component)

/hooks
use-auth.ts (authentication hook)

/lib
auth.ts (BetterAuth configuration)

/scripts
seed-admin.ts (admin user seeding script)

/middleware.ts (route protection)
```

## SEED SCRIPT EXAMPLE STRUCTURE

```typescript
// scripts/seed-admin.ts
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "better-auth/crypto";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const ADMIN_USERNAME = "root";
const ADMIN_PASSWORD = "OrbitJobs@1#";

async function seedAdmin() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );

    // Check if admin already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", ADMIN_USERNAME)
      .single();

    if (existing) {
      console.log("Admin user already exists");
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    // Insert admin user
    const { error } = await supabase.from("users").insert({
      username: ADMIN_USERNAME,
      password_hash: passwordHash,
    });

    if (error) throw error;

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seedAdmin();
```

## ENVIRONMENT VARIABLES

Add to .env.local only if they don't already exist:

```env
BETTER_AUTH_SECRET=generate_a_random_32_character_string
BETTER_AUTH_URL=http://localhost:3000
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## IMPLEMENTATION CHECKLIST

- [ ] BetterAuth installed and configured
- [ ] Username/password authentication enabled
- [ ] Public registration disabled in config
- [ ] Seed script creates admin user with hashed password
- [ ] Admin user exists in Supabase users table
- [ ] Middleware protects /dashboard routes
- [ ] Unauthenticated users redirect to /login
- [ ] Login page matches dark theme (#020202)
- [ ] Login form has username and password inputs
- [ ] Login button triggers authentication
- [ ] Loading state shows during login attempt
- [ ] Success notification on successful login
- [ ] Error notification on failed login
- [ ] Session cookies are httpOnly and secure
- [ ] useAuth hook provides login/logout functions
- [ ] Logout functionality works and clears session

## ERROR HANDLING FOR THIS PHASE

- Invalid credentials: Show "Invalid username or password" notification
- Network errors: Show "Unable to connect, please try again" notification
- Session expired: Redirect to login with "Session expired" message
- Missing environment variables: Throw error on app startup

## ACCEPTANCE CRITERIA

1. Running `bun seed:admin` creates the admin user
2. Visiting `/dashboard` without authentication redirects to `/login`
3. Login with correct credentials (root / OrbitJobs@1#) succeeds
4. Login with incorrect credentials shows error notification
5. After successful login, user is redirected to `/dashboard`
6. Session persists across page refreshes
7. Logout button clears session and redirects to `/login`
8. Middleware blocks all `/dashboard` routes for unauthenticated users
9. Session cookies are httpOnly and secure in production
10. No plain text passwords anywhere in the codebase

================================================================================
PHASE 3: DATABASE SCHEMA & ACTIVITY LOGGING SYSTEM
================================================================================

## OBJECTIVE

Create all database tables in Supabase with proper indexes, constraints, and Row Level Security policies. Implement a comprehensive activity logging system that tracks every significant action in the application for audit and analytics.

## TECHNICAL REQUIREMENTS

1. Create all database tables in Supabase (use the schemas defined earlier)
2. Set up proper indexes for query performance
3. Configure Row Level Security (RLS) policies for data protection
4. Create database types in types/database.ts using Supabase CLI type generation
5. Build activity logging service in lib/activity-logger.ts
6. Create useActivities hook for components to consume activity logs
7. Build Activity Feed component for dashboard display
8. Build Activity Detail Modal with mantine modal (centered, max width of 500px) for viewing full activity metadata

## DATABASE TABLES TO CREATE

Execute these SQL statements in Supabase SQL Editor:

1. users table (if not created in Phase 2)
2. jobs table
3. activities table
4. settings table
5. job_fetch_config table

(Use the exact schema defined in the "DATABASE SCHEMA DESIGN" section above)

## INDEXES TO CREATE

```sql
-- Job indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_job_id ON jobs(job_id);
CREATE INDEX idx_jobs_posted_to_x ON jobs(posted_to_x);

-- Activity indexes
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Settings indexes
CREATE INDEX idx_settings_user_key ON settings(user_id, setting_key);

-- Job fetch config indexes
CREATE INDEX idx_job_fetch_config_user_id ON job_fetch_config(user_id);
CREATE INDEX idx_job_fetch_config_default ON job_fetch_config(is_default) WHERE is_default = TRUE;
```

## ROW LEVEL SECURITY POLICIES

```sql
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_fetch_config ENABLE ROW LEVEL SECURITY;

-- Since this is single-user app, allow authenticated user to access all rows
CREATE POLICY "Allow authenticated user full access to jobs" ON jobs
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated user full access to activities" ON activities
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated user full access to settings" ON settings
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated user full access to job_fetch_config" ON job_fetch_config
  FOR ALL TO authenticated USING (true);
```

## ACTIVITY LOGGER SERVICE

Create lib/activity-logger.ts:

```typescript
import { supabase } from "./supabase";
import type { ActivityType, ActivityMetadata } from "@/types/activity";

interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  title: string;
  description: string;
  metadata?: ActivityMetadata;
}

export async function logActivity({
  userId,
  activityType,
  title,
  description,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      activity_type: activityType,
      title,
      description,
      metadata,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - activity logging should never break app functionality
  }
}

// Convenience functions for common activity types
export const activityLogger = {
  logLogin: async (userId: string) => {
    await logActivity({
      userId,
      activityType: "login",
      title: "User Login",
      description: "User logged into OrbitJobs dashboard",
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      },
    });
  },

  logJobFetch: async (
    userId: string,
    metadata: {
      query: string;
      filters: Record<string, any>;
      totalFetched: number;
      newJobs: number;
      duplicates: number;
      apiResponseTime: number;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "job_fetch",
      title: "Job Fetch Completed",
      description: `Fetched ${metadata.totalFetched} jobs (${metadata.newJobs} new, ${metadata.duplicates} duplicates)`,
      metadata,
    });
  },

  logJobApproved: async (userId: string, jobId: string, jobTitle: string) => {
    await logActivity({
      userId,
      activityType: "job_approved",
      title: "Job Approved",
      description: `Approved: ${jobTitle}`,
      metadata: { job_id: jobId },
    });
  },

  logJobPosted: async (
    userId: string,
    jobId: string,
    jobTitle: string,
    tweetId: string,
  ) => {
    await logActivity({
      userId,
      activityType: "job_posted",
      title: "Job Posted to X",
      description: `Posted: ${jobTitle}`,
      metadata: {
        job_id: jobId,
        tweet_id: tweetId,
      },
    });
  },

  logContentGenerated: async (
    userId: string,
    jobId: string,
    metadata: {
      modelUsed: string;
      tokensUsed: number;
      generationTime: number;
    },
  ) => {
    await logActivity({
      userId,
      activityType: "content_generated",
      title: "AI Content Generated",
      description: `Generated content using ${metadata.modelUsed}`,
      metadata: {
        job_id: jobId,
        ...metadata,
      },
    });
  },

  logApiError: async (
    userId: string,
    errorType: string,
    errorMessage: string,
    metadata?: Record<string, any>,
  ) => {
    await logActivity({
      userId,
      activityType: "api_error",
      title: `API Error: ${errorType}`,
      description: errorMessage,
      metadata,
    });
  },
};
```

## TYPES TO CREATE

types/activity.ts:

```typescript
export type ActivityType =
  | "login"
  | "logout"
  | "job_fetch"
  | "job_approved"
  | "job_rejected"
  | "job_posted"
  | "content_generated"
  | "settings_updated"
  | "api_error";

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  description: string;
  metadata: ActivityMetadata;
  created_at: string;
}

export interface ActivityMetadata {
  [key: string]: any;
  // Specific metadata structures based on activity type
  query?: string;
  filters?: Record<string, any>;
  totalFetched?: number;
  newJobs?: number;
  duplicates?: number;
  apiResponseTime?: number;
  job_id?: string;
  tweet_id?: string;
  modelUsed?: string;
  tokensUsed?: number;
  generationTime?: number;
}
```

## COMPONENT STRUCTURE

```markdown
/components/ActivityFeed
index.tsx (main activity feed component)
types.ts (ActivityFeed prop types)
constants.ts (activity type colors, icons)
/ActivityCard
index.tsx (individual activity card)
/ActivityDetailModal
index.tsx (modal for viewing full activity details)

/hooks
use-activities.ts (hook for fetching and managing activities)
```

## USEACTIVITIES HOOK

hooks/use-activities.ts:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Activity } from "@/types/activity";

export function useActivities(limit = 50) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch activities",
      );
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  }

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}
```

## ACTIVITY FEED COMPONENT REQUIREMENTS

The ActivityFeed component must:

1. Display activities in reverse chronological order (newest first)
2. Show activity icon based on activity type
3. Display formatted timestamp (e.g., "2 hours ago", "Yesterday at 3:42 PM")
4. Show truncated description with "View Details" option
5. Use different colors for different activity types
6. Be mobile-responsive (stack vertically on small screens)
7. Support infinite scroll or pagination for large activity lists
8. Show loading skeleton while fetching
9. Show empty state when no activities exist

## ACTIVITY DETAIL MODAL REQUIREMENTS

When a user clicks on an activity card, open a modal that displays:

1. Full activity title and description
2. Formatted timestamp (create a function for this in `formatters.ts`)
3. Activity type badge with appropriate color
4. Complete metadata in a readable format (JSON viewer or key-value pairs)
5. Copy icon button to copy metadata to clipboard
6. Close icon button or click outside to dismiss

## IMPLEMENTATION CHECKLIST

- [ ] All database tables created in Supabase
- [ ] All indexes created for performance
- [ ] Row Level Security policies configured
- [ ] Database types generated using Supabase CLI
- [ ] Activity logger service created in lib/activity-logger.ts
- [ ] All activity type convenience functions implemented
- [ ] useActivities hook created and tested
- [ ] ActivityFeed component built and styled
- [ ] ActivityCard sub-component created
- [ ] ActivityDetailModal component built
- [ ] Activity icons mapped to activity types
- [ ] Activity colors mapped to activity types
- [ ] Timestamp formatting working correctly
- [ ] Empty state displays when no activities
- [ ] Loading state shows skeleton/spinner
- [ ] Modal opens/closes correctly
- [ ] Metadata displays in readable format
- [ ] Copy to clipboard functionality works

## ERROR HANDLING FOR THIS PHASE

- Database query errors: Log to console, show error notification
- Activity logging failures: Never throw errors, only log to console
- Empty activity feed: Show friendly empty state message
- Failed to load activities: Show error alert with retry button

## ACCEPTANCE CRITERIA

1. All database tables exist in Supabase with correct schema
2. All indexes are created and queryable
3. RLS policies allow authenticated user full access
4. Activity logger successfully logs activities to database
5. Logging an activity never causes the app to crash
6. useActivities hook fetches activities in correct order
7. ActivityFeed renders activities with correct styling
8. Clicking an activity card opens the detail modal
9. Activity metadata displays correctly in modal
10. Timestamps are formatted in human-readable format
11. Different activity types show different icons/colors
12. Activity feed is mobile-responsive
13. Empty state shows when no activities exist

================================================================================
PHASE 4: JOB FETCHING SYSTEM WITH MODAL FILTERS & JOBS MANAGEMENT
================================================================================

## OBJECTIVE

Build the job fetching system that uses JSearch API to pull high-quality tech jobs. Implement a modal-based filter system that opens before each fetch, saves filter preferences, and tracks detailed run statistics. Create both a dashboard preview section showing recent jobs (max 10) and a dedicated full jobs page with paginated table and grid views and comprehensive filtering. All job fetching is manual (on-click), not automated.

## TECHNICAL REQUIREMENTS

1. Set up JSearch API client in lib/jsearch.ts
2. Create job fetch filter modal component
3. Build job fetch service with deduplication logic
4. Store fetch configurations in database for persistence
5. Track last run timestamp and statistics
6. Implement comprehensive activity logging for each fetch
7. Create dashboard UI section with job statistics and recent jobs preview (max 10)
8. Create dedicated jobs page (/jobs) with table and grid views
9. Implement comprehensive filtering system on jobs page
10. Persist view preference (table vs grid) in localStorage

## JSEARCH API SETUP (IGNORE THIS, IT REQUIRES HUMAN INTERVENTION)

Sign up for JSearch API on RapidAPI: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
Pricing Tiers:

- Basic (Free): 50 requests/month
- Pro ($15/month): 500 requests/month (RECOMMENDED)
  Add to .env.local:
  RAPIDAPI_KEY=your_rapidapi_key_here
  RAPIDAPI_HOST=jsearch.p.rapidapi.com

## JSEARCH CLIENT

Create lib/jsearch.ts:

```typescript
import axios from "axios";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";
const BASE_URL = "https://jsearch.p.rapidapi.com";

export interface JSearchFilters {
  query: string; // e.g., "remote react developer"
  location?: string; // Optional location filter
  remoteJobsOnly?: boolean;
  employmentTypes?: ("FULLTIME" | "CONTRACTOR" | "PARTTIME" | "INTERN")[];
  jobRequirements?: (
    | "under_3_years_experience"
    | "more_than_3_years_experience"
    | "no_experience"
    | "no_degree"
  )[];
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  numPages?: number; // Number of pages to fetch (10 results per page)
}

export interface JSearchJob {
  job_id: string;
  employer_name: string;
  employer_logo?: string;
  job_title: string;
  job_description: string;
  job_apply_link: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_required_skills?: string[];
  job_posted_at_datetime_utc?: string;
}

export interface JSearchResponse {
  status: string;
  request_id: string;
  data: JSearchJob[];
}

export async function searchJobs(
  filters: JSearchFilters,
): Promise<JSearchJob[]> {
  try {
    const params: Record<string, any> = {
      query: filters.query,
      num_pages: filters.numPages || 1,
    };

    if (filters.location) params.location = filters.location;
    if (filters.remoteJobsOnly) params.remote_jobs_only = "true";
    if (filters.employmentTypes?.length) {
      params.employment_types = filters.employmentTypes.join(",");
    }
    if (filters.jobRequirements?.length) {
      params.job_requirements = filters.jobRequirements.join(",");
    }
    if (filters.datePosted && filters.datePosted !== "all") {
      params.date_posted = filters.datePosted;
    }

    const response = await axios.get<JSearchResponse>(`${BASE_URL}/search`, {
      params,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("JSearch API error:", error);
    throw new Error("Failed to fetch jobs from JSearch API");
  }
}
```

## JOB FETCH FILTER MODAL

This modal opens when the user clicks "Fetch Jobs" button from either the dashboard or the jobs page.

Component: components/JobFetchModal

Requirements:

1. Modal opens when "Fetch Jobs" button is clicked
2. Display all filter inputs:
   - Search Query (TextInput, required, e.g., "remote react developer")
   - Location (TextInput, optional, placeholder: "Leave empty for worldwide")
   - Work Type (Select: Remote Only, Hybrid, Onsite, default: Remote Only)
   - Employment Types (MultiSelect: Full-time, Contract, Part-time, Intern)
   - Date Posted (Select: All, Today, Last hour, Last 6 hours, Last 24 hours, Last 3 days, Last 7 days, Last 30 days, default: Last 24 hours)
   - Number of Jobs (NumberInput, min: 5, max: 100, default: 20)
3. Load previously saved filter configuration from database on modal open
4. Show "Use Default Filters" button to reset to sensible defaults
5. Save filter configuration to database when "Fetch Jobs" button is clicked
6. Display estimated API cost (1 request per 10 jobs)
7. Show last run statistics below filters:
   - Last Run: "Thursday, February 12th, 2026 at 2:42 PM" or "2 hours ago" or "3 mins ago" or "32 secs ago" or "Yesterday at 2:42 PM" or "Today at 2:42 PM"
   - Results: "25 total • 18 new • 7 duplicates"
8. Disable "Fetch Jobs" button while fetching (show loading state)
9. Close modal and navigate to /jobs page after successful fetch
10. Show error notification if fetch fails

## FILTER CONFIGURATION PERSISTENCE

Use the job_fetch_config table to store filter preferences.

When modal opens:

1. Query database for user's default configuration
2. If exists, populate form with saved values
3. If not exists, use hardcoded defaults

When "Fetch Jobs" clicked:

1. Validate all inputs
2. Save configuration to database (upsert)
3. Mark as default configuration (is_default = true)
4. Execute job fetch with these filters

## JOB DEDUPLICATION LOGIC

Create lib/job-service.ts:

```typescript
import { supabase } from "./supabase";
import { searchJobs, JSearchFilters, JSearchJob } from "./jsearch";
import { activityLogger } from "./activity-logger";
import type { Job } from "@/types/job";

export interface JobFetchResult {
  totalFetched: number;
  newJobs: number;
  duplicates: number;
  jobs: Job[];
}

export async function fetchAndStoreJobs(
  userId: string,
  filters: JSearchFilters,
): Promise<JobFetchResult> {
  const startTime = Date.now();

  try {
    // Fetch from JSearch API
    const apiJobs = await searchJobs(filters);
    const totalFetched = apiJobs.length;

    // Check for existing job_ids in database
    const jobIds = apiJobs.map((job) => job.job_id);
    const { data: existingJobs } = await supabase
      .from("jobs")
      .select("job_id")
      .in("job_id", jobIds);

    const existingJobIds = new Set(
      existingJobs?.map((job) => job.job_id) || [],
    );

    // Filter out duplicates
    const newApiJobs = apiJobs.filter((job) => !existingJobIds.has(job.job_id));

    // Transform and insert new jobs
    const jobsToInsert = newApiJobs.map(transformJSearchJobToDbJob);

    let insertedJobs: Job[] = [];
    if (jobsToInsert.length > 0) {
      const { data, error } = await supabase
        .from("jobs")
        .insert(jobsToInsert)
        .select("*");

      if (error) throw error;
      insertedJobs = data || [];
    }

    const apiResponseTime = Date.now() - startTime;

    // Log activity
    await activityLogger.logJobFetch(userId, {
      query: filters.query,
      filters: filters,
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
      apiResponseTime,
    });

    // Update last run stats in job_fetch_config
    await updateLastRunStats(userId, {
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
    });

    return {
      totalFetched,
      newJobs: newApiJobs.length,
      duplicates: totalFetched - newApiJobs.length,
      jobs: insertedJobs,
    };
  } catch (error) {
    // Log error activity
    await activityLogger.logApiError(
      userId,
      "job_fetch_failed",
      error instanceof Error ? error.message : "Unknown error",
      { filters },
    );
    throw error;
  }
}

function transformJSearchJobToDbJob(apiJob: JSearchJob): Partial<Job> {
  return {
    job_id: apiJob.job_id,
    title: apiJob.job_title,
    company: apiJob.employer_name,
    location:
      [apiJob.job_city, apiJob.job_state, apiJob.job_country]
        .filter(Boolean)
        .join(", ") || null,
    salary_min: apiJob.job_min_salary || null,
    salary_max: apiJob.job_max_salary || null,
    salary_currency: apiJob.job_salary_currency || "USD",
    employment_type: apiJob.job_employment_type,
    remote_allowed: apiJob.job_is_remote,
    description: apiJob.job_description,
    required_skills: apiJob.job_required_skills || [],
    apply_url: apiJob.job_apply_link,
    source: "jsearch",
    raw_data: apiJob as any,
    status: "pending",
  };
}

async function updateLastRunStats(
  userId: string,
  stats: {
    totalFetched: number;
    newJobs: number;
    duplicates: number;
  },
): Promise<void> {
  try {
    const { error } = await supabase
      .from("job_fetch_config")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_results_count: stats.totalFetched,
        last_run_new_jobs: stats.newJobs,
        last_run_duplicates: stats.duplicates,
      })
      .eq("user_id", userId)
      .eq("is_default", true);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to update last run stats:", error);
  }
}
```

## DASHBOARD JOBS PREVIEW SECTION

In the main dashboard (app/(dashboard)/dashboard/page.tsx), create a jobs preview section. This section provides a quick overview and limited preview of recent jobs. The full jobs management happens on the dedicated `/jobs` page.

Dashboard Jobs Section Requirements:

1. Section Header:
   - Title: "Recent Jobs"
   - "Fetch Jobs" button (primary Indigo color, opens JobFetchModal)
   - "View All Jobs" link/button (navigates to /jobs page)

2. Statistics Cards Row:
   Display four metric cards in a horizontal row:
   - Total Jobs in Database (with icon)
   - Jobs Pending Review (with count and percentage)
   - Jobs Approved (with count and percentage)
   - Jobs Posted to X (with count and percentage)

3. Last Run Information Card:
   - Last Run timestamp: "Thursday, February 12th, 2026 at 2:42 PM" or relative time
   - Last run results: "25 total • 18 new • 7 duplicates"
   - Small line chart showing jobs fetched over last 7 days (using Chart.js)

4. Recent Jobs Preview (Max 10 Jobs):
   - Display up to 10 most recent jobs in compact card layout
   - Cards arranged in a responsive grid (2 columns on desktop, 1 on mobile)
   - Each job card shows:
     - Job title (truncated to 2 lines with ellipsis)
     - Company name
     - Salary range (if available, formatted as "$120K-$150K")
     - Location (truncated if too long)
     - Remote badge (if remote_allowed is true)
     - Status badge (color-coded: pending=yellow, approved=green, rejected=red, posted=blue)
     - "View Details" button (opens JobDetailModal)
   - Cards have hover effect (slight elevation increase)
   - Click anywhere on card opens JobDetailModal

5. Empty State:
   When no jobs exist in database:
   - Show illustration or icon
   - Message: "No jobs yet"
   - Subtext: "Click 'Fetch Jobs' to get started and discover high-quality tech opportunities."
   - Prominent "Fetch Jobs" button

6. Loading State:
   - Show skeleton cards while jobs are being fetched from database
   - Maintain layout structure during loading

## DEDICATED JOBS PAGE

Create app/(dashboard)/jobs/page.tsx

This is the main jobs management interface with comprehensive filtering, sorting, and two view modes (table and grid).

Jobs Page Structure:

1. Page Header:
   - Page title: "Jobs"
   - Total count display: "Showing X of Y jobs"
   - View mode toggle: Two-button segmented control for Table View | Grid View
   - "Fetch Jobs" button (opens JobFetchModal)

2. Filters Panel (Collapsible on mobile, always visible on desktop):
   Filter Inputs:
   - Search: TextInput with search icon, placeholder "Search by job title or company..."
     - Implements debounced search (300ms delay)
     - Clears with X button when text is present
   - Status: MultiSelect with checkbox options
     - Options: All, Pending, Approved, Rejected, Posted
     - Shows count badge for each status
     - "All" option selects/deselects all statuses
   - Work Type: Select dropdown
     - Options: All, Remote Only, On-site, Hybrid
   - Employment Type: MultiSelect with checkbox options
     - Options: Full-time, Contract, Part-time, Intern
   - Salary Range: Two NumberInputs side by side
     - Min Salary (placeholder: "Min salary")
     - Max Salary (placeholder: "Max salary")
     - Currency indicator (USD) displayed
   - Date Added: Select dropdown
     - Options: All Time, Today, Last 7 Days, Last 30 Days, This Month, Last 90 Days, Custom (Date range input from Mantine)
   - Sort By: Select dropdown
     - Options:
       - Date Added (Newest First) - default
       - Date Added (Oldest First)
       - Salary (High to Low)
       - Salary (Low to High)
       - Company (A-Z)
       - Company (Z-A)
       - Title (A-Z)
       - Title (Z-A)

   Filter Actions:
   - "Reset Filters" button: Clears all filters and returns to defaults
   - Active filter count badge: Shows "(X filters active)" when filters are applied

3. Bulk Selection Bar (appears when jobs are selected):
   - Appears as floating bar at top of job list
   - Checkbox to "Select All" visible jobs on current page
   - Selected count: "X jobs selected"
   - Bulk action buttons:
     - "Approve Selected" (green button)
     - "Reject Selected" (red button)
     - "Clear Selection" (ghost button)
   - Confirmation modal for bulk actions

4. TABLE VIEW:

   Table Structure:
   - Responsive table with horizontal scroll on mobile
   - Sticky header row
   - Sortable columns (click header to sort)

   Columns:
   - Checkbox column (width: 40px, sticky left on scroll)
   - Title column (width: 250px, truncate with ellipsis)
   - Company column (width: 180px)
   - Location column (width: 150px, truncate with ellipsis)
   - Salary column (width: 140px, format as "$120K-$150K" or "Not specified")
   - Remote column (width: 80px, shows badge or "-")
   - Status column (width: 100px, color-coded badge)
   - Actions column (width: 120px, sticky right on scroll)

   Row Behavior:
   - Hover effect: Background color change
   - Click row: Opens JobDetailModal
   - Checkbox click: Stops propagation, only selects job
   - Actions button click: Stops propagation, shows action menu

   Actions Dropdown (per row):
   - "View Details" (opens JobDetailModal)
   - "Approve" (if status is pending)
   - "Reject" (if status is pending)
   - "Generate Content" (if approved and no content generated)
   - Divider
   - "Delete Job" (with confirmation modal)

5. GRID VIEW:

   Grid Layout:
   - Responsive grid: 3 columns desktop, 2 columns tablet, 1 column mobile
   - Gap between cards: 16px
   - Cards have consistent height within each row

   Job Card Structure:
   - Checkbox in top-right corner
   - Company logo or initial circle at top
   - Job title (2 lines max, ellipsis)
   - Company name (1 line, ellipsis)
   - Location and remote badge row
   - Salary (if available) in highlighted box
   - Status badge
   - Skills tags (show first 3, "+X more" if more exist)
   - Bottom action row:
     - "View Details" button (primary)
     - Approve/Reject buttons (if pending)
     - Three-dot menu for more actions

   Card Behavior:
   - Hover effect: Slight elevation increase, border color change
   - Click card: Opens JobDetailModal
   - Checkbox click: Stops propagation, only selects job
   - Button clicks: Stop propagation, perform specific action

6. Pagination:

   Located at bottom of both table and grid views:
   - Results summary: "Showing 1-25 of 157 jobs"
   - Previous button (disabled on first page)
   - Page numbers: Show current page and 2 pages before/after
   - Ellipsis (...) for gaps in page numbers
   - Next button (disabled on last page)
   - "Jump to page" input (shows on click of page numbers area)
   - Items per page selector: 10, 25, 50, 100 options

   Pagination behavior:
   - URL updates with page number (?page=2)
   - Scroll to top on page change
   - Preserve filters when changing pages
   - Maintain selection across page changes (track by job ID)

7. Loading States:
   - Skeleton loader (for both table and grid views) for initial page load
   - Skeleton loader (for both table and grid views) for filter changes
   - Individual row/card loading states for actions
   - Progress bar at top of page for fetch operations

8. Empty States:
   - No jobs in database: "No jobs found. Click 'Fetch Jobs' to get started."
   - No jobs match filters: "No jobs match your filters. Try adjusting your search criteria."
   - Shows currently active filters with option to clear each individually
     ``
     CUSTOM HOOKS FOR JOBS PAGE

---

1. Create hooks/use-view-preference.ts:

```typescript
import { useState, useEffect } from "react";

type ViewMode = "table" | "grid";

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    // Load preference from localStorage on mount
    const saved = localStorage.getItem("orbitjobs-view-mode");
    if (saved === "table" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("orbitjobs-view-mode", mode);
  };

  return {
    viewMode,
    setViewMode: updateViewMode,
  };
}
```

2. Create hooks/use-jobs.ts:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/job";

export interface JobFilters {
  search?: string;
  status?: string[];
  remote?: "all" | "remote" | "onsite" | "hybrid";
  salaryMin?: number;
  salaryMax?: number;
  dateAdded?: "all" | "today" | "7days" | "30days" | "90days";
  employmentTypes?: string[];
  sortBy?: string;
}

export function useJobs(
  filters: JobFilters,
  page: number = 1,
  pageSize: number = 25,
) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [filters, page, pageSize]);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);

      // Build query with filters
      let query = supabase.from("jobs").select("*", { count: "exact" });

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(
          `title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`,
        );
      }

      // Apply status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes("all")) {
          query = query.in("status", filters.status);
        }
      }

      // Apply remote filter
      if (filters.remote && filters.remote !== "all") {
        if (filters.remote === "remote") {
          query = query.eq("remote_allowed", true);
        } else if (filters.remote === "onsite") {
          query = query.eq("remote_allowed", false);
        }
        // Note: 'hybrid' would need additional field in database
      }

      // Apply salary filters
      if (filters.salaryMin !== undefined && filters.salaryMin > 0) {
        query = query.gte("salary_min", filters.salaryMin);
      }
      if (filters.salaryMax !== undefined && filters.salaryMax > 0) {
        query = query.lte("salary_max", filters.salaryMax);
      }

      // Apply date filter
      if (filters.dateAdded && filters.dateAdded !== "all") {
        const now = new Date();
        let dateThreshold: Date;

        switch (filters.dateAdded) {
          case "today":
            dateThreshold = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "7days":
            dateThreshold = new Date(now.setDate(now.getDate() - 7));
            break;
          case "30days":
            dateThreshold = new Date(now.setDate(now.getDate() - 30));
            break;
          case "90days":
            dateThreshold = new Date(now.setDate(now.getDate() - 90));
            break;
          default:
            dateThreshold = new Date(0); // Beginning of time
        }

        query = query.gte("created_at", dateThreshold.toISOString());
      }

      // Apply employment type filter
      if (filters.employmentTypes && filters.employmentTypes.length > 0) {
        query = query.in("employment_type", filters.employmentTypes);
      }

      // Apply sorting
      const [sortField, sortDirection] = parseSortBy(
        filters.sortBy || "date_desc",
      );
      query = query.order(sortField, { ascending: sortDirection === "asc" });

      // Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      // Execute query
      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMessage);
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  function parseSortBy(sortBy: string): [string, "asc" | "desc"] {
    const sortMap: Record<string, [string, "asc" | "desc"]> = {
      date_desc: ["created_at", "desc"],
      date_asc: ["created_at", "asc"],
      salary_desc: ["salary_max", "desc"],
      salary_asc: ["salary_min", "asc"],
      company_asc: ["company", "asc"],
      company_desc: ["company", "desc"],
      title_asc: ["title", "asc"],
      title_desc: ["title", "desc"],
    };

    return sortMap[sortBy] || ["created_at", "desc"];
  }

  return {
    jobs,
    totalCount,
    loading,
    error,
    refetch: fetchJobs,
  };
}
```

3. Create hooks/use-job-selection.ts:

```typescript
import { useState, useCallback } from "react";

export function useJobSelection() {
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((jobIds: string[]) => {
    setSelectedJobIds(new Set(jobIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedJobIds(new Set());
  }, []);

  const isSelected = useCallback(
    (jobId: string) => selectedJobIds.has(jobId),
    [selectedJobIds],
  );

  return {
    selectedJobIds: Array.from(selectedJobIds),
    selectedCount: selectedJobIds.size,
    toggleJobSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
```

## COMPONENT STRUCTURE

```markdown
/components/JobFetchModal
index.tsx (main modal component)
types.ts (filter types)
constants.ts (default filters, employment type options)
hooks/use-job-fetch-config.ts (hook to load/save config)
hooks/use-job-fetch.ts (hook to execute job fetch)

/components/JobFetchStats
index.tsx (statistics display card)
hooks/use-job-stats.ts (hook to fetch job stats)

/components/DashboardJobsSection
index.tsx (dashboard preview section)
/RecentJobCard
index.tsx (compact job card for dashboard)
/StatsCards
index.tsx (metrics cards row)

/components/JobsTable
index.tsx (table view component)
/JobTableRow
index.tsx (table row component)
hooks/use-table-sorting.ts

/components/JobsGrid
index.tsx (grid view component)
/JobGridCard
index.tsx (grid card component)

/components/JobFilters
index.tsx (filters panel component)
hooks/use-job-filters.ts

/components/BulkActionsBar
index.tsx (bulk selection bar)

/components/JobDetailModal
index.tsx (job details modal, used in Phase 5)

/hooks
use-view-preference.ts (table/grid preference)
use-jobs.ts (jobs data fetching)
use-job-selection.ts (bulk selection logic)

/lib
jsearch.ts (JSearch API client)
job-service.ts (job fetching and deduplication)
```

## IMPLEMENTATION CHECKLIST

- [ ] JSearch API account created on RapidAPI
- [ ] API key added to .env.local
- [ ] JSearch client created in lib/jsearch.ts
- [ ] JSearch client successfully fetches jobs
- [ ] JobFetchModal component created with all filter inputs
- [ ] Filter configuration loads from database
- [ ] Filter configuration saves on fetch
- [ ] Job deduplication logic works correctly
- [ ] Activity logging for each fetch run
- [ ] Last run stats update in database
- [ ] Dashboard jobs preview section created
- [ ] Dashboard shows max 10 recent jobs
- [ ] Dashboard statistics cards display correct counts
- [ ] "View All Jobs" navigation works
- [ ] Dedicated `/jobs` page created
- [ ] Table view displays all columns correctly
- [ ] Grid view displays job cards correctly
- [ ] View toggle persists preference
- [ ] All filters work correctly
- [ ] Search implements debouncing
- [ ] Sorting works for all sort options
- [ ] Pagination works correctly
- [ ] Bulk selection works across pages
- [ ] Bulk actions (approve/reject) work
- [ ] Loading states show during operations
- [ ] Empty states display appropriately
- [ ] Error handling shows user-friendly messages
- [ ] Mobile responsiveness works on all screen sizes
- [ ] Modal closes and navigates to /jobs after fetch

## ERROR HANDLING FOR THIS PHASE

- API key missing: Show error and prevent fetch
- API rate limit exceeded: Show specific error with retry time
- Network errors: Show "Unable to connect" with retry button
- Invalid filters: Show validation errors on form
- Database insert errors: Show error notification and log to activities
- Empty results: Show "No jobs found matching filters" notification
- Pagination errors: Fallback to page 1, show error notification
- Selection errors: Clear selection, show error notification

## ACCEPTANCE CRITERIA

1. Clicking "Fetch Jobs" from dashboard opens JobFetchModal
2. Clicking "Fetch Jobs" from /jobs page opens JobFetchModal
3. Modal displays all filter inputs with correct types
4. Previously saved filters populate modal on open
5. Entering filters and clicking "Fetch Jobs" executes API call
6. Loading state shows during fetch operation
7. Jobs successfully fetched from JSearch API
8. Duplicate jobs identified and skipped
9. New jobs inserted with status "pending"
10. Activity log records fetch with metadata
11. Last run timestamp updates correctly
12. Modal closes and navigates to /jobs after successful fetch
13. Dashboard shows max 10 recent jobs
14. Dashboard statistics cards show accurate counts
15. "View All Jobs" navigates to /jobs page
16. /jobs page displays jobs in table view by default
17. Table view shows all columns with correct data
18. Grid view shows job cards with correct layout
19. View toggle switches between table and grid
20. View preference persists after page reload
21. All filters apply correctly to job list
22. Search filters jobs in real-time with debouncing
23. Sorting changes order correctly
24. Pagination shows correct page and total count
25. Clicking job row/card opens JobDetailModal (Phase 5)
26. Bulk selection works across multiple pages
27. Bulk approve/reject updates job statuses
28. Loading states appear during async operations
29. Empty states show when no jobs match criteria
30. Error notifications show helpful messages
31. Mobile layout is fully functional and readable
32. All interactions work smoothly on touch devices

================================================================================
PHASE 5: AI CONTENT GENERATION WITH VERCEL AI SDK
================================================================================

## OBJECTIVE

Implement AI-powered content generation using Vercel AI SDK to transform raw job postings into viral-ready X threads. Content generation is manual (on-click) from the job detail modal, not automatic. Support multiple AI providers (OpenAI, Anthropic, Google) with configurable model selection.

## TECHNICAL REQUIREMENTS

1. Set up Vercel AI SDK with multiple providers
2. Create AI service layer for content generation
3. Build job detail modal with "Generate Content" button
4. Implement two-part thread generation strategy
5. Store generated content with job record
6. Log generation activities with token usage
7. Add model selection in settings
8. Create content preview and editing UI

## VERCEL AI SDK SETUP

Install Vercel AI SDK and provider packages:

```bash
bun add ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

Add provider API keys to .env.local:

```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
```

## AI CLIENT CONFIGURATION

Create lib/ai.ts:

```typescript
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export type AIProvider = "openai" | "anthropic" | "google";
export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | "gemini-2.0-flash-exp"
  | "gemini-1.5-pro";

export interface AIModelConfig {
  provider: AIProvider;
  model: AIModel;
  displayName: string;
}

export const AI_MODELS: AIModelConfig[] = [
  { provider: "openai", model: "gpt-4o", displayName: "GPT-4o" },
  { provider: "openai", model: "gpt-4o-mini", displayName: "GPT-4o Mini" },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
  },
  {
    provider: "google",
    model: "gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash",
  },
  {
    provider: "google",
    model: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
  },
];

export function getAIModel(provider: AIProvider, model: AIModel) {
  switch (provider) {
    case "openai":
      return openai(model);
    case "anthropic":
      return anthropic(model);
    case "google":
      return google(model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
```

## CONTENT GENERATION SERVICE

Create lib/content-generator.ts:

```typescript
import { generateText } from "ai";
import { getAIModel, AIProvider, AIModel } from "./ai";
import type { Job } from "@/types/job";

export interface ThreadContent {
  primaryTweet: string; // Hook tweet WITHOUT link
  replyTweet: string; // Reply tweet WITH link
}

export interface ContentGenerationResult {
  content: ThreadContent;
  modelUsed: string;
  tokensUsed: number;
  generationTime: number;
}

const THREAD_GENERATION_PROMPT = `You are a viral content expert for @TheOrbitJobs on X (Twitter). Your job is to transform tech job postings into engaging, high-performing thread hooks.

CRITICAL RULES:
1. The primary tweet must be a HOOK - attention-grabbing, no link
2. The reply tweet contains the application link
3. Primary tweet must be under 280 characters
4. Reply tweet must be under 280 characters
5. Focus on: Salary (if available), Tech Stack, Company prestige, Remote status
6. Use power words: "Hiring", "Remote", "Stack", salary with currency symbol
7. Make it scannable - use emojis sparingly, line breaks strategically
8. Sound human and natural, not corporate - conversational but professional

THREAD STRUCTURE:
Primary Tweet (Hook):
- Lead with highest value point (salary, company name, or role level)
- Mention 2-3 key technologies
- Include remote status if applicable
- Create curiosity - make them want to click
- NO LINK in this tweet

Reply Tweet:
- Include the job application link
- Add "Apply here: [link]"
- Optionally add 1-2 additional selling points
- Can include relevant hashtags (#RemoteJobs #ReactJobs)

EXAMPLE:
Primary: "🚀 $180K-$220K Senior React Engineer at Stripe

Stack: React, TypeScript, Node.js, PostgreSQL
Fully remote, US-based

They're building the future of online payments..."

Reply: "Apply here: [job_link]

#RemoteJobs #ReactJobs #TechJobs"

Now generate a thread for this job:`;

export async function generateJobThread(
  job: Job,
  provider: AIProvider,
  model: AIModel,
): Promise<ContentGenerationResult> {
  const startTime = Date.now();

  try {
    const aiModel = getAIModel(provider, model);

    const jobContext = formatJobForPrompt(job);

    const { text, usage } = await generateText({
      model: aiModel,
      prompt: `${THREAD_GENERATION_PROMPT}\n\n${jobContext}`,
      temperature: 0.8,
      maxTokens: 500,
    });

    const content = parseThreadResponse(text);
    const generationTime = Date.now() - startTime;

    return {
      content,
      modelUsed: `${provider}/${model}`,
      tokensUsed: usage.totalTokens,
      generationTime,
    };
  } catch (error) {
    console.error("Content generation failed:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}

function formatJobForPrompt(job: Job): string {
  let context = `Job Title: ${job.title}\n`;
  context += `Company: ${job.company}\n`;

  if (job.salary_min && job.salary_max) {
    context += `Salary: $${job.salary_min.toLocaleString()}-$${job.salary_max.toLocaleString()} ${job.salary_currency}\n`;
  } else if (job.salary_min) {
    context += `Salary: $${job.salary_min.toLocaleString()}+ ${job.salary_currency}\n`;
  }

  context += `Remote: ${job.remote_allowed ? "Yes" : "No"}\n`;
  context += `Location: ${job.location || "Not specified"}\n`;

  if (job.required_skills && job.required_skills.length > 0) {
    context += `Skills: ${job.required_skills.join(", ")}\n`;
  }

  context += `\nDescription:\n${job.description.substring(0, 500)}...\n`;
  context += `\nApplication Link: ${job.apply_url}`;

  return context;
}

function parseThreadResponse(text: string): ThreadContent {
  // Parse the AI response to extract primary and reply tweets
  // This is a simple parser - adjust based on actual AI output format

  const lines = text.split("\n").filter((line) => line.trim());

  let primaryTweet = "";
  let replyTweet = "";
  let mode: "primary" | "reply" | null = null;

  for (const line of lines) {
    if (
      line.toLowerCase().includes("primary") ||
      line.toLowerCase().includes("hook")
    ) {
      mode = "primary";
      continue;
    }
    if (line.toLowerCase().includes("reply")) {
      mode = "reply";
      continue;
    }

    if (
      mode === "primary" &&
      !line.startsWith("#") &&
      !line.toLowerCase().includes("apply")
    ) {
      primaryTweet += line + "\n";
    } else if (mode === "reply") {
      replyTweet += line + "\n";
    }
  }

  // Fallback: if parsing fails, split the content in half
  if (!primaryTweet || !replyTweet) {
    const half = Math.floor(lines.length / 2);
    primaryTweet = lines.slice(0, half).join("\n");
    replyTweet = lines.slice(half).join("\n");
  }

  return {
    primaryTweet: primaryTweet.trim(),
    replyTweet: replyTweet.trim(),
  };
}
```

## JOB DETAIL MODAL WITH CONTENT GENERATION

Component: components/JobDetailModal

This modal opens when a user clicks on a job card or table row in the dashboard.

Modal Structure:

1. Header with job title and company
2. Job details section:
   - Salary range (if available)
   - Location and remote status
   - Employment type
   - Required skills (tags)
   - Full description (scrollable)
   - Application URL (link)
3. AI Content section:
   - If content not generated:
     - "Generate X Thread" button (primary Indigo)
     - Model selector dropdown (shows current default model)
   - If content generated:
     - Display primary tweet in a card
     - Display reply tweet in a card below
     - "Regenerate" button to generate again
     - "Edit" button to manually edit content
     - "Copy Thread" button to copy both tweets
     - "Approve & Post" button (covered in Phase 7)
4. Loading state during generation
5. Error state if generation fails

## CONTENT GENERATION FLOW

1. User clicks on a job card → JobDetailModal opens
2. Modal loads job data from database
3. User clicks "Generate Content" button
4. Show loading state (disable button)
5. Call content generation API route
6. API route calls `generateJobThread` service
7. On success:
   - Save generated content to job record in database
   - Update job.ai_content_generated = true
   - Update job.ai_thread_primary and job.ai_thread_reply
   - Update job.ai_model_used
   - Log activity with token usage and generation time
   - Display generated content in modal
   - Show success notification
8. On error:
   - Show error notification
   - Log error activity
   - Keep modal open for retry

## API ROUTE FOR CONTENT GENERATION

Create app/api/jobs/[jobId]/generate-content/route.ts:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateJobThread } from "@/lib/content-generator";
import { activityLogger } from "@/lib/activity-logger";
import type { Job } from "@/types/job";

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { jobId } = params;
    const { provider, model, userId } = await request.json();

    // Fetch job from database
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Generate content
    const result = await generateJobThread(job as Job, provider, model);

    // Update job record
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        ai_content_generated: true,
        ai_thread_primary: result.content.primaryTweet,
        ai_thread_reply: result.content.replyTweet,
        ai_model_used: result.modelUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) throw updateError;

    // Log activity
    await activityLogger.logContentGenerated(userId, jobId, {
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed,
      generationTime: result.generationTime,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
```

## SETTINGS FOR MODEL SELECTION

Add model selection to app/(dashboard)/settings/page.tsx:

1. Create "AI Settings" section
2. Display dropdown to select default AI model
3. Show current model selection
4. Save selection to settings table in database
5. Load default model when generating content

## COMPONENT STRUCTURE

```markdown
/components/JobDetailModal
index.tsx (main modal component)
types.ts (job detail modal types)
/ContentSection
index.tsx (AI content display/generation section)
/EditContentModal
index.tsx (modal for editing generated content)
hooks/use-generate-content.ts (hook for content generation)

/lib
ai.ts (AI SDK configuration)
content-generator.ts (content generation service)

/app/api/jobs/[jobId]/generate-content
route.ts (API route for generation)
```

## IMPLEMENTATION CHECKLIST

- [ ] Vercel AI SDK installed with all providers
- [ ] API keys added to .env.local
- [ ] AI client configuration created in lib/ai.ts
- [ ] Content generator service created
- [ ] Thread generation prompt engineered
- [ ] JobDetailModal component created
- [ ] Job details display correctly in modal
- [ ] "Generate Content" button present
- [ ] Model selector dropdown works
- [ ] Content generation API route created
- [ ] API route calls content generator successfully
- [ ] Generated content saves to database
- [ ] Activity logged with token usage
- [ ] Generated content displays in modal
- [ ] Primary tweet shows WITHOUT link
- [ ] Reply tweet shows WITH link
- [ ] "Regenerate" button works
- [ ] "Copy Thread" button copies both tweets
- [ ] Loading state shows during generation
- [ ] Error notification shows on failure
- [ ] Settings page has model selection
- [ ] Default model saved to database
- [ ] Default model loads correctly

## ERROR HANDLING FOR THIS PHASE

- Missing API keys: Show error message before generation
- API rate limits: Show specific rate limit error
- Generation timeout: Show timeout error with retry option
- Invalid job data: Show validation error
- Network errors: Show network error with retry button
- Token limit exceeded: Show warning and suggest shorter description

## ACCEPTANCE CRITERIA

1. Clicking a job card opens JobDetailModal
2. Job details display correctly in modal
3. "Generate Content" button is visible
4. Clicking generate button starts content generation
5. Loading state shows during generation
6. Generated content appears in modal after completion
7. Primary tweet is under 280 characters and has NO link
8. Reply tweet contains the job application link
9. Content is saved to job record in database
10. Activity is logged with model used and token count
11. "Regenerate" button allows regenerating content
12. "Copy Thread" button copies both tweets to clipboard
13. Model selector allows choosing different AI models
14. Settings page saves default model selection
15. Error notifications show helpful messages on failures
16. Modal can be closed and reopened with content preserved

================================================================================
PHASE 6: TELEGRAM NOTIFICATION SYSTEM
================================================================================

## OBJECTIVE

Implement Telegram Bot integration to send instant notifications when new jobs are fetched. Each notification includes a deep link to the specific job in the OrbitJobs dashboard for one-click review on mobile.

## TECHNICAL REQUIREMENTS

1. Create Telegram Bot via BotFather
2. Set up Telegram Bot API client
3. Create notification service for sending formatted messages
4. Generate deep links to dashboard job details
5. Send notifications after successful job fetch
6. Handle notification failures gracefully
7. Add Telegram settings to dashboard

## TELEGRAM BOT SETUP

1. Open Telegram and search for @BotFather
2. Send /newbot command
3. Follow prompts to create bot (name it "OrbitJobs Notifier")
4. Copy the bot token provided by BotFather
5. Get your Telegram Chat ID:
   - Start a chat with your bot
   - Send any message
   - Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   - Find "chat":{"id": YOUR_CHAT_ID}

Add to .env.local:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## TELEGRAM CLIENT

Create lib/telegram.ts:

```typescript
import axios from "axios";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  text: string;
  parseMode?: "Markdown" | "HTML";
  disableWebPreview?: boolean;
}

export async function sendTelegramMessage(
  message: TelegramMessage,
): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message.text,
      parse_mode: message.parseMode || "Markdown",
      disable_web_page_preview: message.disableWebPreview ?? true,
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    throw new Error("Telegram notification failed");
  }
}

export function formatJobNotification(
  job: {
    id: string;
    title: string;
    company: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    location?: string;
    remoteAllowed: boolean;
  },
  dashboardUrl: string,
): string {
  let message = "🚀 *New Job Alert*\n\n";
  message += `*${job.title}*\n`;
  message += `${job.company}\n\n`;

  if (job.salaryMin && job.salaryMax) {
    message += `💰 $${job.salaryMin.toLocaleString()}-$${job.salaryMax.toLocaleString()} ${job.salaryCurrency || "USD"}\n`;
  } else if (job.salaryMin) {
    message += `💰 $${job.salaryMin.toLocaleString()}+ ${job.salaryCurrency || "USD"}\n`;
  }

  message += `📍 ${job.location || "Location not specified"}\n`;
  message += `🏠 ${job.remoteAllowed ? "Remote ✅" : "On-site"}\n\n`;

  const deepLink = `${dashboardUrl}/jobs?jobId=${job.id}`;
  message += `[Review in Dashboard](${deepLink})`;

  return message;
}

export function formatJobFetchSummary(
  totalFetched: number,
  newJobs: number,
  duplicates: number,
  dashboardUrl: string,
): string {
  let message = "📊 *Job Fetch Complete*\n\n";
  message += `Total fetched: ${totalFetched}\n`;
  message += `New jobs: ✅ ${newJobs}\n`;
  message += `Duplicates skipped: ⏭️ ${duplicates}\n\n`;
  message += `[View Dashboard](${dashboardUrl}/jobs)`;

  return message;
}
```

## NOTIFICATION SERVICE

Create lib/notification-service.ts:

```typescript
import {
  sendTelegramMessage,
  formatJobNotification,
  formatJobFetchSummary,
} from "./telegram";
import type { Job } from "@/types/job";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function notifyNewJob(job: Job): Promise<void> {
  try {
    const message = formatJobNotification(
      {
        id: job.id,
        title: job.title,
        company: job.company,
        salaryMin: job.salary_min || undefined,
        salaryMax: job.salary_max || undefined,
        salaryCurrency: job.salary_currency || undefined,
        location: job.location || undefined,
        remoteAllowed: job.remote_allowed,
      },
      DASHBOARD_URL,
    );

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send job notification:", error);
    // Don't throw - notification failures shouldn't break job fetching
  }
}

export async function notifyJobFetchComplete(
  totalFetched: number,
  newJobs: number,
  duplicates: number,
): Promise<void> {
  try {
    const message = formatJobFetchSummary(
      totalFetched,
      newJobs,
      duplicates,
      DASHBOARD_URL,
    );

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send fetch summary notification:", error);
  }
}

export async function notifyBatchNewJobs(jobs: Job[]): Promise<void> {
  // Send summary notification for batch
  if (jobs.length === 0) return;

  try {
    let message = `📦 *${jobs.length} New Job${jobs.length > 1 ? "s" : ""} Added*\n\n`;

    // Show first 3 jobs in notification
    const previewJobs = jobs.slice(0, 3);
    for (const job of previewJobs) {
      message += `• ${job.title} @ ${job.company}\n`;
    }

    if (jobs.length > 3) {
      message += `\n...and ${jobs.length - 3} more\n`;
    }

    message += `\n[Review All Jobs](${DASHBOARD_URL}/jobs)`;

    await sendTelegramMessage({ text: message, parseMode: "Markdown" });
  } catch (error) {
    console.error("Failed to send batch notification:", error);
  }
}
```

## INTEGRATE NOTIFICATIONS INTO JOB FETCH

Update lib/job-service.ts to send notifications after successful fetch:

```typescript
// Add to fetchAndStoreJobs function after jobs are inserted

import {
  notifyBatchNewJobs,
  notifyJobFetchComplete,
} from "./notification-service";

// ... existing code ...

// After successful job insertion
if (insertedJobs.length > 0) {
  // Send notification about new jobs
  await notifyBatchNewJobs(insertedJobs);
}

// Send fetch summary
await notifyJobFetchComplete(
  totalFetched,
  newApiJobs.length,
  totalFetched - newApiJobs.length,
);

// ... rest of existing code ...
```

## DEEP LINK HANDLING IN DASHBOARD

Update app/(dashboard)/jobs/page.tsx to handle deep links:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import JobDetailModal from '@/components/JobDetailModal';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      setSelectedJobId(jobId);
    }
  }, [jobId]);

  // ... rest of component ...

  return (
    <>
      {/* Jobs list/table */}

      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          opened={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </>
  );
}
```

## TELEGRAM SETTINGS IN DASHBOARD

Add Telegram configuration to app/(dashboard)/settings/page.tsx:

1. Display current Telegram Bot status (connected/disconnected)
2. Show configured chat ID
3. "Test Notification" button to send test message
4. Option to enable/disable notifications
5. Save notification preferences to settings table

## TEST NOTIFICATION FUNCTION

Create test notification API route for settings page:
app/api/notifications/test/route.ts:

```typescript
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  try {
    await sendTelegramMessage({
      text: "✅ *Test Notification*\n\nYour OrbitJobs Telegram notifications are working correctly!",
      parseMode: "Markdown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 },
    );
  }
}
```

## COMPONENT STRUCTURE

```markdown
/lib
telegram.ts (Telegram Bot API client)
notification-service.ts (notification formatting and sending)

/app/api/notifications/test
route.ts (test notification endpoint)
```

## IMPLEMENTATION CHECKLIST

- [ ] Telegram bot created via BotFather
- [ ] Bot token obtained and added to .env.local
- [ ] Chat ID obtained and added to .env.local
- [ ] Telegram client created in lib/telegram.ts
- [ ] Test message successfully sent to Telegram
- [ ] Notification service created
- [ ] Job notification formatter works correctly
- [ ] Deep links generate correctly
- [ ] Notifications integrated into job fetch flow
- [ ] Batch notification sent after job fetch
- [ ] Fetch summary notification sent
- [ ] Deep links open correct job in dashboard
- [ ] JobDetailModal opens from URL parameter
- [ ] Settings page shows Telegram status
- [ ] Test notification button works
- [ ] Notification failures don't break app

## ERROR HANDLING FOR THIS PHASE

- Missing bot token: Log error, skip notifications, don't crash app
- Invalid chat ID: Log error, show in settings page
- Telegram API errors: Log error, continue with job fetch
- Network errors: Retry once, then log and continue
- Notification failures are logged but never throw exceptions

## ACCEPTANCE CRITERIA

1. Telegram bot is created and configured
2. Bot token and chat ID are in environment variables
3. Test notification sends successfully
4. After job fetch, Telegram message arrives with summary
5. Telegram message includes correct job count
6. Deep link in message opens correct job in dashboard
7. Clicking deep link opens JobDetailModal
8. Settings page shows Telegram connection status
9. "Test Notification" button sends test message
10. Notification failures don't crash the app
11. All notifications use Markdown formatting
12. Job notifications include salary, location, remote status
13. Batch notifications list up to 3 jobs
14. Fetch summary shows total, new, and duplicate counts

================================================================================
PHASE 7: DASHBOARD, ANALYTICS & X POSTING
================================================================================
OBJECTIVE

---

Build the complete dashboard with job management, analytics charts, and X (Twitter) posting functionality. Implement job approval workflow, manual posting via copy button, and semi-automated posting via X API with rate limit tracking.

## TECHNICAL REQUIREMENTS

1. Create job management interface (list/table view)
2. Build job approval workflow with status transitions
3. Implement X API v2 client for posting
4. Create posting UI with copy button and API post button
5. Build analytics dashboard with charts
6. Implement rate limit tracking for X API
7. Create settings page for all configurations

## X API SETUP

1. Create X Developer account: https://developer.twitter.com
2. Create a new app in the Developer Portal
3. Generate API keys and tokens:
   - API Key
   - API Secret Key
   - Access Token
   - Access Token Secret
   - Bearer Token
4. Enable OAuth 2.0 and set permissions to "Read and Write"

Add to .env.local:

```env
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_SECRET=your_access_token_secret
X_BEARER_TOKEN=your_bearer_token
```

## X API CLIENT

Create lib/x-api.ts:

```typescript
import { TwitterApi } from "twitter-api-v2";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
});

const readWriteClient = client.readWrite;

export interface TweetResult {
  tweetId: string;
  text: string;
}

export async function postThread(
  primaryTweet: string,
  replyTweet: string,
): Promise<{ primaryTweetId: string; replyTweetId: string }> {
  try {
    // Post primary tweet
    const primaryResult = await readWriteClient.v2.tweet(primaryTweet);

    // Post reply tweet
    const replyResult = await readWriteClient.v2.tweet({
      text: replyTweet,
      reply: { in_reply_to_tweet_id: primaryResult.data.id },
    });

    return {
      primaryTweetId: primaryResult.data.id,
      replyTweetId: replyResult.data.id,
    };
  } catch (error) {
    console.error("Failed to post thread:", error);
    throw new Error("Failed to post thread to X");
  }
}

export async function getRateLimitStatus(): Promise<{
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const rateLimits = await client.v2.rateLimitStatuses();
    const tweetLimit = rateLimits.resources.tweets?.["/tweets"] || {
      limit: 500,
      remaining: 500,
      reset: Date.now() / 1000 + 86400,
    };

    return {
      limit: tweetLimit.limit,
      remaining: tweetLimit.remaining,
      reset: tweetLimit.reset,
    };
  } catch (error) {
    console.error("Failed to get rate limit:", error);
    // Return default values if API call fails
    return {
      limit: 500,
      remaining: 500,
      reset: Date.now() / 1000 + 86400,
    };
  }
}
```

## JOB MANAGEMENT INTERFACE (ALREADY CREATED, DO NOT IMPLEMENT ALREADY EXISTING IDEA)

app/(dashboard)/jobs/page.tsx

This page displays all jobs with filtering, sorting, and bulk actions.

Features:

1. View Toggle: Switch between Table and Card views
2. Status Filter: Filter by Pending, Approved, Rejected, Posted
3. Search: Search by job title or company
4. Sort: Sort by date added, salary, company
5. Bulk Actions: Select multiple jobs, approve/reject in batch
6. Job Cards/Rows: Show key info, status badge, action buttons
7. Click to open JobDetailModal
8. Empty state when no jobs match filters

Job Card/Row Should Display:

- Job title
- Company name (with logo if available)
- Salary range (if available)
- Location and remote status
- Status badge (color-coded)
- Action buttons:
  - "View Details" (opens modal)
  - "Approve" (if pending)
  - "Generate Content" (if not generated)
  - "Post" (if approved and content generated)

## JOB APPROVAL WORKFLOW

Job Status Transitions:

```txt
pending → approved (user approves)
pending → rejected (user rejects)
approved → posted (after posting to X)
```

Create API route: app/api/jobs/[jobId]/status/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { activityLogger } from "@/lib/activity-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { jobId } = params;
    const { status, userId } = await request.json();

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "posted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch current job
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update status
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) throw updateError;

    // Log activity
    if (status === "approved") {
      await activityLogger.logJobApproved(userId, jobId, job.title);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 },
    );
  }
}
```

## POSTING INTERFACE IN JOB DETAIL MODAL

Update JobDetailModal to include posting section:

When job is approved and content is generated, show posting options:

1. Manual Copy Section:
   - "Copy Primary Tweet" button
   - "Copy Reply Tweet" button
   - "Copy Full Thread" button (copies both with separation)
   - After copying, show "Copied!" confirmation

2. X API Posting Section:
   - Show current rate limit status: "X/500 posts remaining this month"
   - "Post to X" button (disabled if rate limit exceeded)
   - After posting, show success notification
   - Display tweet URL link
   - Mark job as "posted" status
   - Disable post button (already posted)

3. Edit Before Posting:
   - "Edit Content" button opens editable text areas
   - Save edited content back to database
   - Show "Content edited" indicator

## POST TO X API ROUTE

Create app/api/jobs/[jobId]/post/route.ts:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { postThread } from "@/lib/x-api";
import { activityLogger } from "@/lib/activity-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { jobId } = params;
    const { userId } = await request.json();

    // Fetch job
    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Validate job has content
    if (!job.ai_thread_primary || !job.ai_thread_reply) {
      return NextResponse.json(
        { error: "No content generated for this job" },
        { status: 400 },
      );
    }

    // Validate job is approved
    if (job.status !== "approved") {
      return NextResponse.json(
        { error: "Job must be approved before posting" },
        { status: 400 },
      );
    }

    // Post to X
    const { primaryTweetId, replyTweetId } = await postThread(
      job.ai_thread_primary,
      job.ai_thread_reply,
    );

    // Update job record
    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "posted",
        posted_to_x: true,
        posted_at: new Date().toISOString(),
        x_tweet_id: primaryTweetId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) throw updateError;

    // Log activity
    await activityLogger.logJobPosted(userId, jobId, job.title, primaryTweetId);

    return NextResponse.json({
      success: true,
      tweetUrl: `https://twitter.com/TheOrbitJobs/status/${primaryTweetId}`,
      primaryTweetId,
      replyTweetId,
    });
  } catch (error) {
    console.error("Failed to post to X:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post" },
      { status: 500 },
    );
  }
}
```

## ANALYTICS DASHBOARD

app/(dashboard)/analytics/page.tsx

Display charts and metrics:

1. Overview Stats Cards:
   - Total jobs fetched (all time)
   - Jobs pending review
   - Jobs approved
   - Jobs posted to X
   - Average approval rate
   - Total X posts this month

2. Charts (using Chart.js):

   a) Jobs Fetched Over Time (Line Chart)
   - X-axis: Last 30 days
   - Y-axis: Number of jobs fetched
   - Show new jobs vs duplicates in different colors

   b) Job Status Distribution (Pie Chart)
   - Pending
   - Approved
   - Rejected
   - Posted

   c) Jobs by Salary Range (Bar Chart)
   - Group by salary brackets: <$100K, $100K-$150K, $150K-$200K, >$200K
   - Show count in each bracket

   d) Top Companies (Bar Chart)
   - Top 10 companies by job count
   - Horizontal bar chart

   e) Remote vs On-site (Donut Chart)
   - Percentage of remote vs on-site jobs

   f) X Posting Activity (Line Chart)
   - Posts per day over last 30 days
   - Show rate limit line

3. Activity Feed:
   - Recent activities (last 20)
   - Scrollable list with expand details

## RATE LIMIT TRACKING

Create component: components/XRateLimitTracker

This component:

1. Fetches current rate limit from X API
2. Displays: "X/500 posts remaining this month"
3. Shows progress bar (visual representation)
4. Shows reset date: "Resets on March 1st, 2026"
5. Color-codes based on remaining:
   - Green: >250 remaining
   - Yellow: 100-250 remaining
   - Red: <100 remaining
6. Updates every time a post is made
7. Stores rate limit data in local state/database for offline display

## SETTINGS PAGE

app/(dashboard)/settings/page.tsx

Organize settings into sections:

1. AI Settings
   - Default AI model selection
   - Model preferences (temperature, max tokens)

2. X API Settings
   - API connection status
   - Rate limit display
   - "Test X API Connection" button

3. Telegram Settings
   - Bot connection status
   - Chat ID display
   - Enable/disable notifications toggle
   - "Send Test Notification" button

4. Job Fetch Settings
   - Default search queries
   - Default filters
   - Auto-notification preferences

5. Account Settings
   - Username display
   - Logout button

6. Data Management
   - "Export All Jobs" button (CSV download)
   - "Clear Posted Jobs" button (with vercel-style confirmation where user will type "delete posted jobs")
   - "Reset All Settings" button (with vercel-style confirmation where user will type "reset all settings")

## COMPONENT STRUCTURE

```markdown
/components/JobManagement
/JobsTable
index.tsx
/JobsGrid
index.tsx
/JobCard
index.tsx
/JobFilters
index.tsx
/BulkActions
index.tsx

/components/Analytics
/StatsCards
index.tsx
/JobsChart
index.tsx
/StatusChart
index.tsx
/SalaryChart
index.tsx
/CompaniesChart
index.tsx

/components/XRateLimitTracker
index.tsx
hooks/use-rate-limit.ts

/components/PostingControls
index.tsx
hooks/use-post-to-x.ts

/lib
x-api.ts (X API client)

/app/api/jobs/[jobId]
/status/route.ts (status update)
/post/route.ts (post to X)
```

## IMPLEMENTATION CHECKLIST

- [ ] X Developer account created
- [ ] X API credentials obtained and added to .env
- [ ] X API client created and tested
- [ ] Job management page displays all jobs
- [ ] Table and card view toggle works
- [ ] Status filter works correctly
- [ ] Search functionality works
- [ ] Job approval updates status
- [ ] JobDetailModal shows posting controls
- [ ] "Copy" buttons copy content to clipboard
- [ ] "Post to X" button posts thread successfully
- [ ] Posted jobs update status to "posted"
- [ ] Tweet URL link displays after posting
- [ ] Rate limit tracker displays correctly
- [ ] Rate limit updates after posting
- [ ] Analytics page displays all charts
- [ ] Charts render with correct data
- [ ] Stats cards show accurate counts
- [ ] Activity feed displays recent activities
- [ ] Settings page has all sections
- [ ] All settings save to database
- [ ] Export functionality downloads CSV

## ERROR HANDLING FOR THIS PHASE

- X API errors: Show specific error message, log to activities
- Rate limit exceeded: Disable post button, show reset time
- Failed to post: Show error notification, don't update job status
- Copy to clipboard fails: Show fallback with selectable text
- Chart rendering errors: Show error state, don't crash page
- Settings save failures: Show error notification

## ACCEPTANCE CRITERIA

1. Job management page displays all jobs correctly
2. Filters and search work as expected
3. Approving a job updates its status
4. JobDetailModal shows posting controls for approved jobs
5. Copy buttons successfully copy content to clipboard
6. "Post to X" button posts thread to X successfully
7. Thread appears on X with correct content
8. Primary tweet has no link, reply tweet has link
9. Posted job status updates to "posted"
10. Rate limit tracker shows correct remaining count
11. Rate limit updates after each post
12. Analytics charts display with real data
13. All stats cards show accurate numbers
14. Settings save and persist correctly
15. Export functionality works
16. All error states handled gracefully
17. Mobile responsiveness works on all pages

## FINAL DEPLOYMENT & PRODUCTION CHECKLIST (IGNORE, THIS IS FOR HUMAN)

### ENVIRONMENT VARIABLES (Production)

Ensure all environment variables are set in Vercel:

Required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL (set to production URL)
- RAPIDAPI_KEY
- OPENAI_API_KEY (or other AI provider keys)
- X_API_KEY
- X_API_SECRET
- X_ACCESS_TOKEN
- X_ACCESS_SECRET
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID
- NEXT_PUBLIC_APP_URL (production URL)

### PRODUCTION OPTIMIZATIONS

1. Enable Vercel Analytics and Speed Insights
2. Configure caching headers for static assets
3. Optimize images with Next.js Image component
4. Enable compression in vercel.json
5. Set up custom domain
6. Configure CORS if needed
7. Enable error tracking (Sentry recommended)
8. Set up monitoring alerts for API failures

### SECURITY CHECKLIST

- [ ] All API keys stored in environment variables, never in code
- [ ] .env.local added to .gitignore
- [ ] Supabase RLS policies enabled on all tables
- [ ] BetterAuth session cookies are httpOnly and secure
- [ ] Middleware protects all dashboard routes
- [ ] No sensitive data exposed in client-side code
- [ ] API routes validate user authentication
- [ ] X API credentials never exposed to client
- [ ] Rate limiting implemented on API routes
- [ ] Input validation on all user inputs

### PERFORMANCE CHECKLIST

- [ ] Database indexes created for all queried columns
- [ ] Mantine components imported individually (not entire library)
- [ ] Images optimized and lazy-loaded
- [ ] API responses cached where appropriate
- [ ] Unnecessary re-renders prevented with React.memo
- [ ] Large lists use virtualization if needed
- [ ] Charts only render when visible
- [ ] Database queries optimized (no N+1 queries)
- [ ] Bundle size analyzed and minimized

### TESTING CHECKLIST

- [ ] Test login/logout flow
- [ ] Test job fetching with various filters
- [ ] Test AI content generation with different models
- [ ] Test posting to X (primary and reply tweets)
- [ ] Test rate limit tracking
- [ ] Test Telegram notifications
- [ ] Test deep links from Telegram
- [ ] Test all analytics charts render correctly
- [ ] Test mobile responsiveness on real devices
- [ ] Test error states and edge cases
- [ ] Test with slow network (throttling)
- [ ] Test with no data (empty states)

FINAL ACCEPTANCE CRITERIA

1. Admin can log in with correct credentials
2. Dashboard is fully functional and responsive
3. Job fetching works with modal filters
4. Filter preferences persist across sessions
5. Jobs are deduplicated correctly
6. AI content generates correctly with chosen model
7. Telegram notifications arrive with deep links
8. Deep links open correct job in dashboard
9. Jobs can be approved and posted to X
10. Posted threads appear correctly on X
11. Rate limit tracking is accurate
12. Analytics charts display real data
13. All settings save and load correctly
14. Activity feed shows all logged actions
15. Mobile experience is smooth and functional
16. No console errors in production
17. Page load time < 3 seconds
18. All API routes protected by authentication
19. Error handling works for all edge cases
20. Application works offline (where applicable)
