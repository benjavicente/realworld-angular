import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPlaces } from './photon';

const mockGeoJson = {
  features: [
    {
      properties: {
        name: 'Rome',
        city: 'Rome',
        country: 'Italy',
        type: 'city',
      },
    },
    {
      properties: {
        city: 'Naples',
        country: 'Italy',
      },
    },
    {
      properties: {
        country: 'Italy',
      },
    },
  ],
};

vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}));

import { ofetch } from 'ofetch';

const ofetchMock = vi.mocked(ofetch);

describe('searchPlaces', () => {
  beforeEach(() => {
    ofetchMock.mockReset();
  });

  it('should return empty array without HTTP call for queries shorter than 2 chars', async () => {
    const result = await searchPlaces('r');
    expect(ofetchMock).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return empty array without HTTP call for empty query', async () => {
    const result = await searchPlaces('');
    expect(ofetchMock).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should GET the Photon API with trimmed query and lang=en', async () => {
    ofetchMock.mockResolvedValue(mockGeoJson);
    await searchPlaces('  rome  ');
    expect(ofetchMock).toHaveBeenCalledWith('https://photon.komoot.io/api/', {
      query: { q: 'rome', lang: 'en', limit: 10 },
      retry: 0,
    });
  });

  it('should filter out suggestions missing city or country', async () => {
    ofetchMock.mockResolvedValue(mockGeoJson);
    const results = await searchPlaces('rome');
    expect(results.every((s) => s.city && s.country)).toBe(true);
  });

  it('should return empty array on HTTP error', async () => {
    ofetchMock.mockRejectedValue(new Error('Server Error'));
    const results = await searchPlaces('rome');
    expect(results).toEqual([]);
  });

  it('should map features to suggestions with city and country', async () => {
    ofetchMock.mockResolvedValue(mockGeoJson);
    const results = await searchPlaces('naples');
    expect(results.some((s) => s.city === 'Naples' && s.country === 'Italy')).toBe(true);
  });
});
