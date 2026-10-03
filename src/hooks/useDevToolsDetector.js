import { useState, useEffect } from 'react';

// Docked DevTools takes at least 260px in width (side dock) or 320px in height (bottom dock).
// Normal browser chrome (address bar + tabs + bookmarks + system titlebar) takes max 180-220px in height, 0-16px in width.
const WIDTH_THRESHOLD = 260;
const HEIGHT_THRESHOLD = 320;

/**
 * Synchronous check for DevTools status
 */
export const checkIsDevToolsOpen = () => {
  if (typeof window === 'undefined') return false;

  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const outerW = window.outerWidth;
  const outerH = window.outerHeight;

  if (!innerW || !innerH || !outerW || !outerH) {
    return false;
  }

  const widthDiff = outerW - innerW;
  const heightDiff = outerH - innerH;

  if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
    return true;
  }

  return false;
};

/**
 * Custom hook to detect if browser DevTools is open in real-time.
 */
const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(checkIsDevToolsOpen);

  useEffect(() => {
    let isOpen = checkIsDevToolsOpen();

    const check = () => {
      const detected = checkIsDevToolsOpen();
      if (detected !== isOpen) {
        isOpen = detected;
        setIsDevToolsOpen(detected);
      }
    };

    // Run check on interval (100ms) and on window resize
    const interval = setInterval(check, 100);
    window.addEventListener('resize', check);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;


