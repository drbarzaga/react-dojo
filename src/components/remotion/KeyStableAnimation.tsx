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
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    warning: "⚠ React reutiliza nodos con key incorrecta",
    success: "✓ Cada elemento mantiene su identidad",
  },
  en: {
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    warning: "⚠ React reuses nodes with wrong key",
    success: "✓ Each element keeps its identity",
  },
} as const

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#0a0a0a"
const BAD = "#ef4444"
const GOOD = "#4ade80"
const TEXT = "rgba(255,255,255,0.82)"
const MUTED = "rgba(255,255,255,0.32)"
const BORDER = "rgba(255,255,255,0.07)"
const KW = "#c084fc"
const FN = "#60a5fa"
const ACCENT = "#facc15"

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
}

// ── List item ─────────────────────────────────────────────────────────────────
function Item({
  emoji,
  name,
  keyVal,
  variant = "neutral",
  opacity = 1,
  translateY = 0,
}: {
  emoji: string
  name: string
  keyVal: string
  variant?: "bad" | "good" | "neutral"
  opacity?: number
  translateY?: number
}) {
  const borderColor = variant === "bad" ? `${BAD}45` : variant === "good" ? `${GOOD}45` : BORDER
  const keyColor = variant === "bad" ? BAD : variant === "good" ? GOOD : ACCENT
  const bgColor =
    variant === "bad" ? `${BAD}08` : variant === "good" ? `${GOOD}08` : "rgba(255,255,255,0.025)"

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        backgroundColor: bgColor,
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        fontFamily: "Geist Mono, Courier New, monospace",
        fontSize: 13,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <span style={{ fontSize: 17, lineHeight: 1 }}>{emoji}</span>
      <span style={{ color: TEXT, flex: 1 }}>{name}</span>
      <span style={{ color: MUTED, fontSize: 11 }}>
        key=<span style={{ color: keyColor, fontWeight: 700 }}>"{keyVal}"</span>
      </span>
    </div>
  )
}

// ── Code panel ────────────────────────────────────────────────────────────────
function CodePanel({
  label,
  labelColor,
  lines,
  opacity,
}: {
  label: string
  labelColor: string
  lines: React.ReactNode[]
  opacity: number
}) {
  return (
    <div
      style={{
        opacity,
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
          color: labelColor,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "Geist Mono, Courier New, monospace",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: labelColor,
            display: "inline-block",
          }}
        />
        {label}
      </div>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.025)",
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
          padding: "14px 18px",
          fontSize: 13,
          lineHeight: 1.8,
          fontFamily: "Geist Mono, Courier New, monospace",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
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

  const insertBad = frame >= 52 ? sp(52) : 0
  const insertGood = frame >= 192 ? sp(192) : 0
  const confusion = clamp(frame, 76, 88) * clamp(frame, 95, 108, 1, 0)
  const successMsg = frame >= 218 ? clamp(frame, 218, 232) : 0

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
          fontFamily: "Geist Mono, Courier New, monospace",
          backgroundColor: isGood ? `${GOOD}18` : `${BAD}18`,
          color: isGood ? GOOD : BAD,
          border: `1px solid ${isGood ? GOOD : BAD}40`,
          opacity: isGood ? goodOp : badOp,
        }}
      >
        {isGood ? "✓ key={item.id}" : "✗ key={index}"}
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
        <CodePanel
          label={i18n.labelBad}
          labelColor={BAD}
          opacity={badOp}
          lines={[
            <span style={{ color: MUTED }}>
              {"items."}
              <span style={{ color: FN }}>map</span>
              {"((item, "}
              <span style={{ color: BAD, textDecoration: "underline wavy" }}>i</span>
              {") => ("}
            </span>,
            <span style={{ color: MUTED, paddingLeft: 18, display: "block" }}>
              <span style={{ color: KW }}>{"<Item"}</span>
              {" key="}
              <span style={{ color: BAD, textDecoration: "underline wavy", fontWeight: 700 }}>
                {"{i}"}
              </span>
              <span style={{ color: MUTED }}>{" ... />"}</span>
            </span>,
            <span style={{ color: MUTED }}>{"))"}</span>,
          ]}
        />
        <CodePanel
          label={i18n.labelGood}
          labelColor={GOOD}
          opacity={goodOp}
          lines={[
            <span style={{ color: MUTED }}>
              {"items."}
              <span style={{ color: FN }}>map</span>
              {"((item) => ("}
            </span>,
            <span style={{ color: MUTED, paddingLeft: 18, display: "block" }}>
              <span style={{ color: KW }}>{"<Item"}</span>
              {" key="}
              <span style={{ color: GOOD, fontWeight: 700 }}>{"{item.id}"}</span>
              <span style={{ color: MUTED }}>{" ... />"}</span>
            </span>,
            <span style={{ color: MUTED }}>{"))"}</span>,
          ]}
        />
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
        {/* BAD list */}
        <div
          style={{
            opacity: badOp,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            position: "absolute",
            left: 28,
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {frame >= 52 && (
            <Item
              emoji="🥭"
              name="Mango"
              keyVal="0"
              variant="bad"
              opacity={insertBad}
              translateY={-16 * (1 - insertBad)}
            />
          )}
          <Item
            emoji="🍎"
            name="Apple"
            keyVal={frame >= 52 ? "1" : "0"}
            variant={confusion > 0.4 ? "bad" : "neutral"}
          />
          <Item
            emoji="🍌"
            name="Banana"
            keyVal={frame >= 52 ? "2" : "1"}
            variant={confusion > 0.4 ? "bad" : "neutral"}
          />
          <Item emoji="🍒" name="Cherry" keyVal={frame >= 52 ? "3" : "2"} variant="neutral" />
          {frame >= 78 && (
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                backgroundColor: `${BAD}12`,
                borderRadius: 8,
                border: `1px solid ${BAD}30`,
                fontSize: 11,
                color: BAD,
                fontFamily: "Geist Mono, Courier New, monospace",
                opacity: confusion > 0 ? confusion : clamp(frame, 90, 106, 1, 0),
              }}
            >
              {i18n.warning}
            </div>
          )}
        </div>

        {/* GOOD list */}
        <div
          style={{
            opacity: goodOp,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            position: "absolute",
            left: 28,
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {frame >= 192 && (
            <Item
              emoji="🥭"
              name="Mango"
              keyVal="mango-4"
              variant="good"
              opacity={insertGood}
              translateY={-16 * (1 - insertGood)}
            />
          )}
          <Item emoji="🍎" name="Apple" keyVal="apple-1" variant="good" />
          <Item emoji="🍌" name="Banana" keyVal="banana-2" variant="good" />
          <Item emoji="🍒" name="Cherry" keyVal="cherry-3" variant="good" />
          {frame >= 218 && (
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                backgroundColor: `${GOOD}12`,
                borderRadius: 8,
                border: `1px solid ${GOOD}30`,
                fontSize: 11,
                color: GOOD,
                fontFamily: "Geist Mono, Courier New, monospace",
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

// ── Player (SSR-safe) ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Player: any = dynamic(() => import("@remotion/player").then((m) => ({ default: m.Player })), {
  ssr: false,
})

export function KeyStableAnimation() {
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
