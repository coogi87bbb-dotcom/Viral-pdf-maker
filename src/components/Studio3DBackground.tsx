import React, { useEffect, useRef, useState } from 'react';

interface Studio3DBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'high';
}

export const Studio3DBackground: React.FC<Studio3DBackgroundProps> = ({
  className = '',
  intensity = 'medium'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Initial mouse center
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.isHovering = true;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Liquid Gold & Metallic Silver Particles
    const numParticles = intensity === 'high' ? 50 : 38;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 100, // 3D Depth
      baseVx: (Math.random() - 0.5) * 0.4,
      baseVy: (Math.random() - 0.5) * 0.4,
      vx: 0,
      vy: 0,
      size: Math.random() * 2.8 + 1.2,
      // Color type: Gold vs Silver
      type: i % 2 === 0 ? ('gold' as const) : ('silver' as const),
      goldColor: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#d4af37' : '#f59e0b',
      silverColor: i % 3 === 0 ? '#f8fafc' : i % 3 === 1 ? '#cbd5e1' : '#94a3b8'
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse coordinates for fluid liquid lag effect
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // 1. Draw 3D Mouse Liquid Spotlight Radial Gradient
      const spotlightRadius = 320;
      const spotGrad = ctx.createRadialGradient(mx, my, 10, mx, my, spotlightRadius);
      spotGrad.addColorStop(0, 'rgba(212, 175, 55, 0.14)'); // Liquid Gold Core
      spotGrad.addColorStop(0.4, 'rgba(226, 232, 240, 0.06)'); // Brushed Silver Rim
      spotGrad.addColorStop(1, 'rgba(5, 5, 7, 0)');

      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(mx, my, spotlightRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw 3D Perspective Grid with Mouse Surface Distortion
      ctx.save();
      const horizon = height * 0.5;
      const focalLength = 400;

      ctx.lineWidth = 1;

      // Grid spacing with time velocity
      const gridSpacing = 45;
      const offset = (time * 25) % gridSpacing;

      for (let z = 20; z < 900; z += gridSpacing) {
        const adjustedZ = z - offset;
        if (adjustedZ <= 0) continue;
        const scale = focalLength / (focalLength + adjustedZ);
        const y = horizon + (height - horizon) * scale;
        if (y > height || y < horizon) continue;

        // Mouse tilt effect on grid lines
        const distToMouseY = Math.abs(y - my);
        const influence = Math.max(0, 1 - distToMouseY / 250);

        ctx.strokeStyle = `rgba(212, 175, 55, ${0.03 + influence * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(0, y + influence * (my > y ? 8 : -8));
        ctx.lineTo(width, y + influence * (my > y ? 8 : -8));
        ctx.stroke();
      }

      // Vanishing Perspective Lines radiating toward mouse
      const numVanishingLines = 14;
      const angleStep = (Math.PI * 2) / numVanishingLines;
      for (let i = 0; i < numVanishingLines; i++) {
        const angle = i * angleStep + time * 0.05;
        const x2 = mx + Math.cos(angle) * width * 1.2;
        const y2 = my + Math.sin(angle) * height * 1.2;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.03)' : 'rgba(203, 213, 225, 0.02)';
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render 3D Liquid Gold & Metallic Silver Particles reacting to Mouse
      particles.forEach((p, idx) => {
        // Natural drift
        p.x += p.baseVx + p.vx;
        p.y += p.baseVy + p.vy;

        // Dampen velocity impulse
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse Repulsion & Attract Physics in 3D
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 220;

        if (dist < maxDist && dist > 5) {
          const force = (1 - dist / maxDist) * 1.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

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
            ctx.strokeStyle = p.type === 'gold' ? `rgba(212, 175, 55, ${lineAlpha})` : `rgba(226, 232, 240, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.lineTo((p2.x - width / 2) * scale + width / 2, (p2.y - height / 2) * scale + height / 2);
            ctx.stroke();
          }
        }

        // Render Liquid Gold or Silver Metallic Sphere
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);

        if (p.type === 'gold') {
          ctx.fillStyle = p.goldColor;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = radius * 5;
        } else {
          ctx.fillStyle = p.silverColor;
          ctx.shadowColor = '#e2e8f0';
          ctx.shadowBlur = radius * 4;
        }
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Dynamic 3D Liquid Gold & Metallic Silver Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-slate-200/10 via-amber-500/10 to-transparent blur-3xl pointer-events-none"
        style={{ animation: 'pulse 8s infinite alternate' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-slate-900/40 blur-[130px] pointer-events-none" />

      {/* Interactive 3D Canvas Mesh */}
      <canvas ref={canvasRef} className="w-full h-full opacity-80" />
    </div>
  );
};

