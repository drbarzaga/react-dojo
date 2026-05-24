"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import type { PlayerRef } from "@remotion/player"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { useLocaleRouter } from "@/hooks/use-locale-router"

// ── i18n ──────────────────────────────────────────────────────────────────────
type Locale = "en" | "es"
interface CompositionProps {
  locale: Locale
}

const t = {
  es: {
    badgeBad: "✗ estado duplicado",
    badgeGood: "✓ estado derivado",
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    commentRedundant: "// ← redundante",
    commentDerived: "// ← derivado",
    syncArrow: "⚠ sync manual",
    desynced: "❌ desincronizado",
    warning: "⚠ Si olvidas actualizar uno → bug silencioso",
    alwaysInSync: "siempre sincronizado",
    success: "✓ Una fuente de verdad — siempre en sync",
  },
  en: {
    badgeBad: "✗ duplicated state",
    badgeGood: "✓ derived state",
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    commentRedundant: "// ← redundant",
    commentDerived: "// ← derived",
    syncArrow: "⚠ manual sync",
    desynced: "❌ out of sync",
    warning: "⚠ Forget to update one → silent bug",
    alwaysInSync: "always in sync",
    success: "✓ Single source of truth — always in sync",
  },
} as const

const BG = "#0a0a0a"
const BAD = "#ef4444"
const GOOD = "#4ade80"
const MUTED = "rgba(255,255,255,0.32)"
const BORDER = "rgba(255,255,255,0.07)"
const KW = "#c084fc"
const ACCENT = "#facc15"
const MONO = "Geist Mono, Courier New, monospace"

function clamp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
}

// ── State box component ───────────────────────────────────────────────────────
function StateBox({
  label,
  value,
  variant,
  opacity = 1,
  scale = 1,
}: {
  label: string
  value: string
  variant: "bad" | "good" | "derived"
  opacity?: number
  scale?: number
}) {
  const borderColor =
    variant === "bad" ? `${BAD}50` : variant === "good" ? `${GOOD}50` : `${ACCENT}50`
  const bgColor = variant === "bad" ? `${BAD}08` : variant === "good" ? `${GOOD}08` : `${ACCENT}08`
  const accentColor = variant === "bad" ? BAD : variant === "good" ? GOOD : ACCENT
  const tag = variant === "derived" ? "const" : "useState"

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "12px 16px",
        backgroundColor: bgColor,
        fontFamily: MONO,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: accentColor,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 6,
        }}
      >
        {tag}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
        <span style={{ color: KW }}>const</span>
        {" ["}
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{label}</span>
        {"] = "}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>"{value}"</div>
    </div>
  )
}

// ── Arrow ─────────────────────────────────────────────────────────────────────
function SyncArrow({
  color,
  label,
  opacity = 1,
}: {
  color: string
  label: string
  opacity?: number
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, opacity, fontFamily: MONO }}>
      <div style={{ height: 1, flex: 1, backgroundColor: color, opacity: 0.5 }} />
      <span style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</span>
      <div style={{ height: 1, flex: 1, backgroundColor: color, opacity: 0.5 }} />
    </div>
  )
}

