import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PhotonLocationSuggestion } from '../../api/photon';
import { PHOTON_SEARCH_PLACES, PhotonLocationField } from './photon-location-field';

const mockSuggestions: PhotonLocationSuggestion[] = [
  { label: 'Rome, Italy', city: 'Rome', country: 'Italy' },
  { label: 'Rotherham, United Kingdom', city: 'Rotherham', country: 'United Kingdom' },
];

const searchPlacesFn = vi.fn();

describe('PhotonLocationField', () => {
  async function renderField() {
    searchPlacesFn.mockReset();
    searchPlacesFn.mockResolvedValue([]);
    return render(PhotonLocationField, {
      providers: [{ provide: PHOTON_SEARCH_PLACES, useValue: searchPlacesFn }],
    });
  }

  function openWithSuggestions(
    component: PhotonLocationField,
    fixture: { detectChanges: () => void },
  ) {
    (component as any).panelOpen.set(true);
    (component as any).suggestions.set(mockSuggestions);
    fixture.detectChanges();
  }

  it('should render the label', async () => {
    await renderField();

    expect(screen.getByText('Location (city and country)')).toBeTruthy();
  });

  it('should show combobox input', async () => {
    await renderField();

    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('should open suggestions panel when search results arrive', async () => {
    const { fixture } = await renderField();

    openWithSuggestions(fixture.componentInstance, fixture);

    expect(screen.getByLabelText('Location suggestions')).toBeTruthy();
  });

  it('should display suggestion labels', async () => {
    const { fixture } = await renderField();

    openWithSuggestions(fixture.componentInstance, fixture);

    expect(screen.getByText('Rome, Italy')).toBeTruthy();
    expect(screen.getByText('Rotherham, United Kingdom')).toBeTruthy();
  });

  it('should commit value when suggestion is selected', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderField();
    openWithSuggestions(fixture.componentInstance, fixture);

    await user.pointer({ keys: '[MouseLeft]', target: screen.getByText('Rome, Italy') });

    expect(fixture.componentInstance.value()).toEqual({ city: 'Rome', country: 'Italy' });
  });

  it('should show loading hint while searching', async () => {
    const { fixture } = await renderField();
    (fixture.componentInstance as any).panelOpen.set(true);
    (fixture.componentInstance as any).isLoading.set(true);
    fixture.detectChanges();

    expect(screen.getByText('Searching…')).toBeTruthy();
  });

  it('should close panel on Escape key', async () => {
    const { fixture } = await renderField();
    openWithSuggestions(fixture.componentInstance, fixture);

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    await fixture.whenStable();

    expect(screen.queryByLabelText('Location suggestions')).toBeNull();
  });
});
