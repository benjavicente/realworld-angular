import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'rw-empty-state',
  template: `
    <div class="mx-auto max-w-[32rem] px-4 py-12 text-center text-text-muted" role="status">
      @if (icon()) {
        <img
          class="mx-auto mb-6 block w-40 opacity-85"
          [src]="'/icons/' + icon() + '.svg'"
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
  public readonly icon = input<string>('');
  public readonly text = input<string>('');
}
