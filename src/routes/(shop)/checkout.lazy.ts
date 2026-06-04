import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  Link,
  Outlet,
  createLazyFileRoute,
  injectBlocker,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { NumberFormatPipe } from '../../lib/pipes/number/number.pipe';
import { firstValueFrom } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { TanStackWithForm, injectForm, injectStore } from '@tanstack/angular-form';
import { injectMutation, injectQuery } from '@benjavicente/angular-query';
import { cartPreviewQueryOptions } from '../../lib/api/api-queries';
import { createOrderMutationOptions } from '../../lib/api/api-mutations';
import type { Address } from '../../lib/models/address.model';
import type { LocationValue } from '../../lib/components/photon-location-field/photon-location-field';
import {
  composeValidators,
  maxTextLength,
  requiredText,
  requiredValue,
  validateSubmitFields,
} from '../../lib/forms/tanstack-form';
import { injectCartClient, injectCartClientState } from './-store/inject-cart';
import { Callout } from '../../lib/components/callout/callout';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Spinner } from '../../lib/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../lib/components/confirm-dialog/confirm-dialog';
import { CheckoutProgressStepper } from './-components/checkout-progress-stepper/checkout-progress-stepper';
import {
  blockedCheckoutStep,
  checkoutDefaultValues,
  parseCheckoutStep,
  type ValidatableStep,
  type WizardStep,
} from './-models/checkout-context';
import { CHECKOUT_SCOPE, type CheckoutScope } from './-models/checkout-scope';

const STEP_FIELDS: Record<ValidatableStep, readonly string[]> = {
  delivery: [
    'delivery.location',
    'delivery.street',
    'delivery.billingLocation',
    'delivery.billingStreet',
  ],
  schedule: ['schedule.type', 'schedule.date', 'schedule.time', 'notes'],
};

const NEXT_STEP: Record<ValidatableStep, WizardStep> = {
  delivery: 'schedule',
  schedule: 'review',
};

export const Route = createLazyFileRoute('/(shop)/checkout')({
  component: () => CheckoutLayoutPage,
});

