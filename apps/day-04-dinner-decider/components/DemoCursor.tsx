"use client";

import { useEffect, useState } from "react";

interface DemoCursorProps {
  targetSelector: string | null;
  isClicking: boolean;
}

/**
 * Animated fake cursor overlay used in demo mode.
 *
 * Reads the bounding rect of `targetSelector` on each change and smoothly
 * transitions to the centre of that element via CSS transform.
 * Rendered at `position: fixed` with `pointer-events: none` so it never
 * interferes with real layout or events.
 */
export function DemoCursor({ targetSelector, isClicking }: DemoCursorProps) {
  const [pos, setPos] = useState({ x: -120, y: -120 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!targetSelector) {
      setVisible(false);
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: rect.left + rect.width * 0.55,
      y: rect.top + rect.height * 0.55,
    });
    setVisible(true);
  }, [targetSelector]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 50,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0,
      }}
    >
      <svg
        width="22"
        height="26"
        viewBox="0 0 22 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.35))" }}
      >
        <path
          d="M3 2L18 11.5L11.5 13L15.5 21.5L12.5 23L8.5 14.5L3 18.5V2Z"
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {isClicking && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 28,
            height: 28,
            transform: "translate(-6px, -6px)",
            borderRadius: "50%",
            background: "#2D8B4E",
            opacity: 0.3,
            animation: "ping 0.6s ease-out",
          }}
        />
      )}
    </div>
  );
}
