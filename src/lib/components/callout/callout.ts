import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'rw-callout',
  imports: [],
  template: `
    @if (variant() === 'success') {
      <img
        class="size-5 shrink-0 [filter:invert(52%)_sepia(99%)_saturate(400%)_hue-rotate(73deg)_brightness(95%)_contrast(95%)]"
        src="/icons/success.svg"
        alt=""
        width="24"
        height="24"
        aria-hidden="true"
      />
    }
    @if (variant() === 'error') {
      <img
        class="size-5 shrink-0 [filter:invert(22%)_sepia(96%)_saturate(1200%)_hue-rotate(336deg)_brightness(95%)_contrast(95%)]"
        src="/icons/error.svg"
        alt=""
        width="24"
        height="24"
        aria-hidden="true"
      />
    }
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      @if (heading()) {
        <span class="font-semibold">{{ heading() }}</span>
      }
      <span [class]="messageClasses()">{{ message() }}</span>
    </div>
    <span class="shrink-0"><ng-content /></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'calloutClasses()',
    '[attr.role]': 'roleAttr()',
    '[attr.aria-live]': 'ariaLiveAttr()',
  },
})
export class Callout {
  public readonly message = input('');
  public readonly heading = input('');
  public readonly variant = input<'error' | 'success' | 'neutral'>('error');

  protected readonly calloutClasses = computed<string>(() =>
    [
      'mb-4 flex items-center justify-between gap-4 rounded-md border-2 border-border px-4 py-3 text-sm font-medium',
      this.heading() ? 'items-start' : '',
      this.variant() === 'error' ? 'border-error/35' : '',
      this.variant() === 'success'
        ? 'border-success-bright/35 bg-success-bright/10 text-success-bright'
        : '',
      this.variant() === 'neutral' ? 'bg-surface font-normal' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly messageClasses = computed<string>(() =>
    ['flex-1', this.variant() === 'neutral' ? 'text-text-muted' : ''].filter(Boolean).join(' '),
  );

  protected readonly roleAttr = computed<'alert' | 'status' | null>(() => {
    const variant = this.variant();
    if (variant === 'error') {
      return 'alert';
    }
    if (variant === 'success') {
      return 'status';
    }
    return null;
  });

  protected readonly ariaLiveAttr = computed<'assertive' | 'polite' | null>(() => {
    const variant = this.variant();
    if (variant === 'error') {
      return 'assertive';
    }
    if (variant === 'success') {
      return 'polite';
    }
    return null;
  });
}
