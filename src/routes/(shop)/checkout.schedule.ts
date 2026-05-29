import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { TanStackField } from '@tanstack/angular-form';
import { Input } from '../../lib/components/input/input';
import { Textarea } from '../../lib/components/textarea/textarea';
import { Button } from '../../lib/components/button/button';
import { CHECKOUT_SCOPE } from './-models/checkout-scope';

export const Route = createFileRoute('/(shop)/checkout/schedule')({
  component: () => CheckoutScheduleStep,
});

@Component({
  selector: 'rw-checkout-schedule-step',
  imports: [TanStackField, Input, Textarea, Button],
  template: `
    <h2 class="mb-5 text-lg font-semibold">Delivery schedule</h2>

    <fieldset class="m-0 flex flex-col gap-4 rounded-md border border-border px-5 pb-5 pt-4">
      <legend class="px-2 text-sm font-semibold text-text">When should we deliver?</legend>

      <ng-container
        [tanstackField]="checkout.checkoutForm"
        name="schedule.type"
        #scheduleType="field"
      >
        <label
          class="flex cursor-pointer gap-3 rounded-md border border-border p-4 transition has-[:checked]:border-primary has-[:checked]:bg-surface-alt"
        >
          <input
            type="radio"
            class="mt-1 accent-primary"
            name="schedule-type"
            value="asap"
            [checked]="scheduleType.api.state.value === 'asap'"
            (change)="scheduleType.api.handleChange('asap')"
          />
          <span class="flex flex-col gap-1">
            <span class="font-medium text-text">As soon as possible</span>
            <span class="text-xs text-text-muted"
              >We'll prepare and deliver your order right away.</span
            >
          </span>
        </label>

        <label
          class="flex cursor-pointer gap-3 rounded-md border border-border p-4 transition has-[:checked]:border-primary has-[:checked]:bg-surface-alt"
        >
          <input
            type="radio"
            class="mt-1 accent-primary"
            name="schedule-type"
            value="scheduled"
            [checked]="scheduleType.api.state.value === 'scheduled'"
            (change)="scheduleType.api.handleChange('scheduled')"
          />
          <span class="flex flex-col gap-1">
            <span class="font-medium text-text">Schedule for later</span>
            <span class="text-xs text-text-muted">Pick a specific date and time.</span>
          </span>
        </label>
      </ng-container>

      @if (checkout.checkoutFormState().values.schedule.type === 'scheduled') {
        <div class="grid gap-4 sm:grid-cols-2">
          <ng-container
            [tanstackField]="checkout.checkoutForm"
            name="schedule.date"
            [validators]="{
              onChange: checkout.requiredScheduleDate,
              onSubmit: checkout.requiredScheduleDate,
            }"
            #scheduleDate="field"
          >
            <rw-input label="Delivery date" type="date" [isRequired]="true" [field]="scheduleDate.api" />
          </ng-container>
          <ng-container
            [tanstackField]="checkout.checkoutForm"
            name="schedule.time"
            [validators]="{
              onChange: checkout.requiredScheduleTime,
              onSubmit: checkout.requiredScheduleTime,
            }"
            #scheduleTime="field"
          >
            <rw-input label="Delivery time" type="time" [isRequired]="true" [field]="scheduleTime.api" />
          </ng-container>
        </div>
      }
    </fieldset>

    <ng-container
      [tanstackField]="checkout.checkoutForm"
      name="notes"
      [validators]="{ onChange: checkout.maxNotes }"
      #notes="field"
    >
      <rw-textarea
        label="Order notes"
        [field]="notes.api"
        placeholder="Allergies, special requests, or anything we should know…"
        [maxLength]="300"
      />
    </ng-container>

    <div class="mt-6 flex justify-end gap-3">
      <button rw-button type="button" variant="outlined" (click)="checkout.goToStep('delivery')">
        Back
      </button>
      <button rw-button type="button" (click)="goNext()">Next</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckoutScheduleStep {
  protected readonly checkout = inject(CHECKOUT_SCOPE);

  protected async goNext(): Promise<void> {
    await this.checkout.validateStep('schedule');
  }
}
