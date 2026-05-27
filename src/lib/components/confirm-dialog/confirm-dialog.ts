import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Modal } from '../modal/modal';
import { ModalFooter } from '../modal/modal-footer';
import { Button } from '../button/button';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export type ConfirmDialogResult = 'confirmed' | 'dismissed';

@Component({
  selector: 'rw-confirm-dialog',
  imports: [Modal, ModalFooter, Button],
  template: `
    <rw-modal [title]="data.title">
      @if (data.message) {
        <p class="m-0 text-sm leading-relaxed text-text-muted">{{ data.message }}</p>
      }
      <rw-modal-footer class="flex flex-wrap items-center justify-end gap-4">
        <rw-button type="button" variant="ghost" palette="secondary" (click)="dismiss()">
          {{ data.cancelLabel ?? 'Cancel' }}
        </rw-button>
        <rw-button type="button" [palette]="'danger'" (click)="confirm()">
          {{ data.confirmLabel ?? 'Confirm' }}
        </rw-button>
      </rw-modal-footer>
    </rw-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  private readonly dialogRef = inject(DialogRef<ConfirmDialogResult>);
  public readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  protected dismiss(): void {
    this.dialogRef.close('dismissed');
  }

  protected confirm(): void {
    this.dialogRef.close('confirmed');
  }
}
