import { useEffect, useRef } from "react";
import { pushEntry, removeEntry } from "./back-stack";

/**
 * Synchronise N back-stack entries with a counter (e.g. number of open
 * toggles in a Set). Each open of a toggle bumps `count`, which pushes
 * one history entry; each UI-initiated close drops `count`, which pops
 * matching entries. Hardware back fires `onPopOne`, which the caller
 * uses to drop the most-recently-opened toggle.
 */
export function useBackCount(count: number, onPopOne: () => void) {
  const onPopRef = useRef(onPopOne);
  onPopRef.current = onPopOne;
  const myEntriesRef = useRef<number[]>([]);

  useEffect(() => {
    const cur = myEntriesRef.current.length;
    if (count > cur) {
      for (let i = 0; i < count - cur; i++) {
        const id = pushEntry(() => onPopRef.current());
        myEntriesRef.current.push(id);
      }
    } else if (count < cur) {
      const toRemove = cur - count;
      for (let i = 0; i < toRemove; i++) {
        const id = myEntriesRef.current.pop();
        if (id !== undefined) removeEntry(id);
      }
    }
  }, [count]);

  useEffect(() => {
    return () => {
      while (myEntriesRef.current.length > 0) {
        const id = myEntriesRef.current.pop();
        if (id !== undefined) removeEntry(id);
      }
    };
  }, []);
}
