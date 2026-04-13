'use client';

import { motion } from 'framer-motion';

interface TruthMeterProps {
  score: number; // 0-100
  size?: number;
  showLabel?: boolean;
}

export default function TruthMeter({ score, size = 100, showLabel = true }: TruthMeterProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only use 75% of the circle (270 degrees)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  const getColor = (s: number) => {
    if (s >= 67) return '#22d3ee'; // cyan
    if (s >= 34) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Highly Reliable';
    if (s >= 67) return 'Reliable';
    if (s >= 50) return 'Moderate';
    if (s >= 34) return 'Questionable';
    return 'Unreliable';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[135deg]"
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={6}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="truth-meter-arc"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="font-mono font-bold"
            style={{ color, fontSize: size * 0.28 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {getLabel(score)}
        </motion.span>
      )}
    </div>
  );
}
