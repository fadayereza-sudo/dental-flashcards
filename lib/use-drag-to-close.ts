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
const CLOSE_MS = 260;
const SNAP_BACK_MS = 220;

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
    if (dy > thresholdPx) {
      // Sheets use CSS keyframe animations, not transitions, so we have to
      // give the element a real transition for the slide-out and drive
      // onClose off a timer rather than transitionend (which would never
      // fire without an explicit transition-property on transform).
      el.style.transition = `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 1, 1)`;
      el.style.transform = "translateY(100%)";
      window.setTimeout(() => {
        onClose();
        requestAnimationFrame(() => {
          if (sheetRef.current) {
            sheetRef.current.style.transform = "";
            sheetRef.current.style.transition = "";
          }
        });
      }, CLOSE_MS);
    } else {
      el.style.transition = `transform ${SNAP_BACK_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.transform = "";
      window.setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transition = "";
      }, SNAP_BACK_MS);
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
