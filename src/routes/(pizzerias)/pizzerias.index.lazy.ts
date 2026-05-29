import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import {
  Link,
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Pagination } from '../../lib/components/pagination/pagination';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { HeroBanner } from '../../lib/components/hero-banner/hero-banner';
import { CatalogImageUrlPipe } from '../../lib/pipes/catalog-image-url.pipe';
import { Callout } from '../../lib/components/callout/callout';
import { pizzeriasQueryOptions } from '../../lib/api/api-queries';
import { injectQuery } from '@benjavicente/angular-query';
import { icons } from '../../lib/assets';

interface PizzeriaListSearch {
  page?: number;
  search?: string;
}

const PIZZERIAS_LIMIT = 12;

function pageSearchValue(value: unknown): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function validatePizzeriaListSearch(search: Record<string, unknown>): PizzeriaListSearch {
  const page = pageSearchValue(search['page']);
  const searchText = typeof search['search'] === 'string' ? search['search'].trim() : '';

  return {
    ...(page > 1 ? { page } : {}),
    ...(searchText ? { search: searchText } : {}),
  };
}

export const Route = createLazyFileRoute('/(pizzerias)/pizzerias/')({
  component: () => PizzeriaListPage,
});

@Component({
  selector: 'rw-pizzeria-list-page',
  imports: [Link, Spinner, Pagination, EmptyState, HeroBanner, CatalogImageUrlPipe, Callout],
  template: `
    <rw-hero-banner />

    <section class="py-12">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <div class="relative mb-8 max-w-[420px]">
          <label for="pizzeria-search" class="sr-only">Search pizzerias</label>
          <img
            [src]="icons.search"
            alt=""
            class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
            width="20"
            height="20"
          />
          <input
            id="pizzeria-search"
            type="search"
            class="w-full rounded-md border border-border bg-surface py-3 pe-4 ps-10 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            [value]="searchInput()"
            (input)="onSearchInput($event)"
            placeholder="Search..."
            autocomplete="off"
          />
        </div>

        @if (pizzeriasResource.isPending()) {
          <div class="flex justify-center p-16" aria-label="Loading pizzerias">
            <rw-spinner />
          </div>
        } @else if (pizzeriasResource.error()) {
          <rw-callout variant="error" message="Could not load pizzerias. Please try again." />
        } @else if (pizzeriasResource.data()!.items.length === 0) {
          @if (hasActiveSearch()) {
            <rw-empty-state icon="folder-off" text="No pizzerias match your search." />
          } @else {
            <rw-empty-state icon="folder-off" text="No pizzerias yet. Check back soon!" />
          }
        } @else {
          @let data = pizzeriasResource.data()!;
          <ul
            class="grid list-none grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
            role="list"
          >
            @for (pizzeria of data.items; track pizzeria.id) {
              <li>
                <a
                  [link]="{ to: '/pizzerias/' + pizzeria.id }"
                  class="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface no-underline transition hover:-translate-y-[3px] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label="View {{ pizzeria.name }} pizzeria"
                >
                  <div class="aspect-video overflow-hidden bg-surface-alt">
                    <img
                      [src]="pizzeria.image | catalogImageUrl: 'pizzeria'"
                      alt=""
                      class="size-full object-cover transition group-hover:scale-105"
                      width="600"
                      height="400"
                    />
                  </div>
                  <div class="flex flex-1 flex-col gap-2 p-4">
                    <h3 class="font-sans text-lg font-semibold text-text">{{ pizzeria.name }}</h3>
                    <p class="mb-2 text-sm text-text-muted">
                      {{ pizzeria.city }}, {{ pizzeria.country }}
                    </p>
                    <p class="mt-auto text-xs text-text-muted">
                      <span class="tabular-nums">{{ pizzeria._count.pizzas }} pizzas</span>
                    </p>
                  </div>
                </a>
              </li>
            }
          </ul>

          @if (data.totalPages > 1 && data.items.length > 0) {
            <div class="mt-10">
              <rw-pagination
                [currentPage]="currentPage()"
                [totalPages]="data.totalPages"
                (pageChange)="changePage($event)"
              />
            </div>
          }
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PizzeriaListPage {
  private readonly routerContext = injectRouter().options.context;
  private readonly search = Route.injectSearch();
  private readonly navigate = injectNavigate();
  protected readonly icons = icons;

  // Search input
  protected readonly searchInput = signal(this.search().search ?? '');
  private readonly debouncedSearch = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(300),
      map((search: string) => search.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );
  protected readonly activeSearch = computed(() => this.search().search ?? '');
  protected readonly hasActiveSearch = computed<boolean>(() => this.activeSearch().length > 0);

  // Pagination
  protected readonly currentPage = computed(() => this.search().page ?? 1);
  protected readonly limit = PIZZERIAS_LIMIT;

  protected readonly pizzeriasResource = injectQuery(() =>
    pizzeriasQueryOptions(this.routerContext.apiFetch, {
      page: this.currentPage(),
      limit: this.limit,
      ...(this.hasActiveSearch() ? { search: this.activeSearch() } : {}),
    }),
  );

  public constructor() {
    effect(() => {
      const search = this.debouncedSearch();
      const currentSearch = this.activeSearch();
      if (search === currentSearch) {
        return;
      }

      void this.navigate({
        to: '.',
        search: { page: 1, ...(search ? { search } : {}) },
        replace: true,
        resetScroll: false,
      });
    });
  }

  protected changePage(page: number): void {
    const search = this.activeSearch();
    void this.navigate({
      to: '.',
      search: { ...(page > 1 ? { page } : {}), ...(search ? { search } : {}) },
      resetScroll: false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected onSearchInput(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }
}
