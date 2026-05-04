import { db } from "@/db"
import { contentFeedback } from "@/db/schema"
import { and, count, eq } from "drizzle-orm"

async function getCounts(type: string, id: string): Promise<Record<number, number>> {
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

  const counts = await getCounts(type, id)
  return Response.json({ counts })
}

export async function POST(req: Request) {
  const { type, id, reaction } = await req.json()
  if (!type || !id || !reaction) return Response.json({ error: "Missing fields" }, { status: 400 })
  if (![1, 2, 3, 4].includes(reaction))
    return Response.json({ error: "Invalid reaction" }, { status: 400 })

  await db.insert(contentFeedback).values({
    id: crypto.randomUUID(),
    contentType: type,
    contentId: id,
    reaction,
  })

  const counts = await getCounts(type, id)
  return Response.json({ counts })
}
