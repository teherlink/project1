import React from 'react'

export default function TransparencyVisual({ size = 420 }: { size?: number }) {
  const s = size
  const r = s / 2
  const c = r
  const iconRadius = Math.round(s * 0.072)
  const iconSize = Math.round(s * 0.12)
  const leftIconX = Math.round(c * 0.7)
  const leftIconY = Math.round(c * 0.73)
  const rightIconX = Math.round(c * 1.3)
  const rightIconY = Math.round(c * 1.3)

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="transparency visual">
      <defs>
        <style>{`.small-icon{filter:none}`}</style>
      </defs>

      {/* light background circle */}
      <circle cx={c} cy={c} r={r} fill="rgba(14,165,164,0.08)" />

      {/* top-left quarter */}
      <path
        d={`M ${c} ${c} L ${c} 0 A ${r} ${r} 0 0 0 0 ${c} Z`}
        fill="#15b8ae"
      />

      {/* bottom-right quarter */}
      <path d={`M ${c} ${c} L ${s} ${c} A ${r} ${r} 0 0 1 ${c} ${s} Z`} fill="#0ea5a4" />

      {/* left icon circle and tether logo */}
      <circle cx={leftIconX} cy={leftIconY} r={iconRadius} fill="#ffffff" />
      <image
        href="/tether-usdt-logo.svg"
        x={leftIconX - iconSize / 2}
        y={leftIconY - iconSize / 2}
        width={iconSize}
        height={iconSize}
      />

      {/* bottom-right icon circle and dollar sign */}
      <circle cx={rightIconX} cy={rightIconY} r={iconRadius} fill="#ffffff" />
      <text
        x={rightIconX}
        y={rightIconY + iconRadius * 0.35}
        textAnchor="middle"
        fontSize={Math.round(s * 0.11)}
        fill="#0ea5a4"
        fontWeight={700}
      >
        $
      </text>
    </svg>
  )
}
