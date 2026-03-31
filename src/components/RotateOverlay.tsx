import React, { useEffect, useState } from "react";
import "./RotateOverlay.css";

export const RotateOverlay: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia && window.matchMedia("(orientation: portrait)").matches
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(orientation: portrait)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsPortrait(e.matches);
    };

    // For older browsers, matchMedia may use addListener
    try {
      if ((mq as any).addEventListener) {
        (mq as any).addEventListener("change", handler);
      } else if ((mq as any).addListener) {
        (mq as any).addListener(handler);
      }
    } catch (e) {
      // ignore
    }

    // initial
    setIsPortrait(mq.matches);

    return () => {
      try {
        if ((mq as any).removeEventListener) {
          (mq as any).removeEventListener("change", handler);
        } else if ((mq as any).removeListener) {
          (mq as any).removeListener(handler);
        }
      } catch (e) {}
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="rotate-overlay" role="dialog" aria-hidden={!isPortrait}>
      <div className="rotate-card">
        <svg className="rotate-icon" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5 0 .46-.07.9-.18 1.32l1.53.43C18.86 14.08 19 13.05 19 12c0-3.87-3.13-7-7-7zM6.18 8.68C5.14 9.92 4.5 11.41 4.5 13c0 3.87 3.13 7 7 7v3l4-4-4-4v3c-2.76 0-5-2.24-5-5 0-.46.07-.9.18-1.32L6.18 8.68z"
          />
        </svg>
        <div className="rotate-text">
          Rotate to landscape mode for the best piano experience!
        </div>
        {/* <div className="rotate-sub">The piano works best in landscape mode</div> */}
      </div>
    </div>
  );
};

export default RotateOverlay;
