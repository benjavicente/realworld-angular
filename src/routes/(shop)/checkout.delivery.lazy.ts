import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { createLazyFileRoute } from '@benjavicente/angular-router-experimental';
import { TanStackField } from '@tanstack/angular-form';
import { Input } from '../../lib/components/input/input';
import { Button } from '../../lib/components/button/button';
import { PhotonLocationField } from '../../lib/components/photon-location-field/photon-location-field';
import { CHECKOUT_SCOPE } from './-models/checkout-scope';

export const Route = createLazyFileRoute('/(shop)/checkout/delivery')({
  component: () => CheckoutDeliveryStep,
});

@Component({
  selector: 'rw-checkout-delivery-step',
  imports: [TanStackField, Input, Button, PhotonLocationField],
  template: `
    <h2 class="mb-5 text-lg font-semibold">Delivery details</h2>

    <fieldset class="m-0 flex flex-col gap-4 rounded-md border border-border px-5 pb-5 pt-4">
      <legend class="px-2 text-sm font-semibold text-text">Delivery address</legend>
      <ng-container
        [tanstackField]="checkout.checkoutForm"
        name="delivery.location"
        [validators]="{ onChange: checkout.requiredLocation, onSubmit: checkout.requiredLocation }"
        #deliveryLocation="field"
      >
        <rw-photon-location-field
          label="City and country"
          [required]="true"
          [field]="deliveryLocation.api"
        />
      </ng-container>
      <ng-container
        [tanstackField]="checkout.checkoutForm"
        name="delivery.street"
        [validators]="{ onChange: checkout.streetValidator, onSubmit: checkout.streetValidator }"
        #deliveryStreet="field"
      >
        <rw-input
          label="Street address"
          [isRequired]="true"
          [field]="deliveryStreet.api"
          placeholder="Street, number, building, floor…"
        />
      </ng-container>
    </fieldset>

    <fieldset class="m-0 flex flex-col gap-4 rounded-md border border-border px-5 pb-5 pt-4">
      <legend class="px-2 text-sm font-semibold text-text">Billing address</legend>
      <ng-container
        [tanstackField]="checkout.checkoutForm"
        name="delivery.useSameAsBilling"
        #same="field"
      >
        <label class="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            class="mt-[0.2rem] size-4 cursor-pointer accent-primary"
            [checked]="same.api.state.value"
            (blur)="same.api.handleBlur()"
            (change)="same.api.handleChange($any($event.target).checked)"
          />
          <span class="flex flex-col gap-1 text-sm text-text">
            Same as delivery address
            <span class="text-xs text-text-muted">
              Uncheck to bill to a different address for this order.
            </span>
          </span>
        </label>
      </ng-container>

      @if (!checkout.checkoutFormState().values.delivery.useSameAsBilling) {
        <div class="flex flex-col gap-4 border-t border-dashed border-border pt-2">
          <ng-container
            [tanstackField]="checkout.checkoutForm"
            name="delivery.billingLocation"
            [validators]="{
              onChange: checkout.requiredBillingLocation,
              onSubmit: checkout.requiredBillingLocation,
            }"
            #billingLocation="field"
          >
            <rw-photon-location-field
              label="City and country"
              [required]="true"
              [field]="billingLocation.api"
            />
          </ng-container>
          <ng-container
            [tanstackField]="checkout.checkoutForm"
            name="delivery.billingStreet"
            [validators]="{
              onChange: checkout.billingStreetValidator,
              onSubmit: checkout.billingStreetValidator,
            }"
            #billingStreet="field"
          >
            <rw-input
              label="Street address"
              [isRequired]="true"
              [field]="billingStreet.api"
              placeholder="Street, number, building, floor…"
            />
          </ng-container>
        </div>
      }
    </fieldset>

    <div class="mt-6 flex justify-end">
      <button rw-button type="button" (click)="goNext()">Next</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckoutDeliveryStep {
  protected readonly checkout = inject(CHECKOUT_SCOPE);

  protected async goNext(): Promise<void> {
    await this.checkout.validateStep('delivery');
  }
}
