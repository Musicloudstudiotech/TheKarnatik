const { createClient } = require('@supabase/supabase-js');

const PLANNER_OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';

const phases = [
  {
    id: 'phase-1-vst',
    number: 'Phase 1A',
    title: 'Final Tanpura Plug-ins',
    outcome: 'Release-ready AU and VST3 builds for macOS and Windows',
    target: 'First public beta',
    tasks: [
      { id: 'samples-final', title: 'Update the final tanpura samples', detail: 'Replace the current recordings and verify pitch, balance, noise, and consistent loudness.', priority: 'Critical' },
      { id: 'samples-loop-qa', title: 'Prepare seamless loops', detail: 'Remove jumps, cuts, phasing, flanging, and audible crossfade points in every Shruti.', priority: 'Critical' },
      { id: 'string-modes', title: 'Validate the string modes', detail: 'Confirm Pa-Sa-Sa-Sa and Ma-Sa-Sa-Sa behaviour with musicians.', priority: 'Critical' },
      { id: 'plugin-ui-lock', title: 'Lock the final plug-in UI', detail: 'Use the approved fixed layout and add precise entry for BPM, volume, fine-tune, and drag-to-DAW export labels.', priority: 'High' },
      { id: 'build-apple-silicon', title: 'Rebuild macOS Apple Silicon', detail: 'AU and VST3 release build, installer, signing, notarization, and DAW validation.', priority: 'Critical' },
      { id: 'build-intel', title: 'Rebuild macOS Intel', detail: 'AU and VST3 release build for supported Intel Macs; Hackintosh remains best-effort only.', priority: 'Critical' },
      { id: 'build-windows', title: 'Rebuild Windows', detail: 'VST3 installer with the correct bundle structure and Cubase scan validation.', priority: 'Critical' },
      { id: 'windows-signing', title: 'Sign the Windows installer', detail: 'Obtain and apply a Windows code-signing certificate to reduce unidentified-publisher warnings.', priority: 'High' },
      { id: 'daw-matrix', title: 'Complete the DAW test matrix', detail: 'Logic, Ableton, Cubase, Reaper, FL Studio, Studio One, and GarageBand where applicable.', priority: 'Critical' },
      { id: 'release-docs', title: 'Update downloads and installation SOP', detail: 'Publish verified installers, checksums, documentation, and troubleshooting steps.', priority: 'High' },
      { id: 'aax-commercial', title: 'Complete AAX commercial signing', detail: 'Continue after Avid replies with its licence and PACE signing requirements.', priority: 'Parallel' }
    ]
  },
  {
    id: 'phase-1-apps',
    number: 'Phase 1B',
    title: 'Tanpura and Metronome Apps',
    outcome: 'Offline practice apps for iOS and Android',
    target: 'TestFlight first, Android closed test next',
    tasks: [
      { id: 'shared-audio-engine', title: 'Extract the shared audio engine', detail: 'Reuse sample playback, pitch selection, looping, mixer, and reverb across plug-in and mobile builds.', priority: 'Critical' },
      { id: 'ios-tanpura', title: 'Build the iOS Tanpura module', detail: 'Four-string visual plucking synchronized with Pa/Ma and Sa audio.', priority: 'Critical' },
      { id: 'ios-metronome', title: 'Build the iOS metronome module', detail: 'BPM, tap tempo, Carnatic tala, Hindustani taal, bols, and time-signature mapping.', priority: 'Critical' },
      { id: 'ios-background', title: 'Support background and offline playback', detail: 'Keep Shruti and Tala running during practice without a network connection.', priority: 'High' },
      { id: 'ios-testflight', title: 'Ship the TestFlight beta', detail: 'App icon, privacy details, screenshots, device QA, archive, and external tester release.', priority: 'Critical' },
      { id: 'android-app', title: 'Build the Android version', detail: 'Adapt the same audio engine and interaction model for supported Android devices.', priority: 'High' },
      { id: 'android-closed-test', title: 'Run Google Play closed testing', detail: 'Prepare store assets, policy declarations, signed AAB, and tester cohort.', priority: 'High' }
    ]
  },
  {
    id: 'phase-2-web',
    number: 'Phase 2',
    title: 'Karnatik.ai Launch',
    outcome: 'A polished learning website with dependable low-risk modules',
    target: 'Public soft launch',
    tasks: [
      { id: 'launch-scope', title: 'Lock the website launch scope', detail: 'Launch only verified modules and mark RagaDNA clearly as experimental.', priority: 'Critical' },
      { id: 'quiz-modules', title: 'Complete the quiz modules', detail: 'Chakra, Melakarta, swara variants, Janaka/Janya, and scale recognition.', priority: 'Critical' },
      { id: 'melakarta-72', title: 'Verify all 72 Melakarta ragas', detail: 'Review names, numbers, chakras, swaras, arohana, avarohana, and notation.', priority: 'Critical' },
      { id: 'ear-training', title: 'Complete Ear Training Level 1', detail: 'Hidden Arohana/Avarohana challenges, answer feedback, replay, and progress.', priority: 'High' },
      { id: 'web-shruti-tala', title: 'Finish the web Shruti and Tala tool', detail: 'Reliable playback, system selection, Tala/Taal cycles, bols, tempo, and volume.', priority: 'High' },
      { id: 'content-review', title: 'Complete musician content review', detail: 'Validate terminology, theory, recordings, and learning explanations.', priority: 'Critical' },
      { id: 'launch-essentials', title: 'Add launch essentials', detail: 'Privacy, terms, contact, feedback capture, analytics, SEO, and error monitoring.', priority: 'High' },
      { id: 'web-release-qa', title: 'Complete production QA', detail: 'Mobile, desktop, browser, authentication, audio overlap, accessibility, and performance.', priority: 'Critical' }
    ]
  },
  {
    id: 'phase-3-chords',
    number: 'Phase 3',
    title: 'Chord Builder for Indian Melody',
    outcome: 'Listen to a melody and suggest explainable raga-aware harmony',
    target: 'Musician-validated prototype',
    tasks: [
      { id: 'melody-input', title: 'Build melody recording and upload', detail: 'Accept microphone performance and an uploaded audio reference.', priority: 'Critical' },
      { id: 'tonic-workflow', title: 'Confirm or detect Sa', detail: 'Let the musician correct the tonic before any chord analysis is produced.', priority: 'Critical' },
      { id: 'stable-note-segmentation', title: 'Extract stable notes', detail: 'Separate held swaras from glides, gamakas, and transition frames.', priority: 'Critical' },
      { id: 'raga-constraint', title: 'Apply the selected raga grammar', detail: 'Start with a user-selected raga so harmony does not depend on perfect RagaDNA detection.', priority: 'Critical' },
      { id: 'chord-ranking', title: 'Rank anchor and colour chords', detail: 'Score tonic/Pa anchors, phrase support, cadence, avoid notes, and harmonic density.', priority: 'High' },
      { id: 'chord-explanation', title: 'Explain every suggestion', detail: 'Show the heard swaras, chord notes, fit, caution, and phrase context.', priority: 'High' },
      { id: 'chord-export', title: 'Export the result', detail: 'Generate a chord sheet and MIDI suitable for DAW experimentation.', priority: 'High' },
      { id: 'chord-musician-validation', title: 'Run musician validation', detail: 'Benchmark suggestions across melodies, tonic choices, and representative ragas.', priority: 'Critical' }
    ]
  },
  {
    id: 'parallel-ragadna',
    number: 'Parallel R&D',
    title: 'RagaDNA Research',
    outcome: 'Measured recognition accuracy without blocking product launch',
    target: '20-raga benchmark before expansion',
    tasks: [
      { id: 'ragadna-dataset', title: 'Curate the labelled 20-raga dataset', detail: 'Separate training and test singers, keys, phones, and studio recordings.', priority: 'Research' },
      { id: 'ragadna-benchmark', title: 'Publish the accuracy benchmark', detail: 'Measure per-raga precision, recall, confusion pairs, and abstention quality.', priority: 'Research' },
      { id: 'ragadna-contour', title: 'Improve contour and phrase evidence', detail: 'Model note transitions, characteristic prayogas, duration, and gamaka shape.', priority: 'Research' },
      { id: 'ragadna-release-gate', title: 'Define the release confidence gate', detail: 'Return uncertain instead of presenting a weak match as a confident answer.', priority: 'Research' }
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
    res.status(405).json({ error: 'Use GET for the product planner.' });
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
    res.status(503).json({ error: 'Planner authentication is not configured.' });
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

    if (normalizeEmail(data.user.email) !== PLANNER_OWNER_EMAIL) {
      res.status(403).json({ error: 'This page is not available for your account.' });
      return;
    }

    res.status(200).json({ phases });
  } catch {
    res.status(500).json({ error: 'The product planner could not be loaded.' });
  }
};

function getBearerToken(header) {
  const match = String(header || '').match(/^Bearer\s+(.+)$/i);
  return match?.[1] || '';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
