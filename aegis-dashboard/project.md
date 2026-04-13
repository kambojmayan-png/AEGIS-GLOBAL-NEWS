# Project: Aegis Global News AI Dashboard
**Status:** Initial Scaffolding Phase
**Stack:** Next.js 15+, Tailwind CSS, Globe.gl, Gemini 1.5 Flash SDK, Framer Motion

## 🎯 Executive Summary
Build a premium, high-fidelity news intelligence dashboard centered around an interactive 3D globe. The app allows users to "touch the world" to receive AI-summarized, verified, and cross-referenced news updates.

## 🛠️ Technical Requirements

### 1. The Interactive 3D Globe
- **Library:** `react-globe.gl`
- **Visuals:** Dark-mode aesthetic with a "Bloom" glow effect.
- **Interactivity:** - OnClick: Extract ISO country code and trigger `fetchNews(country)`.
    - OnHover: Subtle polygon highlighting of country borders.
    - Data Layer: Heatmap or "Rings" on coordinates where major news is breaking.

### 2. The Intelligence Engine (AI & API)
- **News Source:** Use GNews API (or NewsAPI) to fetch top headlines by country.
- **AI Agent (Gemini SDK):** Process every article through a prompt to return JSON:
    - `summary`: 2-sentence executive TL;DR.
    - `genre`: Specific (e.g., "DeepTech Regulation", "Sovereign Debt").
    - `reliability_score`: (0-100) based on source authority and linguistic bias.
    - `sentiment`: Numeric (-1 to 1) for UI color-coding.

### 3. UI/UX: "The Command Center"
- **Design System:** Cyber-minimalism. Use `slate-950` backgrounds with `cyan-400` and `amber-500` accents.
- **Side Panel:** Glassmorphism overlay that slides in with article details.
- **Truth Meter:** A radial gauge showing the reliability score.

## 🧪 [ADVANCED FEATURES] Added Logic
- **The Geopolitical Ripple:** When a major story is selected, the AI should identify 2 neighboring countries affected. Draw faint 3D arcs on the globe from the source to the "ripple" locations.
- **The Media Echo:** For every story, provide a "Counter-Perspective" toggle that finds how a different global region is reporting the same event.
- **Sentiment Atmosphere:** The globe’s ambient light should shift color based on the average sentiment of the current view (e.g., subtle red for global tension, blue for stability).

## 🚀 Step-by-Step Implementation Plan for Antigravity Agent
1. **Scaffold:** Initialize a Next.js app with Tailwind and Lucide-react.
2. **Components:** Create `GlobeView.tsx` and `NewsSidebar.tsx`.
3. **Services:** Set up an API route `/api/analyze` that handles the Gemini summarization and scoring logic.
4. **Integration:** Hook the Globe clicks to the News API and feed results into the AI pipeline.
5. **Polishing:** Add Framer Motion transitions and "Pulse" animations for high-reliability sources.