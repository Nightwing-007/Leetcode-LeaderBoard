import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up hook. Counts from 0 to `end` over `duration` ms.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function useCountUp(end, duration = 800) {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (typeof end !== 'number' || isNaN(end)) {
      setValue(0);
      return;
    }

    const startVal = prevEnd.current;
    const startTime = performance.now();
    const diff = end - startVal;

    if (diff === 0) return;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad for smooth deceleration
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startVal + diff * eased);
      setValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevEnd.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return value;
}
