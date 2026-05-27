"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import type { PlayerRef } from "@remotion/player"
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion"
import { useLocaleRouter } from "@/hooks/use-locale-router"

// ── i18n ──────────────────────────────────────────────────────────────────────
type Locale = "en" | "es"
interface CompositionProps {
  locale: Locale
}

const t = {
  es: {
    badgeBad: "✗ prop drilling",
    badgeGood: "✓ contexto",
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    commentBad: "// ← user aquí",
    commentGood: "// ← desde contexto",
    chainLine: "// Layout → Sidebar → UserCard",
    contextLabel: "// UserCard:",
    warning: "⚠ Layout y Sidebar re-renderizan sin usar user",
    success: "✓ Solo UserCard re-renderiza — Layout y Sidebar no se tocan",
  },
  en: {
    badgeBad: "✗ prop drilling",
    badgeGood: "✓ context",
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    commentBad: "// ← user here",
    commentGood: "// ← from context",
    chainLine: "// Layout → Sidebar → UserCard",
    contextLabel: "// UserCard:",
    warning: "⚠ Layout and Sidebar re-render without using user",
    success: "✓ Only UserCard re-renders — Layout and Sidebar untouched",
  },
} as const

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG = "#0a0a0a"
const BAD = "#ef4444"
const GOOD = "#4ade80"
const MUTED = "rgba(255,255,255,0.32)"
const BORDER = "rgba(255,255,255,0.07)"
const KW = "#c084fc"
const BLUE = "#60a5fa"
const MONO = "Geist Mono, Courier New, monospace"

function clamp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
}

