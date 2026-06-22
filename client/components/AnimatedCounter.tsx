import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Animated Counter Component
export function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });

  const numPart = value.replace(/[^0-9]/g, '');
  const target = parseInt(numPart || "0", 10);
  
  const prefixMatch = value.match(/^[^0-9,.]+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  
  const suffixMatch = value.match(/[^0-9,.]+$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';

  useEffect(() => {
    if (inView && target > 0) {
      const duration = 2000;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeProgress * target));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      requestAnimationFrame(animate);
    } else if (inView && target === 0) {
      setCount(0);
    }
  }, [inView, target]);

  return (
    <span ref={ref as any}>
      {prefix}{target > 0 ? count.toLocaleString() : value}{suffix}
    </span>
  );
}
