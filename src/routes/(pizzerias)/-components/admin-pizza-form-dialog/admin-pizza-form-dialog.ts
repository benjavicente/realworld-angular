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
import { Pizza } from '../../-models/pizza.models';
import { Input } from '../../../../lib/components/input/input';
import { Button } from '../../../../lib/components/button/button';
import { ImagePicker } from '../../../../lib/components/image-picker/image-picker';
import { Modal } from '../../../../lib/components/modal/modal';
import { ModalFooter } from '../../../../lib/components/modal/modal-footer';
import { injectMutation, injectQuery } from '@benjavicente/angular-query-experimental';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { pizzaOptionsQueryOptions } from '../../../../lib/api/api-queries';
import {
  createPizzaMutationOptions,
  updatePizzaMutationOptions,
} from '../../../../lib/api/api-mutations';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import {
  composeValidators,
  minNumber,
  requiredValue,
  validateSubmitFields,
} from '../../../../lib/forms/tanstack-form';

interface AdminPizzaFormModel {
  basePrice: number;
  name: string;
  image: string | null;
  extraToppings: boolean[];
}

@Component({
  selector: 'rw-admin-pizza-form-dialog',
  imports: [DecimalPipe, TanStackField, Input, Button, ImagePicker, Modal, ModalFooter, Callout],
  template: `
    <rw-modal [title]="isEditMode ? 'Edit Pizza' : 'New Pizza'">
      <form class="flex flex-col gap-5" (submit)="$event.preventDefault(); save()">
        @if (submitError()) {
          <rw-callout variant="error" [message]="submitError()" />
        }
        <ng-container [tanstackField]="pizzaForm" name="name" #name="field">
          <rw-input
            label="Name"
            type="text"
            [field]="name.api"
            [disabled]="true"
            [placeholder]="
              isEditMode
                ? ''
                : 'The name is assigned automatically when you save; you cannot set it here.'
            "
          />
        </ng-container>

        <ng-container
          [tanstackField]="pizzaForm"
          name="basePrice"
          [validators]="{ onChange: priceValidator, onSubmit: priceValidator }"
          #basePrice="field"
        >
          <rw-input
            label="Base price (€)"
            type="number"
            [isRequired]="true"
            [field]="basePrice.api"
          />
        </ng-container>

        <ng-container
          [tanstackField]="pizzaForm"
          name="image"
          [validators]="{ onChange: requiredImage, onSubmit: requiredImage }"
          #image="field"
        >
          <rw-image-picker
            category="pizza"
            label="Pizza image"
            [required]="true"
            [field]="image.api"
          />
        </ng-container>

        <fieldset class="m-0 border-0 p-0">
          <legend>Toppings</legend>
          @for (topping of toppingsResource.data() ?? []; track topping.id; let i = $index) {
            <label [class]="toppingOptionClasses(pizzaFormState().values.extraToppings[i])">
              <input
                type="checkbox"
                class="sr-only"
                [checked]="pizzaFormState().values.extraToppings[i]"
                (change)="setExtraTopping(i, $any($event.target).checked)"
              />
              <span class="font-medium">{{ topping.label }}</span>
              <span class="text-sm text-text-muted" aria-label="Extra price"
                >+€{{ topping.price | number: '1.2-2' }}</span
              >
            </label>
          }
        </fieldset>
      </form>

      <rw-modal-footer class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <p class="flex gap-2 text-sm">
            <span class="text-text-muted">Total price</span>
            <strong class="font-semibold text-primary">
              €{{ pizzaTotalPrice() | number: '1.2-2' }}
            </strong>
          </p>
        </div>
        <div class="flex justify-end gap-3">
          <rw-button variant="ghost" palette="secondary" type="button" (click)="dismiss()"
            >Cancel</rw-button
          >
          <rw-button type="button" [isLoading]="pizzaFormState().isSubmitting" (click)="save()">
            {{ isEditMode ? 'Save changes' : 'Create pizza' }}
          </rw-button>
        </div>
      </rw-modal-footer>
    </rw-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzaFormDialog {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly dialogRef = inject(DialogRef);
  public readonly data = inject<Pizza | null>(DIALOG_DATA, { optional: true });
  private readonly createPizzaMutation = injectMutation(() =>
    createPizzaMutationOptions(this.apiFetch),
  );
  private readonly updatePizzaMutation = injectMutation(() =>
    updatePizzaMutationOptions(this.apiFetch),
  );

  protected readonly isEditMode = this.data !== null;

  protected readonly toppingsResource = injectQuery(() =>
    pizzaOptionsQueryOptions(this.apiFetch, 'toppings'),
  );

  protected readonly submitError = signal('');

  protected readonly pizzaForm = injectForm({
    defaultValues: {
      basePrice: this.data?.basePrice ?? 10,
      name: this.data?.name ?? '',
      image: this.data?.image ?? null,
      extraToppings: [],
    } satisfies AdminPizzaFormModel,
    onSubmit: async ({ value }) => {
      const { basePrice, image, extraToppings } = value;
      const toppingIds = extraToppings
        .map((selected, index) =>
          selected ? (this.toppingsResource.data() ?? [])[index].id : null,
        )
        .filter((t): t is string => t !== null);
      const payload = {
        basePrice,
        imageFilename: image!,
        toppingIds,
      };

      this.submitError.set('');
      try {
        const pizza = this.isEditMode
          ? await this.updatePizzaMutation.mutateAsync({ id: this.data!.id, body: payload })
          : await this.createPizzaMutation.mutateAsync(payload);
        this.dialogRef.close({ pizza, mode: this.isEditMode ? 'edit' : 'create' });
      } catch {
        this.submitError.set('Save failed');
      }
    },
  });
  protected readonly pizzaFormState = injectStore(this.pizzaForm);
  protected readonly requiredPrice = requiredValue('Price is required');
  protected readonly requiredImage = requiredValue('Select an image');
  protected readonly minimumPrice = minNumber(0, 'Price must be >= 0');
  protected readonly priceValidator = composeValidators(this.requiredPrice, this.minimumPrice);

  protected toppingOptionClasses(selected: boolean): string {
    const base =
      'flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition hover:border-primary';
    return selected ? `${base} border-primary bg-surface-alt` : `${base} border-border`;
  }

  protected readonly selectedToppingsPrice = computed((): number => {
    const opts = this.toppingsResource.data();
    const extra = this.pizzaFormState().values.extraToppings;
    return (opts ?? []).reduce((sum, o, i) => (extra[i] ? sum + o.price : sum), 0);
  });

  protected readonly pizzaTotalPrice = computed((): number | null => {
    return (this.pizzaFormState().values.basePrice ?? 0) + this.selectedToppingsPrice();
  });

  public constructor() {
    effect(() => {
      const toppings = this.toppingsResource.data();
      if (!toppings) {
        return;
      }

      if (this.pizzaForm.state.values.extraToppings.length === toppings.length) {
        return;
      }
      this.pizzaForm.setFieldValue(
        'extraToppings',
        toppings.map((t) => this.data?.toppings?.some((pt) => pt.id === t.id) ?? false),
        { dontUpdateMeta: true },
      );
    });
  }

  protected async save(): Promise<void> {
    if (await validateSubmitFields(this.pizzaForm, ['basePrice', 'image'])) {
      await this.pizzaForm.handleSubmit();
    }
  }

  protected setExtraTopping(index: number, selected: boolean): void {
    const extraToppings = [...this.pizzaForm.state.values.extraToppings];
    extraToppings[index] = selected;
    this.pizzaForm.setFieldValue('extraToppings', extraToppings);
  }

  protected dismiss(): void {
    this.dialogRef.close();
  }
}
