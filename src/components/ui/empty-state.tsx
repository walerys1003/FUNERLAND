import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'inline';
};

/**
 * Empty state — used when a list/grid has no items.
 * Accessible (role="status"), grief-safe wording in description recommended.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'text-center',
        variant === 'card' && 'card p-8 md:p-10',
        variant === 'default' && 'py-12 px-4',
        variant === 'inline' && 'py-6',
        className,
      )}
    >
      {icon && (
        <div
          className="mx-auto w-12 h-12 rounded-2xl bg-cream-dark/40 text-text-muted flex items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className={cn('font-heading mt-3', variant === 'inline' ? 'text-[16px]' : 'text-[18px]')}>
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-text-secondary mx-auto leading-relaxed',
            variant === 'inline' ? 'text-[13px] mt-1 max-w-sm' : 'text-[14px] mt-2 max-w-md',
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
