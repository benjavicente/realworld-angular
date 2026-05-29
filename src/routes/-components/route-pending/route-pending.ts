import { Component } from '@angular/core';
import { Spinner } from '../../../lib/components/spinner/spinner';

@Component({
  selector: 'rw-route-pending',
  standalone: true,
  imports: [Spinner],
  template: `
    <div class="flex justify-center p-16" aria-label="Loading page">
      <rw-spinner />
    </div>
  `,
})
export class RoutePending {}
