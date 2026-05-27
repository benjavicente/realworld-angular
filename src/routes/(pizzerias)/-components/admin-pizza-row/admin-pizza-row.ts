import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { Pizza } from '../../-models/pizza.models';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../lib/components/confirm-dialog/confirm-dialog';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { injectMutation } from '@benjavicente/angular-query-experimental';
import { deletePizzaMutationOptions } from '../../../../lib/api/api-mutations';

@Component({
  selector: '[rw-admin-pizza-row]',
  imports: [DecimalPipe],
  template: `
    <td class="max-w-56 truncate font-medium text-text" [attr.title]="pizza().name">
      {{ pizza().name }}
    </td>
    <td class="whitespace-nowrap text-text-muted">€{{ pizza().basePrice | number: '1.2-2' }}</td>
    <td class="whitespace-nowrap text-text-muted">€{{ menuListTotalPrice() | number: '1.2-2' }}</td>
    <td class="max-w-[22rem] text-sm leading-[1.45] text-text-muted">
      {{ pizza().toppings.length ? toppingLabels() : '—' }}
    </td>
    <td class="w-px whitespace-nowrap ps-4 text-end align-middle">
      <span class="inline-flex items-center justify-end gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:text-primary-light hover:underline inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface p-0 transition hover:border-primary hover:bg-surface-alt"
          [attr.aria-label]="'Edit ' + pizza().name"
          (click)="edit.emit(pizza())"
        >
          <img src="/icons/edit.svg" alt="" width="20" height="20" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-sm font-medium text-error no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-50 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface p-0 transition hover:border-primary hover:bg-surface-alt"
          [disabled]="deleting()"
          [attr.aria-label]="'Delete ' + pizza().name"
          (click)="promptDelete()"
        >
          <img src="/icons/delete.svg" alt="" width="20" height="20" aria-hidden="true" />
        </button>
      </span>
    </td>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-label]': '"Pizza: " + pizza().name' },
})
export class AdminPizzaRow {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly dialog = inject(Dialog);
  private readonly deletePizzaMutation = injectMutation(() =>
    deletePizzaMutationOptions(this.apiFetch),
  );

  readonly pizza = input.required<Pizza>();

  readonly edit = output<Pizza>();
  readonly deleted = output<Pizza>();
  readonly deleteError = output<string>();

  protected readonly deleting = signal(false);

  protected toppingLabels(): string {
    return (this.pizza().toppings ?? []).map((t) => t.label).join(', ');
  }

  protected menuListTotalPrice(): number {
    const pizza = this.pizza();
    return pizza.basePrice + (pizza.toppings ?? []).reduce((sum, t) => sum + t.price, 0);
  }

  protected promptDelete(): void {
    const pizza = this.pizza();
    const message = `Delete "${pizza.name}"? This removes the pizza from the menu. Customers can no longer order it.`;
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete pizza?', message, cancelLabel: 'Cancel', confirmLabel: 'Delete' },
    });

    ref.closed.subscribe(async (result) => {
      if (result !== 'confirmed' || this.deleting()) return;
      this.deleteError.emit('');
      this.deleting.set(true);
      try {
        await this.deletePizzaMutation.mutateAsync(pizza.id);
        this.deleted.emit(pizza);
      } catch (err: unknown) {
        this.deleteError.emit(err instanceof Error && err.message ? err.message : 'Delete failed');
      } finally {
        this.deleting.set(false);
      }
    });
  }
}
