import { useState, useEffect } from 'react';
import DisableDevtool from 'disable-devtool';

let devToolsOpen = false;

/**
 * Synchronous check for DevTools status
 */
export const checkIsDevToolsOpen = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (typeof DisableDevtool.isDevToolOpened === 'function' && DisableDevtool.isDevToolOpened()) {
      return true;
    }
  } catch {
    // ignore
  }
  return devToolsOpen;
};

/**
 * Custom hook to detect if browser DevTools is open in real-time.
 * Uses DisableDevtool engine with 8 detection strategies (Debugger, Size, Getter, RegToString, etc.)
 */
const useDevToolsDetector = () => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(checkIsDevToolsOpen);

  useEffect(() => {
    let mounted = true;

    try {
      DisableDevtool({
        ondevtoolopen: () => {
          if (!mounted) return;
          devToolsOpen = true;
          setIsDevToolsOpen(true);
        },
        ondevtoolclose: () => {
          if (!mounted) return;
          devToolsOpen = false;
          setIsDevToolsOpen(false);
        },
        disableMenu: true,
        disableCut: true,
        disableCopy: true,
        disablePaste: true,
        clearLog: true,
        interval: 100,
      });
    } catch {
      // ignore
    }

    const interval = setInterval(() => {
      if (!mounted) return;
      const isOpen = checkIsDevToolsOpen();
      if (isOpen !== devToolsOpen) {
        devToolsOpen = isOpen;
        setIsDevToolsOpen(isOpen);
      }
    }, 100);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return isDevToolsOpen;
};

export default useDevToolsDetector;
