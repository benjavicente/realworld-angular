import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { fieldErrorMessage, type FieldLike } from '../../forms/tanstack-form';

@Component({
  selector: 'rw-textarea',
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-text">
        @if (label()) {
          {{ label() }}
          @if (isRequired()) {
            <span class="ms-1 text-error" aria-hidden="true">*</span>
          }
        }
        <textarea
          [placeholder]="placeholder()"
          [rows]="rows()"
          [id]="field().name"
          [name]="field().name"
          [value]="field().state.value"
          (blur)="field().handleBlur()"
          (input)="field().handleChange($any($event.target).value)"
          class="min-h-[100px] w-full resize-y rounded-md border-[1.5px] border-border bg-surface px-4 py-3 font-sans text-base leading-relaxed text-text transition focus:border-primary focus:shadow-focus focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60 placeholder:text-text-muted"
          [class.border-error]="field().state.meta.errors.length"
        ></textarea>
      </label>
      @if (maxLength()) {
        <span class="text-right text-xs text-text-muted">
          {{ charCount() }}/{{ maxLength() }}
        </span>
      }
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
export class Textarea {
  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly isRequired = input<boolean>(false);
  public readonly maxLength = input<number | undefined>(undefined);
  public readonly rows = input<number>(4);
  public readonly hint = input<string>('');
  public readonly field = input.required<FieldLike<string>>();
  protected readonly fieldErrorMessage = fieldErrorMessage;

  protected readonly charCount = computed<number>(() => {
    const val = this.field().state.value;
    return typeof val === 'string' ? val.length : 0;
  });
}
