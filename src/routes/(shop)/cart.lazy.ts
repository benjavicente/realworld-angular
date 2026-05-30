import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Link, createLazyFileRoute, injectRouter } from '@benjavicente/angular-router-experimental';
import { DecimalPipe } from '@angular/common';
import { injectQuery } from '@benjavicente/angular-query';
import { cartPreviewQueryOptions } from '../../lib/api/api-queries';
import { authUserQueryOptions } from '../../lib/services/auth';
import { injectCartClient, injectCartClientState } from './-store/inject-cart';
import { Button } from '../../lib/components/button/button';
import { Callout } from '../../lib/components/callout/callout';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Spinner } from '../../lib/components/spinner/spinner';
import { CatalogImageUrlPipe } from '../../lib/pipes/catalog-image-url.pipe';
import { icons } from '../../lib/assets';
import type { CartOption } from './-store/cart.types';

export const Route = createLazyFileRoute('/(shop)/cart')({
  component: () => CartPage,
});

@Component({
  selector: 'rw-cart-page',
  imports: [Link, DecimalPipe, Button, Callout, EmptyState, Spinner, CatalogImageUrlPipe],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        @if (cartClient.isEmpty()) {
          <rw-empty-state
            icon="empty-shopping-cart"
            title="Your cart is empty"
            text="Pick a pizzeria and add pizzas to get started."
          >
            <a [link]="{ to: '/' }">Browse pizzerias</a>
          </rw-empty-state>
        } @else if (cartPreviewQuery.isPending() && !cartPreviewQuery.data()) {
          <div class="flex justify-center p-16" aria-label="Loading cart"><rw-spinner /></div>
        } @else if (cartPreviewQuery.isError() && !cartPreviewQuery.data()) {
          <rw-callout
            variant="error"
            heading="Could not load cart details"
            message="Your items are saved locally, but we could not reach the server. Check that the API is running and refresh the page."
          />
        } @else if (cartPreviewQuery.data(); as data) {
          <div class="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_320px]">
            <section class="cart-pizzas">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p class="m-0 min-w-0 text-sm text-text-muted">
                  Ordering from
                  <strong>
                    <a [link]="{ to: '/pizzerias/' + data.pizzeria.id }">
                      {{ data.pizzeria.name }}
                    </a>
                  </strong>
                </p>
                <button rw-button variant="outlined" size="sm" type="button" (click)="cart.clear()">
                  Clear cart
                </button>
              </div>

              <ul class="flex list-none flex-col gap-4" role="list">
                @for (item of data.items; track item.id) {
                  <li
                    class="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-lg border border-border bg-surface p-4"
                  >
                    <div class="size-[72px] overflow-hidden rounded-md">
                      <img
                        [src]="item.pizza.image | catalogImageUrl: 'pizza'"
                        alt=""
                        class="size-full object-cover"
                        width="80"
                        height="80"
                      />
                    </div>
                    <div>
                      <p class="font-semibold">{{ item.pizza.name }}</p>
                      @if (item.size || item.extraToppings.length > 0) {
                        <p class="text-xs text-text-muted">
                          @if (item.size) {
                            {{ item.size.label }}
                          }
                          @if (item.size && item.extraToppings.length > 0) {
                            ,
                          }
                          {{ formatExtraToppings(item.extraToppings) }}
                        </p>
                      }
                      <p class="font-medium tabular-nums text-primary">
                        €{{ item.totalPrice | number: '1.2-2' }}
                      </p>
                    </div>
                    <div class="flex flex-row flex-wrap items-center justify-end gap-2">
                      <div class="flex items-center gap-2" role="group">
                        <button
                          type="button"
                          class="flex size-7 items-center justify-center rounded-full border-[1.5px] border-border text-text hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:[&_svg]:opacity-40"
                          [disabled]="item.quantity <= 1"
                          aria-label="Decrease quantity"
                          (click)="cart.updateQuantity(item.id, item.quantity - 1)"
                        >
                          <svg class="size-6" viewBox="0 -960 960 960" aria-hidden="true">
                            <path fill="currentColor" d="M200-440v-80h560v80H200Z" />
                          </svg>
                        </button>
                        <span class="min-w-6 text-center font-semibold">{{ item.quantity }}</span>
                        <button
                          type="button"
                          class="flex size-7 items-center justify-center rounded-full border-[1.5px] border-border text-text hover:border-primary hover:text-primary"
                          aria-label="Increase quantity"
                          (click)="cart.updateQuantity(item.id, item.quantity + 1)"
                        >
                          <svg class="size-6" viewBox="0 -960 960 960" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        class="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border p-0 hover:border-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_img]:opacity-75 hover:[&_img]:opacity-100"
                        [attr.aria-label]="'Remove ' + item.pizza.name"
                        (click)="cart.removeItem(item.id)"
                      >
                        <img
                          [src]="icons.delete"
                          alt=""
                          width="20"
                          height="20"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </li>
                }
              </ul>
            </section>

            <aside
              class="sticky top-20 flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
            >
              <h2 class="text-lg font-semibold">Order summary</h2>
              @if (!isAuthenticated()) {
                <div class="flex flex-col gap-3 rounded-md border border-info bg-info-bg p-4">
                  <p class="m-0 text-sm text-text">Please log in to place your order.</p>
                  <a
                    rw-button
                    class="block w-full"
                    [link]="{ to: '/auth/login', search: { redirect: '/cart' } }"
                  >
                    Log in to checkout
                  </a>
                  <a
                    [link]="{ to: '/auth/register', search: { redirect: '/cart' } }"
                    class="text-center text-sm font-medium text-primary underline hover:text-primary-light"
                  >
                    No account? Join for free
                  </a>
                </div>
              }
              <ul class="flex list-none flex-col gap-2">
                @for (item of data.items; track item.id) {
                  <li class="flex items-baseline justify-between gap-3 text-sm text-text-muted">
                    <span class="min-w-0">
                      {{ item.pizza.name }}
                      @if (item.quantity > 1) {
                        <span class="whitespace-nowrap font-medium"> ×{{ item.quantity }}</span>
                      }
                    </span>
                    <span class="tabular-nums">€{{ item.totalPrice | number: '1.2-2' }}</span>
                  </li>
                }
              </ul>
              <div
                class="flex justify-between border-t border-border pt-3 text-base [&_strong]:text-lg [&_strong]:text-primary"
              >
                <span>Total</span>
                <strong class="tabular-nums">€{{ data.total | number: '1.2-2' }}</strong>
              </div>
              @if (isAuthenticated()) {
                <a rw-button class="block w-full" [link]="{ to: '/checkout/delivery' }">
                  Proceed to checkout
                </a>
              }
            </aside>
          </div>
        } @else {
          <rw-callout
            variant="error"
            message="Unable to display your cart. Please refresh the page."
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CartPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  protected readonly cart = injectCartClient();
  protected readonly cartClient = injectCartClientState();
  protected readonly cartPreviewQuery = injectQuery(() =>
    cartPreviewQueryOptions(this.apiFetch, this.cartClient.pizzeria(), this.cartClient.items()),
  );
  private readonly userQuery = injectQuery(() => authUserQueryOptions(this.apiFetch));

  protected readonly isAuthenticated = computed(() => this.userQuery.data() !== null);
  protected readonly icons = icons;

  protected formatExtraToppings(toppings: CartOption[]): string {
    return toppings.map((topping) => topping.label).join(', ');
  }
}
