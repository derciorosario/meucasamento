import React from "react";

/**
 * Full screen loader with brand gradient spinner.
 * Props:
 * - message?: string (default: "Loading…")
 * - tip?: string (small helper text)
 * - notFull?: boolean (if true, doesn't take full screen height)
 */
export default function FullPageLoader({ message = "Loading…", tip, notFull, transparent,top }) {
  return (
    <div
      className={`${
        !notFull ? "min-h-screen" : "py-2"
      } grid place-items-center ${transparent ? 'bg-white/65':' bg-gray-50'} ${top ? 'fixed left-0 top-0 w-full h-[100vh] bg-white z-50':''}`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div
          className="relative h-14 w-14"
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <span className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <span
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: "#9CAA8E",
              borderRightColor: "#f9fafb",
            }}
          />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">{message}</p>
          {tip && <p className="mt-1 text-xs text-gray-500">{tip}</p>}
        </div>

      </div>

      {/* Reduced motion support */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
          [style*="shimmer_1.2s_infinite"] { display:none; }
        }
      `}</style>
    </div>
  );
}
