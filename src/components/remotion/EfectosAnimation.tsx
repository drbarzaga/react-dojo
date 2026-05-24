"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import type { PlayerRef } from "@remotion/player"
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion"
import { useLocaleRouter } from "@/hooks/use-locale-router"

// ── i18n ──────────────────────────────────────────────────────────────────────
type Locale = "en" | "es"
interface CompositionProps {
  locale: Locale
}

const t = {
  es: {
    badgeBad: "✗ useEffect innecesario",
    badgeGood: "✓ render directo",
    labelBad: "Antipatrón",
    labelGood: "Correcto",
    commentExtraRender: " // render extra",
    commentInRender: " // en render",
    node1: "Estado cambia",
    node2sub: "(datos obsoletos)",
    node3: "useEffect ejecuta",
    node4sub: "(ahora sí actualizado)",
    warning: "⚠ Render doble — UI muestra estado stale",
    gNode2: "Render único",
    gNode3: "UI actualizada ✓",
    success: "✓ Un solo render — siempre fresco",
  },
  en: {
    badgeBad: "✗ unnecessary useEffect",
    badgeGood: "✓ direct render",
    labelBad: "Anti-pattern",
    labelGood: "Correct",
    commentExtraRender: " // extra render",
    commentInRender: " // in render",
    node1: "State changes",
    node2sub: "(stale data)",
    node3: "useEffect runs",
    node4sub: "(now updated)",
    warning: "⚠ Double render — UI shows stale state",
    gNode2: "Single render",
    gNode3: "UI updated ✓",
    success: "✓ Single render — always fresh",
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

// ── Flow node ─────────────────────────────────────────────────────────────────
function FlowNode({
  label,
  sublabel,
  color,
  opacity = 1,
  scale = 1,
}: {
  label: string
  sublabel?: string
  color: string
  opacity?: number
  scale?: number
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}45`,
        borderRadius: 8,
        padding: "8px 14px",
        backgroundColor: `${color}08`,
        fontFamily: MONO,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{sublabel}</div>
      )}
    </div>
  )
}

// ── Arrow down ────────────────────────────────────────────────────────────────
function ArrowDown({
  color,
  dashed,
  opacity = 1,
}: {
  color: string
  dashed?: boolean
  opacity?: number
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", opacity }}>
      <div
        style={{
          width: 1,
          height: 22,
          borderLeft: `1px ${dashed ? "dashed" : "solid"} ${color}50`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `5px solid ${color}80`,
          }}
        />
      </div>
    </div>
  )
}

// ── Composition ───────────────────────────────────────────────────────────────
function Composition({ locale }: CompositionProps) {
  const i18n = t[locale]
  const frame = useCurrentFrame()

  const badOp = clamp(frame, 0, 20) * clamp(frame, 108, 128, 1, 0)
  const goodOp = clamp(frame, 138, 158)

  // BAD flow: nodes appear sequentially
  const node1In = clamp(frame, 20, 35)
  const node2In = frame >= 45 ? clamp(frame, 45, 60) : 0
  const node3In = frame >= 65 ? clamp(frame, 65, 80) : 0
  const node4In = frame >= 80 ? clamp(frame, 80, 95) : 0

  // BAD warning pulse
  const warningIn = frame >= 75 ? clamp(frame, 75, 88) * clamp(frame, 98, 108, 1, 0) : 0

  // GOOD flow
  const gNode1 = frame >= 155 ? clamp(frame, 155, 168) : 0
  const gNode2 = frame >= 175 ? clamp(frame, 175, 188) : 0
  const gNode3 = frame >= 195 ? clamp(frame, 195, 208) : 0
  const successMsg = frame >= 222 ? clamp(frame, 222, 236) : 0

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
              {" [filtered, setFiltered] ="}
            </div>
            <div style={{ color: MUTED, paddingLeft: 18 }}>
              <span style={{ color: BLUE }}>useState</span>
              {"(items)"}
            </div>
            <div style={{ color: BAD, marginTop: 4 }}>
              <span style={{ color: KW }}>useEffect</span>
              {"(() => {"}
            </div>
            <div style={{ color: BAD, paddingLeft: 18 }}>
              {"setFiltered(items."}
              <span style={{ color: BLUE }}>filter</span>
              {"(fn))"}
            </div>
            <div style={{ color: BAD }}>
              {"}, [items, fn])"}
              <span style={{ color: `${BAD}60`, fontSize: 11 }}>{i18n.commentExtraRender}</span>
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
              {" [items, setItems] ="}
            </div>
            <div style={{ color: MUTED, paddingLeft: 18 }}>
              <span style={{ color: BLUE }}>useState</span>
              {"(data)"}
            </div>
            <div style={{ color: GOOD, marginTop: 4 }}>
              <span style={{ color: KW }}>const</span>
              {" filtered = items."}
              <span style={{ color: BLUE }}>filter</span>
              {"(fn)"}
              <span style={{ color: `${GOOD}70`, fontSize: 11 }}>{i18n.commentInRender}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Flow diagram ─────────────────────────────────── */}
      <div
        style={{
          width: "50%",
          padding: "52px 28px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BAD flow */}
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
            gap: 0,
          }}
        >
          <FlowNode label={i18n.node1} color={MUTED} opacity={node1In} />
          <ArrowDown color={MUTED} opacity={node2In} />
          <FlowNode
            label="Render #1"
            sublabel={i18n.node2sub}
            color={BAD}
            opacity={node2In}
            scale={0.97 + 0.03 * node2In}
          />
          <ArrowDown color={BAD} dashed opacity={node3In} />
          <FlowNode
            label={i18n.node3}
            color={BAD}
            opacity={node3In}
            scale={0.97 + 0.03 * node3In}
          />
          <ArrowDown color={BAD} dashed opacity={node4In} />
          <FlowNode
            label="setState → Render #2"
            sublabel={i18n.node4sub}
            color={BAD}
            opacity={node4In}
            scale={0.97 + 0.03 * node4In}
          />
          {frame >= 78 && (
            <div
              style={{
                marginTop: 8,
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

        {/* GOOD flow */}
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
            gap: 0,
          }}
        >
          <FlowNode label={i18n.node1} color={MUTED} opacity={gNode1} />
          <ArrowDown color={GOOD} opacity={gNode2} />
          <FlowNode
            label={i18n.gNode2}
            sublabel="filtered = items.filter(fn)"
            color={GOOD}
            opacity={gNode2}
            scale={0.97 + 0.03 * gNode2}
          />
          <ArrowDown color={GOOD} opacity={gNode3} />
          <FlowNode
            label={i18n.gNode3}
            color={GOOD}
            opacity={gNode3}
            scale={0.97 + 0.03 * gNode3}
          />
          {frame >= 222 && (
            <div
              style={{
                marginTop: 8,
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

export function EfectosAnimation() {
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
