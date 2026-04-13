'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Newspaper, TrendingUp, MapPin, Layers,
  Search, SlidersHorizontal, ShieldCheck, AlertTriangle, Sparkles,
  Globe2, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AnalyzedArticle } from '@/types';
import ArticleCard from './ArticleCard';
import { SidebarSkeleton } from './LoadingStates';
import CountrySelector from './CountrySelector';
import StateSelector from './StateSelector';

// ─────────────────────────────────────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────────────────────────────────────

/** Topic filters map to NewsAPI category parameters */
export type TopicFilter =
  | 'all' | 'business' | 'technology' | 'science' | 'sports'
  | 'health' | 'entertainment' | 'politics' | 'finance' | 'environment';

type VeracityFilter = 'all' | 'verified' | 'clean';

interface FilterInfo {
  fetched:     number;
  scored:      number;
  aiValidated: boolean;
  threshold:   number;
  fallback:    boolean;
  message:     string;
}

/** Maps UI topic → NewsAPI category param (only official NewsAPI categories) */
export const TOPIC_TO_API: Record<TopicFilter, string | null> = {
  all:           null,
  business:      'business',
  technology:    'technology',
  science:       'science',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
  politics:      null,   // NewsAPI has no politics category — keyword filter handles it
  finance:       'business',
  environment:   'science',
};

// ─── Category definitions (label, emoji, TailwindCSS color key) ─────────────
const TOPIC_FILTERS: { id: TopicFilter; label: string; emoji: string; color: string }[] = [
  { id: 'all',           label: 'All News',   emoji: '🌐', color: 'cyan'    },
  { id: 'technology',    label: 'Tech & AI',  emoji: '🤖', color: 'violet'  },
  { id: 'business',      label: 'Business',   emoji: '📈', color: 'emerald' },
  { id: 'finance',       label: 'Finance',    emoji: '💰', color: 'yellow'  },
  { id: 'politics',      label: 'Politics',   emoji: '🏛️', color: 'blue'    },
  { id: 'health',        label: 'Health',     emoji: '🏥', color: 'rose'    },
  { id: 'science',       label: 'Science',    emoji: '🔬', color: 'teal'    },
  { id: 'environment',   label: 'Climate',    emoji: '🌿', color: 'green'   },
  { id: 'sports',        label: 'Sports',     emoji: '⚽', color: 'orange'  },
  { id: 'entertainment', label: 'Culture',    emoji: '🎬', color: 'pink'    },
];

