import React from 'react';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article';
  padded?: boolean;
}

/**
 * A static (non-motion) surface card — `surface-2` + a brass-tinted layered
 * shadow, standardized padding/radius. Distinct from `MotionPanel3D`, which
 * carries a scroll-in + optional hover-tilt animation: reach for `Panel`
 * for small sub-cards (Home's quick-launch tiles, stat groupings, in-tool
 * summary blocks) that don't need — or shouldn't have — the 3D treatment.
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  as: Tag = 'div',
  padded = true,
  className = '',
  ...props
}) => {
  return (
    <Tag
      className={`bg-surface-2 border border-hairline rounded-2xl shadow-[var(--shadow-panel-brass)] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Panel;
