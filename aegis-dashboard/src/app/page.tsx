'use client';

import { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import GlobeView from '@/components/GlobeView';
import NewsSidebar from '@/components/NewsSidebar';
import BootSequence from '@/components/BootSequence';
import BottomStatusBar from '@/components/BottomStatusBar';
import SearchOverlay from '@/components/SearchOverlay';
import TrendingPanel from '@/components/TrendingPanel';
import HUD from '@/components/HUD';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyzedArticle } from '@/types';
import { type TopicFilter, TOPIC_TO_API } from '@/components/NewsSidebar';

interface FilterInfo {
  fetched: number;
  scored: number;
  aiValidated: boolean;
  threshold: number;
  fallback: boolean;
  message: string;
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [articles, setArticles] = useState<AnalyzedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [booted, setBooted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterInfo, setFilterInfo] = useState<FilterInfo | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicFilter>('all');

  const averageSentiment =
    articles.length > 0
      ? articles.reduce((sum, a) => sum + a.sentiment, 0) / articles.length
      : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      if (!booted) {
        setBooted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [booted]);

  const fetchNews = async (countryCode: string, stateName?: string | null, topic?: TopicFilter) => {
    setIsLoading(true);
    setFilterInfo(null);
    try {
      let url = `/api/news?country=${countryCode}`;
      if (stateName) url += `&state=${encodeURIComponent(stateName)}`;
      const apiCategory = topic ? TOPIC_TO_API[topic] : null;
      if (apiCategory) url += `&category=${apiCategory}`;

      const newsRes = await fetch(url);
      const newsData = await newsRes.json();

      // Store filter metadata for UI feedback
      if (newsData.filterInfo) setFilterInfo(newsData.filterInfo);

      if (!newsData.articles || newsData.articles.length === 0) {
        setArticles([]);
        setAiPowered(false);
        return;
      }

      if (newsData.source === 'mock') {
        // Mock articles are pre-analyzed — show them directly
        setArticles(newsData.articles);
        setAiPowered(false);
      } else {
        // Live articles — run through AI analysis
        try {
          const analyzeRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articles: newsData.articles }),
          });
          const analyzeData = await analyzeRes.json();
          setArticles(analyzeData.articles || newsData.articles);
          setAiPowered(analyzeData.aiPowered || false);
        } catch {
          // Analyze failed — show raw articles anyway
          setArticles(newsData.articles);
          setAiPowered(false);
        }
      }

    } catch (error) {
      console.error('Error fetching news:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryClick = useCallback(async (countryCode: string, countryName: string) => {
    setSelectedCountry(countryCode);
    setSelectedCountryName(countryName);
    setSelectedState(null);
    setSidebarOpen(true);
    setActiveTopic('all');
    await fetchNews(countryCode, null, 'all');
  }, []);

  const handleStateClick = useCallback(async (stateName: string, countryCode: string, countryName: string) => {
    setSelectedCountry(countryCode);
    setSelectedCountryName(countryName);
    setSelectedState(stateName);
    setSidebarOpen(true);

    await fetchNews(countryCode, stateName);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const handleSearchSelectCountry = useCallback(
    (countryCode: string, countryName: string) => {
      handleCountryClick(countryCode, countryName);
    },
    [handleCountryClick]
  );

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleSidebarCountryChange = useCallback((code: string, name: string) => {
    handleCountryClick(code.toUpperCase(), name);
  }, [handleCountryClick]);

  const handleSidebarStateChange = useCallback((state: string) => {
    if (!selectedCountry) return;
    if (!state) {
      handleCountryClick(selectedCountry, selectedCountryName);
    } else {
      handleStateClick(state, selectedCountry, selectedCountryName);
    }
  }, [selectedCountry, selectedCountryName, handleCountryClick, handleStateClick]);

  const handleTopicChange = useCallback(async (topic: TopicFilter) => {
    setActiveTopic(topic);
    if (!selectedCountry) return;
    await fetchNews(selectedCountry, selectedState, topic);
  }, [selectedCountry, selectedState]);

  const locationDisplayName = selectedState ? `${selectedState}, ${selectedCountryName}` : selectedCountryName;

  return (
    <>
      {/* Boot Sequence */}
      {!booted && <BootSequence onComplete={handleBootComplete} />}

      <main className="relative w-full h-screen bg-[#020617] cyber-grid overflow-hidden">
        {/* Header */}
        <Header
          averageSentiment={averageSentiment}
          isLoading={isLoading}
          selectedCountry={locationDisplayName || null}
          articleCount={articles.length}
          aiPowered={aiPowered}
          onSearchOpen={handleOpenSearch}
        />

        {/* Globe takes full screen */}
        <div className="absolute inset-0">
          <GlobeView
            onCountryClick={handleCountryClick}
            onStateClick={handleStateClick}
            averageSentiment={averageSentiment}
            selectedCountry={selectedCountry}
          />
        </div>

        {/* HUD Overlay */}
        <HUD
          selectedCountry={selectedCountry}
          selectedCountryName={locationDisplayName}
          isLoading={isLoading}
          articleCount={articles.length}
          averageSentiment={averageSentiment}
        />

        {/* News Sidebar */}
        <NewsSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          countryName={locationDisplayName}
          countryCode={selectedCountry || ''}
          selectedState={selectedState}
          articles={articles}
          isLoading={isLoading}
          aiPowered={aiPowered}
          onCountryChange={handleSidebarCountryChange}
          onStateChange={handleSidebarStateChange}
          filterInfo={filterInfo}
          activeTopic={activeTopic}
          onTopicChange={handleTopicChange}
        />

        {/* Trending Panel (left side) */}
        <TrendingPanel
          selectedCountry={selectedCountry}
          selectedCountryName={selectedCountryName}
          selectedState={selectedState}
          articles={articles}
        />

        {/* Search Overlay */}
        <SearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectCountry={handleSearchSelectCountry}
        />

        {/* Bottom Status Bar */}
        <BottomStatusBar
          aiPowered={aiPowered}
          isLoading={isLoading}
          articleCount={articles.length}
        />

        {/* Reopen sidebar button — visible when sidebar is closed but a country is selected */}
        <AnimatePresence>
          {selectedCountry && !sidebarOpen && articles.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={() => setSidebarOpen(true)}
              className="absolute bottom-16 right-4 z-30 flex items-center gap-2.5 px-4 py-3 rounded-xl glass border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all shadow-lg shadow-black/40 group"
              title={`Reopen ${selectedCountryName} news panel`}
            >
              <div className="relative">
                <span className="text-lg">📰</span>
                {/* Pulsing dot to draw attention */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400">
                  <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-60" />
                </span>
              </div>
              <div className="text-left">
                <p className="text-[0.65rem] font-mono text-slate-500 tracking-wider uppercase">News Panel</p>
                <p className="text-xs font-bold text-cyan-100 tracking-wide">{selectedCountryName}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-400 transition-colors ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        {!selectedCountry && booted && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none z-20">
            <div className="flex items-center gap-2 text-[0.65rem] font-mono text-slate-600">
              <span className="px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/30 text-slate-500">
                Ctrl+K
              </span>
              <span>to search countries</span>
            </div>
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none opacity-30 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30 rotate-90 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none opacity-30 -rotate-90 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-30 rotate-180 z-10">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L30 0 L30 2 L2 2 L2 30 L0 30 Z" fill="#22d3ee" opacity="0.5" />
          </svg>
        </div>
      </main>
    </>
  );
}
