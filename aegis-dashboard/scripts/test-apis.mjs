/**
 * Standalone API diagnostic — tests NewsAPI + Groq directly (no server needed)
 * Run: node scripts/test-apis.mjs
 */

const NEWS_KEY  = 'c4922b3729414956a71cd91f3c68b246';
const GROQ_KEY  = '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';

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║        AEGIS API Diagnostic Tool             ║');
console.log('║   NewsAPI + Groq Llama 3.3 70B              ║');
console.log('╚══════════════════════════════════════════════╝\n');

// ── TEST 1: NewsAPI ───────────────────────────────────────────────────────────
console.log('📡 [1/2] Testing NewsAPI (top-headlines India)...');
try {
  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?country=in&pageSize=3&apiKey=${NEWS_KEY}`
  );
  const data = await res.json();

  if (res.ok && data.status === 'ok') {
    console.log(`  ✅ WORKING — ${data.totalResults} total results`);
    console.log(`  📰 Sample: "${data.articles?.[0]?.title?.slice(0, 75)}..."`);
    console.log(`  🏢 Source: ${data.articles?.[0]?.source?.name}`);
  } else {
    console.log(`  ❌ FAILED — HTTP ${res.status}`);
    console.log(`  💬 Error: ${data.message || data.code}`);
    if (res.status === 426) console.log('  💡 Fix: Free dev keys only work on localhost, not deployed');
    if (res.status === 401) console.log('  💡 Fix: Invalid key — check newsapi.org');
    if (res.status === 429) console.log('  💡 Fix: 100 req/day limit hit — wait until tomorrow');
  }
} catch (e) {
  console.log(`  ❌ NETWORK ERROR: ${e.message}`);
}

console.log('');

// ── TEST 2: Groq Llama 3.3 70B ───────────────────────────────────────────────
console.log('🤖 [2/2] Testing Groq (llama-3.3-70b-versatile)...');
try {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 15,
      messages: [{ role: 'user', content: 'Reply with exactly: AEGIS_GROQ_OK' }],
    }),
  });

  const data = await res.json();

  if (res.ok && data.choices?.[0]?.message?.content) {
    const reply = data.choices[0].message.content.trim();
    console.log(`  ✅ WORKING`);
    console.log(`  🦙 Model: llama-3.3-70b-versatile`);
    console.log(`  💬 Response: "${reply}"`);
    console.log(`  📊 Tokens used: ${data.usage?.total_tokens ?? 'N/A'}`);
  } else {
    const errMsg = data?.error?.message || JSON.stringify(data?.error ?? data);
    console.log(`  ❌ FAILED — HTTP ${res.status}`);
    console.log(`  💬 Error: ${errMsg}`);
    if (res.status === 401) console.log('  💡 Fix: Invalid Groq key — get one at console.groq.com');
    if (res.status === 429) console.log('  💡 Fix: Rate limit (30 RPM) — wait 1 minute');
    if (res.status === 404) console.log('  💡 Fix: Model name invalid');
  }
} catch (e) {
  console.log(`  ❌ NETWORK ERROR: ${e.message}`);
}

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  Test complete. Start server: npm run dev    ║');
console.log('║  Then open: http://localhost:3000/api/debug  ║');
console.log('╚══════════════════════════════════════════════╝\n');
