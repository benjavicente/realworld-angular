import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminOrderListItem } from '../../-models/order.models';
import { Dialog } from '@angular/cdk/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../lib/components/confirm-dialog/confirm-dialog';
import { StatusBadge } from '../../../../lib/components/status-badge/status-badge';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { injectMutation } from '@benjavicente/angular-query-experimental';
import {
  cancelOrderMutationOptions,
  deliverOrderMutationOptions,
} from '../../../../lib/api/api-mutations';
import { icons } from '../../../../lib/assets';

@Component({
  selector: 'tr[rw-admin-order-row]',
  imports: [DecimalPipe, DatePipe, StatusBadge],
  template: `
    <td class="max-w-56 truncate font-medium text-text">
      {{ order().createdAt | date: 'dd MMM, HH:mm' }}
    </td>
    <td class="whitespace-nowrap tabular-nums text-text-muted">{{ order().items.length }} pizza(s)</td>
    <td class="whitespace-nowrap tabular-nums text-text-muted">€{{ order().total | number: '1.2-2' }}</td>
    <td><rw-status-badge [status]="order().status" /></td>
    <td class="w-px whitespace-nowrap ps-4 text-end align-middle">
      <span class="inline-flex items-center justify-end gap-2">
        @if (order().status !== 'CANCELLED' && order().status !== 'DELIVERED') {
          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:text-primary-light hover:underline inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface p-0 transition hover:border-primary hover:bg-surface-alt"
            aria-label="Mark order as delivered"
            (click)="promptDeliverOrder()"
          >
            <img [src]="icons.delivery" alt="" width="20" height="20" aria-hidden="true" />
          </button>
        }
        @if (order().status === 'PENDING') {
          <button
            type="button"
            class="inline-flex items-center gap-1 text-sm font-medium text-error no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-50 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface p-0 transition hover:border-primary hover:bg-surface-alt"
            aria-label="Cancel pending order"
            (click)="promptCancelOrder()"
          >
            <img [src]="icons.cancel" alt="" width="20" height="20" aria-hidden="true" />
          </button>
        }
      </span>
    </td>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderRow {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly dialog = inject(Dialog);
  private readonly cancelOrderMutation = injectMutation(() =>
    cancelOrderMutationOptions(this.apiFetch),
  );
  private readonly deliverOrderMutation = injectMutation(() =>
    deliverOrderMutationOptions(this.apiFetch),
  );

  public readonly order = input.required<AdminOrderListItem>();
  protected readonly icons = icons;

  public readonly updateOrder = output<AdminOrderListItem>();
  public readonly showFeedback = output<{ variant: 'error' | 'success'; message: string }>();

  public promptCancelOrder(): void {
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Cancel order?',
        message: 'Cancel this pending order? This sets the status to cancelled.',
        cancelLabel: 'Keep order',
        confirmLabel: 'Cancel order',
      },
    });

    ref.closed.subscribe(async (result) => {
      if (result !== 'confirmed') return;
      try {
        const updated = await this.cancelOrderMutation.mutateAsync(this.order().id);
        this.updateOrder.emit(updated);
        this.showFeedback.emit({ variant: 'success', message: 'Order cancelled.' });
      } catch (err: unknown) {
        this.showFeedback.emit({
          variant: 'error',
          message: err instanceof Error && err.message ? err.message : 'Failed',
        });
      }
    });
  }

  public promptDeliverOrder(): void {
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Mark delivered?',
        message: 'Mark this order as delivered?',
        cancelLabel: 'Not yet',
        confirmLabel: 'Mark delivered',
      },
    });

    ref.closed.subscribe(async (result) => {
      if (result !== 'confirmed') return;
      try {
        const updated = await this.deliverOrderMutation.mutateAsync(this.order().id);
        this.updateOrder.emit(updated);
        this.showFeedback.emit({ variant: 'success', message: 'Order marked as delivered.' });
      } catch (err: unknown) {
        this.showFeedback.emit({
          variant: 'error',
          message: err instanceof Error && err.message ? err.message : 'Failed',
        });
      }
    });
  }
}
