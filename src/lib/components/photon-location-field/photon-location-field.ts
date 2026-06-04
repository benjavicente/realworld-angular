import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { injectQuery } from '@benjavicente/angular-query';
import { injectDebouncedValue } from '@tanstack/angular-pacer';
import {
  photonLocationSuggestionsQueryOptions,
  searchPlaces,
  type PhotonLocationSuggestion,
} from '../../api/photon';
import { fieldErrorMessage, type FieldLike } from '../../forms/tanstack-form';

export interface LocationValue {
  city: string;
  country: string;
}

export type SearchPlaces = typeof searchPlaces;

export const PHOTON_SEARCH_PLACES = new InjectionToken<SearchPlaces>('Photon search places', {
  providedIn: 'root',
  factory: () => searchPlaces,
});

let nextFieldId = 0;

@Component({
  selector: 'rw-photon-location-field',
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-text" [attr.for]="inputId">
        {{ label() }}
        @if (required()) {
          <span class="ms-1 text-error" aria-hidden="true">*</span>
        }
      </label>

      <div class="relative" (focusout)="onWrapFocusOut($event)">
        <input
          [id]="inputId"
          type="text"
          class="w-full appearance-none rounded-md border-[1.5px] border-border bg-surface px-4 py-3 text-base text-text transition focus:border-primary focus:shadow-focus focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60 placeholder:text-text-muted"
          [class.border-error]="errors().length"
          [value]="displayText()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown)="onKeydown($event)"
          [disabled]="disabled()"
          [readonly]="readonly()"
          placeholder="Start typing a city or place…"
          autocomplete="off"
          role="combobox"
          [attr.aria-expanded]="showPanel()"
          [attr.aria-controls]="showPanel() ? listboxId : null"
        />

        @if (showPanel()) {
          <ul
            [id]="listboxId"
            class="absolute inset-x-0 top-[calc(100%+2px)] z-20 m-0 max-h-64 list-none overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-md"
            aria-label="Location suggestions"
          >
            @if (isLoading()) {
              <li class="list-none px-4 py-2 text-sm text-text-muted" role="presentation">
                Searching…
              </li>
            } @else {
              @for (suggestion of suggestions(); track suggestion.label; let idx = $index) {
                <li
                  class="cursor-pointer px-4 py-2 text-sm text-text hover:bg-surface-alt"
                  [class.bg-surface-alt]="idx === activeIndex()"
                  (mousedown)="selectSuggestion($event, suggestion)"
                >
                  {{ suggestion.label }}
                </li>
              }
            }
          </ul>
        }
      </div>

      @if (errors().length) {
        <span class="text-sm font-medium text-error" role="alert">{{
          fieldErrorMessage(errors()[0])
        }}</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotonLocationField {
  readonly #searchPlaces = inject(PHOTON_SEARCH_PLACES);
  readonly #fieldId = `rw-photon-location-${++nextFieldId}`;

  public readonly value = model<LocationValue | null>(null);
  public readonly touched = model<boolean>(false);
  public readonly field = input<FieldLike<LocationValue | null> | null>(null);
  public readonly disabled = input<boolean>(false);
  public readonly readonly = input<boolean>(false);
  public readonly required = input<boolean>(false);
  public readonly label = input('Location (city and country)');
  protected readonly fieldErrorMessage = fieldErrorMessage;

  protected readonly inputId = this.#fieldId;
  protected readonly listboxId = `${this.#fieldId}-listbox`;

  readonly #externalValue = computed(() => this.field()?.state.value ?? this.value());
  protected readonly displayText = linkedSignal({
    source: this.#externalValue,
    computation: (location) =>
      location?.city && location?.country ? formatLocationLabel(location) : '',
  });
  readonly #committedValue = linkedSignal(() => this.#externalValue());
  protected readonly currentValue = computed(() => this.#committedValue());
  readonly #searchText = computed(() => this.displayText().trim());
  readonly #debouncedSearchText = injectDebouncedValue(this.#searchText, '', { wait: 280 });
  protected readonly suggestionsResource = injectQuery(() =>
    photonLocationSuggestionsQueryOptions(this.#searchPlaces, this.#debouncedSearchText()),
  );
  protected readonly suggestions = computed(() => this.suggestionsResource.data() ?? []);
  protected readonly isLoading = computed(() => this.suggestionsResource.isFetching());
  protected readonly activeIndex = linkedSignal({
    source: this.suggestions,
    computation: (suggestions, previous) => {
      const previousSuggestion =
        previous && previous.value >= 0 ? previous.source[previous.value] : undefined;
      const preservedIndex = previousSuggestion
        ? suggestions.findIndex((suggestion) => sameSuggestion(suggestion, previousSuggestion))
        : -1;
      return preservedIndex >= 0 ? preservedIndex : suggestions.length > 0 ? 0 : -1;
    },
  });
  protected readonly panelOpen = linkedSignal({
    source: this.currentValue,
    computation: (location, previous) =>
      location?.city && location?.country ? false : (previous?.value ?? false),
  });

  protected readonly showPanel = computed(
    () => this.panelOpen() && (this.isLoading() || this.suggestions().length > 0),
  );
  protected readonly isTouched = computed(
    () => this.field()?.state.meta.isTouched ?? this.touched(),
  );
  protected readonly errors = computed(() => this.field()?.state.meta.errors ?? []);

  readonly #pickedLabel = computed(() => {
    const location = this.currentValue();
    return location?.city && location?.country ? formatLocationLabel(location) : null;
  });

  protected onInput(ev: Event): void {
    const text = (ev.target as HTMLInputElement).value;

    if (text !== this.#pickedLabel()) {
      this.#setValue(null);
    }
    this.displayText.set(text);
    this.panelOpen.set(true);
  }

  protected onFocus(): void {
    if (this.suggestions().length > 0 || this.isLoading()) {
      this.panelOpen.set(true);
    }
  }

  protected onWrapFocusOut(ev: FocusEvent): void {
    const wrap = ev.currentTarget as HTMLElement;
    if (wrap.contains(ev.relatedTarget as Node | null)) {
      return;
    }
    this.#markTouched();
    this.#closePanel();
    if (!this.currentValue() && this.displayText().trim()) {
      this.displayText.set('');
    }
  }

  protected selectSuggestion(ev: Event, suggestion: PhotonLocationSuggestion): void {
    ev.preventDefault();
    this.#commitSuggestion(suggestion);
  }

  protected onKeydown(ev: KeyboardEvent): void {
    if (!this.panelOpen() || this.suggestions().length === 0) {
      return;
    }
    const list = this.suggestions();
    const idx = this.activeIndex();
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.activeIndex.set(Math.min(list.length - 1, idx < 0 ? 0 : idx + 1));
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.activeIndex.set(Math.max(0, idx - 1));
        break;
      case 'Enter': {
        const selected = list[idx];
        if (selected) {
          ev.preventDefault();
          this.#commitSuggestion(selected);
        }
        break;
      }
      case 'Escape':
        ev.preventDefault();
        this.#closePanel();
        break;
    }
  }

  #commitSuggestion(suggestion: PhotonLocationSuggestion): void {
    this.#setValue({ city: suggestion.city, country: suggestion.country });
    this.displayText.set(suggestion.label);
    this.#markTouched();
    this.#closePanel();
  }

  #setValue(value: LocationValue | null): void {
    const field = this.field();
    this.#committedValue.set(value);
    if (field) {
      field.handleChange(value);
    } else {
      this.value.set(value);
    }
  }

  #markTouched(): void {
    this.touched.set(true);
    this.field()?.handleBlur();
  }

  #closePanel(): void {
    this.panelOpen.set(false);
    this.activeIndex.set(-1);
  }
}

function formatLocationLabel(location: LocationValue): string {
  return `${location.city}, ${location.country}`;
}

function sameSuggestion(left: PhotonLocationSuggestion, right: PhotonLocationSuggestion): boolean {
  return left.label === right.label && left.city === right.city && left.country === right.country;
}
