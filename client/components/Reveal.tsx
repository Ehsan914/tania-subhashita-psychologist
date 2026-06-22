import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Reveal Wrapper Component
export function Reveal({ children, className = "", delay = 0, id }: { children: React.ReactNode, className?: string, delay?: number, key?: React.Key, id?: string  }) {
  const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div 
      ref={ref} 
      id = {id}
      className={`transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
