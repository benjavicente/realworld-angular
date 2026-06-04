import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  createLazyFileRoute,
  injectNavigate,
  injectRouter,
} from '@benjavicente/angular-router-experimental';
import { Callout } from '../../lib/components/callout/callout';
import { Button } from '../../lib/components/button/button';
import { ImagePicker } from '../../lib/components/image-picker/image-picker';
import { PhotonLocationField } from '../../lib/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../lib/components/photon-location-field/photon-location-field';
import { injectMutation } from '@benjavicente/angular-query';
import { createPizzeriaMutationOptions } from '../../lib/api/api-mutations';
import { TanStackField, injectForm, injectStore } from '@tanstack/angular-form';
import { requiredValue, validateSubmitFields } from '../../lib/forms/tanstack-form';

export const Route = createLazyFileRoute('/(pizzerias)/pizzerias/admin/new')({
  component: () => AdminPizzeriaFormPage,
});

interface PizzeriaForm {
  location: LocationValue | null;
  image: string | null;
}

@Component({
  selector: 'rw-admin-pizzeria-form-page',
  imports: [Button, TanStackField, ImagePicker, Callout, PhotonLocationField],
  template: `
    <div class="py-10">
      <div class="mx-auto w-full px-4 md:px-6 lg:px-8 max-w-[680px]">
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 class="text-2xl">New Pizzeria</h1>
        </div>

        <form class="flex flex-col gap-5" (submit)="handleSubmit($event)">
          @if (submitError()) {
            <rw-callout variant="error" [message]="submitError()" />
          }
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
            <button
              rw-button
              type="button"
              [isLoading]="pizzeriaFormState().isSubmitting"
              (click)="handleSubmit($event)"
            >
              Create pizzeria
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AdminPizzeriaFormPage {
  readonly #apiFetch = injectRouter().options.context.apiFetch;
  readonly #navigate = injectNavigate();
  readonly #createPizzeriaMutation = injectMutation(() =>
    createPizzeriaMutationOptions(this.#apiFetch),
  );

  protected readonly submitError = signal('');

  protected readonly pizzeriaForm = injectForm({
    defaultValues: {
      location: null,
      image: null,
    } satisfies PizzeriaForm,
    onSubmit: async ({ value }) => {
      this.submitError.set('');
      try {
        await this.#createPizzeriaMutation.mutateAsync({
          city: value.location!.city,
          country: value.location!.country,
          imageFilename: value.image!,
        });
      } catch {
        this.submitError.set('Failed to create pizzeria');
        return;
      }
      void this.#navigate({ to: '/pizzerias/admin/pizzas' });
    },
  });
  protected readonly pizzeriaFormState = injectStore(this.pizzeriaForm);

  protected readonly requiredLocation = requiredValue('Choose a location from the list');
  protected readonly requiredImage = requiredValue('Please select an image');

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (await validateSubmitFields(this.pizzeriaForm, ['location', 'image'])) {
      await this.pizzeriaForm.handleSubmit();
    }
  }
}
