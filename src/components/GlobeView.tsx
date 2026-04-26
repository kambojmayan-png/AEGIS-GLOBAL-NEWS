'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as topojson from 'topojson-client';
import * as THREE from 'three';
import { GlobeLoadingOverlay } from './LoadingStates';
import { MOCK_BREAKING_NEWS } from '@/lib/mock-data';
import { ISO_A3_TO_A2, COUNTRIES } from '@/data/countries';
import { getStateFromCoords } from '@/data/states';

// ── Numeric ISO 3166-1 → A2  (TopoJSON world-atlas uses numeric polygon IDs) ──
const NUMERIC_ISO_TO_A2: Record<string, string> = {
  '4':'AF','8':'AL','12':'DZ','24':'AO','32':'AR','36':'AU','40':'AT',
  '50':'BD','56':'BE','68':'BO','76':'BR','100':'BG','104':'MM','116':'KH',
  '120':'CM','124':'CA','144':'LK','152':'CL','156':'CN','170':'CO',
  '188':'CR','191':'HR','192':'CU','196':'CY','203':'CZ','208':'DK',
  '214':'DO','218':'EC','222':'SV','231':'ET','246':'FI','250':'FR',
  '288':'GH','300':'GR','320':'GT','340':'HN','348':'HU','356':'IN',
  '360':'ID','364':'IR','368':'IQ','372':'IE','376':'IL','380':'IT',
  '388':'JM','392':'JP','398':'KZ','400':'JO','404':'KE','408':'KP',
  '410':'KR','414':'KW','422':'LB','428':'LV','434':'LY','440':'LT',
  '484':'MX','496':'MN','504':'MA','508':'MZ','512':'OM','516':'NA',
  '524':'NP','528':'NL','558':'NI','562':'NE','566':'NG','578':'NO',
  '586':'PK','591':'PA','600':'PY','604':'PE','608':'PH','616':'PL',
  '620':'PT','634':'QA','642':'RO','643':'RU','646':'RW','682':'SA',
  '686':'SN','704':'VN','706':'SO','710':'ZA','716':'ZW','724':'ES',
  '729':'SD','752':'SE','756':'CH','760':'SY','764':'TH','788':'TN',
  '792':'TR','800':'UG','804':'UA','784':'AE','818':'EG','826':'GB',
  '840':'US','858':'UY','862':'VE','887':'YE','894':'ZM',
};

// ── GeoJSON name variants → A2 (world-atlas names often differ from common names) ──
const GEOJSON_NAME_ALIASES: Record<string, string> = {
  'united states of america': 'US',
  'russian federation':       'RU',
  'korea, republic of':       'KR',
  'south korea':              'KR',
  "democratic people's republic of korea": 'KP',
  'iran, islamic republic of': 'IR',
  'czechia':                  'CZ',
  'czech republic':           'CZ',
  'viet nam':                 'VN',
  'vietnam':                  'VN',
  'syrian arab republic':     'SY',
  'tanzania, united republic of': 'TZ',
  "côte d'ivoire":            'CI',
  "ivory coast":              'CI',
  'bolivia, plurinational state of': 'BO',
  'venezuela, bolivarian republic of': 'VE',
  'republic of korea':        'KR',
  'united kingdom of great britain and northern ireland': 'GB',
  'great britain':            'GB',
  'the bahamas':              'BS',
  'south africa':             'ZA',
  'saudi arabia':             'SA',
  'united arab emirates':     'AE',
  'new zealand':              'NZ',
  'republic of the congo':    'CG',
  'democratic republic of the congo': 'CD',
};

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <GlobeLoadingOverlay />,
});

interface GlobeViewProps {
  onCountryClick: (countryCode: string, countryName: string) => void;
  onStateClick?: (stateName: string, countryCode: string, countryName: string) => void;
  averageSentiment: number | null;
  selectedCountry: string | null;
}

