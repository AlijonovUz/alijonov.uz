/**
 * Security utilities to protect website content:
 * - Disables and clears browser console automatically
 * - Protects against DOM/Style tampering from DevTools Elements panel
 * - Prevents copying, selecting, dragging, and iframe clickjacking
 */

// Initialize console disabling and auto-clearing
export const initConsoleProtection = () => {
  try {
    const noop = () => {};
    const methods = [
      'log',
      'debug',
      'info',
      'warn',
      'error',
      'table',
      'trace',
      'dir',
      'dirxml',
      'group',
      'groupCollapsed',
      'groupEnd',
      'time',
      'timeLog',
      'timeEnd',
      'count',
      'countReset',
      'assert',
      'profile',
      'profileEnd',
    ];

    methods.forEach((method) => {
      if (window.console && window.console[method]) {
        window.console[method] = noop;
      }
    });

    // Auto-clear console continuously
    setInterval(() => {
      try {
        console.clear();
      } catch {
        // ignore
      }
    }, 800);

    // Freeze console object to prevent restoring methods
    try {
      Object.freeze(window.console);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
};

// Protect against DOM and inline style manipulations from DevTools Elements panel
export const initDOMTamperProtection = (onTamper) => {
  if (typeof window === 'undefined' || !window.MutationObserver) return () => {};

  let isHandling = false;
  let isReady = false;

  // Give React 500ms to complete initial mount without triggering false positives
  setTimeout(() => {
    isReady = true;
  }, 500);

  const observer = new MutationObserver((mutations) => {
    if (!isReady || isHandling) return;

    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (
          target === document.body ||
          target === document.documentElement ||
          (target.id && (target.id === 'archive' || target.id === 'about-me'))
        ) {
          if (mutation.attributeName === 'style') {
            isHandling = true;
            onTamper();
            setTimeout(() => {
              isHandling = false;
            }, 500);
            break;
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style'],
  });

  return () => observer.disconnect();
};

// Prevent copy, cut, text selection, image drag, and iframe embedding (clickjacking)
export const initInteractionProtection = () => {
  if (typeof window === 'undefined') return () => {};

  // 1. Frame-busting / Clickjacking defense
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch {
    // ignore if cross-origin frame prevents access
  }

  // 2. Prevent Copy & Cut
  const handleCopyCut = (e) => {
    // Allow copying inside input or textarea if user types something
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  };

  // 3. Prevent text selection start (except input/textarea)
  const handleSelectStart = (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  };

  // 4. Prevent dragging images or elements
  const handleDragStart = (e) => {
    e.preventDefault();
  };

  document.addEventListener('copy', handleCopyCut);
  document.addEventListener('cut', handleCopyCut);
  document.addEventListener('selectstart', handleSelectStart);
  document.addEventListener('dragstart', handleDragStart);

  return () => {
    document.removeEventListener('copy', handleCopyCut);
    document.removeEventListener('cut', handleCopyCut);
    document.removeEventListener('selectstart', handleSelectStart);
    document.removeEventListener('dragstart', handleDragStart);
  };
};
