import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Link,
  Outlet,
  createLazyFileRoute,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Callout } from '../../lib/components/callout/callout';
import { adminPizzeriaQueryOptions } from '../../lib/api/api-queries';
import { injectQuery } from '@benjavicente/angular-query';
import { icons } from '../../lib/assets';

export const Route = createLazyFileRoute('/(pizzerias)/pizzerias/admin')({
  component: () => AdminPizzeriaDetailsPage,
});

@Component({
  selector: 'rw-admin-pizzeria-page',
  imports: [Link, Outlet, Spinner, Callout],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        @if (pizzeriaResource.isPending()) {
          <div class="flex justify-center p-16" aria-label="Loading pizzeria"><rw-spinner /></div>
        } @else if (pizzeriaResource.error()) {
          <rw-callout variant="error" message="Could not load pizzeria. Please try again." />
        } @else if (pizzeriaResource.data() !== undefined) {
          @let pizzeria = pizzeriaResource.data()!;
          <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl">
              {{ pizzeria.name }}
            </h1>
            <a
              [link]="{ to: '/pizzerias/' + pizzeria.id }"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-text no-underline transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View pizzeria page
              <img
                [src]="icons['external-link']"
                alt=""
                width="20"
                height="20"
                aria-hidden="true"
              />
            </a>
          </div>

          <nav class="mb-8" aria-label="Pizzeria admin">
            <ul class="flex list-none flex-wrap gap-2 border-b border-border">
              <li class="m-0">
                <a
                  class="inline-flex rounded-t-md border border-transparent px-4 py-2 text-sm font-medium text-text-muted no-underline transition hover:bg-surface-alt hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[status=active]:border-border data-[status=active]:bg-surface data-[status=active]:text-primary"
                  [link]="{ to: '/pizzerias/admin/pizzas' }"
                  >Pizzas</a
                >
              </li>
              <li class="m-0">
                <a
                  class="inline-flex rounded-t-md border border-transparent px-4 py-2 text-sm font-medium text-text-muted no-underline transition hover:bg-surface-alt hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[status=active]:border-border data-[status=active]:bg-surface data-[status=active]:text-primary"
                  [link]="{ to: '/pizzerias/admin/configuration' }"
                  >Configuration</a
                >
              </li>
            </ul>
          </nav>

          <main class="min-h-48">
            <outlet />
          </main>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AdminPizzeriaDetailsPage {
  readonly #apiFetch = injectRouter().options.context.apiFetch;
  protected readonly icons = icons;

  protected readonly pizzeriaResource = injectQuery(() =>
    adminPizzeriaQueryOptions(this.#apiFetch),
  );
}
