import { useState, useEffect } from 'react';

// Real docked DevTools takes at least 250px-400px.
// Normal browser chrome (address bar + tabs + bookmarks) takes 70px-180px in height, 0-20px in width.
const WIDTH_THRESHOLD = 220;
const HEIGHT_THRESHOLD = 240;

/**
 * Synchronous check for DevTools status
 */
export const checkIsDevToolsOpen = () => {
  if (typeof window === 'undefined') return false;
  if (!window.innerWidth || !window.outerWidth || !window.outerHeight || !window.innerHeight) {
    return false;
  }

  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;

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
      if (!window.innerWidth || !window.innerHeight || !window.outerWidth || !window.outerHeight) {
        return;
      }

      let detected = false;

      // 1. Dimension check (docked devtools)
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
        detected = true;
      }

      // 2. Custom element / getter trigger (undocked or console active)
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: function () {
          detected = true;
          return 'devtools-detected';
        },
        configurable: true,
      });

      // 3. Regex / function evaluation trigger
      const reg = /./;
      reg.toString = function () {
        detected = true;
        return 'devtools-detected';
      };

      try {
        console.debug(element);
        console.debug(reg);
      } catch {
        // ignore
      }

      if (detected !== isOpen) {
        isOpen = detected;
        setIsDevToolsOpen(detected);
      }
    };

    // Run check immediately
    check();

    // Check periodically (every 150ms) and on window resize
    const interval = setInterval(check, 150);
    window.addEventListener('resize', check);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;
