'use client';

import { motion } from 'framer-motion';
import { Shield, Globe, Activity, Zap, Search, Command } from 'lucide-react';

interface HeaderProps {
  averageSentiment: number | null;
  isLoading: boolean;
  selectedCountry: string | null;
  articleCount: number;
  aiPowered: boolean;
  onSearchOpen?: () => void;
}

export default function Header({
  averageSentiment,
  isLoading,
  selectedCountry,
  articleCount,
  aiPowered,
  onSearchOpen,
}: HeaderProps) {
  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentLabel = (s: number) => {
    if (s > 0.5) return 'Very Positive';
    if (s > 0.2) return 'Positive';
    if (s > -0.2) return 'Neutral';
    if (s > -0.5) return 'Negative';
    return 'Very Negative';
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo / Branding */}
        <motion.div
          className="flex items-center gap-3 pointer-events-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <Shield className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
            <div className="absolute inset-0 w-8 h-8 text-cyan-400 blur-sm opacity-50">
              <Shield className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.25em] text-cyan-50 glow-cyan">
              AEGIS
            </h1>
            <p className="text-[0.6rem] tracking-[0.3em] text-slate-500 uppercase">
              Global News Intelligence
            </p>
          </div>
        </motion.div>

        {/* Status Bar */}
        <motion.div
          className="flex items-center gap-3 pointer-events-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search button */}
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md glass text-xs hover:border-cyan-400/30 transition-all group"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:inline">
                Search
              </span>
              <div className="flex items-center gap-0.5 ml-1">
                <span className="text-[0.55rem] px-1 py-0.5 rounded bg-slate-800/60 text-slate-500 font-mono">
                  ⌘K
                </span>
              </div>
            </button>
          )}

          {/* AI Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md glass text-xs">
            <Zap className={`w-3.5 h-3.5 ${aiPowered ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span className={`font-mono tracking-wider ${aiPowered ? 'text-cyan-400' : 'text-slate-500'}`}>
              {aiPowered ? 'AI LIVE' : 'DEMO MODE'}
            </span>
          </div>

          {/* Selected Country */}
          {selectedCountry && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md glass text-xs"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-mono tracking-wider">
                {selectedCountry}
              </span>
            </motion.div>
          )}

          {/* Sentiment Gauge */}
          {averageSentiment !== null && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md glass text-xs"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Activity
                className="w-3.5 h-3.5"
                style={{ color: getSentimentColor(averageSentiment) }}
              />
              <span
                className="font-mono tracking-wider"
                style={{ color: getSentimentColor(averageSentiment) }}
              >
                {getSentimentLabel(averageSentiment)}
              </span>
              {/* Mini sentiment bar */}
              <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: getSentimentColor(averageSentiment),
                    width: `${((averageSentiment + 1) / 2) * 100}%`,
                  }}
                  initial={{ width: '50%' }}
                  animate={{
                    width: `${((averageSentiment + 1) / 2) * 100}%`,
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md glass text-xs">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </header>
  );
}
