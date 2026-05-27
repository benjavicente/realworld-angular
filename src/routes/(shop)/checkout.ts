import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import {
  Link,
  createFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { map, Observable } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { injectCartClient, injectCartClientState, injectCartPreview } from './-store/inject-cart';
import { Callout } from '../../lib/components/callout/callout';
import { Input } from '../../lib/components/input/input';
import { Textarea } from '../../lib/components/textarea/textarea';
import { Button } from '../../lib/components/button/button';
import { PhotonLocationField } from '../../lib/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../lib/components/photon-location-field/photon-location-field';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../lib/components/confirm-dialog/confirm-dialog';
import type { Address } from '../../lib/models/address.model';
import { injectMutation } from '@benjavicente/angular-query-experimental';
import { createOrderMutationOptions } from '../../lib/api/api-mutations';
import { requireAuth, requireCart } from '../-guards';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import {
  composeValidators,
  maxTextLength,
  requiredText,
  requiredValue,
  validateSubmitFields,
} from '../../lib/forms/tanstack-form';

export const Route = createFileRoute('/(shop)/checkout')({
  beforeLoad: ({ context }) => {
    requireAuth(context);
    requireCart(context);
  },
  component: () => CheckoutPage,
});

interface CheckoutForm {
  delivery: {
    location: LocationValue | null;
    street: string;
  };
  notes: string;
  useSameAsBilling: boolean;
  billing: {
    location: LocationValue | null;
    street: string;
  };
}

@Component({
  selector: 'rw-checkout-page',
  imports: [
    Link,
    DecimalPipe,
    TanStackField,
    Input,
    Textarea,
    Button,
    Callout,
    PhotonLocationField,
    EmptyState,
  ],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <h1 class="mb-8 text-2xl">Checkout</h1>

        @if (cartClient.isEmpty()) {
          <rw-empty-state
            icon="empty-shopping-cart"
            title="Your cart is empty"
            text="Add pizza from a pizzeria menu before you can check out."
          >
            <a [link]="{ to: '/' }">Browse pizzerias</a>
          </rw-empty-state>
        } @else {
          @let data = cartPreview.cart()!;
          <div class="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_320px]">
            <section>
              <h2 class="mb-5 text-lg font-semibold">Delivery details</h2>

              <form class="flex flex-col gap-4" (submit)="handleSubmit($event)">
                @if (submitError()) {
                  <rw-callout variant="error" [message]="submitError()" />
                }

                <fieldset
                  class="m-0 flex flex-col gap-4 rounded-md border border-border px-5 pb-5 pt-4"
                >
                  <legend class="px-2 text-sm font-semibold text-text">Delivery address</legend>
                  <ng-container
                    [tanstackField]="checkoutForm"
                    name="delivery.location"
                    [validators]="{ onChange: requiredLocation, onSubmit: requiredLocation }"
                    #deliveryLocation="field"
                  >
                    <rw-photon-location-field
                      label="City and country"
                      [required]="true"
                      [field]="deliveryLocation.api"
                    />
                  </ng-container>
                  <ng-container
                    [tanstackField]="checkoutForm"
                    name="delivery.street"
                    [validators]="{ onChange: streetValidator, onSubmit: streetValidator }"
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

                <fieldset
                  class="m-0 flex flex-col gap-4 rounded-md border border-border px-5 pb-5 pt-4"
                >
                  <legend class="px-2 text-sm font-semibold text-text">Billing address</legend>
                  <ng-container
                    [tanstackField]="checkoutForm"
                    name="useSameAsBilling"
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

                  @if (!checkoutFormState().values.useSameAsBilling) {
                    <div class="flex flex-col gap-4 border-t border-dashed border-border pt-2">
                      <ng-container
                        [tanstackField]="checkoutForm"
                        name="billing.location"
                        [validators]="{
                          onChange: requiredBillingLocation,
                          onSubmit: requiredBillingLocation,
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
                        [tanstackField]="checkoutForm"
                        name="billing.street"
                        [validators]="{
                          onChange: billingStreetValidator,
                          onSubmit: billingStreetValidator,
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

                <ng-container
                  [tanstackField]="checkoutForm"
                  name="notes"
                  [validators]="{ onChange: maxNotes }"
                  #notes="field"
                >
                  <rw-textarea
                    label="Order notes"
                    [field]="notes.api"
                    placeholder="Any special instructions?"
                    [maxLength]="300"
                  />
                </ng-container>

                <rw-button
                  class="self-end"
                  type="button"
                  [isLoading]="checkoutFormState().isSubmitting"
                  (click)="handleSubmit($event)"
                >
                  Place order
                </rw-button>
              </form>
            </section>

            <aside class="sticky top-20 rounded-lg border border-border bg-surface p-6">
              <h2 class="mb-5 text-lg font-semibold">Order summary</h2>
              <p class="mb-4 text-sm text-text-muted">{{ data.pizzeria.name }}</p>
              <ul class="mb-4 flex list-none flex-col gap-2">
                @for (item of data.items; track item.id) {
                  <li class="flex justify-between text-sm">
                    <span>{{ item.quantity }}× {{ item.pizza.name }}</span>
                    <span>€{{ item.totalPrice | number: '1.2-2' }}</span>
                  </li>
                }
              </ul>
              <div
                class="flex justify-between border-t border-border pt-3 text-base [&_strong]:text-lg [&_strong]:text-primary"
              >
                <span>Total</span>
                <strong>€{{ data.total | number: '1.2-2' }}</strong>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckoutPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly title = inject(Title);
  protected readonly cart = injectCartClient();
  protected readonly cartClient = injectCartClientState();
  protected readonly cartPreview = injectCartPreview();
  private readonly navigate = injectNavigate();
  private readonly dialog = inject(Dialog);
  private readonly createOrderMutation = injectMutation(() =>
    createOrderMutationOptions(this.apiFetch),
  );

  /** Set before navigating away after a successful order so {@link canDeactivate} does not prompt. */
  private readonly submitted = signal(false);

  protected readonly submitError = signal('');

  protected readonly checkoutForm = injectForm({
    defaultValues: {
      delivery: { location: null, street: '' },
      billing: { location: null, street: '' },
      useSameAsBilling: true,
      notes: '',
    } satisfies CheckoutForm,
    onSubmit: async ({ value: formValue }) => {
      this.submitError.set('');
      const delivery: Address = {
        street: formValue.delivery.street.trim(),
        city: formValue.delivery.location!.city.trim(),
        country: formValue.delivery.location!.country.trim(),
      };
      const billing: Address | undefined = !formValue.useSameAsBilling
        ? {
            street: formValue.billing.street.trim(),
            city: formValue.billing.location!.city.trim(),
            country: formValue.billing.location!.country.trim(),
          }
        : undefined;

      const payload = {
        pizzeriaId: this.cartClient.pizzeria()!.id,
        deliveryAddress: delivery,
        ...(billing ? { billingAddress: billing } : {}),
        notes: formValue.notes?.trim() || undefined,
        items: this.cartClient.items().map((item) => ({
          pizzaId: item.pizzaId,
          quantity: item.quantity,
          selectedSizeId: item.selectedSizeId ?? undefined,
          selectedOptionIds: item.selectedOptionIds,
        })),
      };

      try {
        const order = await this.createOrderMutation.mutateAsync(payload);
        this.cart.clear();
        this.submitted.set(true);
        void this.navigate({ to: '/orders/' + order.id });
      } catch {
        this.submitError.set('Order failed. Please try again.');
      }
    },
  });
  protected readonly checkoutFormState = injectStore(this.checkoutForm);
  protected readonly requiredLocation = requiredValue('Choose a location from the list');
  protected readonly requiredStreet = requiredText('Street address is required');
  protected readonly maxStreet = maxTextLength(250, 'Max 250 characters');
  protected readonly streetValidator = composeValidators(this.requiredStreet, this.maxStreet);
  protected readonly maxNotes = maxTextLength(300, 'Max 300 characters');
  protected readonly requiredBillingLocation = ({ value }: { value: LocationValue | null }) =>
    this.checkoutForm.state.values.useSameAsBilling
      ? undefined
      : requiredValue('Choose a location from the list')({ value });
  protected readonly requiredBillingStreet = ({ value }: { value: string }) =>
    this.checkoutForm.state.values.useSameAsBilling
      ? undefined
      : requiredText('Street address is required')({ value });
  protected readonly billingStreetValidator = composeValidators(
    this.requiredBillingStreet,
    this.maxStreet,
  );

  public constructor() {
    effect(() => {
      const name = this.cartPreview.cart()?.pizzeria.name;
      this.title.setTitle(name ? `Checkout - ${name}` : 'Checkout');
    });

    effect(() => {
      const useSameAsBilling = this.checkoutFormState().values.useSameAsBilling;
      if (useSameAsBilling) {
        const current = this.checkoutForm.state.values;
        if (current.billing.location !== null || current.billing.street !== '') {
          this.checkoutForm.setFieldValue('billing', { location: null, street: '' });
        }
      }
    });
  }

  public canDeactivate(): boolean | Observable<boolean> {
    if (this.submitted() || !this.checkoutFormState().isDirty) {
      return true;
    }
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Leave checkout?',
        message:
          'You have entered checkout details. Leave this page? Your draft will not be saved.',
        cancelLabel: 'Stay',
        confirmLabel: 'Leave',
      },
    });
    return ref.closed.pipe(map((result) => result === 'confirmed'));
  }

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (
      await validateSubmitFields(this.checkoutForm, [
        'delivery.location',
        'delivery.street',
        'billing.location',
        'billing.street',
        'notes',
      ])
    ) {
      await this.checkoutForm.handleSubmit();
    }
  }
}
