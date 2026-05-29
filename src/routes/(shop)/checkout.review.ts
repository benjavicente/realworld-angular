import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { TanStackField } from '@tanstack/angular-form';
import { Input } from '../../lib/components/input/input';
import { Button } from '../../lib/components/button/button';
import { injectCartPreview } from './-store/inject-cart';
import { CHECKOUT_SCOPE } from './-models/checkout-scope';

export const Route = createFileRoute('/(shop)/checkout/review')({
  component: () => CheckoutReviewStep,
});

@Component({
  selector: 'rw-checkout-review-step',
  imports: [DecimalPipe, TanStackField, Input, Button],
  template: `
    <h2 class="mb-5 text-lg font-semibold">Review your order</h2>

    @if (cartPreview.cart(); as data) {
      <section class="mb-6">
        <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Items</h3>
        <ul class="flex list-none flex-col gap-4">
          @for (item of data.items; track item.id) {
            <li class="rounded-md border border-border bg-surface-alt p-4">
              <div class="flex justify-between gap-3 font-semibold">
                <span class="tabular-nums">{{ item.quantity }}× {{ item.pizza.name }}</span>
                <span class="tabular-nums">€{{ item.totalPrice | number: '1.2-2' }}</span>
              </div>
              @if (item.size) {
                <p class="mt-1 text-xs text-text-muted">
                  {{ item.size.label }} — <span class="tabular-nums">€{{ item.size.price | number: '1.2-2' }}</span>
                </p>
              }
              @if (item.extraToppings.length > 0) {
                <p class="mt-1 text-xs text-text-muted">
                  @for (topping of item.extraToppings; track topping.id; let last = $last) {
                    + {{ topping.label }} (<span class="tabular-nums">€{{ topping.price | number: '1.2-2' }}</span>)@if (!last) {
                      ,
                    }
                  }
                </p>
              }
            </li>
          }
        </ul>
      </section>

      <fieldset class="m-0 flex flex-col gap-3 rounded-md border border-border px-5 pb-5 pt-4">
        <legend class="px-2 text-sm font-semibold text-text">Tip (optional)</legend>
        <ng-container [tanstackField]="checkout.checkoutForm" name="tip.type" #tipType="field">
          <div class="flex flex-wrap gap-2">
            <label
              class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-surface-alt"
            >
              <input
                type="radio"
                name="tip-type"
                value="none"
                class="accent-primary"
                [checked]="tipType.api.state.value === 'none'"
                (change)="tipType.api.handleChange('none')"
              />
              No tip
            </label>
            @for (opt of tipOptions; track opt.value) {
              <label
                class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm has-checked:border-primary has-[:checked]:bg-surface-alt"
              >
                <input
                  type="radio"
                  name="tip-type"
                  [value]="opt.value"
                  class="accent-primary"
                  [checked]="tipType.api.state.value === opt.value"
                  (change)="tipType.api.handleChange(opt.value)"
                />
                {{ opt.label }}
              </label>
            }
            <label
              class="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm has-checked:border-primary has-[:checked]:bg-surface-alt"
            >
              <input
                type="radio"
                name="tip-type"
                value="custom"
                class="accent-primary"
                [checked]="tipType.api.state.value === 'custom'"
                (change)="tipType.api.handleChange('custom')"
              />
              Custom
            </label>
          </div>
        </ng-container>

        @if (checkout.checkoutFormState().values.tip.type === 'custom') {
          <ng-container
            [tanstackField]="checkout.checkoutForm"
            name="tip.customAmount"
            #tipAmount="field"
          >
            <rw-input
              label="Custom tip amount (€)"
              type="number"
              min="0"
              step="0.01"
              [field]="tipAmount.api"
            />
          </ng-container>
        }
      </fieldset>

      <dl class="mt-6 flex flex-col gap-2 text-sm">
        <div class="flex justify-between text-text-muted">
          <dt>Subtotal</dt>
          <dd class="tabular-nums">€{{ data.total | number: '1.2-2' }}</dd>
        </div>
        @if (checkout.tipAmount() > 0) {
          <div class="flex justify-between text-text-muted">
            <dt>Tip</dt>
            <dd class="tabular-nums">€{{ checkout.tipAmount() | number: '1.2-2' }}</dd>
          </div>
        }
        <div
          class="flex justify-between border-t border-border pt-2 text-base font-semibold text-primary"
        >
          <dt>Total</dt>
          <dd class="tabular-nums">€{{ checkout.totalWithTip() | number: '1.2-2' }}</dd>
        </div>
      </dl>

      <div class="mt-6 flex justify-end gap-3">
        <button rw-button type="button" variant="outlined" (click)="checkout.goToStep('schedule')">
          Back
        </button>
        <button
          rw-button
          type="button"
          [isLoading]="checkout.checkoutFormState().isSubmitting"
          (click)="placeOrder()"
        >
          <span class="tabular-nums">Place order — €{{ checkout.totalWithTip() | number: '1.2-2' }}</span>
        </button>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckoutReviewStep {
  protected readonly checkout = inject(CHECKOUT_SCOPE);
  protected readonly cartPreview = injectCartPreview();

  protected readonly tipOptions = [
    { value: 'ten' as const, label: '10%' },
    { value: 'fifteen' as const, label: '15%' },
    { value: 'twenty' as const, label: '20%' },
  ];

  protected async placeOrder(): Promise<void> {
    await this.checkout.placeOrder();
  }
}
