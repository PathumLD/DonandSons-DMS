'use client';

import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './button';

export interface InlineDetailPanelProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** e.g. max-w-4xl for wide tables */
  contentClassName?: string;
}

/**
 * Read-only detail region shown below the main list instead of a modal.
 */
export function InlineDetailPanel({
  title,
  open,
  onClose,
  children,
  footer,
  contentClassName = '',
}: InlineDetailPanelProps) {
  if (!open) return null;

  return (
    <section
      className={`rounded-xl border shadow-sm ${contentClassName}`.trim()}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
      role="region"
      aria-label={title}
    >
      <div
        className="flex items-start justify-between gap-3 px-4 py-3 sm:px-6 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-lg font-semibold pr-2" style={{ color: 'var(--foreground)' }}>
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="shrink-0"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      {footer ? (
        <div
          className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}
