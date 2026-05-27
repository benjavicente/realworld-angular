import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Link } from '@benjavicente/angular-router-experimental';
import { RoleDirective } from '../../../lib/directives/role.directive';

@Component({
  selector: 'rw-footer',
  imports: [Link, RoleDirective],
  template: `
    <footer class="mt-16 border-t border-border py-6" role="contentinfo">
      <div
        class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8 flex flex-wrap items-center justify-start gap-4"
      >
        <div
          class="flex items-center gap-4 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3"
        >
          <p class="text-sm text-text-muted">
            © 2026
            <a
              href="https://github.com/realworld-angular/realworld-angular"
              target="_blank"
              rel="noopener noreferrer"
              >Realworld Angular</a
            >
          </p>
          <a
            href="https://github.com/sponsors/geromegrignon"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-text-on-primary no-underline transition hover:brightness-90 hover:no-underline whitespace-nowrap"
            >Sponsor the project</a
          >
        </div>
        <nav
          class="ms-auto flex flex-wrap items-center gap-3 max-[600px]:flex-col max-[600px]:items-end"
          aria-label="Legal"
        >
          <a
            [link]="{ to: '/terms-and-conditions' }"
            class="text-sm text-text-muted no-underline hover:text-text hover:underline"
            >Terms and conditions</a
          >
          <a
            *rwRole="'GUEST'"
            [link]="{ to: '/auth/register-pizzeria' }"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary no-underline transition hover:bg-primary-dark hover:no-underline whitespace-nowrap"
            >Create your pizzeria</a
          >
        </nav>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
