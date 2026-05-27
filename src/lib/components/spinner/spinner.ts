import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PizzaLogo } from '../pizza-logo/pizza-logo';

@Component({
  selector: 'rw-spinner',
  imports: [PizzaLogo],
  template: `
    <span class="inline-flex items-center justify-center" role="status">
      <rw-pizza-logo [animated]="true" [size]="32" />
      <span class="sr-only">Loading…</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {}
