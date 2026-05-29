import { db } from "@/db"
import { contentFeedback, user, REACTION_SLUGS } from "@/db/schema"
import { auth } from "@/lib/auth"
import { and, count, desc, eq, isNotNull } from "drizzle-orm"

/** How many participant avatars to return; the rest are summarized as "+N". */
const PARTICIPANT_LIMIT = 5

async function getCounts(type: string, id: string): Promise<Record<string, number>> {
  const rows = await db
    .select({ reaction: contentFeedback.reaction, count: count() })
    .from(contentFeedback)
    .where(and(eq(contentFeedback.contentType, type), eq(contentFeedback.contentId, id)))
    .groupBy(contentFeedback.reaction)

  return Object.fromEntries(rows.map((r) => [r.reaction, Number(r.count)]))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")
  if (!type || !id) return Response.json({ error: "Missing params" }, { status: 400 })

  const where = and(eq(contentFeedback.contentType, type), eq(contentFeedback.contentId, id))

  const [counts, participants, totalRows] = await Promise.all([
    getCounts(type, id),
    db
      .select({ name: user.name, image: user.image, username: user.username })
      .from(contentFeedback)
      .innerJoin(user, eq(contentFeedback.userId, user.id))
      .where(where)
      .orderBy(desc(contentFeedback.createdAt))
      .limit(PARTICIPANT_LIMIT),
    db
      .select({ count: count() })
      .from(contentFeedback)
      .where(and(where, isNotNull(contentFeedback.userId))),
  ])

  return Response.json({ counts, participants, total: Number(totalRows[0]?.count ?? 0) })
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { type, id, reaction, comment } = await req.json()
  if (!type || !id || !reaction) return Response.json({ error: "Missing fields" }, { status: 400 })
  if (!(REACTION_SLUGS as readonly string[]).includes(reaction))
    return Response.json({ error: "Invalid reaction" }, { status: 400 })

  // One feedback per user per content item: update in place if it already exists.
  await db
    .insert(contentFeedback)
    .values({
      id: crypto.randomUUID(),
      contentType: type,
      contentId: id,
      reaction,
      comment: comment?.trim() || null,
      userId: session.user.id,
    })
    .onConflictDoUpdate({
      target: [contentFeedback.contentType, contentFeedback.contentId, contentFeedback.userId],
      set: { reaction, comment: comment?.trim() || null, createdAt: new Date() },
    })

  return Response.json({ ok: true })
}
