import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

/** Surface treatment: filled, border, or minimal. */
export type ButtonVariant = 'plain' | 'outlined' | 'ghost';
/** Color intent. */
export type ButtonPalette = 'primary' | 'secondary' | 'danger';

export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'button[rw-button],a[rw-button]',
  template: `
    @if (isLoading()) {
      <span [class]="spinnerClasses()" aria-hidden="true"></span>
      <span class="sr-only">Loading…</span>
    }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'stateClasses()',
    '[attr.type]': 'typeAttr()',
    '[attr.disabled]': 'disabledAttr()',
    '[attr.aria-busy]': 'isLoading() || null',
    '[attr.aria-disabled]': 'disabledAttr()',
    '[attr.tabindex]': 'tabIndexAttr()',
    '(click)': 'onHostClick($event)',
  },
})
export class Button {
  private readonly host = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);

  public readonly variant = input<ButtonVariant>('plain');
  public readonly palette = input<ButtonPalette>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly type = input<'button' | 'submit' | 'reset'>('button');
  public readonly isDisabled = input(false);
  public readonly isLoading = input(false);

  protected readonly isButtonHost = computed(() => this.host.nativeElement.tagName === 'BUTTON');

  protected readonly stateClasses = computed<string>(() =>
    [
      'relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-transparent font-medium leading-none no-underline transition hover:no-underline focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      this.size() === 'sm' ? 'rounded-sm px-3 py-2 text-sm' : 'px-5 py-3 text-base',
      this.variantClasses(),
      this.isLoading() ? 'text-transparent' : '',
      !this.isButtonHost() && (this.isDisabled() || this.isLoading())
        ? 'pointer-events-none opacity-50'
        : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly spinnerClasses = computed<string>(() =>
    [
      'absolute size-[1em] animate-spin rounded-full border-2 border-current border-t-transparent',
      this.variant() === 'plain' ? 'text-text-on-primary' : '',
      this.variant() === 'outlined' && this.palette() === 'danger' ? 'text-error' : '',
      this.variant() === 'outlined' && this.palette() !== 'danger' ? 'text-primary' : '',
      this.variant() === 'ghost' ? 'text-text-muted' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected typeAttr(): string | null {
    return this.isButtonHost() ? this.type() : null;
  }

  protected disabledAttr(): boolean | null {
    if (this.isButtonHost()) {
      return this.isDisabled() || this.isLoading() || null;
    }
    return this.isDisabled() || this.isLoading() || null;
  }

  protected tabIndexAttr(): number | null {
    if (!this.isButtonHost() && (this.isDisabled() || this.isLoading())) {
      return -1;
    }
    return null;
  }

  protected onHostClick(event: Event): void {
    if (!this.isButtonHost() && (this.isDisabled() || this.isLoading())) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private variantClasses(): string {
    const variant = this.variant();
    const palette = this.palette();
    if (variant === 'plain' && palette === 'danger') {
      return 'border-error bg-error text-text-on-primary hover:border-error-hover hover:bg-error-hover';
    }
    if (variant === 'plain') {
      return 'border-primary bg-primary text-text-on-primary hover:border-primary-dark hover:bg-primary-dark';
    }
    if (variant === 'outlined' && palette === 'danger') {
      return 'border-error bg-transparent text-error hover:bg-error hover:text-text-on-primary';
    }
    if (variant === 'outlined') {
      return 'border-primary bg-transparent text-primary hover:bg-primary hover:text-text-on-primary';
    }
    return 'border-border bg-transparent text-text hover:bg-surface-alt';
  }
}
