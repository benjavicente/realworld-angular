import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Link } from '@benjavicente/angular-router-experimental';

@Component({
  selector: 'rw-not-found',
  standalone: true,
  imports: [Link],
  template: `
    <section class="flex min-h-[60vh] items-center justify-center py-16 text-center">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <div class="mx-auto max-w-[480px]">
          <p class="mb-4 text-6xl font-bold leading-none text-primary">404</p>
          <h1 class="mb-4 text-3xl text-text">Page Not Found</h1>
          <p class="mb-8 text-base text-text-muted">
            The page you are looking for does not exist or has been moved.
          </p>
          <a
            [link]="{ to: '/' }"
            class="inline-block rounded-md bg-primary px-6 py-3 font-medium text-text-on-primary no-underline transition hover:bg-primary-dark"
            >Back to Home</a
          >
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
