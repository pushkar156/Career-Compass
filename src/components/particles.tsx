
'use client';

import React, { useEffect, useRef } from 'react';

export function Particles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      
      const xEnd = (Math.random() - 0.5) * 2 * 200; // -200px to +200px
      particle.style.setProperty('--x-end', `${xEnd}px`);
      
      particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;

      container.appendChild(particle);

      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    };

    const interval = setInterval(createParticle, 200);

    return () => clearInterval(interval);
  }, []);

  return <div id="particle-container" ref={containerRef} />;
}
