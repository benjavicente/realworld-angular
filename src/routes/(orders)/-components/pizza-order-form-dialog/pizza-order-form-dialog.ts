import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Callout } from '../../../../lib/components/callout/callout';
import { SelectedPizzaOption } from '../../../(pizzerias)/-models/pizza.models';
import { PizzaOrderFormDialogData } from '../../-models/order.models';
import { Button } from '../../../../lib/components/button/button';
import { Modal } from '../../../../lib/components/modal/modal';
import { CatalogImageUrlPipe } from '../../../../lib/pipes/catalog-image-url.pipe';
import { SizeOptionField } from '../pizza-size-option-field/pizza-size-option-field';
import { Spinner } from '../../../../lib/components/spinner/spinner';
import { injectQuery } from '@benjavicente/angular-query';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { pizzaOptionsQueryOptions } from '../../../../lib/api/api-queries';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import {
  minNumber,
  requiredValue,
  validateSubmitFields,
} from '../../../../lib/forms/tanstack-form';

interface PizzaOrderFormModel {
  selectedSize: SelectedPizzaOption | null;
  extraToppings: boolean[];
  quantity: number;
}

@Component({
  selector: 'rw-pizza-order-form-dialog',
  imports: [
    Modal,
    DecimalPipe,
    Button,
    CatalogImageUrlPipe,
    TanStackField,
    SizeOptionField,
    Spinner,
    Callout,
  ],
  template: `
    <rw-modal [title]="data.pizza.name">
      <form
        class="grid gap-6 min-[560px]:grid-cols-[220px_1fr]"
        (submit)="$event.preventDefault(); addToCart()"
      >
        @if (submitError()) {
          <rw-callout variant="error" [message]="submitError()" />
        }

        <div
          class="aspect-square overflow-hidden rounded-lg bg-surface-alt min-[560px]:aspect-auto"
        >
          <img
            class="size-full object-cover"
            [src]="data.pizza.image | catalogImageUrl: 'pizza'"
            alt=""
            width="520"
            height="390"
          />
        </div>

        <div class="flex flex-col gap-5">
          <p class="m-0 text-sm leading-snug text-text-muted">
            Comes with: {{ defaultToppings }}
          </p>

          <ng-container
            [tanstackField]="orderForm"
            name="selectedSize"
            [validators]="{ onChange: requiredSize, onSubmit: requiredSize }"
            #selectedSize="field"
          >
            <rw-size-option-field
              [options]="sizesResource.data() ?? []"
              [field]="selectedSize.api"
            />
          </ng-container>

          <fieldset class="m-0 border-0 p-0">
            <legend
              class="mb-2 block text-sm font-semibold uppercase tracking-[0.05em] text-text-muted"
            >
              Extra Toppings
            </legend>
            @if (toppingsResource.isPending()) {
              <div class="text-sm text-text-muted" aria-label="Loading toppings">
                <rw-spinner />
              </div>
            } @else if (toppingsResource.error()) {
              <p class="mt-1 text-sm text-error" role="alert">
                Could not load toppings. Check that the API is running.
              </p>
            } @else if (!extraToppingsReady()) {
              <div class="text-sm text-text-muted" aria-label="Loading toppings">
                <rw-spinner />
              </div>
            } @else {
              <div class="flex flex-wrap gap-2">
                @for (topping of toppingsOptions(); track topping.id; let i = $index) {
                  <label [class]="optionClasses(orderFormState().values.extraToppings[i])">
                    <input
                      type="checkbox"
                      class="sr-only"
                      [checked]="orderFormState().values.extraToppings[i]"
                      (change)="setExtraTopping(i, $any($event.target).checked)"
                    />
                    <span class="min-w-0 flex-1">{{ topping.label }}</span>
                    <span class="text-xs tabular-nums text-text-muted"
                      >+€{{ topping.price | number: '1.2-2' }}</span
                    >
                  </label>
                }
              </div>
            }
          </fieldset>

          <div class="flex items-center justify-between gap-4">
            <span class="font-medium">Quantity</span>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border text-text hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:[&_svg]:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                [disabled]="orderFormState().values.quantity <= 1"
                aria-label="Decrease quantity"
                (click)="decrementQuantity()"
              >
                <svg class="size-6" viewBox="0 -960 960 960" aria-hidden="true">
                  <path fill="currentColor" d="M200-440v-80h560v80H200Z" />
                </svg>
              </button>
              <ng-container
                [tanstackField]="orderForm"
                name="quantity"
                [validators]="{ onChange: minimumQuantity }"
                #quantity="field"
              >
                <input
                  type="number"
                  min="1"
                  class="inline-block w-18 rounded-md border-[1.5px] border-border bg-surface px-2 py-1 text-center text-base tabular-nums text-text transition focus:border-primary focus:shadow-focus focus:outline-none"
                  [id]="quantity.api.name"
                  [name]="quantity.api.name"
                  [value]="quantity.api.state.value"
                  aria-label="Quantity"
                  (blur)="quantity.api.handleBlur()"
                  (input)="quantity.api.handleChange($any($event.target).valueAsNumber)"
                />
              </ng-container>
              <button
                type="button"
                class="flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border text-text hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="Increase quantity"
                (click)="incrementQuantity()"
              >
                <svg class="size-6" viewBox="0 -960 960 960" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-4 border-t border-border pt-4">
            <div class="flex items-center justify-between text-lg">
              <span>Total</span>
              <strong class="text-xl tabular-nums text-primary">€{{ modalTotal() | number: '1.2-2' }}</strong>
            </div>
            <div class="flex justify-end [&_button[rw-button]]:min-w-32">
              <button
                rw-button
                type="submit"
                [isLoading]="orderFormState().isSubmitting"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </form>
    </rw-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaOrderFormDialog {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<PizzaOrderFormDialogData>(DIALOG_DATA);
  private readonly cart = this.data.cart;

  protected readonly sizesResource = injectQuery(() =>
    pizzaOptionsQueryOptions(this.apiFetch, 'sizes'),
  );
  protected readonly toppingsResource = injectQuery(() =>
    pizzaOptionsQueryOptions(this.apiFetch, 'toppings'),
  );

  protected readonly toppingsOptions = computed(() => this.toppingsResource.data() ?? []);

  public readonly defaultToppings = this.data.pizza.toppings
    .map((topping) => topping.label)
    .join(', ');

  protected readonly submitError = signal('');

  protected readonly orderForm = injectForm({
    defaultValues: {
      selectedSize: null,
      extraToppings: [],
      quantity: 1,
    } satisfies PizzaOrderFormModel,
    onSubmit: ({ value }) => {
      this.submitError.set('');
      try {
        if (this.cart.hasItemsForOtherPizzeria(this.data.pizzeriaId)) {
          this.cart.clear();
        }

        const { selectedSize, extraToppings, quantity } = value;
        this.cart.addItem(
          this.data.pizza.id,
          Number(quantity),
          selectedSize?.id ?? null,
          extraToppings
            .map((selected, index) =>
              selected ? (this.toppingsResource.data() ?? [])[index].id : null,
            )
            .filter((t): t is string => t !== null),
          this.data.pizzeriaId,
        );
        this.dialogRef.close('added');
      } catch {
        this.submitError.set('Could not add to cart. Please try again.');
      }
    },
  });
  protected readonly orderFormState = injectStore(this.orderForm);
  protected readonly requiredSize = requiredValue('Please select a size');
  protected readonly minimumQuantity = minNumber(1, 'Quantity must be at least 1');

  protected optionClasses(selected: boolean): string {
    const base =
      'flex cursor-pointer select-none items-center gap-2 rounded-full border-[1.5px] px-3 py-2 text-sm font-medium transition hover:border-primary has-[:focus-visible]:border-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary';
    return selected
      ? `${base} border-border-strong bg-neutral-selected font-semibold`
      : `${base} border-border`;
  }

  protected readonly extraToppingsReady = computed(() => {
    if (this.toppingsResource.isPending()) {
      return false;
    }
    const toppingsCount = this.toppingsOptions().length;
    return (
      toppingsCount === 0 || this.orderFormState().values.extraToppings.length === toppingsCount
    );
  });

  protected readonly modalTotal = computed<number>(() => {
    const { selectedSize, extraToppings, quantity } = this.orderFormState().values;
    const pizza = this.data.pizza;
    const sizePrice = selectedSize?.price ?? 0;
    const toppingsPrice = extraToppings.reduce(
      (sum, topping, index) =>
        sum + (topping ? (this.toppingsResource.data() ?? [])[index].price : 0),
      0,
    );
    return (pizza.basePrice + sizePrice + toppingsPrice) * Number(quantity);
  });

  public constructor() {
    effect(() => {
      const toppings = this.toppingsResource.data();
      if (!toppings) {
        return;
      }

      if (this.orderForm.state.values.extraToppings.length === toppings.length) {
        return;
      }
      this.orderForm.setFieldValue(
        'extraToppings',
        toppings.map(() => false),
        { dontUpdateMeta: true },
      );
    });
  }

  protected async addToCart(): Promise<void> {
    if (await validateSubmitFields(this.orderForm, ['selectedSize', 'quantity'])) {
      await this.orderForm.handleSubmit();
    }
  }

  protected setExtraTopping(index: number, selected: boolean): void {
    const extraToppings = [...this.orderForm.state.values.extraToppings];
    extraToppings[index] = selected;
    this.orderForm.setFieldValue('extraToppings', extraToppings);
  }

  protected decrementQuantity(): void {
    this.orderForm.setFieldValue('quantity', Math.max(1, this.orderForm.state.values.quantity - 1));
  }

  protected incrementQuantity(): void {
    this.orderForm.setFieldValue('quantity', this.orderForm.state.values.quantity + 1);
  }
}
