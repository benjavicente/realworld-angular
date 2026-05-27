import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  InjectionToken,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, from, switchMap } from 'rxjs';
import { searchPlaces, type PhotonLocationSuggestion } from '../../api/photon';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchPlaces = inject(PHOTON_SEARCH_PLACES);
  private readonly fieldId = `rw-photon-location-${++nextFieldId}`;

  public readonly value = model<LocationValue | null>(null);
  public readonly touched = model<boolean>(false);
  public readonly field = input<FieldLike<LocationValue | null> | null>(null);
  public readonly disabled = input<boolean>(false);
  public readonly readonly = input<boolean>(false);
  public readonly required = input<boolean>(false);
  public readonly label = input('Location (city and country)');
  protected readonly fieldErrorMessage = fieldErrorMessage;

  protected readonly inputId = this.fieldId;
  protected readonly listboxId = `${this.fieldId}-listbox`;

  protected readonly displayText = signal('');
  protected readonly suggestions = signal<PhotonLocationSuggestion[]>([]);
  protected readonly panelOpen = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly showPanel = computed(
    () => this.panelOpen() && (this.isLoading() || this.suggestions().length > 0),
  );
  protected readonly currentValue = computed(() => this.field()?.state.value ?? this.value());
  protected readonly isTouched = computed(
    () => this.field()?.state.meta.isTouched ?? this.touched(),
  );
  protected readonly errors = computed(() => this.field()?.state.meta.errors ?? []);

  /** Label of the last committed suggestion (or external value sync). */
  private readonly pickedLabel = signal<string | null>(null);
  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading.set(query.trim().length >= 2);
          return from(this.searchPlaces(query));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((list) => {
        this.isLoading.set(false);
        this.suggestions.set(list);
        this.activeIndex.set(list.length > 0 ? 0 : -1);
      });

    effect(() => {
      const location = this.currentValue();
      if (location?.city && location?.country) {
        const label = formatLocationLabel(location);
        this.pickedLabel.set(label);
        this.displayText.set(label);
        this.closePanel();
        return;
      }
      if (location === null && this.pickedLabel() !== null) {
        this.pickedLabel.set(null);
        this.displayText.set('');
        this.suggestions.set([]);
        this.isLoading.set(false);
      }
    });
  }

  protected onInput(ev: Event): void {
    const text = (ev.target as HTMLInputElement).value;
    this.displayText.set(text);
    this.panelOpen.set(true);
    this.activeIndex.set(-1);

    if (text !== this.pickedLabel()) {
      this.pickedLabel.set(null);
      this.setValue(null);
    }

    const trimmed = text.trim();
    if (trimmed.length >= 2) {
      this.search$.next(text);
    } else {
      this.isLoading.set(false);
      this.suggestions.set([]);
    }
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
    this.markTouched();
    this.closePanel();
    if (!this.currentValue() && this.displayText().trim()) {
      this.displayText.set('');
      this.suggestions.set([]);
      this.isLoading.set(false);
    }
  }

  protected selectSuggestion(ev: Event, suggestion: PhotonLocationSuggestion): void {
    ev.preventDefault();
    this.commitSuggestion(suggestion);
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
          this.commitSuggestion(selected);
        }
        break;
      }
      case 'Escape':
        ev.preventDefault();
        this.closePanel();
        break;
    }
  }

  private commitSuggestion(suggestion: PhotonLocationSuggestion): void {
    this.pickedLabel.set(suggestion.label);
    this.displayText.set(suggestion.label);
    this.setValue({ city: suggestion.city, country: suggestion.country });
    this.markTouched();
    this.closePanel();
  }

  private setValue(value: LocationValue | null): void {
    const field = this.field();
    if (field) {
      field.handleChange(value);
    } else {
      this.value.set(value);
    }
  }

  private markTouched(): void {
    this.touched.set(true);
    this.field()?.handleBlur();
  }

  private closePanel(): void {
    this.panelOpen.set(false);
    this.activeIndex.set(-1);
    this.suggestions.set([]);
    this.isLoading.set(false);
  }
}

function formatLocationLabel(location: LocationValue): string {
  return `${location.city}, ${location.country}`;
}
