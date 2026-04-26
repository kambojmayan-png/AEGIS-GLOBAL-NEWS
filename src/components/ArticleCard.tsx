'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, ChevronDown, ChevronUp, Clock,
  FileText, CheckCircle2, AlertTriangle, ShieldOff,
  Cpu
} from 'lucide-react';
import { AnalyzedArticle } from '@/types';
import TruthMeter from './TruthMeter';

interface ArticleCardProps {
  article: AnalyzedArticle;
  index: number;
  selectedCountry: string;
}

export default function ArticleCard({ article, index, selectedCountry }: ArticleCardProps) {
  const [expanded, setExpanded]         = useState(false);
  const [summaryData, setSummaryData]   = useState<{ summary: string; provider: string; model: string } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary]   = useState(false);

  // ─── Veracity helpers ────────────────────────────────────────────────────
  const getVeracityConfig = (v?: string) => {
    switch (v) {
      case 'VERIFIED':
        return {
          label: '✅ Verified',
          icon: <CheckCircle2 className="w-3 h-3" />,
          className: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
          dotColor: '#10b981',
        };
      case 'SENSATIONALIST':
        return {
          label: '⚠️ Sensationalist',
          icon: <AlertTriangle className="w-3 h-3" />,
          className: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
          dotColor: '#ef4444',
        };
      case 'UNVERIFIED':
      default:
        return {
          label: '❓ Unverified',
          icon: <ShieldOff className="w-3 h-3" />,
          className: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
          dotColor: '#f59e0b',
        };
    }
  };

  const getSentimentColor = (s: number) => {
    if (s > 0.3) return '#10b981';
    if (s > 0) return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentLabel = (s: number) => {
    if (s > 0.3) return 'Positive';
    if (s > 0) return 'Lean Positive';
    if (s > -0.3) return 'Lean Negative';
    return 'Negative';
  };

  const formatTime = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return 'Unknown'; }
  };

  // ─── Summarizar (on-demand AI summary) ───────────────────────────────────
  const fetchSummary = async () => {
    // Toggle off if already loaded
    if (summaryData) { setShowSummary(!showSummary); return; }

    setLoadingSummary(true);
    setShowSummary(true);
    try {
      const res = await fetch('/api/article-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.content,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSummaryData(data);
    } catch {
      setSummaryData({
        summary: 'Failed to generate summary. Please try again later.',
        provider: 'Error',
        model: 'unknown',
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const veracity    = getVeracityConfig(article.veracity);
  const isHighRel   = article.reliability_score >= 80;
  const reliabColor = article.reliability_score >= 80 ? '#22d3ee'
                    : article.reliability_score >= 60 ? '#f59e0b'
                    : '#ef4444';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.07, 0.5) }}
      className={`relative rounded-xl glass overflow-hidden border border-slate-800/60
        transition-all duration-300 hover:border-cyan-400/25 hover:shadow-lg
        hover:shadow-cyan-400/5 ${isHighRel ? 'glow-box-cyan' : ''}`}
    >
      {/* Left sentiment bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: getSentimentColor(article.sentiment) }}
      />

      <div className="p-4 pl-5">
        {/* ── Top row: meta + TruthMeter ────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Tags row: genre · veracity · time */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="genre-tag">{article.genre}</span>

              {/* Veracity badge — prominent with icon */}
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[0.6rem] font-mono font-semibold tracking-wider ${veracity.className}`}>
                {veracity.icon}
                {veracity.label}
              </span>

              <span className="flex items-center gap-1 text-[0.62rem] text-slate-500 ml-auto">
                <Clock className="w-3 h-3" />
                {formatTime(article.publishedAt)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-1.5 line-clamp-2">
              {article.title}
            </h3>

            {/* Source */}
            <p className="text-[0.65rem] text-slate-500 font-mono tracking-wide">
              {article.source.name}
            </p>
          </div>

          {/* TruthMeter — reliability score dial */}
          <div className="shrink-0">
            <TruthMeter score={article.reliability_score} size={56} showLabel={false} />
          </div>
        </div>

        {/* ── Summary text ──────────────────────────────────────────────── */}
        <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-3">
          {article.summary || article.description}
        </p>

        {/* ── Confidence + reliability inline ───────────────────────────── */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.6rem] font-mono text-slate-600">CONFIDENCE</span>
            <span className="text-[0.6rem] font-mono font-bold" style={{ color: reliabColor }}>
              {article.reliability_score}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: getSentimentColor(article.sentiment) }}
            />
            <span className="text-[0.6rem] font-mono" style={{ color: getSentimentColor(article.sentiment) }}>
              {getSentimentLabel(article.sentiment)}
            </span>
          </div>

          {/* AI validated micro-badge */}
          {article._aiValidated && (
            <span className="flex items-center gap-1 ml-auto text-[0.55rem] font-mono text-violet-400/70 bg-violet-400/8 px-1.5 py-0.5 rounded border border-violet-400/15">
              <Cpu className="w-2.5 h-2.5" />
              AI VERIFIED
            </span>
          )}
        </div>

        {/* ── Actions bar ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            {/* Summarizar — on-demand AI summary */}
            <button
              onClick={fetchSummary}
              disabled={loadingSummary}
              className={`btn-cyber flex items-center gap-1.5 text-[0.65rem] ${
                summaryData ? 'text-violet-400 border-violet-400/40 bg-violet-400/10' : ''
              }`}
              title="Generate AI Summary (Groq)"
            >
              {loadingSummary ? (
                <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : summaryData ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {loadingSummary ? 'Summarizing...' : summaryData ? 'Summarized' : 'Summarizar'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand details */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-cyber p-1.5"
              title={expanded ? 'Collapse' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Open source article */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber p-1.5"
              title="Read full article"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ── Expanded details panel ─────────────────────────────────────── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-800/40 space-y-3">
                {/* Full description */}
                {article.description && article.description !== article.summary && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {article.description}
                  </p>
                )}

                {/* Stats + AI model attribution */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-[0.62rem] font-mono text-slate-500">
                    <span>Reliability: <span style={{ color: reliabColor }}>{article.reliability_score}/100</span></span>
                    <span>Sentiment: <span style={{ color: getSentimentColor(article.sentiment) }}>{article.sentiment.toFixed(2)}</span></span>
                  </div>

                  {/* Groq AI verification badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[0.58rem] font-mono tracking-wider border ${
                    article._aiValidated
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700/40'
                  }`}>
                    {article._aiValidated ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified using Groq AI — Llama 3.3 70B</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-2.5 h-2.5" />
                        <span>Demo data — AI analysis unavailable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Summary panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20">
                {loadingSummary ? (
                  <div className="flex items-center gap-2.5 text-xs text-violet-400/60 py-1">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                    <span className="font-mono tracking-wider text-[0.65rem]">
                      Groq AI is generating summary...
                    </span>
                  </div>
                ) : summaryData ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[0.62rem] font-bold text-violet-400 tracking-widest uppercase">
                        AI Executive Summary
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                      {summaryData.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowSummary(false)}
                        className="text-[0.55rem] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        ✕ dismiss
                      </button>
                      <span className="text-[0.55rem] font-mono text-violet-400/50 uppercase tracking-widest bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/10">
                        {summaryData.provider === 'Groq' ? '⚡ Groq · Llama 3.3 70B' : summaryData.model}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* High-reliability pulse dot (top-right) */}
      {isHighRel && (
        <div className="absolute top-2.5 right-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
        </div>
      )}
    </motion.div>
  );
}
