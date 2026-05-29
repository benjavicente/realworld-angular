import { Component } from '@angular/core';
import { HeroBanner } from '../../../lib/components/hero-banner/hero-banner';
import { Spinner } from '../../../lib/components/spinner/spinner';

@Component({
  selector: 'rw-pizzerias-route-pending',
  standalone: true,
  imports: [HeroBanner, Spinner],
  template: `
    <rw-hero-banner />
    <div class="flex justify-center p-16" aria-label="Loading page">
      <rw-spinner />
    </div>
  `,
})
export class PizzeriasRoutePending { }
