import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { icons } from '../../assets';

@Component({
  selector: 'rw-modal',
  imports: [],
  template: `
    <div
      class="flex max-h-[90vh] w-[min(780px,calc(100vw-var(--spacing)*8))] flex-col rounded-xl bg-surface shadow-xl outline-none max-sm:w-full max-sm:max-w-full max-sm:rounded-t-xl max-sm:rounded-b-none"
      role="document"
    >
      <div class="flex shrink-0 items-center justify-between border-b border-border p-6">
        <h2 class="font-sans text-xl font-bold text-text">{{ title() }}</h2>
        <button
          type="button"
          class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-transparent text-base text-text-muted transition hover:bg-surface-alt hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Close dialog"
          (click)="closeDialog()"
        >
          <img [src]="icons.close" alt="" width="24" height="24" class="" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-6">
        <ng-content />
      </div>
      <ng-content select="rw-modal-footer" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  public readonly dialogRef = inject(DialogRef);
  protected readonly icons = icons;

  public readonly title = input('');

  protected closeDialog(): void {
    this.dialogRef.close();
  }
}
