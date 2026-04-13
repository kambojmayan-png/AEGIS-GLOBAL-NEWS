'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: '> AEGIS GLOBAL INTELLIGENCE SYSTEM v4.2.1', delay: 0, color: '#22d3ee' },
  { text: '> Establishing encrypted satellite uplinks...', delay: 200, color: '#94a3b8' },
  { text: '  ├─ NOAA-21 ............ CONNECTED', delay: 500, color: '#10b981' },
  { text: '  ├─ Sentinel-6B ........ CONNECTED', delay: 700, color: '#10b981' },
  { text: '  └─ Starlink Gateway ... CONNECTED', delay: 900, color: '#10b981' },
  { text: '> Loading geospatial databases...', delay: 1200, color: '#94a3b8' },
  { text: '  ├─ TopoJSON world atlas .... OK', delay: 1500, color: '#f59e0b' },
  { text: '  └─ Country centroids ....... OK', delay: 1700, color: '#f59e0b' },
  { text: '> Initializing 3D globe renderer (WebGL2)...', delay: 2000, color: '#94a3b8' },
  { text: '> Calibrating AI news analysis engine...', delay: 2400, color: '#94a3b8' },
  { text: '  └─ Gemini 2.0 Flash ........ STANDBY', delay: 2700, color: '#22d3ee' },
  { text: '> Scanning 194 sovereign nations...', delay: 3000, color: '#94a3b8' },
  { text: '> All systems operational. Welcome, Operator.', delay: 3400, color: '#22d3ee' },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show lines one by one
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        setProgress(((i + 1) / BOOT_LINES.length) * 100);
      }, line.delay);
    });

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 4000);

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fading ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Scan line effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.4), transparent)',
              }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* CRT noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="w-full max-w-2xl px-8">
            {/* Top logo */}
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[0.65rem] font-mono tracking-[0.4em] text-cyan-400/60 uppercase">
                System Boot
              </span>
            </motion.div>

            {/* Terminal output */}
            <div className="font-mono text-sm leading-relaxed space-y-1 mb-8 min-h-[320px]">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ color: line.color }}
                  className="whitespace-pre"
                >
                  {line.text}
                  {i === visibleLines - 1 && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-cyan-400 ml-1 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[0.6rem] font-mono tracking-wider">
                <span className="text-slate-500">BOOT PROGRESS</span>
                <span className="text-cyan-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #22d3ee, #06b6d4, #0891b2)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Skip hint */}
            <motion.p
              className="text-center text-[0.6rem] text-slate-600 font-mono tracking-widest mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              PRESS ANY KEY TO SKIP
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#020617]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  );
}
