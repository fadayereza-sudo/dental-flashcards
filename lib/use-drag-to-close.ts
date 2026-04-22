import { useCallback, useRef } from "react";

/**
 * Drag-to-dismiss for a bottom sheet. Attach the returned `sheetRef` to the
 * element whose transform should follow the finger, and spread `handleProps`
 * on the drag area (typically the top handlebar).
 *
 * On release past the threshold, the sheet slides off the bottom and `onClose`
 * fires after the transition ends, so the caller's exit animation picks up
 * cleanly.
 */
export function useDragToClose(onClose: () => void, thresholdPx = 100) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const state = useRef({ startY: 0, lastY: 0, dragging: false });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = sheetRef.current;
    if (!el || e.touches.length !== 1) return;
    const t = e.touches[0];
    state.current = { startY: t.clientY, lastY: t.clientY, dragging: true };
    el.style.transition = "none";
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const el = sheetRef.current;
    if (!el || !state.current.dragging) return;
    const t = e.touches[0];
    state.current.lastY = t.clientY;
    const dy = Math.max(0, t.clientY - state.current.startY);
    el.style.transform = `translateY(${dy}px)`;
  }, []);

  const finish = useCallback(() => {
    const el = sheetRef.current;
    if (!el || !state.current.dragging) return;
    state.current.dragging = false;
    const dy = state.current.lastY - state.current.startY;
    el.style.transition = "";
    if (dy > thresholdPx) {
      el.style.transform = "translateY(100%)";
      const done = () => {
        el.removeEventListener("transitionend", done);
        onClose();
        // Clear the inline transform after the state flip so Tailwind's
        // translate-y-full class can take over without a visible snap.
        requestAnimationFrame(() => {
          if (sheetRef.current) sheetRef.current.style.transform = "";
        });
      };
      el.addEventListener("transitionend", done);
    } else {
      el.style.transform = "";
    }
  }, [onClose, thresholdPx]);

  return {
    sheetRef,
    handleProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd: finish,
      onTouchCancel: finish,
    },
  };
}