// Tailwind color variants per topic
const TOPIC_COLORS: Record<string, { text: string; border: string; activeBg: string; hoverBg: string }> = {
  cyan:    { text: 'text-cyan-400',    border: 'border-cyan-400/30',    activeBg: 'bg-cyan-400/20',    hoverBg: 'hover:bg-cyan-400/10'    },
  violet:  { text: 'text-violet-400',  border: 'border-violet-400/30',  activeBg: 'bg-violet-400/20',  hoverBg: 'hover:bg-violet-400/10'  },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-400/30', activeBg: 'bg-emerald-400/20', hoverBg: 'hover:bg-emerald-400/10' },
  yellow:  { text: 'text-yellow-400',  border: 'border-yellow-400/30',  activeBg: 'bg-yellow-400/20',  hoverBg: 'hover:bg-yellow-400/10'  },
  blue:    { text: 'text-blue-400',    border: 'border-blue-400/30',    activeBg: 'bg-blue-400/20',    hoverBg: 'hover:bg-blue-400/10'    },
  rose:    { text: 'text-rose-400',    border: 'border-rose-400/30',    activeBg: 'bg-rose-400/20',    hoverBg: 'hover:bg-rose-400/10'    },
  teal:    { text: 'text-teal-400',    border: 'border-teal-400/30',    activeBg: 'bg-teal-400/20',    hoverBg: 'hover:bg-teal-400/10'    },
  green:   { text: 'text-green-400',   border: 'border-green-400/30',   activeBg: 'bg-green-400/20',   hoverBg: 'hover:bg-green-400/10'   },
  orange:  { text: 'text-orange-400',  border: 'border-orange-400/30',  activeBg: 'bg-orange-400/20',  hoverBg: 'hover:bg-orange-400/10'  },
  pink:    { text: 'text-pink-400',    border: 'border-pink-400/30',    activeBg: 'bg-pink-400/20',    hoverBg: 'hover:bg-pink-400/10'    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Client-side genre matching (for topics with no NewsAPI category)
// ─────────────────────────────────────────────────────────────────────────────

const GENRE_KEYWORDS: Record<TopicFilter, string[]> = {
  all:           [],
  politics:      [
    'politics', 'political', 'government', 'election', 'parliament', 'minister',
    'president', 'senate', 'congress', 'policy', 'diplomatic', 'sanction',
    'military', 'treaty', 'vote', 'referendum', 'legislation', 'opposition',
    'prime minister', 'cabinet', 'constitution', 'geopolit', 'war', 'conflict',
    'nato', 'foreign', 'regime', 'coup', 'protest', 'rally', 'diplomat',
  ],
  business:      [
    'business', 'economy', 'economic', 'market', 'trade', 'startup', 'company',
    'corporate', 'merger', 'acquisition', 'gdp', 'export', 'import', 'commerce',
    'entrepreneur', 'industry', 'manufacturing', 'supply chain', 'revenue',
    'profit', 'loss', 'earnings', 'ceo', 'ipo', 'retail', 'consumer',
  ],
  finance:       [
    'finance', 'financial', 'stock', 'inflation', 'currency', 'bank', 'investment',
    'interest rate', 'bond', 'fund', 'monetary', 'crypto', 'bitcoin', 'forex',
    'market cap', 'dividend', 'debt', 'fiscal', 'treasury', 'fed', 'rbi',
    'hedge', 'portfolio', 'equity', 'nasdaq', 'sensex', 'nifty', 'dow',
    'rate hike', 'recession', 'deficit', 'surplus', 'loan',
  ],
  technology:    [
    'tech', 'technology', 'ai', 'artificial intelligence', 'software', 'cyber',
    'digital', 'internet', 'semiconductor', 'chip', 'space', 'satellite',
    'robot', 'app', 'silicon', 'cloud', 'data', 'algorithm', 'automation',
    'machine learning', 'deep learning', 'ev', 'electric vehicle', 'drone',
    'metaverse', 'blockchain', '5g', 'quantum', 'gadget', 'smartphone',
  ],
  science:       [
    'science', 'scientific', 'research', 'physics', 'biology', 'medical',
    'vaccine', 'pandemic', 'discovery', 'study', 'experiment', 'nasa',
    'space exploration', 'gene', 'dna', 'stem', 'university', 'laboratory',
    'breakthrough', 'fossil', 'planet', 'astronomy', 'chemistry', 'nuclear',
  ],
  environment:   [
    'climate', 'environment', 'energy', 'carbon', 'solar', 'wind', 'green',
    'emission', 'renewable', 'deforestation', 'flood', 'drought', 'wildfire',
    'global warming', 'pollution', 'plastic', 'ocean', 'glacier', 'fossil fuel',
    'sustainability', 'biodiversity', 'conservation', 'ecosystem', 'temperature',
  ],
  sports:        [
    'sport', 'football', 'soccer', 'cricket', 'olympic', 'championship', 'tournament',
    'match', 'game', 'player', 'team', 'league', 'cup', 'athlete', 'coach',
    'fifa', 'icc', 'nba', 'nfl', 'premier league', 'grand prix', 'formula 1',
    'tennis', 'golf', 'boxing', 'swimming', 'medal', 'win', 'defeat', 'score',
  ],
  health:        [
    'health', 'hospital', 'disease', 'virus', 'medicine', 'drug', 'patient',
    'cancer', 'mental health', 'nutrition', 'fitness', 'surgery', 'doctor',
    'treatment', 'therapy', 'pharmaceutical', 'outbreak', 'epidemic', 'diet',
    'diabetes', 'heart', 'blood', 'clinic', 'who', 'fda', 'healthcare',
  ],
  entertainment: [
    'entertainment', 'film', 'movie', 'music', 'celebrity', 'culture', 'art',
    'gaming', 'television', 'streaming', 'award', 'actor', 'oscars', 'grammy',
    'bollywood', 'hollywood', 'concert', 'album', 'box office', 'trailer',
    'series', 'netflix', 'disney', 'show', 'festival', 'singer', 'director',
  ],
};

/** Country relevance terms — used for client-side strict filtering */
const COUNTRY_TERMS: Record<string, string[]> = {
  russia:           ['russia', 'russian', 'moscow', 'kremlin', 'putin'],
  india:            ['india', 'indian', 'delhi', 'mumbai', 'modi', 'hindus'],
  china:            ['china', 'chinese', 'beijing', 'xi jinping', 'sino'],
  japan:            ['japan', 'japanese', 'tokyo', 'osaka', 'yen'],
  germany:          ['germany', 'german', 'berlin', 'deutsche', 'bundesbank'],
  france:           ['france', 'french', 'paris', 'macron', 'élysée'],
  'united kingdom': ['uk', 'britain', 'british', 'london', 'england', 'scotland', 'wales'],
  'united states':  ['us', 'usa', 'american', 'washington', 'trump', 'biden', 'harris'],
  brazil:           ['brazil', 'brazilian', 'brasil', 'lula', 'petrobras'],
  pakistan:         ['pakistan', 'pakistani', 'islamabad', 'karachi', 'lahore'],
  ukraine:          ['ukraine', 'ukrainian', 'kyiv', 'zelensky', 'donbas'],
  iran:             ['iran', 'iranian', 'tehran', 'khamenei'],
  'south korea':    ['korea', 'korean', 'seoul', 'won', 'samsung'],
  australia:        ['australia', 'australian', 'sydney', 'melbourne', 'canberra'],
  canada:           ['canada', 'canadian', 'ottawa', 'toronto', 'montreal'],
  'saudi arabia':   ['saudi', 'riyadh', 'aramco', 'opec', 'bin salman'],
  israel:           ['israel', 'israeli', 'tel aviv', 'netanyahu', 'idf'],
  turkey:           ['turkey', 'turkish', 'erdogan', 'ankara', 'istanbul'],
  egypt:            ['egypt', 'egyptian', 'cairo', 'nile'],
  'south africa':   ['south africa', 'south african', 'johannesburg', 'cape town'],
  nigeria:          ['nigeria', 'nigerian', 'abuja', 'lagos', 'naira'],
  mexico:           ['mexico', 'mexican', 'cdmx', 'peso'],
  indonesia:        ['indonesia', 'indonesian', 'jakarta', 'rupiah'],
  poland:           ['poland', 'polish', 'warsaw', 'zloty'],
  spain:            ['spain', 'spanish', 'madrid', 'barcelona'],
  italy:            ['italy', 'italian', 'rome'],
  argentina:        ['argentina', 'argentinian', 'buenos aires', 'peso'],
  'new zealand':    ['new zealand', 'kiwi', 'wellington', 'auckland'],
  kenya:            ['kenya', 'kenyan', 'nairobi', 'shilling'],
  ghana:            ['ghana', 'ghanaian', 'accra', 'cedi'],
  ethiopia:         ['ethiopia', 'ethiopian', 'addis ababa'],
};

function isRelevantToCountry(article: AnalyzedArticle, countryName: string): boolean {
  const name  = countryName.toLowerCase();
  const terms = COUNTRY_TERMS[name] || [name];
  const hay   = `${article.title} ${article.description}`.toLowerCase();
  return terms.some((t) => hay.includes(t));
}

/** Check if an article matches a given topic using keyword matching.
 * Scans title, description, content (first 300 chars), and AI genre label.
 */
function matchesCategory(article: AnalyzedArticle, topic: TopicFilter): boolean {
  if (topic === 'all') return true;
  const kws = GENRE_KEYWORDS[topic] ?? [];
  if (kws.length === 0) return true;
  // Build a rich haystack from all text fields
  const hay = [
    article.title         ?? '',
    article.description   ?? '',
    article.content?.substring(0, 300) ?? '',
    article.genre         ?? '',
    article.summary       ?? '',
  ].join(' ').toLowerCase();
  return kws.some((kw) => hay.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface NewsSidebarProps {
  isOpen:           boolean;
  onClose:          () => void;
  countryName:      string;
  countryCode:      string;
  selectedState?:   string | null;
  articles:         AnalyzedArticle[];
  isLoading:        boolean;
  aiPowered:        boolean;
  onCountryChange?: (code: string, name: string) => void;
  onStateChange?:   (state: string) => void;
  filterInfo?:      FilterInfo | null;
  activeTopic?:     TopicFilter;
  onTopicChange?:   (topic: TopicFilter) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function NewsSidebar({
  isOpen,
  onClose,
  countryName,
  countryCode,
  selectedState,
  articles,
  isLoading,
  aiPowered,
  onCountryChange,
  onStateChange,
  filterInfo,
  activeTopic = 'all',
  onTopicChange,
}: NewsSidebarProps) {
  const [veracityFilter, setVeracityFilter] = useState<VeracityFilter>('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [filtersOpen, setFiltersOpen]       = useState(false);

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // 1. Country relevance (skip for global/empty)
    if (countryName && countryName !== 'Global') {
      const cf = result.filter((a) => isRelevantToCountry(a, countryName));
      if (cf.length > 0) result = cf;
    }

    // 2. Category filter — ALWAYS apply keyword matching for non-'all' topics.
    //    This acts as a second-pass filter on top of NewsAPI's category param,
    //    catching mis-categorised articles and handling topics with no API category.
    if (activeTopic !== 'all') {
      const cat = result.filter((a) => matchesCategory(a, activeTopic));
      // Only narrow down if we have matches — prevents completely empty results
      // when the API returned articles that semantically belong to this category
      // but happen not to contain the exact keywords (e.g., by-line articles).
      if (cat.length > 0) result = cat;
      // If cat.length === 0: all articles were API-fetched for this category,
      // so they are relevant — show them all rather than an empty screen.
    }

    // 3. Veracity filter
    if (veracityFilter === 'verified') {
      const vf = result.filter((a) => a.veracity === 'VERIFIED');
      if (vf.length > 0) result = vf;
    } else if (veracityFilter === 'clean') {
      result = result.filter((a) => a.veracity !== 'SENSATIONALIST');
    }

    // 4. Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.source?.name?.toLowerCase().includes(q) ||
          a.genre?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [articles, countryName, activeTopic, veracityFilter, searchQuery]);


  // ── Computed stats ────────────────────────────────────────────────────────
  const avgSentiment = filteredArticles.length > 0
    ? filteredArticles.reduce((s, a) => s + a.sentiment, 0) / filteredArticles.length
    : 0;

  const avgReliability = filteredArticles.length > 0
    ? Math.round(filteredArticles.reduce((s, a) => s + a.reliability_score, 0) / filteredArticles.length)
    : 0;

  const veracityCounts = filteredArticles.reduce(
    (acc, a) => {
      if (a.veracity === 'VERIFIED')        acc.verified++;
      else if (a.veracity === 'SENSATIONALIST') acc.sensationalist++;
      else acc.unverified++;
      return acc;
    },
    { verified: 0, unverified: 0, sensationalist: 0 }
  );

  const getSentColor = (s: number) =>
    s > 0.3 ? '#10b981' : s > 0 ? '#22d3ee' : s > -0.3 ? '#f59e0b' : '#ef4444';

  const displayTitle    = selectedState ? selectedState : countryName;
  const displaySubtitle = selectedState ? `${countryCode} › ${selectedState}` : countryCode;

  const activeFilterCount = [
    activeTopic !== 'all',
    veracityFilter !== 'all',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    if (onTopicChange) onTopicChange('all');
    setVeracityFilter('all');
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          id="news-sidebar"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[460px] z-40 glass-strong flex flex-col scan-overlay"
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 p-5 border-b border-slate-800/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                  {selectedState
                    ? <Layers className="w-5 h-5 text-amber-400" />
                    : <MapPin  className="w-5 h-5 text-cyan-400" />
                  }
                </div>
                <div>
                  <h2 className="text-base font-bold text-cyan-50 tracking-wide">{displayTitle}</h2>
                  <p className="text-[0.62rem] font-mono text-slate-500 tracking-wider">
                    {displaySubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Country + State selectors */}
            {onCountryChange && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <CountrySelector
                  value={countryCode.toLowerCase()}
                  onChange={(code, name) => {
                    onCountryChange(code, name);
                    if (onTopicChange) onTopicChange('all');
                    setVeracityFilter('all');
                    setSearchQuery('');
                  }}
                />
                {onStateChange && (
                  <StateSelector
                    countryCode={countryCode}
                    value={selectedState || ''}
                    onChange={onStateChange}
                    disabled={!countryCode}
                  />
                )}
              </div>
            )}

            {/* ── Stats bar ─────────────────────────────────────────────── */}
            {articles.length > 0 && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Avg trust score */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 text-xs">
                    <TrendingUp className="w-3 h-3 text-cyan-400" />
                    <span className="text-slate-500">Trust:</span>
                    <span className={`font-mono font-semibold text-[0.65rem] ${
                      avgReliability >= 70 ? 'text-cyan-400' :
                      avgReliability >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>{avgReliability}%</span>
                  </div>

                  {/* Avg sentiment */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: getSentColor(avgSentiment) }} />
                    <span className="text-slate-500">Mood:</span>
                    <span className="font-mono font-semibold text-[0.65rem]" style={{ color: getSentColor(avgSentiment) }}>
                      {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                    </span>
                  </div>

                  {/* Veracity breakdown */}
                  <div className="flex items-center gap-1.5 text-[0.58rem] font-mono bg-slate-900/50 px-2.5 py-1 rounded-lg">
                    <span className="text-emerald-400">✓{veracityCounts.verified}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-amber-400">?{veracityCounts.unverified}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-rose-400">⚠{veracityCounts.sensationalist}</span>
                  </div>

                  {/* AI badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[0.58rem] font-mono ${
                    aiPowered
                      ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                      : 'text-slate-500 bg-slate-800/50 border border-slate-700/40'
                  }`}>
                    <Newspaper className="w-2.5 h-2.5" />
                    {aiPowered ? 'LIVE AI' : 'DEMO'}
                  </div>

                  {/* AI Validated badge */}
                  {filterInfo?.aiValidated && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[0.58rem] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20">
                      <Sparkles className="w-2.5 h-2.5" />
                      GROQ VERIFIED
                    </div>
                  )}

                  {/* Filter toggle */}
                  <button
                    onClick={() => setFiltersOpen((p) => !p)}
                    className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.65rem] font-mono transition-all ${
                      filtersOpen || activeFilterCount > 0
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                    title="Toggle filters"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    FILTERS
                    {activeFilterCount > 0 && (
                      <span className="bg-cyan-400 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-[0.5rem] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter status banner */}
                {filterInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.58rem] font-mono leading-relaxed ${
                      filterInfo.fallback
                        ? 'bg-amber-500/8 border border-amber-500/25 text-amber-300'
                        : 'bg-emerald-500/8 border border-emerald-500/25 text-emerald-300'
                    }`}
                  >
                    {filterInfo.fallback
                      ? <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      : <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    }
                    <span className="flex-1">{filterInfo.message}</span>
                    <span className="opacity-40">{filterInfo.fetched}→{filterInfo.scored}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── Category Pills ─────────────────────────────────────────────── */}
          {countryName && (
            <div className="flex-shrink-0 border-b border-slate-800/50 bg-slate-950/20">
              <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide">
                {TOPIC_FILTERS.map((t) => {
                  const c       = TOPIC_COLORS[t.color];
                  const isActive = activeTopic === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => { if (onTopicChange) onTopicChange(t.id); }}
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ scale: 1.03 }}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[0.6rem] font-mono font-semibold border transition-all duration-200 ${
                        isActive
                          ? `${c.activeBg} ${c.border} ${c.text}`
                          : `bg-transparent border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600/60`
                      }`}
                      title={t.label}
                    >
                      <span>{t.emoji}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Collapsible Filter Panel ──────────────────────────────────── */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden border-b border-slate-800/50"
              >
                <div className="p-4 space-y-3 bg-slate-950/40">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${displayTitle} news...`}
                      className="w-full pl-8 pr-8 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Veracity filter buttons */}
                  <div>
                    <p className="text-[0.58rem] font-mono text-slate-600 uppercase tracking-widest mb-2">Credibility Filter</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'all'      as VeracityFilter, label: 'All'               },
                        { id: 'verified' as VeracityFilter, label: '✅ Verified Only'  },
                        { id: 'clean'    as VeracityFilter, label: '🚫 No Sensational' },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setVeracityFilter(id)}
                          className={`flex-1 py-1.5 rounded-lg text-[0.58rem] font-mono transition-all ${
                            veracityFilter === id
                              ? id === 'verified'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                : id === 'clean'
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                : 'bg-slate-700/60 border border-slate-600/50 text-slate-300'
                              : 'bg-slate-800/40 border border-slate-700/30 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset button */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="w-full py-1.5 text-[0.6rem] font-mono text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-lg transition-all"
                    >
                      ✕ CLEAR ALL FILTERS
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Article List ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <SidebarSkeleton />
            ) : filteredArticles.length === 0 && articles.length > 0 ? (
              /* Filters removed everything */
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <SlidersHorizontal className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-400 text-sm font-semibold mb-1">No results match your filters</p>
                <p className="text-slate-600 text-xs mb-4">{articles.length} articles loaded — try relaxing filters</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Globe2 className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm mb-1">No intelligence reports found</p>
                <p className="text-slate-600 text-xs">
                  Select a country above or click the globe to load news
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredArticles.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    index={i}
                    selectedCountry={countryCode}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer gradient fade */}
          <div className="flex-shrink-0 h-6 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
