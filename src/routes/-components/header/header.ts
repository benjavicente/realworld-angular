import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { Link, injectRouter } from '@benjavicente/angular-router-experimental';
import { injectQuery } from '@benjavicente/angular-query';
import { authUserQueryOptions } from '../../../lib/services/auth';
import { Avatar } from '../../../lib/components/avatar/avatar';
import { PizzaLogo } from '../../../lib/components/pizza-logo/pizza-logo';
import { injectCartClientItemCount } from '../../(shop)/-store/inject-cart';
import { injectHotkey } from '@tanstack/angular-hotkeys';
import { icons } from '../../../lib/assets';

const navLinkClass =
  'cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-text-muted no-underline transition hover:bg-surface-alt hover:text-text hover:no-underline data-[status=active]:bg-surface-alt data-[status=active]:text-text';

@Component({
  selector: 'rw-header',
  imports: [Link, Avatar, PizzaLogo],
  template: `
    <header
      class="sticky top-0 z-[var(--z-sticky)] h-nav border-b border-border bg-surface"
      role="banner"
    >
      <div
        class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8 flex h-full items-center gap-6 max-md:gap-3"
      >
        <a
          [link]="{ to: '/' }"
          class="flex shrink-0 items-center gap-2 no-underline hover:no-underline"
          aria-label="Sliced – Home"
        >
          <rw-pizza-logo class="inline-flex" [size]="28" />
          <span class="font-sans text-xl font-bold text-primary">Sliced</span>
        </a>

        <nav class="flex flex-1 items-center gap-2 max-md:hidden" aria-label="Main navigation">
          @if (!isAdmin()) {
            <a [link]="{ to: '/', activeOptions: { exact: true } }" [class]="navLinkClass"
              >Pizzerias</a
            >
          }

          @if (isCustomer()) {
            <a [link]="{ to: '/orders' }" [class]="navLinkClass">My Orders</a>
          }

          @if (isAdmin()) {
            <a [link]="{ to: '/pizzerias/admin' }" [class]="navLinkClass">My Pizzeria</a>
            <a [link]="{ to: '/orders' }" [class]="navLinkClass">Orders</a>
          }
        </nav>

        <!-- Actions -->
        <div class="ms-auto flex items-center gap-3">
          @if (!isAdmin()) {
            <a
              [link]="{ to: '/cart' }"
              class="relative flex size-10 items-center justify-center rounded-full text-lg no-underline transition hover:bg-surface-alt hover:no-underline"
              [attr.aria-label]="
                'Cart – ' + cartItemCount() + ' ' + (cartItemCount() === 1 ? 'pizza' : 'pizzas')
              "
            >
              <span class="[&_img]:block [&_img]:size-[1.125rem]" aria-hidden="true">
                <img [src]="icons['shopping-cart']" alt="" width="24" height="24" />
              </span>
              @if (cartItemCount() > 0) {
                <span
                  class="absolute right-0.5 top-0.5 flex size-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-white"
                  aria-hidden="true"
                  >{{ cartItemCount() }}</span
                >
              }
            </a>
          }

          @if (isAuthenticated()) {
            <a
              [link]="{ to: '/profile' }"
              class="flex rounded-full no-underline transition hover:shadow-[0_0_0_3px_var(--color-border)] hover:no-underline"
              aria-label="Profile for {{ user()?.name }}"
            >
              <rw-avatar [name]="user()!.name" size="sm" />
            </a>
          } @else {
            <a
              [link]="{ to: '/auth/login', search: { redirect: redirectPath() } }"
              class="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-text-muted no-underline transition hover:bg-surface-alt hover:text-text hover:no-underline max-md:hidden"
              >Log in</a
            >
            <a
              [link]="{ to: '/auth/register', search: { redirect: redirectPath() } }"
              class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary no-underline transition hover:bg-primary-dark hover:no-underline max-md:hidden"
              >Join</a
            >
          }

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="hidden cursor-pointer rounded-md p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-md:flex"
            [attr.aria-expanded]="isMobileMenuOpen()"
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
            (click)="toggleMobileMenu()"
          >
            <img [src]="icons.menu" alt="" aria-hidden="true" width="24" height="24" />
          </button>
        </div>
      </div>

      @if (isMobileMenuOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-[var(--z-overlay)] hidden bg-black/30 max-md:block"
          aria-label="Close menu"
          (click)="closeMobileMenu()"
        ></button>
        <nav
          id="mobile-menu"
          class="fixed inset-y-0 right-0 z-[calc(var(--z-overlay)+1)] hidden w-[min(24rem,100vw)] bg-surface shadow-xl max-md:block"
          role="navigation"
          aria-label="Mobile navigation"
          (click)="onMobileMenuNavigate($event)"
        >
          <div
            class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8 flex h-nav items-center justify-between border-b border-border"
          >
            <a
              [link]="{ to: '/' }"
              class="flex shrink-0 items-center gap-2 no-underline hover:no-underline"
              aria-label="Sliced – Home"
            >
              <rw-pizza-logo class="inline-flex" [size]="28" />
              <span class="font-sans text-xl font-bold text-primary">Sliced</span>
            </a>
            <button
              type="button"
              class="hidden cursor-pointer rounded-md p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary max-md:flex"
              aria-label="Close mobile menu"
              (click)="closeMobileMenu()"
            >
              <img [src]="icons.close" alt="" aria-hidden="true" width="24" height="24" />
            </button>
          </div>
          <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8 p-4">
            <div class="flex flex-col">
              @if (!isAdmin()) {
                <a
                  [link]="{ to: '/' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                  >Pizzerias</a
                >
              }

              @if (isCustomer()) {
                <a
                  [link]="{ to: '/orders' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                  >My Orders</a
                >
              }

              @if (isAdmin()) {
                <a
                  [link]="{ to: '/pizzerias/admin' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                  >My Pizzeria</a
                >
                <a
                  [link]="{ to: '/orders' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                  >Orders</a
                >
              }

              @if (!isAdmin()) {
                <a
                  [link]="{ to: '/cart' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                >
                  Cart
                  @if (cartItemCount() > 0) {
                    <span
                      class="absolute right-0.5 top-0.5 flex size-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-white"
                      aria-hidden="true"
                      >{{ cartItemCount() }}</span
                    >
                  }
                </a>
              }

              @if (isAuthenticated()) {
                <a
                  [link]="{ to: '/profile' }"
                  class="block w-full cursor-pointer border-b border-border py-3 text-left text-base font-medium text-text no-underline transition hover:text-primary hover:no-underline"
                  >Profile</a
                >
              }
            </div>

            @if (!isAuthenticated()) {
              <div class="mt-6 rounded-lg border border-border bg-surface-alt p-4">
                <p class="mb-1 font-semibold text-text">Welcome back</p>
                <p class="mb-4 text-sm text-text-muted">
                  Log in to your account or create a new one.
                </p>
                <div class="flex gap-3">
                  <a
                    [link]="{ to: '/auth/login', search: { redirect: redirectPath() } }"
                    class="flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold no-underline border border-border text-text hover:bg-surface"
                    >Log in</a
                  >
                  <a
                    [link]="{ to: '/auth/register', search: { redirect: redirectPath() } }"
                    class="flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold no-underline bg-primary text-text-on-primary hover:bg-primary-dark"
                    >Join</a
                  >
                </div>
              </div>
            }
          </div>
        </nav>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly userQuery = injectQuery(() => authUserQueryOptions(this.apiFetch));

  protected readonly user = computed(() => this.userQuery.data() ?? null);
  protected readonly isAuthenticated = computed(() => this.user() !== null);
  protected readonly isCustomer = computed(() => this.user()?.role === 'CUSTOMER');
  protected readonly isAdmin = computed(() => this.user()?.role === 'PIZZERIA_ADMIN');
  protected readonly cartItemCount = injectCartClientItemCount();
  protected readonly navLinkClass = navLinkClass;
  protected readonly icons = icons;
  private readonly router = injectRouter();

  protected readonly isMobileMenuOpen = signal(false);
  protected readonly redirectPath = () => {
    const href = this.router.state.location.href;
    return href.startsWith('/auth/') ? '/' : href;
  };

  public constructor() {
    injectHotkey('Escape', () => {
      if (this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });

    effect(() => {
      const open = this.isMobileMenuOpen();
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected onMobileMenuNavigate(event: Event): void {
    const target = event.target;
    if (target instanceof Element && target.closest('a')) {
      this.closeMobileMenu();
    }
  }
}
