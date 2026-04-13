# 📰 News API Integration Guide
### For: Antigravity Agent | Stack: React / Next.js | AI: Groq + Llama 3.3 70B (Free)

---

## 🔑 Credentials & Keys

| Service | Key |
|---------|-----|
| NewsAPI | `c4922b3729414956a71cd91f3c68b246` |
| Groq API (Llama 3.3 70B) | `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` |

> ⚠️ **Security:** Store all keys in `.env.local` — never hardcode or commit to Git.

---

## 📊 Groq Free Tier Limits

| Model | Requests/min | Requests/day | Tokens/min |
|-------|-------------|--------------|------------|
| `llama-3.3-70b-versatile` | 30 | 1,000 | 131,072 |
| `llama-3.1-8b-instant` | 30 | 14,400 | 131,072 |
| `mixtral-8x7b-32768` | 30 | 14,400 | 5,000 |

> ✅ Use **`llama-3.3-70b-versatile`** — smartest model, 30 RPM, perfect for news summarization.

---

## 📁 Project Structure to Create

```
your-nextjs-app/
├── .env.local                  ← API keys (never commit this)
├── .gitignore                  ← must include .env.local
├── pages/
│   ├── index.js                ← Main page with country/state selector
│   └── api/
│       ├── news.js             ← Proxy route for NewsAPI
│       └── summarize.js        ← Groq AI summarization route
└── components/
    ├── NewsFeed.jsx            ← Displays news articles
    ├── CountrySelector.jsx     ← Country dropdown
    └── StateSelector.jsx       ← State dropdown (filtered by country)
```

---

## 🛠️ Step 1: Environment Variables

Create `.env.local` in the project root:

```env
# NewsAPI — server-side only
NEWS_API_KEY=c4922b3729414956a71cd91f3c68b246

# Groq API — server-side only
GROQ_API_KEY=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
```

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## 🛠️ Step 2: Install Groq SDK

```bash
npm install groq-sdk
```

---

## 🛠️ Step 3: News API Route

**File:** `pages/api/news.js`

```js
// In-memory cache to manage NewsAPI free tier (100 req/day)
const cache = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
  const { country = 'in', state = '', category = '' } = req.query;
  const apiKey = process.env.NEWS_API_KEY;

  const cacheKey = `${country}-${state}-${category}`;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.status(200).json(cached.data);
  }

  let url = '';
  if (state) {
    // State-level: query by state name
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(state)}&sortBy=popularity&language=en&apiKey=${apiKey}`;
  } else {
    // Country-level: top headlines
    url = `https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${apiKey}`;
    if (category) url += `&category=${category}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    cache[cacheKey] = { data, timestamp: Date.now() };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
```

---

## 🤖 Step 4: Groq AI Summarization Route

**File:** `pages/api/summarize.js`

```js
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { articles, region } = req.body;

  const headlines = articles
    .slice(0, 10)
    .map((a, i) => `${i + 1}. ${a.title}`)
    .join('\n');

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional news digest assistant. Summarize news headlines clearly and concisely.',
        },
        {
          role: 'user',
          content: `Given these trending headlines from ${region}, provide:
1. A 2-sentence overall summary of what is trending
2. Top 3 key themes or topics with a one-line explanation each

Headlines:
${headlines}

Respond in clean, readable format.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const summary = completion.choices[0]?.message?.content || '';
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Groq error:', error);
    res.status(500).json({ error: 'AI summarization failed' });
  }
}
```

---

## ⚛️ Step 5: NewsFeed Component

**File:** `components/NewsFeed.jsx`

```jsx
import { useEffect, useState } from 'react';

