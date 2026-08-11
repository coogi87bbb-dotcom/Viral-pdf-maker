import React from 'react';

interface ModalShellProps {
  /**
   * Root id of the inner panel. Several modal ids (`export-pdf-modal`,
   * `doc-importer-modal`, `ai-enhancer-modal`) are referenced by the
   * `@media print` block in src/index.css — when migrating an existing
   * modal onto ModalShell, pass its exact existing id here, unchanged.
   */
  id?: string;
  children: React.ReactNode;
  /** Tailwind max-width class for the panel, e.g. "max-w-md", "max-w-2xl". */
  maxWidthClassName?: string;
  /** Adds flex flex-col max-h-[90vh] for modals with long, scrollable content. */
  scrollable?: boolean;
  /**
   * Opt-in only: pass a handler to close on backdrop click. Omit to leave
   * click-outside behavior exactly as the modal had before migration.
   */
  onBackdropClick?: () => void;
  className?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  id,
  children,
  maxWidthClassName = 'max-w-md',
  scrollable = false,
  onBackdropClick,
  className = '',
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-surface-0/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onBackdropClick}
    >
      <div
        id={id}
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface-2 border border-white/10 rounded-2xl w-full ${maxWidthClassName} shadow-[var(--shadow-floating)] text-ink-primary overflow-hidden ${
          scrollable ? 'flex flex-col max-h-[90vh]' : ''
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
