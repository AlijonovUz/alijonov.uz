import { useEffect, useRef } from 'react';

/**
 * Replicates the original TweenMax + ScrollMonitor stagger animation from main.js.
 * Elements with .anim-item class inside the container animate in from below
 * (y: 15px → 0) with staggered delays, triggered when container enters viewport.
 *
 * @param {Array} deps - optional deps array (pass [blog] in BlogPost to re-run after data loads)
 */
const useStaggerAnimation = (deps = []) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animItems = container.querySelectorAll('.anim-item');
    if (!animItems.length) return;

    // Reset elements to invisible + shifted down (matches .anim-item { opacity: 0 })
    animItems.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = 'none';
    });

    const runAnimation = () => {
      animItems.forEach((el, index) => {
        // delay: .3 + repeatDelay: .2 per item — matches TweenMax.staggerFrom options
        const delay = 0.3 + index * 0.2;
        setTimeout(() => {
          el.style.transition = 'opacity 0.85s ease, transform 0.85s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay * 1000);
      });
    };

    const dataScroll = container.getAttribute('data-scroll');

    if (dataScroll === 'false') {
      // Fire immediately (no scroll required)
      runAnimation();
    } else {
      // Use IntersectionObserver to replace ScrollMonitor — trigger when visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              runAnimation();
              observer.unobserve(container);
            }
          });
        },
        { rootMargin: '0px 0px 250px 0px' } // matches scrollMonitor.create(anim, -250)
      );
      observer.observe(container);

      return () => observer.disconnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
};

export default useStaggerAnimation;
