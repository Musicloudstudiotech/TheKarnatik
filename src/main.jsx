import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { mcleod, yin } from '@audio/pitch';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  Columns3,
  Compass,
  ClipboardList,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Music2,
  Navigation,
  Pause,
  Play,
  Plus,
  Phone,
  Search,
  Send,
  Sparkles,
  Star,
  Ticket,
  UserCircle2,
  Wand2,
  Volume2,
  Wind
} from 'lucide-react';
import './styles.css';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import DownloadsPage from './DownloadsPage.jsx';
import {
  databaseStats,
  earTrainingLevels,
  janyaBranches,
  janyaCatalogue,
  melakartaChakras,
  melakartaRagas,
  melakartaRows,
  ragas,
  swaraLegend
} from './data/ragaDatabase.js';
import ragadnaManifest from '../public/ragadna/ragadna-manifest.json';
import ragadnaFeatureModel from '../data/raga-samples/ragadna-feature-model.json';

const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PLANNER_OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function pageFromLocation() {
  const path = window.location.pathname.toLowerCase();
  if (path === '/planner' || path === '/kanban') return 'planner';
  if (path === '/chordanalyser' || path === '/chord-analyser') return 'chords';
  return 'practice';
}
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const tamburaSamples = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const tamburaMaSamples = ['E', 'F', 'F#', 'G', 'G#'];
const tamburaAssetNames = {
  'C#': 'Csharp',
  'D#': 'Dsharp',
  'F#': 'Fsharp',
  'G#': 'Gsharp',
  'A#': 'Asharp'
};
const tamburaLoopSettings = {
  A: { startTrim: 1, tailTrim: 1.2, crossfade: 2.4 },
  B: { startTrim: 0.85, tailTrim: 1.2, crossfade: 2.4 },
  C: { startTrim: 1, tailTrim: 3, crossfade: 3.2 },
  'C#': { startTrim: 1, tailTrim: 1.8, crossfade: 2.6 },
  D: { startTrim: 1.5, tailTrim: 2.5, crossfade: 2.8 },
  E: { startTrim: 1.5, tailTrim: 2, crossfade: 2.7 },
  F: { startTrim: 0.85, tailTrim: 1.7, crossfade: 2.2 },
  'F#': { startTrim: 1.2, tailTrim: 2, crossfade: 2.6 },
  G: { startTrim: 0.85, tailTrim: 1.3, crossfade: 2.2 }
};
const tamburaBufferCache = new Map();
const swaraIntervals = {
  S: 0,
  r: 1,
  R1: 1,
  R: 2,
  R2: 2,
  G1: 2,
  g: 3,
  G2: 3,
  G: 4,
  G3: 4,
  M: 5,
  M1: 5,
  'M^': 6,
  M2: 6,
  P: 7,
  d: 8,
  D1: 8,
  D: 9,
  D2: 9,
  N1: 9,
  n: 10,
  D3: 10,
  N2: 10,
  N: 11,
  N3: 11
};
const intervalLabels = {
  0: 'S',
  1: 'R1',
  2: 'R2/G1',
  3: 'R3/G2',
  4: 'G3',
  5: 'M1',
  6: 'M2',
  7: 'P',
  8: 'D1',
  9: 'D2/N1',
  10: 'D3/N2',
  11: 'N3'
};
const swaraDisplayAliases = {
  r: 'R1',
  R: 'R2',
  g: 'G2',
  G: 'G3',
  M: 'M1',
  'M^': 'M2',
  d: 'D1',
  D: 'D2',
  n: 'N2',
  N: 'N3'
};
const hindustaniSwaraDisplayAliases = {
  S: 'Sa',
  r: 'r',
  R1: 'r',
  R: 'R',
  R2: 'R',
  G1: 'R',
  g: 'g',
  G2: 'g',
  G: 'G',
  G3: 'G',
  M: 'M',
  M1: 'M',
  'M^': 'M^',
  M2: 'M^',
  P: 'Pa',
  d: 'd',
  D1: 'd',
  D: 'D',
  D2: 'D',
  N1: 'D',
  n: 'n',
  D3: 'n',
  N2: 'n',
  N: 'N',
  N3: 'N'
};



const systems = ['All', 'Hindustani', 'Karnatik'];

const practiceSystems = [
  { id: 'karnatik', label: 'Karnatik', hint: 'Tanpura, metronome, Karnatik tala cycles' },
  { id: 'hindustani', label: 'Hindustani', hint: 'Tanpura, metronome, Hindustani tala cycles' }
];

const talaPresets = {
  karnatik: [
    {
      id: 'adi',
      name: 'Adi Tala',
      beats: 8,
      meter: '4 + 2 + 2',
      timeSignature: '8/8',
      accents: [1, 5, 7],
      bols: ['Tha', 'Ka', 'Dhi', 'Mi', 'Tha', 'Ka', 'Dhi', 'Mi']
    },
    {
      id: 'rupaka',
      name: 'Rupaka Tala',
      beats: 3,
      meter: '1 + 2',
      timeSignature: '3/4',
      accents: [1, 2],
      bols: ['Tha', 'Ki', 'Ta']
    },
    {
      id: 'misra-chapu',
      name: 'Misra Chapu',
      beats: 7,
      meter: '3 + 2 + 2',
      timeSignature: '7/8',
      accents: [1, 4, 6],
      bols: ['Tha', 'Ki', 'Ta', 'Tha', 'Ka', 'Dhi', 'Mi']
    },
    {
      id: 'khanda-chapu',
      name: 'Khanda Chapu',
      beats: 5,
      meter: '2 + 3',
      timeSignature: '5/8',
      accents: [1, 3],
      bols: ['Tha', 'Ka', 'Tha', 'Ki', 'Ta']
    },
    {
      id: 'tisra-triputa',
      name: 'Tisra Triputa',
      beats: 7,
      meter: '3 + 2 + 2',
      timeSignature: '7/8',
      accents: [1, 4, 6],
      bols: ['Tha', 'Ki', 'Ta', 'Tha', 'Ka', 'Dhi', 'Mi']
    }
  ],
  hindustani: [
    {
      id: 'teentaal',
      name: 'Teentaal',
      beats: 16,
      meter: '4 + 4 + 4 + 4',
      timeSignature: '16/4',
      accents: [1, 5, 13],
      khali: [9],
      bols: ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha']
    },
    {
      id: 'ektaal',
      name: 'Ektaal',
      beats: 12,
      meter: '2 + 2 + 2 + 2 + 2 + 2',
      timeSignature: '12/4',
      accents: [1, 5, 9, 11],
      khali: [3, 7],
      bols: ['Dhin', 'Dhin', 'DhaGe', 'TiRaKiTa', 'Tu', 'Na', 'Kat', 'Ta', 'DhaGe', 'TiRaKiTa', 'Dhin', 'Na']
    },
    {
      id: 'jhaptaal',
      name: 'Jhaptaal',
      beats: 10,
      meter: '2 + 3 + 2 + 3',
      timeSignature: '10/4',
      accents: [1, 3, 8],
      khali: [6],
      bols: ['Dhi', 'Na', 'Dhi', 'Dhi', 'Na', 'Ti', 'Na', 'Dhi', 'Dhi', 'Na']
    },
    {
      id: 'rupak',
      name: 'Rupak',
      beats: 7,
      meter: '3 + 2 + 2',
      timeSignature: '7/4',
      accents: [4, 6],
      khali: [1],
      bols: ['Tin', 'Tin', 'Na', 'Dhin', 'Na', 'Dhin', 'Na']
    },
    {
      id: 'dadra',
      name: 'Dadra',
      beats: 6,
      meter: '3 + 3',
      timeSignature: '6/8',
      accents: [1],
      khali: [4],
      bols: ['Dha', 'Dhi', 'Na', 'Dha', 'Tu', 'Na']
    },
    {
      id: 'keherwa',
      name: 'Keherwa',
      beats: 8,
      meter: '4 + 4',
      timeSignature: '4/4',
      accents: [1],
      khali: [5],
      bols: ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na']
    }
  ]
};

const swaraPlaybackController = { current: null };
const recordedPlaybackController = { current: null };
const practiceSteps = ['Arohana-Avarohana', 'Pakad / Chalan', 'Alap Builder', 'Bandish / Kriti'];
const concertListings = [
  {
    id: 'blr-sabha-01',
    title: 'Evening Raga Sabha',
    artist: 'Featured Karnatik vocalists',
    city: 'Bangalore',
    area: 'Malleswaram',
    date: '2026-07-04',
    time: '6:30 PM',
    venue: 'Community Sabha Hall',
    type: 'Karnatik',
    source: 'Curated seed',
    status: 'Verified'
  },
  {
    id: 'chn-kriti-02',
    title: 'Kriti and Manodharma Evening',
    artist: 'Karnatik ensemble',
    city: 'Chennai',
    area: 'Mylapore',
    date: '2026-07-05',
    time: '5:45 PM',
    venue: 'Raga Sabha Auditorium',
    type: 'Karnatik',
    source: 'Curated seed',
    status: 'Verified'
  },
  {
    id: 'mum-baithak-03',
    title: 'Hindustani Baithak',
    artist: 'Khayal and tabla artists',
    city: 'Mumbai',
    area: 'Dadar',
    date: '2026-07-06',
    time: '7:00 PM',
    venue: 'Baithak Room',
    type: 'Hindustani',
    source: 'Curated seed',
    status: 'Verified'
  },
  {
    id: 'hyd-cross-04',
    title: 'Classical Crossover Chamber',
    artist: 'Vocal, veena, and percussion artists',
    city: 'Hyderabad',
    area: 'Banjara Hills',
    date: '2026-07-07',
    time: '6:00 PM',
    venue: 'Arts Circle',
    type: 'Karnatik + Hindustani',
    source: 'Community seed',
    status: 'Open'
  },
  {
    id: 'del-dhrupad-05',
    title: 'Dhrupad Listening Session',
    artist: 'Dhrupad artists collective',
    city: 'Delhi',
    area: 'Mandi House',
    date: '2026-07-09',
    time: '6:15 PM',
    venue: 'Music Forum',
    type: 'Hindustani',
    source: 'Community seed',
    status: 'Open'
  },
  {
    id: 'sfo-diaspora-06',
    title: 'Indian Classical Community Night',
    artist: 'Bay Area musicians',
    city: 'San Francisco Bay Area',
    area: 'Fremont',
    date: '2026-07-10',
    time: '6:30 PM',
    venue: 'Community Arts Center',
    type: 'Karnatik + Hindustani',
    source: 'Community seed',
    status: 'Open'
  }
];

const concertSourceRoadmap = [
  {
    name: 'Community submissions',
    status: 'ready',
    count: 0,
    detail: 'Teachers, sabhas, artists, and rasikas can add concerts directly.'
  },
  {
    name: 'Verified partner calendars',
    status: 'next',
    count: 0,
    detail: 'Sabhas, venues, festivals, and artist websites can feed reviewed listings.'
  },
  {
    name: 'Public event discovery',
    status: 'planned',
    count: 0,
    detail: 'Search-backed discovery will need a backend crawler, moderation, and duplicate checks.'
  }
];

const referenceRecordedSamples = [
  { id: 'reference-abheri', ragaId: 'abheri_bhimpalasi', name: 'Abheri', key: 'C#', src: '/raga-samples/reference-a/Abheri-CSharp.mp3' },
  { id: 'reference-anandabhairavi', name: 'Anandabhairavi', key: 'C#', src: '/raga-samples/reference-a/Anandabhairavi-CSharp.mp3' },
  { id: 'reference-bhairavi', name: 'Bhairavi', key: 'C#', src: '/raga-samples/reference-a/Bhairavi-CSharp.mp3' },
  { id: 'reference-bilahari', name: 'Bilahari', key: 'C#', src: '/raga-samples/reference-a/Bilahari-CSharp.mp3' },
  { id: 'reference-charukeshi', ragaId: 'charukesi', name: 'Charukeshi', key: 'C#', src: '/raga-samples/reference-a/Charukeshi-CSharp.mp3' },
  { id: 'reference-hamsadhwani', ragaId: 'hamsadhwani', name: 'Hamsadhwani', key: 'C#', src: '/raga-samples/reference-a/Hamsadhwani-CSharp.mp3' },
  { id: 'reference-hindolam', ragaId: 'hindolam_malkauns', name: 'Hindolam', key: 'C#', src: '/raga-samples/reference-a/Hindolam-CSharp.mp3' },
  { id: 'reference-kalyani', ragaId: 'kalyani', name: 'Kalyani', key: 'C#', src: '/raga-samples/reference-a/Kalyani-CSharp.mp3' },
  { id: 'reference-kambhoji', ragaId: 'kambhoji', name: 'Kambhoji', key: 'C#', src: '/raga-samples/reference-a/Kambhoji-CSharp.mp3' },
  { id: 'reference-kedaragowla', name: 'Kedaragowla', key: 'C#', src: '/raga-samples/reference-a/Kedaragowla-CSharp.mp3' },
  { id: 'reference-keeravani', ragaId: 'keeravani_kirwani', name: 'Keeravani', key: 'C#', src: '/raga-samples/reference-a/Keeravani-CSharp.mp3' },
  { id: 'reference-kharaharapriya', ragaId: 'kharaharapriya_kafi', name: 'Kharaharapriya', key: 'C#', src: '/raga-samples/reference-a/Kharaharapriya-CSharp.mp3' },
  { id: 'reference-madhyamavati', name: 'Madhyamavati', key: 'C#', src: '/raga-samples/reference-a/Madhyamavati-CSharp.mp3' },
  { id: 'reference-mayamalavagowla', ragaId: 'mayamalavagowla', name: 'Mayamalavagowla', key: 'C#', src: '/raga-samples/reference-a/Mayamalavagowla-CSharp.mp3' },
  { id: 'reference-mohana', ragaId: 'mohana', name: 'Mohana', key: 'C#', src: '/raga-samples/reference-a/Mohana-CSharp.mp3' },
  { id: 'reference-reetigowla', name: 'Reetigowla', key: 'C#', src: '/raga-samples/reference-a/Reetigowla-CSharp.mp3' },
  { id: 'reference-saveri', name: 'Saveri', key: 'C#', src: '/raga-samples/reference-a/Saveri-CSharp.mp3' },
  { id: 'reference-shankarabharanam', ragaId: 'shankarabharanam_bilawal', name: 'Shankarabharanam', key: 'C#', src: '/raga-samples/reference-a/Shankarabharanam-CSharp.mp3' },
  { id: 'reference-shuddha-saveri', ragaId: 'shuddha_saveri_durga', name: 'Shuddha Saveri', key: 'C#', src: '/raga-samples/reference-a/Shudda Saveri-CSharp.mp3' },
  { id: 'reference-todi', ragaId: 'todi', name: 'Todi', key: 'C#', src: '/raga-samples/reference-a/Todi-CSharp.mp3' }
];

const referencePilotScales = {
  Abheri: {
    arohana: ['S', 'G2', 'M1', 'P', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'N2', 'D2']
  },
  Anandabhairavi: {
    arohana: ['S', 'G2', 'R2', 'G2', 'M1', 'P', 'D2', 'P', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'D2', 'N2']
  },
  Bhairavi: {
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'D1', 'N2']
  },
  Bilahari: {
    arohana: ['S', 'R2', 'G3', 'P', 'D2', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    signature: ['G3', 'D2', 'N3']
  },
  Charukeshi: {
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G3', 'R2', 'S'],
    signature: ['G3', 'D1', 'N2']
  },
  Hamsadhwani: {
    arohana: ['S', 'R2', 'G3', 'P', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'P', 'G3', 'R2', 'S'],
    signature: ['G3', 'N3']
  },
  Hindolam: {
    arohana: ['S', 'G2', 'M1', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'M1', 'G2', 'S'],
    signature: ['G2', 'D1', 'N2']
  },
  Kalyani: {
    arohana: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M2', 'G3', 'R2', 'S'],
    signature: ['G3', 'M2', 'N3']
  },
  Kambhoji: {
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    signature: ['G3', 'D2', 'N2']
  },
  Kedaragowla: {
    arohana: ['S', 'R2', 'M1', 'P', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    signature: ['M1', 'N2', 'G3']
  },
  Keeravani: {
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'D1', 'N3']
  },
  Kharaharapriya: {
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'D2', 'N2']
  },
  Madhyamavati: {
    arohana: ['S', 'R2', 'M1', 'P', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'P', 'M1', 'R2', 'S'],
    signature: ['M1', 'N2']
  },
  Mayamalavagowla: {
    arohana: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G3', 'R1', 'S'],
    signature: ['R1', 'G3', 'D1', 'N3']
  },
  Mohana: {
    arohana: ['S', 'R2', 'G3', 'P', 'D2', "S'"],
    avarohana: ["S'", 'D2', 'P', 'G3', 'R2', 'S'],
    signature: ['G3', 'D2']
  },
  Reetigowla: {
    arohana: ['S', 'G2', 'R2', 'G2', 'M1', 'N2', 'D2', 'M1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'M1', 'G2', 'M1', 'P', 'M1', 'G2', 'R2', 'S'],
    signature: ['G2', 'N2', 'D2']
  },
  Saveri: {
    arohana: ['S', 'R1', 'M1', 'P', 'D1', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G3', 'R1', 'S'],
    signature: ['R1', 'D1', 'N3']
  },
  Shankarabharanam: {
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    signature: ['G3', 'M1', 'N3']
  },
  'Shuddha Saveri': {
    arohana: ['S', 'R2', 'M1', 'P', 'D2', "S'"],
    avarohana: ["S'", 'D2', 'P', 'M1', 'R2', 'S'],
    signature: ['M1', 'D2']
  },
  Todi: {
    arohana: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G2', 'R1', 'S'],
    signature: ['R1', 'G2', 'D1', 'N2']
  }
};

const referencePilotRagas = referenceRecordedSamples.map((sample) => {
  const linkedRaga = sample.ragaId ? ragas.find((raga) => raga.id === sample.ragaId) : null;
  const template = referencePilotScales[sample.name] || linkedRaga || {};
  return {
    id: sample.id,
    ragaId: sample.ragaId,
    name: sample.name,
    system: linkedRaga?.system || 'Karnatik',
    family: linkedRaga?.family || '20-raga reference set',
    arohana: template.arohana || [],
    avarohana: template.avarohana || [],
    signatureIntervals: (template.signature || []).map((swara) => swaraIntervals[swara]).filter((interval) => interval !== undefined),
    sample
  };
});

const allRagaDnaRagas = buildRagaDnaCandidates(ragadnaManifest.entries, referencePilotRagas);
const ragaDnaFeatures = ragadnaFeatureModel.features || [];

const ragaDnaAnalysisNotes = [
  {
    title: 'Current Baseline',
    body: 'Use the conservative detector from the closer test: Sa lock, stable pitch frames, held-note cleanup, ordered path scoring, then raga grammar rules.'
  },
  {
    title: 'Today\'s Finding',
    body: 'When pitch detection is unstable, raga matching becomes meaningless. First validate Sa Pa Sa and Sa Ga Pa Da Sa before judging raga output.'
  },
  {
    title: 'Do Not Overweight Yet',
    body: 'Pitch histogram and transition surface are useful, but they should not force an identification until we have clean contour extraction.'
  },
  {
    title: 'Next Engine Step',
    body: 'Replace the browser autocorrelation pitch tracker with pYIN/YIN-style contour tracking, then reintroduce melodic-surface scoring as debug evidence.'
  }
];

function optionSet(answer, pool, seed = 0) {
  const uniquePool = pool.filter((item, index, list) => item !== answer && list.indexOf(item) === index);
  const choices = [answer, ...uniquePool.slice(seed, seed + 3)];
  if (choices.length < 4) choices.push(...uniquePool.slice(0, 4 - choices.length));
  return choices
    .slice(0, 4)
    .map((_, index, list) => list[(index + seed) % list.length]);
}

const swaraVariantOptions = {
  R: ['R1', 'R2', 'R3'],
  G: ['G1', 'G2', 'G3'],
  M: ['M1', 'M2'],
  D: ['D1', 'D2', 'D3'],
  N: ['N1', 'N2', 'N3']
};

const swaraVariantNames = {
  R: 'Rishabham',
  G: 'Gandharam',
  M: 'Madhyamam',
  D: 'Dhaivatam',
  N: 'Nishadam'
};

function cleanScaleSwara(swara) {
  return displaySwaraLabel(normalizeSwara(swara));
}

function swaraVariantBase(swara) {
  const clean = cleanScaleSwara(swara);
  if (/^[RGMDN][123]$/.test(clean)) return clean[0];
  return '';
}

function uniqueVariantSlots(raga) {
  const seen = new Map();
  raga.arohana.concat(raga.avarohana).forEach((swara) => {
    const answer = cleanScaleSwara(swara);
    const base = swaraVariantBase(answer);
    if (!base || !swaraVariantOptions[base] || seen.has(base)) return;
    seen.set(base, {
      base,
      label: swaraVariantNames[base],
      answer,
      options: swaraVariantOptions[base]
    });
  });
  return Array.from(seen.values());
}

function buildScaleBuilderQuestions() {
  const quizRagas = [...ragas, ...melakartaRagas]
    .filter((raga) => (raga.system === 'Karnatik' || raga.system === 'Both') && raga.arohana?.length && raga.avarohana?.length)
    .filter((raga, index, list) => list.findIndex((item) => item.name === raga.name) === index);

  return quizRagas
    .map((raga) => {
      const slots = uniqueVariantSlots(raga);
      if (!slots.length) return null;
      return {
        type: 'Scale Builder',
        bucket: 'scale-builder',
        kind: 'scale-builder',
        prompt: `Build the swara variants for ${raga.name}.`,
        options: [],
        answer: 'complete',
        ragaName: raga.name,
        raga,
        slots,
        fullArohana: raga.arohana.map(cleanScaleSwara),
        fullAvarohana: raga.avarohana.map(cleanScaleSwara),
        detail: `${raga.name}: ${ragaStudyLineageDetail(raga)}`
      };
    })
    .filter(Boolean);
}

function buildRagaQuizQuestions() {
  const rows = melakartaRows();
  const chakraNames = melakartaChakras.map((chakra) => chakra.name);
  const melakartaNames = rows.map((row) => row.name);
  const melakartaNumbers = rows.map((row) => String(row.number));
  const parentNames = janyaCatalogue.map((group) => group.parent.replace(/^\d+\s+/, ''));
  const swaraChecks = [
    { label: 'Rishabham', key: 'rishabham', options: ['R1', 'R2', 'R3'] },
    { label: 'Gandharam', key: 'gandharam', options: ['G1', 'G2', 'G3'] },
    { label: 'Madhyamam', key: 'madhyamam', options: ['M1', 'M2'] },
    { label: 'Dhaivatam', key: 'dhaivatam', options: ['D1', 'D2', 'D3'] },
    { label: 'Nishadam', key: 'nishadam', options: ['N1', 'N2', 'N3'] }
  ];
  const questions = [];

  melakartaChakras.forEach((chakra, index) => {
    questions.push({
      type: 'Chakra',
      bucket: 'chakra',
      prompt: `Which chakra contains ragas ${chakra.range}?`,
      options: optionSet(chakra.name, chakraNames, index),
      answer: chakra.name,
      detail: `${chakra.name} is Chakra ${index + 1} and contains Melakarta ragas ${chakra.range}.`
    });
    questions.push({
      type: 'Chakra',
      bucket: 'chakra',
      prompt: `Which madhyamam group does Chakra ${index + 1} ${chakra.name} use?`,
      options: ['M1', 'M2', 'Both M1 and M2', 'No Madhyamam'],
      answer: chakra.madhyamam,
      detail: `${chakra.name} uses ${chakra.madhyamam}; chakras 1-6 use M1 and 7-12 use M2.`
    });
  });

  rows.forEach((row, index) => {
    questions.push({
      type: 'Melakarta',
      bucket: 'melakarta',
      prompt: `What is the Melakarta number of ${row.name}?`,
      options: optionSet(String(row.number), melakartaNumbers, index % 9),
      answer: String(row.number),
      detail: `${row.name} is Melakarta ${row.number}, placed in Chakra ${row.chakraNumber} ${row.chakra}.`
    });
    questions.push({
      type: 'Melakarta',
      bucket: 'melakarta',
      prompt: `Which Melakarta is number ${row.number}?`,
      options: optionSet(row.name, melakartaNames, index % 11),
      answer: row.name,
      detail: `Melakarta ${row.number} is ${row.name}, in Chakra ${row.chakraNumber} ${row.chakra}.`
    });
    questions.push({
      type: 'Chakra',
      bucket: 'chakra',
      prompt: `Which chakra contains ${row.name}?`,
      options: optionSet(row.chakra, chakraNames, index % 5),
      answer: row.chakra,
      detail: `${row.name} is Melakarta ${row.number}, so it belongs to Chakra ${row.chakraNumber} ${row.chakra}.`
    });
    swaraChecks.forEach((check) => {
      questions.push({
        type: 'Swara',
        bucket: 'notes',
        prompt: `${row.name} has which ${check.label}?`,
        options: check.options,
        answer: row[check.key],
        detail: `${row.name} uses ${row[check.key]} ${check.label}. Its arohana is S ${row.rishabham} ${row.gandharam} ${row.madhyamam} P ${row.dhaivatam} ${row.nishadam} S'.`
      });
    });
  });

  janyaCatalogue.forEach((group, groupIndex) => {
    const parent = group.parent.replace(/^\d+\s+/, '');
    group.ragas.forEach((raga, ragaIndex) => {
      questions.push({
        type: 'Janya',
        bucket: 'janya',
        prompt: `${raga} is grouped under which parent Melakarta?`,
        options: optionSet(parent, parentNames, (groupIndex + ragaIndex) % 8),
        answer: parent,
        detail: `${raga} is listed in this catalogue under ${group.parent}.`
      });
    });
    const siblingOptions = janyaCatalogue
      .filter((item) => item.parent !== group.parent)
      .flatMap((item) => item.ragas)
      .slice(groupIndex, groupIndex + 3);
    questions.push({
      type: 'Janya',
      bucket: 'janya',
      prompt: `Which one is a Janya listed under ${group.parent}?`,
      options: optionSet(group.ragas[0], siblingOptions, groupIndex % 3),
      answer: group.ragas[0],
      detail: `${group.ragas[0]} is one of the Janya ragas grouped under ${group.parent}.`
    });
  });

  return [...buildScaleBuilderQuestions(), ...questions];
}

const ragaQuizQuestions = buildRagaQuizQuestions();
const quizBuckets = [
  { id: 'scale-builder', label: 'Scale Builder', note: 'Fill R, G, M, D, N variants inside raga scales' },
  { id: 'chakra', label: 'Chakra Based', note: 'Chakra range, M1/M2, raga placement' },
  { id: 'melakarta', label: 'Melakarta Based', note: 'All 72 parent ragas by name and number' },
  { id: 'notes', label: 'Notes Based', note: 'Rishabham, Gandharam, Madhyamam, Dhaivatam, Nishadam' },
  { id: 'janya', label: 'Janya Based', note: 'Derived ragas and parent Melakarta' }
];

const triadPatterns = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  'no3': [0, 7]
};
const chordQualityLabels = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'sus2', label: 'Sus2' },
  { id: 'sus4', label: 'Sus4' },
  { id: 'no3', label: '5 / Power' },
  { id: 'dim', label: 'Diminished' }
];
const chordQualityRank = {
  major: 0,
  minor: 1,
  sus2: 2,
  sus4: 3,
  'no3': 4,
  dim: 5
};
const swaraRoleRank = {
  0: 0,
  7: 1,
  9: 2,
  2: 3,
  4: 4,
  5: 5,
  6: 5,
  11: 8,
  10: 8,
  1: 9,
  3: 9,
  8: 9
};

