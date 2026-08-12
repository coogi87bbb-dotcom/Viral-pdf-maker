import React, { useEffect, useRef } from 'react';

interface Studio3DBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}

// Ambient ONLY — no mousemove listener. This used to re-center a spotlight,
// tilt the grid, and repel/attract every particle toward the live cursor
// position on every frame; on the Studio OS app shell that made the entire
// background visibly shift the instant the mouse moved anywhere over the
// page, which read as broken/laggy rather than premium. Motion here is now
// driven purely by elapsed time (a slow autonomous drift), never by pointer
// input, so the canvas is decorative and inert with respect to the mouse.
export const Studio3DBackground: React.FC<Studio3DBackgroundProps> = ({
  className = '',
  intensity = 'medium'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // 3D Liquid Rose Gold & Champagne Particles
    const numParticles = intensity === 'high' ? 50 : 38;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 100, // 3D Depth
      baseVx: (Math.random() - 0.5) * 0.4,
      baseVy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.8 + 1.2,
      // Color type: Rose Gold vs Champagne
      type: i % 2 === 0 ? ('rosegold' as const) : ('champagne' as const),
      rosegoldColor: i % 3 === 0 ? '#e38a72' : i % 3 === 1 ? '#d4735a' : '#efa898',
      champagneColor: i % 3 === 0 ? '#f3e6d3' : i % 3 === 1 ? '#e8d5b7' : '#f6ece0'
    }));

    let time = 0;
    // Fixed dead-center focal point for the spotlight/grid-tilt/vanishing
    // lines — no wander. This used to drift in a slow lissajous sweep
    // (still purely time-driven, never pointer-driven, so it wasn't the
    // earlier mouse-tracking bug) but a large, continuous side-to-side
    // sweep of the spotlight across ~18% of the screen every ~18s reads
    // exactly like "the background is moving" even with the mouse
    // completely untouched — which is the opposite of what an ambient
    // backdrop should do. Keep this static; only the individual particles
    // below should drift, and only barely.
    const focus = { x: width / 2, y: height / 2 };

    // This canvas is purely decorative and runs continuously behind the
    // entire Studio OS shell, so it competes with real work (scrolling the
    // PDF Studio, typing, etc.) for main-thread time every single frame.
    // 30fps is imperceptible for slow ambient drift and halves that cost
    // versus rAF's native ~60fps.
    const FRAME_INTERVAL_MS = 1000 / 30;
    let lastFrameTime = 0;

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (now - lastFrameTime < FRAME_INTERVAL_MS) return;
      lastFrameTime = now;

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const mx = focus.x;
      const my = focus.y;

      // 1. Ambient Liquid Rose Gold Spotlight Radial Gradient
      const spotlightRadius = 340;
      const spotGrad = ctx.createRadialGradient(mx, my, 10, mx, my, spotlightRadius);
      spotGrad.addColorStop(0, 'rgba(212, 115, 90, 0.13)'); // Liquid Rose Gold Core
      spotGrad.addColorStop(0.4, 'rgba(232, 213, 183, 0.06)'); // Champagne Rim
      spotGrad.addColorStop(1, 'rgba(5, 5, 7, 0)');

      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(mx, my, spotlightRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D Perspective Grid, drifting with the ambient focus point
      ctx.save();
      const horizon = height * 0.5;
      const focalLength = 400;

      ctx.lineWidth = 1;

      const gridSpacing = 45;
      const offset = (time * 25) % gridSpacing;

      for (let z = 20; z < 900; z += gridSpacing) {
        const adjustedZ = z - offset;
        if (adjustedZ <= 0) continue;
        const scale = focalLength / (focalLength + adjustedZ);
        const y = horizon + (height - horizon) * scale;
        if (y > height || y < horizon) continue;

        const distToFocusY = Math.abs(y - my);
        const influence = Math.max(0, 1 - distToFocusY / 250);

        ctx.strokeStyle = `rgba(212, 115, 90, ${0.03 + influence * 0.07})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing perspective lines radiating from the fixed focus point —
      // static angles (no + time term), so they don't slowly spin either.
      const numVanishingLines = 14;
      const angleStep = (Math.PI * 2) / numVanishingLines;
      for (let i = 0; i < numVanishingLines; i++) {
        const angle = i * angleStep;
        const x2 = mx + Math.cos(angle) * width * 1.2;
        const y2 = my + Math.sin(angle) * height * 1.2;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 115, 90, 0.03)' : 'rgba(232, 213, 183, 0.025)';
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render 3D Liquid Rose Gold & Champagne Particles, drifting freely
      particles.forEach((p, idx) => {
        p.x += p.baseVx;
        p.y += p.baseVy;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // 3D Perspective Projection
        const scale = focalLength / (focalLength + p.z);
        const projX = (p.x - width / 2) * scale + width / 2;
        const projY = (p.y - height / 2) * scale + height / 2;
        const radius = Math.max(0.8, p.size * scale * 1.6);
        const alpha = Math.min(0.75, Math.max(0.1, (1 - p.z / 900) * 0.7));

        // Connect nearby particles with liquid metallic threads
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p.x - p2.x;
          const pdy = p.y - p2.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist < 120) {
            const lineAlpha = (1 - pDist / 120) * 0.12 * alpha;
            ctx.strokeStyle = p.type === 'rosegold' ? `rgba(212, 115, 90, ${lineAlpha})` : `rgba(232, 213, 183, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo((p2.x - width / 2) * scale + width / 2, (p2.y - height / 2) * scale + height / 2);
            ctx.stroke();
          }
        }

        // Render Liquid Rose Gold or Champagne Metallic Sphere
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);

        // No ctx.shadowBlur here — per-particle canvas shadow blur is one
        // of the most expensive Canvas2D operations (a real blur
        // convolution recomputed every frame, for every particle), and
        // this canvas already runs continuously behind the whole app. The
        // CSS-blurred glow orbs below give plenty of ambient softness
        // without paying that cost 30 times a second.
        ctx.fillStyle = p.type === 'rosegold' ? p.rosegoldColor : p.champagneColor;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Dynamic 3D Liquid Rose Gold & Champagne Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-accent-rosegold-500/15 via-accent-rosegold-400/5 to-transparent blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-100/10 via-accent-rosegold-500/10 to-transparent blur-3xl pointer-events-none"
        style={{ animation: 'pulse 8s infinite alternate' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-surface-1/40 blur-[130px] pointer-events-none" />

      {/* Ambient 3D Canvas Mesh — decorative only, pointer-events-none, not mouse-reactive */}
      <canvas ref={canvasRef} className="w-full h-full opacity-80" />
    </div>
  );
};
