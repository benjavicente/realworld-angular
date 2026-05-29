import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Callout } from '../../lib/components/callout/callout';
import { Pizza } from './-models/pizza.models';
import { Button } from '../../lib/components/button/button';
import { Spinner } from '../../lib/components/spinner/spinner';
import { EmptyState } from '../../lib/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import { AdminPizzaFormDialog } from './-components/admin-pizza-form-dialog/admin-pizza-form-dialog';
import { AdminPizzaRow } from './-components/admin-pizza-row/admin-pizza-row';
import { createLazyFileRoute, injectRouter } from '@benjavicente/angular-router-experimental';
import { adminPizzasQueryOptions } from '../../lib/api/api-queries';
import { injectQuery } from '@benjavicente/angular-query';

export const Route = createLazyFileRoute('/(pizzerias)/pizzerias/admin/pizzas')({
  component: () => AdminPizzaListPage,
});

@Component({
  selector: 'rw-admin-pizzas-page',
  imports: [Button, Spinner, Callout, EmptyState, AdminPizzaRow],
  template: `
    @if (deleteError()) {
      <rw-callout variant="error" [message]="deleteError()" />
    }

    <div class="mb-8 flex justify-end">
      <button rw-button (click)="openCreate()">+ Create pizza</button>
    </div>

    @if (pizzasResource.isPending()) {
      <div class="flex justify-center p-16" aria-label="Loading pizzas"><rw-spinner /></div>
    } @else if (pizzasResource.error()) {
      <rw-callout variant="error" message="Could not load pizzas. Please try again." />
    } @else {
      @let pizzas = pizzasResource.data()!;
      @if (pizzas.length === 0) {
        <rw-empty-state
          icon="folder-off"
          title="No pizzas yet"
          text="Create pizzas to build the menu customers see when they order."
        >
          <button rw-button (click)="openCreate()">Create your first pizza</button>
        </rw-empty-state>
      } @else {
        <section class="flex flex-col gap-3">
          <div class="overflow-x-auto rounded-md border border-border bg-surface">
            <table class="w-full border-collapse text-sm" aria-label="Pizzas">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Base price</th>
                  <th scope="col">Total price</th>
                  <th scope="col">Toppings</th>
                  <th scope="col" class="text-end">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (pizza of pizzas; track pizza.id) {
                  <tr
                    rw-admin-pizza-row
                    [pizza]="pizza"
                    (edit)="openEdit($event)"
                    (deleted)="onPizzaDeleted($event)"
                    (deleteError)="onDeleteError($event)"
                  ></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AdminPizzaListPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly queryClient = injectRouter().options.context.queryClient;
  private readonly dialog = inject(Dialog);

  protected readonly pizzasResource = injectQuery(() => adminPizzasQueryOptions(this.apiFetch));

  protected readonly deleteError = signal('');

  protected openCreate(): void {
    this.openPizzaFormDialog(null);
  }

  protected openEdit(pizza: Pizza): void {
    this.openPizzaFormDialog(pizza);
  }

  private openPizzaFormDialog(pizza: Pizza | null): void {
    const ref = this.dialog.open<
      { pizza: Pizza; mode: 'create' | 'edit' },
      Pizza | null,
      AdminPizzaFormDialog
    >(AdminPizzaFormDialog, {
      data: pizza,
    });

    ref.closed.subscribe((event) => {
      if (!event) return;
      const { pizza, mode } = event;
      if (mode === 'edit') {
        this.queryClient.setQueryData(adminPizzasQueryOptions(this.apiFetch).queryKey, () =>
          (this.pizzasResource.data() ?? []).map((existingPizza) =>
            existingPizza.id === pizza.id ? pizza : existingPizza,
          ),
        );
      } else {
        this.queryClient.setQueryData(adminPizzasQueryOptions(this.apiFetch).queryKey, [
          ...(this.pizzasResource.data() ?? []),
          pizza,
        ]);
      }
    });
  }

  protected onPizzaDeleted(pizza: Pizza): void {
    this.queryClient.setQueryData(adminPizzasQueryOptions(this.apiFetch).queryKey, () =>
      (this.pizzasResource.data() ?? []).filter((p) => p.id !== pizza.id),
    );
  }

  protected onDeleteError(message: string): void {
    this.deleteError.set(message);
  }
}