function App({ user, onSignOut }) {
  const canAccessPlanner = normalizeEmail(user?.email) === PLANNER_OWNER_EMAIL;
  const [activePage, setActivePage] = useState(pageFromLocation);
  const [system, setSystem] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('kalyani');
  const [activeStep, setActiveStep] = useState(0);
  const [tanpuraOn, setTanpuraOn] = useState(false);
  const [tanpuraLoading, setTanpuraLoading] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [tempo, setTempo] = useState(60);
  const [metronomeVolume, setMetronomeVolume] = useState(62);
  const [practiceSystem, setPracticeSystem] = useState('karnatik');
  const [talaId, setTalaId] = useState('adi');
  const [volume, setVolume] = useState(72);
  const [pitch, setPitch] = useState('C#');
  const [tanpuraMode, setTanpuraMode] = useState('sa-pa');
  const [detector, setDetector] = useState({
    status: 'idle',
    note: 'C#',
    cents: 0,
    frequency: 0,
    heardNotes: [],
    root: '',
    confidence: 0,
    frequencyRange: '',
    stage: 'Ready to listen through your system mic.',
    processLog: ['Ready: click Detect My Sa and sing a steady Sa.'],
    error: ''
  });
  const [companionInput, setCompanionInput] = useState('');
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionError, setCompanionError] = useState('');
  const [companionMessages, setCompanionMessages] = useState([]);
  const detectorSessionRef = useRef(null);
  const ragaSessionRef = useRef(null);
  const tanpuraRef = useRef(null);
  const tanpuraStartTokenRef = useRef(0);
  const metronomeRef = useRef(null);
  const [ragaDetector, setRagaDetector] = useState({
    status: 'idle',
    root: '',
    heardNotes: [],
    heardSwaras: [],
    rejectedSwaras: [],
    evidenceFrames: [],
    evidencePath: [],
    syllables: [],
    syllableTranscript: '',
    syllableStatus: '',
    pitchSyllables: [],
    analysisSummary: '',
    matches: [],
    stage: 'Ready: sing Sa, then Arohana and Avarohana slowly.',
    processLog: ['Ready: click Detect Raga, sing Sa first, then Arohana and Avarohana slowly.'],
    error: ''
  });

  const filtered = useMemo(() => {
    return ragas.filter((raga) => {
      const matchesSystem = system === 'All' || raga.system === system || raga.system === 'Both';
      const text = `${raga.name} ${raga.family} ${raga.mood}`.toLowerCase();
      return matchesSystem && text.includes(query.toLowerCase());
    });
  }, [query, system]);

  const selected = ragas.find((raga) => raga.id === selectedId) || filtered[0] || ragas[0];
  const showLibraryPane = activePage === 'practice';
  const showCompanionPane = activePage === 'practice';
  const harmony = useMemo(() => getHarmony(selected, pitch), [selected, pitch]);
  const activeTala = getActiveTala(practiceSystem, talaId);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, activePage }, '', window.location.href);
    const handlePopState = (event) => {
      setActivePage(event.state?.activePage || pageFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigateToPage(page) {
    setActivePage(page);
    const path = page === 'planner'
      ? '/planner'
      : page === 'chords'
        ? '/ChordAnalyser'
        : '/app';
    window.history.pushState({ activePage: page }, '', path);
  }

  useEffect(() => {
    if (tanpuraRef.current?.masterGain) {
      tanpuraRef.current.masterGain.gain.setTargetAtTime(volumeToGain(volume), tanpuraRef.current.context.currentTime, 0.04);
    }
  }, [volume]);

  useEffect(() => {
    if (tanpuraOn) {
      stopTanpura();
      startTanpura();
    }
    preloadTamburaBuffer(pitch, tanpuraMode).catch(() => {});
  }, [pitch, tanpuraMode]);

  useEffect(() => {
    return () => {
      stopTanpura();
      stopSwaraPlayback();
      stopRecordedPlayback();
    };
  }, []);

  useEffect(() => {
    setCompanionMessages([
      {
        role: 'assistant',
        content: `Namaskara. I am Mitra for ${selected.name}. Ask me about arohana, avarohana, pakad, practice, chords, or raga recognition.`
      }
    ]);
    setCompanionInput('');
    setCompanionError('');
  }, [selected.id]);

  useEffect(() => {
    if (metronomeOn) {
      stopMetronome();
      startMetronome();
    }
  }, [tempo, pitch, metronomeVolume, practiceSystem, talaId]);

  useEffect(() => {
    return () => stopMetronome();
  }, []);

  function setTempoClamped(nextTempo) {
    setTempo(Math.min(240, Math.max(30, nextTempo)));
  }

  async function startTanpura() {
    stopTanpura();
    const startToken = tanpuraStartTokenRef.current + 1;
    tanpuraStartTokenRef.current = startToken;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    setTanpuraLoading(true);
    const context = new AudioContextClass();
    try {
      await context.resume();
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);
      masterGain.gain.setTargetAtTime(volumeToGain(volume), context.currentTime, 0.08);

      const sample = nearestTamburaSample(pitch, tanpuraMode);
      const audioBuffer = await loadTamburaBuffer(context, pitch, tanpuraMode);
      if (tanpuraStartTokenRef.current !== startToken) {
        context.close();
        return;
      }
      const drone = { context, masterGain, sources: [], timers: [], stopped: false };
      tanpuraRef.current = drone;
      scheduleTamburaSegments(drone, audioBuffer, sample.rate, sample.note);
      setTanpuraOn(true);
    } catch (error) {
      context.close();
      tanpuraRef.current = null;
      setTanpuraOn(false);
    } finally {
      setTanpuraLoading(false);
    }
  }

  function stopTanpura() {
    tanpuraStartTokenRef.current += 1;
    const drone = tanpuraRef.current;
    if (!drone) {
      setTanpuraOn(false);
      setTanpuraLoading(false);
      return;
    }
    const now = drone.context.currentTime;
    drone.masterGain.gain.cancelScheduledValues(now);
    drone.masterGain.gain.setTargetAtTime(0, now, 0.04);
    drone.stopped = true;
    drone.timers.forEach((timer) => window.clearTimeout(timer));
    drone.sources.forEach((source) => {
      try {
        source.stop(now + 0.16);
      } catch {
        // The pluck may have ended naturally before the user stopped the tanpura.
      }
    });
    setTimeout(() => drone.context.close(), 220);
    tanpuraRef.current = null;
    setTanpuraOn(false);
    setTanpuraLoading(false);
  }

  function toggleTanpura() {
    if (tanpuraLoading) return;
    if (tanpuraOn) {
      stopTanpura();
      return;
    }
    startTanpura();
  }

  function startMetronome() {
    stopMetronome();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    context.resume();
    let beat = 0;
    const tala = getActiveTala(practiceSystem, talaId);
    const click = () => {
      const now = context.currentTime;
      const currentBeat = (beat % tala.beats) + 1;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const sa = noteToFrequency(pitch, 5);
      const pa = sa * 1.5;
      const isSam = currentBeat === 1;
      const isAccent = tala.accents.includes(currentBeat);
      const isKhali = tala.khali?.includes(currentBeat);
      oscillator.type = isSam ? 'triangle' : isKhali ? 'sine' : 'square';
      oscillator.frequency.value = isSam ? sa : isAccent ? pa : sa * 2;
      const clickGain = metronomeVolumeToGain(metronomeVolume);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(isSam ? clickGain * 1.28 : isKhali ? clickGain * 0.42 : clickGain, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.11);
      setBeatCount(currentBeat);
      beat += 1;
    };
    click();
    const intervalId = window.setInterval(click, 60000 / tempo);
    metronomeRef.current = { context, intervalId };
    setMetronomeOn(true);
  }

  function stopMetronome() {
    const metro = metronomeRef.current;
    if (!metro) {
      setMetronomeOn(false);
      return;
    }
    window.clearInterval(metro.intervalId);
    metro.context.close();
    metronomeRef.current = null;
    setMetronomeOn(false);
    setBeatCount(0);
  }

  async function askCompanion(promptText) {
    const question = String(promptText || companionInput).trim();
    if (!question || companionLoading) return;
    const companionRaga = findMentionedRaga(question, selected) || selected;

    const nextMessages = [...companionMessages, { role: 'user', content: question }];
    setCompanionMessages(nextMessages);
    setCompanionInput('');
    setCompanionLoading(true);
    setCompanionError('');

    try {
      const response = await fetch('/api/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: companionMessages,
          raga: {
            name: companionRaga.name,
            system: companionRaga.system,
            family: companionRaga.family,
            arohana: companionRaga.arohana,
            avarohana: companionRaga.avarohana,
            pakad: companionRaga.pakad,
            notes: companionRaga.notes
          }
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Companion did not respond.');
      setCompanionMessages((current) => [...current, {
        role: 'assistant',
        content: payload.answer || 'I am here, but I could not form a useful answer yet.'
      }]);
    } catch (error) {
      const engineMessage = error.message || 'AI engine is not connected.';
      setCompanionError(engineMessage);
      setCompanionMessages((current) => [...current, {
        role: 'assistant',
        content: engineMessage
      }]);
    } finally {
      setCompanionLoading(false);
    }
  }

  function toggleMetronome() {
    if (metronomeOn) {
      stopMetronome();
      return;
    }
    startMetronome();
  }

  async function startSaDetection() {
    if (detector.status === 'listening') {
      finishSaDetection();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setDetector((current) => ({
        ...current,
        status: 'error',
        stage: 'Microphone is not available.',
        processLog: ['Mic check failed: this browser cannot access a microphone.'],
        error: 'Microphone access is not available in this browser.'
      }));
      return;
    }

    try {
      setDetector((current) => ({
        ...current,
        status: 'listening',
        heardNotes: [],
        root: '',
        confidence: 0,
        frequencyRange: '',
        stage: 'Requesting microphone permission...',
        processLog: ['Requesting access to your system mic.'],
        error: ''
      }));
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      setDetector((current) => ({
        ...current,
        status: 'listening',
        stage: 'Listening now. Continue singing Sa until you are ready.',
        processLog: ['Mic connected.', 'Listening now: sing Sa steadily.', 'Tap Stop & Detect when you want me to choose the root.']
      }));
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      const session = {
        stream,
        audioContext,
        analyser,
        buffer,
        samples: [],
        heard: [],
        rafId: 0,
        silentFrames: 0
      };
      detectorSessionRef.current = session;
      let frame = 0;

      const tick = () => {
        if (detectorSessionRef.current !== session) return;
        analyser.getFloatTimeDomainData(buffer);
        const frequency = detectPitch(buffer, audioContext.sampleRate);
        if (frequency) {
          session.samples.push(frequency);
          const detected = frequencyToNote(frequency);
          session.heard.push({ note: detected.note, frequency });
          session.silentFrames = 0;
          setDetector((current) => ({
            ...current,
            status: 'listening',
            note: detected.note,
            cents: detected.cents,
            frequency,
            heardNotes: summarizeHeardNotes(session.heard).slice(0, 5),
            stage: `Detecting notes... I hear ${detected.note}. Keep singing or tap Stop & Detect.`,
            processLog: [
              'Mic connected.',
              'Listening continues until you tap Stop & Detect.',
              `Detecting notes: latest pitch is ${detected.note} at ${frequency.toFixed(1)} Hz.`,
              'When you are done singing Sa, tap Stop & Detect.'
            ],
            error: ''
          }));
        } else {
          session.silentFrames += 1;
        }

        if (frame === 20 || session.silentFrames === 45) {
          setDetector((current) => ({
            ...current,
            status: 'listening',
            stage: 'Continue to sing. I am waiting for a stable pitch.',
            processLog: [
              'Mic connected.',
              'Listening continues until you tap Stop & Detect.',
              'Waiting for a clear, stable pitch.',
              'Sing one steady Sa close to the mic.'
            ]
          }));
        }
        frame += 1;
        session.rafId = requestAnimationFrame(tick);
      };

      tick();
    } catch (error) {
      setDetector((current) => ({
        ...current,
        status: 'error',
        heardNotes: [],
        root: '',
        confidence: 0,
        frequencyRange: '',
        stage: error?.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : 'Could not start detection.',
        processLog: [
          error?.name === 'NotAllowedError'
            ? 'Mic permission blocked: allow microphone access and try again.'
            : 'Detection could not start. Try again from the browser.'
        ],
        error: error?.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : 'Could not start microphone detection.'
      }));
    }
  }

  function finishSaDetection() {
    const session = detectorSessionRef.current;
    if (!session) return;

    cancelAnimationFrame(session.rafId);
    session.stream.getTracks().forEach((track) => track.stop());
    session.audioContext.close();
    detectorSessionRef.current = null;

    const stable = median(session.samples);
    if (!stable) {
      setDetector({
        status: 'error',
        note: pitch,
        cents: 0,
        frequency: 0,
        heardNotes: [],
        root: '',
        confidence: 0,
        frequencyRange: '',
        stage: 'No stable Sa detected.',
        processLog: [
          'Mic connected.',
          'Listening stopped by you.',
          'Could not lock onto a stable pitch. Try one steady Sa with less background noise.'
        ],
        error: 'I could not lock onto a stable pitch. Try singing Sa steadily, then tap Stop & Detect.'
      });
      return;
    }

    const detected = frequencyToNote(stable);
    const heardNotes = summarizeHeardNotes(session.heard);
    const topHeard = heardNotes[0];
    const minFrequency = Math.min(...session.samples);
    const maxFrequency = Math.max(...session.samples);
    const confidence = topHeard ? Math.round((topHeard.count / session.heard.length) * 100) : 0;
    setPitch(detected.note);
    setDetector({
      status: 'detected',
      note: detected.note,
      cents: detected.cents,
      frequency: stable,
      heardNotes,
      root: detected.note,
      confidence,
      frequencyRange: `${minFrequency.toFixed(1)}-${maxFrequency.toFixed(1)} Hz`,
      stage: `Detection complete. Your Sa is ${detected.note}.`,
      processLog: [
        'Mic connected.',
        'Listening stopped by you.',
        `Notes heard: ${heardNotes.slice(0, 4).map((item) => `${item.note} (${item.count})`).join(', ')}.`,
        `Root selected: ${detected.note}. Scale and chords updated.`
      ],
      error: ''
    });
  }

  async function startRagaDetection() {
    if (ragaDetector.status === 'listening') {
      finishRagaDetection();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setRagaDetector((current) => ({
        ...current,
        status: 'error',
        stage: 'Microphone is not available.',
        processLog: ['Mic check failed: this browser cannot access a microphone.'],
        error: 'Microphone access is not available in this browser.'
      }));
      return;
    }

    try {
      setRagaDetector({
        status: 'listening',
        root: '',
        heardNotes: [],
        heardSwaras: [],
        rejectedSwaras: [],
        evidenceFrames: [],
        evidencePath: [],
        syllables: [],
        syllableTranscript: '',
        syllableStatus: 'starting',
        pitchSyllables: [],
        analysisSummary: '',
        matches: [],
        stage: 'Listening. I will lock Sa from your first steady note.',
        processLog: ['Mic connected.', 'Finding Sa from your first steady note.', 'After Sa, sing Arohana and Avarohana slowly. Tap Stop & Identify when done.'],
        error: ''
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      const session = {
        stream,
        audioContext,
        analyser,
        buffer,
        samples: [],
        heard: [],
        rootSamples: [],
        pitchWindow: [],
        lastAcceptedFrequency: 0,
        rafId: 0,
        silentFrames: 0,
        lastInterval: null,
        root: '',
        syllables: [],
        syllableTranscript: '',
        syllableStatus: 'starting',
        speechRecognition: null
      };
      session.speechRecognition = startSwaraSyllableRecognition(({ syllables, transcript, status }) => {
        session.syllables = syllables;
        session.syllableTranscript = transcript;
        session.syllableStatus = status;
      });
      if (!session.speechRecognition) session.syllableStatus = 'not-supported';
      ragaSessionRef.current = session;

      const tick = () => {
        if (ragaSessionRef.current !== session) return;
        analyser.getFloatTimeDomainData(buffer);
        const rawFrequency = detectPitch(buffer, audioContext.sampleRate);
        const frequency = smoothDetectedFrequency(session, rawFrequency);
        if (frequency) {
          const detected = frequencyToNote(frequency);
          if (!isStableDetectedPitch(detected, session.root ? 52 : 44)) {
            session.silentFrames += 1;
            session.rafId = requestAnimationFrame(tick);
            return;
          }
          session.samples.push(frequency);

          if (!session.root) {
            session.rootSamples.push({ note: detected.note, frequency });
            const rootNotes = summarizeHeardNotes(session.rootSamples);
            const candidateRoot = rootNotes[0]?.note || detected.note;
            const rootConfidence = rootNotes[0] ? rootNotes[0].count / session.rootSamples.length : 0;
            if (session.rootSamples.length >= 18 && rootConfidence >= 0.72) {
              session.root = candidateRoot;
              setPitch(candidateRoot);
            }
            setRagaDetector((current) => ({
              ...current,
              status: 'listening',
              root: session.root,
              heardNotes: rootNotes.slice(0, 4),
              stage: session.root ? `Sa locked as ${session.root}. Continue Arohana and Avarohana.` : `Finding Sa... hold ${candidateRoot} steadily before singing the scale.`,
              processLog: [
                'Mic connected.',
                session.root ? `Sa locked from your voice: ${session.root}.` : `Finding Sa: ${candidateRoot} at ${Math.round(rootConfidence * 100)}% stability.`,
                describeSyllableLayer(session),
                'Now sing Arohana and Avarohana slowly.',
                'Tap Stop & Identify when done.'
              ],
              error: ''
            }));
            session.silentFrames = 0;
            session.rafId = requestAnimationFrame(tick);
            return;
          }

          const interval = noteToInterval(detected.note, session.root);
          session.heard.push({ note: detected.note, frequency, interval });
          session.silentFrames = 0;
          const swaraEvidence = selectDecisionSwaras(summarizeStableHeardIntervals(buildHeldSwaraSegments(session.heard)));
          const heardSwaras = cleanDetectedSwaras(swaraEvidence.kept);
          const shouldRefreshUi = interval !== session.lastInterval || session.heard.length % 5 === 0;
          session.lastInterval = interval;
          if (shouldRefreshUi) {
            setRagaDetector((current) => ({
              ...current,
              status: 'listening',
              heardNotes: summarizeHeardNotes(session.heard).slice(0, 6),
              heardSwaras,
              rejectedSwaras: swaraEvidence.rejected,
              stage: `Listening... latest note ${detected.note} = ${intervalLabels[interval]}.`,
              processLog: [
                'Mic connected.',
                `Sa locked from your voice: ${session.root}.`,
                'Comparing stable pitch, swara path, and raga grammar evidence.',
                describeSyllableLayer(session),
                `Detected swaras so far: ${heardSwaras.map((item) => item.swara).join(' ') || 'waiting...'}`,
                'Tap Stop & Identify after Arohana and Avarohana.'
              ],
              error: ''
            }));
          }
        } else {
          session.silentFrames += 1;
          if (session.silentFrames === 45) {
            setRagaDetector((current) => ({
              ...current,
              status: 'listening',
              stage: 'Continue singing. I am waiting for clear notes.',
              processLog: [
                'Mic connected.',
                session.root ? `Sa locked from your voice: ${session.root}.` : 'Still finding Sa from your first steady note.',
                'Waiting for clear pitch samples.',
                'Try singing one note at a time with less background noise.'
              ]
            }));
          }
        }
        session.rafId = requestAnimationFrame(tick);
      };

      tick();
    } catch (error) {
      setRagaDetector((current) => ({
        ...current,
        status: 'error',
        root: '',
        stage: error?.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : 'Could not start raga detection.',
        processLog: [
          error?.name === 'NotAllowedError'
            ? 'Mic permission blocked: allow microphone access and try again.'
            : 'Detection could not start. Try again from the browser.'
        ],
        error: error?.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : 'Could not start raga detection.'
      }));
    }
  }

  function finishRagaDetection() {
    const session = ragaSessionRef.current;
    if (!session) return;

    cancelAnimationFrame(session.rafId);
    session.speechRecognition?.stop?.();
    session.stream.getTracks().forEach((track) => track.stop());
    session.audioContext.close();
    ragaSessionRef.current = null;

    const heardSegments = buildHeldSwaraSegments(session.heard);
    const evidenceFrames = buildEvidenceFrames(heardSegments, session.root, session.syllables);
    const syllableEvidence = buildSyllableEvidence(session.syllables);
    const swaraEvidence = selectDecisionSwaras(mergeSyllableIntervals(summarizeStableHeardIntervals(heardSegments), syllableEvidence));
    const heardSwaras = cleanDetectedSwaras(swaraEvidence.kept);
    if (!session.root || !heardSwaras.length) {
      setRagaDetector({
        status: 'error',
        root: session.root || '',
        heardNotes: [],
        heardSwaras: [],
        rejectedSwaras: swaraEvidence.rejected,
        evidenceFrames,
        evidencePath: [],
        syllables: session.syllables,
        syllableTranscript: session.syllableTranscript,
        syllableStatus: session.syllableStatus,
        pitchSyllables: [],
        analysisSummary: session.root
          ? `Sa was detected as ${session.root}, but there were not enough stable held notes for a raga decision.`
          : 'Sa was not locked, so the raga decision was skipped.',
        matches: [],
        stage: session.root ? `Could not identify the raga yet. Detected Sa is ${session.root}.` : 'Could not lock Sa yet.',
        processLog: [
          'Mic connected.',
          'Listening stopped by you.',
          session.root ? `Detected Sa from voice: ${session.root}.` : 'I could not lock a stable Sa from the first note.',
          'I did not get enough stable Arohana/Avarohana notes to complete the comparison.'
        ],
        error: session.root
          ? `Sa detected: ${session.root}. Raga not detected yet. Try singing clear Arohana and Avarohana slowly.`
          : 'Sa not detected yet. Start with a steady Sa, then sing the scale.'
      });
      return;
    }

    const cleanedIntervals = new Set(heardSwaras.map((item) => item.interval));
    const heardSequence = compactHeardIntervalSequence(heardSegments, cleanedIntervals);
    const syllableSequence = buildSyllableIntervalSequence(session.syllables, cleanedIntervals);
    const evidenceSequence = mergeEvidenceSequence(heardSequence, syllableSequence);
    const pitchSyllables = deriveSyllableLabelsFromIntervals(evidenceSequence);
    const matches = matchRagas(heardSwaras, allRagaDnaRagas, evidenceSequence, syllableEvidence, ragaDnaFeatures);
    const confirmedMatch = matches.find((match) => match.strong);
    const madhyamamDiagnosis = describeMadhyamamCapture(heardSwaras, session.root);
    const tooManySwaras = heardSwaras.length > 8;
    const analysisSummary = describeRagaDecision(session.root, evidenceFrames, evidenceSequence, matches);
    setRagaDetector({
      status: 'detected',
      root: session.root,
      heardNotes: summarizeHeardNotes(session.heard).slice(0, 6),
      heardSwaras,
      rejectedSwaras: swaraEvidence.rejected,
      evidenceFrames,
      evidencePath: evidenceSequence,
      syllables: session.syllables,
      syllableTranscript: session.syllableTranscript,
      syllableStatus: session.syllableStatus,
      pitchSyllables,
      analysisSummary,
      matches,
      stage: confirmedMatch
        ? `Likely raga: ${confirmedMatch.name} (${confirmedMatch.score}%).`
        : tooManySwaras
          ? `Could not identify confidently. Too many swara variants were detected; Sa may be wrong or the scale was not sung steadily.`
          : `Could not identify the raga yet. Detected Sa is ${session.root}.`,
      processLog: [
        'Mic connected.',
        'Listening stopped by you.',
        `Sa detected from your voice: ${session.root}.`,
        'Compared stable pitch, swara path, and raga grammar evidence.',
        describeSyllableLayer(session, true),
        `Clock 0 fallback path: ${pitchSyllables.join(' ') || 'not available'}.`,
        `Heard swaras: ${heardSwaras.map((item) => item.swara).join(' ')}.`,
        madhyamamDiagnosis,
        `Heard scale path: ${evidenceSequence.map((interval) => intervalLabels[interval]).join(' ') || 'not enough ordered notes'}.`,
        confirmedMatch ? `Top match: ${confirmedMatch.name} at ${confirmedMatch.score}%.` : 'No confident raga match. Hold Sa first, then sing the scale one note at a time.'
      ],
      error: ''
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>RAGA Companion</span>
        </div>
        <nav className="nav">
          <button className={`nav-item ${activePage === 'practice' ? 'active' : ''}`} onClick={() => navigateToPage('practice')}><Compass size={17} /> Practice</button>
          <button className={`nav-item ${activePage === 'raga-dna' ? 'active' : ''}`} onClick={() => navigateToPage('raga-dna')}><Search size={17} /> RagaDNA</button>
          <button className={`nav-item ${activePage === 'shruthi' ? 'active' : ''}`} onClick={() => navigateToPage('shruthi')}><Wind size={17} /> Shruthi &amp; Tala</button>
          <button className={`nav-item ${activePage === 'chords' ? 'active' : ''}`} onClick={() => navigateToPage('chords')}><Wand2 size={17} /> Chord Analyser</button>
          <button className={`nav-item ${activePage === 'karnatik' ? 'active' : ''}`} onClick={() => navigateToPage('karnatik')}><BookOpen size={17} /> Karnatik Ragas</button>
          <button className={`nav-item ${activePage === 'quiz' ? 'active' : ''}`} onClick={() => navigateToPage('quiz')}><ClipboardList size={17} /> Quiz</button>
          <button className={`nav-item ${activePage === 'ear-training' ? 'active' : ''}`} onClick={() => navigateToPage('ear-training')}><Music2 size={17} /> Ear Training</button>
          {canAccessPlanner ? (
            <button className={`nav-item ${activePage === 'planner' ? 'active' : ''}`} onClick={() => navigateToPage('planner')}><Columns3 size={17} /> Planner</button>
          ) : null}
        </nav>
        <div className="top-actions">
          <span className="signed-in-user"><UserCircle2 size={18} /> {user?.email || 'Beta user'}</span>
          <button className="sign-out-button" onClick={onSignOut}><LogOut size={17} /> Sign out</button>
        </div>
      </header>

      <main className={`workspace ${!showLibraryPane && !showCompanionPane ? 'workspace-full' : ''} ${!showCompanionPane ? 'workspace-no-companion' : ''}`}>
        {showLibraryPane && (
        <aside className="library-pane">
          <div className="pane-title">Raga Library</div>
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ragas..." />
          </label>
          <div className="segmented">
            {systems.map((item) => (
              <button key={item} className={system === item ? 'selected' : ''} onClick={() => setSystem(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="raga-list">
            {filtered.map((raga) => (
              <button
                key={raga.id}
                className={`raga-row ${raga.id === selected.id ? 'active' : ''}`}
                onClick={() => setSelectedId(raga.id)}
              >
                <span>
                  <strong>{raga.name}</strong>
                  <small>{raga.family} · {raga.time}</small>
                </span>
                <Star size={17} />
              </button>
            ))}
          </div>
          <button className="add-button"><Plus size={17} /> Add to My Ragas</button>
        </aside>
        )}

        {activePage === 'planner' ? (
          <PlannerPage canAccess={canAccessPlanner} user={user} />
        ) : activePage === 'raga-dna' ? (
          <RagaDnaPage ragaDetector={ragaDetector} startRagaDetection={startRagaDetection} selected={selected} pitch={pitch} />
        ) : activePage === 'shruthi' ? (
          <ShruthiPage
            pitch={pitch}
            setPitch={setPitch}
            tanpuraMode={tanpuraMode}
            setTanpuraMode={setTanpuraMode}
            volume={volume}
            setVolume={setVolume}
            tanpuraOn={tanpuraOn}
            tanpuraLoading={tanpuraLoading}
            toggleTanpura={toggleTanpura}
            metronomeOn={metronomeOn}
            beatCount={beatCount}
            tempo={tempo}
            setTempoClamped={setTempoClamped}
            metronomeVolume={metronomeVolume}
            setMetronomeVolume={setMetronomeVolume}
            toggleMetronome={toggleMetronome}
            stopMetronome={stopMetronome}
            practiceSystem={practiceSystem}
            setPracticeSystem={setPracticeSystem}
            talaId={talaId}
            setTalaId={setTalaId}
            activeTala={activeTala}
          />
        ) : activePage === 'karnatik' ? (
          <KarnatikRagasPage />
        ) : activePage === 'chords' ? (
          <ChordAnalyserPage pitch={pitch} setPitch={setPitch} selectedId={selected.id} />
        ) : activePage === 'quiz' ? (
          <RagaQuizPage pitch={pitch} />
        ) : activePage === 'ear-training' ? (
          <EarTrainingPage pitch={pitch} />
        ) : (
          <section className="raga-pane">
            <div className="raga-header">
              <div>
                <h1>{selected.name} <Star className="title-star" size={21} /></h1>
                <p>{selected.family} · {selected.time}</p>
              </div>
              <button className="notation-button">View in Notation <ChevronDown size={16} /></button>
            </div>

          <div className="tag-row">
            {selected.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <div className="scale-grid">
            <ScaleBlock title="Arohana" notes={selected.arohana} />
            <ScaleBlock title="Avarohana" notes={selected.avarohana} />
          </div>

          <div className="facts-row">
            <Fact title="Vadi / Samvadi" body={`${selected.vadi}\n${selected.samvadi}`} />
            <Fact title="Jati" body={selected.tags.includes('Audava') ? 'Audava' : 'Sampoorna focus'} />
            <Fact title="Pakad / Chalan" body={selected.pakad} />
          </div>

          <div className="content-split">
            <section>
              <h2>Key Phrases</h2>
              <div className="phrase-list">
                {selected.phrases.map((phrase) => (
                  <button key={phrase}>
                    <span>{phrase}</span>
                    <Play size={15} />
                  </button>
                ))}
              </div>
            </section>
            <section className="mood-panel">
              <h2>Mood & Time</h2>
              <p><Sparkles size={18} /> {selected.mood}</p>
              <p><Clock3 size={18} /> {selected.time}</p>
              <h3>Notes</h3>
              <p>{selected.notes}</p>
            </section>
          </div>

          <section className="harmony-panel">
            <div className="section-heading">
              <div>
                <h2>Scale & Chord Suggestions</h2>
                <p>Prototype logic maps swaras to the selected tonic and suggests chords using only raga notes.</p>
              </div>
              <label>Your Sa / Root Key
                <select value={pitch} onChange={(event) => setPitch(event.target.value)}>
                  {chromatic.map((note) => <option key={note}>{note}</option>)}
                </select>
              </label>
            </div>
            <div className="sa-detector">
              <div>
                <span>{detector.status === 'listening' ? 'Listening for Sa' : detector.status === 'detected' ? 'Detected Sa' : 'Voice Detection'}</span>
                <strong>{detector.note}</strong>
                <small>
                  {detector.stage}
                </small>
                {detector.frequency > 0 && <small>{`${detector.frequency.toFixed(1)} Hz · ${detector.cents > 0 ? '+' : ''}${detector.cents} cents`}</small>}
                {detector.error && <small className="detector-error">{detector.error}</small>}
              </div>
              <button className={detector.status === 'listening' ? 'listening' : detector.status === 'detected' ? 'detected' : ''} onClick={startSaDetection}>
                {detector.status === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
                {detector.status === 'listening' ? 'Stop & Detect' : 'Detect My Sa'}
              </button>
            </div>
            {detector.processLog.length > 0 && (
              <div className={`detector-process ${detector.status}`}>
                {detector.processLog.map((line, index) => (
                  <p key={`${line}-${index}`}>
                    <b>{index + 1}</b>
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            )}
            {(detector.status === 'listening' || detector.status === 'detected') && (
              <div className={`detection-report ${detector.status}`}>
                <div>
                  <span>Root Heard</span>
                  <strong>{detector.root || detector.note}</strong>
                </div>
                <div>
                  <span>Notes Heard</span>
                  <p>
                    {detector.heardNotes.length
                      ? detector.heardNotes.map((item) => `${item.note} (${item.count})`).join(' · ')
                      : 'Listening...'}
                  </p>
                </div>
                <div>
                  <span>Detection Summary</span>
                  <p>
                    {detector.status === 'listening'
                      ? 'Hold Sa steadily. I am collecting pitch samples.'
                      : `${detector.confidence}% match · ${detector.frequencyRange}`}
                  </p>
                </div>
              </div>
            )}
            <div className="scale-map">
              {harmony.scale.map((item) => (
                <span key={`${item.swara}-${item.note}`}>
                  <b>{item.displaySwara}</b>
                  {item.note}
                </span>
              ))}
            </div>
            <div className="chord-grid">
              {harmony.chords.map((chord) => (
                <button key={chord.name} className={chord.priority === 'anchor' ? 'anchor' : chord.priority === 'careful' ? 'careful' : ''}>
                  <strong>{chord.name}</strong>
                  <span>{chord.notes.join(' - ')}</span>
                  <em>{chord.role}</em>
                  <small>{chord.reason}</small>
                </button>
              ))}
            </div>
            <div className="avoid-row">
              <b>Avoid / Use Carefully</b>
              <span>{harmony.avoid.join(', ')}</span>
            </div>
          </section>

          <section className="notation-panel">
            <h2>Swara Notation <span>Sargam practice</span></h2>
            <div className="staff">
              {selected.arohana.concat('|', selected.avarohana).map((note, index) => (
                <span key={`${note}-${index}`} className={note === '|' ? 'bar' : ''}>{note}</span>
              ))}
            </div>
            <div className="notation-controls">
              <button className="primary-small"><Play size={15} /> Play</button>
              <button>Loop</button>
              <label>Speed <input type="range" min="50" max="130" defaultValue="100" /> 100%</label>
            </div>
          </section>

          <section className="practice-section">
            <h2>Practice Steps</h2>
            <div className="practice-grid">
              {practiceSteps.map((step, index) => (
                <button
                  key={step}
                  className={activeStep === index ? 'active' : ''}
                  onClick={() => setActiveStep(index)}
                >
                  <b>{index + 1}</b>
                  <span>{step}</span>
                  <small>{index === 0 ? '10 min' : index === 2 ? '15 min' : '12 min'}</small>
                </button>
              ))}
            </div>
          </section>

          </section>
        )}

        {showCompanionPane && (
        <aside className="companion-pane">
          <div className="pane-title">Raga Companion</div>
          <div className="chat">
            {companionMessages.map((message, index) => (
              <div className={`bubble ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {companionLoading && <div className="bubble assistant thinking">Mitra is listening...</div>}
            {companionError && <p className="companion-error">{companionError}</p>}
          </div>
          <div className="quick-actions">
            <button onClick={() => askCompanion(`Give me a 10 minute practice plan for ${selected.name}.`)}><Play size={15} /> Practice Plan</button>
            <button onClick={() => askCompanion(`Explain the pakad and important phrases of ${selected.name}.`)}><MessageCircle size={15} /> Explain Pakad</button>
            <button onClick={() => askCompanion(`How should I sing ${selected.name} with tanpura in ${pitch} Sa?`)}><Wind size={15} /> Shruthi Guide</button>
            <button onClick={() => askCompanion(`Compare ${selected.name} with a similar raga and tell me how not to confuse them.`)}><Music2 size={15} /> Similar Raga</button>
          </div>
          <form className="ask-box" onSubmit={(event) => {
            event.preventDefault();
            askCompanion();
          }}>
            <input
              value={companionInput}
              onChange={(event) => setCompanionInput(event.target.value)}
              placeholder="Ask Mitra about this raga..."
            />
            <button type="submit" aria-label="Send companion message"><Send size={18} /></button>
          </form>
        </aside>
        )}
      </main>
    </div>
  );
}

function ShruthiPage({
  pitch,
  setPitch,
  tanpuraMode,
  setTanpuraMode,
  volume,
  setVolume,
  tanpuraOn,
  tanpuraLoading,
  toggleTanpura,
  metronomeOn,
  beatCount,
  tempo,
  setTempoClamped,
  metronomeVolume,
  setMetronomeVolume,
  toggleMetronome,
  stopMetronome,
  practiceSystem,
  setPracticeSystem,
  talaId,
  setTalaId,
  activeTala
}) {
  const talaOptions = talaPresets[practiceSystem] || talaPresets.karnatik;

  return (
    <section className="raga-pane shruthi-page">
      <div className="raga-header">
        <div>
          <h1>Shruthi &amp; Tala</h1>
          <p>Tanpura drone, tala bols, and pitch-aligned rhythm for Karnatik and Hindustani practice.</p>
        </div>
      </div>

      <div className="practice-orientation">
        {practiceSystems.map((item) => (
          <button
            key={item.id}
            className={practiceSystem === item.id ? 'active' : ''}
            onClick={() => {
              setPracticeSystem(item.id);
              setTalaId(talaPresets[item.id][0].id);
            }}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </div>

      <div className="shruthi-layout">
        <section className="shruthi-tool-card">
          <div className="section-heading">
            <div>
              <h2>Tanpura</h2>
              <p>Actual tanpura samples, pitch shifted across keys for beta practice.</p>
            </div>
            <button className="notation-button" onClick={toggleTanpura} disabled={tanpuraLoading}>
              {tanpuraOn ? <Pause size={16} /> : <Play size={16} />}
              {tanpuraLoading ? 'Loading' : tanpuraOn ? 'Stop' : 'Start'}
            </button>
          </div>

          <div className="tanpura-body">
            <div
              className={`tanpura-visual ${metronomeOn && beatCount ? 'tempo-pulse' : ''} ${beatCount === 1 ? 'sam' : ''}`}
              style={{ '--beat-ms': `${60000 / tempo}ms` }}
            >
              <span></span><span></span><span></span><span></span>
            </div>
            <div className="tanpura-controls">
              {getTanpuraStrings(tanpuraMode).map((string, index) => (
                <ControlRow key={`${string.label}-${index}`} label={string.label} value={string.value} accent={string.accent} />
              ))}
              <label className="select-label">Drone Preset
                <select value={tanpuraMode} onChange={(event) => setTanpuraMode(event.target.value)}>
                  <option value="sa-pa">Sa-Pa-Sa-Sa</option>
                  <option value="sa-ma">Sa-Ma-Sa-Sa</option>
                </select>
              </label>
              <label className="select-label">Pitch
                <select value={pitch} onChange={(event) => setPitch(event.target.value)}>
                  {chromatic.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="range-label"><Volume2 size={16} /> Tanpura Volume
                <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(event.target.value)} />
                <span>{volume}%</span>
              </label>
            </div>
          </div>
        </section>

        <section className="shruthi-tool-card">
          <div className="section-heading">
            <div>
              <h2>Tala / Taal</h2>
              <p>Follow the active bol while the pitch-aligned click keeps the selected cycle.</p>
            </div>
            <button className="notation-button" onClick={toggleMetronome}>
              {metronomeOn ? <Pause size={16} /> : <Play size={16} />}
              {metronomeOn ? 'Stop' : 'Start'}
            </button>
          </div>

          <div className="metronome-panel">
            <div className="metronome-readout">
              <span>Tempo</span>
              <strong>{tempo}</strong>
              <small>BPM</small>
            </div>
            <div className="tala-panel">
              <label className="select-label">Tala / Taal
                <select value={talaId} onChange={(event) => setTalaId(event.target.value)}>
                  {talaOptions.map((tala) => (
                    <option key={tala.id} value={tala.id}>{tala.name}</option>
                  ))}
                </select>
              </label>
              <div className="tala-meter-detail">
                <span>Time Signature</span>
                <strong>{activeTala.timeSignature}</strong>
                <small>{activeTala.beats} beats · {activeTala.meter}</small>
              </div>
            </div>
            <div className="tala-notation" aria-live="polite">
              <div className="tala-notation-heading">
                <span>{practiceSystem === 'karnatik' ? 'Sollukattu' : 'Tabla Bols'}</span>
                <small>Western time signature is a practice mapping; the tala cycle remains primary.</small>
              </div>
              <div className={`bol-cycle ${activeTala.beats > 12 ? 'dense' : ''}`}>
                {activeTala.bols.map((bol, index) => {
                  const beat = index + 1;
                  return (
                    <div
                      key={`${activeTala.id}-${beat}`}
                      className={`bol-beat ${beatCount === beat ? 'active' : ''} ${beat === 1 ? 'sam' : ''} ${activeTala.accents.includes(beat) ? 'accent' : ''} ${activeTala.khali?.includes(beat) ? 'khali' : ''}`}
                    >
                      <span>{beat}</span>
                      <strong>{bol}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="tala-legend">
                <span><i className="sam-key"></i> Sam</span>
                <span><i className="accent-key"></i> Vibhag / Anga</span>
                {activeTala.khali?.length ? <span><i className="khali-key"></i> Khali</span> : null}
              </div>
            </div>
            <div className="beat-meter large" aria-label="Metronome beat">
              {Array.from({ length: activeTala.beats }, (_, index) => index + 1).map((beat) => (
                <span
                  key={beat}
                  className={`${beatCount === beat ? 'active' : ''} ${beat === 1 ? 'sam' : ''} ${activeTala.khali?.includes(beat) ? 'khali' : ''}`}
                >
                  {beat}
                </span>
              ))}
            </div>
            <label className="tempo-control">Tempo
              <button onClick={() => setTempoClamped(tempo - 1)}>-</button>
              <input type="range" min="30" max="240" value={tempo} onInput={(event) => setTempoClamped(Number(event.target.value))} onChange={(event) => setTempoClamped(Number(event.target.value))} />
              <strong>{tempo}</strong>
              <button onClick={() => setTempoClamped(tempo + 1)}>+</button>
            </label>
            <label className="metro-volume"><Volume2 size={16} /> Click Volume
              <input type="range" min="0" max="100" value={metronomeVolume} onInput={(event) => setMetronomeVolume(Number(event.target.value))} onChange={(event) => setMetronomeVolume(Number(event.target.value))} />
              <strong>{metronomeVolume}%</strong>
            </label>
            <button className="secondary-control" onClick={stopMetronome}><Pause size={16} /> Reset Metronome</button>
          </div>
        </section>
      </div>
    </section>
  );
}

const plannerStatusOptions = [
  { id: 'planned', label: 'Planned' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'done', label: 'Done' }
];

function PlannerPage({ canAccess, user }) {
  const [phases, setPhases] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState(() => user?.user_metadata?.karnatik_planner_statuses || {});
  const [status, setStatus] = useState(canAccess ? 'loading' : 'denied');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [savingTaskId, setSavingTaskId] = useState('');

  useEffect(() => {
    if (!canAccess || !supabase) return undefined;

    let cancelled = false;
    async function loadPlanner() {
      setStatus('loading');
      setError('');
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session?.access_token) {
          throw new Error('Your secure session could not be verified. Please sign in again.');
        }

        const response = await fetch('/api/planner', {
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'The product planner could not be loaded.');
        }
        if (!cancelled) {
          setPhases(Array.isArray(payload.phases) ? payload.phases : []);
          setStatus('ready');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'The product planner could not be loaded.');
          setStatus('error');
        }
      }
    }

    loadPlanner();
    return () => {
      cancelled = true;
    };
  }, [canAccess, reloadKey]);

  const allTasks = phases.flatMap((phase) => phase.tasks);
  const progress = allTasks.reduce((summary, task) => {
    const taskStatus = taskStatuses[task.id] || 'planned';
    summary[taskStatus] += 1;
    return summary;
  }, { planned: 0, 'in-progress': 0, blocked: 0, done: 0 });
  const completion = allTasks.length ? Math.round((progress.done / allTasks.length) * 100) : 0;

  async function updateTaskStatus(taskId, nextStatus) {
    if (!supabase || savingTaskId) return;
    const previousStatuses = taskStatuses;
    const nextStatuses = { ...taskStatuses, [taskId]: nextStatus };
    setTaskStatuses(nextStatuses);
    setSavingTaskId(taskId);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({
      data: { karnatik_planner_statuses: nextStatuses }
    });

    setSavingTaskId('');
    if (updateError) {
      setTaskStatuses(previousStatuses);
      setError(`Status was not saved: ${updateError.message}`);
    }
  }

  if (!canAccess) {
    return (
      <section className="raga-pane planner-page private-page-state">
        <LockKeyhole size={28} />
        <h1>Page not available</h1>
        <p>This page is not available for your account.</p>
      </section>
    );
  }

  return (
    <section className="raga-pane planner-page">
      <div className="planner-header">
        <div>
          <span className="planner-kicker">Karnatik.ai delivery roadmap</span>
          <h1>Product Planner</h1>
          <p>Release work, native apps, the web launch, and longer-term music intelligence in one private view.</p>
        </div>
        <span className="owner-only-label"><LockKeyhole size={15} /> Owner only</span>
      </div>

      {status === 'loading' ? (
        <div className="private-page-state compact">
          <p>Loading your private board...</p>
        </div>
      ) : status === 'error' ? (
        <div className="private-page-state compact">
          <h2>Planner unavailable</h2>
          <p>{error}</p>
          <button className="primary-small" onClick={() => setReloadKey((value) => value + 1)}>Retry</button>
        </div>
      ) : (
        <>
          <section className="planner-summary" aria-label="Planner progress">
            <div className="planner-progress-copy">
              <span>Overall completion</span>
              <strong>{completion}%</strong>
            </div>
            <div className="planner-progress-track"><span style={{ width: `${completion}%` }} /></div>
            <dl>
              <div><dt>{progress.done}</dt><dd>Done</dd></div>
              <div><dt>{progress['in-progress']}</dt><dd>In progress</dd></div>
              <div><dt>{progress.blocked}</dt><dd>Blocked</dd></div>
              <div><dt>{progress.planned}</dt><dd>Planned</dd></div>
            </dl>
          </section>

          {error ? <p className="planner-save-error">{error}</p> : null}

          <div className="planner-phases">
            {phases.map((phase) => {
              const phaseDone = phase.tasks.filter((task) => taskStatuses[task.id] === 'done').length;
              return (
                <section className="planner-phase" key={phase.id}>
                  <header>
                    <div className="planner-phase-number">{phase.number}</div>
                    <div>
                      <h2>{phase.title}</h2>
                      <p>{phase.outcome}</p>
                    </div>
                    <div className="planner-phase-target">
                      <span>Target</span>
                      <strong>{phase.target}</strong>
                      <small>{phaseDone}/{phase.tasks.length} complete</small>
                    </div>
                  </header>
                  <div className="planner-task-list">
                    {phase.tasks.map((task) => {
                      const taskStatus = taskStatuses[task.id] || 'planned';
                      return (
                        <article className={`planner-task status-${taskStatus}`} key={task.id}>
                          <span className="planner-task-state" aria-hidden="true" />
                          <div className="planner-task-copy">
                            <strong>{task.title}</strong>
                            <p>{task.detail}</p>
                          </div>
                          <span className={`planner-priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                          <label>
                            <span className="sr-only">Status for {task.title}</span>
                            <select
                              value={taskStatus}
                              disabled={savingTaskId === task.id}
                              onChange={(event) => updateTaskStatus(task.id, event.target.value)}
                            >
                              {plannerStatusOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                            </select>
                          </label>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function RagaDnaPage({ ragaDetector, startRagaDetection, selected, pitch }) {
  const topMatch = ragaDetector.matches?.[0];
  return (
    <section className="raga-pane raga-dna-page">
      <div className="raga-header">
        <div>
          <h1>RagaDNA Detection</h1>
          <p>Detailed pitch, swara, frequency, and library-match analysis for live singing tests.</p>
        </div>
        <button className="notation-button" onClick={startRagaDetection}>
          {ragaDetector.status === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
          {ragaDetector.status === 'listening' ? 'Stop & Identify' : 'Start Detection'}
        </button>
      </div>

      <div className="ragadna-debug-layout">
        <RagaDetectionPanel ragaDetector={ragaDetector} startRagaDetection={startRagaDetection} />

        <section className="ragadna-detail-panel">
          <div className="section-heading">
            <div>
              <h2>Frequency Evidence</h2>
              <p>{ragaDetector.root ? `Sa locked as ${ragaDetector.root}. Current practice context: ${selected.name} in ${pitch} Sa.` : 'Start with a steady Sa, then sing Arohana and Avarohana.'}</p>
            </div>
          </div>

          <div className="ragadna-strength-grid">
            <article>
              <span>Accepted for Decision</span>
              <strong>{ragaDetector.heardSwaras?.length || 0}</strong>
              <p>{formatSwaraCounts(ragaDetector.heardSwaras) || 'Waiting for stable held notes.'}</p>
            </article>
            <article>
              <span>Rejected as Weak Trace</span>
              <strong>{ragaDetector.rejectedSwaras?.length || 0}</strong>
              <p>{formatSwaraCounts(ragaDetector.rejectedSwaras) || 'No weak traces rejected yet.'}</p>
            </article>
            <article>
              <span>Top Candidate</span>
              <strong>{topMatch?.name || 'Pending'}</strong>
              <p>{topMatch ? `${topMatch.score}% score, ${topMatch.fingerprintScore || 0}% sample fingerprint.` : 'No completed run yet.'}</p>
            </article>
          </div>

          <div className="clock-zero-panel">
            <span>Clock 0 Syllable Layer</span>
            <strong>{formatClockZeroStatus(ragaDetector)}</strong>
            <p>Parsed: {ragaDetector.syllables?.map((item) => item.label).join(' ') || 'none from speech'} · Fallback path: {ragaDetector.pitchSyllables?.join(' ') || 'pending'}</p>
            {ragaDetector.syllableTranscript ? <small>Transcript: {ragaDetector.syllableTranscript}</small> : <small>Browser speech returned no usable sung swara text.</small>}
          </div>

          {ragaDetector.evidenceFrames?.length > 0 ? (
            <div className="frequency-table">
              <div className="frequency-table-head">
                <span>#</span>
                <span>Swara</span>
                <span>Note</span>
                <span>Hz</span>
                <span>Samples</span>
              </div>
              {ragaDetector.evidenceFrames.map((frame) => (
                <div key={`${frame.index}-${frame.interval}-${frame.samples}`} className="frequency-row">
                  <span>{frame.index}</span>
                  <strong>{frame.syllable ? `${frame.syllable} / ${frame.swara}` : frame.swara}</strong>
                  <span>{frame.note}</span>
                  <span>{frame.frequency}</span>
                  <span>{frame.samples}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-analysis-box">No recorded frequency segments yet.</div>
          )}

          {ragaDetector.analysisSummary && (
            <div className="recording-analysis-strip wide">
              <span>Run Decision</span>
              <p>{ragaDetector.analysisSummary}</p>
            </div>
          )}

          {ragaDetector.matches?.length > 0 && (
            <div className="ragadna-match-table">
              {ragaDetector.matches.slice(0, 6).map((match) => (
                <article key={match.id}>
                  <strong>{match.name}</strong>
                  <span>{match.score}% · Path {match.sequenceScore}% · Fingerprint {match.fingerprintScore || 0}%</span>
                  <p>Matched {match.matched.join(' ') || 'none'} · Missing {match.missing.join(' ') || 'none'} · Extra {match.extra.join(' ') || 'none'}</p>
                  {match.confusionNotes?.length ? <em>{match.confusionNotes.join(' ')}</em> : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function RagaDetectionPanel({ ragaDetector, startRagaDetection, compact = false }) {
  const hasStrongMatch = ragaDetector.matches?.some((candidate) => candidate.strong);
  const topStrong = ragaDetector.matches?.find((match) => match.strong);
  return (
    <div className={`raga-detection-panel ${compact ? 'compact' : ''}`}>
      <div className="builder-title">
        <div>
          <span><Search size={16} /> Detect Raga</span>
          <p>{ragaDetector.root ? `Detected ${ragaDetector.root} as Sa` : 'Auto-detects Sa from your voice'}</p>
        </div>
        <Sparkles size={20} />
      </div>
      <div className={`raga-detect-status ${ragaDetector.status}`}>
        <div>
          <span>{ragaDetector.status === 'listening' ? 'Listening' : ragaDetector.status === 'detected' ? 'Identified' : 'Raga Finder'}</span>
          <strong>{topStrong?.name || (ragaDetector.status === 'detected' || ragaDetector.status === 'error' ? `Sa: ${ragaDetector.root || 'not locked'}` : 'Sing Sa, then scale')}</strong>
          <small>{ragaDetector.stage}</small>
          {ragaDetector.error && <small className="detector-error">{ragaDetector.error}</small>}
        </div>
        <button className={ragaDetector.status === 'listening' ? 'listening' : ''} onClick={startRagaDetection}>
          {ragaDetector.status === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
          {ragaDetector.status === 'listening' ? 'Stop & Identify' : 'Detect Raga'}
        </button>
      </div>
      <div className={`detector-process ${ragaDetector.status}`}>
        {ragaDetector.processLog.map((line, index) => (
          <p key={`${line}-${index}`}>
            <b>{index + 1}</b>
            <span>{line}</span>
          </p>
        ))}
      </div>
      {(ragaDetector.status === 'listening' || ragaDetector.status === 'detected') && (
        <div className="heard-strip">
          <span>Accepted Swaras</span>
          <p>{formatSwaraCounts(ragaDetector.heardSwaras) || 'Listening...'}</p>
        </div>
      )}
      {ragaDetector.rejectedSwaras?.length > 0 && (
        <div className="heard-strip rejected">
          <span>Rejected Weak Traces</span>
          <p>{formatSwaraCounts(ragaDetector.rejectedSwaras)}</p>
        </div>
      )}
      {compact && ragaDetector.evidenceFrames?.length > 0 && (
        <div className="recording-analysis-strip">
          <span>Frequency Evidence</span>
          <p>{ragaDetector.evidenceFrames.map((frame) => `${frame.swara} ${frame.frequency}Hz`).join(' -> ')}</p>
        </div>
      )}
      {ragaDetector.matches?.length > 0 && (
        <div className="raga-match-list">
          {ragaDetector.matches.slice(0, compact ? 3 : 4).map((match) => (
            <button key={match.id} className={!hasStrongMatch ? 'debug-candidate' : ''}>
              <strong>{match.name}</strong>
              <span>{hasStrongMatch ? `${match.score}% ${match.strong ? 'match' : 'possible only'}` : `${match.score}% debug candidate - not identified`} · {match.sampleCount || 1} samples</span>
              <small>Path: {match.sequenceScore}% · Fingerprint: {match.fingerprintScore || 0}% from {match.fingerprintSamples || 0} clips · Matched: {match.matched.join(' ') || 'none'} · Missing: {match.missing.join(' ') || 'none'} · Extra: {match.extra.join(' ') || 'none'}</small>
              {match.confusionNotes?.length ? <small>{match.confusionNotes.join(' ')}</small> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatSwaraCounts(items = []) {
  return items.length ? items.map((item) => `${item.swara} (${item.count}${item.strength ? `, ${item.strength}%` : ''})`).join(' · ') : '';
}

function ChordAnalyserPage({ pitch, setPitch, selectedId }) {
  const initialRaga = ragas.find((item) => item.id === selectedId) || ragas[0];
  const [analyserMode, setAnalyserMode] = useState('tune');
  const [ragaId, setRagaId] = useState(initialRaga.id);
  const [notationView, setNotationView] = useState('Karnatik');
  const [chordRoot, setChordRoot] = useState(pitch);
  const [chordQuality, setChordQuality] = useState('major');
  const tuneSessionRef = useRef(null);
  const [tuneAnalysis, setTuneAnalysis] = useState({
    status: 'idle',
    root: '',
    heardSwaras: [],
    evidenceFrames: [],
    chords: [],
    stage: 'Hold Sa first, then sing your tune.',
    error: ''
  });
  const raga = ragas.find((item) => item.id === ragaId) || initialRaga;
  const harmony = useMemo(() => getHarmony(raga, pitch), [raga, pitch]);
  const displayedScale = useMemo(
    () => harmony.scale.map((item) => ({ ...item, displaySwara: displaySwaraLabel(item.swara, notationView) })),
    [harmony.scale, notationView]
  );
  const chordCheck = useMemo(
    () => analyseChordAgainstRaga(raga, pitch, chordRoot, chordQuality),
    [raga, pitch, chordRoot, chordQuality]
  );
  const anchorChords = harmony.chords.filter((chord) => chord.priority === 'anchor');
  const colorChords = harmony.chords.filter((chord) => chord.priority === 'color');
  const carefulChords = harmony.chords.filter((chord) => chord.priority === 'careful');

  useEffect(() => () => stopTuneSession(tuneSessionRef.current), []);

  function stopTuneSession(session) {
    if (!session) return;
    cancelAnimationFrame(session.rafId);
    session.stream?.getTracks().forEach((track) => track.stop());
    session.audioContext?.close().catch(() => {});
    if (tuneSessionRef.current === session) tuneSessionRef.current = null;
  }

  function chooseAnalyserMode(nextMode) {
    if (nextMode !== 'tune' && tuneSessionRef.current) {
      stopTuneSession(tuneSessionRef.current);
      setTuneAnalysis((current) => ({
        ...current,
        status: 'idle',
        stage: 'Tune analysis stopped.',
        error: ''
      }));
    }
    setAnalyserMode(nextMode);
  }

  async function toggleTuneAnalysis() {
    if (tuneAnalysis.status === 'listening') {
      finishTuneAnalysis();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setTuneAnalysis((current) => ({
        ...current,
        status: 'error',
        stage: 'Microphone is not available.',
        error: 'This browser cannot access your microphone.'
      }));
      return;
    }

    try {
      setTuneAnalysis({
        status: 'listening',
        root: '',
        heardSwaras: [],
        evidenceFrames: [],
        chords: [],
        stage: 'Listening for a steady Sa.',
        error: ''
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const session = {
        stream,
        audioContext,
        analyser,
        buffer: new Float32Array(analyser.fftSize),
        rootSamples: [],
        heard: [],
        root: '',
        pitchWindow: [],
        lastAcceptedFrequency: 0,
        lastInterval: null,
        rafId: 0
      };
      tuneSessionRef.current = session;

      const tick = () => {
        if (tuneSessionRef.current !== session) return;
        analyser.getFloatTimeDomainData(session.buffer);
        const rawFrequency = detectPitch(session.buffer, audioContext.sampleRate);
        const frequency = smoothDetectedFrequency(session, rawFrequency);
        if (frequency) {
          const detected = frequencyToNote(frequency);
          if (isStableDetectedPitch(detected, session.root ? 52 : 44)) {
            if (!session.root) {
              session.rootSamples.push({ note: detected.note, frequency });
              const rootNotes = summarizeHeardNotes(session.rootSamples);
              const candidateRoot = rootNotes[0]?.note || detected.note;
              const rootConfidence = rootNotes[0] ? rootNotes[0].count / session.rootSamples.length : 0;
              if (session.rootSamples.length >= 18 && rootConfidence >= 0.72) {
                session.root = candidateRoot;
                setPitch(candidateRoot);
                setChordRoot(candidateRoot);
              }
              setTuneAnalysis((current) => ({
                ...current,
                status: 'listening',
                root: session.root,
                stage: session.root
                  ? `Sa locked as ${session.root}. Sing the tune, then stop.`
                  : `Finding Sa: ${candidateRoot} at ${Math.round(rootConfidence * 100)}% stability.`
              }));
            } else {
              const interval = noteToInterval(detected.note, session.root);
              session.heard.push({ note: detected.note, frequency, interval });
              if (interval !== session.lastInterval || session.heard.length % 8 === 0) {
                session.lastInterval = interval;
                const decision = selectDecisionSwaras(summarizeStableHeardIntervals(buildHeldSwaraSegments(session.heard)));
                const heardSwaras = includeDetectedSa(
                  cleanDetectedSwaras(decision.kept),
                  session.rootSamples.length
                );
                setTuneAnalysis((current) => ({
                  ...current,
                  status: 'listening',
                  root: session.root,
                  heardSwaras,
                  stage: `Listening: ${heardSwaras.map((item) => item.swara).join(' ') || 'waiting for held notes'}.`
                }));
              }
            }
          }
        }
        session.rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch (error) {
      setTuneAnalysis((current) => ({
        ...current,
        status: 'error',
        stage: error?.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : 'Could not start tune analysis.',
        error: error?.name === 'NotAllowedError' ? 'Allow microphone access and try again.' : 'Could not start tune analysis.'
      }));
    }
  }

  function finishTuneAnalysis() {
    const session = tuneSessionRef.current;
    if (!session) return;
    stopTuneSession(session);

    const heldSegments = buildHeldSwaraSegments(session.heard);
    const decision = selectDecisionSwaras(summarizeStableHeardIntervals(heldSegments));
    const heardSwaras = includeDetectedSa(
      cleanDetectedSwaras(decision.kept),
      session.rootSamples.length
    );
    const evidenceFrames = buildEvidenceFrames(heldSegments, session.root);
    const chords = getTuneChordSuggestions(session.root, heardSwaras);

    if (!session.root || heardSwaras.length < 2) {
      setTuneAnalysis({
        status: 'error',
        root: session.root,
        heardSwaras,
        evidenceFrames,
        chords: [],
        stage: 'Not enough stable notes were captured.',
        error: 'Hold Sa first, then sing each phrase clearly before stopping.'
      });
      return;
    }

    setTuneAnalysis({
      status: 'ready',
      root: session.root,
      heardSwaras,
      evidenceFrames,
      chords,
      stage: chords.length
        ? `${chords.length} compatible chords found from the detected pitch set.`
        : 'The pitch set is too sparse for a full chord. Use Sa/Pa support.',
      error: ''
    });
  }

  return (
    <section className="raga-pane chord-page">
      <div className="chord-hero">
        <span>Composer Tool</span>
        <h1>Chord Analyser</h1>
        <p>Analyse a sung tune from its stable swaras, or map a known raga to your singing key.</p>
      </div>

      <div className="analyser-mode-switch" role="tablist" aria-label="Chord analyser mode">
        <button className={analyserMode === 'tune' ? 'active' : ''} onClick={() => chooseAnalyserMode('tune')}><Mic size={16} /> Sing a Tune</button>
        <button className={analyserMode === 'raga' ? 'active' : ''} onClick={() => chooseAnalyserMode('raga')}><Music2 size={16} /> Choose a Raga</button>
      </div>

      {analyserMode === 'tune' ? (
        <div className="tune-analyser-workspace">
          <section className={`tune-capture ${tuneAnalysis.status}`}>
            <div>
              <span>Live Pitch Analysis</span>
              <h2>{tuneAnalysis.root ? `Sa: ${tuneAnalysis.root}` : 'Hold a steady Sa'}</h2>
              <p>{tuneAnalysis.stage}</p>
              {tuneAnalysis.error ? <small className="detector-error">{tuneAnalysis.error}</small> : null}
            </div>
            <button className={tuneAnalysis.status === 'listening' ? 'listening' : ''} onClick={toggleTuneAnalysis}>
              {tuneAnalysis.status === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
              {tuneAnalysis.status === 'listening' ? 'Stop & Analyse' : 'Start Listening'}
            </button>
          </section>

          {tuneAnalysis.heardSwaras.length ? (
            <section className="tune-evidence">
              <div className="section-heading">
                <div>
                  <span>Detected Pitch Set</span>
                  <h2>Stable swaras</h2>
                </div>
                <small>Approximation only; no raga is being identified.</small>
              </div>
              <div className="chord-scale-strip detected-scale-strip">
                {tuneAnalysis.heardSwaras.map((item) => (
                  <span key={item.interval}>
                    <b>{item.swara}</b>
                    {noteFromInterval(tuneAnalysis.root, item.interval)}
                    <small>{item.count} frames</small>
                  </span>
                ))}
              </div>
              {tuneAnalysis.evidenceFrames.length ? (
                <div className="frequency-evidence-row">
                  {tuneAnalysis.evidenceFrames.map((frame) => (
                    <span key={`${frame.index}-${frame.interval}`}><b>{frame.swara}</b> {frame.frequency} Hz</span>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {tuneAnalysis.status === 'ready' ? (
            <section className="tune-chord-results">
              <div className="section-heading">
                <div>
                  <span>Phrase Harmony</span>
                  <h2>Compatible chords</h2>
                  <p>Every chord below uses only the stable pitch positions detected in your tune.</p>
                </div>
              </div>
              {tuneAnalysis.chords.length ? (
                <ChordSuggestionList chords={tuneAnalysis.chords} />
              ) : (
                <div className="tune-empty-result">Use {tuneAnalysis.root} and {noteFromInterval(tuneAnalysis.root, 7)} as a sparse Sa/Pa support.</div>
              )}
            </section>
          ) : null}
        </div>
      ) : (
      <>
      <div className="chord-control-panel">
        <label>Raga
          <select value={ragaId} onChange={(event) => setRagaId(event.target.value)}>
            {ragas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>Sa / Root
          <select value={pitch} onChange={(event) => {
            setPitch(event.target.value);
            setChordRoot(event.target.value);
          }}>
            {chromatic.map((note) => <option key={note}>{note}</option>)}
          </select>
        </label>
        <label>Notation View
          <select value={notationView} onChange={(event) => setNotationView(event.target.value)}>
            <option>Karnatik</option>
            <option>Hindustani</option>
          </select>
        </label>
        <button onClick={() => playRagaScaleReview(raga, pitch)}><Play size={16} /> Hear Scale</button>
      </div>

      <div className="notation-legend">
        {notationView === 'Karnatik'
          ? 'Karnatik view: R1/R2/R3, G1/G2/G3, M1/M2, D1/D2/D3, N1/N2/N3. Some pitch positions can have two grammar names, such as R2/G1.'
          : 'Hindustani view: lowercase r/g/d/n are komal, uppercase R/G/D/N are shuddha, M is shuddha Ma, M^ is tivra Ma, and Sa/Pa are fixed. This is only a label view; chord analysis stays pitch-based.'}
      </div>

      <div className="chord-scale-strip">
        {displayedScale.map((item) => (
          <span key={`${item.swara}-${item.note}`}>
            <b>{item.displaySwara}</b>
            {item.note}
          </span>
        ))}
      </div>

      <div className="chord-tool-grid">
        <section>
          <div className="section-heading">
            <div>
              <h2>Safe Anchors</h2>
              <p>Start here for tonic and Pa-based support.</p>
            </div>
          </div>
          <ChordSuggestionList chords={anchorChords.length ? anchorChords : harmony.chords.slice(0, 2)} />
        </section>

        <section>
          <div className="section-heading">
            <div>
              <h2>Color Chords</h2>
              <p>These use only raga notes but should follow the phrase.</p>
            </div>
          </div>
          <ChordSuggestionList chords={colorChords.length ? colorChords : harmony.chords.slice(2, 6)} />
        </section>
      </div>

      <section className="manual-chord-checker">
        <div>
          <span>Manual Check</span>
          <h2>Will this chord work?</h2>
          <p>Useful for questions like whether C minor can work when Sa is C#.</p>
        </div>
        <div className="manual-chord-controls">
          <label>Chord Root
            <select value={chordRoot} onChange={(event) => setChordRoot(event.target.value)}>
              {chromatic.map((note) => <option key={note}>{note}</option>)}
            </select>
          </label>
          <label>Quality
            <select value={chordQuality} onChange={(event) => setChordQuality(event.target.value)}>
              {chordQualityLabels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <article className={`chord-verdict ${chordCheck.status}`}>
          <strong>{chordCheck.name}</strong>
          <span>{chordCheck.notes.join(' - ')}</span>
          <p>{chordCheck.message}</p>
          <small>{chordCheck.detail}</small>
        </article>
      </section>

      <div className="avoid-row chord-avoid">
        <b>Avoid / Use Carefully</b>
        <span>{harmony.avoid.join(', ')}</span>
      </div>
      {carefulChords.length > 0 && (
        <div className="careful-strip">
          {carefulChords.map((chord) => <span key={chord.name}>{chord.name}: {chord.notes.join(' - ')}</span>)}
        </div>
      )}
      </>
      )}
    </section>
  );
}

function ChordSuggestionList({ chords }) {
  return (
    <div className="chord-grid analyser-chords">
      {chords.map((chord) => (
        <button key={chord.name} className={chord.priority === 'anchor' ? 'anchor' : chord.priority === 'careful' ? 'careful' : ''}>
          <strong>{chord.name}</strong>
          <span>{chord.notes.join(' - ')}</span>
          <em>{chord.role}</em>
          <small>{chord.reason}</small>
        </button>
      ))}
    </div>
  );
}

function KarnatikRagasPage() {
  const janakaCount = melakartaChakras.reduce((count, chakra) => count + chakra.ragas.length, 0);
  const janyaCount = janyaCatalogue.reduce((count, group) => count + group.ragas.length, 0);

  return (
    <section className="raga-pane karnatik-page">
      <div className="karnatik-hero">
        <span>Karnatik Raga System</span>
        <h1>72 Melakarta Chakras</h1>
        <p>
          Melakarta ragas are the Janaka parent scales of Karnatik music. Each uses all seven swaras in order,
          and each can branch into many Janya ragas through omitted notes, vakra movement, gamaka, nyasa, and pakad.
        </p>
      </div>

      <div className="database-strip">
        <article><span>Featured</span><strong>{databaseStats.featured}</strong></article>
        <article><span>Janaka</span><strong>{databaseStats.janakaMelakarta}</strong></article>
        <article><span>Janya</span><strong>{databaseStats.janyaCatalogue}</strong></article>
        <article><span>Hindustani</span><strong>{databaseStats.hindustaniCatalogue}</strong></article>
      </div>

      <div className="lineage-grid">
        <article>
          <span>Janaka</span>
          <strong>Parent raga</strong>
          <p>A complete Sampoorna raga with S R G M P D N in both ascent and descent.</p>
        </article>
        <article>
          <span>Melakarta</span>
          <strong>72 parent system</strong>
          <p>The formal Janaka framework grouped into 12 chakras of 6 ragas each.</p>
        </article>
        <article>
          <span>Janya</span>
          <strong>Derived raga</strong>
          <p>Branches from a parent but gains identity through phrase, omission, zig-zag movement, and gamaka.</p>
        </article>
      </div>

      <section className="legend-section">
        <div className="section-heading">
          <div>
            <h2>Swara Legend</h2>
            <p>Reference for the swara symbols used in Melakarta chakras and Janya branches.</p>
          </div>
        </div>
        <div className="legend-grid">
          {swaraLegend.map((item) => (
            <article key={item.symbol}>
              <b>{item.symbol}</b>
              <div>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chakra-section">
        <div className="section-heading">
          <div>
            <h2>12 Chakras</h2>
            <p>Chakras 1-6 use shuddha madhyamam M1. Chakras 7-12 mirror them with prati madhyamam M2.</p>
          </div>
        </div>
        <div className="chakra-grid">
          {melakartaChakras.map((chakra, index) => (
            <article className="chakra-card" key={chakra.name}>
              <div className="chakra-orb">
                <span>Chakra {index + 1} · {chakra.range}</span>
                <strong>{chakra.name}</strong>
                <p>{chakra.madhyamam} · {chakra.swaraFrame}</p>
              </div>
              <ol>
                {chakra.ragas.map((raga, ragaIndex) => (
                  <li key={raga}><b>{Number(chakra.range.split('-')[0]) + ragaIndex}</b>{raga}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="catalogue-section">
        <div className="section-heading">
          <div>
            <h2>Janaka & Janya Raga List</h2>
            <p>Janaka list is complete at {janakaCount}. Janya is a reviewed starter catalogue with {janyaCount} ragas, grouped by parent Melakarta.</p>
          </div>
        </div>
        <div className="catalogue-status">
          <article>
            <span>Janaka</span>
            <strong>{janakaCount}</strong>
            <p>Complete 72 Melakarta parent ragas.</p>
          </article>
          <article>
            <span>Janya</span>
            <strong>{janyaCount}</strong>
            <p>Curated derived ragas now. Full import should become a reviewed data file.</p>
          </article>
        </div>
        <div className="janya-catalogue">
          {janyaCatalogue.map((group) => (
            <article key={group.parent}>
              <h3>{group.parent}</h3>
              <div>
                {group.ragas.map((raga) => <span key={raga}>{raga}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="branch-section">
        <div className="section-heading">
          <div>
            <h2>How Janya Ragas Branch Out</h2>
            <p>A Janya raga is not just a smaller scale. It becomes itself through movement and grammar.</p>
          </div>
        </div>
        <div className="branch-grid">
          {janyaBranches.map((branch) => (
            <article key={branch.parent}>
              <h3>{branch.parent}</h3>
              <div>
                {branch.children.map((child) => <span key={child}>{child}</span>)}
              </div>
              <p>{branch.rule}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function ConcertsPage() {
  const [search, setSearch] = useState('');
  const [geoStatus, setGeoStatus] = useState('Loading verified concert sources...');
  const [showSubmit, setShowSubmit] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [sourceStatuses, setSourceStatuses] = useState([]);
  const [concertLoading, setConcertLoading] = useState(true);
  const [concertError, setConcertError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [submittedEvents, setSubmittedEvents] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('karnatik-community-concerts') || '[]');
    } catch {
      return [];
    }
  });
  const [eventDraft, setEventDraft] = useState({
    title: '',
    artist: '',
    city: '',
    area: '',
    venue: '',
    date: '',
    time: '',
    type: 'Karnatik'
  });
  const sourceEvents = liveEvents.length ? liveEvents : concertListings;
  const allConcerts = useMemo(() => [...submittedEvents, ...sourceEvents], [submittedEvents, sourceEvents]);
  const visibleConcerts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allConcerts;
    return allConcerts.filter((event) => {
      const haystack = [
        event.title,
        event.artist,
        event.city,
        event.area,
        event.venue,
        event.type,
        event.source,
        event.status
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [allConcerts, search]);
  const sourceTiles = sourceStatuses.length ? sourceStatuses : concertSourceRoadmap;

  useEffect(() => {
    let isActive = true;
    async function loadConcerts() {
      setConcertLoading(true);
      setConcertError('');
      try {
        const response = await fetch(`/api/concerts?ts=${Date.now()}`);
        if (!response.ok) throw new Error('Concert source API did not respond.');
        const payload = await response.json();
        if (!isActive) return;
        setLiveEvents(Array.isArray(payload.events) ? payload.events : []);
        setSourceStatuses(Array.isArray(payload.sources) ? payload.sources : []);
        setLastUpdated(payload.generatedAt || new Date().toISOString());
        setGeoStatus(payload.fallback ? 'Live sources were unavailable, showing fallback listings.' : 'Live concert sources loaded. Search any place, artist, venue, sabha, or concert.');
      } catch (error) {
        if (!isActive) return;
        setConcertError(error.message);
        setLiveEvents([]);
        setSourceStatuses([]);
        setGeoStatus('Live concert API is not available in this environment. Showing prototype seed listings.');
      } finally {
        if (isActive) setConcertLoading(false);
      }
    }
    loadConcerts();
    return () => {
      isActive = false;
    };
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('Location is not available in this browser.');
      return;
    }
    setGeoStatus('Requesting browser location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (latitude > 12.55 && latitude < 12.8 && longitude > 76.5 && longitude < 76.8) {
          setSearch('Melkote');
          setGeoStatus('Location matched near Melkote.');
          return;
        }
        if (latitude > 12.75 && latitude < 13.25 && longitude > 77.35 && longitude < 77.9) {
          setSearch('Bangalore');
          setGeoStatus('Location matched near Bangalore.');
          return;
        }
        if (latitude > 12.1 && latitude < 12.45 && longitude > 76.45 && longitude < 76.85) {
          setSearch('Mysore');
          setGeoStatus('Location matched near Mysore.');
          return;
        }
        if (latitude > 12.8 && latitude < 13.25 && longitude > 80.05 && longitude < 80.35) {
          setSearch('Chennai');
          setGeoStatus('Location matched near Chennai.');
          return;
        }
        setGeoStatus(`Location captured: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}. Search by your nearest city or add a local event.`);
      },
      () => setGeoStatus('Location permission was not granted. Enter your city manually.')
    );
  }

  function updateDraft(field, value) {
    setEventDraft((current) => ({ ...current, [field]: value }));
  }

  function submitConcert(event) {
    event.preventDefault();
    const nextEvent = {
      id: `community-${Date.now()}`,
      ...eventDraft,
      source: 'Community submission',
      status: 'Pending review'
    };
    const nextEvents = [nextEvent, ...submittedEvents];
    setSubmittedEvents(nextEvents);
    window.localStorage.setItem('karnatik-community-concerts', JSON.stringify(nextEvents));
    setSearch(nextEvent.city || nextEvent.title);
    setGeoStatus('Event added to the community review queue.');
    setShowSubmit(false);
    setEventDraft({
      title: '',
      artist: '',
      city: '',
      area: '',
      venue: '',
      date: '',
      time: '',
      type: 'Karnatik'
    });
  }

  function toggleSaved(eventId) {
    setSavedIds((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]);
  }

  return (
    <section className="raga-pane concerts-page">
      <div className="concerts-hero">
        <span>Karnatik.ai Concert Mall</span>
        <h1>Find Indian music concerts across cities and communities.</h1>
        <p>Live source connectors, partner calendars, and community submissions come together as one searchable Indian music calendar.</p>
      </div>

      <div className="concert-search-panel">
        <label>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={(event) => event.target.select()}
            placeholder="Search any place, artist, venue, sabha, or concert"
          />
        </label>
        <button onClick={useCurrentLocation}><Navigation size={17} /> Use My Location</button>
        <button onClick={() => window.location.reload()}><Search size={17} /> Refresh Sources</button>
        <button className="submit-concert-button" onClick={() => setShowSubmit((current) => !current)}><Plus size={17} /> Add Concert</button>
      </div>
      <p className="concert-status">
        {concertLoading ? 'Fetching live concert sources...' : geoStatus}
        {lastUpdated ? ` Last checked ${new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.` : ''}
        {concertError ? ` ${concertError}` : ''}
      </p>

      {showSubmit && (
        <form className="concert-submit-panel" onSubmit={submitConcert}>
          <label>
            Concert title
            <input value={eventDraft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="Evening raga concert" required />
          </label>
          <label>
            Artist / organizer
            <input value={eventDraft.artist} onChange={(event) => updateDraft('artist', event.target.value)} placeholder="Artist, sabha, or school" required />
          </label>
          <label>
            City / place
            <input value={eventDraft.city} onChange={(event) => updateDraft('city', event.target.value)} placeholder="Any city, town, or village" required />
          </label>
          <label>
            Area
            <input value={eventDraft.area} onChange={(event) => updateDraft('area', event.target.value)} placeholder="Neighbourhood or locality" />
          </label>
          <label>
            Venue
            <input value={eventDraft.venue} onChange={(event) => updateDraft('venue', event.target.value)} placeholder="Hall, temple, school, or online" required />
          </label>
          <label>
            Date
            <input type="date" value={eventDraft.date} onChange={(event) => updateDraft('date', event.target.value)} required />
          </label>
          <label>
            Time
            <input type="time" value={eventDraft.time} onChange={(event) => updateDraft('time', event.target.value)} required />
          </label>
          <label>
            Tradition
            <select value={eventDraft.type} onChange={(event) => updateDraft('type', event.target.value)}>
              <option>Karnatik</option>
              <option>Hindustani</option>
              <option>Karnatik + Hindustani</option>
              <option>Workshop</option>
              <option>Festival</option>
            </select>
          </label>
          <button type="submit"><Send size={16} /> Submit for Review</button>
        </form>
      )}

      <div className="concert-source-roadmap">
        {sourceTiles.map((source) => (
          <article key={source.id || source.name}>
            <span>{source.status}{typeof source.count === 'number' ? ` · ${source.count}` : ''}</span>
            <strong>{source.name}</strong>
            <p>{source.detail || source.coverage}</p>
          </article>
        ))}
      </div>

      <div className="concert-grid">
        {visibleConcerts.length ? (
          visibleConcerts.map((event) => (
            <article key={event.id} className="concert-card">
              <div>
                <span>{event.type}</span>
                <strong>{event.title}</strong>
                <p>{event.artist}</p>
              </div>
              <div className="concert-meta">
                <p><CalendarDays size={15} /> {formatConcertDate(event.date)} · {formatConcertTime(event.time)}</p>
                <p><MapPin size={15} /> {event.venue}, {event.area ? `${event.area}, ` : ''}{event.city}</p>
              </div>
              <div className="concert-actions">
                <button onClick={() => toggleSaved(event.id)}><Ticket size={15} /> {savedIds.includes(event.id) ? 'Saved' : 'Save'}</button>
                <button onClick={() => downloadConcertCalendar(event)}>Calendar</button>
                {event.sourceUrl ? <a href={event.sourceUrl} target="_blank" rel="noreferrer">Source</a> : null}
                <small>{event.status || event.source}</small>
              </div>
            </article>
          ))
        ) : (
          <article className="concert-empty">
            <span>No listing yet</span>
            <strong>Make this city visible.</strong>
            <p>Add the first concert for “{search}” and help build the Indian music calendar.</p>
            <button onClick={() => {
              setShowSubmit(true);
              updateDraft('city', search);
            }}>Add Concert</button>
          </article>
        )}
      </div>
    </section>
  );
}

function RagaQuizPage({ pitch }) {
  const [quizBucket, setQuizBucket] = useState('scale-builder');
  const bucketQuestions = useMemo(
    () => ragaQuizQuestions.filter((question) => question.bucket === quizBucket),
    [quizBucket]
  );
  const [questionIndex, setQuestionIndex] = useState(() => Math.floor(Math.random() * ragaQuizQuestions.filter((question) => question.bucket === 'scale-builder').length));
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const currentQuestion = bucketQuestions[questionIndex] || bucketQuestions[0];
  const answerKey = `${quizBucket}::${questionIndex}`;
  const selectedAnswer = answers[answerKey];
  const isScaleBuilder = currentQuestion.kind === 'scale-builder';
  const scaleAnswers = isScaleBuilder && selectedAnswer && typeof selectedAnswer === 'object' ? selectedAnswer : {};
  const answeredScaleSlots = isScaleBuilder ? currentQuestion.slots.filter((slot) => scaleAnswers[slot.base]) : [];
  const isScaleComplete = isScaleBuilder && answeredScaleSlots.length === currentQuestion.slots.length;
  const isCorrect = isScaleBuilder
    ? isScaleComplete && currentQuestion.slots.every((slot) => scaleAnswers[slot.base] === slot.answer)
    : selectedAnswer === currentQuestion.answer;
  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((total, [key, answer]) => {
    const [bucket, index] = key.split('::');
    const question = ragaQuizQuestions.filter((item) => item.bucket === bucket)[Number(index)];
    if (question?.kind === 'scale-builder') {
      const slotAnswers = answer && typeof answer === 'object' ? answer : {};
      return total + (question.slots.every((slot) => slotAnswers[slot.base] === slot.answer) ? 1 : 0);
    }
    return total + (question?.answer === answer ? 1 : 0);
  }, 0);
  const percent = answeredCount ? Math.round((score / answeredCount) * 100) : 0;

  function chooseAnswer(option) {
    setAnswers((current) => ({ ...current, [answerKey]: option }));
  }

  function chooseScaleAnswer(base, option) {
    playSingleSwara(option, pitch);
    setAnswers((current) => ({
      ...current,
      [answerKey]: {
        ...(current[answerKey] && typeof current[answerKey] === 'object' ? current[answerKey] : {}),
        [base]: option
      }
    }));
  }

  function randomQuestion(excludeIndex = questionIndex) {
    if (bucketQuestions.length <= 1) return 0;
    let nextIndex = excludeIndex;
    while (nextIndex === excludeIndex) {
      nextIndex = Math.floor(Math.random() * bucketQuestions.length);
    }
    return nextIndex;
  }

  function selectBucket(bucketId) {
    const nextQuestions = ragaQuizQuestions.filter((question) => question.bucket === bucketId);
    setQuizBucket(bucketId);
    setHistory([]);
    setQuestionIndex(Math.floor(Math.random() * nextQuestions.length));
  }

  function goNext() {
    setHistory((current) => [...current, questionIndex].slice(-20));
    setQuestionIndex(randomQuestion());
  }

  function goPrevious() {
    setHistory((current) => {
      const previous = current[current.length - 1];
      if (previous === undefined) return current;
      setQuestionIndex(previous);
      return current.slice(0, -1);
    });
  }

  function resetQuiz() {
    setAnswers({});
    setHistory([]);
    setQuestionIndex(randomQuestion());
  }

  return (
    <section className="raga-pane quiz-page">
      <div className="quiz-hero">
        <span>Recognition Practice</span>
        <h1>Raga Theory Quiz</h1>
        <p>Identify Janya parents, Melakarta numbers, and chakra placement. This is separate from Ear Training; it tests theory recognition first.</p>
      </div>

      <div className="quiz-buckets">
        {quizBuckets.map((bucket) => (
          <button key={bucket.id} className={quizBucket === bucket.id ? 'active' : ''} onClick={() => selectBucket(bucket.id)}>
            <strong>{bucket.label}</strong>
            <span>{bucket.note}</span>
          </button>
        ))}
      </div>

      <div className="exercise-shell">
        <header className="exercise-topline">
          <div>
            <strong>Raga Theory Quiz</strong>
            <span>{quizBuckets.find((bucket) => bucket.id === quizBucket)?.label} · {currentQuestion.type}</span>
          </div>
          <div className="exercise-stats">
            <span>{score}/{answeredCount}</span>
            <span>{percent}%</span>
          </div>
          <button onClick={resetQuiz}>Customize</button>
        </header>

        <div className="exercise-progress">
          <span style={{ width: `${((questionIndex + 1) / bucketQuestions.length) * 100}%` }}></span>
        </div>

        <article className={`exercise-card ${(isScaleBuilder ? isScaleComplete : selectedAnswer) ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
          <div className="exercise-number">{currentQuestion.type} Drill</div>
          <h2>{currentQuestion.prompt}</h2>
          {isScaleBuilder && (
            <div className="scale-builder-panel">
              <div className="scale-builder-title">
                <span>{currentQuestion.ragaName}</span>
                <strong>{isScaleComplete ? (isCorrect ? 'Complete' : 'Review') : `${answeredScaleSlots.length}/${currentQuestion.slots.length}`}</strong>
              </div>
              <div className="scale-builder-lines" aria-label={`${currentQuestion.ragaName} scale`}>
                <div>
                  <b>Arohana</b>
                  <div className="scale-builder-line">
                    {currentQuestion.fullArohana.map((swara, index) => {
                      const base = swaraVariantBase(swara);
                      const chosen = base ? scaleAnswers[base] : '';
                      return <span key={`aro-${swara}-${index}`} className={base && !chosen ? 'blank' : chosen && chosen !== swara ? 'wrong-choice' : ''}>{base ? (chosen || '?') : swara}</span>;
                    })}
                  </div>
                </div>
                <div>
                  <b>Avarohana</b>
                  <div className="scale-builder-line">
                    {currentQuestion.fullAvarohana.map((swara, index) => {
                      const base = swaraVariantBase(swara);
                      const chosen = base ? scaleAnswers[base] : '';
                      return <span key={`ava-${swara}-${index}`} className={base && !chosen ? 'blank' : chosen && chosen !== swara ? 'wrong-choice' : ''}>{base ? (chosen || '?') : swara}</span>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isScaleBuilder ? (
            <div className="scale-variant-grid">
              {currentQuestion.slots.map((slot) => (
                <div className="scale-variant-row" key={slot.base}>
                  <strong>{slot.label}</strong>
                  <div>
                    {slot.options.map((option) => (
                      <button
                        key={option}
                        className={scaleAnswers[slot.base] === option ? 'selected' : scaleAnswers[slot.base] && option === slot.answer ? 'answer' : ''}
                        onClick={() => chooseScaleAnswer(slot.base, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="exercise-options">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  className={selectedAnswer === option ? 'selected' : option === currentQuestion.answer && selectedAnswer ? 'answer' : ''}
                  onClick={() => chooseAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {(isScaleBuilder ? isScaleComplete : selectedAnswer) && (
            <p className="exercise-feedback">
              {isCorrect ? 'Correct. ' : isScaleBuilder ? `Not quite. Correct variants: ${currentQuestion.slots.map((slot) => `${slot.label} ${slot.answer}`).join(', ')}. ` : `Not quite. Answer: ${currentQuestion.answer}. `}
              {currentQuestion.detail}
              {isScaleBuilder && (
                <>
                  <br />
                  <b>Arohana:</b> {currentQuestion.fullArohana.join(' ')} <b>Avarohana:</b> {currentQuestion.fullAvarohana.join(' ')}
                </>
              )}
            </p>
          )}
        </article>

        <footer className="exercise-actions">
          <button onClick={goPrevious}>Previous</button>
          <button onClick={goNext}>Skip</button>
          <button className="primary-small" onClick={goNext}>Next</button>
        </footer>
      </div>
    </section>
  );
}

function EarTrainingPage({ pitch }) {
  const [activeLevel, setActiveLevel] = useState('level-1');
  const [challengeSource, setChallengeSource] = useState('recorded');
  const recognitionPool = useMemo(() => {
    const byName = new Map();
    [...melakartaRagas, ...ragas]
      .filter((raga) => raga.arohana.length && raga.avarohana.length)
      .forEach((raga) => {
        if (!byName.has(raga.name)) byName.set(raga.name, raga);
      });
    return Array.from(byName.values());
  }, []);
  const [recognitionChallenge, setRecognitionChallenge] = useState(() => buildRecognitionChallenge([...melakartaRagas, ...ragas].filter((raga) => raga.arohana.length && raga.avarohana.length)));
  const [sampleChallenge, setSampleChallenge] = useState(() => buildSampleRecognitionChallenge(referenceRecordedSamples));
  const level = earTrainingLevels.find((item) => item.id === activeLevel) || earTrainingLevels[0];
  const recognitionRaga = recognitionPool.find((raga) => raga.id === recognitionChallenge.ragaId) || recognitionPool[0];
  const recognitionLine = recognitionChallenge.direction === 'arohana' ? recognitionRaga.arohana : recognitionRaga.avarohana;
  const activeSample = referenceRecordedSamples.find((sample) => sample.id === sampleChallenge.sampleId) || referenceRecordedSamples[0];
  const sampleRaga = recognitionPool.find((raga) => raga.id === activeSample?.ragaId);

  function selectLevel(levelId) {
    setActiveLevel(levelId);
    setRecognitionChallenge(buildRecognitionChallenge(recognitionPool));
    setSampleChallenge(buildSampleRecognitionChallenge(referenceRecordedSamples));
  }

  function playRecognitionChallenge() {
    if (challengeSource === 'recorded') {
      playRecordedSample(activeSample);
      return;
    }
    playSwaraLine(recognitionLine, pitch);
  }

  function nextRecognitionChallenge() {
    if (challengeSource === 'recorded') {
      const nextChallenge = buildSampleRecognitionChallenge(referenceRecordedSamples, sampleChallenge.sampleId);
      setSampleChallenge(nextChallenge);
      const nextSample = referenceRecordedSamples.find((sample) => sample.id === nextChallenge.sampleId);
      playRecordedSample(nextSample);
      return;
    }

    const nextChallenge = buildRecognitionChallenge(recognitionPool, recognitionChallenge.ragaId);
    setRecognitionChallenge(nextChallenge);
    playSwaraLine(
      nextChallenge.direction === 'arohana'
        ? (recognitionPool.find((raga) => raga.id === nextChallenge.ragaId) || recognitionPool[0]).arohana
        : (recognitionPool.find((raga) => raga.id === nextChallenge.ragaId) || recognitionPool[0]).avarohana,
      pitch
    );
  }

  function answerRecognition(answer) {
    if (challengeSource === 'recorded') {
      setSampleChallenge((current) => ({
        ...current,
        answered: answer,
        result: answer === current.sampleId ? 'correct' : 'wrong'
      }));
      if (sampleRaga) playRagaScaleReview(sampleRaga, pitch);
      return;
    }

    setRecognitionChallenge((current) => ({
      ...current,
      answered: answer,
      result: answer === current.ragaId ? 'correct' : 'wrong'
    }));
    playRagaScaleReview(recognitionRaga, pitch);
  }

  return (
    <section className="raga-pane ear-page">
      <div className="ear-hero">
        <span>Ear Training</span>
        <h1>Arohana / Avarohana Recognition</h1>
        <p>Listen to a hidden raga scale in your current Sa, identify the raga, then review its arohana, avarohana, and lineage.</p>
      </div>

      <div className="ear-levels">
        {earTrainingLevels.map((item) => (
          <button key={item.id} className={activeLevel === item.id ? 'active' : ''} onClick={() => selectLevel(item.id)}>
            <span>{item.eyebrow}</span>
            <strong>{item.title}</strong>
            <small>{item.goal}</small>
          </button>
        ))}
      </div>

      {activeLevel === 'level-1' ? (
        <div className="ear-workspace recognition-mode">
          <aside className="ear-lessons">
            <div className="recognition-set-card">
              <span>Scale Challenge</span>
              <strong>{challengeSource === 'recorded' ? 'Recorded voice scales' : 'Synthetic swara scale'}</strong>
              <p>{challengeSource === 'recorded' ? 'Identify ragas from 20 labeled arohana and avarohana recordings.' : 'Challenge hides the raga name until the user answers.'}</p>
              <div className="sample-source-toggle">
                <button className={challengeSource === 'recorded' ? 'active' : ''} onClick={() => setChallengeSource('recorded')}>Recorded</button>
                <button className={challengeSource === 'synthetic' ? 'active' : ''} onClick={() => setChallengeSource('synthetic')}>Synthetic</button>
              </div>
            </div>
          </aside>

          <section className="ear-drill recognition-drill">
            <div className="ear-drill-head">
              <div>
                <span>Level 1 · {challengeSource === 'recorded' ? 'Recorded scale' : `${pitch} Sa`}</span>
                <h2>Identify the Raga</h2>
                <p>Listen first. Choose the raga from the options.</p>
              </div>
              <button onClick={playRecognitionChallenge}><Play size={16} /> Play Challenge</button>
            </div>

            <div className="hidden-raga-panel">
              <span>Hidden Raga</span>
              <strong>{challengeSource === 'recorded'
                ? (sampleChallenge.answered ? activeSample.name : 'Listen and identify')
                : (recognitionChallenge.answered ? recognitionRaga.name : 'Listen and identify')}</strong>
              <small>{challengeSource === 'recorded'
                ? (sampleChallenge.answered ? `Reference recording in ${activeSample.key}.` : 'Recorded arohana and avarohana; the raga is hidden until you answer.')
                : (recognitionChallenge.answered ? `${recognitionChallenge.direction} was played.` : 'Challenge hides the raga name until the user answers.')}</small>
            </div>

            <div className="recognition-options">
              {(challengeSource === 'recorded' ? sampleChallenge.options : recognitionChallenge.options).map((optionId) => {
                const option = challengeSource === 'recorded'
                  ? referenceRecordedSamples.find((sample) => sample.id === optionId)
                  : recognitionPool.find((raga) => raga.id === optionId);
                const answerId = challengeSource === 'recorded' ? sampleChallenge.sampleId : recognitionChallenge.ragaId;
                const answeredId = challengeSource === 'recorded' ? sampleChallenge.answered : recognitionChallenge.answered;
                if (!option) return null;
                return (
                  <button
                    key={option.id}
                    className={answeredId === option.id ? 'selected' : option.id === answerId && answeredId ? 'answer' : ''}
                    onClick={() => answerRecognition(option.id)}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>

            {(challengeSource === 'recorded' ? sampleChallenge.answered : recognitionChallenge.answered) && (
              <div className={`recognition-feedback ${challengeSource === 'recorded' ? sampleChallenge.result : recognitionChallenge.result}`}>
                <strong>{(challengeSource === 'recorded' ? sampleChallenge.result : recognitionChallenge.result) === 'correct'
                  ? `Correct. This is ${challengeSource === 'recorded' ? activeSample.name : recognitionRaga.name}.`
                  : `Incorrect answer. It was ${challengeSource === 'recorded' ? activeSample.name : recognitionRaga.name}.`}</strong>
                <p className="recognition-detail">{challengeSource === 'recorded'
                  ? `Reference recording in ${activeSample.key}. ${sampleRaga ? ragaLineageDetail(sampleRaga) : 'Scale metadata is pending in the raga database.'}`
                  : ragaLineageDetail(recognitionRaga)}</p>
                <div className="recognition-scale">
                  <p><b>Arohana</b>{(challengeSource === 'recorded' ? sampleRaga?.arohana : recognitionRaga.arohana)?.join(' ') || 'Pending'}</p>
                  <p><b>Avarohana</b>{(challengeSource === 'recorded' ? sampleRaga?.avarohana : recognitionRaga.avarohana)?.join(' ') || 'Pending'}</p>
                </div>
                {challengeSource === 'recorded' && <button onClick={() => playRecordedSample(activeSample)}>Replay Recording</button>}
                <button onClick={() => sampleRaga ? playRagaScaleReview(sampleRaga, pitch) : playRagaScaleReview(recognitionRaga, pitch)}>Play Arohana & Avarohana</button>
                <button onClick={nextRecognitionChallenge}>Next Challenge</button>
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="ear-drill phrase-coming-soon">
          <div className="ear-drill-head">
            <div>
              <span>{level.eyebrow}</span>
              <h2>Phrase Recognition</h2>
              <p>This will use characteristic raga phrases and prayogas, not just scale lines.</p>
            </div>
          </div>
          <div className="hidden-raga-panel">
            <span>Coming Later</span>
            <strong>Phrase-based raga recognition</strong>
            <small>We will add this after phrase samples and raga-specific prayoga data are reviewed.</small>
          </div>
        </section>
      )}
    </section>
  );
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function noteToFrequency(note, octave = 3) {
  const noteIndex = chromatic.indexOf(note);
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * 2 ** ((midi - 69) / 12);
}

function buildRecognitionChallenge(pool, excludeId = '') {
  const usablePool = pool.length ? pool : ragas;
  let answer = usablePool[Math.floor(Math.random() * usablePool.length)];
  if (usablePool.length > 1) {
    while (answer.id === excludeId) {
      answer = usablePool[Math.floor(Math.random() * usablePool.length)];
    }
  }
  const distractors = usablePool
    .filter((raga) => raga.id !== answer.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((raga) => raga.id);
  const options = [answer.id, ...distractors].sort(() => Math.random() - 0.5);
  return {
    ragaId: answer.id,
    direction: Math.random() > 0.5 ? 'arohana' : 'avarohana',
    options,
    answered: '',
    result: ''
  };
}

function buildSampleRecognitionChallenge(samples, excludeId = '') {
  const usablePool = samples.length ? samples : referenceRecordedSamples;
  let answer = usablePool[Math.floor(Math.random() * usablePool.length)];
  if (usablePool.length > 1) {
    while (answer.id === excludeId) {
      answer = usablePool[Math.floor(Math.random() * usablePool.length)];
    }
  }
  const distractors = usablePool
    .filter((sample) => sample.id !== answer.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((sample) => sample.id);
  const options = [answer.id, ...distractors].sort(() => Math.random() - 0.5);
  return {
    sampleId: answer.id,
    options,
    answered: '',
    result: ''
  };
}

function stopRecordedPlayback() {
  const current = recordedPlaybackController.current;
  if (!current) return;
  current.pause();
  current.currentTime = 0;
  recordedPlaybackController.current = null;
}

function playRecordedSample(sample) {
  if (!sample?.src) return;
  if (recordedPlaybackController.current?.dataset?.sampleId === sample.id) {
    stopRecordedPlayback();
    return;
  }
  stopRecordedPlayback();
  stopSwaraPlayback();
  const audio = new Audio(sample.src);
  audio.dataset.sampleId = sample.id;
  audio.volume = 0.92;
  recordedPlaybackController.current = audio;
  audio.addEventListener('ended', () => {
    if (recordedPlaybackController.current === audio) recordedPlaybackController.current = null;
  }, { once: true });
  audio.play().catch(() => {});
}

function ragaLineageDetail(raga) {
  if (raga.lineage === 'janaka' && raga.chakra) {
    return `${raga.name} is a Janaka Melakarta raga, number ${raga.number}, in Chakra ${raga.chakra}.`;
  }
  if (raga.parent) {
    return `${raga.name} belongs to ${raga.parent}. ${raga.family || ''}`.trim();
  }
  return `${raga.name} belongs to ${raga.family || raga.system}.`;
}

function ragaStudyLineageDetail(raga) {
  if (raga.lineage === 'janaka' && raga.chakra) {
    return `Janaka Melakarta ${raga.number}, Chakra ${raga.chakraNumber} ${raga.chakra}.`;
  }
  if (/melakarta/i.test(raga.family || '')) {
    return `Janaka/Melakarta family reference: ${raga.family}.`;
  }
  if (raga.parent || /^janya of/i.test(raga.family || '')) {
    return `Janya raga. Parent/family: ${raga.parent || raga.family}.`;
  }
  return `${raga.family || raga.system} raga.`;
}

function playRagaScaleReview(raga, root) {
  playSwaraLine([...raga.arohana, '|', ...raga.avarohana], root, `review-${raga.id}-${root}`);
}

function nearestTamburaSample(note, mode = 'sa-pa') {
  const samples = mode === 'sa-ma' ? tamburaMaSamples : tamburaSamples;
  const targetIndex = chromatic.indexOf(note);
  let best = samples[0];
  let bestDistance = Infinity;
  for (const sample of samples) {
    const sampleIndex = chromatic.indexOf(sample);
    const rawDistance = targetIndex - sampleIndex;
    const wrappedDistance = ((rawDistance + 18) % 12) - 6;
    const distance = Math.abs(wrappedDistance);
    if (distance < bestDistance) {
      best = sample;
      bestDistance = distance;
    }
  }

  const semitoneShift = ((targetIndex - chromatic.indexOf(best) + 18) % 12) - 6;
  return { note: best, rate: 2 ** (semitoneShift / 12), ma: mode === 'sa-ma' };
}

function tamburaAssetPath(note, mode = 'sa-pa') {
  const sample = nearestTamburaSample(note, mode);
  const assetName = `${tamburaAssetNames[sample.note] || sample.note}${sample.ma ? '-ma' : ''}`;
  return `/tambura/${assetName}.wav`;
}

async function loadTamburaBuffer(context, note, mode = 'sa-pa') {
  const assetPath = tamburaAssetPath(note, mode);
  if (!tamburaBufferCache.has(assetPath)) {
    tamburaBufferCache.set(assetPath, fetch(assetPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${assetPath}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer.slice(0))));
  }
  return tamburaBufferCache.get(assetPath);
}

async function preloadTamburaBuffer(note, mode = 'sa-pa') {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  try {
    await loadTamburaBuffer(context, note, mode);
  } finally {
    window.setTimeout(() => context.close(), 120);
  }
}

function scheduleTamburaSegments(drone, audioBuffer, playbackRate, sampleNote) {
  const settings = tamburaLoopSettings[sampleNote] || { startTrim: 1, tailTrim: 2, crossfade: 2.5 };
  const startTrim = Math.min(settings.startTrim, audioBuffer.duration * 0.2);
  const tailTrim = Math.min(settings.tailTrim, audioBuffer.duration * 0.25);
  const crossfade = Math.min(settings.crossfade, audioBuffer.duration * 0.2);
  const segmentDuration = Math.max(8, audioBuffer.duration - tailTrim - startTrim);
  const audibleDuration = segmentDuration / playbackRate;
  const step = Math.max(1, audibleDuration - crossfade);
  const lookAhead = Math.max(8, step * 1.5);
  let nextStartTime = drone.context.currentTime + 0.02;

  const playSegment = (when) => {
    if (drone.stopped) return;
    const source = drone.context.createBufferSource();
    const gain = drone.context.createGain();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(gain);
    gain.connect(drone.masterGain);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(1, when + crossfade);
    gain.gain.setValueAtTime(1, Math.max(when + crossfade, when + audibleDuration - crossfade));
    gain.gain.linearRampToValueAtTime(0.0001, when + audibleDuration);
    source.start(when, startTrim, segmentDuration);
    source.stop(when + audibleDuration + 0.05);
    drone.sources.push(source);
  };

  const scheduleAhead = () => {
    if (drone.stopped) return;
    while (nextStartTime < drone.context.currentTime + lookAhead) {
      playSegment(nextStartTime);
      nextStartTime += step;
    }
  };

  scheduleAhead();
  const timer = window.setInterval(scheduleAhead, 500);
  drone.timers.push(timer);
}

function getTanpuraStrings(mode) {
  if (mode === 'sa-ma') {
    return [
      { label: 'Sa', value: 'S', swara: 'S', octave: 3 },
      { label: 'Ma', value: 'M', swara: 'M1', octave: 3, accent: true },
      { label: 'Sa', value: "S'", swara: 'S', octave: 4 },
      { label: 'Sa', value: "S'", swara: 'S', octave: 4 }
    ];
  }
  if (mode === 'sa-ma-pa') {
    return [
      { label: 'Sa', value: 'S', swara: 'S', octave: 3 },
      { label: 'Ma', value: 'M', swara: 'M1', octave: 3, accent: true },
      { label: 'Pa', value: 'P', swara: 'P', octave: 3, accent: true },
      { label: 'Sa', value: "S'", swara: 'S', octave: 4 }
    ];
  }
  return [
    { label: 'Sa', value: 'S', swara: 'S', octave: 3 },
    { label: 'Pa', value: 'P', swara: 'P', octave: 3, accent: true },
    { label: 'Sa', value: "S'", swara: 'S', octave: 4 },
    { label: 'Sa', value: "S'", swara: 'S', octave: 4 }
  ];
}

function scheduleSynthTanpura(drone, root, mode) {
  const strings = getTanpuraStrings(mode);
  const cycle = 6.4;
  const offsets = [0, 1.55, 3.12, 4.78];
  const lookAhead = 10;
  let nextCycle = drone.context.currentTime + 0.08;

  const scheduleAhead = () => {
    if (drone.stopped) return;
    while (nextCycle < drone.context.currentTime + lookAhead) {
      strings.forEach((string, index) => {
        const frequency = swaraFrequency(string.swara, root, string.octave);
        pluckTanpuraString(drone, frequency, nextCycle + offsets[index], index, string.accent);
      });
      nextCycle += cycle;
    }
  };

  scheduleAhead();
  const timer = window.setInterval(scheduleAhead, 700);
  drone.timers.push(timer);
}

function pluckTanpuraString(drone, frequency, when, index, accent = false) {
  if (!frequency || drone.stopped) return;
  const { context } = drone;
  const duration = accent ? 6.9 : 6.4;
  const panValue = [-0.18, 0.14, -0.08, 0.2][index] || 0;
  const panner = context.createStereoPanner ? context.createStereoPanner() : null;
  const stringGain = context.createGain();
  const buzz = context.createBiquadFilter();
  buzz.type = 'peaking';
  buzz.frequency.value = frequency * 2.03;
  buzz.Q.value = 12;
  buzz.gain.value = accent ? 7 : 5.5;

  stringGain.gain.setValueAtTime(0.0001, when);
  stringGain.gain.exponentialRampToValueAtTime(accent ? 0.44 : 0.36, when + 0.035);
  stringGain.gain.exponentialRampToValueAtTime(0.06, when + 1.9);
  stringGain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  const output = panner || buzz;
  if (panner) {
    panner.pan.setValueAtTime(panValue, when);
    panner.connect(drone.input);
    buzz.connect(panner);
  } else {
    buzz.connect(drone.input);
  }

  const partials = [
    { multiple: 1, gain: 0.9, detune: 0 },
    { multiple: 2, gain: 0.34, detune: -6 },
    { multiple: 3, gain: 0.18, detune: 5 },
    { multiple: 4, gain: 0.1, detune: -9 },
    { multiple: 5, gain: 0.08, detune: 7 }
  ];

  partials.forEach((partial) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = partial.multiple === 1 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency * partial.multiple, when);
    oscillator.detune.setValueAtTime(partial.detune, when);
    gain.gain.setValueAtTime(partial.gain, when);
    oscillator.connect(gain);
    gain.connect(stringGain);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.08);
    drone.sources.push(oscillator);
  });

  stringGain.connect(buzz);
  const cleanupTimer = window.setTimeout(() => {
    try {
      stringGain.disconnect();
      buzz.disconnect();
      output.disconnect?.();
    } catch {
      // Nodes may already be disconnected when the tanpura is stopped.
    }
  }, Math.max(0, (when - context.currentTime + duration + 0.4) * 1000));
  drone.timers.push(cleanupTimer);
}

function volumeToGain(volume) {
  return (Number(volume) / 100) * 0.85;
}

function metronomeVolumeToGain(volume) {
  return (Number(volume) / 100) * 0.34;
}

function getActiveTala(systemId, talaId) {
  const options = talaPresets[systemId] || talaPresets.karnatik;
  return options.find((tala) => tala.id === talaId) || options[0];
}

function frequencyToNote(frequency) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  const cents = Math.round((exactMidi - midi) * 100);
  return { note: noteNames[((midi % 12) + 12) % 12], cents };
}

function isStableDetectedPitch(detected, maxCents = 38) {
  return Math.abs(detected.cents) <= maxCents;
}

function summarizeHeardNotes(heard) {
  const counts = heard.reduce((acc, item) => {
    acc[item.note] = (acc[item.note] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([note, count]) => ({ note, count }))
    .sort((a, b) => b.count - a.count);
}

function noteToInterval(note, root) {
  const noteIndex = chromatic.indexOf(note);
  const rootIndex = chromatic.indexOf(root);
  return (noteIndex - rootIndex + 12) % 12;
}

function summarizeHeardIntervals(heard) {
  const counts = heard.reduce((acc, item) => {
    acc[item.interval] = (acc[item.interval] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([interval, count]) => ({ interval: Number(interval), swara: intervalLabels[Number(interval)], count }))
    .sort((a, b) => a.interval - b.interval);
}

function summarizeStableHeardIntervals(heard) {
  const intervals = summarizeHeardIntervals(heard);
  if (!intervals.length) return [];
  const maxCount = Math.max(...intervals.map((item) => item.count));
  const totalCount = intervals.reduce((sum, item) => sum + item.count, 0);
  const minimumCount = Math.max(2, Math.ceil(maxCount * 0.045), Math.ceil(totalCount * 0.01));
  return intervals.filter((item) => item.count >= minimumCount);
}

function startSwaraSyllableRecognition(onChange) {
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionClass) return null;
  const recognition = new SpeechRecognitionClass();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
  recognition.lang = 'en-IN';
  let finalTranscript = '';
  let lastTranscript = '';
  recognition.onresult = (event) => {
    let interimTranscript = '';
    const alternatives = [];
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0]?.transcript || '';
      for (let altIndex = 0; altIndex < event.results[index].length; altIndex += 1) {
        const altText = event.results[index][altIndex]?.transcript || '';
        if (altText) alternatives.push(altText);
      }
      if (event.results[index].isFinal) {
        finalTranscript += ` ${text}`;
      } else {
        interimTranscript += ` ${text}`;
      }
    }
    lastTranscript = `${finalTranscript} ${interimTranscript} ${alternatives.join(' ')}`.trim();
    onChange({ syllables: parseSwaraSyllables(lastTranscript), transcript: lastTranscript, status: 'active' });
  };
  recognition.onstart = () => onChange({ syllables: [], transcript: '', status: 'active' });
  recognition.onerror = (event) => onChange({ syllables: parseSwaraSyllables(lastTranscript), transcript: lastTranscript, status: event.error || 'error' });
  recognition.onend = () => onChange({ syllables: parseSwaraSyllables(lastTranscript), transcript: lastTranscript, status: lastTranscript ? 'ended' : 'ended-empty' });
  try {
    recognition.start();
  } catch {
    return null;
  }
  return recognition;
}

function parseSwaraSyllables(transcript = '') {
  const text = ` ${transcript.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ')} `;
  const phraseMatches = [];
  const pattern = /\b(saa?|sha|sar|ri|ree|re|ray|rhea|ga|gaa|gah|ma|maa|mah|pa|paa|pah|da|daa|dha|dhaa|ni|nee|knee|nigh)\b/g;
  let match = pattern.exec(text);
  while (match) {
    const label = swaraSyllableFromToken(match[1]);
    if (label) phraseMatches.push({ label, index: match.index });
    match = pattern.exec(text);
  }
  if (phraseMatches.length) {
    return dedupeNearbySyllables(phraseMatches);
  }

  const cleaned = transcript
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const tokenMatches = [];
  cleaned.forEach((token, tokenIndex) => {
    const direct = swaraSyllableFromToken(token);
    if (direct) {
      tokenMatches.push({ label: direct, index: tokenIndex * 10 });
      return;
    }
    parseCompactSwaraToken(token).forEach((label, compactIndex) => {
      tokenMatches.push({ label, index: tokenIndex * 10 + compactIndex });
    });
  });
  return dedupeNearbySyllables(tokenMatches);
}

function dedupeNearbySyllables(items) {
  return items.filter((item, index) => {
    const previous = items[index - 1];
    return !previous || previous.label !== item.label || item.index - previous.index > 4;
  });
}

function swaraSyllableFromToken(token) {
  const normalized = token.toLowerCase();
  if (['sa', 'saa', 'sha', 'sar'].includes(normalized)) return 'S';
  if (['ri', 'ree', 're', 'ray', 'rhea'].includes(normalized)) return 'R';
  if (['ga', 'gaa', 'gah', 'gama'].includes(normalized)) return 'G';
  if (['ma', 'maa', 'mah'].includes(normalized)) return 'M';
  if (['pa', 'paa', 'pah'].includes(normalized)) return 'P';
  if (['da', 'daa', 'dha', 'dhaa', 'the'].includes(normalized)) return 'D';
  if (['ni', 'nee', 'nigh', 'knee'].includes(normalized)) return 'N';
  return null;
}

function parseCompactSwaraToken(token = '') {
  const chunks = [
    ['dhaa', 'D'], ['dha', 'D'], ['daa', 'D'], ['da', 'D'],
    ['saa', 'S'], ['sa', 'S'], ['sha', 'S'],
    ['ree', 'R'], ['rhea', 'R'], ['ri', 'R'], ['re', 'R'], ['ray', 'R'],
    ['gaa', 'G'], ['gah', 'G'], ['ga', 'G'],
    ['maa', 'M'], ['mah', 'M'], ['ma', 'M'],
    ['paa', 'P'], ['pah', 'P'], ['pa', 'P'],
    ['nee', 'N'], ['knee', 'N'], ['nigh', 'N'], ['ni', 'N']
  ];
  const labels = [];
  let index = 0;
  let consumed = 0;
  while (index < token.length) {
    const match = chunks.find(([chunk]) => token.startsWith(chunk, index));
    if (!match) {
      index += 1;
      continue;
    }
    labels.push(match[1]);
    consumed += match[0].length;
    index += match[0].length;
  }
  const coverage = consumed / Math.max(token.length, 1);
  return labels.length >= 2 && coverage >= 0.72 ? labels : [];
}

function describeSyllableLayer(session, final = false) {
  if (session.syllables.length) {
    return `Clock 0 syllables heard: ${session.syllables.map((item) => item.label).join(' ')}.`;
  }
  if (session.syllableTranscript) {
    return `Clock 0 heard text but no swaras: "${session.syllableTranscript.slice(0, 64)}".`;
  }
  if (session.syllableStatus === 'not-supported') {
    return 'Clock 0 syllables: not supported in this browser; using pitch/path only.';
  }
  if (session.syllableStatus && !['active', 'starting'].includes(session.syllableStatus)) {
    return `Clock 0 syllables: ${session.syllableStatus}; using pitch/path only.`;
  }
  return final ? 'Clock 0 syllables: not detected; using pitch/path only.' : 'Clock 0 syllable layer active; sing Sa Ri Ga Ma Pa Da Ni clearly.';
}

function buildSyllableEvidence(syllables = []) {
  const labels = syllables.map((item) => item.label);
  const counts = labels.reduce((acc, label) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const allowedByLabel = {
    S: [0],
    R: [1, 2, 3],
    G: [2, 3, 4],
    M: [5, 6],
    P: [7],
    D: [8, 9, 10],
    N: [9, 10, 11]
  };
  const defaultByLabel = { S: 0, R: 2, G: 4, M: 5, P: 7, D: 9, N: 11 };
  const intervals = Array.from(new Set(labels.flatMap((label) => allowedByLabel[label] || [])));
  const defaultIntervals = Array.from(new Set(labels.map((label) => defaultByLabel[label]).filter((interval) => interval !== undefined)));
  return { labels, counts, intervals, defaultIntervals };
}

function mergeSyllableIntervals(intervals, syllableEvidence) {
  if (!syllableEvidence.defaultIntervals.length) return intervals;
  const byInterval = new Map(intervals.map((item) => [item.interval, item]));
  syllableEvidence.defaultIntervals.forEach((interval) => {
    if (!byInterval.has(interval)) {
      byInterval.set(interval, {
        interval,
        swara: intervalLabels[interval],
        count: Math.max(2, Math.round((syllableEvidence.counts[intervalPrimarySyllable(interval)] || 1) * 8)),
        syllableOnly: true
      });
    }
  });
  return Array.from(byInterval.values()).sort((a, b) => a.interval - b.interval);
}

function intervalPrimarySyllable(interval) {
  if (interval === 0) return 'S';
  if ([1, 2, 3].includes(interval)) return 'R';
  if ([2, 3, 4].includes(interval)) return 'G';
  if ([5, 6].includes(interval)) return 'M';
  if (interval === 7) return 'P';
  if ([8, 9, 10].includes(interval)) return 'D';
  if ([9, 10, 11].includes(interval)) return 'N';
  return '';
}

function buildSyllableIntervalSequence(syllables = [], allowedIntervals = null) {
  const defaults = { S: 0, R: 2, G: 4, M: 5, P: 7, D: 9, N: 11 };
  return syllables
    .map((item) => defaults[item.label])
    .filter((interval) => interval !== undefined)
    .filter((interval) => !allowedIntervals || allowedIntervals.has(interval) || [9, 10, 11].includes(interval))
    .filter((interval, index, list) => index === 0 || interval !== list[index - 1]);
}

function mergeEvidenceSequence(pitchSequence, syllableSequence) {
  if (syllableSequence.length >= Math.max(4, pitchSequence.length - 2)) return syllableSequence;
  return pitchSequence;
}

function buildHeldSwaraSegments(heard) {
  const runs = [];
  heard.forEach((item) => {
    const last = runs[runs.length - 1];
    if (last && last.interval === item.interval) {
      last.count += 1;
      last.items.push(item);
      return;
    }
    runs.push({ interval: item.interval, count: 1, items: [item] });
  });

  if (!runs.length) return [];
  const maxRun = Math.max(...runs.map((run) => run.count));
  const holdThreshold = Math.max(3, Math.ceil(maxRun * 0.12));
  const strongHoldThreshold = Math.max(5, Math.ceil(maxRun * 0.18));

  const keptRuns = runs.filter((run, index) => {
    if (run.interval === 0 && index === runs.length - 1 && run.count >= Math.max(2, Math.ceil(holdThreshold * 0.55))) return true;
    if (run.count >= holdThreshold) return true;
    const previous = runs[index - 1];
    const next = runs[index + 1];
    if (!previous || !next) return run.count >= strongHoldThreshold;
    const surroundedByHolds = previous.count >= holdThreshold && next.count >= holdThreshold;
    if (!surroundedByHolds) return run.count >= strongHoldThreshold;

    const movingToSa = next.interval === 0 && isBetweenCircular(run.interval, previous.interval, next.interval);
    const passingBetweenNotes = isBetweenCircular(run.interval, previous.interval, next.interval);
    return !(movingToSa || passingBetweenNotes);
  });

  return keptRuns.flatMap((run) => run.items);
}

function buildEvidenceFrames(heardSegments, root, syllables = []) {
  const runs = [];
  heardSegments.forEach((item) => {
    const last = runs[runs.length - 1];
    if (last && last.interval === item.interval) {
      last.items.push(item);
      return;
    }
    runs.push({ interval: item.interval, items: [item] });
  });

  return runs.map((run, index) => {
    const frequencies = run.items.map((item) => item.frequency).filter(Boolean);
    const frequency = median(frequencies);
    const note = frequency ? frequencyToNote(frequency).note : noteFromInterval(root, run.interval);
    const syllable = syllables[index]?.label || '';
    return {
      index: index + 1,
      syllable,
      frequency: frequency ? Number(frequency.toFixed(1)) : 0,
      note,
      swara: intervalLabels[run.interval],
      interval: run.interval,
      samples: run.items.length
    };
  });
}

function describeRagaDecision(root, evidenceFrames = [], evidenceSequence = [], matches = []) {
  const top = matches[0];
  const next = matches[1];
  const path = evidenceSequence.map((interval) => intervalLabels[interval]).join(' ');
  const frequencyLine = evidenceFrames.length
    ? evidenceFrames.map((frame) => `${frame.swara} ${frame.frequency}Hz`).join(' -> ')
    : 'not enough stable segments';
  if (!top) {
    return `Sa ${root || 'not locked'}; frequency evidence: ${frequencyLine}. No raga candidate had enough evidence.`;
  }
  const gap = next ? top.score - next.score : top.score;
  const confidenceNote = top.strong
    ? `identified because the top match is strong`
    : `debug only because the top match is not strong enough`;
  return `Sa ${root}. Path ${path || 'not enough ordered notes'}. Frequency evidence: ${frequencyLine}. Top ${top.name} ${top.score}%, next ${next?.name || 'none'} ${next?.score ?? 0}% (gap ${gap}). ${confidenceNote}.`;
}

function isBetweenCircular(candidate, from, to) {
  const ascendingDistance = (to - from + 12) % 12;
  const candidateAscending = (candidate - from + 12) % 12;
  if (ascendingDistance > 0 && candidateAscending > 0 && candidateAscending < ascendingDistance) return true;

  const descendingDistance = (from - to + 12) % 12;
  const candidateDescending = (from - candidate + 12) % 12;
  return descendingDistance > 0 && candidateDescending > 0 && candidateDescending < descendingDistance;
}

function selectDecisionSwaras(intervals) {
  if (!intervals.length) return { kept: [], rejected: [] };
  const maxCount = Math.max(...intervals.map((item) => item.count || 0));
  const totalCount = intervals.reduce((sum, item) => sum + (item.count || 0), 0);
  const minimumCount = Math.max(4, Math.ceil(maxCount * 0.16), Math.ceil(totalCount * 0.025));
  const strongCount = Math.max(minimumCount, Math.ceil(maxCount * 0.26));

  const decorated = intervals.map((item) => {
    const strength = maxCount ? Math.round(((item.count || 0) / maxCount) * 100) : 0;
    return {
      ...item,
      strength,
      decision: item.count >= minimumCount || item.syllableOnly ? 'accepted' : 'rejected',
      decisionReason: item.count >= minimumCount || item.syllableOnly
        ? (item.count >= strongCount ? 'held evidence' : 'usable evidence')
        : `weak trace below ${minimumCount} samples`
    };
  });

  return {
    kept: decorated.filter((item) => item.decision === 'accepted'),
    rejected: decorated.filter((item) => item.decision === 'rejected')
  };
}

function cleanDetectedSwaras(intervals) {
  const byInterval = new Map(intervals.map((item) => [item.interval, item]));
  const removeWeakerNeighbor = (leftInterval, rightInterval, dominanceRatio = 1.12) => {
    const left = byInterval.get(leftInterval);
    const right = byInterval.get(rightInterval);
    if (!left || !right) return;
    if (right.count >= left.count * dominanceRatio) byInterval.delete(leftInterval);
    if (left.count >= right.count * dominanceRatio) byInterval.delete(rightInterval);
  };

  removeWeakerNeighbor(1, 2, 1.25); // R1 vs R2/G1
  removeWeakerNeighbor(2, 3, 1.22); // R2/G1 vs R3/G2
  removeWeakerNeighbor(3, 4, 1.22); // R3/G2 vs G3
  removeWeakerNeighbor(5, 6, 1.08); // M1 vs M2
  removeWeakerNeighbor(8, 9, 1.18); // D1 vs D2/N1
  removeWeakerNeighbor(9, 10, 1.18); // D2/N1 vs D3/N2
  removeWeakerNeighbor(10, 11, 1.18); // D3/N2 vs N3

  return Array.from(byInterval.values()).sort((a, b) => a.interval - b.interval);
}

function includeDetectedSa(intervals, count = 1) {
  if (intervals.some((item) => item.interval === 0)) return intervals;
  return [
    { interval: 0, swara: 'S', count: Math.max(1, count), strength: 100, decision: 'accepted', decisionReason: 'locked Sa' },
    ...intervals
  ].sort((a, b) => a.interval - b.interval);
}

function describeMadhyamamCapture(heardSwaras, root) {
  const heardIntervals = new Set(heardSwaras.map((item) => item.interval));
  const m1Note = noteFromInterval(root, 5);
  const m2Note = noteFromInterval(root, 6);
  if (heardIntervals.has(5) && heardIntervals.has(6)) {
    return `Madhyamam captured as both M1 (${m1Note}) and M2 (${m2Note}); please sing Ma more steadily.`;
  }
  if (heardIntervals.has(6)) {
    return `Madhyamam captured as M2 (${m2Note}) - Kalyani side, not Shankarabharanam.`;
  }
  if (heardIntervals.has(5)) {
    return `Madhyamam captured as M1 (${m1Note}) - Shankarabharanam/Bilahari side, not Kalyani.`;
  }
  return `Madhyamam was not captured clearly. For ${root} Sa: M1 is ${m1Note}, M2 is ${m2Note}.`;
}

function deriveSyllableLabelsFromIntervals(intervals = []) {
  const labels = intervals.map((interval) => {
    if (interval === 0) return 'S';
    if ([1, 2, 3].includes(interval)) return 'R';
    if (interval === 4) return 'G';
    if ([5, 6].includes(interval)) return 'M';
    if (interval === 7) return 'P';
    if ([8, 9, 10].includes(interval)) return 'D';
    if (interval === 11) return 'N';
    return '';
  }).filter(Boolean);
  return labels.filter((label, index) => index === 0 || label !== labels[index - 1]);
}

function formatClockZeroStatus(ragaDetector) {
  if (ragaDetector.syllables?.length) return 'Speech syllables captured';
  if (ragaDetector.syllableTranscript) return 'Speech heard text, no swaras parsed';
  if (ragaDetector.syllableStatus === 'not-supported') return 'Browser speech not supported';
  if (ragaDetector.syllableStatus) return `Speech status: ${ragaDetector.syllableStatus}`;
  return 'Waiting for detection';
}

function normalizeRagaSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMentionedRaga(question, fallbackRaga) {
  const normalizedQuestion = ` ${normalizeRagaSearchText(question)} `;
  const candidates = ragas
    .flatMap((raga) => [raga.name, ...(raga.name || '').split('/').map((part) => part.trim())]
      .filter(Boolean)
      .map((name) => ({ raga, name: normalizeRagaSearchText(name) }))
      .filter((candidate) => candidate.name.length >= 3))
    .sort((a, b) => b.name.length - a.name.length);

  const match = candidates.find((candidate) => normalizedQuestion.includes(` ${candidate.name} `));
  return match?.raga || fallbackRaga;
}

function buildRagaDnaCandidates(entries = [], fallbackCandidates = []) {
  const fallbackByName = new Map(fallbackCandidates.map((item) => [normalizeRagaSearchText(item.name), item]));
  const grouped = new Map();

  entries.forEach((entry) => {
    const key = normalizeRagaSearchText(entry.raga);
    if (!key) return;
    const current = grouped.get(key) || {
      id: entry.ragaId || key.replace(/\s+/g, '_'),
      ragaId: entry.ragaId || null,
      name: entry.raga,
      system: entry.system || 'Karnatik',
      family: 'RagaDNA library',
      arohana: [],
      avarohana: [],
      sourceSets: new Set(),
      sampleCount: 0
    };
    current.sampleCount += 1;
    current.sourceSets.add(entry.sourceSet);
    if (!current.ragaId && entry.ragaId) current.ragaId = entry.ragaId;
    if (!current.arohana.length && entry.labels?.arohana?.length) current.arohana = entry.labels.arohana;
    if (!current.avarohana.length && entry.labels?.avarohana?.length) current.avarohana = entry.labels.avarohana;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).map((candidate) => {
    const fallback = fallbackByName.get(normalizeRagaSearchText(candidate.name)) || fallbackCandidates.find((item) => item.ragaId && item.ragaId === candidate.ragaId);
    const linkedRaga = candidate.ragaId ? ragas.find((raga) => raga.id === candidate.ragaId) : null;
    const arohana = candidate.arohana.length ? candidate.arohana : fallback?.arohana || linkedRaga?.arohana || [];
    const avarohana = candidate.avarohana.length ? candidate.avarohana : fallback?.avarohana || linkedRaga?.avarohana || [];
    const signature = fallback?.signatureIntervals?.length
      ? fallback.signatureIntervals
      : ragaSignatureIntervals({ id: candidate.ragaId || candidate.id, name: candidate.name });
    return {
      ...candidate,
      id: candidate.ragaId || candidate.id,
      ragaId: candidate.ragaId || fallback?.ragaId || fallback?.id || candidate.id,
      system: linkedRaga?.system || candidate.system,
      family: linkedRaga?.family || candidate.family,
      arohana,
      avarohana,
      signatureIntervals: signature,
      sourceSets: Array.from(candidate.sourceSets).sort()
    };
  }).filter((candidate) => candidate.arohana.length && candidate.avarohana.length);
}

function ragaIntervals(raga) {
  return Array.from(new Set(raga.arohana.concat(raga.avarohana).map(normalizeSwara)))
    .filter((swara) => swaraIntervals[swara] !== undefined)
    .map((swara) => swaraIntervals[swara]);
}

function ragaIntervalSequence(raga) {
  return raga.arohana
    .concat(raga.avarohana)
    .map(normalizeSwara)
    .filter((swara) => swaraIntervals[swara] !== undefined)
    .map((swara) => swaraIntervals[swara]);
}

function ragaSignatureIntervals(raga) {
  const signatures = {
    yaman: [2, 4, 6, 11],
    kalyani: [2, 4, 6, 11],
    bhairav: [1, 8],
    bageshri: [3, 5, 10],
    todi: [1, 3, 8],
    hamsadhwani: [2, 4, 7, 11],
    mohana: [0, 2, 4, 7, 9],
    shankarabharanam_bilawal: [0, 2, 4, 5, 7, 9, 11],
    mayamalavagowla: [1, 4, 5, 8, 11],
    kharaharapriya_kafi: [2, 3, 5, 7, 9, 10],
    hindolam_malkauns: [0, 3, 5, 8, 10],
    revati_bairagi: [0, 1, 5, 7, 10],
    shuddha_saveri_durga: [0, 2, 5, 7, 9],
    charukesi: [0, 2, 4, 5, 7, 8, 10],
    keeravani_kirwani: [0, 2, 3, 5, 7, 8, 11],
    kambhoji: [0, 2, 4, 5, 7, 9, 10],
    abheri_bhimpalasi: [0, 2, 3, 5, 7, 9, 10],
    darbari_kanada: [0, 2, 3, 5, 7, 8, 10],
    desh: [0, 2, 4, 5, 7, 9, 10, 11],
    brindavana_saranga: [0, 2, 5, 7, 10, 11]
  };
  return signatures[raga.id] || [];
}

function compactHeardIntervalSequence(heard, allowedIntervals = null) {
  const runs = [];
  heard
    .filter((item) => !allowedIntervals || allowedIntervals.has(item.interval))
    .forEach((item) => {
    const last = runs[runs.length - 1];
    if (last && last.interval === item.interval) {
      last.count += 1;
      return;
    }
    runs.push({ interval: item.interval, count: 1 });
  });

  return runs
    .filter((run) => run.count >= 2)
    .map((run) => run.interval)
    .filter((interval, index, list) => index === 0 || interval !== list[index - 1]);
}

function longestCommonSubsequenceLength(source, target) {
  if (!source.length || !target.length) return 0;
  const previous = Array(target.length + 1).fill(0);
  const current = Array(target.length + 1).fill(0);
  source.forEach((sourceItem) => {
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      current[targetIndex] = sourceItem === target[targetIndex - 1]
        ? previous[targetIndex - 1] + 1
        : Math.max(previous[targetIndex], current[targetIndex - 1]);
    }
    for (let index = 0; index <= target.length; index += 1) {
      previous[index] = current[index];
      current[index] = 0;
    }
  });
  return previous[target.length];
}

function ragaIdentityPhraseIntervals(raga) {
  const name = normalizeRagaSearchText(raga.name);
  const phrases = {
    anandabhairavi: [
      [0, 3, 2, 3, 5],
      [3, 2, 3, 5],
      [7, 9, 7],
      [10, 9, 7, 5, 3, 2, 0]
    ],
    reetigowla: [
      [0, 3, 2, 3, 5],
      [5, 10, 9, 5, 10],
      [5, 3, 5, 7, 5, 3, 2, 0]
    ],
    kedaragowla: [
      [0, 2, 5, 7, 10],
      [10, 9, 7, 5, 4, 2, 0]
    ],
    kambhoji: [
      [0, 2, 4, 5, 7, 9],
      [10, 9, 7, 5, 4, 2, 0]
    ],
    bilahari: [
      [0, 2, 4, 7, 9],
      [11, 9, 7, 5, 4, 2, 0]
    ],
    mayamalavagowla: [
      [0, 1, 4, 5, 7, 8, 11],
      [11, 8, 7, 5, 4, 1, 0],
      [1, 4, 5]
    ],
    saveri: [
      [0, 1, 5, 7, 8],
      [11, 8, 7, 5, 4, 1, 0],
      [1, 5, 7, 8]
    ]
  };
  return phrases[name] || [];
}

function bestIdentityPhraseCoverage(heardSequence, phrases) {
  if (!heardSequence.length || !phrases.length) return 0;
  return Math.max(...phrases.map((phrase) => (
    longestCommonSubsequenceLength(heardSequence, phrase) / Math.max(phrase.length, 1)
  )));
}

function scoreRagaFingerprints(heardCounts, heardSequence = [], featureModel = []) {
  if (!featureModel.length || !heardCounts.size) return new Map();
  const heardSet = new Set(heardCounts.keys());
  const heardHistogram = buildNormalizedHistogram(heardCounts);
  const byRaga = new Map();

  featureModel.forEach((feature) => {
    const featureSet = new Set(feature.swaraIntervals || []);
    if (!featureSet.size) return;
    const intersection = [...heardSet].filter((interval) => featureSet.has(interval));
    const union = new Set([...heardSet, ...featureSet]);
    const setScore = union.size ? intersection.length / union.size : 0;
    const pathScore = heardSequence.length >= 5 && feature.path?.length
      ? longestCommonSubsequenceLength(heardSequence, feature.path) / Math.max(feature.path.length, 1)
      : 0;
    const histogramScore = cosineSimilarity(heardHistogram, feature.histogram || []);
    const extraPenalty = Math.max(0, heardSet.size - featureSet.size) * 0.035;
    const raw = Math.max(0, Math.round((
      setScore * 0.3 +
      pathScore * 0.5 +
      histogramScore * 0.2 -
      extraPenalty
    ) * 100));
    const key = feature.ragaId || feature.canonicalRaga || normalizeRagaSearchText(feature.raga);
    const current = byRaga.get(key) || {
      score: 0,
      pathScore: 0,
      sampleCount: 0,
      bestSampleId: ''
    };
    current.sampleCount += 1;
    if (raw > current.score) {
      current.score = raw;
      current.pathScore = Math.round(pathScore * 100);
      current.bestSampleId = feature.id;
    }
    byRaga.set(key, current);
  });

  return byRaga;
}

function buildNormalizedHistogram(counts) {
  const histogram = Array(12).fill(0);
  let total = 0;
  counts.forEach((count, interval) => {
    histogram[interval] = count;
    total += count;
  });
  return histogram.map((count) => count / (total || 1));
}

function cosineSimilarity(a = [], b = []) {
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (let index = 0; index < 12; index += 1) {
    dot += (a[index] || 0) * (b[index] || 0);
    aNorm += (a[index] || 0) ** 2;
    bNorm += (b[index] || 0) ** 2;
  }
  return aNorm && bNorm ? dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm)) : 0;
}

function matchRagas(heardInput, candidates = ragas, heardSequence = [], syllableEvidence = null, featureModel = []) {
  const heardCounts = new Map();
  heardInput.forEach((item) => {
    const interval = typeof item === 'number' ? item : item.interval;
    if (interval === undefined || interval === null) return;
    heardCounts.set(interval, (heardCounts.get(interval) || 0) + (typeof item === 'number' ? 1 : item.count || 1));
  });
  const heardSet = new Set(heardCounts.keys());
  const fingerprintMatches = scoreRagaFingerprints(heardCounts, heardSequence, featureModel);
  return applyRagaConfusionRules(candidates
    .map((raga) => {
      const fingerprint = fingerprintMatches.get(raga.ragaId || raga.id) || fingerprintMatches.get(raga.id);
      const target = ragaIntervals(raga);
      const targetSet = new Set(target);
      const targetSequence = ragaIntervalSequence(raga);
      const signature = raga.signatureIntervals || ragaSignatureIntervals(raga);
      const identityPhrases = ragaIdentityPhraseIntervals(raga);
      const phraseCoverage = bestIdentityPhraseCoverage(heardSequence, identityPhrases);
      const matched = target.filter((interval) => heardSet.has(interval));
      const missing = target.filter((interval) => !heardSet.has(interval));
      const extra = [...heardSet].filter((interval) => !targetSet.has(interval));
      const signatureMissing = signature.filter((interval) => !heardSet.has(interval));
      const coverage = matched.length / target.length;
      const sequenceCoverage = heardSequence.length >= 5
        ? longestCommonSubsequenceLength(heardSequence, targetSequence) / Math.max(targetSequence.length, 1)
        : 0;
      const missingPenalty = missing.length / target.length;
      const extraPenalty = extra.length / Math.max(target.length, 1);
      const sparsePenalty = heardSet.size < 4 ? 0.18 : 0;
      const signaturePenalty = signature.length ? (signatureMissing.length / signature.length) * 0.36 : 0;
      const chromaticPenalty = heardSet.size > 8 ? 0.35 : 0;
      const orderedWeight = heardSequence.length >= 5 ? 0.45 : 0.15;
      const unorderedWeight = 1 - orderedWeight;
      const sequencePenalty = heardSequence.length >= 5 ? Math.max(0, 0.82 - sequenceCoverage) * 0.35 : 0.12;
      const phraseBonus = phraseCoverage >= 0.75 ? phraseCoverage * 0.24 : phraseCoverage * 0.08;
      const phrasePenalty = identityPhrases.length && phraseCoverage < 0.45 ? 0.12 : 0;
      const blendedCoverage = coverage * unorderedWeight + sequenceCoverage * orderedWeight;
      const grammarScore = Math.round((blendedCoverage + phraseBonus - missingPenalty * 0.2 - extraPenalty * 1.05 - sparsePenalty - signaturePenalty - chromaticPenalty - sequencePenalty - phrasePenalty) * 100);
      const fingerprintAgreement = fingerprint && heardSequence.length >= 5
        ? Math.min(0.48, Math.max(0.16, fingerprint.pathScore / 240))
        : 0;
      const fingerprintBoost = fingerprintAgreement
        ? Math.round((fingerprint.score - grammarScore) * fingerprintAgreement)
        : 0;
      const samplePathBonus = fingerprint?.score >= 82 && fingerprint?.pathScore >= 78 ? 8 : 0;
      const rawScore = grammarScore + fingerprintBoost;
      const score = Math.min(100, Math.max(0, rawScore + samplePathBonus));
      const phraseStrong = phraseCoverage >= 0.82 && score >= 72 && extra.length <= 3 && missing.length <= 2;
      const strong = (score >= 88 && sequenceCoverage >= 0.9 && extra.length <= 1 && missing.length <= 1 && heardSet.size >= Math.min(5, target.length) && signatureMissing.length === 0) || phraseStrong;
      return {
        id: raga.id,
        ragaId: raga.ragaId || raga.id,
        name: raga.name,
        system: raga.system,
        sampleCount: raga.sampleCount,
        fingerprintScore: fingerprint?.score || 0,
        fingerprintPathScore: fingerprint?.pathScore || 0,
        fingerprintSamples: fingerprint?.sampleCount || 0,
        bestSampleId: fingerprint?.bestSampleId || '',
        score,
        sequenceScore: Math.round(sequenceCoverage * 100),
        phraseScore: Math.round(phraseCoverage * 100),
        strong,
        matched: matched.map((interval) => intervalLabels[interval]),
        missing: missing.map((interval) => intervalLabels[interval]),
        signatureMissing: signatureMissing.map((interval) => intervalLabels[interval]),
        extra: extra.map((interval) => intervalLabels[interval])
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((match) => match.score > 15), heardSet, heardSequence, syllableEvidence, heardCounts);
}

function applyRagaConfusionRules(matches, heardSet, heardSequence, syllableEvidence = null, heardCounts = new Map()) {
  const has = (interval) => heardSet.has(interval);
  const count = (interval) => heardCounts.get(interval) || 0;
  const strongCount = Math.max(8, Math.max(...Array.from(heardCounts.values()), 1) * 0.18);
  const hasHeld = (interval) => has(interval) && count(interval) >= strongCount;
  const hasOrdered = (pattern) => longestCommonSubsequenceLength(heardSequence, pattern) >= pattern.length;
  const syllables = syllableEvidence?.labels || [];
  const hasSyllable = (label) => syllables.includes(label);
  const hasSyllableOrder = (pattern) => longestCommonSubsequenceLength(syllables, pattern) >= pattern.length;
  const mohanaSkeleton = has(0) && has(4) && has(7) && has(9) && (has(2) || heardSequence.length >= 5);
  const mohanaPhrase = hasOrdered([0, 4, 7, 9, 0]) || hasOrdered([0, 9, 7, 4, 2, 0]) || hasOrdered([0, 4, 7, 9]) || hasSyllableOrder(['S', 'G', 'P', 'D']);
  const hasHeldMaOrNi = hasHeld(5) || hasHeld(6) || hasHeld(11);
  const hasHeldNi = hasHeld(11);
  const hasHeldMa = hasHeld(5) || hasHeld(6);
  const bilahariAscent = hasOrdered([0, 2, 4, 7]) || (has(0) && has(2) && has(4) && has(7));
  const bilahariDescentBody = hasOrdered([7, 5, 4, 2, 0]) || (hasHeld(5) && has(4) && has(2) && has(0));
  const ambiguousUpperDn = has(10) && !has(8);
  const syllableBilahari = hasSyllableOrder(['S', 'R', 'G', 'P', 'D', 'S']) && hasSyllableOrder(['S', 'N', 'D', 'P', 'M', 'G', 'R', 'S']);
  const bilahariAmbiguousShape = (bilahariAscent && bilahariDescentBody && ambiguousUpperDn) || syllableBilahari;

  return matches
    .map((match) => {
      let score = match.score;
      const reasons = [];

      if (mohanaSkeleton && mohanaPhrase && !hasHeldMaOrNi) {
        if (match.id === 'mohana' || normalizeRagaSearchText(match.name) === 'mohana') {
          score += 18;
          reasons.push('Mohana skeleton held; no held Ma/Ni.');
        }
        if (['reference-bilahari', 'bilahari', 'hamsadhwani', 'shankarabharanam_bilawal'].includes(match.id) || ['bilahari', 'hamsadhwani', 'shankarabharanam'].includes(normalizeRagaSearchText(match.name))) {
          score -= match.id === 'hamsadhwani' ? 24 : 18;
          reasons.push('Rejected in Mohana battle: required held Ma/Ni was not present.');
        }
      }

      if (match.id === 'hamsadhwani' && has(9) && !hasHeldNi) {
        score -= 20;
        reasons.push('Hamsadhwani needs held N3; D2 was held instead.');
      }
      if (match.id === 'mohana' && hasHeldMa) {
        score -= 30;
        reasons.push('Mohana rejected: held Ma was detected.');
      }
      if (match.id === 'mohana' && hasHeldNi) {
        score -= 24;
        reasons.push('Mohana rejected: held N3 was detected.');
      }
      if ((match.id === 'bilahari' || normalizeRagaSearchText(match.name) === 'bilahari') && mohanaSkeleton && !hasHeld(5) && !hasHeld(11)) {
        score -= 22;
        reasons.push('Bilahari softened: Ma/Ni were not held strongly enough; Mohana remains possible.');
      }
      if (bilahariAmbiguousShape) {
        if (match.id === 'bilahari' || match.id === 'reference-bilahari') {
          score += syllableBilahari ? 34 : 24;
          reasons.push(syllableBilahari ? 'Clock 0 heard Bilahari swara syllable path.' : 'Bilahari shape held; upper D/N was captured as ambiguous D3/N2.');
        }
        if (['kedaragowla', 'madhyamavati'].includes(match.id)) {
          score -= syllableBilahari ? 36 : 26;
          reasons.push(syllableBilahari ? 'Rejected in Bilahari battle: syllables included Ni-Da-Pa-Ma-Ga-Ri-Sa.' : 'Rejected in Bilahari battle: G3 ascent plus descent Ma-Ga-Ri-Sa points away from this raga.');
        }
        if (match.id === 'kambhoji') {
          score -= 12;
          reasons.push('Kambhoji possible color, but Bilahari-style ascent was stronger.');
        }
      }

      return {
        ...match,
        score: Math.min(100, Math.max(0, score)),
        confusionNotes: reasons
      };
    })
    .sort((a, b) => b.score - a.score);
}

function detectPitch(buffer, sampleRate) {
  const rms = calculateRms(buffer);
  if (rms < 0.01) return 0;

  try {
    const candidates = [
      normalizePitchResult(yin(buffer, { fs: sampleRate, threshold: 0.12 })),
      normalizePitchResult(mcleod(buffer, { fs: sampleRate }))
    ]
      .filter(Boolean)
      .filter((result) => result.freq >= 75 && result.freq <= 950)
      .filter((result) => result.clarity >= 0.7);

    if (candidates.length >= 2) {
      const [primary, secondary] = candidates;
      const cents = Math.abs(1200 * Math.log2(primary.freq / secondary.freq));
      if (cents <= 70) return median(candidates.map((result) => result.freq));
      return primary.clarity >= secondary.clarity ? primary.freq : secondary.freq;
    }

    if (candidates.length === 1) return candidates[0].freq;
  } catch {
    // Fall back to the original autocorrelation path if the browser detector fails.
  }

  return detectPitchByAutocorrelation(buffer, sampleRate, rms);
}

function normalizePitchResult(result) {
  if (!result || !Number.isFinite(result.freq)) return null;
  return {
    freq: result.freq,
    clarity: Number.isFinite(result.clarity) ? result.clarity : 0
  };
}

function calculateRms(buffer) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  return Math.sqrt(rms / buffer.length);
}

function detectPitchByAutocorrelation(buffer, sampleRate, rms = calculateRms(buffer)) {
  if (rms < 0.01) return 0;
  let bestOffset = -1;
  let bestCorrelation = 0;
  const minFrequency = 80;
  const maxFrequency = 900;
  const minOffset = Math.floor(sampleRate / maxFrequency);
  const maxOffset = Math.floor(sampleRate / minFrequency);

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i += 1) {
      correlation += buffer[i] * buffer[i + offset];
    }
    correlation = correlation / (buffer.length - offset);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestCorrelation < 0.002 || bestOffset <= 0) return 0;
  return sampleRate / bestOffset;
}

function smoothDetectedFrequency(session, frequency) {
  if (!frequency) return 0;
  if (frequency < 75 || frequency > 950) return 0;

  const last = session.lastAcceptedFrequency;
  if (last) {
    const cents = Math.abs(1200 * Math.log2(frequency / last));
    if (cents > 760 && cents < 1050) return 0;
  }

  session.pitchWindow.push(frequency);
  if (session.pitchWindow.length > 5) session.pitchWindow.shift();
  const smoothed = median(session.pitchWindow);
  if (last) {
    const smoothedCents = Math.abs(1200 * Math.log2(smoothed / last));
    if (smoothedCents > 1050) return 0;
  }
  session.lastAcceptedFrequency = smoothed;
  return smoothed;
}

function normalizeSwara(swara) {
  return swara.replace(/[’']/g, '').trim();
}

function displaySwaraLabel(swara, notationSystem = 'Karnatik') {
  const normalized = normalizeSwara(swara);
  if (notationSystem === 'Hindustani') {
    return hindustaniSwaraDisplayAliases[normalized] || normalized;
  }
  return swaraDisplayAliases[normalized] || normalized;
}

function noteFromInterval(root, interval) {
  const rootIndex = chromatic.indexOf(root);
  return chromatic[(rootIndex + interval + 12) % 12];
}

function chordSuffix(quality) {
  if (quality === 'major') return '';
  if (quality === 'minor') return 'm';
  if (quality === 'no3') return '5';
  return quality;
}

function formatConcertDate(value) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
}

function formatConcertTime(value) {
  if (!value) return 'Time TBA';
  if (/[ap]m/i.test(value)) return value;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours)) return value;
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 0, 1, hours, minutes || 0));
}

function calendarDateStamp(date, time) {
  const [hours, minutes] = /[ap]m/i.test(time || '')
    ? parseDisplayTime(time)
    : (time || '18:00').split(':').map(Number);
  const start = new Date(`${date || new Date().toISOString().slice(0, 10)}T${String(hours || 18).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = (nextDate) => nextDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return { start: stamp(start), end: stamp(end) };
}

function parseDisplayTime(value) {
  const match = String(value || '').match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)/i);
  if (!match) return [18, 0];
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridian = match[3].toLowerCase();
  if (meridian === 'pm' && hours < 12) hours += 12;
  if (meridian === 'am' && hours === 12) hours = 0;
  return [hours, minutes];
}

function downloadConcertCalendar(event) {
  const { start, end } = calendarDateStamp(event.date, event.time);
  const safe = (value) => String(value || '').replace(/[,\n]/g, ' ').trim();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Karnatik.ai//Concert Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@karnatik.ai`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${safe(event.title)}`,
    `DESCRIPTION:${safe(`${event.artist} · ${event.type}`)}`,
    `LOCATION:${safe(`${event.venue}, ${event.area || ''}, ${event.city}`)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'karnatik-concert'}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function swaraFrequency(swara, root, octave = 4) {
  const normalized = normalizeSwara(swara);
  const interval = swaraIntervals[normalized];
  if (interval === undefined) return 0;
  const note = noteFromInterval(root, interval);
  const octaveOffset = /['’]/.test(swara) ? 1 : 0;
  return noteToFrequency(note, octave + octaveOffset);
}

function stopSwaraPlayback() {
  const current = swaraPlaybackController.current;
  if (!current) return;
  current.timers?.forEach((timer) => window.clearTimeout(timer));
  current.sources?.forEach((source) => {
    try {
      source.stop(0);
    } catch {
      // The note may already have finished naturally.
    }
  });
  try {
    current.master?.disconnect();
  } catch {
    // Master may already be disconnected while closing the context.
  }
  if (current.context?.state !== 'closed') {
    current.context.close().catch(() => {});
  }
  swaraPlaybackController.current = null;
}

function playSwaraLine(line, root, playbackKey = `${root}-${line.join('-')}`) {
  if (swaraPlaybackController.current?.key === playbackKey) {
    stopSwaraPlayback();
    return false;
  }
  stopSwaraPlayback();
  stopRecordedPlayback();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  const context = new AudioContextClass();
  context.resume();
  const master = context.createGain();
  master.gain.value = 0.16;
  master.connect(context.destination);
  const now = context.currentTime + 0.04;
  const step = 0.42;
  const player = { key: playbackKey, context, master, sources: [], timers: [] };
  swaraPlaybackController.current = player;
  let noteIndex = 0;

  line.forEach((swara) => {
    if (swara === '|') {
      noteIndex += 1;
      return;
    }
    const frequency = swaraFrequency(swara, root);
    if (!frequency) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + noteIndex * step;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(1, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + step * 0.82);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + step * 0.9);
    player.sources.push(oscillator);
    noteIndex += 1;
  });

  const cleanupTimer = window.setTimeout(() => {
    if (swaraPlaybackController.current === player) stopSwaraPlayback();
  }, (noteIndex * step + 0.6) * 1000);
  player.timers.push(cleanupTimer);
  return true;
}

function playSingleSwara(swara, root) {
  playSwaraLine([swara], root, `single-${root}-${swara}`);
}

function getTuneChordSuggestions(root, heardSwaras = []) {
  const rootIndex = chromatic.indexOf(root);
  if (rootIndex < 0 || heardSwaras.length < 2) return [];

  const scaleSet = new Set(heardSwaras.map((item) => item.interval));
  scaleSet.add(0);
  const counts = new Map(heardSwaras.map((item) => [item.interval, item.count || 1]));
  counts.set(0, Math.max(counts.get(0) || 0, 1));
  const totalCount = [...counts.values()].reduce((sum, count) => sum + count, 0) || 1;
  const candidates = [];

  for (const baseInterval of scaleSet) {
    for (const [quality, pattern] of Object.entries(triadPatterns)) {
      const chordIntervals = pattern.map((step) => (baseInterval + step) % 12);
      if (!chordIntervals.every((interval) => scaleSet.has(interval))) continue;
      const baseNote = chromatic[(rootIndex + baseInterval) % 12];
      const coverage = chordIntervals.reduce((sum, interval) => sum + (counts.get(interval) || 0), 0) / totalCount;
      const priority = baseInterval === 0 || baseInterval === 7 ? 'anchor' : 'color';
      candidates.push({
        name: `${baseNote}${chordSuffix(quality)}`,
        notes: chordIntervals.map((interval) => chromatic[(rootIndex + interval) % 12]),
        baseInterval,
        quality,
        role: baseInterval === 0 ? 'Sa anchor' : baseInterval === 7 ? 'Pa support' : 'Phrase color',
        reason: `${Math.round(coverage * 100)}% of held-note evidence; detected pitches only`,
        priority,
        coverage
      });
    }
  }

  return candidates
    .filter((chord, index, list) => list.findIndex((item) => item.name === chord.name) === index)
    .sort((left, right) => {
      const priorityDifference = (left.priority === 'anchor' ? 0 : 1) - (right.priority === 'anchor' ? 0 : 1);
      if (priorityDifference) return priorityDifference;
      const coverageDifference = right.coverage - left.coverage;
      if (coverageDifference) return coverageDifference;
      return (chordQualityRank[left.quality] ?? 9) - (chordQualityRank[right.quality] ?? 9);
    })
    .slice(0, 8);
}

function getHarmony(raga, root) {
  const uniqueSwaras = Array.from(new Set(raga.arohana.concat(raga.avarohana).map(normalizeSwara))).filter(
    (swara) => swara !== '|' && swaraIntervals[swara] !== undefined
  );
  const intervals = uniqueSwaras.map((swara) => swaraIntervals[swara]);
  const scale = uniqueSwaras.map((swara) => ({
    swara,
    displaySwara: displaySwaraLabel(swara),
    note: noteFromInterval(root, swaraIntervals[swara])
  }));
  const scaleSet = new Set(intervals);
  const rootIndex = chromatic.indexOf(root);

  const candidates = [];
  for (const baseInterval of intervals) {
    for (const [quality, pattern] of Object.entries(triadPatterns)) {
      const chordIntervals = pattern.map((step) => (baseInterval + step) % 12);
      if (chordIntervals.every((step) => scaleSet.has(step))) {
        const baseNote = chromatic[(rootIndex + baseInterval) % 12];
        const suffix = chordSuffix(quality);
        const role =
          baseInterval === 0
            ? 'Sa anchor'
            : baseInterval === 7
              ? 'Pa support'
              : [1, 3, 8, 10, 11].includes(baseInterval)
                ? 'Use carefully'
                : 'Color chord';
        candidates.push({
          name: `${baseNote}${suffix}`,
          notes: chordIntervals.map((step) => chromatic[(rootIndex + step) % 12]),
          baseInterval,
          quality,
          role,
          reason:
            baseInterval === 0
              ? 'Sa-Ga-Pa tonic anchor'
              : baseInterval === 7
                ? 'Stable Pa support'
                : [1, 3, 8, 10, 11].includes(baseInterval)
                  ? 'Raga-note subset, not a primary home chord'
                  : 'Uses raga tones only',
          priority: baseInterval === 0 || baseInterval === 7 ? 'anchor' : role === 'Use carefully' ? 'careful' : 'color'
        });
      }
    }
  }

  const deduped = candidates
    .filter((chord, index, list) => list.findIndex((item) => item.name === chord.name) === index)
    .sort((a, b) => {
      const roleDiff = (swaraRoleRank[a.baseInterval] ?? 7) - (swaraRoleRank[b.baseInterval] ?? 7);
      if (roleDiff !== 0) return roleDiff;
      return (chordQualityRank[a.quality] ?? 9) - (chordQualityRank[b.quality] ?? 9);
    });
  const avoid = chromatic
    .map((note, index) => ({ note, interval: (index - rootIndex + 12) % 12 }))
    .filter((item) => !scaleSet.has(item.interval))
    .map((item) => item.note);

  return { scale, chords: deduped.slice(0, 8), avoid };
}

function analyseChordAgainstRaga(raga, root, chordRoot, quality) {
  const uniqueSwaras = Array.from(new Set(raga.arohana.concat(raga.avarohana).map(normalizeSwara))).filter(
    (swara) => swaraIntervals[swara] !== undefined
  );
  const scaleIntervals = uniqueSwaras.map((swara) => swaraIntervals[swara]);
  const scaleSet = new Set(scaleIntervals);
  const rootIndex = chromatic.indexOf(root);
  const chordRootIndex = chromatic.indexOf(chordRoot);
  const baseInterval = (chordRootIndex - rootIndex + 12) % 12;
  const pattern = triadPatterns[quality] || triadPatterns.major;
  const chordIntervals = pattern.map((step) => (baseInterval + step) % 12);
  const notes = chordIntervals.map((step) => chromatic[(rootIndex + step) % 12]);
  const outside = chordIntervals.filter((step) => !scaleSet.has(step));
  const outsideNotes = outside.map((step) => chromatic[(rootIndex + step) % 12]);
  const label = chordQualityLabels.find((item) => item.id === quality)?.label || quality;
  const suffix = chordSuffix(quality);
  const name = `${chordRoot}${suffix}`;

  if (outside.length === 0) {
    const anchor = baseInterval === 0 || baseInterval === 7;
    return {
      name,
      notes,
      status: anchor ? 'safe' : 'color',
      message: anchor ? 'Works as a safe support chord.' : 'Works as a color chord, but place it according to the phrase.',
      detail: `${name} (${label}) uses only notes from ${raga.name} when Sa is ${root}.`
    };
  }

  return {
    name,
    notes,
    status: 'avoid',
    message: 'Use carefully or avoid for this raga context.',
    detail: `${name} adds ${outsideNotes.join(', ')}, which ${outsideNotes.length === 1 ? 'is' : 'are'} outside ${raga.name} when Sa is ${root}.`
  };
}

function buildTest(raga, harmony, root, count, types, difficulty) {
  const scaleNotes = harmony.scale.map((item) => item.note).join(' ');
  const swaraLine = harmony.scale.map((item) => item.displaySwara).join(' ');
  const primaryChord = harmony.chords[0];
  const supportChord = harmony.chords.find((chord) => chord.reason === 'Stable Pa support') || harmony.chords[1] || primaryChord;
  const colorChord = harmony.chords.find((chord) => chord.priority !== 'anchor') || harmony.chords[2] || primaryChord;
  const phrase = raga.phrases[0];
  const secondPhrase = raga.phrases[1] || raga.pakad;
  const bank = {
    Scale: [
      {
        type: 'Scale',
        prompt: `Sing ${raga.name} arohana from Sa = ${root}, then name the notes.`,
        answer: scaleNotes
      },
      {
        type: 'Scale',
        prompt: `Write the swara map for ${raga.name} in ${root}.`,
        answer: swaraLine
      }
    ],
    Chord: [
      {
        type: 'Chord',
        prompt: `Choose a tonic anchor chord for ${raga.name} when Sa is ${root}.`,
        answer: primaryChord ? `${primaryChord.name}: ${primaryChord.notes.join(' - ')}` : 'Use Sa and Pa as a drone anchor.'
      },
      {
        type: 'Chord',
        prompt: `Suggest a phrase-support chord that keeps the raga notes intact.`,
        answer: supportChord ? `${supportChord.name}: ${supportChord.notes.join(' - ')}` : 'Use a Sa-Pa open fifth.'
      },
      {
        type: 'Chord',
        prompt: `Pick one color chord and explain why it is safe.`,
        answer: colorChord ? `${colorChord.name}: all notes belong to ${raga.name}.` : 'Use a sparse drone instead of a triad.'
      }
    ],
    Phrase: [
      {
        type: 'Phrase',
        prompt: `Sing the pakad, then land on a stable chord.`,
        answer: `${raga.pakad} -> ${primaryChord?.name || root}`
      },
      {
        type: 'Phrase',
        prompt: `Transpose this phrase into note names for Sa = ${root}: ${phrase}`,
        answer: secondPhrase
      }
    ],
    'Avoid Notes': [
      {
        type: 'Avoid',
        prompt: `Name three notes to avoid over ${raga.name} in ${root}.`,
        answer: harmony.avoid.slice(0, 3).join(', ')
      },
      {
        type: 'Avoid',
        prompt: `Why should outside chords be used carefully in this raga?`,
        answer: 'They introduce notes outside the arohana/avarohana and can weaken the raga bhava.'
      }
    ]
  };

  const selectedBank = types.flatMap((type) => bank[type]);
  const compositionQuestion = {
    type: 'Composition',
    prompt: `Create a two-chord vamp for a short ${raga.name} composition in ${root}.`,
    answer: [primaryChord?.name, supportChord?.name].filter(Boolean).join(' -> ') || `${root} drone`
  };
  const pool = difficulty === 'Composition' ? [...selectedBank, compositionQuestion] : selectedBank;
  return Array.from({ length: Math.min(count, pool.length) }, (_, index) => pool[index % pool.length]);
}

function ScaleBlock({ title, notes }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="scale-notes">{notes.map((note, index) => <span key={`${note}-${index}`}>{note}</span>)}</div>
    </section>
  );
}

function Fact({ title, body }) {
  return (
    <div className="fact">
      <h3>{title}</h3>
      {body.split('\n').map((line) => <p key={line}>{line}</p>)}
    </div>
  );
}

function ControlRow({ label, value, accent }) {
  return (
    <div className="control-row">
      <span>{label}</span>
      <button>-</button>
      <strong className={accent ? 'accent' : ''}>{value}</strong>
      <button>+</button>
    </div>
  );
}

const legacyVoices = [
  {
    name: 'Purandara Dasa',
    role: 'The pedagogue',
    text: 'The Sangeeta Pitamaha gave generations of learners a graded path into music, joining devotion, language, and disciplined practice.'
  },
  {
    name: 'T. Chowdiah',
    role: 'The innovator',
    text: 'From Mysuru came a violinist who redesigned his instrument for the concert hall and expanded how Karnatik music could be heard.'
  },
  {
    name: 'R.K. Srikantan',
    role: 'The scholar-performer',
    text: 'A life of rigorous singing and teaching carried the Mysuru tradition forward with clarity, restraint, and depth.'
  },
  {
    name: 'Gangubai Hangal',
    role: 'The uncompromising voice',
    text: 'From Dharwad, her commanding Kirana gayaki showed that Karnataka could be an essential home for Hindustani music too.'
  },
  {
    name: 'Bhimsen Joshi',
    role: 'The searching voice',
    text: 'Born in Gadag and formed through the guru-shishya tradition, his music travelled across language, region, and generations.'
  }
];

function LandingPage({
  user,
  onOpenWorkspace,
  email,
  setEmail,
  password,
  setPassword,
  error,
  message,
  submitting,
  handleAuth
}) {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="Karnatik.ai home">
          <span className="landing-brand-mark">K</span>
          <span>Karnatik.ai</span>
        </a>
        <nav aria-label="Landing page navigation">
          <a href="#story">Our story</a>
          <a href="#legacy">Legacy</a>
          <a href="/downloads">Downloads</a>
          <a href="#beta">Private beta</a>
        </nav>
        {user ? (
          <button className="landing-enter" type="button" onClick={onOpenWorkspace}>Open workspace <ArrowRight size={17} /></button>
        ) : (
          <a className="landing-enter" href="#beta">Sign in <ArrowRight size={17} /></a>
        )}
      </header>

      <section className="landing-hero" id="top">
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <h1>Karnatik.ai</h1>
          <p className="landing-lede">Where India&apos;s musical memory becomes a living intelligence.</p>
          <p className="landing-intro">A new home for learning, practising, preserving, and understanding the many traditions of Indian music.</p>
          <div className="landing-hero-actions">
            <a className="landing-primary" href="#story">Discover the story <ArrowRight size={18} /></a>
            {user ? (
              <button className="landing-secondary" type="button" onClick={onOpenWorkspace}>Open workspace</button>
            ) : (
              <a className="landing-secondary" href="#beta">Enter private beta</a>
            )}
          </div>
        </div>
        <p className="landing-image-note">An imagined Mysuru durbar, where musical traditions met under royal patronage.</p>
      </section>

      <section className="landing-statement" id="story">
        <p className="landing-section-label">What Karnatik means</p>
        <h2>Not one genre. A generous musical home.</h2>
        <div className="landing-story-columns">
          <p>Karnatik is our name for a living continuum. It begins in Karnataka, but it is not bounded by geography, language, or one classical system.</p>
          <p>For centuries, this land made room for Haridasa poetry, Karnatik scholarship, Hindustani gayaki, instrumental invention, folk memory, and royal experimentation. Traditions did not merely coexist here. They listened to one another.</p>
        </div>
      </section>

      <section className="landing-origin">
        <div className="landing-origin-copy">
          <p className="landing-section-label">A method becomes a movement</p>
          <h2>Purandara Dasa placed learning at the heart of music.</h2>
          <p>Revered as the Sangeeta Pitamaha, Purandara Dasa helped shape a systematic path for musical learning. His legacy reminds us that tradition survives when knowledge can be taught, practised, remembered, and passed forward.</p>
        </div>
        <blockquote>
          <span>Our starting belief</span>
          Indian music deserves technology that understands its own grammar, pedagogy, and ways of listening.
        </blockquote>
      </section>

      <section className="landing-patronage">
        <div>
          <p className="landing-section-label">The Mysuru imagination</p>
          <h2>A court that did more than preserve culture. It enabled culture to evolve.</h2>
        </div>
        <div className="landing-patronage-copy">
          <p>The Wadiyars of Mysuru sustained musicians, composers, dancers, scholars, and orchestras. Their courts welcomed Karnatik, Hindustani, and Western musical thought, while Mysuru developed a distinctive voice of its own.</p>
          <p>That spirit of patronage matters to Karnatik.ai: create the conditions, respect the practitioner, and let knowledge travel further than it could before.</p>
        </div>
      </section>

      <section className="landing-legacy" id="legacy">
        <div className="landing-legacy-heading">
          <p className="landing-section-label">Many lineages, one musical home</p>
          <h2>Voices that made Karnataka resonate across India.</h2>
        </div>
        <div className="landing-legacy-list">
          {legacyVoices.map((voice, index) => (
            <article key={voice.name}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{voice.role}</p>
                <h3>{voice.name}</h3>
              </div>
              <p>{voice.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-future">
        <p className="landing-section-label">The next chapter</p>
        <h2>From oral inheritance to living intelligence.</h2>
        <p>Karnatik.ai brings this cultural hospitality into the digital age: tools that can listen, teach, accompany, test, explain, and eventually understand Indian music on its own terms.</p>
        <div className="landing-pillars" aria-label="Karnatik.ai vision">
          <span>Learn with context</span>
          <span>Practise with precision</span>
          <span>Preserve with dignity</span>
          <span>Build with musicians</span>
        </div>
      </section>

      <section className="landing-beta" id="beta">
        <div className="landing-beta-copy">
          <p className="landing-section-label">Karnatik.ai private beta</p>
          <h2>Help shape the next home for Indian music.</h2>
          <p>Our first circle brings musicians, teachers, and serious learners into the product while the listening intelligence continues to learn.</p>
          <div className="landing-contact">
            <p>For more details about Karnatik.ai, please reach out.</p>
            <a href="mailto:ramanujan.mk@musicloudstudio.com"><Mail size={18} /> ramanujan.mk@musicloudstudio.com</a>
            <a href="tel:+918861003111"><Phone size={18} /> +91 88610 03111</a>
          </div>
        </div>
        {user ? (
          <div className="landing-login landing-session">
            <p className="landing-session-label">Signed in as</p>
            <h3>{user.email}</h3>
            <p>Your practice workspace is ready.</p>
            <button type="button" onClick={onOpenWorkspace}>Open workspace <ArrowRight size={18} /></button>
          </div>
        ) : (
          <form className="landing-login" onSubmit={handleAuth}>
            <h3>Enter the beta</h3>
            <label>
              Email
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                placeholder="Minimum 6 characters"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
              />
            </label>
            {error ? <p className="access-error">{error}</p> : null}
            {message ? <p className="access-message">{message}</p> : null}
            <button type="submit" disabled={submitting}>{submitting ? 'Please wait...' : <>Sign in <ArrowRight size={18} /></>}</button>
          </form>
        )}
      </section>

      <footer className="landing-footer">
        <div className="landing-brand">
          <span className="landing-brand-mark">K</span>
          <span>Karnatik.ai</span>
        </div>
        <p>Indian music, heard on its own terms.</p>
        <p>Private beta · 2026</p>
      </footer>
    </main>
  );
}

function AuthGate() {
  const isDownloadsRoute = window.location.pathname.toLowerCase() === '/downloads';
  const [session, setSession] = useState(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    return path.startsWith('/app') || path === '/planner' || path === '/kanban';
  });
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      setWorkspaceOpen(path.startsWith('/app') || path === '/planner' || path === '/kanban');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    if (!supabase) return;

    setSubmitting(true);
    setError('');
    setMessage('');

    const credentials = { email: email.trim(), password };
    const result = await supabase.auth.signInWithPassword(credentials);

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setMessage('Signed in.');
    window.history.replaceState({}, '', '/app');
    setWorkspaceOpen(true);
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    window.history.replaceState({}, '', '/');
    setWorkspaceOpen(false);
  }

  function openWorkspace() {
    window.history.pushState({}, '', '/app');
    setWorkspaceOpen(true);
  }

  if (loading) {
    return (
      <main className="access-gate">
        <section className="access-panel">
          <p className="access-kicker">Private beta</p>
          <h1>Checking your session...</h1>
        </section>
      </main>
    );
  }

  if (isDownloadsRoute) {
    return <DownloadsPage session={session} />;
  }

  const provider = String(session?.user?.app_metadata?.provider || '');
  const isWorkspaceOwner = normalizeEmail(session?.user?.email) === PLANNER_OWNER_EMAIL;
  const canOpenWorkspace = provider !== 'google' || isWorkspaceOwner;

  if (session && workspaceOpen && canOpenWorkspace) {
    return <App user={session.user} onSignOut={signOut} />;
  }

  if (session && workspaceOpen && !canOpenWorkspace) {
    return (
      <main className="access-gate">
        <section className="access-panel">
          <p className="access-kicker">Downloads access</p>
          <h1>Your Google sign-in unlocks beta downloads.</h1>
          <p className="access-copy">The RAGA Companion workspace remains invite-only.</p>
          <a className="landing-primary" href="/downloads">Open downloads <ArrowRight size={18} /></a>
        </section>
      </main>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="access-gate">
        <section className="access-panel">
          <p className="access-kicker">Karnatik.ai private beta</p>
          <h1>Indian music intelligence, built for serious practice.</h1>
          <div className="auth-setup">
            <p className="access-copy">Authentication is ready in the app, but Supabase environment variables are not configured yet.</p>
            <code>VITE_SUPABASE_URL</code>
            <code>VITE_SUPABASE_ANON_KEY</code>
          </div>
        </section>
      </main>
    );
  }

  return (
    <LandingPage
      user={session?.user || null}
      onOpenWorkspace={openWorkspace}
      email={email}
      setEmail={(value) => {
        setEmail(value);
        setError('');
      }}
      password={password}
      setPassword={(value) => {
        setPassword(value);
        setError('');
      }}
      error={error}
      message={message}
      submitting={submitting}
      handleAuth={handleAuth}
    />
  );
}

createRoot(document.getElementById('root')).render(<AuthGate />);
