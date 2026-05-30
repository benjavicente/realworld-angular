import type { LocationValue } from '../../../lib/components/photon-location-field/photon-location-field';

export type WizardStep = 'delivery' | 'schedule' | 'review';
export type ValidatableStep = Exclude<WizardStep, 'review'>;

export interface CheckoutFormModel {
  delivery: {
    location: LocationValue | null;
    street: string;
    useSameAsBilling: boolean;
    billingLocation: LocationValue | null;
    billingStreet: string;
  };
  schedule: {
    type: 'asap' | 'scheduled';
    date: string;
    time: string;
  };
  notes: string;
  tip: {
    type: 'none' | 'ten' | 'fifteen' | 'twenty' | 'custom';
    customAmount: number;
  };
}

export const checkoutDefaultValues = {
  delivery: {
    location: null,
    street: '',
    useSameAsBilling: true,
    billingLocation: null,
    billingStreet: '',
  },
  schedule: { type: 'asap' as const, date: '', time: '' },
  notes: '',
  tip: { type: 'none' as const, customAmount: 0 },
} satisfies CheckoutFormModel;

const CHECKOUT_STEPS: readonly WizardStep[] = ['delivery', 'schedule', 'review'];

const CHECKOUT_STEP_PREREQUISITES: Record<WizardStep, ValidatableStep[]> = {
  delivery: [],
  schedule: ['delivery'],
  review: ['delivery', 'schedule'],
};

export function parseCheckoutStep(pathname: string): WizardStep | null {
  for (const step of CHECKOUT_STEPS) {
    if (pathname.endsWith('/' + step)) {
      return step;
    }
  }
  return null;
}

function isCheckoutStepValid(values: CheckoutFormModel, step: ValidatableStep): boolean {
  if (step === 'delivery') {
    if (!values.delivery.location || !values.delivery.street.trim()) {
      return false;
    }
    if (
      !values.delivery.useSameAsBilling &&
      (!values.delivery.billingLocation || !values.delivery.billingStreet.trim())
    ) {
      return false;
    }
    return true;
  }
  if (values.schedule.type === 'scheduled') {
    return Boolean(values.schedule.date && values.schedule.time);
  }
  return true;
}

export function blockedCheckoutStep(
  values: CheckoutFormModel,
  step: WizardStep,
): ValidatableStep | null {
  return CHECKOUT_STEP_PREREQUISITES[step].find((s) => !isCheckoutStepValid(values, s)) ?? null;
}
