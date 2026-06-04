import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { authUserQueryOptions } from '../../lib/services/auth';
import { injectMutation, injectQuery } from '@benjavicente/angular-query';
import { logoutMutationOptions } from '../../lib/api/api-mutations';
import { Button } from '../../lib/components/button/button';
import { Avatar } from '../../lib/components/avatar/avatar';
import {
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';

export const Route = createLazyFileRoute('/(account)/profile')({
  component: () => ProfilePage,
});

@Component({
  selector: 'rw-profile-page',
  imports: [Button, Avatar],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <div class="mx-auto flex w-full max-w-[560px] flex-col gap-8">
          <div class="flex items-center justify-between gap-4">
            <header class="flex min-w-0 flex-1 items-center gap-5">
              <rw-avatar [name]="user()!.name" />
              <div class="flex min-w-0 flex-col gap-1">
                <h1 class="text-xl font-semibold leading-tight">{{ user()!.name }}</h1>
                <p class="text-sm italic text-text-muted">{{ user()!.email }}</p>
              </div>
            </header>

            <div class="flex shrink-0">
              <button
                rw-button
                variant="outlined"
                palette="danger"
                [isLoading]="logoutMutation.isPending()"
                (click)="logout()"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ProfilePage {
  readonly #routerContext = injectRouter().options.context;
  readonly #navigate = injectNavigate();
  readonly #userQuery = injectQuery(() => authUserQueryOptions(this.#routerContext.apiFetch));
  protected readonly logoutMutation = injectMutation(() =>
    logoutMutationOptions(this.#routerContext.apiFetch),
  );

  protected readonly user = computed(() => this.#userQuery.data() ?? null);

  protected async logout(): Promise<void> {
    await this.logoutMutation.mutateAsync();
    await this.#navigate({ to: '/' });
  }
}
