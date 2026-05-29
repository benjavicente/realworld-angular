import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CheckoutProgressStepperStatus = 'success' | 'error' | null;

@Component({
  selector: 'rw-checkout-progress-stepper',
  template: `
    @if (status() === 'error') {
      <span
        class="flex size-6 shrink-0 items-center justify-center rounded-full bg-error text-xs font-bold text-text-on-primary"
        aria-hidden="true"
        >!</span
      >
    } @else if (status() === 'success') {
      <span
        class="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-xs font-bold text-text-on-primary"
        aria-hidden="true"
        >✓</span
      >
    } @else {
      <span class="checkout-step__number">{{ order() }}</span>
    }
    <span>{{ label() }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex select-none items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-muted',
    '[class.checkout-step--active]': 'active()',
  },
})
export class CheckoutProgressStepper {
  public readonly order = input.required<number>();
  public readonly label = input.required<string>();
  public readonly active = input(false);
  public readonly status = input<CheckoutProgressStepperStatus>(null);
}
