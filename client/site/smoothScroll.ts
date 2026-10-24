// Eased wheel and trackpad scrolling (Lenis), stepped by GSAP's ticker so the ScrollTrigger
// reveals move in time with it. Touch keeps the phone's own scrolling, and reduced motion
// (or ?motion=off) leaves the browser's scrolling untouched.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import { gsap, isMotionOff, ScrollTrigger } from './motion';

let lenis: Lenis | null = null;

export function useSmoothScroll() {
  useEffect(() => {
    if (isMotionOff()) return;
    const instance = new Lenis();
    lenis = instance;
    instance.on('scroll', ScrollTrigger.update);
    const step = (seconds: number) => instance.raf(seconds * 1000);
    gsap.ticker.add(step);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(step);
      instance.destroy();
      lenis = null;
    };
  }, []);
}

/** Back to the top: at once on a new page, eased when `smooth` (and motion is on). */
export function scrollToTop(smooth = false) {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth, force: true });
  else window.scrollTo({ top: 0, behavior: smooth && !isMotionOff() ? 'smooth' : 'auto' });
}

/** Holds the page still while an overlay (the mobile menu) is open. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}
