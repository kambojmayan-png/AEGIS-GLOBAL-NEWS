/**
 * Reverse geo-mapping: converts lat/lng → state/province/region name
 * Used by the Shift+Click drill-down to identify sub-national regions
 */

export interface StateRegion {
  name: string;
  lat: number;
  lng: number;
  radius: number; // approximate bounding radius in degrees
}

/** Major states/provinces for countries with substantial land area */
export const COUNTRY_STATES: Record<string, StateRegion[]> = {
  US: [
    { name: 'California', lat: 36.78, lng: -119.42, radius: 3.5 },
    { name: 'Texas', lat: 31.97, lng: -99.90, radius: 4 },
    { name: 'Florida', lat: 27.66, lng: -81.52, radius: 2.5 },
    { name: 'New York', lat: 42.17, lng: -74.95, radius: 2 },
    { name: 'Pennsylvania', lat: 41.20, lng: -77.19, radius: 1.5 },
    { name: 'Illinois', lat: 40.63, lng: -89.40, radius: 2 },
    { name: 'Ohio', lat: 40.42, lng: -82.91, radius: 1.5 },
    { name: 'Georgia', lat: 32.16, lng: -82.90, radius: 2 },
    { name: 'Michigan', lat: 44.31, lng: -85.60, radius: 2 },
    { name: 'Washington', lat: 47.75, lng: -120.74, radius: 2 },
    { name: 'Massachusetts', lat: 42.41, lng: -71.38, radius: 1 },
    { name: 'Arizona', lat: 34.05, lng: -111.09, radius: 2.5 },
    { name: 'Colorado', lat: 39.55, lng: -105.78, radius: 2 },
    { name: 'Virginia', lat: 37.43, lng: -78.66, radius: 1.5 },
    { name: 'North Carolina', lat: 35.76, lng: -79.02, radius: 2 },
    { name: 'New Jersey', lat: 40.06, lng: -74.41, radius: 0.8 },
    { name: 'Alabama', lat: 32.80, lng: -86.79, radius: 1.8 },
    { name: 'Alaska', lat: 64.20, lng: -153.37, radius: 8 },
    { name: 'Arkansas', lat: 34.97, lng: -92.37, radius: 1.8 },
    { name: 'Connecticut', lat: 41.60, lng: -72.69, radius: 0.6 },
    { name: 'Hawaii', lat: 20.80, lng: -156.33, radius: 1.5 },
    { name: 'Indiana', lat: 39.85, lng: -86.26, radius: 1.5 },
    { name: 'Iowa', lat: 42.00, lng: -93.21, radius: 2 },
    { name: 'Kansas', lat: 38.53, lng: -96.73, radius: 2.5 },
    { name: 'Kentucky', lat: 37.67, lng: -84.67, radius: 1.8 },
    { name: 'Louisiana', lat: 30.98, lng: -91.96, radius: 2 },
    { name: 'Maine', lat: 45.25, lng: -69.45, radius: 2 },
    { name: 'Maryland', lat: 39.05, lng: -76.64, radius: 0.8 },
    { name: 'Minnesota', lat: 46.73, lng: -94.69, radius: 3 },
    { name: 'Mississippi', lat: 32.74, lng: -89.67, radius: 1.8 },
    { name: 'Missouri', lat: 38.46, lng: -92.29, radius: 2 },
    { name: 'Montana', lat: 46.88, lng: -110.36, radius: 4 },
    { name: 'Nebraska', lat: 41.49, lng: -99.90, radius: 2.5 },
    { name: 'Nevada', lat: 38.80, lng: -116.42, radius: 3 },
    { name: 'New Mexico', lat: 34.31, lng: -106.02, radius: 3 },
    { name: 'Oklahoma', lat: 35.56, lng: -96.93, radius: 2.5 },
    { name: 'Oregon', lat: 44.57, lng: -122.07, radius: 3 },
    { name: 'Tennessee', lat: 35.74, lng: -86.69, radius: 2 },
    { name: 'Utah', lat: 39.32, lng: -111.09, radius: 2.5 },
    { name: 'Wisconsin', lat: 44.27, lng: -89.62, radius: 2.5 },
  ],
  IN: [
    { name: 'Andhra Pradesh', lat: 15.91, lng: 79.74, radius: 2.5 },
    { name: 'Arunachal Pradesh', lat: 28.22, lng: 94.73, radius: 3 },
    { name: 'Assam', lat: 26.20, lng: 92.94, radius: 2 },
    { name: 'Bihar', lat: 25.10, lng: 85.31, radius: 2 },
    { name: 'Chhattisgarh', lat: 21.27, lng: 81.86, radius: 2.5 },
    { name: 'Delhi', lat: 28.70, lng: 77.10, radius: 0.5 },
    { name: 'Goa', lat: 15.30, lng: 74.12, radius: 0.5 },
    { name: 'Gujarat', lat: 22.26, lng: 71.19, radius: 2.5 },
    { name: 'Haryana', lat: 29.06, lng: 76.09, radius: 1.5 },
    { name: 'Himachal Pradesh', lat: 31.10, lng: 77.17, radius: 1.5 },
    { name: 'Jharkhand', lat: 23.61, lng: 85.28, radius: 1.8 },
    { name: 'Karnataka', lat: 15.32, lng: 75.71, radius: 2.5 },
    { name: 'Kerala', lat: 10.85, lng: 76.27, radius: 1.5 },
    { name: 'Madhya Pradesh', lat: 22.97, lng: 78.66, radius: 3 },
    { name: 'Maharashtra', lat: 19.75, lng: 75.71, radius: 3 },
    { name: 'Manipur', lat: 24.66, lng: 93.91, radius: 1 },
    { name: 'Meghalaya', lat: 25.47, lng: 91.37, radius: 1 },
    { name: 'Mizoram', lat: 23.16, lng: 92.94, radius: 0.8 },
    { name: 'Nagaland', lat: 26.16, lng: 94.56, radius: 0.8 },
    { name: 'Odisha', lat: 20.95, lng: 85.10, radius: 2 },
    { name: 'Punjab', lat: 31.15, lng: 75.34, radius: 1.5 },
    { name: 'Rajasthan', lat: 27.02, lng: 74.22, radius: 3.5 },
    { name: 'Sikkim', lat: 27.53, lng: 88.51, radius: 0.5 },
    { name: 'Tamil Nadu', lat: 11.13, lng: 78.66, radius: 2.5 },
    { name: 'Telangana', lat: 18.11, lng: 79.02, radius: 2 },
    { name: 'Tripura', lat: 23.94, lng: 91.99, radius: 0.6 },
    { name: 'Uttar Pradesh', lat: 26.85, lng: 80.91, radius: 3 },
    { name: 'Uttarakhand', lat: 30.07, lng: 79.06, radius: 1.5 },
    { name: 'West Bengal', lat: 22.99, lng: 87.85, radius: 2 },
    { name: 'Mumbai', lat: 19.07, lng: 72.87, radius: 0.5 },
    { name: 'Bangalore', lat: 12.97, lng: 77.59, radius: 0.5 },
    { name: 'Chennai', lat: 13.08, lng: 80.27, radius: 0.5 },
    { name: 'Hyderabad', lat: 17.39, lng: 78.49, radius: 0.5 },
    { name: 'Kolkata', lat: 22.57, lng: 88.36, radius: 0.5 },
  ],
  CN: [
    { name: 'Beijing', lat: 39.90, lng: 116.41, radius: 1 },
    { name: 'Shanghai', lat: 31.23, lng: 121.47, radius: 0.8 },
    { name: 'Guangdong', lat: 23.13, lng: 113.26, radius: 2.5 },
    { name: 'Sichuan', lat: 30.57, lng: 104.07, radius: 3 },
    { name: 'Zhejiang', lat: 29.14, lng: 119.79, radius: 2 },
    { name: 'Jiangsu', lat: 32.06, lng: 118.80, radius: 2 },
    { name: 'Shandong', lat: 36.07, lng: 120.38, radius: 2.5 },
    { name: 'Hubei', lat: 30.59, lng: 114.31, radius: 2 },
    { name: 'Henan', lat: 34.77, lng: 113.65, radius: 2 },
    { name: 'Xinjiang', lat: 41.75, lng: 84.77, radius: 5 },
  ],
  GB: [
    { name: 'London', lat: 51.51, lng: -0.13, radius: 0.5 },
    { name: 'Scotland', lat: 56.49, lng: -4.20, radius: 3 },
    { name: 'Wales', lat: 52.13, lng: -3.78, radius: 1.5 },
    { name: 'Northern Ireland', lat: 54.79, lng: -6.49, radius: 1 },
    { name: 'Manchester', lat: 53.48, lng: -2.24, radius: 0.5 },
    { name: 'Birmingham', lat: 52.49, lng: -1.90, radius: 0.5 },
    { name: 'Yorkshire', lat: 53.96, lng: -1.08, radius: 1 },
  ],
  DE: [
    { name: 'Bavaria', lat: 48.79, lng: 11.50, radius: 2 },
    { name: 'Berlin', lat: 52.52, lng: 13.41, radius: 0.5 },
    { name: 'North Rhine-Westphalia', lat: 51.43, lng: 7.66, radius: 1.5 },
    { name: 'Baden-Württemberg', lat: 48.66, lng: 9.35, radius: 1.5 },
    { name: 'Lower Saxony', lat: 52.64, lng: 9.85, radius: 1.5 },
    { name: 'Hesse', lat: 50.65, lng: 9.16, radius: 1 },
    { name: 'Hamburg', lat: 53.55, lng: 9.99, radius: 0.3 },
  ],
  FR: [
    { name: 'Île-de-France', lat: 48.85, lng: 2.35, radius: 1 },
    { name: 'Provence-Alpes-Côte d\'Azur', lat: 43.94, lng: 6.07, radius: 2 },
    { name: 'Auvergne-Rhône-Alpes', lat: 45.44, lng: 4.39, radius: 2 },
    { name: 'Occitanie', lat: 43.60, lng: 1.44, radius: 2 },
    { name: 'Nouvelle-Aquitaine', lat: 45.71, lng: 0.57, radius: 2.5 },
    { name: 'Brittany', lat: 48.20, lng: -2.93, radius: 1.5 },
  ],
  BR: [
    { name: 'São Paulo', lat: -23.55, lng: -46.63, radius: 2.5 },
    { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17, radius: 1.5 },
    { name: 'Minas Gerais', lat: -18.51, lng: -44.55, radius: 3 },
    { name: 'Bahia', lat: -12.97, lng: -38.51, radius: 3 },
    { name: 'Amazonas', lat: -3.12, lng: -60.02, radius: 5 },
    { name: 'Rio Grande do Sul', lat: -30.03, lng: -51.23, radius: 2.5 },
  ],
  AU: [
    { name: 'New South Wales', lat: -33.87, lng: 151.21, radius: 3 },
    { name: 'Victoria', lat: -37.81, lng: 144.96, radius: 2 },
    { name: 'Queensland', lat: -20.92, lng: 142.70, radius: 5 },
    { name: 'Western Australia', lat: -25.33, lng: 122.29, radius: 6 },
    { name: 'South Australia', lat: -30.00, lng: 136.21, radius: 4 },
    { name: 'Tasmania', lat: -42.04, lng: 146.84, radius: 1 },
  ],
  CA: [
    { name: 'Ontario', lat: 51.25, lng: -85.32, radius: 5 },
    { name: 'Quebec', lat: 52.94, lng: -73.55, radius: 5 },
    { name: 'British Columbia', lat: 53.73, lng: -127.65, radius: 5 },
    { name: 'Alberta', lat: 53.93, lng: -116.58, radius: 4 },
    { name: 'Manitoba', lat: 53.76, lng: -98.81, radius: 4 },
    { name: 'Saskatchewan', lat: 52.94, lng: -106.45, radius: 4 },
  ],
  JP: [
    { name: 'Tokyo', lat: 35.68, lng: 139.69, radius: 0.5 },
    { name: 'Osaka', lat: 34.69, lng: 135.50, radius: 0.5 },
    { name: 'Hokkaido', lat: 43.06, lng: 141.35, radius: 3 },
    { name: 'Kyoto', lat: 35.01, lng: 135.77, radius: 0.5 },
    { name: 'Fukuoka', lat: 33.59, lng: 130.40, radius: 1 },
    { name: 'Okinawa', lat: 26.34, lng: 127.80, radius: 1 },
  ],
};

/**
 * Reverse geocode: find nearest state/province based on lat/lng click
 * Uses simple Haversine-inspired distance check
 */
export function getStateFromCoords(
  lat: number,
  lng: number,
  countryCode: string
): StateRegion | null {
  const states = COUNTRY_STATES[countryCode];
  if (!states || states.length === 0) return null;

  let nearest: StateRegion | null = null;
  let minDist = Infinity;

  for (const state of states) {
    const dLat = lat - state.lat;
    const dLng = lng - state.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < state.radius && dist < minDist) {
      minDist = dist;
      nearest = state;
    }
  }

  return nearest;
}

/**
 * Get all state names for a country (used in search)
 */
export function getStatesForCountry(countryCode: string): string[] {
  const states = COUNTRY_STATES[countryCode];
  return states ? states.map((s) => s.name) : [];
}
