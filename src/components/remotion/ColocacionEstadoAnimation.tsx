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
    badgeBad: "✗ estado demasiado arriba",
    badgeGood: "✓ estado colocado",
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    commentBad: "// ← estado aquí",
    commentGood: "// ← colocado",
    hookShort: "useState(false)",
    commentBadShort: " ← estado aquí",
    commentGoodShort: " ← colocado",
    warning: "⚠ Header y Sidebar re-renderizan sin usar el estado",
    success: "✓ Solo Dropdown re-renderiza — Header y Sidebar no se tocan",
  },
  en: {
    badgeBad: "✗ state too high up",
    badgeGood: "✓ colocated state",
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    commentBad: "// ← state here",
    commentGood: "// ← colocated",
    hookShort: "useState(false)",
    commentBadShort: " ← state here",
    commentGoodShort: " ← colocated",
    warning: "⚠ Header and Sidebar re-render without using the state",
    success: "✓ Only Dropdown re-renders — Header and Sidebar are untouched",
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

// ── UI region (flashing layout block) ────────────────────────────────────────
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

// ── Placeholder bar (skeleton line) ──────────────────────────────────────────
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

// ── Region label ──────────────────────────────────────────────────────────────
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

  void spring({ fps, frame: 0, config: { damping: 14, stiffness: 110 } }) // keep remotion import alive

  const badOp = clamp(frame, 0, 22) * clamp(frame, 108, 128, 1, 0)
  const goodOp = clamp(frame, 138, 158)
  const isGood = frame >= 138

  // BAD: all regions flash at frame 48
  const flashBad = frame >= 48 ? clamp(frame, 48, 68) * clamp(frame, 85, 100, 1, 0) : 0
  const warningIn = frame >= 85 ? clamp(frame, 85, 98) * clamp(frame, 108, 120, 1, 0) : 0

  // GOOD: only Dropdown flashes at frame 185
  const flashGood = frame >= 185 ? clamp(frame, 185, 208) * clamp(frame, 228, 244, 1, 0) : 0
  const successIn = frame >= 244 ? clamp(frame, 244, 258) : 0

  // ── Layout positions (within 450px right panel) ──────────────────────────
  // App frame:  top=42, left=20, w=410, h=344, r=10
  // Header:     top=42, left=20, w=410, h=60
  // Sidebar:    top=101, left=20, w=96, h=285
  // Dropdown:   top=124, left=136, w=236, h=46
  // Content bg: top=101, left=115, w=315, h=285

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
        {/* BAD code */}
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
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"const [open, setOpen] ="}</div>
            <div style={{ paddingLeft: 14 }}>
              <span style={{ color: KW }}>{"  useState(false)"}</span>
              <span style={{ color: `${BAD}88`, fontSize: 10 }}>{" " + i18n.commentBad}</span>
            </div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>&nbsp;</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"return ("}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"<Header />"}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"<Sidebar />"}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"<Dropdown open={open}"}</div>
            <div style={{ color: BLUE, paddingLeft: 42 }}>{"setOpen={setOpen} />"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{")"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
          </div>
        </div>

        {/* GOOD code */}
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
            <div style={{ color: BLUE }}>{"function Dropdown() {"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"const [open, setOpen] ="}</div>
            <div style={{ paddingLeft: 14 }}>
              <span style={{ color: KW }}>{"  useState(false)"}</span>
              <span style={{ color: `${GOOD}88`, fontSize: 10 }}>{" " + i18n.commentGood}</span>
            </div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>&nbsp;</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{"return ("}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"<div onClick={toggle}>"}</div>
            <div style={{ color: BLUE, paddingLeft: 42 }}>{"{open && <Menu />}"}</div>
            <div style={{ color: BLUE, paddingLeft: 28 }}>{"</div>"}</div>
            <div style={{ color: MUTED, paddingLeft: 14 }}>{")"}</div>
            <div style={{ color: MUTED }}>{"}"}</div>
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
              top: 62,
              left: 44,
              width: 358,
              height: 272,
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
              top: 54,
              left: 58,
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
            App<span style={{ color: KW, marginLeft: 5 }}>· useState</span>
          </div>

          {/* Header */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{
              top: 62,
              left: 44,
              width: 358,
              height: 46,
              borderRadius: "10px 10px 0 0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                padding: "0 14px",
                gap: 8,
              }}
            >
              <RegionLabel text="Header" flash={flashBad} flashColor={BAD} />
              <div style={{ flex: 1 }} />
              <Bar width={22} opacity={0.13} />
              <Bar width={18} opacity={0.13} />
              <Bar width={20} opacity={0.13} />
            </div>
          </Region>

          {/* Sidebar */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{
              top: 107,
              left: 44,
              width: 78,
              height: 227,
              borderRadius: "0 0 0 10px",
              borderTop: "none",
            }}
          >
            <div style={{ padding: "10px 8px 0" }}>
              <RegionLabel text="Sidebar" flash={flashBad} flashColor={BAD} />
              <div style={{ marginTop: 10 }}>
                <Bar width="85%" />
                <Bar width="68%" />
                <Bar width="76%" />
              </div>
            </div>
          </Region>

          {/* Content area bg */}
          <div
            style={{
              position: "absolute",
              top: 107,
              left: 121,
              width: 281,
              height: 227,
              border: `1px solid ${BORDER}`,
              borderTop: "none",
              borderLeft: "none",
              borderRadius: "0 0 10px 0",
              backgroundColor: "rgba(255,255,255,0.012)",
            }}
          />

          {/* Dropdown */}
          <Region
            flash={flashBad}
            flashColor={BAD}
            style={{
              top: 126,
              left: 144,
              width: 196,
              height: 38,
              borderRadius: 7,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 6,
                fontFamily: MONO,
              }}
            >
              <RegionLabel text="Dropdown" flash={flashBad} flashColor={BAD} />
              <span
                style={{
                  fontSize: 8,
                  color: flashBad > 0.15 ? `${BAD}bb` : "rgba(255,255,255,0.18)",
                }}
              >
                ▼
              </span>
            </div>
          </Region>

          {/* Content lines */}
          <div style={{ position: "absolute", top: 178, left: 144, opacity: 0.08 }}>
            <Bar width={180} />
            <Bar width={140} />
            <Bar width={165} />
          </div>

          {/* Warning */}
          {warningIn > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 44,
                right: 44,
                padding: "7px 12px",
                backgroundColor: `${BAD}0e`,
                borderRadius: 7,
                border: `1px solid ${BAD}2e`,
                fontSize: 10.5,
                color: BAD,
                fontFamily: MONO,
                opacity: warningIn,
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
              top: 62,
              left: 44,
              width: 358,
              height: 272,
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
              top: 54,
              left: 58,
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

          {/* Header (no flash) */}
          <Region
            flash={0}
            flashColor={GOOD}
            style={{
              top: 62,
              left: 44,
              width: 358,
              height: 46,
              borderRadius: "10px 10px 0 0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                padding: "0 14px",
                gap: 8,
              }}
            >
              <RegionLabel text="Header" flash={0} flashColor={GOOD} />
              <div style={{ flex: 1 }} />
              <Bar width={22} opacity={0.13} />
              <Bar width={18} opacity={0.13} />
              <Bar width={20} opacity={0.13} />
            </div>
          </Region>

          {/* Sidebar (no flash) */}
          <Region
            flash={0}
            flashColor={GOOD}
            style={{
              top: 107,
              left: 44,
              width: 78,
              height: 227,
              borderRadius: "0 0 0 10px",
              borderTop: "none",
            }}
          >
            <div style={{ padding: "10px 8px 0" }}>
              <RegionLabel text="Sidebar" flash={0} flashColor={GOOD} />
              <div style={{ marginTop: 10 }}>
                <Bar width="85%" />
                <Bar width="68%" />
                <Bar width="76%" />
              </div>
            </div>
          </Region>

          {/* Content area bg */}
          <div
            style={{
              position: "absolute",
              top: 107,
              left: 121,
              width: 281,
              height: 227,
              border: `1px solid ${BORDER}`,
              borderTop: "none",
              borderLeft: "none",
              borderRadius: "0 0 10px 0",
              backgroundColor: "rgba(255,255,255,0.012)",
            }}
          />

          {/* Dropdown (flashes green + shows colocated useState) */}
          <Region
            flash={flashGood}
            flashColor={GOOD}
            style={{
              top: 120,
              left: 144,
              width: 196,
              height: 50,
              borderRadius: 7,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
                fontFamily: MONO,
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  color: flashGood > 0.15 ? KW : "rgba(255,255,255,0.18)",
                  fontWeight: 700,
                }}
              >
                {i18n.hookShort}
                <span style={{ color: flashGood > 0.15 ? `${GOOD}aa` : "rgba(255,255,255,0.12)" }}>
                  {i18n.commentGoodShort}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <RegionLabel text="Dropdown" flash={flashGood} flashColor={GOOD} />
                <span
                  style={{
                    fontSize: 8,
                    color: flashGood > 0.15 ? `${GOOD}bb` : "rgba(255,255,255,0.18)",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>
          </Region>

          {/* Content lines */}
          <div style={{ position: "absolute", top: 184, left: 144, opacity: 0.08 }}>
            <Bar width={180} />
            <Bar width={140} />
            <Bar width={165} />
          </div>

          {/* Success */}
          {successIn > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 44,
                right: 44,
                padding: "7px 12px",
                backgroundColor: `${GOOD}0e`,
                borderRadius: 7,
                border: `1px solid ${GOOD}2e`,
                fontSize: 10.5,
                color: GOOD,
                fontFamily: MONO,
                opacity: successIn,
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

export function ColocacionEstadoAnimation() {
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
