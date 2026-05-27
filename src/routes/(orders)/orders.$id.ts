import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  input,
  effect,
} from '@angular/core';
import { Link, createFileRoute, injectRouter } from '@benjavicente/angular-router-experimental';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Callout } from '../../lib/components/callout/callout';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Button } from '../../lib/components/button/button';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Title } from '@angular/platform-browser';
import { StatusBadge } from '../../lib/components/status-badge/status-badge';
import { injectMutation, injectQuery } from '@benjavicente/angular-query-experimental';
import { cancelOrderMutationOptions } from '../../lib/api/api-mutations';
import { orderSubscriptionQueryOptions } from '../../lib/api/api-queries';
import { requireAuth } from '../-guards';

export const Route = createFileRoute('/(orders)/orders/$id')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: () => OrderDetailRouteComponent,
});

@Component({
  selector: 'rw-order-detail-page',
  imports: [
    Link,
    DecimalPipe,
    DatePipe,
    TitleCasePipe,
    Spinner,
    Button,
    Callout,
    EmptyState,
    StatusBadge,
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
      <div class="mb-8 flex items-start justify-between gap-4">
        <div class="flex shrink-0 items-center gap-3">
          <rw-status-badge [status]="order.status" />
          @if (order.status === 'PENDING') {
            <rw-button palette="danger" size="sm" [isLoading]="isCancelling()" (click)="cancel()">
              Cancel order
            </rw-button>
          }
        </div>
      </div>

      <div class="space-y-1">
        <h1 class="text-lg font-semibold">
          <a [link]="{ to: '/pizzerias/' + order.pizzeria.id }">
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
        <div class="mb-8 rounded-lg border border-border bg-surface p-6 border-error/30 bg-error-bg" role="status" aria-live="polite">
          <div class="relative mx-auto mb-4 size-12 rounded-full bg-error" aria-hidden="true"></div>
          <div>
            <h2 class="mb-2 text-lg font-semibold">Order cancelled</h2>
            <p class="mb-6 text-sm text-text-muted">This order will not be prepared or delivered.</p>
          </div>
        </div>
      } @else {
        <section class="mb-8 rounded-lg border border-border bg-surface p-6">
          <h2 class="mb-2 text-lg font-semibold">Progress</h2>
          <ol class="flex items-start justify-between gap-2" aria-label="Progress steps">
            @for (step of statusOrder; track step) {
              @let stepDone = isStepDone()(step);
              <li [class]="statusStepClasses()">
                <div class="relative z-10 flex size-8 items-center justify-center">
                  <span
                    [class]="statusDotClasses(stepDone, order.status === step && !stepDone)"
                    [attr.aria-hidden]="true"
                  >
                    @if (stepDone) {
                      <span class="size-4" aria-hidden="true">✓</span>
                    }
                  </span>
                </div>
                <p [class]="statusLabelClasses(stepDone, order.status === step && !stepDone)">{{ step | titlecase }}</p>
              </li>
            }
          </ol>
        </section>
      }

      <!-- Pizzas -->
      <section>
        <h2 class="mb-5 text-lg font-semibold">Pizzas</h2>
        <ul class="flex list-none flex-col gap-4" role="list">
          @for (item of order.items; track item.id) {
            <li class="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <span class="font-medium text-text-muted">{{ item.quantity }}×</span>
              <span class="font-semibold">{{ item.pizza.name }}</span>
              @if (item.selectedOptions.length > 0) {
                <span class="text-xs text-text-muted">{{
                  item.selectedOptions.map((o) => o.label).join(', ')
                }}</span>
              }
              <span class="font-medium text-primary"
                >€{{ item.quantity * item.unitPrice | number: '1.2-2' }}</span
              >
            </li>
          }
        </ul>
        <div class="mt-6 flex justify-between border-t border-border pt-4 text-base [&_strong]:text-lg [&_strong]:text-primary">
          <span>Total</span>
          <strong>€{{ order.total | number: '1.2-2' }}</strong>
        </div>
      </section>
    </div>
  </div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OrderDetailPage {
  private readonly router = injectRouter();
  private readonly apiFetch = this.router.options.context.apiFetch;
  private readonly title = inject(Title);
  private readonly cancelOrderMutation = injectMutation(() =>
    cancelOrderMutationOptions(this.apiFetch),
  );

  protected readonly orderResource = injectQuery(() =>
    orderSubscriptionQueryOptions(this.apiFetch, this.id()),
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

  protected statusStepClasses(): string {
    return 'relative flex flex-1 flex-col items-center gap-2 text-center';
  }

  protected statusDotClasses(done: boolean, active: boolean): string {
    const base = 'flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold';
    if (done) {
      return `${base} border-primary bg-primary text-text-on-primary`;
    }
    if (active) {
      return `${base} border-primary bg-surface text-primary shadow-focus`;
    }
    return `${base} border-border bg-surface text-text-muted`;
  }

  protected statusLabelClasses(done: boolean, active: boolean): string {
    const base = 'text-xs font-medium';
    return done || active ? `${base} text-text` : `${base} text-text-muted`;
  }

  public readonly id = input.required<string>();

  public constructor() {
    effect(() => {
      this.title.setTitle(`Order ${this.id()}`);
    });
  }

  protected async cancel(): Promise<void> {
    this.isCancelling.set(true);
    this.cancelFeedback.set(null);
    try {
      const order = await this.cancelOrderMutation.mutateAsync(this.id());
      this.router.options.context.queryClient.setQueryData(
        orderSubscriptionQueryOptions(this.apiFetch, this.id()).queryKey,
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

@Component({
  selector: 'rw-order-detail-route',
  standalone: true,
  imports: [OrderDetailPage],
  template: '<rw-order-detail-page [id]="params().id" />',
})
class OrderDetailRouteComponent {
  protected readonly params = Route.injectParams();
}
