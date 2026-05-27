import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Callout } from '../../lib/components/callout/callout';
import { Input } from '../../lib/components/input/input';
import { Button } from '../../lib/components/button/button';
import { Link, createFileRoute, injectNavigate } from '@benjavicente/angular-router-experimental';
import { injectMutation } from '@benjavicente/angular-query-experimental';
import { loginMutationOptions } from '../../lib/api/api-mutations';
import { requireGuest } from '../-guards';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import {
  composeValidators,
  emailAddress,
  requiredText,
  validateSubmitFields,
} from '../../lib/forms/tanstack-form';

export const Route = createFileRoute('/(auth)/auth/login')({
  head: () => ({ meta: [{ title: 'Login' }] }),
  beforeLoad: ({ context }) => requireGuest(context),
  component: () => LoginPage,
});

@Component({
  selector: 'rw-login-page',
  imports: [Link, TanStackField, Input, Button, Callout],
  template: `
    <div class="mx-auto max-w-[400px] px-4 py-8">
      <div class="rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 class="mb-2 text-2xl font-bold">Welcome back</h1>
        <p class="mb-6 text-sm text-text-muted">Log in to your account</p>

        <form class="flex flex-col gap-4" (submit)="handleSubmit($event)">
          @if (submitError()) {
            <rw-callout variant="error" [message]="submitError()" />
          }
          <ng-container
            [tanstackField]="loginForm"
            name="email"
            [validators]="{ onChange: emailValidator, onSubmit: emailValidator }"
            #email="field"
          >
            <rw-input
              label="Email"
              type="email"
              autocomplete="email"
              [isRequired]="true"
              [field]="email.api"
            />
          </ng-container>
          <ng-container
            [tanstackField]="loginForm"
            name="password"
            [validators]="{ onChange: requiredPassword, onSubmit: requiredPassword }"
            #password="field"
          >
            <rw-input
              label="Password"
              [type]="showPassword.checked ? 'text' : 'password'"
              autocomplete="current-password"
              [isRequired]="true"
              [field]="password.api"
            >
              <label
                rwInputSuffix
                class="absolute right-1 top-1/2 flex -translate-y-1/2 cursor-pointer items-center p-2 text-text-muted transition hover:text-text"
                [attr.aria-label]="showPassword.checked ? 'Hide password' : 'Show password'"
              >
                <input #showPassword type="checkbox" class="sr-only" (change)="(void 0)" />
                <img
                  [src]="
                    showPassword.checked ? '/icons/visibility-off.svg' : '/icons/visibility.svg'
                  "
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </label>
            </rw-input>
          </ng-container>
          <rw-button
            type="button"
            [isLoading]="loginFormState().isSubmitting"
            class="flex w-full flex-col"
            (click)="handleSubmit($event)"
          >
            Log in
          </rw-button>
        </form>

        <p class="mt-4 text-center text-sm text-text-muted">
          Don't have an account?
          <a [link]="{ to: '/auth/register' }">Create one</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LoginPage {
  private readonly routerContext = Route.injectRouteContext();
  private readonly navigate = injectNavigate();
  private readonly loginMutation = injectMutation(() =>
    loginMutationOptions(this.routerContext().apiFetch),
  );

  protected readonly submitError = signal('');

  protected readonly loginForm = injectForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      this.submitError.set('');
      try {
        await this.loginMutation.mutateAsync(value);
        void this.navigate({ to: '/' });
      } catch {
        this.submitError.set('Invalid credentials');
      }
    },
  });
  protected readonly loginFormState = injectStore(this.loginForm);

  protected readonly requiredEmail = requiredText('Email is required');
  protected readonly validEmail = emailAddress('Enter a valid email');
  protected readonly emailValidator = composeValidators(this.requiredEmail, this.validEmail);
  protected readonly requiredPassword = requiredText('Password is required');

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (await validateSubmitFields(this.loginForm, ['email', 'password'])) {
      await this.loginForm.handleSubmit();
    }
  }
}
