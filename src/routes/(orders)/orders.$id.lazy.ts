import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Link, createLazyFileRoute, injectRouter } from '@benjavicente/angular-router-experimental';
import { DateFormatPipe } from '../../lib/pipes/date/date.pipe';
import { NumberFormatPipe } from '../../lib/pipes/number/number.pipe';
import { TitleCaseFormatPipe } from '../../lib/pipes/title-case/title-case.pipe';
import { Callout } from '../../lib/components/callout/callout';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Button } from '../../lib/components/button/button';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { injectMutation, injectQuery } from '@benjavicente/angular-query';
import { cancelOrderMutationOptions } from '../../lib/api/api-mutations';
import { orderSubscriptionQueryOptions } from '../../lib/api/api-queries';
import type { OrderItemSelectedOption } from './-models/order.models';

export const Route = createLazyFileRoute('/(orders)/orders/$id')({
  component: () => OrderDetailPage,
});

@Component({
  selector: 'rw-order-detail-page',
  imports: [
    Link,
    NumberFormatPipe,
    DateFormatPipe,
    TitleCaseFormatPipe,
    Spinner,
    Button,
    Callout,
    EmptyState,
  ],
  template: `
    @if (orderResource.error()) {
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <rw-empty-state
          icon="folder-off"
          title="Order not found"
          text="We could not find an order with this id, or you may not have access to it."
        />
      </div>
    } @else if (orderResource.isPending() || !orderResource.data()) {
      <div class="flex justify-center p-16" aria-label="Loading order"><rw-spinner /></div>
    } @else {
      @let order = orderResource.data()!;
      <div class="py-10">
        <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
          @if (cancelFeedback(); as fb) {
            <rw-callout [variant]="fb.variant" [message]="fb.message" />
          }
          <div class="mb-6 flex justify-end gap-3 items-center">
            <span class="text-base text-text">{{ order.status | titlecase }}</span>
            @if (order.status === 'PENDING') {
              <button
                rw-button
                palette="danger"
                size="sm"
                [isLoading]="isCancelling()"
                (click)="cancel()"
              >
                Cancel order
              </button>
            }
          </div>

          <div class="mb-8 space-y-1">
            <h1 class="text-2xl font-bold mb-2">
              <a
                [link]="{ to: '/pizzerias/' + order.pizzeria.id }"
                class="text-text no-underline hover:no-underline"
              >
                {{ order.pizzeria.name }}
              </a>
            </h1>
            <p class="text-sm text-text-muted">
              Placed on {{ order.createdAt | date: 'dd MMM yyyy, HH:mm' }}
            </p>
            <p class="text-sm text-text-muted">
              Deliver to: {{ order.deliveryAddress.street }}, {{ order.deliveryAddress.city }},
              {{ order.deliveryAddress.country }}
            </p>
            @if (order.billingAddress; as address) {
              <p class="text-sm text-text-muted">
                Bill to: {{ address.street }}, {{ address.city }}, {{ address.country }}
              </p>
            }
            @if (order.notes) {
              <p class="text-sm text-text-muted">Notes: {{ order.notes }}</p>
            }
          </div>

          <!-- Order status / progress -->
          @if (order.status === 'CANCELLED') {
            <div
              class="mb-10 rounded-lg border border-error/30 bg-error-bg p-6"
              role="status"
              aria-live="polite"
            >
              <div>
                <h2 class="mb-2 text-lg font-semibold">Order cancelled</h2>
                <p class="text-sm text-text-muted">This order will not be prepared or delivered.</p>
              </div>
            </div>
          } @else {
            <section class="mb-10 rounded-lg border border-border bg-surface-alt px-5 py-5">
              <h2 class="mb-5 text-sm font-semibold uppercase text-text-muted">Progress</h2>
              <ol class="relative grid grid-cols-4" aria-label="Progress steps">
                <span
                  class="absolute left-[12.5%] right-[12.5%] top-[11px] h-px bg-border-strong"
                  aria-hidden="true"
                ></span>
                @for (step of statusOrder; track step) {
                  @let stepDone = isStepDone()(step);
                  <li class="relative flex flex-col items-center gap-3 text-center">
                    <span
                      [class]="statusDotClasses(stepDone, order.status === step && !stepDone)"
                      [attr.aria-hidden]="true"
                    >
                      @if (stepDone) {
                        <span aria-hidden="true">✓</span>
                      }
                    </span>
                    <p [class]="statusLabelClasses(stepDone, order.status === step && !stepDone)">
                      {{ step | titlecase }}
                    </p>
                  </li>
                }
              </ol>
            </section>
          }

          <!-- Pizzas -->
          <section>
            <h2 class="mb-5 text-lg font-semibold">Pizzas</h2>
            <ul class="list-none border-b border-border" role="list">
              @for (item of order.items; track item.id) {
                <li
                  class="grid grid-cols-[2rem_1fr_auto_auto] items-center gap-x-4 border-t border-border py-4 text-sm"
                >
                  <span class="font-semibold tabular-nums text-text">{{ item.quantity }}×</span>
                  <span class="text-text">{{ item.pizza.name }}</span>
                  @if (item.selectedOptions.length > 0) {
                    <span class="text-sm text-text-muted">{{
                      formatSelectedOptions(item.selectedOptions)
                    }}</span>
                  } @else {
                    <span></span>
                  }
                  <span class="text-right font-semibold tabular-nums text-primary"
                    >€{{ item.quantity * item.unitPrice | number: '1.2-2' }}</span
                  >
                </li>
              }
            </ul>
            <div
              class="flex justify-between pt-4 text-base [&_strong]:text-lg [&_strong]:text-primary"
            >
              <span>Total</span>
              <strong class="tabular-nums">€{{ order.total | number: '1.2-2' }}</strong>
            </div>
          </section>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OrderDetailPage {
  readonly #router = injectRouter();
  readonly #apiFetch = this.#router.options.context.apiFetch;
  readonly #params = Route.injectParams();
  readonly #cancelOrderMutation = injectMutation(() => cancelOrderMutationOptions(this.#apiFetch));

  protected readonly orderResource = injectQuery(() =>
    orderSubscriptionQueryOptions(this.#apiFetch, this.id()),
  );

  protected readonly isCancelling = signal(false);
  protected readonly cancelFeedback = signal<{
    variant: 'error' | 'success';
    message: string;
  } | null>(null);

  protected readonly statusOrder: readonly string[] = [
    'PENDING',
    'PREPARING',
    'READY',
    'DELIVERED',
  ];

  protected readonly isStepDone = computed(() => {
    const order = this.orderResource.data()!;
    return (step: string): boolean => {
      if (step === 'DELIVERED' && order.status === 'DELIVERED') {
        return true;
      }
      return this.statusOrder.indexOf(order.status) > this.statusOrder.indexOf(step);
    };
  });

  protected statusDotClasses(done: boolean, active: boolean): string {
    const base =
      'relative z-10 flex size-[22px] items-center justify-center rounded-full border-2 text-xs font-bold leading-none';
    if (done) {
      return `${base} border-primary bg-primary text-text-on-primary`;
    }
    if (active) {
      return `${base} border-primary bg-surface text-primary`;
    }
    return `${base} border-border bg-surface text-text-muted`;
  }

  protected statusLabelClasses(done: boolean, active: boolean): string {
    const base = 'text-xs font-medium';
    return done || active ? `${base} text-text` : `${base} text-text-muted`;
  }

  protected formatSelectedOptions(options: OrderItemSelectedOption[]): string {
    return options.map((option) => option.label).join(', ');
  }

  protected readonly id = computed(() => this.#params().id);

  protected async cancel(): Promise<void> {
    this.isCancelling.set(true);
    this.cancelFeedback.set(null);
    try {
      const order = await this.#cancelOrderMutation.mutateAsync(this.id());
      this.#router.options.context.queryClient.setQueryData(
        orderSubscriptionQueryOptions(this.#apiFetch, this.id()).queryKey,
        order,
      );
      this.cancelFeedback.set({
        variant: 'success',
        message: 'This order has been cancelled.',
      });
    } catch (err: unknown) {
      this.cancelFeedback.set({
        variant: 'error',
        message: err instanceof Error && err.message ? err.message : 'Could not cancel order',
      });
    } finally {
      this.isCancelling.set(false);
    }
  }
}
