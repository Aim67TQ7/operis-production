import { useCallback, useEffect, useRef, useState } from 'react';

export const MOBILE_SCROLL_ROOT_ID = 'mobile-scroll-root';

/**
 * Mobile scroll chrome helper.
 *
 * - Hides secondary toolbars ("chrome") when the user scrolls down, shows them
 *   again on any upward gesture.
 * - Exposes a back-to-top affordance once scrolled past ~1 screen.
 * - Lets a focused card be pulled to the top of the list so the mobile
 *   keyboard opens *under* it instead of covering it.
 *
 * Attaches to the shared scroll container (`#mobile-scroll-root`).
 */
export function useMobileScrollChrome(enabled = true) {
  const [scrolledAway, setScrolledAway] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const lastY = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const getContainer = useCallback(() => {
    if (containerRef.current && document.body.contains(containerRef.current)) {
      return containerRef.current;
    }
    containerRef.current = document.getElementById(MOBILE_SCROLL_ROOT_ID);
    return containerRef.current;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setScrolledAway(false);
      setShowBackToTop(false);
      return;
    }
    const el = getContainer();
    if (!el) return;

    lastY.current = el.scrollTop;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 48) setScrolledAway(true);
        else if (delta < 0) setScrolledAway(false);
        lastY.current = y;
      }
      if (y <= 8) setScrolledAway(false);
      setShowBackToTop(y > el.clientHeight * 0.8);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [enabled, getContainer]);

  const scrollToTop = useCallback(() => {
    const el = getContainer();
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'smooth' });
    setScrolledAway(false);
  }, [getContainer]);

  /** Pull `node` to the top of the scroll container (keyboard-safe focus). */
  const scrollElementIntoTop = useCallback(
    (node: HTMLElement | null, offset = 8) => {
      const el = getContainer();
      if (!el || !node) return;
      const run = () => {
        const containerTop = el.getBoundingClientRect().top;
        const nodeTop = node.getBoundingClientRect().top;
        el.scrollTo({ top: el.scrollTop + (nodeTop - containerTop) - offset, behavior: 'smooth' });
      };
      run();
      // Keyboards resize the visual viewport after focus — re-align once settled.
      window.setTimeout(run, 320);
      window.setTimeout(run, 650);
    },
    [getContainer],
  );

  const handleInputFocus = useCallback(
    (node: HTMLElement | null) => {
      setInputFocused(true);
      setScrolledAway(true);
      scrollElementIntoTop(node);
    },
    [scrollElementIntoTop],
  );

  const handleInputBlur = useCallback(() => setInputFocused(false), []);

  return {
    /** Secondary toolbars should be hidden. */
    chromeHidden: enabled && scrolledAway,
    showBackToTop: enabled && showBackToTop,
    inputFocused: enabled && inputFocused,
    scrollToTop,
    scrollElementIntoTop,
    handleInputFocus,
    handleInputBlur,
  };
}