export default function NewsFeed({ country = 'in', state = '' }) {
  const [articles, setArticles] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setSummary('');

      const url = state
        ? `/api/news?state=${encodeURIComponent(state)}`
        : `/api/news?country=${country}`;

      const res = await fetch(url);
      const data = await res.json();
      const fetchedArticles = data.articles || [];
      setArticles(fetchedArticles);
      setLoading(false);

      if (fetchedArticles.length > 0) {
        setSummarizing(true);
        const sumRes = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: fetchedArticles,
            region: state || country.toUpperCase(),
          }),
        });
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
        setSummarizing(false);
      }
    };

    fetchNews();
  }, [country, state]);

  return (
    <div>
      {/* Groq AI Digest Box */}
      <div className="ai-summary-box">
        <h2>⚡ Llama 3.3 AI Digest — {state || country.toUpperCase()}</h2>
        {summarizing && <p>🤖 Generating AI summary with Groq...</p>}
        {summary && <p style={{ whiteSpace: 'pre-line' }}>{summary}</p>}
      </div>

      {loading && <p>Loading news...</p>}
      <div className="articles-grid">
        {articles.map((article, i) => (
          <div key={i} className="article-card">
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} width="100%" />
            )}
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <small>
              {article.source?.name} ·{' '}
              {new Date(article.publishedAt).toLocaleDateString()}
            </small>
            <br />
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read full article →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🌍 Step 6: Country & State Selectors

**File:** `components/CountrySelector.jsx`

```jsx
const COUNTRIES = [
  { code: 'in', name: '🇮🇳 India' },
  { code: 'us', name: '🇺🇸 USA' },
  { code: 'gb', name: '🇬🇧 UK' },
  { code: 'au', name: '🇦🇺 Australia' },
  { code: 'ca', name: '🇨🇦 Canada' },
  { code: 'de', name: '🇩🇪 Germany' },
  { code: 'fr', name: '🇫🇷 France' },
];

export default function CountrySelector({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}
```

**File:** `components/StateSelector.jsx`

```jsx
const STATES_BY_COUNTRY = {
  in: [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
    'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal',
  ],
  us: [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado',
    'Connecticut','Florida','Georgia','Hawaii','Illinois','Indiana',
    'Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
    'Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
    'Montana','Nebraska','Nevada','New Jersey','New Mexico','New York',
    'North Carolina','Ohio','Oklahoma','Oregon','Pennsylvania',
    'Tennessee','Texas','Utah','Virginia','Washington','Wisconsin',
  ],
};

export default function StateSelector({ country, value, onChange }) {
  const states = STATES_BY_COUNTRY[country] || [];
  if (!states.length) return null;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- All {country.toUpperCase()} (National) --</option>
      {states.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
```

---

## 🏠 Step 7: Main Page

**File:** `pages/index.js`

```jsx
import { useState } from 'react';
import NewsFeed from '../components/NewsFeed';
import CountrySelector from '../components/CountrySelector';
import StateSelector from '../components/StateSelector';

export default function Home() {
  const [country, setCountry] = useState('in');
  const [state, setState] = useState('');

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setState('');
  };

  return (
    <main>
      <h1>📰 Trending News</h1>
      <div className="selectors">
        <CountrySelector value={country} onChange={handleCountryChange} />
        <StateSelector country={country} value={state} onChange={setState} />
      </div>
      <NewsFeed country={country} state={state} />
    </main>
  );
}
```

---

## 🚀 Step 8: Deploy on Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your project
3. Add these under **Project Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEWS_API_KEY` | `c4922b3729414956a71cd91f3c68b246` |
| `GROQ_API_KEY` | `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` |

4. Click Deploy ✅

---

## ✅ Integration Checklist

- [ ] `.env.local` created with `NEWS_API_KEY` and `GROQ_API_KEY`
- [ ] `.env.local` added to `.gitignore`
- [ ] `npm install groq-sdk` run successfully
- [ ] `pages/api/news.js` created with 15-min caching
- [ ] `pages/api/summarize.js` created with Groq Llama 3.3
- [ ] `NewsFeed.jsx` component created
- [ ] `CountrySelector.jsx` and `StateSelector.jsx` created
- [ ] `pages/index.js` wired up
- [ ] Env vars added to Vercel dashboard for production
- [ ] Groq API key regenerated after being shared in chat

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| `CORS error on NewsAPI` | Always call via `/api/news` — never direct from browser |
| `Groq 429 Too Many Requests` | Hit 30 RPM limit — caching handles most of this |
| `Cannot find module groq-sdk` | Run `npm install groq-sdk` |
| `Groq API key invalid` | Verify key at [console.groq.com](https://console.groq.com) |
| `articles is undefined` | Log `data` from NewsAPI to check error message |
| `No news for state` | Use broader query e.g. `Punjab India` instead of just `Punjab` |

---

*Generated for Antigravity Agent — Next.js + NewsAPI + Groq Llama 3.3 70B (Absolutely Free)*