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
    badgeBad: "✗ mutación directa",
    badgeGood: "✓ nueva referencia",
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    commentMuta: " // ← muta",
    commentSameRef: " // ← misma ref",
    commentNewArray: " // ← nuevo array",
    fruit1: "'Manzana'",
    fruit2: "'Banana'",
    fruit3push: "'Naranja' ← push()",
    fruit3: "'Naranja'",
    memBoxBad: "Mismo array (ref: 0x4a2f)",
    memBoxOriginal: "Array original (ref: 0x4a2f)",
    memBoxNew: "Nuevo array (ref: 0x8c1b)",
    detectorSame: "misma ref — no re-renderiza",
    detectorNew: "nueva ref — re-renderiza",
    detectorIdle: "observando...",
    warning: "⚠ Misma referencia — React no detecta el cambio",
    success: "✓ Nueva referencia — React re-renderiza correctamente",
  },
  en: {
    badgeBad: "✗ direct mutation",
    badgeGood: "✓ new reference",
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    commentMuta: " // ← mutates",
    commentSameRef: " // ← same ref",
    commentNewArray: " // ← new array",
    fruit1: "'Apple'",
    fruit2: "'Banana'",
    fruit3push: "'Orange' ← push()",
    fruit3: "'Orange'",
    memBoxBad: "Same array (ref: 0x4a2f)",
    memBoxOriginal: "Original array (ref: 0x4a2f)",
    memBoxNew: "New array (ref: 0x8c1b)",
    detectorSame: "same ref — no re-render",
    detectorNew: "new ref — re-renders",
    detectorIdle: "watching...",
    warning: "⚠ Same reference — React won't detect the change",
    success: "✓ New reference — React re-renders correctly",
  },
} as const

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

