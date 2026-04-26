'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Satellite, Radar, Navigation } from 'lucide-react';

interface HUDProps {
  selectedCountry: string | null;
  selectedCountryName: string;
  isLoading: boolean;
  articleCount: number;
  averageSentiment: number | null;
}

export default function HUD({
  selectedCountry,
  selectedCountryName,
  isLoading,
  articleCount,
  averageSentiment,
}: HUDProps) {
  const [systemTime, setSystemTime] = useState('');
  const [scanAngle, setScanAngle] = useState(0);

  // Realtime clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSystemTime(
        now.toISOString().slice(11, 23) + 'Z'
      );
      setScanAngle((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getSentimentText = (s: number) => {
    if (s > 0.3) return 'POSITIVE';
    if (s > 0) return 'LEAN POS';
    if (s > -0.3) return 'LEAN NEG';
    return 'NEGATIVE';
  };

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top-left HUD corner */}
      <div className="absolute top-16 left-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-2"
        >
          {/* Coordinates display */}
          <div className="flex items-center gap-2">
            <Crosshair className="w-3 h-3 text-cyan-400/40" />
            <span className="text-[0.55rem] font-mono tracking-widest text-cyan-400/40 tabular-nums">
              {systemTime}
            </span>
          </div>

          {/* Radar sweep indicator */}
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <Radar className="w-3 h-3 text-cyan-400/30 absolute" />
              <motion.div
                className="absolute inset-0 w-3 h-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-0.5 h-1.5 bg-cyan-400/40 mx-auto origin-bottom" />
              </motion.div>
            </div>
            <span className="text-[0.55rem] font-mono tracking-widest text-cyan-400/30">
              SCANNING {Math.floor(scanAngle)}°
            </span>
          </div>

          {/* Satellite count */}
          <div className="flex items-center gap-2">
            <Satellite className="w-3 h-3 text-cyan-400/30" />
            <span className="text-[0.55rem] font-mono tracking-widest text-cyan-400/30">
              3 SATS LINKED
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom-left target info */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-14 left-4"
          >
            <div className="space-y-1.5">
              {/* Target label */}
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-cyan-400/60" />
                <span className="text-[0.6rem] font-mono tracking-[0.3em] text-cyan-400/60 uppercase">
                  Target Lock
                </span>
              </div>

              {/* Country name only — no codes or numbers */}
              <div className="pl-5">
                <span className="text-sm font-mono font-bold text-cyan-400/80 tracking-wider">
                  {selectedCountryName}
                </span>
              </div>

              {/* Stats row */}
              <div className="pl-5 flex items-center gap-3">
                {isLoading ? (
                  <span className="text-[0.55rem] font-mono text-amber-400/60 animate-pulse tracking-wider">
                    ANALYZING...
                  </span>
                ) : (
                  <>
                    {averageSentiment !== null && (
                      <span
                        className="text-[0.55rem] font-mono tracking-wider"
                        style={{ color: getSentimentColor(averageSentiment) }}
                      >
                        {getSentimentText(averageSentiment)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Targeting brackets */}
              <div className="pl-5 flex items-center gap-1 mt-1">
                <div className="w-6 h-[1px] bg-cyan-400/20" />
                <div className="w-1 h-1 bg-cyan-400/40 rotate-45" />
                <div className="w-12 h-[1px] bg-cyan-400/20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Decorative crosshair center top */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-400/20" />
          <div className="w-1.5 h-1.5 border border-cyan-400/20 rotate-45" />
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-400/20" />
        </motion.div>
      </div>
    </div>
  );
}
