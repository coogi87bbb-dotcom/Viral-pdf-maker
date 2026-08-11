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
}

export const MotionPanel3D: React.FC<MotionPanel3DProps> = ({
  children,
  delay = 0,
  depth = -80,
  tiltX = 12,
  className = '',
  viewportOnce = true,
  frosted = true,
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
          whileHover || {
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
            ? 'bg-surface-1/80 backdrop-blur-[20px] backdrop-saturate-150 border border-slate-800/80 shadow-[var(--shadow-floating)] ring-1 ring-white/5 rounded-2xl p-1.5 sm:p-2.5'
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