export default function GlobeView({
  onCountryClick,
  onStateClick,
  averageSentiment,
  selectedCountry,
}: GlobeViewProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [countries, setCountries] = useState<any>({ features: [] });
  const [hoverD, setHoverD] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load country polygons (GeoJSON)
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then((worldData) => {
        const land = topojson.feature(worldData, worldData.objects.countries as any);
        setCountries(land);
      })
      .catch(console.error);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize globe settings once globe el & country data are ready
  useEffect(() => {
    if (!globeRef.current || isInitialized.current || countries.features.length === 0) return;

    const globe = globeRef.current;

    // Set initial position
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

    // Configure controls
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = true;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 150;
      controls.maxDistance = 500;
    }

    // Configure renderer for bloom-like glow
    const renderer = globe.renderer();
    if (renderer) {
      renderer.setClearColor(0x020617, 1);
    }

    // Add atmosphere glow via scene
    const scene = globe.scene();
    if (scene) {
      const ambientLight = new THREE.AmbientLight(0x334155, 0.5);
      scene.add(ambientLight);
    }

    isInitialized.current = true;
    setGlobeReady(true);
  }, [countries]);

  // Update ambient light based on sentiment
  useEffect(() => {
    if (!globeRef.current || averageSentiment === null) return;
    const scene = globeRef.current.scene();
    if (!scene) return;

    scene.traverse((child: any) => {
      if (child instanceof THREE.AmbientLight) {
        if (averageSentiment > 0.3) {
          child.color.setHex(0x22d3ee); // cyan - positive
        } else if (averageSentiment > -0.3) {
          child.color.setHex(0x334155); // slate - neutral
        } else {
          child.color.setHex(0x991b1b); // dark red - negative
        }
      }
    });
  }, [averageSentiment]);

  // Stop autorotate when interacting
  const stopAutoRotate = useCallback(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) controls.autoRotate = false;
    }
  }, []);

  // Handle country polygon click
  const handlePolygonClick = useCallback(
    (polygon: any, event: any, { lat, lng }: any) => {
      stopAutoRotate();
      if (!polygon?.properties) return;

      // ── Resolve ISO A2 code — 4-tier resolution ────────────────────────────

      let isoA2: string | null = null;

      // Tier 1: ISO_A3 property → our lookup table (fastest, most accurate)
      const rawA3 = polygon.properties.ISO_A3;
      if (rawA3 && typeof rawA3 === 'string' && rawA3 !== '-99') {
        isoA2 = ISO_A3_TO_A2[rawA3] ?? null;
      }

      // Tier 2: Numeric TopoJSON polygon ID → ISO numeric → A2
      if (!isoA2) {
        const numId = String(polygon.id ?? '');
        if (numId) isoA2 = NUMERIC_ISO_TO_A2[numId] ?? null;
      }

      // Tier 3: GeoJSON name → alias map → then exact match in COUNTRIES
      if (!isoA2) {
        const geoName = (polygon.properties.name ?? '').toLowerCase().trim();
        if (geoName) {
          isoA2 = GEOJSON_NAME_ALIASES[geoName] ?? null;
          if (!isoA2) {
            const match = Object.entries(COUNTRIES).find(
              ([, c]) => c.name.toLowerCase() === geoName
            );
            if (match) isoA2 = match[0];
          }
        }
      }

      // Tier 4: Nothing resolved — log and skip (no bad API calls)
      if (!isoA2) {
        console.warn('[Globe] Unresolved polygon, skipping:', polygon.properties?.name, polygon.id);
        return;
      }

      // Use our curated country name (never a raw number or GeoJSON variant)
      const name = COUNTRIES[isoA2]?.name ?? polygon.properties?.name ?? isoA2;

      // Shift+click: state-level drill-down
      if (event.shiftKey && onStateClick) {
        const state = getStateFromCoords(lat, lng, isoA2);
        if (state) {
          globeRef.current?.pointOfView(
            { lat: state.lat, lng: state.lng, altitude: 0.8 }, 1000
          );
          onStateClick(state.name, isoA2, name);
          return;
        }
      }

      // Fly to country centroid
      const country = COUNTRIES[isoA2];
      if (country) {
        globeRef.current?.pointOfView(
          { lat: country.lat, lng: country.lng, altitude: 1.5 }, 1000
        );
      }

      // Trigger news fetch with clean A2 code + curated name
      onCountryClick(isoA2, name);
    },
    [onCountryClick, onStateClick, stopAutoRotate]
  );



  // Fly to selected country
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) return;
    const country = COUNTRIES[selectedCountry];
    if (country) {
      globeRef.current.pointOfView(
        { lat: country.lat, lng: country.lng, altitude: 1.5 },
        1000
      );
    }
  }, [selectedCountry]);

  // Memoize ring data for breaking news
  const ringsData = useMemo(
    () =>
      MOCK_BREAKING_NEWS.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        maxR: p.intensity * 4,
        propagationSpeed: 2,
        repeatPeriod: 1200 + Math.random() * 800,
      })),
    []
  );

  // Polygon colors
  const getPolygonColor = useCallback(
    (d: any) => {
      const isoA3 = d?.properties?.ISO_A3 || d?.id;
      const isoA2 = ISO_A3_TO_A2[isoA3] || isoA3;

      if (d === hoverD) return 'rgba(34, 211, 238, 0.35)';
      if (isoA2 === selectedCountry) return 'rgba(34, 211, 238, 0.25)';
      return 'rgba(30, 41, 59, 0.6)';
    },
    [hoverD, selectedCountry]
  );

  const getPolygonStrokeColor = useCallback(
    (d: any) => {
      const isoA3 = d?.properties?.ISO_A3 || d?.id;
      const isoA2 = ISO_A3_TO_A2[isoA3] || isoA3;

      if (d === hoverD) return 'rgba(34, 211, 238, 0.8)';
      if (isoA2 === selectedCountry) return 'rgba(34, 211, 238, 0.5)';
      return 'rgba(51, 65, 85, 0.4)';
    },
    [hoverD, selectedCountry]
  );

  // Handle globe ready callback from react-globe.gl
  const handleGlobeReady = useCallback(() => {
    // Trigger initialization
    if (globeRef.current && !isInitialized.current) {
      const globe = globeRef.current;
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.8;
        controls.minDistance = 150;
        controls.maxDistance = 500;
      }

      const renderer = globe.renderer();
      if (renderer) {
        renderer.setClearColor(0x020617, 1);
      }

      const scene = globe.scene();
      if (scene) {
        const ambientLight = new THREE.AmbientLight(0x334155, 0.5);
        scene.add(ambientLight);
      }

      isInitialized.current = true;
      setGlobeReady(true);
    }
  }, []);

  return (
    <div ref={containerRef} className="globe-container w-full h-full relative">
      {!globeReady && <GlobeLoadingOverlay />}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={handleGlobeReady}
          // Globe settings
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="rgba(34, 211, 238, 0.3)"
          atmosphereAltitude={0.2}
          // Country polygons
          polygonsData={countries.features}
          polygonAltitude={(d: any) => (d === hoverD ? 0.04 : 0.01)}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => 'rgba(15, 23, 42, 0.3)'}
          polygonStrokeColor={getPolygonStrokeColor}
          polygonLabel={(d: any) => {
            // Resolve name: prefer GeoJSON name, then ISO A3→A2→name lookup, else skip numeric IDs
            const rawName = d?.properties?.name;
            const isoA3   = d?.properties?.ISO_A3 || '';
            const isoA2   = ISO_A3_TO_A2[isoA3];
            const resolvedName =
              rawName && !/^\d+$/.test(rawName)   // if name exists and isn't just a number
                ? rawName
                : isoA2
                ? (COUNTRIES[isoA2]?.name ?? isoA2) // lookup from our table
                : null;                              // unknown — show nothing

            if (!resolvedName) return '';

            return `<div style="
              background: rgba(2, 6, 23, 0.9);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(34, 211, 238, 0.3);
              border-radius: 8px;
              padding: 8px 14px;
              font-family: 'Inter', sans-serif;
              color: #e2e8f0;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 0.05em;
              white-space: nowrap;
              box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
            ">
              <span style="color: #22d3ee;">◆</span> ${resolvedName}
            </div>`;
          }}
          onPolygonHover={(d: any) => setHoverD(d)}
          onPolygonClick={handlePolygonClick}
          polygonsTransitionDuration={300}
          // Breaking news rings
          ringsData={ringsData}
          ringColor={() => (t: number) =>
            `rgba(34, 211, 238, ${1 - t})`
          }
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
        />
      )}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 23, 0.6) 100%)',
        }}
      />

      {/* Bottom instruction */}
      {!selectedCountry && globeReady && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">
            Click a country to begin intelligence scan
          </p>
        </div>
      )}
    </div>
  );
}
