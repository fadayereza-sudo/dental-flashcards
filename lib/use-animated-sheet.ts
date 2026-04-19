import { useCallback, useRef, useState } from "react";
import { useBackClose } from "./use-back-close";

/**
 * Animated close state for a bottom-sheet overlay.
 * - `closing` is true during the exit animation so the caller can swap
 *   `animate-slide-up`/`fade-in` for the reverse classes.
 * - `close()` kicks off the exit animation and calls `reset` after it
 *   completes, so the sheet visually slides out before unmounting.
 * Also wires the OS/browser back button to trigger the same close path.
 */
export function useAnimatedSheet(
  isOpen: boolean,
  reset: () => void,
  durationMs = 260,
) {
  const [closing, setClosing] = useState(false);
  const resetRef = useRef(reset);
  resetRef.current = reset;

  const close = useCallback(() => {
    if (!isOpen || closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      resetRef.current();
    }, durationMs);
  }, [isOpen, closing, durationMs]);

  useBackClose(isOpen && !closing, close);

  return { closing, close };
}
