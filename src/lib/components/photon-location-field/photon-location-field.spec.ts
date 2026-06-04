import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { QueryClient, provideTanStackQuery } from '@benjavicente/angular-query';
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
      providers: [
        provideTanStackQuery(new QueryClient()),
        { provide: PHOTON_SEARCH_PLACES, useValue: searchPlacesFn },
      ],
    });
  }

  async function searchWithSuggestions(query = 'ro') {
    searchPlacesFn.mockResolvedValue(mockSuggestions);
    fireEvent.input(screen.getByRole('combobox'), { target: { value: query } });
    await waitFor(() => expect(screen.getByText('Rome, Italy')).toBeTruthy());
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
    await renderField();

    await searchWithSuggestions();

    expect(screen.getByLabelText('Location suggestions')).toBeTruthy();
  });

  it('should display suggestion labels', async () => {
    await renderField();

    await searchWithSuggestions();

    expect(screen.getByText('Rome, Italy')).toBeTruthy();
    expect(screen.getByText('Rotherham, United Kingdom')).toBeTruthy();
  });

  it('should commit value when suggestion is selected', async () => {
    const user = userEvent.setup();
    const { fixture } = await renderField();
    await searchWithSuggestions();

    await user.pointer({ keys: '[MouseLeft]', target: screen.getByText('Rome, Italy') });

    expect(fixture.componentInstance.value()).toEqual({ city: 'Rome', country: 'Italy' });
  });

  it('should show loading hint while searching', async () => {
    searchPlacesFn.mockReturnValue(new Promise(() => {}));
    await renderField();

    fireEvent.input(screen.getByRole('combobox'), { target: { value: 'ro' } });

    await waitFor(() => expect(screen.getByText('Searching…')).toBeTruthy());
  });

  it('should close panel on Escape key', async () => {
    await renderField();
    await searchWithSuggestions();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

    expect(screen.queryByLabelText('Location suggestions')).toBeNull();
  });
});
