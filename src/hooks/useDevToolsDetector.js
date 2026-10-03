import { useState, useEffect } from 'react';

// Real docked DevTools takes at least 260px in height or width.
// Normal browser chrome (address bar + tabs + bookmarks + window borders) takes <= 160px.
const WIDTH_THRESHOLD = 260;
const HEIGHT_THRESHOLD = 260;

let isDevToolsOpenState = false;

export const checkIsDevToolsOpen = () => {
  return isDevToolsOpenState;
};

/**
 * Custom hook to detect if browser DevTools is open in real-time.
 * Strictly prevents false positives during page load / reload.
 */
const useDevToolsDetector = () => {
  // Always initialize to false so normal reloads NEVER flash 404
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = () => {
      if (!mounted || typeof window === 'undefined') return;

      const innerW = window.innerWidth;
      const innerH = window.innerHeight;
      const outerW = window.outerWidth;
      const outerH = window.outerHeight;

      // Ensure window dimensions are valid and non-zero
      if (!innerW || !innerH || !outerW || !outerH) {
        return;
      }

      let detected = false;

      // Dimension check for docked DevTools (right, left, or bottom)
      const widthDiff = outerW - innerW;
      const heightDiff = outerH - innerH;

      if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
        detected = true;
      }

      // Update state if changed
      if (detected !== isDevToolsOpenState) {
        isDevToolsOpenState = detected;
        setIsDevToolsOpen(detected);
      }
    };

    // Give browser 100ms on initial mount to settle dimensions before first evaluation
    const initialTimer = setTimeout(check, 100);

    // Continuous check every 200ms and on window resize
    const interval = setInterval(check, 200);
    window.addEventListener('resize', check);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;