@Component({
  selector: 'rw-checkout-layout',
  imports: [
    Link,
    Outlet,
    NumberFormatPipe,
    Callout,
    EmptyState,
    Spinner,
    CheckoutProgressStepper,
    TanStackWithForm,
  ],
  providers: [{ provide: CHECKOUT_SCOPE, useExisting: CheckoutLayoutPage }],
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
            <a [link]="{ to: '/pizzerias' }">Browse pizzerias</a>
          </rw-empty-state>
        } @else if (cartPreviewQuery.isPending() && !cartPreviewQuery.data()) {
          <div class="flex justify-center p-16" aria-label="Loading cart"><rw-spinner /></div>
        } @else if (cartPreviewQuery.isError() && !cartPreviewQuery.data()) {
          <rw-callout
            variant="error"
            heading="Could not load cart details"
            message="Your items are saved locally, but we could not reach the server."
          />
        } @else if (cartPreviewQuery.data(); as data) {
          <nav
            class="mb-8 flex flex-wrap items-center gap-2 text-sm"
            aria-label="Checkout progress"
          >
            <rw-checkout-progress-stepper
              [order]="1"
              label="Delivery & Billing"
              [active]="isCurrentStep('delivery')"
              [status]="stepStatus().delivery"
            />
            <span class="text-lg text-border select-none" aria-hidden="true">›</span>
            <rw-checkout-progress-stepper
              [order]="2"
              label="Schedule & Notes"
              [active]="isCurrentStep('schedule')"
              [status]="stepStatus().schedule"
            />
            <span class="text-lg text-border select-none" aria-hidden="true">›</span>
            <rw-checkout-progress-stepper
              [order]="3"
              label="Review & Pay"
              [active]="isCurrentStep('review')"
              [status]="stepStatus().review"
            />
          </nav>

          <div class="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_320px]">
            <section>
              @if (submitError()) {
                <rw-callout variant="error" [message]="submitError()" class="mb-4" />
              }
              <div [tanstackWithForm]="checkoutForm">
                <outlet />
              </div>
            </section>

            <aside class="sticky top-20 rounded-lg border border-border bg-surface p-6">
              <h2 class="mb-5 text-lg font-semibold">Order summary</h2>
              <p class="mb-4 text-sm text-text-muted">{{ data.pizzeria.name }}</p>
              <ul class="mb-4 flex list-none flex-col gap-2">
                @for (item of data.items; track item.id) {
                  <li class="flex justify-between gap-3 text-sm">
                    <span class="min-w-0 tabular-nums"
                      >{{ item.quantity }}× {{ item.pizza.name }}</span
                    >
                    <span class="tabular-nums">€{{ item.totalPrice | number: '1.2-2' }}</span>
                  </li>
                }
              </ul>
              <div
                class="flex justify-between border-t border-border pt-3 text-base [&_strong]:text-lg [&_strong]:text-primary"
              >
                <span>Total</span>
                <strong class="tabular-nums">€{{ totalWithTip() | number: '1.2-2' }}</strong>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayoutPage implements CheckoutScope {
  readonly #apiFetch = injectRouter().options.context.apiFetch;
  readonly #cart = injectCartClient();
  protected readonly cartClient = injectCartClientState();
  readonly #navigate = injectNavigate();
  readonly #router = injectRouter();
  readonly #dialog = inject(Dialog);

  protected readonly cartPreviewQuery = injectQuery(() =>
    cartPreviewQueryOptions(this.#apiFetch, this.cartClient.pizzeria(), this.cartClient.items()),
  );

  readonly #createOrderMutation = injectMutation(() => createOrderMutationOptions(this.#apiFetch));

  readonly stepStatus = signal<Record<WizardStep, 'success' | 'error' | null>>({
    delivery: null,
    schedule: null,
    review: null,
  });
  readonly submitted = signal(false);
  readonly submitError = signal('');

  readonly requiredLocation = requiredValue('Choose a location from the list');
  readonly requiredStreet = requiredText('Street address is required');
  readonly maxStreet = maxTextLength(250, 'Max 250 characters');
  readonly streetValidator = composeValidators(this.requiredStreet, this.maxStreet);
  readonly maxNotes = maxTextLength(300, 'Max 300 characters');

  readonly checkoutForm = injectForm({
    defaultValues: checkoutDefaultValues,
    onSubmit: async ({ value }) => {
      this.submitError.set('');
      const delivery: Address = {
        street: value.delivery.street.trim(),
        city: value.delivery.location!.city.trim(),
        country: value.delivery.location!.country.trim(),
      };
      const billing: Address | undefined = !value.delivery.useSameAsBilling
        ? {
            street: value.delivery.billingStreet.trim(),
            city: value.delivery.billingLocation!.city.trim(),
            country: value.delivery.billingLocation!.country.trim(),
          }
        : undefined;

      const tip = this.tipAmount();
      const scheduledAt =
        value.schedule.type === 'scheduled' && value.schedule.date && value.schedule.time
          ? new Date(`${value.schedule.date}T${value.schedule.time}`).toISOString()
          : undefined;

      try {
        const order = await this.#createOrderMutation.mutateAsync({
          pizzeriaId: this.cartClient.pizzeria()!.id,
          deliveryAddress: delivery,
          ...(billing ? { billingAddress: billing } : {}),
          notes: value.notes?.trim() || undefined,
          tipAmount: tip > 0 ? tip : undefined,
          scheduledAt,
          items: this.cartClient.items().map((item) => ({
            pizzaId: item.pizzaId,
            quantity: item.quantity,
            selectedSizeId: item.selectedSizeId ?? undefined,
            selectedOptionIds: item.selectedOptionIds,
          })),
        });
        this.#cart.clear();
        this.submitted.set(true);
        void this.#navigate({ to: '/orders/' + order.id });
      } catch {
        this.submitError.set('Order failed. Please try again.');
      }
    },
  });

  readonly checkoutFormState = injectStore(this.checkoutForm);

  readonly tipAmount = computed(() => {
    const tip = this.checkoutFormState().values.tip;
    const total = this.cartPreviewQuery.data()?.total ?? 0;
    switch (tip.type) {
      case 'none':
        return 0;
      case 'ten':
        return Math.round(total * 10) / 100;
      case 'fifteen':
        return Math.round(total * 15) / 100;
      case 'twenty':
        return Math.round(total * 20) / 100;
      case 'custom':
        return Math.max(0, tip.customAmount);
    }
  });

  readonly totalWithTip = computed(
    () => (this.cartPreviewQuery.data()?.total ?? 0) + this.tipAmount(),
  );

  readonly requiredBillingLocation = ({ value }: { value: LocationValue | null }) =>
    this.checkoutForm.state.values.delivery.useSameAsBilling
      ? undefined
      : this.requiredLocation({ value });

  readonly requiredBillingStreet = ({ value }: { value: string }) =>
    this.checkoutForm.state.values.delivery.useSameAsBilling
      ? undefined
      : this.requiredStreet({ value });

  readonly billingStreetValidator = composeValidators(this.requiredBillingStreet, this.maxStreet);

  readonly requiredScheduleDate = ({ value }: { value: string }) =>
    this.checkoutForm.state.values.schedule.type === 'scheduled'
      ? requiredText('Choose a delivery date')({ value })
      : undefined;

  readonly requiredScheduleTime = ({ value }: { value: string }) =>
    this.checkoutForm.state.values.schedule.type === 'scheduled'
      ? requiredText('Choose a delivery time')({ value })
      : undefined;

  public constructor() {
    injectBlocker({
      disabled: () => this.submitted() || !this.checkoutFormState().isDirty,
      enableBeforeUnload: () => !this.submitted() && this.checkoutFormState().isDirty,
      shouldBlockFn: async ({ current, next }) => {
        if (!isCheckoutPath(current.pathname) || isCheckoutPath(next.pathname)) {
          return false;
        }
        return !(await this.#confirmLeaveCheckout());
      },
    });

    effect(() => {
      if (this.checkoutFormState().values.delivery.useSameAsBilling) {
        const billing = this.checkoutForm.state.values.delivery;
        if (billing.billingLocation !== null || billing.billingStreet !== '') {
          this.checkoutForm.setFieldValue('delivery', {
            ...billing,
            billingLocation: null,
            billingStreet: '',
          });
        }
      }
    });

    effect(() => {
      const pathname = this.#router.state.location.pathname;
      const step = parseCheckoutStep(pathname);
      if (!step) {
        return;
      }
      const blocked = blockedCheckoutStep(this.checkoutFormState().values, step);
      if (blocked) {
        void this.#navigate({ to: '/checkout/' + blocked });
      }
    });
  }

  async validateStep(step: ValidatableStep): Promise<void> {
    const valid = await validateSubmitFields(this.checkoutForm, STEP_FIELDS[step]);
    if (valid) {
      this.stepStatus.update((status) => ({ ...status, [step]: 'success' }));
      void this.#navigate({ to: '/checkout/' + NEXT_STEP[step] });
    } else {
      this.stepStatus.update((status) => ({ ...status, [step]: 'error' }));
    }
  }

  goToStep(step: WizardStep): void {
    void this.#navigate({ to: '/checkout/' + step });
  }

  async placeOrder(): Promise<void> {
    if (await validateSubmitFields(this.checkoutForm, ['tip.customAmount'])) {
      await this.checkoutForm.handleSubmit();
    }
  }

  protected isCurrentStep(step: string): boolean {
    return this.#router.state.location.pathname.endsWith('/' + step);
  }

  async #confirmLeaveCheckout(): Promise<boolean> {
    const ref = this.#dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Leave checkout?',
        message:
          'You have entered checkout details. Leave this page? Your draft will not be saved.',
        cancelLabel: 'Stay',
        confirmLabel: 'Leave',
      },
    });
    return (await firstValueFrom(ref.closed)) === 'confirmed';
  }
}

function isCheckoutPath(pathname: string): boolean {
  return pathname === '/checkout' || pathname.startsWith('/checkout/');
}
