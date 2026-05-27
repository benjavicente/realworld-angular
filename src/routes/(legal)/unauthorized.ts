import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Link, createFileRoute } from '@benjavicente/angular-router-experimental';

export const Route = createFileRoute('/(legal)/unauthorized')({
  head: () => ({ meta: [{ title: 'Unauthorized' }] }),
  component: () => UnauthorizedPage,
});

@Component({
  selector: 'rw-unauthorized-page',
  imports: [Link],
  template: `
    <section
      class="flex min-h-[60vh] items-center justify-center py-16 text-center"
      aria-labelledby="unauthorized-title"
    >
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <div class="mx-auto max-w-[480px]">
          <p class="mb-4 text-6xl font-bold leading-none text-primary">403</p>
          <h1 id="unauthorized-title" class="mb-4 text-3xl text-text">Access Denied</h1>
          <p class="mb-8 text-base text-text-muted">
            You do not have permission to access this page.
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
class UnauthorizedPage {}
