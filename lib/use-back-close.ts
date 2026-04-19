import { useEffect, useRef } from "react";

/**
 * Dismiss an overlay when the user hits the OS/browser back button.
 * Pushes a history entry on open; pops it on programmatic close so the
 * stack stays balanced.
 */
export function useBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ __modal: true }, "");
    pushedRef.current = true;
    const handler = () => {
      pushedRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [isOpen]);
}