// ── Memory box ────────────────────────────────────────────────────────────────
function MemBox({
  label,
  items,
  color,
  opacity = 1,
  glowing,
}: {
  label: string
  items: string[]
  color: string
  opacity?: number
  glowing?: boolean
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}45`,
        borderRadius: 10,
        overflow: "hidden",
        opacity,
        boxShadow: glowing ? `0 0 16px ${color}25` : "none",
      }}
    >
      <div
        style={{
          backgroundColor: `${color}12`,
          padding: "6px 12px",
          borderBottom: `1px solid ${color}20`,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontFamily: MONO,
          }}
        >
          {label}
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            fontFamily: MONO,
            color: "rgba(255,255,255,0.75)",
            borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : "none",
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

// ── React detector ────────────────────────────────────────────────────────────
function ReactDetector({
  sees,
  opacity = 1,
  labels,
}: {
  sees: "same" | "new" | "idle"
  opacity?: number
  labels: { same: string; new: string; idle: string }
}) {
  const color = sees === "same" ? BAD : sees === "new" ? GOOD : MUTED
  const icon = sees === "same" ? "😶" : sees === "new" ? "👁" : "🔍"
  const label = sees === "same" ? labels.same : sees === "new" ? labels.new : labels.idle

  return (
    <div
      style={{
        border: `1px solid ${color}40`,
        borderRadius: 10,
        padding: "10px 14px",
        backgroundColor: `${color}08`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: MONO,
        opacity,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: 10,
            color,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 2,
          }}
        >
          React
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{label}</div>
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

  // BAD: mutation at frame 50
  const mutationIn = frame >= 50 ? sp(50) : 0
  const detectorBad = frame >= 65 ? clamp(frame, 65, 78) : 0
  const warningIn = frame >= 80 ? clamp(frame, 80, 92) * clamp(frame, 98, 108, 1, 0) : 0

  // GOOD: new array at frame 192
  const newArrayIn = frame >= 192 ? sp(192) : 0
  const detectorGood = frame >= 208 ? clamp(frame, 208, 220) : 0
  const successMsg = frame >= 225 ? clamp(frame, 225, 238) : 0

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
            <div style={{ color: MUTED }}>{"const agregar = () => {"}</div>
            <div style={{ color: BAD, paddingLeft: 18 }}>
              {"items."}
              <span style={{ color: BLUE }}>push</span>
              {"(nuevo)"}
              <span style={{ color: `${BAD}60`, fontSize: 11 }}>{i18n.commentMuta}</span>
            </div>
            <div style={{ color: BAD, paddingLeft: 18 }}>
              <span style={{ color: KW }}>setState</span>
              {"(items)"}
              <span style={{ color: `${BAD}60`, fontSize: 11 }}>{i18n.commentSameRef}</span>
            </div>
            <div style={{ color: MUTED }}>{"}"}</div>
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
            <div style={{ color: MUTED }}>{"const agregar = () => {"}</div>
            <div style={{ color: GOOD, paddingLeft: 18 }}>
              <span style={{ color: KW }}>setState</span>
              {"(prev => ["}
            </div>
            <div style={{ color: GOOD, paddingLeft: 36 }}>
              {"...prev, nuevo"}
              <span style={{ color: `${GOOD}70`, fontSize: 11 }}>{i18n.commentNewArray}</span>
            </div>
            <div style={{ color: GOOD, paddingLeft: 18 }}>{"])"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Memory diagram ───────────────────────────────── */}
      <div
        style={{
          width: "50%",
          padding: "52px 28px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BAD */}
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
          <MemBox
            label={i18n.memBoxBad}
            items={[i18n.fruit1, i18n.fruit2, frame >= 52 ? i18n.fruit3push : ""]}
            color={BAD}
            glowing={mutationIn > 0.5}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
              opacity: detectorBad,
            }}
          >
            <div style={{ height: 1, flex: 1, backgroundColor: BAD, opacity: 0.3 }} />
            <span style={{ fontSize: 10, color: BAD }}>setState(ref: 0x4a2f)</span>
            <div
              style={{
                height: 0,
                width: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `5px solid ${BAD}60`,
              }}
            />
          </div>
          <ReactDetector
            sees={detectorBad > 0.5 ? "same" : "idle"}
            opacity={Math.max(detectorBad, 0.3)}
            labels={{ same: i18n.detectorSame, new: i18n.detectorNew, idle: i18n.detectorIdle }}
          />
          {frame >= 82 && (
            <div
              style={{
                padding: "7px 12px",
                backgroundColor: `${BAD}12`,
                borderRadius: 8,
                border: `1px solid ${BAD}30`,
                fontSize: 11,
                color: BAD,
                fontFamily: MONO,
                opacity: warningIn,
              }}
            >
              {i18n.warning}
            </div>
          )}
        </div>

        {/* GOOD */}
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
          <MemBox label={i18n.memBoxOriginal} items={[i18n.fruit1, i18n.fruit2]} color={MUTED} />
          {frame >= 192 && (
            <MemBox
              label={i18n.memBoxNew}
              items={[i18n.fruit1, i18n.fruit2, i18n.fruit3]}
              color={GOOD}
              opacity={newArrayIn}
              glowing={detectorGood > 0.5}
            />
          )}
          {frame >= 208 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: MONO,
                opacity: detectorGood,
              }}
            >
              <div style={{ height: 1, flex: 1, backgroundColor: GOOD, opacity: 0.3 }} />
              <span style={{ fontSize: 10, color: GOOD }}>setState(ref: 0x8c1b)</span>
              <div
                style={{
                  height: 0,
                  width: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `5px solid ${GOOD}60`,
                }}
              />
            </div>
          )}
          <ReactDetector
            sees={detectorGood > 0.7 ? "new" : "idle"}
            opacity={frame >= 208 ? Math.max(detectorGood, 0.3) : 0.3}
            labels={{ same: i18n.detectorSame, new: i18n.detectorNew, idle: i18n.detectorIdle }}
          />
          {frame >= 225 && (
            <div
              style={{
                padding: "7px 12px",
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

export function InmutabilidadAnimation() {
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
