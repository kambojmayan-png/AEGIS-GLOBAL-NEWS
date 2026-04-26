/**
 * Country-specific trusted news source whitelist.
 * Sources are domain names (lowercase). An article's source URL or name is
 * compared against this list for the +50 source-trust scoring bonus.
 *
 * Requirements:
 * - Only include sources that primarily publish in/about that country
 * - Include major national newspapers, broadcasters, wire agencies
 */

export interface CountrySourceProfile {
  // Primary domains — +50 score, considered "native" sources
  primary: string[];
  // Secondary domains — +25 score, reputable international sources covering this country heavily
  secondary: string[];
  // Country name variants, demonyms, capital cities used in keyword matching
  keywords: string[];
  // Languages primarily used in this country
  languages: string[];
  // NewsAPI /top-headlines country code
  newsapiCode: string;
}

export const COUNTRY_SOURCES: Record<string, CountrySourceProfile> = {
  IN: {
    newsapiCode: 'in',
    languages: ['en'],
    keywords: ['india', 'indian', 'new delhi', 'delhi', 'mumbai', 'bangalore', 'kolkata', 'chennai', 'hyderabad', 'modi', 'bjp', 'congress party', 'rupee'],
    primary: [
      'ndtv.com', 'thehindu.com', 'hindustantimes.com', 'timesofindia.indiatimes.com',
      'indianexpress.com', 'livemint.com', 'economictimes.indiatimes.com', 'business-standard.com',
      'deccanherald.com', 'telegraphindia.com', 'theprint.in', 'scroll.in', 'thewire.in',
      'firstpost.com', 'moneycontrol.com', 'news18.com', 'india.com', 'indiatvnews.com',
      'zeenews.india.com', 'abplive.com', 'aajtak.in', 'republicworld.com', 'wionews.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'aljazeera.com', 'apnews.com'],
  },

  US: {
    newsapiCode: 'us',
    languages: ['en'],
    keywords: ['united states', 'america', 'american', 'washington', 'trump', 'biden', 'harris', 'congress', 'senate', 'white house', 'pentagon', 'u.s.', 'us dollar', 'wall street', 'new york', 'california', 'texas'],
    primary: [
      'nytimes.com', 'washingtonpost.com', 'wsj.com', 'usatoday.com', 'latimes.com',
      'cnn.com', 'foxnews.com', 'nbcnews.com', 'cbsnews.com', 'abcnews.go.com',
      'apnews.com', 'politico.com', 'thehill.com', 'axios.com', 'npr.org',
      'bloomberg.com', 'businessinsider.com', 'vox.com', 'slate.com', 'theatlantic.com',
      'nypost.com', 'newsweek.com', 'time.com', 'forbes.com', 'fortune.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'theguardian.com', 'ft.com'],
  },

  GB: {
    newsapiCode: 'gb',
    languages: ['en'],
    keywords: ['britain', 'british', 'uk', 'united kingdom', 'england', 'scotland', 'wales', 'london', 'parliament', 'westminster', 'prime minister', 'nhs', 'pound sterling', 'labour', 'conservative'],
    primary: [
      'bbc.co.uk', 'bbc.com', 'theguardian.com', 'thetimes.co.uk', 'telegraph.co.uk',
      'independent.co.uk', 'ft.com', 'dailymail.co.uk', 'mirror.co.uk', 'express.co.uk',
      'metro.co.uk', 'evening standard.co.uk', 'sky.com', 'itvnews.com', 'channel4.com',
    ],
    secondary: ['reuters.com', 'apnews.com'],
  },

  RU: {
    newsapiCode: 'ru',
    languages: ['en'],
    keywords: ['russia', 'russian', 'moscow', 'kremlin', 'putin', 'fsb', 'rouble', 'ruble', 'siberia', 'st. petersburg', 'saint petersburg', 'duma', 'lavrov'],
    primary: [
      'rt.com', 'themoscowtimes.com', 'tass.com', 'interfax.com', 'kommersant.com',
      'vedomosti.ru', 'meduza.io', 'rbc.ru', 'novayagazeta.ru',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'rferl.org'],
  },

  JP: {
    newsapiCode: 'jp',
    languages: ['en'],
    keywords: ['japan', 'japanese', 'tokyo', 'osaka', 'yen', 'nikkei', 'japanese government', 'prime minister kishida', 'fumio', 'samurai', 'fujitsu', 'toyota', 'sony', 'nintendo'],
    primary: [
      'japantimes.co.jp', 'nhk.or.jp', 'asahi.com', 'mainichi.jp', 'yomiuri.co.jp',
      'nikkei.com', 'kyodonews.net', 'jiji.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  CN: {
    newsapiCode: 'cn',
    languages: ['en'],
    keywords: ['china', 'chinese', 'beijing', 'xi jinping', 'prc', 'renminbi', 'yuan', 'shanghai', 'hong kong', 'taiwan', 'cpc', 'communist party of china', 'alibaba', 'tencent', 'huawei'],
    primary: [
      'xinhuanet.com', 'chinadaily.com.cn', 'globaltimes.cn', 'cgtn.com',
      'scmp.com', 'sixthtone.com', 'caixin.com', 'cnn.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'ft.com'],
  },

  DE: {
    newsapiCode: 'de',
    languages: ['en', 'de'],
    keywords: ['germany', 'german', 'berlin', 'bundesrat', 'bundestag', 'merkel', 'scholz', 'euro', 'bundesbank', 'frankfurt', 'munich', 'hamburg', 'volkswagen', 'siemens', 'bayer'],
    primary: [
      'dw.com', 'spiegel.de', 'faz.net', 'sueddeutsche.de', 'welt.de',
      'handelsblatt.com', 'tagesschau.de', 'zeit.de',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'ft.com'],
  },

  FR: {
    newsapiCode: 'fr',
    languages: ['en', 'fr'],
    keywords: ['france', 'french', 'paris', 'macron', 'élysée', 'elysee', 'marseille', 'lyon', 'euro', 'nationa assembly', 'senate france', 'louvre', 'eiffel'],
    primary: [
      'lefigaro.fr', 'lemonde.fr', 'liberation.fr', 'rfi.fr', 'france24.com',
      'bfmtv.com', 'lexpress.fr', 'lepoint.fr',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'ft.com'],
  },

  AU: {
    newsapiCode: 'au',
    languages: ['en'],
    keywords: ['australia', 'australian', 'sydney', 'melbourne', 'canberra', 'albanese', 'asx', 'australian dollar', 'great barrier reef', 'queensland', 'new south wales'],
    primary: [
      'abc.net.au', 'smh.com.au', 'theaustralian.com.au', 'news.com.au',
      '9news.com.au', '7news.com.au', 'theage.com.au', 'afr.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  CA: {
    newsapiCode: 'ca',
    languages: ['en', 'fr'],
    keywords: ['canada', 'canadian', 'ottawa', 'toronto', 'montreal', 'trudeau', 'rcmp', 'canadian dollar', 'ontario', 'quebec', 'british columbia'],
    primary: [
      'cbc.ca', 'globalnews.ca', 'theglobeandmail.com', 'nationalpost.com',
      'torontostar.com', 'thestar.com', 'montrealgazette.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  PK: {
    newsapiCode: 'pk',
    languages: ['en', 'ur'],
    keywords: ['pakistan', 'pakistani', 'islamabad', 'karachi', 'lahore', 'imran khan', 'pti', 'nawaz', 'pakistan army', 'isi', 'rupee pakistan'],
    primary: [
      'dawn.com', 'thenews.com.pk', 'geo.tv', 'ary news', 'samaa.tv',
      'tribune.com.pk', 'brecorder.com', 'dunyanews.tv',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  UA: {
    newsapiCode: 'ua',
    languages: ['en', 'uk'],
    keywords: ['ukraine', 'ukrainian', 'kyiv', 'kiev', 'zelensky', 'zelenskyy', 'kharkiv', 'mariupol', 'odessa', 'dnipro', 'hryvnia', 'war ukraine'],
    primary: [
      'kyivindependent.com', 'ukrinform.net', 'ukrinform.ua', 'radiosvoboda.org',
      'pravda.com.ua', 'unian.info', 'interfax.com.ua',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'rferl.org'],
  },

  BR: {
    newsapiCode: 'br',
    languages: ['pt', 'en'],
    keywords: ['brazil', 'brazil', 'brasilia', 'são paulo', 'sao paulo', 'lula', 'bolsonaro', 'real brazil', 'amazon', 'petrobras', 'embraer'],
    primary: [
      'folha.uol.com.br', 'oglobo.globo.com', 'estadao.com.br', 'g1.globo.com',
      'agenciabrasil.ebc.com.br', 'valor.globo.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  KR: {
    newsapiCode: 'kr',
    languages: ['en', 'ko'],
    keywords: ['south korea', 'korean', 'seoul', 'busan', 'won korea', 'kpop', 'samsung', 'lg', 'hyundai', 'sk group', 'kospi'],
    primary: [
      'koreaherald.com', 'koreatimes.co.kr', 'yonhapnews.co.kr', 'joongangdaily.joins.com',
      'koreajoongangdaily.com', 'arirangworld.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  IL: {
    newsapiCode: 'il',
    languages: ['en', 'he'],
    keywords: ['israel', 'israeli', 'tel aviv', 'jerusalem', 'netanyahu', 'idf', 'mossad', 'knesset', 'shekel', 'gaza', 'west bank', 'hamas israel'],
    primary: [
      'haaretz.com', 'timesofisrael.com', 'jpost.com', 'ynetnews.com',
      'i24news.tv', 'kan.org.il',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'aljazeera.com'],
  },

  SA: {
    newsapiCode: 'sa',
    languages: ['en', 'ar'],
    keywords: ['saudi arabia', 'saudi', 'riyadh', 'mbs', 'mohammed bin salman', 'aramco', 'opec', 'vision 2030', 'neom'],
    primary: [
      'arabnews.com', 'saudigazette.com.sa', 'spa.gov.sa', 'al-monitor.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'aljazeera.com'],
  },

  ZA: {
    newsapiCode: 'za',
    languages: ['en'],
    keywords: ['south africa', 'south african', 'johannesburg', 'cape town', 'pretoria', 'anc', 'cyril ramaphosa', 'rand south africa', 'eskom', 'zuma'],
    primary: [
      'news24.com', 'dailymaverick.co.za', 'businesslive.co.za', 'timeslive.co.za',
      'ewn.co.za', 'mail and guardian', 'mg.co.za',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  NG: {
    newsapiCode: 'ng',
    languages: ['en'],
    keywords: ['nigeria', 'nigerian', 'abuja', 'lagos', 'tinubu', 'naira', 'nnpc', 'buhari', 'aso rock'],
    primary: [
      'punchng.com', 'vanguardngr.com', 'thisdaylive.com', 'tribuneonlineng.com',
      'channelstv.com', 'premiumtimesng.com', 'businessday.ng',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'aljazeera.com'],
  },

  EG: {
    newsapiCode: 'eg',
    languages: ['en', 'ar'],
    keywords: ['egypt', 'egyptian', 'cairo', 'sisi', 'egyptian pound', 'suez canal', 'nile', 'muslim brotherhood egypt'],
    primary: [
      'egyptindependent.com', 'dailynewsegypt.com', 'ahram.org.eg',
      'egypttoday.com', 'mada-masr.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com', 'aljazeera.com'],
  },

  TR: {
    newsapiCode: 'tr',
    languages: ['en', 'tr'],
    keywords: ['turkey', 'turkish', 'ankara', 'istanbul', 'erdogan', 'lira turkey', 'akp', 'bosphorus'],
    primary: [
      'hurriyetdailynews.com', 'dailysabah.com', 'trtworld.com', 'ahvalnews.com',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },

  PH: {
    newsapiCode: 'ph',
    languages: ['en'],
    keywords: ['philippines', 'philippine', 'filipino', 'manila', 'marcos', 'duterte', 'peso philippines', 'mindanao', 'luzon'],
    primary: [
      'philstar.com', 'rappler.com', 'mb.com.ph', 'pna.gov.ph', 'abs-cbn.com',
      'gmanetwork.com', 'inquirer.net',
    ],
    secondary: ['reuters.com', 'bbc.com', 'apnews.com'],
  },
};

/** Get source profile by ISO2 country code */
export function getSourceProfile(countryCode: string): CountrySourceProfile | null {
  return COUNTRY_SOURCES[countryCode.toUpperCase()] ?? null;
}

/** Check if a source name/URL belongs to a country's trusted list */
export function getSourceScore(
  sourceNameOrUrl: string,
  profile: CountrySourceProfile
): number {
  const src = sourceNameOrUrl.toLowerCase();
  if (profile.primary.some((d) => src.includes(d))) return 50;
  if (profile.secondary.some((d) => src.includes(d))) return 25;
  return 0;
}
