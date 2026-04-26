// ==========================================
// Aegis Global News AI Dashboard — Type Definitions
// ==========================================



/** AI-analyzed article with enrichments */
export interface AnalyzedArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  // AI enrichments
  summary: string;
  genre: string;
  reliability_score: number;
  sentiment: number; // -1 to 1
  veracity?: 'VERIFIED' | 'UNVERIFIED' | 'SENSATIONALIST';
  _aiValidated?: boolean;
}


/** Globe point for heatmap / rings */
export interface GlobePoint {
  lat: number;
  lng: number;
  intensity: number;
  label?: string;
  country?: string;
}

/** App state for selected country */
export interface CountrySelection {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

/** Sentiment atmosphere data */
export interface SentimentAtmosphere {
  averageSentiment: number;
  color: [number, number, number]; // RGB
}
