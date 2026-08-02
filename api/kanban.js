const { createClient } = require('@supabase/supabase-js');

const KANBAN_OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';

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
      { title: 'Host on karnatik.ai', meta: 'Production build, domain route, QA' },
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
