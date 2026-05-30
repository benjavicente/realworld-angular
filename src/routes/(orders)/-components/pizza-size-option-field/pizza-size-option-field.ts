import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NumberFormatPipe } from '../../../../lib/pipes/number/number.pipe';
import { PizzaOption, SelectedPizzaOption } from '../../../(pizzerias)/-models/pizza.models';
import { fieldErrorMessage, type FieldLike } from '../../../../lib/forms/tanstack-form';

@Component({
  selector: 'rw-size-option-field',
  imports: [NumberFormatPipe],
  template: `
    <fieldset class="m-0 border-0 p-0">
      <legend class="mb-2 block text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
        Size
        @if (required()) {
          <span class="ms-1 text-error" aria-hidden="true">*</span>
        }
      </legend>
      <div class="flex flex-wrap gap-2" role="radiogroup">
        @for (option of options(); track option.id) {
          <label [class]="optionClasses(isSelected(option))">
            <input
              type="radio"
              class="sr-only"
              [checked]="isSelected(option)"
              (change)="toggle(option)"
            />
            <span class="min-w-0 flex-1">{{ option.label }}</span>
            @if (option.price > 0) {
              <span class="text-xs tabular-nums text-text-muted"
                >+€{{ option.price | number: '1.2-2' }}</span
              >
            }
          </label>
        }
      </div>
      @if (errors().length) {
        <span class="text-sm font-medium text-error" role="alert">{{
          fieldErrorMessage(errors()[0])
        }}</span>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeOptionField {
  public readonly options = input.required<PizzaOption[]>();

  public readonly value = model<SelectedPizzaOption | null>(null);
  public readonly touched = model(false);

  public readonly field = input<FieldLike<SelectedPizzaOption | null> | null>(null);
  public readonly disabled = input(false);
  public readonly required = input(true);
  protected readonly fieldErrorMessage = fieldErrorMessage;

  protected toggle(option: PizzaOption): void {
    if (this.disabled()) {
      return;
    }
    const current = this.currentValue();
    const nextValue =
      current?.id === option.id
        ? null
        : {
            id: option.id,
            label: option.label,
            price: option.price,
          };
    const field = this.field();
    if (field) {
      field.handleChange(nextValue);
      field.handleBlur();
    } else {
      this.value.set(nextValue);
    }
    this.touched.set(true);
  }

  protected isSelected(option: PizzaOption): boolean {
    return this.currentValue()?.id === option.id;
  }

  protected optionClasses(selected: boolean): string {
    const base =
      'flex cursor-pointer select-none items-center gap-2 rounded-full border-[1.5px] px-3 py-2 text-sm font-medium transition hover:border-primary has-[:focus-visible]:border-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary';
    return selected
      ? `${base} border-border-strong bg-neutral-selected font-semibold`
      : `${base} border-border`;
  }

  protected currentValue(): SelectedPizzaOption | null {
    return this.field()?.state.value ?? this.value();
  }

  protected isTouched(): boolean {
    return this.field()?.state.meta.isTouched ?? this.touched();
  }

  protected errors(): unknown[] {
    return this.field()?.state.meta.errors ?? [];
  }
}
