import { ofetch } from 'ofetch';
import { queryOptions } from '@benjavicente/angular-query';

export interface PhotonLocationSuggestion {
  label: string;
  city: string;
  country: string;
}

interface PhotonProperties {
  name?: string;
  city?: string;
  town?: string;
  village?: string;
  locality?: string;
  district?: string;
  county?: string;
  country?: string;
  type?: string;
}

interface PhotonFeature {
  properties?: PhotonProperties;
}

interface PhotonGeoJson {
  features?: PhotonFeature[];
}

/**
 * Typeahead search. Returns suggestions with non-empty city and country
 * derived from OSM tags (see Photon GeoJSON docs).
 */
export async function searchPlaces(query: string, limit = 10): Promise<PhotonLocationSuggestion[]> {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return [];
  }

  try {
    const doc = await ofetch<PhotonGeoJson>('https://photon.komoot.io/api/', {
      query: {
        q: trimmedQuery,
        lang: 'en',
        limit,
      },
      retry: 0,
    });

    return (doc.features ?? [])
      .map((feature) => toSuggestion(feature))
      .filter((suggestion) => suggestion.city && suggestion.country);
  } catch {
    return [];
  }
}

export function photonLocationSuggestionsQueryOptions(
  searchPlacesFn: typeof searchPlaces,
  query: string,
) {
  return queryOptions({
    queryKey: ['photon-location-suggestions', query],
    enabled: query.length >= 2,
    placeholderData: (previousData) => previousData,
    queryFn: () => searchPlacesFn(query),
  });
}

function toSuggestion(feature: PhotonFeature): PhotonLocationSuggestion {
  const props = feature.properties ?? {};
  const city = pickCity(props);
  const country = (props.country ?? '').trim();
  const label = buildLabel(props, city, country);
  return { label, city, country };
}

function pickCity(props: PhotonProperties): string {
  const fromAdmin = (
    props.city ??
    props.town ??
    props.village ??
    props.locality ??
    props.district ??
    props.county ??
    ''
  ).trim();
  if (fromAdmin) {
    return fromAdmin;
  }
  const type = (props.type ?? '').toLowerCase();
  const name = (props.name ?? '').trim();
  if (
    name &&
    (type === 'city' ||
      type === 'town' ||
      type === 'village' ||
      type === 'locality' ||
      type === 'district')
  ) {
    return name;
  }
  return name;
}

function buildLabel(p: PhotonProperties, city: string, country: string): string {
  const name = (p.name ?? '').trim();
  const parts: string[] = [];
  if (name && name.toLowerCase() !== city.toLowerCase()) {
    parts.push(name);
  }
  if (city) {
    parts.push(city);
  }
  if (country) {
    parts.push(country);
  }
  return [...new Set(parts)].join(', ');
}
