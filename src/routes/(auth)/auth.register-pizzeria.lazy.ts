import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Callout } from '../../lib/components/callout/callout';
import { Input } from '../../lib/components/input/input';
import { Button } from '../../lib/components/button/button';
import {
  Link,
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { injectMutation } from '@benjavicente/angular-query';
import {
  registerMutationOptions,
  registerPizzeriaOwnerMutationOptions,
} from '../../lib/api/api-mutations';
import { sanitizeRedirectPath } from '../-guards';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import {
  composeValidators,
  emailAddress,
  minTextLength,
  requiredText,
  validateSubmitFields,
} from '../../lib/forms/tanstack-form';
import { icons } from '../../lib/assets';

export const Route = createLazyFileRoute('/(auth)/auth/register-pizzeria')({
  component: () => RegisterPizzeriaRouteComponent,
});

@Component({
  selector: 'rw-register-pizzeria-page',
  imports: [Link, TanStackField, Input, Button, Callout],
  template: `
    <div class="mx-auto max-w-[400px] px-4 py-8">
      <div class="rounded-lg border border-border bg-surface p-8 shadow-sm">
        @if (registerAsPizzeriaOwner()) {
          <h1 class="mb-2 text-2xl font-bold">Create your pizzeria</h1>
          <p class="mb-6 text-sm text-text-muted">
            Sign up to list your pizzeria and manage your menu
          </p>
        } @else {
          <h1 class="mb-2 text-2xl font-bold">Create account</h1>
          <p class="mb-6 text-sm text-text-muted">Start ordering delicious pizzas</p>
        }

        <form class="flex flex-col gap-4" (submit)="handleSubmit($event)">
          @if (submitError()) {
            <rw-callout variant="error" [message]="submitError()" />
          }
          <ng-container
            [tanstackField]="registerForm"
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
            [tanstackField]="registerForm"
            name="password"
            [validators]="{ onChange: passwordValidator, onSubmit: passwordValidator }"
            #password="field"
          >
            <rw-input
              label="Password"
              [type]="showPassword.checked ? 'text' : 'password'"
              autocomplete="new-password"
              [isRequired]="true"
              [field]="password.api"
              hint="At least 8 characters"
            >
              <label
                rwInputSuffix
                class="absolute right-1 top-1/2 flex -translate-y-1/2 cursor-pointer items-center p-2 text-text-muted transition hover:text-text"
                [attr.aria-label]="showPassword.checked ? 'Hide password' : 'Show password'"
              >
                <input #showPassword type="checkbox" class="sr-only" (change)="(void 0)" />
                <img
                  [src]="showPassword.checked ? icons['visibility-off'] : icons.visibility"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </label>
            </rw-input>
          </ng-container>
          <ng-container
            [tanstackField]="registerForm"
            name="confirmPassword"
            [validators]="{
              onChange: confirmPasswordValidator,
              onSubmit: confirmPasswordValidator,
            }"
            #confirmPassword="field"
          >
            <rw-input
              label="Confirm Password"
              [type]="showConfirmPassword.checked ? 'text' : 'password'"
              autocomplete="new-password"
              [isRequired]="true"
              [field]="confirmPassword.api"
            >
              <label
                rwInputSuffix
                class="absolute right-1 top-1/2 flex -translate-y-1/2 cursor-pointer items-center p-2 text-text-muted transition hover:text-text"
                [attr.aria-label]="
                  showConfirmPassword.checked ? 'Hide confirm password' : 'Show confirm password'
                "
              >
                <input #showConfirmPassword type="checkbox" class="sr-only" (change)="(void 0)" />
                <img
                  [src]="showConfirmPassword.checked ? icons['visibility-off'] : icons.visibility"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                />
              </label>
            </rw-input>
          </ng-container>
          <button
            rw-button
            type="submit"
            [isLoading]="registerFormState().isSubmitting"
            class="flex w-full flex-col"
          >
            {{ registerAsPizzeriaOwner() ? 'Create pizzeria account' : 'Create account' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-text-muted">
          Already have an account?
          <a [link]="{ to: '/auth/login', search: { redirect: redirectTarget() } }">Log in</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RegisterPage {
  readonly #routerContext = injectRouter().options.context;
  readonly #search = Route.injectSearch();
  readonly #navigate = injectNavigate();
  readonly #registerMutation = injectMutation(() =>
    registerMutationOptions(this.#routerContext.apiFetch),
  );
  readonly #registerPizzeriaOwnerMutation = injectMutation(() =>
    registerPizzeriaOwnerMutationOptions(this.#routerContext.apiFetch),
  );

  public readonly registerAsPizzeriaOwner = input<boolean>(false);

  protected readonly submitError = signal('');
  protected readonly icons = icons;
  protected readonly redirectTarget = () =>
    sanitizeRedirectPath(this.#search().redirect, '/pizzerias/admin/new');

  protected readonly registerForm = injectForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      this.submitError.set('');
      if (value.password !== value.confirmPassword) {
        this.submitError.set('Passwords do not match');
        return;
      }
      try {
        const mutation = this.registerAsPizzeriaOwner()
          ? this.#registerPizzeriaOwnerMutation
          : this.#registerMutation;
        await mutation.mutateAsync({ email: value.email, password: value.password });
        void this.#navigate({
          href: this.registerAsPizzeriaOwner() ? this.redirectTarget() : '/',
        });
      } catch {
        this.submitError.set('Registration failed');
      }
    },
  });
  protected readonly registerFormState = injectStore(this.registerForm);

  protected readonly requiredEmail = requiredText('Email is required');
  protected readonly validEmail = emailAddress('Enter a valid email');
  protected readonly emailValidator = composeValidators(this.requiredEmail, this.validEmail);
  protected readonly requiredPassword = requiredText('Password is required');
  protected readonly minimumPassword = minTextLength(8, 'Minimum 8 characters');
  protected readonly passwordValidator = composeValidators(
    this.requiredPassword,
    this.minimumPassword,
  );
  protected readonly requiredConfirmPassword = requiredText('Please confirm your password');
  protected readonly passwordsMatch = ({ value }: { value: string }): string | undefined =>
    value &&
    this.registerForm.state.values.password &&
    value !== this.registerForm.state.values.password
      ? 'Passwords do not match'
      : undefined;
  protected readonly confirmPasswordValidator = composeValidators(
    this.requiredConfirmPassword,
    this.passwordsMatch,
  );

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (await validateSubmitFields(this.registerForm, ['email', 'password', 'confirmPassword'])) {
      await this.registerForm.handleSubmit();
    }
  }
}

@Component({
  selector: 'rw-register-pizzeria-route',
  standalone: true,
  imports: [RegisterPage],
  template: '<rw-register-pizzeria-page [registerAsPizzeriaOwner]="true" />',
})
class RegisterPizzeriaRouteComponent {}
