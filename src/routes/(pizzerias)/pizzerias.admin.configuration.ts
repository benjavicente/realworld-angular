import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
  untracked,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  createFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { Callout } from '../../lib/components/callout/callout';
import { Button } from '../../lib/components/button/button';
import { ImagePicker } from '../../lib/components/image-picker/image-picker';
import { PhotonLocationField } from '../../lib/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../lib/components/photon-location-field/photon-location-field';
import { Spinner } from '../../lib/components/spinner/spinner';
import { Dialog } from '@angular/cdk/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../lib/components/confirm-dialog/confirm-dialog';
import { adminPizzeriaQueryOptions } from '../../lib/api/api-queries';
import { injectMutation, injectQuery } from '@benjavicente/angular-query-experimental';
import {
  deleteMyPizzeriaMutationOptions,
  updateMyPizzeriaMutationOptions,
} from '../../lib/api/api-mutations';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import { requiredValue, validateSubmitFields } from '../../lib/forms/tanstack-form';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin/configuration')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminPizzeriaQueryOptions(context.apiFetch)),
  component: () => AdminPizzeriaConfigurationPage,
});

@Component({
  selector: 'rw-admin-pizzeria-configuration-page',
  imports: [Button, TanStackField, ImagePicker, Callout, PhotonLocationField, Spinner],
  template: `
    @if (pizzeriaResource.isPending()) {
      <div class="flex justify-center p-16" aria-label="Loading pizzeria settings">
        <rw-spinner />
      </div>
    } @else if (pizzeriaResource.error()) {
      <rw-callout variant="error" message="Could not load pizzeria settings. Please try again." />
    } @else {
      @let pizzeria = pizzeriaResource.data()!;
      <div class="max-w-[680px] mx-auto">
        @if (submitError()) {
          <rw-callout variant="error" [message]="submitError()" />
        }
        @if (submitSuccess()) {
          <rw-callout variant="success" message="Your changes have been saved." />
        }

        <form class="flex flex-col gap-5" (submit)="handleSubmit($event)">
          <div class="flex flex-col gap-1">
            <label for="pizzeria-name" class="text-sm font-medium text-text">Name</label>
            <input
              id="pizzeria-name"
              class="rounded-md border border-border bg-surface-alt px-4 py-3 text-text-muted"
              [value]="pizzeria.name"
              disabled
            />
            <span class="text-xs text-text-muted">Auto-generated, not editable</span>
          </div>

          <ng-container
            [tanstackField]="pizzeriaForm"
            name="location"
            [validators]="{ onChange: requiredLocation, onSubmit: requiredLocation }"
            #location="field"
          >
            <rw-photon-location-field [required]="true" [field]="location.api" />
          </ng-container>

          <ng-container
            [tanstackField]="pizzeriaForm"
            name="image"
            [validators]="{ onChange: requiredImage, onSubmit: requiredImage }"
            #image="field"
          >
            <rw-image-picker
              category="pizzeria"
              label="Pizzeria image"
              [required]="true"
              [field]="image.api"
            />
          </ng-container>

          <div class="flex justify-end">
            <rw-button
              type="button"
              [isLoading]="pizzeriaFormState().isSubmitting"
              (click)="handleSubmit($event)"
            >
              Save changes
            </rw-button>
          </div>

          <div class="rounded-lg border border-error/30 bg-error-bg p-5" aria-label="Danger zone">
            <rw-callout
              variant="error"
              message="Danger zone: deleting this pizzeria permanently removes it and cannot be undone."
            >
              <rw-button
                type="button"
                palette="danger"
                [isLoading]="isDeleting()"
                (click)="deletePizzeria()"
              >
                Delete pizzeria
              </rw-button>
            </rw-callout>
          </div>
        </form>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AdminPizzeriaConfigurationPage {
  private readonly apiFetch = injectRouter().options.context.apiFetch;
  private readonly navigate = injectNavigate();
  private readonly dialog = inject(Dialog);
  private readonly title = inject(Title);
  private readonly updatePizzeriaMutation = injectMutation(() =>
    updateMyPizzeriaMutationOptions(this.apiFetch),
  );
  private readonly deletePizzeriaMutation = injectMutation(() =>
    deleteMyPizzeriaMutationOptions(this.apiFetch),
  );

  protected readonly pizzeriaResource = injectQuery(() => adminPizzeriaQueryOptions(this.apiFetch));

  protected readonly isDeleting = signal(false);
  protected readonly submitSuccess = signal(false);
  protected readonly submitError = signal('');

  protected readonly pizzeriaForm = injectForm({
    defaultValues: {
      location: null as LocationValue | null,
      image: null as string | null,
    },
    onSubmit: async ({ value }) => {
      this.submitSuccess.set(false);
      this.submitError.set('');
      const location = value.location!;
      try {
        await this.updatePizzeriaMutation.mutateAsync({
          city: location.city,
          country: location.country,
          imageFilename: value.image!,
        });
      } catch {
        this.submitError.set('Save failed');
        return;
      }
      this.submitSuccess.set(true);
    },
  });
  protected readonly pizzeriaFormState = injectStore(this.pizzeriaForm);
  protected readonly requiredLocation = requiredValue('Choose a location from the list');
  protected readonly requiredImage = requiredValue('Please select an image');

  public constructor() {
    effect(() => {
      if (this.pizzeriaResource.isSuccess()) {
        const pizzeria = untracked(() => this.pizzeriaResource.data());
        if (pizzeria) {
          this.title.setTitle(`Configure your pizzeria - ${pizzeria.name}`);
        }
      }
    });

    effect(() => {
      if (this.pizzeriaResource.isSuccess()) {
        const pizzeria = untracked(() => this.pizzeriaResource.data());
        if (pizzeria) {
          this.pizzeriaForm.reset({
            location: { city: pizzeria.city, country: pizzeria.country },
            image: pizzeria.image,
          });
        }
      }
    });
  }

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (await validateSubmitFields(this.pizzeriaForm, ['location', 'image'])) {
      await this.pizzeriaForm.handleSubmit();
    }
  }

  protected deletePizzeria(): void {
    const pizzeria = this.pizzeriaResource.data()!;

    const message = `Are you sure you want to delete "${pizzeria.name}"? This action cannot be undone.`;
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Delete pizzeria',
        message,
        cancelLabel: 'Cancel',
        confirmLabel: 'Delete pizzeria',
      },
    });

    ref.closed.subscribe(async (result) => {
      if (result !== 'confirmed') return;
      this.isDeleting.set(true);
      try {
        await this.deletePizzeriaMutation.mutateAsync();
        void this.navigate({ to: '/pizzerias/admin/new' });
      } finally {
        this.isDeleting.set(false);
      }
    });
  }
}
