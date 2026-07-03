import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Compass,
  ClipboardList,
  Library,
  LogOut,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Music2,
  Navigation,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings,
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

const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const tamburaSamples = ['C', 'C#', 'D', 'E', 'F', 'G', 'A', 'B'];
const tamburaAssetNames = { 'C#': 'Csharp' };
const tamburaLoopSettings = {
  A: { startTrim: 1, tailTrim: 1.2, crossfade: 2.4 },
  B: { startTrim: 0.85, tailTrim: 1.2, crossfade: 2.4 },
  C: { startTrim: 1, tailTrim: 3, crossfade: 3.2 },
  'C#': { startTrim: 1, tailTrim: 1.8, crossfade: 2.6 },
  D: { startTrim: 1.5, tailTrim: 2.5, crossfade: 2.8 },
  E: { startTrim: 1.5, tailTrim: 2, crossfade: 2.7 },
  F: { startTrim: 0.85, tailTrim: 1.7, crossfade: 2.2 },
  G: { startTrim: 0.85, tailTrim: 1.3, crossfade: 2.2 }
};
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
const practiceSteps = ['Arohana-Avarohana', 'Pakad / Chalan', 'Alap Builder', 'Bandish / Kriti'];
const testTypes = ['Scale', 'Chord', 'Phrase', 'Avoid Notes'];
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
const roadmapColumns = [
  {
    title: 'Done',
    tone: 'done',
    items: [
      { title: 'Web prototype shell', meta: 'Practice console' },
      { title: 'Tanpura sample playback', meta: 'Sa-Pa sample loop' },
      { title: 'Pitch-aware metronome', meta: 'BPM, click volume, beat pulse' },
      { title: 'Test builder', meta: 'Scale, chord, phrase prompts' },
      { title: 'Chord Analyser v1', meta: 'Separate raga-aware composer tool' },
      { title: 'Karnatik Ragas page', meta: '72 Melakarta chakras + legend' },
      { title: 'Random quiz drill', meta: 'Melakarta, chakra, Janya recognition' },
      { title: 'Database v1 module', meta: '206 entries across featured, Janaka, Janya, Hindustani' }
    ]
  },
  {
    title: 'In Progress',
    tone: 'active',
    items: [
      { title: 'Phrase-level database review', meta: 'Arohana, avarohana, pakad, nyasa for catalogue entries' },
      { title: 'Janaka/Janya catalogue expansion', meta: 'Grow beyond 75 reviewed Janya entries' },
      { title: 'Raga detection rules', meta: 'Scale match + signature swaras' },
      { title: 'Chord logic review', meta: 'Guru/composer validation for edge cases' },
      { title: 'Competitive positioning', meta: 'Differentiate from Abhyas-style content libraries' }
    ]
  },
  {
    title: 'Next',
    tone: 'next',
    items: [
      { title: 'AI interaction engine', meta: 'Guided answers from approved raga data' },
      { title: 'Certification programs', meta: 'Levels, assessments, revenue model' },
      { title: 'Teacher Studio / Academy instances', meta: 'Multi-tenant schools, batches, lessons, assignments, attendance, feedback, payments' },
      { title: 'Raga ear training', meta: 'Arohana/Avarohana first, phrases later' },
      { title: 'Interactive raga visualizations', meta: 'Relationships, Melakarta, similar ragas, mood, time-of-day, composer, Kriti explorers' },
      { title: 'Time signatures / tala cycles', meta: 'Cycle accents and progress' },
      { title: 'Host on thekarnatik.com', meta: 'Production build, domain route, QA' },
      { title: 'Raga database expansion', meta: '100+ reviewed ragas' },
      { title: 'PWA install path', meta: 'Mobile-ready web app before native apps' }
    ]
  },
  {
    title: 'Later',
    tone: 'later',
    items: [
      { title: 'Sa-Ma-Pa-Sa drone mode', meta: 'Waiting for correct samples' },
      { title: 'Tambura sample overhaul', meta: 'Loop-ready assets and mode variants' },
      { title: 'Real vocal phrase library', meta: 'For ear training and detection' },
      { title: 'Logic Pro AU plugin', meta: 'JUCE track after web launch' },
      { title: 'Portable raga engine', meta: 'Shared data for web, PWA, AU/VST3' }
    ]
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

  return questions;
}

const ragaQuizQuestions = buildRagaQuizQuestions();
const quizBuckets = [
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
  const [activePage, setActivePage] = useState('practice');
  const [system, setSystem] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('kalyani');
  const [activeStep, setActiveStep] = useState(0);
  const [tanpuraOn, setTanpuraOn] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [tempo, setTempo] = useState(60);
  const [metronomeVolume, setMetronomeVolume] = useState(62);
  const [volume, setVolume] = useState(72);
  const [pitch, setPitch] = useState('C#');
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
  const [testDifficulty, setTestDifficulty] = useState('Foundation');
  const [questionCount, setQuestionCount] = useState(6);
  const [enabledTypes, setEnabledTypes] = useState(['Scale', 'Chord', 'Phrase']);
  const detectorSessionRef = useRef(null);
  const ragaSessionRef = useRef(null);
  const tanpuraRef = useRef(null);
  const metronomeRef = useRef(null);
  const [ragaDetector, setRagaDetector] = useState({
    status: 'idle',
    heardNotes: [],
    heardSwaras: [],
    matches: [],
    stage: 'Ready: sing Arohana first, then Avarohana slowly.',
    processLog: ['Ready: set your Sa, click Detect Raga, then sing Arohana and Avarohana slowly.'],
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
  const harmony = useMemo(() => getHarmony(selected, pitch), [selected, pitch]);
  const generatedTest = useMemo(
    () => buildTest(selected, harmony, pitch, questionCount, enabledTypes, testDifficulty),
    [selected, harmony, pitch, questionCount, enabledTypes, testDifficulty]
  );

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
  }, [pitch]);

  useEffect(() => {
    return () => stopTanpura();
  }, []);

  useEffect(() => {
    if (metronomeOn) {
      stopMetronome();
      startMetronome();
    }
  }, [tempo, pitch, metronomeVolume]);

  useEffect(() => {
    return () => stopMetronome();
  }, []);

  function toggleType(type) {
    setEnabledTypes((current) => {
      if (current.includes(type) && current.length > 1) {
        return current.filter((item) => item !== type);
      }
      if (!current.includes(type)) {
        return [...current, type];
      }
      return current;
    });
  }

  function setTempoClamped(nextTempo) {
    setTempo(Math.min(240, Math.max(30, nextTempo)));
  }

  async function startTanpura() {
    stopTanpura();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    setTanpuraOn(true);
    const context = new AudioContextClass();
    try {
      await context.resume();
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);
      masterGain.gain.setTargetAtTime(volumeToGain(volume), context.currentTime, 0.08);

      const sample = nearestTamburaSample(pitch);
      const assetName = tamburaAssetNames[sample.note] || sample.note;
      const response = await fetch(`/tambura/${assetName}.wav`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      const drone = { context, masterGain, sources: [], timers: [], stopped: false };
      tanpuraRef.current = drone;
      scheduleTamburaSegments(drone, audioBuffer, sample.rate, sample.note);
    } catch (error) {
      context.close();
      tanpuraRef.current = null;
      setTanpuraOn(false);
    }
  }

  function stopTanpura() {
    const drone = tanpuraRef.current;
    if (!drone) {
      setTanpuraOn(false);
      return;
    }
    const now = drone.context.currentTime;
    drone.masterGain.gain.cancelScheduledValues(now);
    drone.masterGain.gain.setTargetAtTime(0, now, 0.04);
    drone.stopped = true;
    drone.timers.forEach((timer) => window.clearTimeout(timer));
    drone.sources.forEach((source) => source.stop(now + 0.16));
    setTimeout(() => drone.context.close(), 220);
    tanpuraRef.current = null;
    setTanpuraOn(false);
  }

  function toggleTanpura() {
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
    const click = () => {
      const now = context.currentTime;
      const currentBeat = (beat % 4) + 1;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const sa = noteToFrequency(pitch, 5);
      const pa = sa * 1.5;
      oscillator.type = beat % 4 === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = beat % 4 === 0 ? sa : pa;
      const clickGain = metronomeVolumeToGain(metronomeVolume);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(beat % 4 === 0 ? clickGain * 1.22 : clickGain, now + 0.008);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDetector((current) => ({
        ...current,
        status: 'listening',
        stage: 'Listening now. Continue singing Sa until you are ready.',
        processLog: ['Mic connected.', 'Listening now: sing Sa steadily.', 'Tap Stop & Detect when you want me to choose the root.']
      }));
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
        heardNotes: [],
        heardSwaras: [],
        matches: [],
        stage: `Listening using Sa = ${pitch}. Sing Arohana, then Avarohana.`,
        processLog: ['Mic connected.', `Using ${pitch} as Sa.`, 'Sing Arohana first, then Avarohana slowly. Tap Stop & Identify when done.'],
        error: ''
      });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        rafId: 0,
        silentFrames: 0,
        root: pitch
      };
      ragaSessionRef.current = session;

      const tick = () => {
        if (ragaSessionRef.current !== session) return;
        analyser.getFloatTimeDomainData(buffer);
        const frequency = detectPitch(buffer, audioContext.sampleRate);
        if (frequency) {
          const detected = frequencyToNote(frequency);
          const interval = noteToInterval(detected.note, session.root);
          session.samples.push(frequency);
          session.heard.push({ note: detected.note, frequency, interval });
          session.silentFrames = 0;
          const heardSwaras = summarizeHeardIntervals(session.heard);
          setRagaDetector((current) => ({
            ...current,
            status: 'listening',
            heardNotes: summarizeHeardNotes(session.heard).slice(0, 6),
            heardSwaras,
            stage: `Listening... latest note ${detected.note} = ${intervalLabels[interval]}.`,
            processLog: [
              'Mic connected.',
              `Using ${session.root} as Sa.`,
              `Detected swaras so far: ${heardSwaras.map((item) => item.swara).join(' ') || 'waiting...'}`,
              'Tap Stop & Identify after Arohana and Avarohana.'
            ],
            error: ''
          }));
        } else {
          session.silentFrames += 1;
          if (session.silentFrames === 45) {
            setRagaDetector((current) => ({
              ...current,
              status: 'listening',
              stage: 'Continue singing. I am waiting for clear notes.',
              processLog: [
                'Mic connected.',
                `Using ${session.root} as Sa.`,
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
    session.stream.getTracks().forEach((track) => track.stop());
    session.audioContext.close();
    ragaSessionRef.current = null;

    const heardSwaras = summarizeHeardIntervals(session.heard);
    if (!heardSwaras.length) {
      setRagaDetector({
        status: 'error',
        heardNotes: [],
        heardSwaras: [],
        matches: [],
        stage: `Could not identify the raga yet. Current key/Sa is ${session.root}.`,
        processLog: [
          'Mic connected.',
          'Listening stopped by you.',
          `Key/Sa reference: ${session.root}.`,
          'I did not get enough stable notes from the Arohana/Avarohana to compare ragas.'
        ],
        error: `Key detected/selected: ${session.root}. Raga not detected yet. Try singing clear Arohana and Avarohana slowly.`
      });
      return;
    }

    const matches = matchRagas(heardSwaras.map((item) => item.interval));
    const confirmedMatch = matches.find((match) => match.strong);
    setRagaDetector({
      status: 'detected',
      heardNotes: summarizeHeardNotes(session.heard).slice(0, 6),
      heardSwaras,
      matches,
      stage: confirmedMatch
        ? `Likely raga: ${confirmedMatch.name} (${confirmedMatch.score}%).`
        : `Could not identify the raga yet. Current key/Sa is ${session.root}.`,
      processLog: [
        'Mic connected.',
        'Listening stopped by you.',
        `Key/Sa reference: ${session.root}.`,
        `Heard swaras: ${heardSwaras.map((item) => item.swara).join(' ')}.`,
        confirmedMatch ? `Top match: ${confirmedMatch.name} at ${confirmedMatch.score}%.` : 'No confident raga match. Sing the complete Arohana and Avarohana slowly.'
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
          <button className={`nav-item ${activePage === 'practice' ? 'active' : ''}`} onClick={() => setActivePage('practice')}><Compass size={17} /> Practice</button>
          <button className="nav-item"><Library size={17} /> Library</button>
          <button className={`nav-item ${activePage === 'chords' ? 'active' : ''}`} onClick={() => setActivePage('chords')}><Wand2 size={17} /> Chord Analyser</button>
          <button className={`nav-item ${activePage === 'karnatik' ? 'active' : ''}`} onClick={() => setActivePage('karnatik')}><BookOpen size={17} /> Karnatik Ragas</button>
          <button className={`nav-item ${activePage === 'quiz' ? 'active' : ''}`} onClick={() => setActivePage('quiz')}><ClipboardList size={17} /> Quiz</button>
          <button className={`nav-item ${activePage === 'ear-training' ? 'active' : ''}`} onClick={() => setActivePage('ear-training')}><Music2 size={17} /> Ear Training</button>
          <button className={`nav-item ${activePage === 'concerts' ? 'active' : ''}`} onClick={() => setActivePage('concerts')}><CalendarDays size={17} /> Concerts</button>
        </nav>
        <div className="top-actions">
          <span className="signed-in-user"><UserCircle2 size={18} /> {user?.email || 'Beta user'}</span>
          <button className="sign-out-button" onClick={onSignOut}><LogOut size={17} /> Sign out</button>
        </div>
      </header>

      <main className="workspace">
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

        {activePage === 'karnatik' ? (
          <KarnatikRagasPage />
        ) : activePage === 'chords' ? (
          <ChordAnalyserPage pitch={pitch} setPitch={setPitch} selectedId={selected.id} />
        ) : activePage === 'quiz' ? (
          <RagaQuizPage />
        ) : activePage === 'ear-training' ? (
          <EarTrainingPage pitch={pitch} />
        ) : activePage === 'concerts' ? (
          <ConcertsPage />
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

          <section className="roadmap-section">
            <div className="section-heading">
              <div>
                <h2>RAGA Companion Kanban</h2>
                <p>Feature tracking for the MVP and the path to thekarnatik.com.</p>
              </div>
            </div>
            <div className="kanban-board">
              {roadmapColumns.map((column) => (
                <div className={`kanban-column ${column.tone}`} key={column.title}>
                  <h3>{column.title}</h3>
                  <div className="kanban-items">
                    {column.items.map((item) => (
                      <article key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.meta}</span>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          </section>
        )}

        <aside className="companion-pane">
          <div className="pane-title">Raga Companion</div>
          <div className="chat">
            <div className="bubble assistant">What aspect of {selected.name} would you like to work on today?</div>
            <div className="bubble user">Help me with the pakad and how to approach the raga.</div>
            <div className="reply">
              <p>Start with the raga signature, then slow down near the emotional center.</p>
              <div className="suggestion">{selected.pakad}</div>
              <p>{selected.notes}</p>
            </div>
          </div>
          <div className="quick-actions">
            <button><Play size={15} /> Demonstrate</button>
            <button><Wind size={15} /> Play on Tanpura</button>
            <button><MessageCircle size={15} /> Explain More</button>
            <button><Music2 size={15} /> Another Raga</button>
          </div>
          <label className="ask-box">
            <input placeholder="Ask about this raga..." />
            <Send size={18} />
          </label>

          <section className="raga-detect-card">
            <div className="builder-title">
              <div>
                <span><Search size={16} /> Detect Raga</span>
                <p>Using {pitch} as Sa</p>
              </div>
              <Sparkles size={20} />
            </div>
            <div className={`raga-detect-status ${ragaDetector.status}`}>
              <div>
                <span>{ragaDetector.status === 'listening' ? 'Listening' : ragaDetector.status === 'detected' ? 'Identified' : 'Raga Finder'}</span>
                <strong>{ragaDetector.matches.find((match) => match.strong)?.name || (ragaDetector.status === 'detected' || ragaDetector.status === 'error' ? `Key: ${pitch}` : 'Sing Aro/Avaro')}</strong>
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
                <span>Heard Swaras</span>
                <p>{ragaDetector.heardSwaras.length ? ragaDetector.heardSwaras.map((item) => `${item.swara} (${item.count})`).join(' · ') : 'Listening...'}</p>
              </div>
            )}
            {ragaDetector.matches.length > 0 && (
              <div className="raga-match-list">
                {ragaDetector.matches.slice(0, 3).map((match) => (
                  <button key={match.id} onClick={() => setSelectedId(match.id)}>
                    <strong>{match.name}</strong>
                    <span>{match.score}% {match.strong ? 'match' : 'possible only'} · {match.system}</span>
                    <small>Matched: {match.matched.join(' ') || 'none'} · Missing: {match.missing.join(' ') || 'none'} · Signature missing: {match.signatureMissing.join(' ') || 'none'} · Extra: {match.extra.join(' ') || 'none'}</small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="test-builder-card">
            <div className="builder-title">
              <div>
                <span><ClipboardList size={16} /> Test Builder</span>
                <p>{selected.name} in {pitch} Sa</p>
              </div>
              <Wand2 size={20} />
            </div>
            <div className="builder-controls">
              <label>Difficulty
                <select value={testDifficulty} onChange={(event) => setTestDifficulty(event.target.value)}>
                  <option>Foundation</option>
                  <option>Intermediate</option>
                  <option>Composition</option>
                </select>
              </label>
              <label>Questions
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="type-toggles">
              {testTypes.map((type) => (
                <button
                  key={type}
                  className={enabledTypes.includes(type) ? 'active' : ''}
                  onClick={() => toggleType(type)}
                >
                  {enabledTypes.includes(type) && <CheckCircle2 size={14} />}
                  {type}
                </button>
              ))}
            </div>
            <div className="test-preview">
              {generatedTest.map((item, index) => (
                <div key={`${item.type}-${item.prompt}`} className="test-question">
                  <b>{index + 1}</b>
                  <span>{item.type}</span>
                  <p>{item.prompt}</p>
                  <small>{item.answer}</small>
                </div>
              ))}
            </div>
            <button className="start-test-button"><Play size={16} /> Start Test</button>
          </section>

          <section className="tanpura-card">
            <div className="tabs">
              <button className="active">Tanpura</button>
              <button>Shruti</button>
            </div>
            <div className="tanpura-body">
              <div
                className={`tanpura-visual ${metronomeOn && beatCount ? 'tempo-pulse' : ''} ${beatCount === 1 ? 'sam' : ''}`}
                style={{ '--beat-ms': `${60000 / tempo}ms` }}
              >
                <span></span><span></span><span></span><span></span>
              </div>
              <div className="tanpura-controls">
                <ControlRow label="Sa" value="S" />
                <ControlRow label="Pa" value="P" accent />
                <ControlRow label="Sa" value="S'" />
                <label className="select-label">Drone Preset
                  <select value="sa-pa" disabled>
                    <option value="sa-pa">Sa-Pa Sample</option>
                  </select>
                </label>
                <label className="select-label">Pitch
                <select value={pitch} onChange={(event) => setPitch(event.target.value)}>
                  {chromatic.map((p) => <option key={p}>{p}</option>)}
                </select>
                </label>
                <label className="range-label"><Volume2 size={16} /> Volume
                  <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(event.target.value)} />
                  <span>{volume}%</span>
                </label>
              </div>
            </div>
            <button className="start-button" onClick={toggleTanpura}>
              {tanpuraOn ? <Pause size={17} /> : <Play size={17} />}
              {tanpuraOn ? 'Tanpura Playing' : 'Start Tanpura'}
            </button>
          </section>
        </aside>
      </main>

      <footer className="player">
        <div><Music2 size={28} /><span>Now Playing</span><strong>{metronomeOn ? `Metronome ${tempo} BPM` : 'Metronome'}</strong></div>
        <div className="transport">
          <button onClick={stopMetronome}><Pause size={18} /></button>
          <button className="big" onClick={toggleMetronome}>{metronomeOn ? <Pause size={24} /> : <Play size={24} />}</button>
          <button><Wind size={18} /></button>
        </div>
        <div className="beat-meter" aria-label="Metronome beat">
          {[1, 2, 3, 4].map((beat) => <span key={beat} className={beatCount === beat ? 'active' : ''}>{beat}</span>)}
        </div>
        <label className="tempo-control">Tempo <button onClick={() => setTempoClamped(tempo - 1)}>-</button><input type="range" min="30" max="240" value={tempo} onInput={(event) => setTempoClamped(Number(event.target.value))} onChange={(event) => setTempoClamped(Number(event.target.value))} /><strong>{tempo}</strong><button onClick={() => setTempoClamped(tempo + 1)}>+</button></label>
        <label className="metro-volume"><Volume2 size={16} /> Click <input type="range" min="0" max="100" value={metronomeVolume} onInput={(event) => setMetronomeVolume(Number(event.target.value))} onChange={(event) => setMetronomeVolume(Number(event.target.value))} /><strong>{metronomeVolume}%</strong></label>
        <button className="icon-button"><Settings size={19} /></button>
      </footer>
    </div>
  );
}

function ChordAnalyserPage({ pitch, setPitch, selectedId }) {
  const initialRaga = ragas.find((item) => item.id === selectedId) || ragas[0];
  const [ragaId, setRagaId] = useState(initialRaga.id);
  const [notationView, setNotationView] = useState('Karnatik');
  const [chordRoot, setChordRoot] = useState(pitch);
  const [chordQuality, setChordQuality] = useState('major');
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

  return (
    <section className="raga-pane chord-page">
      <div className="chord-hero">
        <span>Composer Tool</span>
        <h1>Chord Analyser</h1>
        <p>Map a raga to your singing key, find safe support chords, and test whether a chord respects the raga swaras.</p>
      </div>

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
  const [geoStatus, setGeoStatus] = useState('Search any city, venue, artist, sabha, or raga event.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
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
  const allConcerts = useMemo(() => [...submittedEvents, ...concertListings], [submittedEvents]);
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
  const openEvents = allConcerts.filter((event) => event.status !== 'Verified').length;
  const cityCount = new Set(allConcerts.map((event) => event.city)).size;

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
        <h1>Discover and publish Indian music concerts anywhere.</h1>
        <p>A living calendar for Karnatik, Hindustani, sabhas, baithaks, temple events, workshops, and community concerts.</p>
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
        <button className="submit-concert-button" onClick={() => setShowSubmit((current) => !current)}><Plus size={17} /> Add Concert</button>
      </div>
      <p className="concert-status">{geoStatus}</p>

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

      <div className="concert-source-row">
        <article>
          <span>Listings</span>
          <strong>{allConcerts.length}</strong>
        </article>
        <article>
          <span>Places</span>
          <strong>{cityCount}</strong>
        </article>
        <article>
          <span>Community Queue</span>
          <strong>{openEvents}</strong>
        </article>
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

function RagaQuizPage() {
  const [quizBucket, setQuizBucket] = useState('chakra');
  const bucketQuestions = useMemo(
    () => ragaQuizQuestions.filter((question) => question.bucket === quizBucket),
    [quizBucket]
  );
  const [questionIndex, setQuestionIndex] = useState(() => Math.floor(Math.random() * ragaQuizQuestions.filter((question) => question.bucket === 'chakra').length));
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);
  const currentQuestion = bucketQuestions[questionIndex] || bucketQuestions[0];
  const answerKey = `${quizBucket}-${questionIndex}`;
  const selectedAnswer = answers[answerKey];
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((total, [key, answer]) => {
    const [bucket, index] = key.split('-');
    const question = ragaQuizQuestions.filter((item) => item.bucket === bucket)[Number(index)];
    return total + (question?.answer === answer ? 1 : 0);
  }, 0);
  const percent = answeredCount ? Math.round((score / answeredCount) * 100) : 0;

  function chooseAnswer(option) {
    setAnswers((current) => ({ ...current, [answerKey]: option }));
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

        <article className={`exercise-card ${selectedAnswer ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
          <div className="exercise-number">{currentQuestion.type} Drill</div>
          <h2>{currentQuestion.prompt}</h2>
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
          {selectedAnswer && (
            <p className="exercise-feedback">
              {isCorrect ? 'Correct. ' : `Not quite. Answer: ${currentQuestion.answer}. `}
              {currentQuestion.detail}
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
  const level = earTrainingLevels.find((item) => item.id === activeLevel) || earTrainingLevels[0];
  const recognitionRaga = recognitionPool.find((raga) => raga.id === recognitionChallenge.ragaId) || recognitionPool[0];
  const recognitionLine = recognitionChallenge.direction === 'arohana' ? recognitionRaga.arohana : recognitionRaga.avarohana;

  function selectLevel(levelId) {
    setActiveLevel(levelId);
    setRecognitionChallenge(buildRecognitionChallenge(recognitionPool));
  }

  function playRecognitionChallenge() {
    playSwaraLine(recognitionLine, pitch);
  }

  function nextRecognitionChallenge() {
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
              <strong>Hidden raga</strong>
              <p>Challenge hides the raga name until the user answers.</p>
            </div>
          </aside>

          <section className="ear-drill recognition-drill">
            <div className="ear-drill-head">
              <div>
                <span>Level 1 · {pitch} Sa</span>
                <h2>Identify the Raga</h2>
                <p>Listen first. Choose the raga from the options.</p>
              </div>
              <button onClick={playRecognitionChallenge}><Play size={16} /> Play Challenge</button>
            </div>

            <div className="hidden-raga-panel">
              <span>Hidden Raga</span>
              <strong>{recognitionChallenge.answered ? recognitionRaga.name : 'Listen and identify'}</strong>
              <small>{recognitionChallenge.answered ? `${recognitionChallenge.direction} was played.` : 'Challenge hides the raga name until the user answers.'}</small>
            </div>

            <div className="recognition-options">
              {recognitionChallenge.options.map((optionId) => {
                const option = recognitionPool.find((raga) => raga.id === optionId);
                if (!option) return null;
                return (
                  <button
                    key={option.id}
                    className={recognitionChallenge.answered === option.id ? 'selected' : option.id === recognitionChallenge.ragaId && recognitionChallenge.answered ? 'answer' : ''}
                    onClick={() => answerRecognition(option.id)}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>

            {recognitionChallenge.answered && (
              <div className={`recognition-feedback ${recognitionChallenge.result}`}>
                <strong>{recognitionChallenge.result === 'correct' ? `Correct. This is ${recognitionRaga.name}.` : `Incorrect answer. It was ${recognitionRaga.name}.`}</strong>
                <p className="recognition-detail">{ragaLineageDetail(recognitionRaga)}</p>
                <div className="recognition-scale">
                  <p><b>Arohana</b>{recognitionRaga.arohana.join(' ')}</p>
                  <p><b>Avarohana</b>{recognitionRaga.avarohana.join(' ')}</p>
                </div>
                <button onClick={() => playRagaScaleReview(recognitionRaga, pitch)}>Play Arohana & Avarohana</button>
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

function ragaLineageDetail(raga) {
  if (raga.lineage === 'janaka' && raga.chakra) {
    return `${raga.name} is a Janaka Melakarta raga, number ${raga.number}, in Chakra ${raga.chakra}.`;
  }
  if (raga.parent) {
    return `${raga.name} belongs to ${raga.parent}. ${raga.family || ''}`.trim();
  }
  return `${raga.name} belongs to ${raga.family || raga.system}.`;
}

function playRagaScaleReview(raga, root) {
  playSwaraLine(raga.arohana, root);
  window.setTimeout(() => playSwaraLine(raga.avarohana, root), (raga.arohana.length * 0.42 + 0.5) * 1000);
}

function nearestTamburaSample(note) {
  const targetIndex = chromatic.indexOf(note);
  let best = tamburaSamples[0];
  let bestDistance = Infinity;
  for (const sample of tamburaSamples) {
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
  return { note: best, rate: 2 ** (semitoneShift / 12) };
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

function volumeToGain(volume) {
  return (Number(volume) / 100) * 0.85;
}

function metronomeVolumeToGain(volume) {
  return (Number(volume) / 100) * 0.34;
}

function frequencyToNote(frequency) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const exactMidi = 69 + 12 * Math.log2(frequency / 440);
  const cents = Math.round((exactMidi - midi) * 100);
  return { note: noteNames[((midi % 12) + 12) % 12], cents };
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

function ragaIntervals(raga) {
  return Array.from(new Set(raga.arohana.concat(raga.avarohana).map(normalizeSwara)))
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

function matchRagas(heardIntervals) {
  const heardSet = new Set(heardIntervals);
  return ragas
    .map((raga) => {
      const target = ragaIntervals(raga);
      const targetSet = new Set(target);
      const signature = ragaSignatureIntervals(raga);
      const matched = target.filter((interval) => heardSet.has(interval));
      const missing = target.filter((interval) => !heardSet.has(interval));
      const extra = [...heardSet].filter((interval) => !targetSet.has(interval));
      const signatureMissing = signature.filter((interval) => !heardSet.has(interval));
      const coverage = matched.length / target.length;
      const extraPenalty = extra.length / Math.max(heardSet.size, 1);
      const sparsePenalty = heardSet.size < 4 ? 0.18 : 0;
      const signaturePenalty = signature.length ? (signatureMissing.length / signature.length) * 0.36 : 0;
      const score = Math.max(0, Math.round((coverage - extraPenalty * 0.45 - sparsePenalty - signaturePenalty) * 100));
      const strong = score >= 60 && heardSet.size >= 5 && signatureMissing.length <= Math.max(0, signature.length - 3);
      return {
        id: raga.id,
        name: raga.name,
        system: raga.system,
        score,
        strong,
        matched: matched.map((interval) => intervalLabels[interval]),
        missing: missing.map((interval) => intervalLabels[interval]),
        signatureMissing: signatureMissing.map((interval) => intervalLabels[interval]),
        extra: extra.map((interval) => intervalLabels[interval])
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((match) => match.score > 15);
}

function detectPitch(buffer, sampleRate) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
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

function playSwaraLine(line, root) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  context.resume();
  const master = context.createGain();
  master.gain.value = 0.16;
  master.connect(context.destination);
  const now = context.currentTime + 0.04;
  const step = 0.42;

  line.forEach((swara, index) => {
    const frequency = swaraFrequency(swara, root);
    if (!frequency) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * step;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(1, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + step * 0.82);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + step * 0.9);
  });

  window.setTimeout(() => context.close(), (line.length * step + 0.6) * 1000);
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

function AuthGate() {
  const [session, setSession] = useState(null);
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
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
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

  if (session) {
    return <App user={session.user} onSignOut={signOut} />;
  }

  return (
    <main className="access-gate">
      <section className="access-panel">
        <div className="brand access-brand">
          <span className="brand-mark">R</span>
          <span>RAGA Companion</span>
        </div>
        <p className="access-kicker">Karnatik.ai private beta</p>
        <h1>Indian music intelligence, built for serious practice.</h1>
        {isSupabaseConfigured ? (
          <>
            <p className="access-copy">Sign in to explore the private Karnatik.ai workspace for raga learning, ear training, shruthi, rhythm, and musician-first AI tools.</p>
            <form className="access-form" onSubmit={handleAuth}>
              <label>
                Email
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </label>
              <label>
                Password
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
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
              <button type="submit" disabled={submitting}>{submitting ? 'Please wait...' : 'Sign in'}</button>
            </form>
          </>
        ) : (
          <div className="auth-setup">
            <p className="access-copy">Authentication is ready in the app, but Supabase environment variables are not configured yet.</p>
            <code>VITE_SUPABASE_URL</code>
            <code>VITE_SUPABASE_ANON_KEY</code>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<AuthGate />);
