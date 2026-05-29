import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Callout } from '../../lib/components/callout/callout';
import { AdminOrderListItem } from './-models/order.models';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Pagination } from '../../lib/components/pagination/pagination';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { AdminOrderRow } from './-components/admin-order-row/admin-order-row';
import { createLazyFileRoute, injectRouter } from '@benjavicente/angular-router-experimental';
import { ROLES } from '../(auth)/-models/role.model';
import { requireRole } from '../-guards';
import { adminOrdersQueryOptions } from '../../lib/api/api-queries';
import { injectQuery } from '@benjavicente/angular-query';

export const Route = createLazyFileRoute('/(orders)/orders/admin')({
  component: () => AdminOrderListPage,
});

@Component({
  selector: 'rw-admin-orders-page',
  imports: [Spinner, Pagination, Callout, EmptyState, AdminOrderRow],
  template: `
    @if (cancelFeedback(); as fb) {
      <rw-callout [variant]="fb.variant" [message]="fb.message" />
    }

    @if (ordersResource.isPending()) {
      <div class="flex justify-center p-16" aria-label="Loading orders"><rw-spinner /></div>
    } @else if (ordersResource.error()) {
      <rw-callout variant="error" message="Could not load orders. Please try again." />
    } @else {
      @let page = ordersResource.data()!;
      @if (page.items.length === 0) {
        <rw-empty-state
          icon="folder-off"
          title="No orders yet"
          text="Customer orders for this pizzeria will appear here."
        />
      } @else {
        <section class="flex flex-col gap-3">
          <div class="overflow-x-auto rounded-md border border-border bg-surface">
            <table class="w-full border-collapse text-sm" aria-label="Orders">
              <thead>
                <tr>
                  <th scope="col">Placed</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-end">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (order of page.items; track order.id) {
                  <tr
                    rw-admin-order-row
                    [order]="order"
                    (updateOrder)="updateOrder($event)"
                    (showFeedback)="showFeedback($event)"
                  ></tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-10">
          <rw-pagination
            [currentPage]="currentPage()"
            [totalPages]="page.totalPages"
            (pageChange)="changePage($event)"
          />
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AdminOrderListPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly queryClient = injectRouter().options.context.queryClient;

  public readonly ordersResource = injectQuery(() =>
    adminOrdersQueryOptions(this.apiFetch, this.currentPage(), this.limit),
  );

  protected readonly currentPage = signal(1);
  protected readonly limit = 15;
  protected readonly cancelFeedback = signal<{
    variant: 'error' | 'success';
    message: string;
  } | null>(null);

  protected changePage(page: number): void {
    this.currentPage.set(page);
  }

  protected updateOrder(updated: AdminOrderListItem): void {
    const page = this.ordersResource.data();
    if (!page) {
      return;
    }
    this.queryClient.setQueryData(
      adminOrdersQueryOptions(this.apiFetch, this.currentPage(), this.limit).queryKey,
      {
        ...page,
        items: page.items.map((orderItem) => (orderItem.id === updated.id ? updated : orderItem)),
      },
    );
  }

  protected showFeedback(fb: { variant: 'error' | 'success'; message: string }): void {
    this.cancelFeedback.set(fb);
  }
}
