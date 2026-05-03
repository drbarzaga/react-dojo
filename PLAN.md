# Better-Auth Integration Plan

## Overview

Integrate better-auth with GitHub + Google OAuth, Neon PostgreSQL (via Drizzle), a GitHub-style contribution graph, and a public developer directory.

---

## Step 1 — Install dependencies

```bash
npm install better-auth @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit
```

> Verify these are present in `package.json` before continuing.

---

## Step 2 — Environment variables

Create `.env.local`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Generate a secret: `openssl rand -base64 32`

---

## Step 3 — OAuth Apps

**GitHub:** Settings → Developer settings → OAuth Apps → New OAuth App

- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

**Google:** console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

---

## Step 4 — Drizzle scripts in `package.json`

Add to `"scripts"`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

---

## Step 5 — Migrate the database

```bash
npm run db:push
```

This creates all tables defined in `src/db/schema.ts` directly in Neon.

---

## Step 6 — Files to create

### 6.1 `src/lib/auth-client.ts` ✅ TODO

```ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
})

export const { signIn, signOut, useSession } = authClient
```

---

### 6.2 `src/app/api/auth/[...all]/route.ts` ✅ TODO

```ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

---

### 6.3 `src/app/api/progress/sync/route.ts` ✅ TODO

Merges localStorage progress into the DB on first login (union arrays, max quiz scores).

```ts
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { visitedConcepts, completedExercises, quizScores } = await req.json()
  const userId = session.user.id

  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  })

  if (existing) {
    const merged = {
      visitedConcepts: [...new Set([...existing.visitedConcepts, ...visitedConcepts])],
      completedExercises: [...new Set([...existing.completedExercises, ...completedExercises])],
      quizScores: { ...existing.quizScores },
    }
    for (const [id, score] of Object.entries(quizScores as Record<string, number>)) {
      merged.quizScores[id] = Math.max(merged.quizScores[id] ?? 0, score)
    }
    await db
      .update(userProgress)
      .set({ ...merged, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
    return Response.json(merged)
  } else {
    const newProgress = { userId, visitedConcepts, completedExercises, quizScores }
    await db.insert(userProgress).values(newProgress)
    return Response.json(newProgress)
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, session.user.id),
  })
  return Response.json(data ?? { visitedConcepts: [], completedExercises: [], quizScores: {} })
}
```

---

### 6.4 `src/app/api/progress/activity/route.ts` ✅ TODO

Increments the daily activity counter (used by the contribution graph).

```ts
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { activityLog } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const today = new Date().toISOString().split("T")[0]
  const userId = session.user.id

  const existing = await db.query.activityLog.findFirst({
    where: and(eq(activityLog.userId, userId), eq(activityLog.date, today)),
  })

  if (existing) {
    await db
      .update(activityLog)
      .set({ count: existing.count + 1 })
      .where(and(eq(activityLog.userId, userId), eq(activityLog.date, today)))
  } else {
    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId,
      date: today,
      count: 1,
    })
  }

  return Response.json({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 })

  const logs = await db.query.activityLog.findMany({
    where: eq(activityLog.userId, userId),
    orderBy: (t, { asc }) => [asc(t.date)],
  })
  return Response.json(logs)
}
```

---

### 6.5 `src/app/api/users/route.ts` ✅ TODO

Public developer directory endpoint.

```ts
import { db } from "@/db"
import { user, userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const users = await db.select({ id: user.id, name: user.name, image: user.image }).from(user)

  const withProgress = await Promise.all(
    users.map(async (u) => {
      const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, u.id),
      })
      return {
        ...u,
        visitedConcepts: progress?.visitedConcepts.length ?? 0,
        completedExercises: progress?.completedExercises.length ?? 0,
        quizzesAttempted: Object.keys(progress?.quizScores ?? {}).length,
      }
    })
  )

  return Response.json(withProgress)
}
```

---

### 6.6 `src/components/contribution-graph.tsx` ✅ TODO

GitHub-style 52-week heatmap.

```tsx
"use client"

interface Day {
  date: string
  count: number
}

interface ContributionGraphProps {
  data: Day[]
}

function getLast52Weeks(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split("T")[0])
  }
  return days
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-[var(--color-bg-hover)]"
  if (count <= 2) return "bg-green-900/60"
  if (count <= 5) return "bg-green-700/70"
  if (count <= 10) return "bg-green-500/80"
  return "bg-green-400"
}

