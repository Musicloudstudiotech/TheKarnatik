const { createClient } = require('@supabase/supabase-js');

const KANBAN_OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';

const roadmapColumns = [
  {
    title: 'Done',
    tone: 'done',
    items: [
      { title: 'Web prototype shell', meta: 'Practice console' },
      { title: 'Private beta authentication', meta: 'Supabase sign-in and protected workspace' },
      { title: 'Owner-only product Kanban', meta: 'Private roadmap at /Kanban' },
      { title: 'Sa-Pa tanpura foundation', meta: 'Pitch-selectable drone playback' },
      { title: 'Shruthi & Tala workspace', meta: 'Separate practice page with tempo and volume' },
      { title: 'Tala / Taal foundation', meta: 'Karnatik and Hindustani cycles, bols, and meter display' },
      { title: 'Chord Analyser v1', meta: 'Separate raga-aware composer tool' },
      { title: 'Karnatik Ragas explorer', meta: '72 Melakarta chakras and swara legend' },
      { title: 'Quiz and ear training v1', meta: 'Scale, Melakarta, chakra, and Janya exercises' }
    ]
  },
  {
    title: 'In Progress',
    tone: 'active',
    items: [
      { title: 'Madhyama shruthi coverage', meta: 'Clean Sa-Ma-Sa-Sa tanpura for every pitch' },
      { title: 'Shruthi audio QA', meta: 'Fast start, tuning accuracy, balance, and uninterrupted playback' },
      { title: 'Tala QA and mapping', meta: 'Verify cycles, bols, accents, tempo, and Western time signatures' },
      { title: 'RagaDNA 20-raga pilot', meta: 'Measured scale detection with top matches and confidence guardrails' },
      { title: 'Raga Analyser beta UX', meta: 'Show heard swaras, evidence, alternatives, and approximation clearly' },
      { title: 'Chord logic review', meta: 'Musician validation for harmony and edge cases' },
      { title: 'September 30 scope lock', meta: 'Freeze the soft-launch feature set and defer nonessential work' }
    ]
  },
  {
    title: 'Next',
    tone: 'next',
    items: [
      { title: 'Musician beta testing', meta: 'Structured feedback from singers, teachers, and instrumentalists' },
      { title: 'Production readiness QA', meta: 'Mobile, browser, microphone, audio overlap, performance, and accessibility' },
      { title: 'Launch raga content review', meta: 'Validate the 72 Melakarta reference data and priority Janya pages' },
      { title: 'Launch essentials', meta: 'Privacy, terms, contact, feedback capture, and basic analytics' },
      { title: 'RagaDNA benchmark report', meta: 'Publish accuracy by raga and hold back weak classes' },
      { title: 'Karnatik.ai soft launch', meta: 'Target: September 30, 2026' }
    ]
  },
  {
    title: 'Later',
    tone: 'later',
    items: [
      { title: 'All-raga catalogue expansion', meta: 'Reviewed Janya and Hindustani data after launch' },
      { title: 'Phrase-level RagaDNA', meta: 'Gamaka, prayoga, transition, and contour recognition' },
      { title: 'All-raga detector expansion', meta: 'Scale only after each class passes a labelled benchmark' },
      { title: 'Sa-Ma-Pa-Sa drone mode', meta: 'Waiting for correct samples' },
      { title: 'Tambura sample overhaul', meta: 'Loop-ready assets and mode variants' },
      { title: 'AI interaction engine', meta: 'Grounded teaching answers from reviewed raga data' },
      { title: 'Teacher Studio / Academy instances', meta: 'Schools, batches, lessons, assignments, attendance, feedback, and payments' },
      { title: 'Certification programs', meta: 'Levels, assessments, and revenue model' },
      { title: 'Interactive raga visualizations', meta: 'Relationships, Melakarta, mood, time, composers, and Kriti explorers' },
      { title: 'PWA install path', meta: 'Mobile-ready web app before native apps' },
      { title: 'Logic Pro AU plugin', meta: 'JUCE track after web launch' },
      { title: 'Portable raga engine', meta: 'Shared data for web, PWA, AU/VST3' }
    ]
  }
];

module.exports = async function handler(req, res) {
  res.setHeader('Allow', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Use GET for the Kanban board.' });
    return;
  }

  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication is required.' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.status(503).json({ error: 'Kanban authentication is not configured.' });
    return;
  }

  try {
    const authClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Your session could not be verified.' });
      return;
    }

    if (normalizeEmail(data.user.email) !== KANBAN_OWNER_EMAIL) {
      res.status(403).json({ error: 'This page is not available for your account.' });
      return;
    }

    res.status(200).json({ columns: roadmapColumns });
  } catch {
    res.status(500).json({ error: 'The Kanban board could not be loaded.' });
  }
};

function getBearerToken(header) {
  const match = String(header || '').match(/^Bearer\s+(.+)$/i);
  return match?.[1] || '';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