// ── Composition ───────────────────────────────────────────────────────────────
function Composition({ locale }: CompositionProps) {
  const i18n = t[locale]
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sp = (from: number) =>
    spring({ fps, frame: Math.max(0, frame - from), config: { damping: 14, stiffness: 110 } })

  const badOp = clamp(frame, 0, 20) * clamp(frame, 108, 128, 1, 0)
  const goodOp = clamp(frame, 138, 158)

  // BAD: second state appears at frame 45, sync problem at frame 70
  const secondStateIn = frame >= 45 ? sp(45) : 0
  const syncProblem = frame >= 70 ? clamp(frame, 70, 85) * clamp(frame, 95, 108, 1, 0) : 0

  // GOOD: derived value at frame 195
  const derivedIn = frame >= 195 ? sp(195) : 0
  const successMsg = frame >= 220 ? clamp(frame, 220, 235) : 0

  const isGood = frame >= 138

  return (
    <AbsoluteFill style={{ backgroundColor: BG, display: "flex", flexDirection: "row" }}>
      {/* Top badge */}
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

      {/* ── LEFT: Code ─────────────────────────────────────────── */}
      <div
        style={{
          width: "50%",
          position: "relative",
          borderRight: `1px solid ${BORDER}`,
          padding: "52px 0 20px",
          overflow: "hidden",
        }}
      >
        {/* BAD code */}
        <div
          style={{
            opacity: badOp,
            position: "absolute",
            left: 28,
            right: 28,
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
              padding: "14px 18px",
              fontSize: 12,
              lineHeight: 1.85,
              fontFamily: MONO,
            }}
          >
            <div style={{ color: MUTED }}>
              <span style={{ color: KW }}>const</span>
              {" [fullName, setFullName] ="}
            </div>
            <div style={{ color: MUTED, paddingLeft: 18 }}>
              <span style={{ color: "#60a5fa" }}>useState</span>
              {"('')"}
            </div>
            <div style={{ color: BAD, marginTop: 4 }}>
              <span style={{ color: KW }}>const</span>
              {" [firstName, setFirstName] ="}
            </div>
            <div style={{ color: BAD, paddingLeft: 18 }}>
              <span style={{ color: "#60a5fa" }}>useState</span>
              {"('')"}{" "}
              <span style={{ color: "rgba(239,68,68,0.5)", fontSize: 11 }}>
                {i18n.commentRedundant}
              </span>
            </div>
          </div>
        </div>

        {/* GOOD code */}
        <div
          style={{
            opacity: goodOp,
            position: "absolute",
            left: 28,
            right: 28,
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
              padding: "14px 18px",
              fontSize: 12,
              lineHeight: 1.85,
              fontFamily: MONO,
            }}
          >
            <div style={{ color: MUTED }}>
              <span style={{ color: KW }}>const</span>
              {" [fullName, setFullName] ="}
            </div>
            <div style={{ color: MUTED, paddingLeft: 18 }}>
              <span style={{ color: "#60a5fa" }}>useState</span>
              {"('')"}
            </div>
            <div style={{ color: GOOD, marginTop: 4 }}>
              <span style={{ color: KW }}>const</span>
              {" firstName ="}
            </div>
            <div style={{ color: GOOD, paddingLeft: 18 }}>
              {"fullName."}
              <span style={{ color: "#60a5fa" }}>split</span>
              {"(' ')[0]"}{" "}
              <span style={{ color: `${GOOD}70`, fontSize: 11 }}>{i18n.commentDerived}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Diagram ─────────────────────────────────────── */}
      <div
        style={{
          width: "50%",
          padding: "52px 28px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BAD: two state boxes */}
        <div
          style={{
            opacity: badOp,
            position: "absolute",
            left: 28,
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <StateBox label="fullName" value="Dayan Perez" variant="bad" />
          <SyncArrow color={BAD} label={i18n.syncArrow} opacity={secondStateIn} />
          <StateBox
            label="firstName"
            value={syncProblem > 0.5 ? i18n.desynced : "Dayan"}
            variant="bad"
            opacity={secondStateIn}
            scale={0.97 + 0.03 * secondStateIn}
          />
          {frame >= 72 && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: `${BAD}12`,
                borderRadius: 8,
                border: `1px solid ${BAD}30`,
                fontSize: 11,
                color: BAD,
                fontFamily: MONO,
                opacity: syncProblem,
              }}
            >
              {i18n.warning}
            </div>
          )}
        </div>

        {/* GOOD: single state + derived */}
        <div
          style={{
            opacity: goodOp,
            position: "absolute",
            left: 28,
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <StateBox label="fullName" value="Dayan Perez" variant="good" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
              opacity: derivedIn,
            }}
          >
            <div style={{ height: 1, flex: 1, backgroundColor: GOOD, opacity: 0.4 }} />
            <span style={{ fontSize: 10, color: GOOD, fontWeight: 600 }}>{i18n.alwaysInSync}</span>
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: `6px solid ${GOOD}60`,
              }}
            />
          </div>
          <StateBox
            label="firstName"
            value="Dayan"
            variant="derived"
            opacity={derivedIn}
            scale={0.97 + 0.03 * derivedIn}
          />
          {frame >= 220 && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: `${GOOD}12`,
                borderRadius: 8,
                border: `1px solid ${GOOD}30`,
                fontSize: 11,
                color: GOOD,
                fontFamily: MONO,
                opacity: successMsg,
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

export function EstadoDerivadoAnimation() {
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
          compositionHeight={380}
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
