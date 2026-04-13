import { CountryInfo } from '@/types';

/** Map of ISO 3166-1 alpha-2 country codes to country info with centroids and neighbors */
export const COUNTRIES: Record<string, CountryInfo> = {
  US: { name: 'United States', code: 'US', lat: 39.8283, lng: -98.5795, neighbors: ['CA', 'MX'] },
  GB: { name: 'United Kingdom', code: 'GB', lat: 55.3781, lng: -3.4360, neighbors: ['IE', 'FR'] },
  FR: { name: 'France', code: 'FR', lat: 46.2276, lng: 2.2137, neighbors: ['DE', 'ES', 'IT', 'GB', 'BE'] },
  DE: { name: 'Germany', code: 'DE', lat: 51.1657, lng: 10.4515, neighbors: ['FR', 'PL', 'AT', 'NL'] },
  IN: { name: 'India', code: 'IN', lat: 20.5937, lng: 78.9629, neighbors: ['PK', 'CN', 'BD', 'NP'] },
  CN: { name: 'China', code: 'CN', lat: 35.8617, lng: 104.1954, neighbors: ['IN', 'RU', 'JP', 'KR'] },
  JP: { name: 'Japan', code: 'JP', lat: 36.2048, lng: 138.2529, neighbors: ['KR', 'CN'] },
  KR: { name: 'South Korea', code: 'KR', lat: 35.9078, lng: 127.7669, neighbors: ['JP', 'CN'] },
  RU: { name: 'Russia', code: 'RU', lat: 61.5240, lng: 105.3188, neighbors: ['CN', 'UA', 'FI'] },
  BR: { name: 'Brazil', code: 'BR', lat: -14.2350, lng: -51.9253, neighbors: ['AR', 'CO'] },
  AU: { name: 'Australia', code: 'AU', lat: -25.2744, lng: 133.7751, neighbors: ['NZ', 'ID'] },
  CA: { name: 'Canada', code: 'CA', lat: 56.1304, lng: -106.3468, neighbors: ['US'] },
  MX: { name: 'Mexico', code: 'MX', lat: 23.6345, lng: -102.5528, neighbors: ['US', 'GT'] },
  AR: { name: 'Argentina', code: 'AR', lat: -38.4161, lng: -63.6167, neighbors: ['BR', 'CL'] },
  ZA: { name: 'South Africa', code: 'ZA', lat: -30.5595, lng: 22.9375, neighbors: ['NA', 'MZ'] },
  NG: { name: 'Nigeria', code: 'NG', lat: 9.0820, lng: 8.6753, neighbors: ['CM', 'GH'] },
  EG: { name: 'Egypt', code: 'EG', lat: 26.8206, lng: 30.8025, neighbors: ['LY', 'SD', 'IL'] },
  SA: { name: 'Saudi Arabia', code: 'SA', lat: 23.8859, lng: 45.0792, neighbors: ['AE', 'IQ', 'YE'] },
  AE: { name: 'United Arab Emirates', code: 'AE', lat: 23.4241, lng: 53.8478, neighbors: ['SA', 'OM'] },
  IL: { name: 'Israel', code: 'IL', lat: 31.0461, lng: 34.8516, neighbors: ['PS', 'LB', 'EG'] },
  TR: { name: 'Turkey', code: 'TR', lat: 38.9637, lng: 35.2433, neighbors: ['GR', 'SY', 'IQ'] },
  IT: { name: 'Italy', code: 'IT', lat: 41.8719, lng: 12.5674, neighbors: ['FR', 'AT', 'CH'] },
  ES: { name: 'Spain', code: 'ES', lat: 40.4637, lng: -3.7492, neighbors: ['FR', 'PT'] },
  PL: { name: 'Poland', code: 'PL', lat: 51.9194, lng: 19.1451, neighbors: ['DE', 'UA', 'CZ'] },
  UA: { name: 'Ukraine', code: 'UA', lat: 48.3794, lng: 31.1656, neighbors: ['RU', 'PL', 'RO'] },
  SE: { name: 'Sweden', code: 'SE', lat: 60.1282, lng: 18.6435, neighbors: ['NO', 'FI'] },
  NO: { name: 'Norway', code: 'NO', lat: 60.4720, lng: 8.4689, neighbors: ['SE', 'FI'] },
  NL: { name: 'Netherlands', code: 'NL', lat: 52.1326, lng: 5.2913, neighbors: ['DE', 'BE'] },
  CH: { name: 'Switzerland', code: 'CH', lat: 46.8182, lng: 8.2275, neighbors: ['DE', 'FR', 'IT', 'AT'] },
  AT: { name: 'Austria', code: 'AT', lat: 47.5162, lng: 14.5501, neighbors: ['DE', 'IT', 'CH'] },
  PK: { name: 'Pakistan', code: 'PK', lat: 30.3753, lng: 69.3451, neighbors: ['IN', 'AF', 'CN'] },
  ID: { name: 'Indonesia', code: 'ID', lat: -0.7893, lng: 113.9213, neighbors: ['MY', 'AU'] },
  TH: { name: 'Thailand', code: 'TH', lat: 15.8700, lng: 100.9925, neighbors: ['MY', 'MM'] },
  SG: { name: 'Singapore', code: 'SG', lat: 1.3521, lng: 103.8198, neighbors: ['MY', 'ID'] },
  MY: { name: 'Malaysia', code: 'MY', lat: 4.2105, lng: 101.9758, neighbors: ['SG', 'TH', 'ID'] },
  NZ: { name: 'New Zealand', code: 'NZ', lat: -40.9006, lng: 174.886, neighbors: ['AU'] },
  IE: { name: 'Ireland', code: 'IE', lat: 53.1424, lng: -7.6921, neighbors: ['GB'] },
  PT: { name: 'Portugal', code: 'PT', lat: 39.3999, lng: -8.2245, neighbors: ['ES'] },
  GR: { name: 'Greece', code: 'GR', lat: 39.0742, lng: 21.8243, neighbors: ['TR', 'BG'] },
  CO: { name: 'Colombia', code: 'CO', lat: 4.5709, lng: -74.2973, neighbors: ['BR', 'VE'] },
  CL: { name: 'Chile', code: 'CL', lat: -35.6751, lng: -71.5430, neighbors: ['AR', 'PE'] },
  KE: { name: 'Kenya', code: 'KE', lat: -0.0236, lng: 37.9062, neighbors: ['TZ', 'UG'] },
  PH: { name: 'Philippines', code: 'PH', lat: 12.8797, lng: 121.7740, neighbors: ['ID', 'MY'] },
};

