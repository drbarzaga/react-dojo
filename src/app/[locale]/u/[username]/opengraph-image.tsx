import { ImageResponse } from "next/og"
import { readFile } from "fs/promises"
import path from "path"
import { db } from "@/db"
import { user as userTable } from "@/db/schema"
import { buildProfileData } from "@/lib/profile-data"
import type { Locale } from "@/i18n/routing"
import { eq, or } from "drizzle-orm"

export const alt = "React Dojo profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const G = "#4ade80"

// Maps a rank's tailwind text color to a raw hex for the OG canvas.
const RANK_HEX: Record<string, string> = {
  "text-yellow-400": "#facc15",
  "text-orange-400": "#fb923c",
  "text-purple-400": "#c084fc",
  "text-blue-400": "#60a5fa",
  "text-cyan-400": "#22d3ee",
  "text-green-400": "#4ade80",
  "text-emerald-400": "#34d399",
  "text-emerald-500": "#10b981",
  "text-zinc-400": "#a1a1aa",
  "text-zinc-500": "#71717a",
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; username: string }>
}) {
  const { locale, username } = await params
  const decoded = decodeURIComponent(username)

  const logoData = await readFile(path.join(process.cwd(), "public", "logo-clean.png"))
  const logo = `data:image/png;base64,${logoData.toString("base64")}`

  const found = await db.query.user.findFirst({
    where: or(eq(userTable.username, decoded), eq(userTable.id, decoded)),
    columns: { id: true, name: true, image: true, createdAt: true },
  })

  // Fallback card when the profile can't be found.
  const data = found ? await buildProfileData(found, locale as Locale) : null
  const rankHex = data ? (RANK_HEX[data.rank.textColor] ?? "#a1a1aa") : "#a1a1aa"

  const stats = data
    ? [
        { v: `${data.visited}`, l: "Concepts" },
        { v: `${data.exercisesCompleted}`, l: "Exercises" },
        { v: `${data.quizzesAttempted}`, l: "Quizzes" },
        { v: `${data.streak.current}`, l: "Streak" },
      ]
    : []

  return new ImageResponse(
    <div
      style={{
        background: "#0d0d0d",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        position: "relative",
        padding: "72px",
        overflow: "hidden",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 50px)",
        }}
      />

      {/* Rank glow */}
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rankHex}1f 0%, transparent 65%)`,
          top: -120,
          right: -120,
        }}
      />

      {/* Brand row */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
          }}
        >
          <img
            src={logo}
            alt="React Dojo"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", letterSpacing: "-0.04em" }}>
          <span style={{ fontSize: "30px", fontWeight: 800, color: "#f0f0f0" }}>React&nbsp;</span>
          <span style={{ fontSize: "30px", fontWeight: 800, color: G }}>Dojo</span>
        </div>
      </div>

      {/* Identity row */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {data?.user.image ? (
          <img
            src={data.user.image}
            alt={data.user.name}
            width={148}
            height={148}
            style={{ borderRadius: "50%", objectFit: "cover", border: `3px solid ${rankHex}` }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "148px",
              height: "148px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: `3px solid ${rankHex}`,
              fontSize: "64px",
              fontWeight: 800,
              color: "#f0f0f0",
            }}
          >
            {(data?.user.name ?? "?")[0].toUpperCase()}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "62px",
              fontWeight: 800,
              color: "#f5f5f5",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {data?.user.name ?? "Profile not found"}
          </span>
          {data && (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "18px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: `${rankHex}24`,
                  border: `1px solid ${rankHex}55`,
                  borderRadius: "100px",
                  padding: "8px 20px",
                }}
              >
                <span style={{ fontSize: "26px", fontWeight: 700, color: rankHex }}>
                  {data.rank.label}
                </span>
              </div>
              <span style={{ fontSize: "26px", color: "rgba(255,255,255,0.45)" }}>
                {data.score} / 100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {data && (
        <div style={{ display: "flex", alignItems: "center", gap: "0px", marginTop: "auto" }}>
          {stats.map((s, i) => (
            <div key={s.l} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 44,
                    background: "rgba(255,255,255,0.1)",
                    marginLeft: "36px",
                    marginRight: "36px",
                  }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "46px", fontWeight: 800, color: "#f0f0f0" }}>{s.v}</span>
                <span
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.14em",
                    marginTop: "4px",
                  }}
                >
                  {s.l.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>,
    size
  )
}
