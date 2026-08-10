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
            transition: { duration: 0.3, ease: 'easeOut' },
          }
        }
        viewport={{ once: viewportOnce, margin: '-40px' }}
        transition={{
          duration: 0.7,
          delay: delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`${
          frosted
            ? 'bg-[#08090e]/80 backdrop-blur-[20px] backdrop-saturate-150 border border-slate-800/80 shadow-[0_16px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/5 rounded-2xl p-1.5 sm:p-2.5 transition-all'
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
