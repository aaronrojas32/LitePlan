import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="LitePlan Logo Mark"
    >
      {/* Isometric Minecraft Blueprint Block */}
      {/* Top Facet (Blueprint grid) */}
      <path
        d="M18 3L32 10.5L18 18L4 10.5L18 3Z"
        fill="#3B82F6"
      />
      {/* Top Facet Grid Overlay (Planning Blueprint) */}
      <path
        d="M11 6.75L25 14.25M25 6.75L11 14.25"
        stroke="#93C5FD"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Left Facet (Primary Deep Blue) */}
      <path
        d="M4 10.5V25.5L18 33V18L4 10.5Z"
        fill="#1D4ED8"
      />
      {/* Left Facet subtle sub-layer line */}
      <path
        d="M4 18L18 25.5"
        stroke="#60A5FA"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Right Facet (Minecraft Emerald Accent) */}
      <path
        d="M18 18V33L32 25.5V10.5L18 18Z"
        fill="#10B981"
      />
      {/* Right Facet subtle sub-layer line */}
      <path
        d="M18 25.5L32 18"
        stroke="#6EE7B7"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 28,
  className = '',
  showText = true,
  textClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span className={`text-lg font-black tracking-tight text-slate-900 leading-none ${textClassName}`}>
            Lite<span className="text-blue-600">Plan</span>
          </span>
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
            MC
          </span>
        </div>
      )}
    </div>
  );
};
