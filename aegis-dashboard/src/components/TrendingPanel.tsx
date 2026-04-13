'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ChevronLeft, ChevronRight, Flame, BarChart3,
  Globe2, Zap, Bot, AlertTriangle, RefreshCw
} from 'lucide-react';

const STATIC_TOPICS = [
  { topic: 'AI Regulation', mentions: 847, change: +12.4, sentiment: 0.15 },
  { topic: 'Interest Rates', mentions: 624, change: -3.2, sentiment: -0.35 },
  { topic: 'Climate Policy', mentions: 531, change: +8.7, sentiment: 0.42 },
  { topic: 'Semiconductor Trade', mentions: 498, change: +22.1, sentiment: -0.12 },
  { topic: 'Space Programs', mentions: 412, change: +5.5, sentiment: 0.78 },
  { topic: 'Cybersecurity', mentions: 389, change: +18.3, sentiment: -0.28 },
  { topic: 'Energy Transition', mentions: 356, change: +6.9, sentiment: 0.55 },
  { topic: 'Digital Currency', mentions: 301, change: -1.4, sentiment: 0.08 },
];

const REGION_ACTIVITY = [
  { region: 'North America', activity: 92, color: '#22d3ee' },
  { region: 'Europe', activity: 87, color: '#06b6d4' },
  { region: 'East Asia', activity: 84, color: '#0891b2' },
  { region: 'Middle East', activity: 76, color: '#f59e0b' },
  { region: 'South Asia', activity: 71, color: '#f97316' },
  { region: 'Latin America', activity: 58, color: '#10b981' },
  { region: 'Africa', activity: 45, color: '#8b5cf6' },
  { region: 'Oceania', activity: 32, color: '#6366f1' },
];

interface AIDigest {
  summary: string;
  themes: { topic: string; sentiment: string }[];
  signal_alert: string;
  aiPowered: boolean;
  model?: string;
  cached?: boolean;
}

interface TrendingPanelProps {
  selectedCountry?: string | null;
  selectedCountryName?: string;
  selectedState?: string | null;
  articles?: { title: string; description?: string; source?: { name: string } }[];
}

export default function TrendingPanel({
  selectedCountry,
  selectedCountryName,
  selectedState,
  articles = [],
}: TrendingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [digest, setDigest] = useState<AIDigest | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const region = selectedState
    ? `${selectedState}, ${selectedCountryName}`
    : selectedCountryName || 'Global';

  const fetchDigest = useCallback(async () => {
    if (articles.length === 0) return;
    setDigestLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: articles.slice(0, 10), region }),
      });
      if (res.ok) {
        const data = await res.json();
        setDigest(data);
      }
    } catch (err) {
      console.error('AI digest error:', err);
    } finally {
      setDigestLoading(false);
    }
  }, [articles, region]);

  // Fetch digest whenever articles or location change
  useEffect(() => {
    if (articles.length > 0) {
      setDigest(null);
      fetchDigest();
    }
  }, [articles, region]);

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  const getThemeSentimentColor = (s: string) => {
    if (s === 'Positive') return 'text-emerald-400';
    if (s === 'Negative') return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-20 glass-strong rounded-r-lg flex items-center justify-center border border-l-0 border-cyan-400/10 hover:border-cyan-400/30 transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Intelligence Panel"
        id="trending-panel-toggle"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-16 bottom-12 w-[290px] z-30 glass-strong border-r border-cyan-400/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-cyan-50 tracking-wide">Intelligence Analytics</h3>
              </div>
              <p className="text-[0.6rem] font-mono text-slate-500 tracking-wider">
                REAL-TIME SIGNAL MONITORING
              </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── AI DIGEST SECTION ──────────────────────────────────────── */}
              {(articles.length > 0 || digestLoading) && (
                <div className="p-4 border-b border-slate-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                        AI Digest
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {digest?.cached && (
                        <span className="text-[0.55rem] font-mono text-slate-600 bg-slate-800/50 px-1 rounded">CACHED</span>
                      )}
                      <button
                        onClick={fetchDigest}
                        disabled={digestLoading}
                        className="p-1 rounded hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30"
                        title="Refresh digest"
                      >
                        <RefreshCw className={`w-3 h-3 ${digestLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-[0.6rem] font-mono text-slate-600 tracking-wider">
                      REGION: {region.toUpperCase()}
                    </span>
                  </div>

                  {digestLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-3 bg-slate-800/60 rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
                      ))}
                    </div>
                  ) : digest ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      {/* Summary */}
                      <p className="text-[0.7rem] text-slate-300 leading-relaxed">{digest.summary}</p>

                      {/* Signal Alert */}
                      {digest.signal_alert && (
                        <div className="flex items-start gap-2 p-2 rounded-md bg-amber-400/5 border border-amber-400/15">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[0.65rem] text-amber-300/80 leading-snug">{digest.signal_alert}</p>
                        </div>
                      )}

                      {/* Themes */}
                      {digest.themes && digest.themes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[0.6rem] font-mono tracking-wider text-slate-600 uppercase">Key Themes</p>
                          {digest.themes.map((t, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-[0.65rem] text-slate-400">{t.topic}</span>
                              <span className={`text-[0.6rem] font-mono ${getThemeSentimentColor(t.sentiment)}`}>
                                {t.sentiment}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Model badge */}
                      {digest.model && (
                        <div className="flex items-center gap-1 pt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${digest.aiPowered ? 'bg-purple-400' : 'bg-slate-600'}`} />
                          <span className="text-[0.55rem] font-mono text-slate-600">{digest.model}</span>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </div>
              )}

              {/* ── TRENDING TOPICS ────────────────────────────────────────── */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Global Signals
                  </span>
                </div>

                <div className="space-y-2">
                  {STATIC_TOPICS.map((item, i) => (
                    <motion.div
                      key={item.topic}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-800/30 transition-colors cursor-default group"
                    >
                      <span className="text-[0.6rem] font-mono text-slate-600 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate group-hover:text-cyan-50 transition-colors">
                          {item.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[0.6rem] font-mono text-slate-500">{item.mentions} mentions</span>
                          <span className={`text-[0.6rem] font-mono ${item.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.change > 0 ? '↑' : '↓'}{Math.abs(item.change)}%
                          </span>
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: getSentimentColor(item.sentiment) }}
                        title={`Sentiment: ${item.sentiment.toFixed(2)}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              {/* ── REGION ACTIVITY ────────────────────────────────────────── */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Region Activity
                  </span>
                </div>

                <div className="space-y-2.5">
                  {REGION_ACTIVITY.map((item, i) => (
                    <motion.div
                      key={item.region}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.65rem] text-slate-400">{item.region}</span>
                        <span className="text-[0.6rem] font-mono text-slate-500">{item.activity}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${item.activity}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

              {/* ── SENTIMENT SCALE ─────────────────────────────────────────── */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 uppercase">
                    Sentiment Scale
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-slate-400 via-cyan-400 to-emerald-400" />
                </div>
                <div className="flex justify-between text-[0.55rem] font-mono text-slate-500">
                  <span>NEGATIVE</span>
                  <span>NEUTRAL</span>
                  <span>POSITIVE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
