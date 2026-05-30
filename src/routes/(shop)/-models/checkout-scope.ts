import type { computed, signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { injectForm, injectStore } from '@tanstack/angular-form';
import type { LocationValue } from '../../../lib/components/photon-location-field/photon-location-field';
import type {
  composeValidators,
  maxTextLength,
  requiredText,
  requiredValue,
} from '../../../lib/forms/tanstack-form';
import type { CheckoutFormModel, ValidatableStep, WizardStep } from './checkout-context';

export const CHECKOUT_SCOPE = new InjectionToken<CheckoutScope>('CHECKOUT_SCOPE');

export interface CheckoutScope {
  readonly checkoutForm: ReturnType<typeof injectForm<CheckoutFormModel>>;
  readonly checkoutFormState: ReturnType<
    typeof injectStore<ReturnType<typeof injectForm<CheckoutFormModel>>>
  >;
  readonly stepStatus: ReturnType<typeof signal<Record<WizardStep, 'success' | 'error' | null>>>;
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
