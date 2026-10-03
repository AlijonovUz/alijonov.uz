import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if browser DevTools is open.
 * Uses:
 * 1. Window dimension differences (docked DevTools - right, bottom, left)
 * 2. Console object getter/toString execution triggers (undocked DevTools)
 */
const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    let isOpen = false;
    // DevTools panels are typically >= 250px. Normal browser chrome (tabs+url+bookmarks) is < 180px.
    const threshold = 220;

    const check = () => {
      // Guard against initial unmeasured render
      if (!window.innerWidth || !window.innerHeight || !window.outerWidth || !window.outerHeight) {
        return;
      }

      let detected = false;

      // 1. Dimension check (docked devtools)
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
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

    // Run check after initial layout is ready
    const initialTimer = setTimeout(check, 100);

    // Check periodically (every 250ms) and immediately on window resize
    const interval = setInterval(check, 250);
    window.addEventListener('resize', check);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;
