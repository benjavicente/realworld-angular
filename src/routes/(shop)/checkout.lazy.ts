import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import {
  Link,
  Outlet,
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { map, Observable } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { TanStackWithForm } from '@tanstack/angular-form';
import { injectCartClientState, injectCartPreview } from './-store/inject-cart';
import { Callout } from '../../lib/components/callout/callout';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Spinner } from '../../lib/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../lib/components/confirm-dialog/confirm-dialog';
import { requireAuth, requireCart } from '../-guards';
import { CheckoutProgressStepper } from './-components/checkout-progress-stepper/checkout-progress-stepper';
import { blockedCheckoutStep, parseCheckoutStep } from './-models/checkout-context';
import { CHECKOUT_SCOPE, createCheckoutScope } from './-models/checkout-scope';

export const Route = createLazyFileRoute('/(shop)/checkout')({
  component: () => CheckoutLayoutPage,
});

@Component({
  selector: 'rw-checkout-layout',
  imports: [
    Link,
    Outlet,
    DecimalPipe,
    Callout,
    EmptyState,
    Spinner,
    CheckoutProgressStepper,
    TanStackWithForm,
  ],
  providers: [{ provide: CHECKOUT_SCOPE, useFactory: createCheckoutScope }],
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
        } @else if (cartPreview.isLoading() && !cartPreview.cart()) {
          <div class="flex justify-center p-16" aria-label="Loading cart"><rw-spinner /></div>
        } @else if (cartPreview.isError() && !cartPreview.cart()) {
          <rw-callout
            variant="error"
            heading="Could not load cart details"
            message="Your items are saved locally, but we could not reach the server."
          />
        } @else if (cartPreview.cart(); as data) {
          <nav
            class="mb-8 flex flex-wrap items-center gap-2 text-sm"
            aria-label="Checkout progress"
          >
            <rw-checkout-progress-stepper
              [order]="1"
              label="Delivery & Billing"
              [active]="isCurrentStep('delivery')"
              [status]="checkout.stepStatus().delivery"
            />
            <span class="text-lg text-border select-none" aria-hidden="true">›</span>
            <rw-checkout-progress-stepper
              [order]="2"
              label="Schedule & Notes"
              [active]="isCurrentStep('schedule')"
              [status]="checkout.stepStatus().schedule"
            />
            <span class="text-lg text-border select-none" aria-hidden="true">›</span>
            <rw-checkout-progress-stepper
              [order]="3"
              label="Review & Pay"
              [active]="isCurrentStep('review')"
              [status]="checkout.stepStatus().review"
            />
          </nav>

          <div class="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_320px]">
            <section>
              @if (checkout.submitError()) {
                <rw-callout variant="error" [message]="checkout.submitError()" class="mb-4" />
              }
              <div [tanstackWithForm]="checkout.checkoutForm">
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
                <strong class="tabular-nums"
                  >€{{ checkout.totalWithTip() | number: '1.2-2' }}</strong
                >
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckoutLayoutPage {
  protected readonly cartClient = injectCartClientState();
  protected readonly cartPreview = injectCartPreview();
  protected readonly checkout = inject(CHECKOUT_SCOPE);
  private readonly router = injectRouter();
  private readonly navigate = injectNavigate();
  private readonly title = inject(Title);
  private readonly dialog = inject(Dialog);

  public constructor() {
    effect(() => {
      const name = this.cartPreview.cart()?.pizzeria.name;
      this.title.setTitle(name ? `Checkout - ${name}` : 'Checkout');
    });

    effect(() => {
      const pathname = this.router.state.location.pathname;
      const step = parseCheckoutStep(pathname);
      if (!step) {
        return;
      }
      const blocked = blockedCheckoutStep(this.checkout.checkoutFormState().values, step);
      if (blocked) {
        void this.navigate({ to: '/checkout/' + blocked });
      }
    });
  }

  protected isCurrentStep(step: string): boolean {
    return this.router.state.location.pathname.endsWith('/' + step);
  }

  public canDeactivate(): boolean | Observable<boolean> {
    if (this.checkout.submitted() || !this.checkout.checkoutFormState().isDirty) {
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
}
