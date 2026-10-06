import { useState, useEffect } from 'react';
import DisableDevtool from 'disable-devtool';

// Docked DevTools takes at least 250px in width (side dock) or 350px+ in height (bottom dock).
// Normal browser chrome takes max 180-220px in height, 0-16px in width.
const WIDTH_THRESHOLD = 200;
const HEIGHT_THRESHOLD = 280;

let devToolsOpen = false;
const listeners = new Set();

const notifyListeners = (state) => {
  devToolsOpen = state;
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch {
      // ignore
    }
  });
};

/**
 * Instant synchronous check for DevTools status
 */
export const checkIsDevToolsOpen = () => {
  if (typeof window === 'undefined') return false;

  // 1. Synchronous dimension check (captures side dock, bottom dock, and responsive mobile emulation)
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const outerW = window.outerWidth;
  const outerH = window.outerHeight;

  if (innerW && innerH && outerW && outerH) {
    const widthDiff = outerW - innerW;
    const heightDiff = outerH - innerH;

    if (widthDiff > WIDTH_THRESHOLD || heightDiff > HEIGHT_THRESHOLD) {
      devToolsOpen = true;
      return true;
    }
  }

  // 2. DisableDevtool status check
  try {
    if (typeof DisableDevtool.isDevToolOpened === 'function' && DisableDevtool.isDevToolOpened()) {
      devToolsOpen = true;
      return true;
    }
  } catch {
    // ignore
  }

  return devToolsOpen;
};

// Initialize DisableDevtool immediately on script load
if (typeof window !== 'undefined') {
  try {
    DisableDevtool({
      ondevtoolopen: () => {
        notifyListeners(true);
      },
      ondevtoolclose: () => {
        notifyListeners(false);
      },
      disableMenu: true,
      disableCut: true,
      disableCopy: true,
      disablePaste: true,
      clearLog: true,
      interval: 50,
    });
  } catch {
    // ignore
  }
}

/**
 * Custom hook to detect if browser DevTools is open in real-time.
 */
const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(checkIsDevToolsOpen);

  useEffect(() => {
    const handleChange = (isOpen) => {
      setIsDevToolsOpen(isOpen);
    };

    listeners.add(handleChange);

    // Continuous interval and resize check
    const check = () => {
      const detected = checkIsDevToolsOpen();
      if (detected !== devToolsOpen) {
        notifyListeners(detected);
      }
    };

    // Run immediate check
    check();

    const interval = setInterval(check, 100);
    window.addEventListener('resize', check);

    return () => {
      listeners.delete(handleChange);
      clearInterval(interval);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;