export function ContributionGraph({ data }: ContributionGraphProps) {
  const map = new Map(data.map((d) => [d.date, d.count]))
  const days = getLast52Weeks()
  const firstDow = new Date(days[0]).getDay()
  const padded = [...Array(firstDow).fill(null), ...days]
  const weeks: (string | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) => (
            <div
              key={di}
              title={day ? `${day}: ${map.get(day) ?? 0} activities` : ""}
              className={`h-[10px] w-[10px] rounded-[2px] ${
                day ? intensityClass(map.get(day) ?? 0) : "invisible"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

### 6.7 `src/app/[locale]/profile/page.tsx` ✅ TODO

```tsx
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userProgress, activityLog } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ContributionGraph } from "@/components/contribution-graph"
import Image from "next/image"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/")

  const [progress, logs] = await Promise.all([
    db.query.userProgress.findFirst({
      where: eq(userProgress.userId, session.user.id),
    }),
    db.query.activityLog.findMany({
      where: eq(activityLog.userId, session.user.id),
    }),
  ])

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-4">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">{session.user.name}</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">{session.user.email}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Stat label="Concepts" value={progress?.visitedConcepts.length ?? 0} />
        <Stat label="Exercises" value={progress?.completedExercises.length ?? 0} />
        <Stat label="Quizzes" value={Object.keys(progress?.quizScores ?? {}).length} />
      </div>

      <h2 className="mb-3 text-sm font-medium tracking-wider text-[var(--color-fg-muted)] uppercase">
        Activity
      </h2>
      <ContributionGraph data={logs} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] p-4 text-center">
      <div className="text-2xl font-bold text-[var(--color-fg)]">{value}</div>
      <div className="text-xs text-[var(--color-fg-muted)]">{label}</div>
    </div>
  )
}
```

---

### 6.8 `src/app/[locale]/directory/page.tsx` ✅ TODO

```tsx
import Image from "next/image"
import { db } from "@/db"
import { user, userProgress } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DirectoryPage() {
  const users = await db.select({ id: user.id, name: user.name, image: user.image }).from(user)

  const withStats = await Promise.all(
    users.map(async (u) => {
      const p = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, u.id),
      })
      return {
        ...u,
        concepts: p?.visitedConcepts.length ?? 0,
        exercises: p?.completedExercises.length ?? 0,
        quizzes: Object.keys(p?.quizScores ?? {}).length,
      }
    })
  )

  const sorted = withStats.sort((a, b) => b.concepts + b.exercises - (a.concepts + a.exercises))

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-[var(--color-fg)]">Developer Directory</h1>
      <p className="mb-8 text-sm text-[var(--color-fg-muted)]">
        {sorted.length} developers learning React
      </p>
      <div className="space-y-3">
        {sorted.map((dev) => (
          <div
            key={dev.id}
            className="flex items-center gap-4 rounded-lg border border-[var(--color-line)] p-4"
          >
            {dev.image ? (
              <Image
                src={dev.image}
                alt={dev.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-hover)] text-sm font-bold text-[var(--color-fg-muted)]">
                {dev.name[0]}
              </div>
            )}
            <div className="flex-1 font-medium text-[var(--color-fg)]">{dev.name}</div>
            <div className="flex gap-6 text-right">
              <Metric label="Concepts" value={dev.concepts} />
              <Metric label="Exercises" value={dev.exercises} />
              <Metric label="Quizzes" value={dev.quizzes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-sm font-semibold text-[var(--color-fg)]">{value}</div>
      <div className="text-[11px] text-[var(--color-fg-muted)]">{label}</div>
    </div>
  )
}
```

---

### 6.9 Update `src/components/header.tsx` ✅ TODO

Add to imports:

```ts
import { useSession, signIn, signOut } from "@/lib/auth-client"
import Image from "next/image"
import { LogIn } from "lucide-react"
```

Add inside the component:

```ts
const { data: session } = useSession()
```

Add after `<LocaleSwitcher />`:

```tsx
{
  session ? (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => signOut()}
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={22}
                height={22}
                className="rounded-full"
              />
            ) : (
              <span className="text-[11px] font-bold text-[var(--color-fg-muted)]">
                {session.user.name[0]}
              </span>
            )}
          </button>
        }
      />
      <TooltipContent>Sign out ({session.user.name})</TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={() => signIn.social({ provider: "github" })}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-fg)]"
          >
            <LogIn className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </button>
        }
      />
      <TooltipContent>Sign in</TooltipContent>
    </Tooltip>
  )
}
```

---

### 6.10 Update `src/hooks/use-progress.tsx` ✅ TODO

After login, sync localStorage → server and replace local state with merged result.

Add inside `ProgressProvider`:

```ts
const { data: session } = useSession()

useEffect(() => {
  if (!session) return
  const local = load()
  fetch("/api/progress/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(local),
  })
    .then((r) => r.json())
    .then((merged) => {
      persist(merged)
      setData(merged)
    })
    .catch(() => {})
}, [session?.user.id])
```

Also call the activity endpoint on each progress action:

```ts
function logActivity() {
  fetch("/api/progress/activity", { method: "POST" }).catch(() => {})
}
// call logActivity() inside markConceptVisited, toggleExerciseCompleted, saveQuizScore
```

---

## Implementation order

- [ ] Step 1 — Install dependencies
- [ ] Step 2 — Create `.env.local`
- [ ] Step 3 — Create OAuth apps (GitHub + Google)
- [ ] Step 4 — Add Drizzle scripts to `package.json`
- [ ] Step 5 — Run `npm run db:push`
- [ ] Step 6.1 — `src/lib/auth-client.ts`
- [ ] Step 6.2 — `src/app/api/auth/[...all]/route.ts`
- [ ] Step 6.3 — `src/app/api/progress/sync/route.ts`
- [ ] Step 6.4 — `src/app/api/progress/activity/route.ts`
- [ ] Step 6.5 — `src/app/api/users/route.ts`
- [ ] Step 6.6 — `src/components/contribution-graph.tsx`
- [ ] Step 6.7 — `src/app/[locale]/profile/page.tsx`
- [ ] Step 6.8 — `src/app/[locale]/directory/page.tsx`
- [ ] Step 6.9 — Update `src/components/header.tsx`
- [ ] Step 6.10 — Update `src/hooks/use-progress.tsx`
