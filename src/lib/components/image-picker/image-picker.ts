import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { CatalogImageKind, CatalogImageUrlPipe } from '../../pipes/catalog-image-url.pipe';
import { Spinner } from '../spinner/spinner';
import { injectQuery } from '@benjavicente/angular-query-experimental';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { catalogImagesQueryOptions } from '../../api/api-queries';
import { fieldErrorMessage, type FieldLike } from '../../forms/tanstack-form';

@Component({
  selector: 'rw-image-picker',
  imports: [Spinner, CatalogImageUrlPipe],
  template: `
    <fieldset class="m-0 min-w-0 border-0 p-0">
      <legend class="mb-2 text-sm font-medium text-text">
        {{ label() }}
        @if (required()) {
          <span class="ms-[0.125em] text-error" aria-hidden="true">*</span>
        }
      </legend>

      @if (filenamesResource.isPending()) {
        <div class="flex items-center gap-2 text-sm text-text-muted">
          <rw-spinner />
          <span class="m-0">Loading images…</span>
        </div>
      } @else if (filenamesResource.error()) {
        <p class="mt-1 text-xs text-error" role="alert">
          Could not load image list. Check that the API is running.
        </p>
      } @else {
        @let filenames = filenamesResource.data() ?? [];
        @if (filenames.length === 0) {
          <p class="mt-1 text-sm text-text-muted">No bundled images are available.</p>
        } @else {
          <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2" role="radiogroup">
            @for (filename of filenames; track filename) {
              <button
                type="button"
                [class]="imageButtonClasses(filename)"
                [attr.aria-pressed]="currentValue() === filename"
                [attr.aria-label]="'Image option ' + filename"
                [disabled]="disabled()"
                (click)="select(filename)"
              >
                <img
                  [src]="filename | catalogImageUrl: pickerImageKind()"
                  alt=""
                  class="block size-full object-cover"
                  width="100"
                  height="100"
                />
              </button>
            }
          </div>
        }
      }

      @if (errors().length > 0) {
        <p class="mt-1 text-xs text-error" role="alert">{{ fieldErrorMessage(errors()[0]) }}</p>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePicker {
  private readonly apiFetch = injectRouter().options.context.apiFetch;

  public readonly category = input.required<string>();
  public readonly label = input.required<string>();

  public readonly value = model<string | null>(null);
  public readonly touched = model(false);

  public readonly field = input<FieldLike<string | null> | null>(null);
  public readonly disabled = input(false);
  public readonly required = input(false);
  protected readonly fieldErrorMessage = fieldErrorMessage;

  protected readonly currentValue = computed(() => this.field()?.state.value ?? this.value());
  protected readonly isTouched = computed(
    () => this.field()?.state.meta.isTouched ?? this.touched(),
  );
  protected readonly errors = computed(() => this.field()?.state.meta.errors ?? []);

  protected readonly pickerImageKind = computed<CatalogImageKind>(() =>
    this.category() === 'pizzeria' ? 'pizzeria' : 'pizza',
  );

  protected readonly filenamesResource = injectQuery(() =>
    catalogImagesQueryOptions(this.apiFetch, this.category()),
  );

  protected imageButtonClasses(filename: string): string {
    const base =
      'box-border aspect-square cursor-pointer overflow-hidden rounded-md border-[2.5px] bg-transparent p-1 transition hover:scale-[1.03] hover:border-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';
    return currentValueEquals(this.currentValue(), filename)
      ? `${base} border-primary bg-surface-alt shadow-[0_0_0_2px_rgb(230_57_70_/_0.2)]`
      : `${base} border-transparent`;
  }

  protected select(filename: string): void {
    if (this.disabled()) {
      return;
    }
    const field = this.field();
    if (field) {
      field.handleChange(filename);
      field.handleBlur();
    } else {
      this.value.set(filename);
    }
    this.touched.set(true);
  }
}

function currentValueEquals(value: string | null, filename: string): boolean {
  return value === filename;
}
