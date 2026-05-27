import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { fieldErrorMessage, type FieldLike } from '../../forms/tanstack-form';

@Component({
  selector: 'rw-input',
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-text">
        @if (label()) {
          {{ label() }}
          @if (isRequired()) {
            <span class="ms-1 text-error" aria-hidden="true">*</span>
          }
        }
        <div class="relative has-[[rwInputSuffix]]:[&_input]:pe-13">
          <input
            [type]="type()"
            [placeholder]="placeholder()"
            [id]="field().name"
            [name]="field().name"
            [value]="field().state.value ?? ''"
            [attr.autocomplete]="autocomplete() ?? null"
            [disabled]="disabled()"
            (blur)="field().handleBlur()"
            (input)="
              field().handleChange(
                type() === 'number' ? $any($event.target).valueAsNumber : $any($event.target).value
              )
            "
            class="w-full appearance-none rounded-md border-[1.5px] border-border bg-surface px-4 py-3 text-base text-text transition focus:border-primary focus:shadow-focus focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60 placeholder:text-text-muted"
            [class.border-error]="field().state.meta.errors.length"
          />
          <ng-content select="[rwInputSuffix]" />
        </div>
      </label>
      @if (hint() && !field().state.meta.errors.length) {
        <span class="text-sm text-text-muted">{{ hint() }}</span>
      }
      @if (field().state.meta.errors.length) {
        <span class="text-sm font-medium text-error" role="alert">
          {{ fieldErrorMessage(field().state.meta.errors[0]) }}
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  public readonly label = input<string>('');
  public readonly type = input<string>('text');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly autocomplete = input<string | undefined>(undefined);
  public readonly isRequired = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly field = input.required<FieldLike<string | number | null>>();

  protected readonly fieldErrorMessage = fieldErrorMessage;
}
