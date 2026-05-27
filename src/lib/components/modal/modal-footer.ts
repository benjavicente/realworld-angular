import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rw-modal-footer',
  template: '<ng-content />',
  host: {
    class: 'flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFooter {}
