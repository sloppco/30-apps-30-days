"use client";

import { useEffect, useState } from "react";

interface DemoCursorProps {
  /** A CSS attribute selector for the element the cursor should move to. */
  targetSelector: string | null;
  /** When true a click-ripple animation plays around the cursor tip. */
  isClicking: boolean;
}

/**
 * An animated fake cursor overlay used in demo mode.
 *
 * On each `targetSelector` change the cursor finds the target element via
 * `document.querySelector`, reads its bounding rect, and smoothly transitions
 * to the centre of that element using a CSS transform. The cursor hides itself
 * when `targetSelector` is null (e.g. during streaming).
 *
 * Rendered at `position: fixed` with `pointer-events: none` so it never
 * interferes with the real layout or event handling.
 */
export default function DemoCursor({ targetSelector, isClicking }: DemoCursorProps) {
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
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Cursor SVG */}
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
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Click ripple */}
      {isClicking && (
        <span className="absolute top-0 left-0 block w-7 h-7 -translate-x-1.5 -translate-y-1.5 rounded-full bg-slate-800 opacity-25 animate-ping" />
      )}
    </div>
  );
}
