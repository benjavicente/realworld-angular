import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { icons, type IconName } from '../../assets';

@Component({
  selector: 'rw-empty-state',
  template: `
    <div class="mx-auto max-w-[32rem] px-4 py-12 text-center text-text-muted" role="status">
      @if (iconUrl(); as src) {
        <img
          class="mx-auto mb-6 block w-40 opacity-85"
          [src]="src"
          alt=""
          width="160"
          height="160"
          decoding="async"
          aria-hidden="true"
        />
      }
      @if (title()) {
        <h2 class="mb-3 text-lg font-semibold text-text">{{ title() }}</h2>
      }
      <p class="mb-4 leading-relaxed">{{ text() }}</p>
      <div
        class="flex flex-col flex-wrap items-center justify-center gap-3 empty:hidden [&_a]:font-semibold [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline"
      >
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  public readonly title = input<string>('');
  public readonly icon = input<IconName | ''>('');
  public readonly text = input<string>('');

  protected readonly iconUrl = computed(() => {
    const icon = this.icon();
    return icon ? icons[icon] : null;
  });
}
