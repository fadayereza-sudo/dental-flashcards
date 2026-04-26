import { useEffect, useRef } from "react";
import { pushEntry, removeEntry } from "./back-stack";

/**
 * Dismiss an overlay when the user hits the OS/browser back button.
 * Multiple instances nest correctly via the shared back-stack — only
 * the topmost entry's onClose fires per back press.
 */
export function useBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = pushEntry(() => onCloseRef.current());
    return () => {
      removeEntry(id);
    };
  }, [isOpen]);
}
