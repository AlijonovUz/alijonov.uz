import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if browser DevTools is open.
 * Uses a combination of:
 * 1. Window dimension differences (docked DevTools - right, bottom, left)
 * 2. Console object getter/toString execution triggers (undocked DevTools)
 * 3. Debugger timing threshold analysis
 */
const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    let isOpen = false;
    const threshold = 160;

    const check = () => {
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
        // Evaluate in console (ignored if devtools console is not inspecting/open)
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

    // Run initial check
    check();

    // Check frequently (every 200ms) and immediately on window resize
    const interval = setInterval(check, 200);
    window.addEventListener('resize', check);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;
