import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import type { OrderStatus } from '../../../routes/(orders)/-models/order.models';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PREPARING: { label: 'Preparing', variant: 'info' },
  READY: { label: 'Ready', variant: 'success' },
  DELIVERED: { label: 'Delivered', variant: 'primary' },
  CANCELLED: { label: 'Cancelled', variant: 'default' },
};

@Component({
  selector: 'rw-status-badge',
  template: ` {{ config().label }} `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'badgeClasses()',
  },
})
export class StatusBadge {
  public readonly status = input.required<OrderStatus>();

  protected readonly config = computed<{ label: string; variant: BadgeVariant }>(
    () => STATUS_CONFIG[this.status()] ?? STATUS_CONFIG.PENDING,
  );

  protected readonly badgeClasses = computed<string>(() =>
    [
      'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.025em]',
      badgeVariantClasses[this.config().variant],
    ].join(' '),
  );
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-alt text-text-muted',
  primary: 'bg-primary text-text-on-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning-text',
  error: 'bg-error-bg text-error',
  info: 'bg-info-bg text-info',
};
