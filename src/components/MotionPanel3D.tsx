import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface MotionPanel3DProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  depth?: number;
  tiltX?: number;
  className?: string;
  viewportOnce?: boolean;
  frosted?: boolean;
  /**
   * Default true — applies the whileHover 3D tilt/scale whenever the
   * pointer is anywhere over this panel. Fine for a small, genuinely
   * "hoverable" card (a feature tile, a stat card). Set to false when this
   * wraps an entire tool's full body/workspace (see every `appMode`
   * section in App.tsx): with hoverTilt on, moving the mouse anywhere
   * while using the tool continuously tilts/scales the WHOLE panel — every
   * button inside it included — which reads as "the background is
   * moving" and, because it's a live transform on an ancestor of every
   * click target, can make clicks land off their visual target mid-tilt.
   * That combination was the real root cause behind repeated "GigScale /
   * DigitalKitStudio buttons don't work" reports.
   */
  hoverTilt?: boolean;
}

export const MotionPanel3D: React.FC<MotionPanel3DProps> = ({
  children,
  delay = 0,
  depth = -80,
  tiltX = 12,
  className = '',
  viewportOnce = true,
  frosted = true,
  hoverTilt = true,
  whileHover,
  ...props
}) => {
  return (
    <div style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          rotateX: tiltX,
          scale: 0.96,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
        }}
        whileHover={
          !hoverTilt
            ? undefined
            : whileHover || {
                scale: 1.02,
                rotateY: 2,
                transition: { type: 'spring', stiffness: 300, damping: 24 },
              }
        }
        viewport={{ once: viewportOnce, margin: '-40px' }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 18,
          delay: delay,
        }}
        className={`${
          frosted
            ? 'bg-surface-1/80 backdrop-blur-[20px] backdrop-saturate-150 border border-hairline shadow-[var(--shadow-panel)] ring-1 ring-white/5 rounded-2xl p-1.5 sm:p-2.5'
            : ''
        } ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default MotionPanel3D;
