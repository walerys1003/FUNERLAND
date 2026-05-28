/**
 * City + voivodeship geo data for SVG map component.
 *
 * Coordinates use a simple equirectangular projection so we can render
 * a lightweight inline SVG without depending on Leaflet/Mapbox.
 *
 * Lon ∈ [14.0, 24.2] (Poland west↔east), Lat ∈ [49.0, 55.0] (south↔north).
 */

export type CityGeo = {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  /** Population for sizing (k = thousands) */
  populationK?: number;
};

export const CITY_GEO: Record<string, CityGeo> = {
  warszawa: { slug: 'warszawa', name: 'Warszawa', lat: 52.2297, lon: 21.0122, populationK: 1860 },
  krakow: { slug: 'krakow', name: 'Kraków', lat: 50.0647, lon: 19.945, populationK: 780 },
  wroclaw: { slug: 'wroclaw', name: 'Wrocław', lat: 51.1079, lon: 17.0385, populationK: 670 },
  lodz: { slug: 'lodz', name: 'Łódź', lat: 51.7592, lon: 19.456, populationK: 670 },
  poznan: { slug: 'poznan', name: 'Poznań', lat: 52.4064, lon: 16.9252, populationK: 530 },
  gdansk: { slug: 'gdansk', name: 'Gdańsk', lat: 54.352, lon: 18.6466, populationK: 470 },
  szczecin: { slug: 'szczecin', name: 'Szczecin', lat: 53.4285, lon: 14.5528, populationK: 400 },
  bydgoszcz: { slug: 'bydgoszcz', name: 'Bydgoszcz', lat: 53.1235, lon: 18.0084, populationK: 340 },
  lublin: { slug: 'lublin', name: 'Lublin', lat: 51.2465, lon: 22.5684, populationK: 330 },
  katowice: { slug: 'katowice', name: 'Katowice', lat: 50.2649, lon: 19.0238, populationK: 290 },
  bialystok: { slug: 'bialystok', name: 'Białystok', lat: 53.1325, lon: 23.1688, populationK: 290 },
  gdynia: { slug: 'gdynia', name: 'Gdynia', lat: 54.5189, lon: 18.5305, populationK: 240 },
  czestochowa: { slug: 'czestochowa', name: 'Częstochowa', lat: 50.8118, lon: 19.1203, populationK: 220 },
  radom: { slug: 'radom', name: 'Radom', lat: 51.4027, lon: 21.1471, populationK: 210 },
  torun: { slug: 'torun', name: 'Toruń', lat: 53.0138, lon: 18.5984, populationK: 200 },
  rzeszow: { slug: 'rzeszow', name: 'Rzeszów', lat: 50.0413, lon: 21.9991, populationK: 200 },
};

// SVG viewport (Poland bounds)
export const MAP_BOUNDS = {
  minLon: 14.0,
  maxLon: 24.2,
  minLat: 49.0,
  maxLat: 55.0,
};

/** Project (lat, lon) → (x, y) inside viewBox [0..VIEW_W, 0..VIEW_H]. */
export const VIEW_W = 600;
export const VIEW_H = 600;

export function project(lat: number, lon: number): { x: number; y: number } {
  const { minLon, maxLon, minLat, maxLat } = MAP_BOUNDS;
  const x = ((lon - minLon) / (maxLon - minLon)) * VIEW_W;
  // SVG y grows downward, lat grows north — invert
  const y = ((maxLat - lat) / (maxLat - minLat)) * VIEW_H;
  return { x, y };
}

export function getCityGeo(slug?: string): CityGeo | null {
  if (!slug) return null;
  return CITY_GEO[slug] || null;
}
