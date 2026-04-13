'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, MapPin, Command, ArrowRight } from 'lucide-react';
import { COUNTRIES } from '@/data/countries';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (countryCode: string, countryName: string) => void;
}

interface SearchResult {
  code: string;
  name: string;
  lat: number;
  lng: number;
  type: 'country';
}

export default function SearchOverlay({
  isOpen,
  onClose,
  onSelectCountry,
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search countries
  useEffect(() => {
    if (!query.trim()) {
      // Show popular countries when empty
      const popular = ['US', 'GB', 'IN', 'CN', 'JP', 'DE', 'FR', 'BR', 'AU', 'KR'];
      setResults(
        popular.map((code) => ({
          code,
          name: COUNTRIES[code].name,
          lat: COUNTRIES[code].lat,
          lng: COUNTRIES[code].lng,
          type: 'country' as const,
        }))
      );
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const matches = Object.entries(COUNTRIES)
      .filter(
        ([code, info]) =>
          info.name.toLowerCase().includes(q) ||
          code.toLowerCase().includes(q)
      )
      .map(([code, info]) => ({
        code,
        name: info.name,
        lat: info.lat,
        lng: info.lng,
        type: 'country' as const,
      }))
      .slice(0, 12);

    setResults(matches);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const r = results[selectedIndex];
        onSelectCountry(r.code, r.name);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [results, selectedIndex, onSelectCountry, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            className="fixed top-[15%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          >
            <div className="glass-strong rounded-xl overflow-hidden shadow-2xl shadow-cyan-400/5">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/50">
                <Search className="w-5 h-5 text-cyan-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search countries or intelligence feeds..."
                  className="flex-1 bg-transparent text-slate-100 text-sm placeholder-slate-500 outline-none font-mono tracking-wide"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 shrink-0">
                  <span className="text-[0.6rem] font-mono text-slate-500">ESC</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto py-2">
                {!query.trim() && (
                  <div className="px-5 py-1.5">
                    <span className="text-[0.6rem] font-mono tracking-widest text-slate-600 uppercase">
                      Popular Regions
                    </span>
                  </div>
                )}
                {results.map((result, i) => (
                  <button
                    key={result.code}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? 'bg-cyan-400/10 border-l-2 border-cyan-400'
                        : 'border-l-2 border-transparent hover:bg-slate-800/30'
                    }`}
                    onClick={() => {
                      onSelectCountry(result.code, result.name);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        i === selectedIndex
                          ? 'bg-cyan-400/20 text-cyan-400'
                          : 'bg-slate-800/50 text-slate-500'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          i === selectedIndex ? 'text-cyan-50' : 'text-slate-300'
                        }`}
                      >
                        {result.name}
                      </p>
                      <p className="text-[0.65rem] font-mono text-slate-500 tracking-wider">
                        {result.code} · {result.lat.toFixed(1)}°, {result.lng.toFixed(1)}°
                      </p>
                    </div>
                    {i === selectedIndex && (
                      <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}

                {query.trim() && results.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <Globe className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No countries found</p>
                    <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-800/50 bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[0.6rem] font-mono text-slate-600">
                    <span className="px-1 py-0.5 rounded bg-slate-800/50 text-slate-500">↑↓</span>
                    Navigate
                  </div>
                  <div className="flex items-center gap-1 text-[0.6rem] font-mono text-slate-600">
                    <span className="px-1 py-0.5 rounded bg-slate-800/50 text-slate-500">↵</span>
                    Select
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[0.6rem] font-mono text-slate-600">
                  <Command className="w-3 h-3" />
                  <span>+K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
