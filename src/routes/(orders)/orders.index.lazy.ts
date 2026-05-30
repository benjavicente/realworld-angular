import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
  Link,
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { DateFormatPipe } from '../../lib/pipes/date/date.pipe';
import { NumberFormatPipe } from '../../lib/pipes/number/number.pipe';
import { authUserQueryOptions } from '../../lib/services/auth';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Pagination } from '../../lib/components/pagination/pagination';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Callout } from '../../lib/components/callout/callout';
import { StatusBadge } from '../../lib/components/status-badge/status-badge';
import { ordersQueryOptions } from '../../lib/api/api-queries';
import { injectQuery } from '@benjavicente/angular-query';

export const Route = createLazyFileRoute('/(orders)/orders/')({
  component: () => OrdersListPage,
});

@Component({
  selector: 'rw-orders-list-page',
  imports: [
    Link,
    NumberFormatPipe,
    DateFormatPipe,
    Spinner,
    Pagination,
    EmptyState,
    Callout,
    StatusBadge,
  ],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <h1 class="mb-8 text-2xl">{{ heading() }}</h1>

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
              text="When you place an order, it will show up here."
            >
              <a [link]="{ to: '/pizzerias' }">Browse pizzerias</a>
            </rw-empty-state>
          } @else {
            <ul class="flex list-none flex-col gap-4" role="list">
              @for (order of page.items; track order.id) {
                <li>
                  <a
                    [link]="{ to: '/orders/' + order.id }"
                    class="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-border bg-surface p-4 transition hover:shadow-md"
                    aria-label="View order {{ order.id }}"
                  >
                    <div>
                      <p class="font-semibold text-text">{{ order.pizzeria.name }}</p>
                      <p class="mt-1 text-sm text-text-muted">
                        <span class="tabular-nums">{{ order.items.length }}</span> pizza(s) &middot;
                        {{ order.createdAt | date: 'dd MMM yyyy, HH:mm' }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                      <rw-status-badge [status]="order.status" />
                      <p class="font-semibold tabular-nums text-primary">
                        €{{ order.total | number: '1.2-2' }}
                      </p>
                    </div>
                  </a>
                </li>
              }
            </ul>

            <div class="mt-10">
              <rw-pagination
                [currentPage]="currentPage()"
                [totalPages]="page.totalPages"
                (pageChange)="changePage($event)"
              />
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OrdersListPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly search = Route.injectSearch();
  private readonly navigate = injectNavigate();
  private readonly userQuery = injectQuery(() => authUserQueryOptions(this.apiFetch));

  protected readonly heading = computed<string>(() =>
    this.userQuery.data()?.role === 'PIZZERIA_ADMIN' ? 'Orders' : 'My Orders',
  );

  protected readonly currentPage = computed(() => this.search().page ?? 1);
  protected readonly ordersResource = injectQuery(() =>
    ordersQueryOptions(this.apiFetch, this.currentPage(), 10),
  );

  protected changePage(page: number): void {
    void this.navigate({
      to: '.',
      search: page > 1 ? { page } : {},
      resetScroll: false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
