// The design's motion system (design-demo/calm-elegant/site/assets/site.js), as React.
// Elements opt in with data-reveal="split|rise|mask|list|paper|timeline"; useReveal
// animates every one inside its scope once, when it scrolls into view.
import { cloneElement, isValidElement, useRef, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

const REVEAL_START = 'top 86%';

// Reduced motion, or ?motion=off for static captures: every section renders in place.
export function isMotionOff(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || new URLSearchParams(window.location.search).get('motion') === 'off';
}

function once(el: Element, build: (tl: gsap.core.Timeline) => void) {
  const tl = gsap.timeline({ paused: true });
  build(tl);
  ScrollTrigger.create({ trigger: el, start: REVEAL_START, once: true, onEnter: () => { tl.play(); } });
}

const reveals: Record<string, (el: HTMLElement) => void> = {
  // headline words rise out of their mask (words come from <SplitWords>)
  split(el) {
    const words = el.querySelectorAll('.wi');
    gsap.set(words, { yPercent: 110 });
    once(el, (tl) => tl.to(words, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.045 }));
  },
  // plain copy drifts up
  rise(el) {
    gsap.set(el, { autoAlpha: 0, y: 26 });
    once(el, (tl) => tl.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: Number(el.dataset.delay || 0) }));
  },
  // photographs: a mask lifts from the bottom while the image settles back
  mask(el) {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
    if (img) gsap.set(img, { scale: 1.08 });
    once(el, (tl) => {
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' });
      if (img) tl.to(img, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.15);
    });
  },
  // lists: rules draw left to right, then each row lands
  list(el) {
    const rows = [...el.children] as HTMLElement[];
    const inner = rows.map((r) => r.firstElementChild || r);
    gsap.set(rows, { '--draw': 0 });
    gsap.set(inner, { autoAlpha: 0, y: 12 });
    once(el, (tl) => {
      tl.to(rows, { '--draw': 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.06 });
      tl.to(inner, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, 0.15);
    });
  },
  // paper-like items: set down on the table with a slight turn
  paper(el) {
    const items = [...el.children];
    gsap.set(items, { autoAlpha: 0, y: 46, rotation: (i: number) => (i % 2 ? -1.6 : 1.6) });
    once(el, (tl) => tl.to(items, { autoAlpha: 1, y: 0, rotation: 0, duration: 1, ease: 'back.out(1.15)', stagger: 0.08 }));
  },
  // timeline: the spine draws downward, nodes drop into place behind it
  timeline(el) {
    const spine = el.querySelector('.spine');
    const nodes = el.querySelectorAll('.node');
    const steps = el.querySelectorAll('.step-body');
    gsap.set(spine, { scaleY: 0, transformOrigin: 'top' });
    gsap.set(nodes, { scale: 0 });
    gsap.set(steps, { autoAlpha: 0, x: 18 });
    once(el, (tl) => {
      tl.to(spine, { scaleY: 1, duration: 1.6, ease: 'power2.inOut' });
      nodes.forEach((n, i) => {
        tl.to(n, { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, 0.25 + i * 0.42);
        tl.to(steps[i], { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.32 + i * 0.42);
      });
    });
  },
};

/**
 * Animates every [data-reveal] element inside `scope` once it scrolls into view.
 * Pass the data the section renders from as `deps`, so reveals are rebuilt after
 * content arrives; everything is reverted on unmount.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(() => {
    if (isMotionOff() || !scope.current) return;
    scope.current.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      reveals[el.dataset.reveal ?? '']?.(el);
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, { scope, dependencies: deps, revertOnUpdate: true });
}

// Wraps each word in a mask (.w > .wi) so a data-reveal="split" heading can rise word
// by word. Keeps inline elements such as <em> and <br>.
function splitNode(node: ReactNode, key: string): ReactNode {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node).split(/(\s+)/).map((part, i) => {
      if (!part) return null;
      if (/^\s+$/.test(part)) return ' ';
      return <span className="w" key={`${key}-${i}`}><span className="wi">{part}</span></span>;
    });
  }
  if (Array.isArray(node)) return node.map((child, i) => splitNode(child, `${key}.${i}`));
  if (isValidElement<{ children?: ReactNode }>(node) && node.type !== 'br') {
    return cloneElement(node, { key }, splitNode(node.props.children, key));
  }
  return node;
}

export function SplitWords({ children }: { children: ReactNode }) {
  return <>{splitNode(children, 'w')}</>;
}

// A number that rolls up to its value when it scrolls into view ("26", "1,200+", "98%").
// Anything else ("24/7", "3-5", "5 years") is shown as written.
const ROLLABLE = /^[\d,.]+[%+]?$/;
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = value;
    const target = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isMotionOff() || Number.isNaN(target) || !ROLLABLE.test(value.trim())) return;

    const suffix = value.replace(/[\d,.\s]/g, '');
    const format = (n: number) => Math.round(n).toLocaleString('en-US') + suffix;
    const state = { v: target * 0.62 };
    el.textContent = format(state.v);
    once(el, (tl) => tl.to(state, {
      v: target, duration: 1.8, ease: 'power4.out',
      onUpdate: () => { el.textContent = format(state.v); },
    }));
  }, { dependencies: [value], revertOnUpdate: true });

  // React writes the value once, so it is in the prerendered page; after that the effect
  // above owns the text, so it can animate freely.
  return <span ref={ref}>{value}</span>;
}