/** Convert ISO A3 code to A2 code */
export const ISO_A3_TO_A2: Record<string, string> = {
  USA: 'US', GBR: 'GB', FRA: 'FR', DEU: 'DE', IND: 'IN', CHN: 'CN',
  JPN: 'JP', KOR: 'KR', RUS: 'RU', BRA: 'BR', AUS: 'AU', CAN: 'CA',
  MEX: 'MX', ARG: 'AR', ZAF: 'ZA', NGA: 'NG', EGY: 'EG', SAU: 'SA',
  ARE: 'AE', ISR: 'IL', TUR: 'TR', ITA: 'IT', ESP: 'ES', POL: 'PL',
  UKR: 'UA', SWE: 'SE', NOR: 'NO', NLD: 'NL', CHE: 'CH', AUT: 'AT',
  PAK: 'PK', IDN: 'ID', THA: 'TH', SGP: 'SG', MYS: 'MY', NZL: 'NZ',
  IRL: 'IE', PRT: 'PT', GRC: 'GR', COL: 'CO', CHL: 'CL', KEN: 'KE',
  PHL: 'PH',
  // Additional common ones
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', AGO: 'AO', ARM: 'AM', AZE: 'AZ',
  BGD: 'BD', BLR: 'BY', BEL: 'BE', BOL: 'BO', BIH: 'BA', BWA: 'BW',
  BGR: 'BG', KHM: 'KH', CMR: 'CM', CRI: 'CR', HRV: 'HR', CUB: 'CU',
  CYP: 'CY', CZE: 'CZ', DNK: 'DK', DOM: 'DO', ECU: 'EC', SLV: 'SV',
  ETH: 'ET', FIN: 'FI', GHA: 'GH', GTM: 'GT', HND: 'HN', HKG: 'HK',
  HUN: 'HU', ISL: 'IS', IRQ: 'IQ', IRN: 'IR', JAM: 'JM', JOR: 'JO',
  KAZ: 'KZ', KWT: 'KW', LVA: 'LV', LBN: 'LB', LBY: 'LY', LTU: 'LT',
  LUX: 'LU', MDG: 'MG', MWI: 'MW', MLI: 'ML', MAR: 'MA', MOZ: 'MZ',
  MMR: 'MM', NAM: 'NA', NPL: 'NP', NIC: 'NI', NER: 'NE', OMN: 'OM',
  PAN: 'PA', PRY: 'PY', PER: 'PE', QAT: 'QA', ROU: 'RO', RWA: 'RW',
  SEN: 'SN', SRB: 'RS', SVK: 'SK', SVN: 'SI', SOM: 'SO', LKA: 'LK',
  SDN: 'SD', SYR: 'SY', TWN: 'TW', TZA: 'TZ', TUN: 'TN', TKM: 'TM',
  UGA: 'UG', URY: 'UY', UZB: 'UZ', VEN: 'VE', VNM: 'VN', YEM: 'YE',
  ZMB: 'ZM', ZWE: 'ZW', PSE: 'PS',
};

/** Get country info by ISO A2 or A3 code */
export function getCountryInfo(code: string): CountryInfo | undefined {
  const a2 = code.length === 3 ? ISO_A3_TO_A2[code] : code;
  return a2 ? COUNTRIES[a2] : undefined;
}

/** Get all country codes supported by GNews */
export const GNEWS_SUPPORTED_COUNTRIES = [
  'au', 'br', 'ca', 'cn', 'eg', 'fr', 'de', 'gr', 'hk', 'in',
  'ie', 'il', 'it', 'jp', 'nl', 'no', 'pk', 'pe', 'ph', 'pt',
  'ro', 'ru', 'sg', 'es', 'se', 'ch', 'tw', 'ua', 'gb', 'us',
  'at', 'ar', 'be', 'bg', 'co', 'cu', 'cz', 'hu', 'id', 'ke',
  'kr', 'mx', 'my', 'ng', 'nz', 'pl', 'sa', 'za', 'th', 'tr',
  'ae', 'cl',
];