function Region({
  flash,
  flashColor,
  style,
  children,
}: {
  flash: number
  flashColor: string
  style: React.CSSProperties
  children?: React.ReactNode
}) {
  const lit = flash > 0.12
  const bgAlpha = Math.round(Math.min(flash, 1) * 52)
    .toString(16)
    .padStart(2, "0")
  const glowAlpha = Math.round(Math.min(flash, 1) * 80)
    .toString(16)
    .padStart(2, "0")
  return (
    <div
      style={{
        position: "absolute",
        border: `1px solid ${lit ? flashColor + "aa" : BORDER}`,
        backgroundColor: lit ? `${flashColor}${bgAlpha}` : "rgba(255,255,255,0.03)",
        boxShadow: lit ? `0 0 24px ${flashColor}${glowAlpha}` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Bar({ width = "80%", opacity = 0.1 }: { width?: number | string; opacity?: number }) {
  return (
    <div
      style={{
        height: 2,
        width,
        backgroundColor: `rgba(255,255,255,${opacity})`,
        borderRadius: 2,
        marginBottom: 7,
      }}
    />
  )
}

function RegionLabel({
  text,
  flash,
  flashColor,
}: {
  text: string
  flash: number
  flashColor: string
}) {
  return (
    <div
      style={{
        fontSize: 8,
        fontFamily: MONO,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: flash > 0.15 ? flashColor + "cc" : "rgba(255,255,255,0.2)",
      }}
    >
      {text}
    </div>
  )
}

// ── Composition ───────────────────────────────────────────────────────────────
function Composition({ locale }: CompositionProps) {
  const i18n = t[locale]
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  void spring({ fps, frame: 0, config: { damping: 14, stiffness: 110 } })

  const badOp = clamp(frame, 0, 22) * clamp(frame, 108, 128, 1, 0)
  const goodOp = clamp(frame, 138, 158)
  const isGood = frame >= 138

  // BAD: all three regions flash at frame 48
  const flashBad = frame >= 48 ? clamp(frame, 48, 68) * clamp(frame, 85, 100, 1, 0) : 0
  const warningIn = frame >= 85 ? clamp(frame, 85, 98) * clamp(frame, 108, 120, 1, 0) : 0

  // GOOD: only UserCard flashes at frame 185
  const flashGood = frame >= 185 ? clamp(frame, 185, 208) * clamp(frame, 228, 244, 1, 0) : 0
  const successIn = frame >= 244 ? clamp(frame, 244, 258) : 0

  return (
    <AbsoluteFill style={{ backgroundColor: BG, display: "flex", flexDirection: "row" }}>
      {/* ── Badge ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "4px 14px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: MONO,
          backgroundColor: isGood ? `${GOOD}18` : `${BAD}18`,
          color: isGood ? GOOD : BAD,
          border: `1px solid ${isGood ? GOOD : BAD}40`,
          opacity: isGood ? goodOp : badOp,
        }}
      >
        {isGood ? i18n.badgeGood : i18n.badgeBad}
      </div>

      {/* ── LEFT: Code panel ──────────────────────────────────── */}
      <div
        style={{
          width: "50%",
          position: "relative",
          borderRight: `1px solid ${BORDER}`,
          padding: "52px 0 20px",
          overflow: "hidden",
        }}
      >
        {/* BAD code — prop drilling chain */}
        <div
          style={{
            opacity: badOp,
            position: "absolute",
            left: 28,
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: BAD,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: BAD,
                display: "inline-block",
              }}
            />
            {i18n.labelBad}
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.025)",
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              padding: "14px 16px",
              fontSize: 11.5,
              lineHeight: 1.8,
              fontFamily: MONO,
            }}
          >
            <div style={{ color: BLUE }}>{"function App() {"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"const [user, setUser] ="}</div>
            <div style={{ paddingLeft: 14 }}>
              <span style={{ color: KW }}>{"  useState(...)"}</span>
              <span style={{ color: `${BAD}88`, fontSize: 10 }}>{" " + i18n.commentBad}</span>
            </div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"return ("}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"<Layout user={user} />"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{")"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
            <div style={{ color: MUTED, marginTop: 4 }}>{"function Layout({ user }) {"}</div>
            <div style={{ color: BLUE, paddingLeft: 14 }}>{"return <Sidebar user={user} />"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
            <div style={{ color: `${BAD}66`, fontSize: 10, marginTop: 6 }}>{i18n.chainLine}</div>
          </div>
        </div>

        {/* GOOD code — Context */}
        <div
          style={{
            opacity: goodOp,
            position: "absolute",
            left: 28,
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: GOOD,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: GOOD,
                display: "inline-block",
              }}
            />
            {i18n.labelGood}
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.025)",
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              padding: "14px 16px",
              fontSize: 11.5,
              lineHeight: 1.8,
              fontFamily: MONO,
            }}
          >
            <div style={{ color: BLUE }}>{"function App() {"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"const [user] = useState(...)"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"return ("}</div>
            <div style={{ color: KW, paddingLeft: 28 }}>{"<UserCtx.Provider value={user}>"}</div>
            <div style={{ color: BLUE, paddingLeft: 42 }}>{"<Layout />"}</div>
            <div style={{ color: KW, paddingLeft: 28 }}>{"</UserCtx.Provider>"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{")"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
            <div style={{ color: `${GOOD}66`, fontSize: 10, marginTop: 6 }}>
              {i18n.contextLabel}
            </div>
            <div style={{ fontSize: 11.5 }}>
              <span style={{ color: MUTED }}>{"const user = "}</span>
              <span style={{ color: KW }}>{"useContext(UserCtx)"}</span>
              <span style={{ color: `${GOOD}88`, fontSize: 10 }}>{" " + i18n.commentGood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Page layout mockup ─────────────────────────── */}
      <div style={{ width: "50%", position: "relative", overflow: "hidden" }}>
        {/* ── BAD phase ──────────────────────────────────────── */}
        <div style={{ opacity: badOp, position: "absolute", inset: 0 }}>
          {/* App outer frame */}
          <div
            style={{
              position: "absolute",
              top: 44,
              left: 30,
              width: 390,
              height: 322,
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              pointerEvents: "none",
              zIndex: 4,
            }}
          />
          {/* App tab on border */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 44,
              fontSize: 7.5,
              fontFamily: MONO,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              backgroundColor: BG,
              padding: "0 6px",
            }}
          >
            App
          </div>

          {/* Layout region — outermost, flashes red */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{ top: 60, left: 38, width: 374, height: 290, borderRadius: 7 }}
          >
            <div style={{ padding: "6px 10px 0" }}>
              <RegionLabel text="Layout" flash={flashBad} flashColor={BAD} />
            </div>
          </Region>

          {/* Sidebar region — left column, flashes red */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{ top: 76, left: 46, width: 86, height: 258 }}
          >
            <div style={{ padding: "8px 8px 0" }}>
              <RegionLabel text="Sidebar" flash={flashBad} flashColor={BAD} />
              <div style={{ marginTop: 10 }}>
                <Bar width="85%" />
                <Bar width="68%" />
                <Bar width="76%" />
                <Bar width="60%" />
              </div>
            </div>
          </Region>

          {/* UserCard region — content area, flashes red */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{ top: 108, left: 148, width: 240, height: 76, borderRadius: 6 }}
          >
            <div style={{ padding: "8px 10px 0" }}>
              <RegionLabel text="UserCard" flash={flashBad} flashColor={BAD} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Bar width={80} opacity={0.12} />
                  <Bar width={55} opacity={0.08} />
                </div>
              </div>
            </div>
          </Region>

          {/* Content lines below UserCard */}
          <div style={{ position: "absolute", top: 198, left: 158, opacity: 0.07 }}>
            <Bar width={175} />
            <Bar width={140} />
            <Bar width={160} />
          </div>

          {/* Warning */}
          {warningIn > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 30,
                right: 30,
                padding: "7px 12px",
                backgroundColor: `${BAD}0e`,
                borderRadius: 7,
                border: `1px solid ${BAD}2e`,
                fontSize: 10.5,
                color: BAD,
                fontFamily: MONO,
                opacity: warningIn,
                zIndex: 10,
              }}
            >
              {i18n.warning}
            </div>
          )}
        </div>

        {/* ── GOOD phase ─────────────────────────────────────── */}
        <div style={{ opacity: goodOp, position: "absolute", inset: 0 }}>
          {/* App outer frame */}
          <div
            style={{
              position: "absolute",
              top: 44,
              left: 30,
              width: 390,
              height: 322,
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              pointerEvents: "none",
              zIndex: 4,
            }}
          />
          {/* App tab — shows Provider */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 44,
              fontSize: 7.5,
              fontFamily: MONO,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              backgroundColor: BG,
              padding: "0 6px",
            }}
          >
            App<span style={{ color: KW, marginLeft: 5 }}>· UserCtx.Provider</span>
          </div>

          {/* Layout region — no flash */}
          <Region
            flash={0}
            flashColor={GOOD}
            style={{ top: 60, left: 38, width: 374, height: 290, borderRadius: 7 }}
          >
            <div style={{ padding: "6px 10px 0" }}>
              <RegionLabel text="Layout" flash={0} flashColor={GOOD} />
            </div>
          </Region>

          {/* Sidebar region — no flash */}
          <Region flash={0} flashColor={GOOD} style={{ top: 76, left: 46, width: 86, height: 258 }}>
            <div style={{ padding: "8px 8px 0" }}>
              <RegionLabel text="Sidebar" flash={0} flashColor={GOOD} />
              <div style={{ marginTop: 10 }}>
                <Bar width="85%" />
                <Bar width="68%" />
                <Bar width="76%" />
                <Bar width="60%" />
              </div>
            </div>
          </Region>

          {/* UserCard region — flashes green */}
          <Region
            flash={flashGood}
            flashColor={GOOD}
            style={{ top: 108, left: 148, width: 240, height: 76, borderRadius: 6 }}
          >
            <div style={{ padding: "8px 10px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <RegionLabel text="UserCard" flash={flashGood} flashColor={GOOD} />
                <div
                  style={{
                    fontSize: 8,
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: flashGood > 0.15 ? `${KW}cc` : "rgba(255,255,255,0.15)",
                  }}
                >
                  useContext
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Bar width={80} opacity={0.12} />
                  <Bar width={55} opacity={0.08} />
                </div>
              </div>
            </div>
          </Region>

          {/* Content lines */}
          <div style={{ position: "absolute", top: 198, left: 158, opacity: 0.07 }}>
            <Bar width={175} />
            <Bar width={140} />
            <Bar width={160} />
          </div>

          {/* Success */}
          {successIn > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 30,
                right: 30,
                padding: "7px 12px",
                backgroundColor: `${GOOD}0e`,
                borderRadius: 7,
                border: `1px solid ${GOOD}2e`,
                fontSize: 10.5,
                color: GOOD,
                fontFamily: MONO,
                opacity: successIn,
                zIndex: 10,
              }}
            >
              {i18n.success}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Player: any = dynamic(() => import("@remotion/player").then((m) => ({ default: m.Player })), {
  ssr: false,
})

export function PropDrillingAnimation() {
  const { locale } = useLocaleRouter()
  const safeLocale = (locale as Locale) in t ? (locale as Locale) : "es"
  const playerRef = useRef<PlayerRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) playerRef.current?.play()
      },
      { threshold: 0.3 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef}>
      <div
        style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Player
          ref={playerRef}
          component={Composition as React.ComponentType<CompositionProps>}
          inputProps={{ locale: safeLocale }}
          durationInFrames={270}
          fps={30}
          compositionWidth={900}
          compositionHeight={420}
          style={{ width: "100%" }}
          controls
          loop
          acknowledgeRemotionLicense
          playbackRate={0.65}
          showVolumeControls={false}
        />
      </div>
    </div>
  )
}
