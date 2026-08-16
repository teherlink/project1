'use client';

import React from 'react';

type Props = {
  count?: number;
  size?: number;
  radius?: number;
  initialRotation?: number; // degrees
  speed?: number; // seconds per revolution
};

export default function ProtocolOrbit({
  count = 8,
  size = 320,
  radius = 130,
  initialRotation = 315,
  speed = 64,
}: Props): JSX.Element {
  const items = Array.from({ length: count }).map((_, i) => i);

  const preferredPaths = Array.from({ length: count }).map((_, i) => `/protocols/protocol-${i + 1}.svg`);
  const defaultIcons = ['/eth.svg', '/sol.svg', '/tri.svg', '/cc.svg', '/moon.svg', '/ton.svg', '/unity.svg', '/cc.svg'];
  const iconPaths = preferredPaths; // try preferred first; onError will fall back to defaultIcons

  const centerSize = Math.max(64, Math.round(size * 0.22));

  return (
    <div style={{ width: '100%', maxWidth: size, height: 'auto', aspectRatio: '1 / 1', position: 'relative', display: 'block' }} aria-hidden>
      <style>{`
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="orbit-rotator"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transformOrigin: '50% 50%',
          animation: `orbit-spin ${speed}s linear infinite`,
        }}
      >
        {items.map((i) => {
          const angle = initialRotation + (i * (360 / count));
          const transform = `translate(-50%,-50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)' ,
                borderRadius: '40%',
                background: 'white',
                left: '50%',
                top: '50%',
                transform,
                willChange: 'transform',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 48, height: 49, display: 'block' }}>
                <img
                  src={iconPaths[i]}
                  alt={`protocol-${i + 1}`}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    const fallback = defaultIcons[i % defaultIcons.length];
                    if (el && el.src !== fallback) el.src = fallback;
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* center logo and subtle ring */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: centerSize, height: centerSize, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <img src="/tether-usdt-logo.svg" alt="tether" style={{ width: '80%', height: '80%', objectFit: 'contain', display: 'block' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: Math.round(radius * 2.2), height: Math.round(radius * 2.2), borderRadius: '50%',  zIndex: 1 }} aria-hidden />
    </div>
  );
}
