'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, ChevronDown, ChevronUp, Clock,
  FileText, CheckCircle2, AlertTriangle, ShieldOff,
  Cpu, Zap, Globe
} from 'lucide-react';
import { AnalyzedArticle } from '@/types';
import TruthMeter from './TruthMeter';

interface RippleCountry {
  code: string;
  name: string;
  impact: number;
  description: string;
}

interface ArticleCardProps {
  article: AnalyzedArticle;
  index: number;
  selectedCountry: string;
}

export default function ArticleCard({ article, index, selectedCountry }: ArticleCardProps) {
  const [expanded, setExpanded]           = useState(false);
  const [summaryData, setSummaryData]     = useState<{ summary: string; provider: string; model: string } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary]     = useState(false);

  // Ripple effect state
  const [rippleData, setRippleData]       = useState<RippleCountry[] | null>(null);
  const [loadingRipple, setLoadingRipple] = useState(false);
  const [showRipple, setShowRipple]       = useState(false);

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
    if (s > 0.3)  return '#10b981';
    if (s > 0)    return '#22d3ee';
    if (s > -0.3) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentLabel = (s: number) => {
    if (s > 0.3)  return 'Positive';
    if (s > 0)    return 'Lean Positive';
    if (s > -0.3) return 'Lean Negative';
    return 'Negative';
  };

  const formatTime = (dateStr: string) => {
    try {
      const diff  = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / 3600000);
      if (hours < 1)  return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch { return 'Unknown'; }
  };

  // ─── Confidence / Reliability display helpers ─────────────────────────────
  // Only show a meaningful score when the article has been AI-analysed.
  // A default score of 55 with no AI backing is misleading — show N/A instead.
  const hasAiScore    = article._aiValidated === true;
  const score         = article.reliability_score ?? 0;
  const reliabColor   = score >= 80 ? '#22d3ee' : score >= 60 ? '#f59e0b' : '#ef4444';
  const isHighRel     = hasAiScore && score >= 80;

  // Sentiment is only meaningful when AI-analysed
  const hasSentiment  = hasAiScore && typeof article.sentiment === 'number';

  // ─── Summarizar (on-demand AI summary) ───────────────────────────────────
  const fetchSummary = async () => {
    if (summaryData) { setShowSummary(!showSummary); return; }
    setLoadingSummary(true);
    setShowSummary(true);
    try {
      const res = await fetch('/api/article-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       article.title,
          description: article.description,
          content:     article.content,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSummaryData(data);
    } catch {
      setSummaryData({ summary: 'Failed to generate summary. Please try again later.', provider: 'Error', model: 'unknown' });
    } finally {
      setLoadingSummary(false);
    }
  };

  // ─── Ripple Effect (AI-powered geo-impact) ────────────────────────────────
  const fetchRipple = async () => {
    if (rippleData) { setShowRipple(!showRipple); return; }
    setLoadingRipple(true);
    setShowRipple(true);
    try {
      const res = await fetch('/api/ripple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       article.title,
          summary:     article.summary || article.description,
          countryCode: selectedCountry,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRippleData(data.ripples ?? []);
    } catch {
      setRippleData([]);
    } finally {
      setLoadingRipple(false);
    }
  };

  const veracity = getVeracityConfig(article.veracity);

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
      {/* Left sentiment bar — only colour-coded when AI-analysed */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{
          background: hasSentiment
            ? getSentimentColor(article.sentiment)
            : 'rgba(51,65,85,0.5)',
        }}
      />

      <div className="p-4 pl-5">
        {/* ── Top row: meta + TruthMeter ─────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Tags row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="genre-tag">{article.genre}</span>

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

          {/* TruthMeter — only meaningful with AI data */}
          <div className="shrink-0">
            {hasAiScore ? (
              <TruthMeter score={score} size={56} showLabel={false} />
            ) : (
              <div className="w-14 h-14 flex flex-col items-center justify-center rounded-full border border-slate-700/40 bg-slate-800/30">
                <span className="text-[0.55rem] font-mono text-slate-600">N/A</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Summary text ────────────────────────────────────────────────── */}
        <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-3">
          {article.summary || article.description}
        </p>

        {/* ── Confidence + Sentiment row ──────────────────────────────────── */}
        <div className="flex items-center gap-3 mt-2">
          {/* Confidence score — only show real number when AI-analysed */}
          <div className="flex items-center gap-1.5">
            <span className="text-[0.6rem] font-mono text-slate-600">CONFIDENCE</span>
            {hasAiScore ? (
              <span className="text-[0.6rem] font-mono font-bold" style={{ color: reliabColor }}>
                {score}%
              </span>
            ) : (
              <span className="text-[0.6rem] font-mono text-slate-600">—</span>
            )}
          </div>

          {/* Sentiment — only show when AI-analysed */}
          {hasSentiment ? (
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: getSentimentColor(article.sentiment) }}
              />
              <span className="text-[0.6rem] font-mono" style={{ color: getSentimentColor(article.sentiment) }}>
                {getSentimentLabel(article.sentiment)}
              </span>
            </div>
          ) : (
            <span className="text-[0.6rem] font-mono text-slate-700">Sentiment: —</span>
          )}

          {/* AI validated micro-badge */}
          {hasAiScore && (
            <span className="flex items-center gap-1 ml-auto text-[0.55rem] font-mono text-violet-400/70 bg-violet-400/8 px-1.5 py-0.5 rounded border border-violet-400/15">
              <Cpu className="w-2.5 h-2.5" />
              AI VERIFIED
            </span>
          )}
        </div>

        {/* ── Actions bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            {/* Summarizar */}
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

            {/* Ripple Effect */}
            <button
              onClick={fetchRipple}
              disabled={loadingRipple}
              className={`btn-cyber flex items-center gap-1.5 text-[0.65rem] ${
                rippleData ? 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' : ''
              }`}
              title="Analyse global ripple effects"
            >
              {loadingRipple ? (
                <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">
                {loadingRipple ? 'Analysing...' : 'Ripple'}
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

        {/* ── Ripple Effect panel ──────────────────────────────────────────── */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[0.62rem] font-bold text-cyan-400 tracking-widest uppercase">
                    Global Ripple Effect
                  </span>
                  <button
                    onClick={() => setShowRipple(false)}
                    className="ml-auto text-[0.55rem] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {loadingRipple ? (
                  <div className="flex items-center gap-2.5 text-xs text-cyan-400/60 py-1">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                    <span className="font-mono tracking-wider text-[0.65rem]">
                      AI is analysing global impact...
                    </span>
                  </div>
                ) : rippleData && rippleData.length > 0 ? (
                  <div className="space-y-2.5">
                    {rippleData.map((r) => (
                      <div key={r.code} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-mono font-semibold text-slate-200">
                            {r.name}
                          </span>
                          <span className="text-[0.6rem] font-mono" style={{ color: r.impact > 0.6 ? '#ef4444' : r.impact > 0.3 ? '#f59e0b' : '#22d3ee' }}>
                            {Math.round(r.impact * 100)}% impact
                          </span>
                        </div>
                        {/* Impact bar */}
                        <div className="h-1 w-full rounded-full bg-slate-700/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${r.impact * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              background: r.impact > 0.6
                                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                : r.impact > 0.3
                                ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                                : 'linear-gradient(90deg, #22d3ee, #06b6d4)',
                            }}
                          />
                        </div>
                        <p className="text-[0.6rem] text-slate-500 leading-snug">
                          {r.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.65rem] text-slate-500 py-1">
                    No significant ripple effects predicted for this article.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Expanded details panel ───────────────────────────────────────── */}
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
                {article.description && article.description !== article.summary && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {article.description}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-[0.62rem] font-mono text-slate-500">
                    <span>
                      Reliability:{' '}
                      {hasAiScore
                        ? <span style={{ color: reliabColor }}>{score}/100</span>
                        : <span className="text-slate-600">N/A (no AI analysis)</span>
                      }
                    </span>
                    <span>
                      Sentiment:{' '}
                      {hasSentiment
                        ? <span style={{ color: getSentimentColor(article.sentiment) }}>{article.sentiment.toFixed(2)}</span>
                        : <span className="text-slate-600">N/A</span>
                      }
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[0.58rem] font-mono tracking-wider border ${
                    hasAiScore
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700/40'
                  }`}>
                    {hasAiScore ? (
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

        {/* ── AI Summary panel ────────────────────────────────────────────── */}
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
