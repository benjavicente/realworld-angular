import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Link,
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { NumberFormatPipe } from '../../lib/pipes/number/number.pipe';
import { Pizza } from './-models/pizza.models';
import { Spinner } from '../../lib/components/spinner/spinner';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { injectQuery } from '@benjavicente/angular-query';
import { authUserQueryOptions } from '../../lib/services/auth';
import { PizzaOrderFormDialog } from '../(orders)/-components/pizza-order-form-dialog/pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../(orders)/-models/order.models';
import { firstValueFrom } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { CatalogImageUrlPipe } from '../../lib/pipes/catalog-image/catalog-image-url.pipe';
import { Button } from '../../lib/components/button/button';
import { pizzeriaPizzasQueryOptions, pizzeriaQueryOptions } from '../../lib/api/api-queries';
import { injectCartClient } from '../(shop)/-store/inject-cart';
import { icons } from '../../lib/assets';
import { injectDebouncedValue, injectDebouncer } from '@tanstack/angular-pacer';

export const Route = createLazyFileRoute('/(pizzerias)/pizzerias/$id')({
  component: () => PizzeriaDetailsPage,
});

@Component({
  selector: 'rw-pizzeria-detail-page',
  imports: [Link, NumberFormatPipe, Spinner, EmptyState, CatalogImageUrlPipe, Button],
  template: `
    @if (pizzeriaResource.isPending() || pizzasResource.isPending()) {
      <div class="flex justify-center p-16" aria-label="Loading pizzeria">
        <rw-spinner />
      </div>
    } @else if (pizzeriaResource.error()) {
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <rw-empty-state
          icon="folder-off"
          title="Pizzeria not found"
          text="We could not find this pizzeria, or it is no longer available."
        />
      </div>
    } @else if (pizzeriaResource.data() !== undefined) {
      @let pizzeria = pizzeriaResource.data()!;
      @let pizzas = filteredPizzas();
      <!-- Pizzeria hero -->
      <section class="relative mx-auto h-[300px] w-full max-w-app overflow-hidden bg-primary">
        <div class="absolute inset-0">
          <img
            [src]="'banner-' + pizzeria.image | catalogImageUrl: 'pizzeria'"
            alt=""
            class="size-full object-cover"
            width="1200"
            height="600"
            priority
          />
        </div>
        <div
          class="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 to-black/20 pb-8 text-white"
        >
          <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
            <h1 class="mb-2 text-3xl font-bold !text-white">{{ pizzeria.name }}</h1>
            <p class="text-sm text-white/90">{{ pizzeria.city }}, {{ pizzeria.country }}</p>
          </div>
        </div>
      </section>

      <!-- Pizza catalog -->
      <section class="py-12">
        <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
          <div class="mb-8 flex items-end gap-6 max-md:flex-col max-md:items-stretch">
            <div class="relative min-w-0 flex-1">
              <label for="pizza-name-search" class="sr-only">Search pizzas by name</label>
              <img
                [src]="icons.search"
                alt=""
                class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
                width="20"
                height="20"
              />
              <input
                id="pizza-name-search"
                type="search"
                class="w-full rounded-md border border-border bg-surface py-3 pe-4 ps-10 text-base text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                [value]="pizzaNameSearch()"
                (input)="onPizzaNameSearch($event)"
                placeholder="Search by pizza name"
                autocomplete="off"
              />
            </div>
            <div class="flex w-40 flex-col gap-2 max-md:w-full">
              <label for="pizza-max-price" class="text-xs font-semibold uppercase text-text-muted"
                >Max price</label
              >
              <div class="flex items-center gap-3">
                <input
                  id="pizza-max-price"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  class="w-full accent-primary"
                  [value]="maxPrice()"
                  (input)="onMaxPriceInput($event)"
                  (change)="onMaxPriceChange($event)"
                />
                <span class="min-w-10 text-right font-semibold tabular-nums text-text"
                  >€{{ maxPrice() }}</span
                >
              </div>
            </div>
          </div>

          @if (pizzas.length === 0) {
            @if (hasActivePizzaSearch()) {
              <rw-empty-state icon="folder-off" text="No pizzas match your search." />
            } @else {
              <rw-empty-state icon="folder-off" text="No pizzas on the menu yet." />
            }
          } @else {
            <ul
              class="grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6"
              role="list"
            >
              @for (pizza of pizzas; track pizza.id) {
                <li>
                  <div
                    class="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface"
                  >
                    <div class="aspect-[4/3] overflow-hidden bg-surface-alt">
                      <img
                        [src]="pizza.image | catalogImageUrl: 'pizza'"
                        alt=""
                        class="size-full object-cover"
                        width="400"
                        height="300"
                      />
                    </div>
                    <div class="flex flex-1 flex-col gap-4 p-4">
                      <span class="font-sans text-lg font-semibold text-text">{{
                        pizza.name
                      }}</span>
                      <div class="mt-auto flex items-center justify-between gap-3">
                        <span class="text-sm text-text-muted">
                          from
                          <strong class="tabular-nums"
                            >€{{ pizza.basePrice | number: '1.2-2' }}</strong
                          >
                        </span>

                        @if (!isAdmin()) {
                          <button rw-button type="button" size="sm" (click)="openOrderModal(pizza)">
                            Add to cart
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </section>
    }

    @if (addedToCartBannerVisible()) {
      <div
        class="fixed inset-x-0 bottom-0 z-[var(--z-overlay)] border-t border-border bg-surface shadow-lg"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          class="flex items-center justify-between gap-4 py-4 mx-auto w-full max-w-app px-4 md:px-6 lg:px-8"
        >
          <span class="font-medium text-text">Added to your cart.</span>
          <div class="flex items-center gap-3">
            <a [link]="{ to: '/cart' }" class="font-semibold text-primary underline">View cart</a>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-alt hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Dismiss notification"
              (click)="dismissAddedToCartBanner()"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PizzeriaDetailsPage {
  readonly #apiFetch = injectRouter().options.context.apiFetch;
  readonly #userQuery = injectQuery(() => authUserQueryOptions(this.#apiFetch));

  protected readonly isAdmin = computed(() => this.#userQuery.data()?.role === 'PIZZERIA_ADMIN');
  readonly #dialog = inject(Dialog);
  readonly #cart = injectCartClient();
  readonly #navigate = injectNavigate();
  readonly #params = Route.injectParams();
  readonly #search = Route.injectSearch();
  protected readonly id = computed(() => this.#params().id);
  protected readonly icons = icons;

  protected readonly pizzeriaResource = injectQuery(() =>
    pizzeriaQueryOptions(this.#apiFetch, this.id()),
  );

  // Pizza name search
  protected readonly pizzaNameSearch = signal('');
  protected readonly maxPrice = signal(this.#search().maxPrice ?? 50);
  readonly #trimmedPizzaNameSearch = computed(() => this.pizzaNameSearch().trim());
  readonly #debouncedSearch = injectDebouncedValue(
    this.#trimmedPizzaNameSearch,
    this.#trimmedPizzaNameSearch(),
    { wait: 300 },
  );

  protected readonly pizzasResource = injectQuery(() =>
    pizzeriaPizzasQueryOptions(
      this.#apiFetch,
      this.id(),
      this.hasActivePizzaSearch() ? this.#debouncedSearch() : undefined,
    ),
  );

  protected readonly hasActivePizzaSearch = computed<boolean>(
    () => this.#debouncedSearch().length > 0,
  );
  protected readonly filteredPizzas = computed(() =>
    (this.pizzasResource.data() ?? []).filter((pizza) => pizza.basePrice <= this.maxPrice()),
  );

  protected readonly addedToCartBannerVisible = signal(false);
  readonly #hideAddedToCartBanner = injectDebouncer(
    () => this.addedToCartBannerVisible.set(false),
    { wait: 5000 },
  );

  protected onPizzaNameSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pizzaNameSearch.set(value);
  }

  protected onMaxPriceInput(event: Event): void {
    this.maxPrice.set((event.target as HTMLInputElement).valueAsNumber);
  }

  protected onMaxPriceChange(event: Event): void {
    const maxPrice = (event.target as HTMLInputElement).valueAsNumber;
    this.maxPrice.set(maxPrice);
    void this.#navigate({
      to: '.',
      search: maxPrice === 50 ? {} : { maxPrice },
      replace: true,
      resetScroll: false,
    });
  }

  protected async openOrderModal(pizza: Pizza): Promise<void> {
    const ref = this.#dialog.open<string, PizzaOrderFormDialogData, PizzaOrderFormDialog>(
      PizzaOrderFormDialog,
      {
        data: {
          pizza,
          pizzeriaId: this.id(),
          displayPizzeriaName: this.pizzeriaResource.data()?.name ?? '',
          cart: this.#cart,
        },
        disableClose: false,
      },
    );

    const result = await firstValueFrom(ref.closed);
    if (result === 'added') {
      this.showAddedToCartBanner();
    }
  }

  protected dismissAddedToCartBanner(): void {
    this.#hideAddedToCartBanner.cancel();
    this.addedToCartBannerVisible.set(false);
  }

  protected showAddedToCartBanner(): void {
    this.addedToCartBannerVisible.set(true);
    this.#hideAddedToCartBanner.maybeExecute();
  }
}
