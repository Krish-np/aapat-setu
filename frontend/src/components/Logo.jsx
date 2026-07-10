import React from "react";

/* Shared brand mark — matches the favicon (red circle, white "S").
   Used in Navbar, Sidebar, and anywhere else the brand logo appears. */
export default function Logo({ size = 36, rounded = "rounded-xl" }) {
  return (
    <div
      className={`${rounded} bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20 shrink-0`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size * 0.62}
        height={size * 0.62}
        aria-hidden="true"
      >
        <text
          x="50"
          y="68"
          fontSize="58"
          textAnchor="middle"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          S
        </text>
      </svg>
    </div>
  );
}
