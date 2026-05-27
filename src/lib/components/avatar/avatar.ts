import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'rw-avatar',
  template: `
    <div [class]="avatarClasses()" [attr.aria-label]="'Avatar for ' + name()" role="img">
      <span class="leading-none" aria-hidden="true">
        {{ initials() }}
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  public readonly name = input.required<string>();
  public readonly size = input<'sm' | 'md'>('md');

  protected readonly avatarClasses = computed<string>(() =>
    [
      'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary font-bold text-text-on-primary',
      this.size() === 'sm' ? 'size-8 text-xs' : 'size-20 text-xl',
    ].join(' '),
  );

  protected readonly initials = computed<string>(() => {
    const parts = this.name().split(/(?=[A-Z])/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name().slice(0, 2).toUpperCase();
  });
}
