import { InjectionToken, computed, effect, signal } from '@angular/core';
import { injectForm, injectStore } from '@tanstack/angular-form';
import { injectMutation } from '@benjavicente/angular-query-experimental';
import {
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import type { LocationValue } from '../../../lib/components/photon-location-field/photon-location-field';
import type { Address } from '../../../lib/models/address.model';
import { createOrderMutationOptions } from '../../../lib/api/api-mutations';
import {
  composeValidators,
  maxTextLength,
  requiredText,
  requiredValue,
  validateSubmitFields,
} from '../../../lib/forms/tanstack-form';
import {
  injectCartClient,
  injectCartClientState,
  injectCartPreview,
} from '../-store/inject-cart';
import {
  checkoutDefaultValues,
  type CheckoutFormModel,
  type ValidatableStep,
  type WizardStep,
} from './checkout-context';

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

export const CHECKOUT_SCOPE = new InjectionToken<CheckoutScope>('CHECKOUT_SCOPE');

export interface CheckoutScope {
  readonly checkoutForm: ReturnType<typeof injectForm<CheckoutFormModel>>;
  readonly checkoutFormState: ReturnType<typeof injectStore<ReturnType<typeof injectForm<CheckoutFormModel>>>>;
  readonly stepStatus: ReturnType<
    typeof signal<Record<WizardStep, 'success' | 'error' | null>>
  >;
  readonly submitted: ReturnType<typeof signal<boolean>>;
  readonly submitError: ReturnType<typeof signal<string>>;
  readonly tipAmount: ReturnType<typeof computed<number>>;
  readonly totalWithTip: ReturnType<typeof computed<number>>;
  readonly requiredLocation: ReturnType<typeof requiredValue>;
  readonly requiredStreet: ReturnType<typeof requiredText>;
  readonly maxStreet: ReturnType<typeof maxTextLength>;
  readonly streetValidator: ReturnType<typeof composeValidators>;
  readonly maxNotes: ReturnType<typeof maxTextLength>;
  readonly requiredBillingLocation: (ctx: { value: LocationValue | null }) => string | undefined;
  readonly requiredBillingStreet: (ctx: { value: string }) => string | undefined;
  readonly billingStreetValidator: ReturnType<typeof composeValidators>;
  readonly requiredScheduleDate: (ctx: { value: string }) => string | undefined;
  readonly requiredScheduleTime: (ctx: { value: string }) => string | undefined;
  validateStep(step: ValidatableStep): Promise<void>;
  goToStep(step: WizardStep): void;
  placeOrder(): Promise<void>;
}

export function createCheckoutScope(): CheckoutScope {
  const apiFetch = injectRouter().options.context.apiFetch;
  const cart = injectCartClient();
  const cartClient = injectCartClientState();
  const cartPreview = injectCartPreview();
  const navigate = injectNavigate();
  const createOrderMutation = injectMutation(() => createOrderMutationOptions(apiFetch));

  const stepStatus = signal<Record<WizardStep, 'success' | 'error' | null>>({
    delivery: null,
    schedule: null,
    review: null,
  });
  const submitted = signal(false);
  const submitError = signal('');

  const requiredLocation = requiredValue('Choose a location from the list');
  const requiredStreet = requiredText('Street address is required');
  const maxStreet = maxTextLength(250, 'Max 250 characters');
  const streetValidator = composeValidators(requiredStreet, maxStreet);
  const maxNotes = maxTextLength(300, 'Max 300 characters');

  const checkoutForm = injectForm({
    defaultValues: checkoutDefaultValues,
    onSubmit: async ({ value }) => {
      submitError.set('');
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

      const tip = tipAmount();
      const scheduledAt =
        value.schedule.type === 'scheduled' && value.schedule.date && value.schedule.time
          ? new Date(`${value.schedule.date}T${value.schedule.time}`).toISOString()
          : undefined;

      try {
        const order = await createOrderMutation.mutateAsync({
          pizzeriaId: cartClient.pizzeria()!.id,
          deliveryAddress: delivery,
          ...(billing ? { billingAddress: billing } : {}),
          notes: value.notes?.trim() || undefined,
          tipAmount: tip > 0 ? tip : undefined,
          scheduledAt,
          items: cartClient.items().map((item) => ({
            pizzaId: item.pizzaId,
            quantity: item.quantity,
            selectedSizeId: item.selectedSizeId ?? undefined,
            selectedOptionIds: item.selectedOptionIds,
          })),
        });
        cart.clear();
        submitted.set(true);
        void navigate({ to: '/orders/' + order.id });
      } catch {
        submitError.set('Order failed. Please try again.');
      }
    },
  });

  const checkoutFormState = injectStore(checkoutForm);

  const tipAmount = computed(() => {
    const tip = checkoutFormState().values.tip;
    const total = cartPreview.cart()?.total ?? 0;
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

  const totalWithTip = computed(() => (cartPreview.cart()?.total ?? 0) + tipAmount());

  const requiredBillingLocation = ({ value }: { value: LocationValue | null }) =>
    checkoutForm.state.values.delivery.useSameAsBilling
      ? undefined
      : requiredLocation({ value });

  const requiredBillingStreet = ({ value }: { value: string }) =>
    checkoutForm.state.values.delivery.useSameAsBilling
      ? undefined
      : requiredStreet({ value });

  const billingStreetValidator = composeValidators(requiredBillingStreet, maxStreet);

  const requiredScheduleDate = ({ value }: { value: string }) =>
    checkoutForm.state.values.schedule.type === 'scheduled'
      ? requiredText('Choose a delivery date')({ value })
      : undefined;

  const requiredScheduleTime = ({ value }: { value: string }) =>
    checkoutForm.state.values.schedule.type === 'scheduled'
      ? requiredText('Choose a delivery time')({ value })
      : undefined;

  effect(() => {
    if (checkoutFormState().values.delivery.useSameAsBilling) {
      const billing = checkoutForm.state.values.delivery;
      if (billing.billingLocation !== null || billing.billingStreet !== '') {
        checkoutForm.setFieldValue('delivery', {
          ...billing,
          billingLocation: null,
          billingStreet: '',
        });
      }
    }
  });

  const validateStep = async (step: ValidatableStep): Promise<void> => {
    const valid = await validateSubmitFields(checkoutForm, STEP_FIELDS[step]);
    if (valid) {
      stepStatus.update((status) => ({ ...status, [step]: 'success' }));
      void navigate({ to: '/checkout/' + NEXT_STEP[step] });
    } else {
      stepStatus.update((status) => ({ ...status, [step]: 'error' }));
    }
  };

  const goToStep = (step: WizardStep): void => {
    void navigate({ to: '/checkout/' + step });
  };

  const placeOrder = async (): Promise<void> => {
    if (await validateSubmitFields(checkoutForm, ['tip.customAmount'])) {
      await checkoutForm.handleSubmit();
    }
  };

  return {
    checkoutForm,
    checkoutFormState,
    stepStatus,
    submitted,
    submitError,
    tipAmount,
    totalWithTip,
    requiredLocation,
    requiredStreet,
    maxStreet,
    streetValidator,
    maxNotes,
    requiredBillingLocation,
    requiredBillingStreet,
    billingStreetValidator,
    requiredScheduleDate,
    requiredScheduleTime,
    validateStep,
    goToStep,
    placeOrder,
  };
}
