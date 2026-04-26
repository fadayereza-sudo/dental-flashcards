import { useLayoutEffect, useRef } from "react";

/**
 * Shrinks the font-size of `textRef` until its scrollHeight fits within
 * `containerRef.clientHeight`. Re-runs when `key` changes (i.e. the text
 * being measured) and when the container resizes.
 *
 * Both refs must point to elements that exist for the full life of the
 * card; we restore the font-size to `max` before each measurement so the
 * next pass starts from a clean baseline.
 */
export function useFitText(
  textRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  key: unknown,
  max = 24,
  min = 12,
) {
  useLayoutEffect(() => {
    const text = textRef.current;
    const container = containerRef.current;
    if (!text || !container) return;

    const fit = () => {
      let size = max;
      text.style.fontSize = `${size}px`;
      // Force a reflow read each iteration; loop is bounded by (max-min).
      while (
        size > min &&
        (container.scrollHeight > container.clientHeight ||
          container.scrollWidth > container.clientWidth)
      ) {
        size -= 1;
        text.style.fontSize = `${size}px`;
      }
    };

    fit();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    return () => ro.disconnect();
  }, [textRef, containerRef, key, max, min]);
}
