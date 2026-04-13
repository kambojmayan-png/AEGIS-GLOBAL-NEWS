'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { getStatesForCountry } from '@/data/states';

interface StateSelectorProps {
  countryCode: string;
  value: string;
  onChange: (state: string) => void;
  disabled?: boolean;
}

export default function StateSelector({ countryCode, value, onChange, disabled }: StateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const states = getStatesForCountry(countryCode.toUpperCase());
  const filtered = states.filter((s) => s.toLowerCase().includes(query.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset when country changes
  useEffect(() => {
    setQuery('');
  }, [countryCode]);

  if (states.length === 0) return null;

  return (
    <div ref={ref} className={`relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-amber-400/20 hover:border-amber-400/40 transition-all text-xs font-mono text-slate-300 hover:text-amber-100 min-w-[140px]"
        id="state-selector-btn"
        disabled={disabled}
      >
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="flex-1 text-left truncate">{value || 'Select State'}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 w-52 z-50 glass-strong border border-amber-400/20 rounded-lg overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Search input */}
            <div className="p-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-900/50">
                <Search className="w-3 h-3 text-slate-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder={`Search states...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full font-mono"
                />
              </div>
            </div>

            {/* Clear option */}
            {value && (
              <button
                onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                className="w-full text-left px-3 py-2 text-xs font-mono text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors italic"
              >
                ✕ Clear state filter
              </button>
            )}

            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    onChange(state);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 transition-colors hover:bg-amber-400/10 hover:text-amber-100 ${
                    value === state ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400'
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5 shrink-0 opacity-50" />
                  {state}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-600 text-center font-mono">No states found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
