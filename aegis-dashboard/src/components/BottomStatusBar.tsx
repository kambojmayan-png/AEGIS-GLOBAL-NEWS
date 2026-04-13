'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radio, Cpu, Clock, Wifi, Activity } from 'lucide-react';
import { MOCK_BREAKING_NEWS } from '@/lib/mock-data';

const TICKER_HEADLINES = [
  '◆ BREAKING: Global semiconductor supply chain faces new regulatory hurdles',
  '◆ MARKETS: Asian indices surge on central bank policy signals',
  '◆ CLIMATE: Arctic ice coverage reaches record seasonal low',
  '◆ TECH: Quantum computing milestone achieved at CERN facility',
  '◆ DEFENSE: NATO expands Mediterranean naval exercises',
  '◆ FINANCE: Digital currency regulation framework adopted by G7',
  '◆ SPACE: SpaceX Starship completes orbital maneuver test',
  '◆ ENERGY: Middle East solar farm project surpasses 5GW capacity',
  '◆ HEALTH: WHO upgrades pandemic preparedness protocol',
  '◆ TRADE: Trans-Pacific trade corridor reports record throughput',
];

interface BottomStatusBarProps {
  aiPowered: boolean;
  isLoading: boolean;
  articleCount: number;
}

export default function BottomStatusBar({
  aiPowered,
  isLoading,
  articleCount,
}: BottomStatusBarProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [tickerOffset, setTickerOffset] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Update clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          ' UTC' +
          (now.getTimezoneOffset() > 0 ? '-' : '+') +
          Math.abs(now.getTimezoneOffset() / 60)
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ticker scroll animation
  useEffect(() => {
    let lastTime = performance.now();
    const speed = 50; // pixels per second

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setTickerOffset((prev) => {
        const newOffset = prev - speed * delta;
        // Reset when scrolled past all text
        if (newOffset < -4000) return 0;
        return newOffset;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const tickerText = TICKER_HEADLINES.join('     ');

  return (
    <motion.footer
      className="fixed bottom-0 left-0 right-0 z-30 h-9 glass-strong border-t border-cyan-400/10"
      initial={{ y: 40 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', damping: 25 }}
    >
      {/* Top scan line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="flex items-center h-full px-4 gap-3">
        {/* System status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${aiPowered ? 'bg-cyan-400' : 'bg-amber-400'} animate-pulse`} />
          <span className="text-[0.6rem] font-mono tracking-wider text-slate-400 uppercase">
            {aiPowered ? 'AI ONLINE' : 'DEMO'}
          </span>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/50" />

        {/* Feeds status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Radio className="w-3 h-3 text-cyan-400/60" />
          <span className="text-[0.6rem] font-mono tracking-wider text-slate-500">
            {MOCK_BREAKING_NEWS.length} FEEDS
          </span>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/50" />

        {/* Intel count */}
        {articleCount > 0 && (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <Activity className="w-3 h-3 text-cyan-400/60" />
              <span className="text-[0.6rem] font-mono tracking-wider text-cyan-400">
                {articleCount} INTEL
              </span>
            </div>
            <div className="w-[1px] h-4 bg-slate-700/50" />
          </>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <Cpu className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="text-[0.6rem] font-mono tracking-wider text-amber-400">
                PROCESSING
              </span>
            </div>
            <div className="w-[1px] h-4 bg-slate-700/50" />
          </>
        )}

        {/* News ticker */}
        <div className="flex-1 overflow-hidden relative mx-2">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10" />
          <div
            ref={tickerRef}
            className="whitespace-nowrap text-[0.6rem] font-mono tracking-wider text-slate-500"
            style={{ transform: `translateX(${tickerOffset}px)` }}
          >
            {tickerText}
            {'     '}
            {tickerText}
          </div>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/50" />

        {/* Connection status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Wifi className="w-3 h-3 text-emerald-400/60" />
          <span className="text-[0.6rem] font-mono tracking-wider text-emerald-400/60">
            SECURE
          </span>
        </div>

        <div className="w-[1px] h-4 bg-slate-700/50" />

        {/* Clock */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-[0.6rem] font-mono tracking-wider text-slate-400 tabular-nums">
            {currentTime}
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
