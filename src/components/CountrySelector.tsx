'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, ChevronDown, Search } from 'lucide-react';
import { COUNTRIES } from '@/data/countries';

// Only include countries supported by NewsAPI (overlapping with our data)
const NEWSAPI_SUPPORTED = [
  'us', 'gb', 'in', 'au', 'ca', 'de', 'fr', 'jp', 'kr', 'ru', 'cn', 'br',
  'mx', 'ar', 'eg', 'za', 'ng', 'sa', 'ae', 'il', 'tr', 'it', 'es', 'pl',
  'ua', 'se', 'no', 'nl', 'ch', 'at', 'pk', 'id', 'th', 'sg', 'my', 'nz',
  'ie', 'pt', 'gr', 'co', 'cl',
];

const COUNTRY_OPTIONS = NEWSAPI_SUPPORTED
  .map((code) => {
    const info = COUNTRIES[code.toUpperCase()];
    return info ? { code: code.toLowerCase(), name: info.name } : null;
  })
  .filter(Boolean) as { code: string; name: string }[];

interface CountrySelectorProps {
  value: string;
  onChange: (code: string, name: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = COUNTRY_OPTIONS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.includes(query.toLowerCase())
  );

  const currentName = COUNTRIES[value.toUpperCase()]?.name || value.toUpperCase();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-cyan-400/20 hover:border-cyan-400/40 transition-all text-xs font-mono text-slate-300 hover:text-cyan-100 min-w-[140px]"
        id="country-selector-btn"
      >
        <Globe2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="flex-1 text-left truncate">{currentName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 w-52 z-50 glass-strong border border-cyan-400/20 rounded-lg overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Search input */}
            <div className="p-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-900/50">
                <Search className="w-3 h-3 text-slate-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.code, country.name);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center transition-colors hover:bg-cyan-400/10 hover:text-cyan-100 ${
                    value === country.code ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{country.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-600 text-center font-mono">No results</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
