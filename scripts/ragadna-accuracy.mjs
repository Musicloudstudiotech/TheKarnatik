import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { mcleod, yin } from '@audio/pitch';
import { ragas } from '../src/data/ragaDatabase.js';

const execFileAsync = promisify(execFile);

const SAMPLE_RATE = 16000;
const FRAME_SIZE = 4096;
const HOP_SIZE = 1024;
const MIN_FREQUENCY = 80;
const MAX_FREQUENCY = 900;
const MANIFEST_PATH = 'data/raga-samples/ragadna-manifest.json';
const REPORT_JSON_PATH = 'data/raga-samples/ragadna-accuracy-report.json';
const REPORT_MD_PATH = 'data/raga-samples/RAGADNA_ACCURACY.md';
const FEATURE_MODEL_PATH = 'data/raga-samples/ragadna-feature-model.json';

const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
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

const manifest = JSON.parse(await fs.readFile(path.resolve(process.cwd(), MANIFEST_PATH), 'utf8'));
const canonicalRagaIndex = buildCanonicalRagaIndex();
const features = [];

for (const entry of manifest.entries) {
  const absolutePath = path.resolve(process.cwd(), entry.relativePath);
  const feature = await extractFeatures(entry, absolutePath);
  features.push(feature);
  console.log(`${feature.split.padEnd(8)} ${feature.raga.padEnd(22)} ${feature.key.padEnd(3)} ${feature.path.length} path notes`);
}

const trainingFeatures = features.filter((item) => item.split === 'training');
const testFeatures = features.filter((item) => item.split === 'test');
const trainingModel = buildTrainingModel(trainingFeatures);
const evaluations = testFeatures.map((feature) => evaluateFeature(feature, trainingModel));
const correct = evaluations.filter((item) => item.correct).length;
const eligible = evaluations.filter((item) => item.topMatch).length;
const accuracy = eligible ? Math.round((correct / eligible) * 100) : 0;

const report = {
  generatedAt: new Date().toISOString(),
  method: 'RagaDNA v0.1 labeled-key pitch contour fingerprint',
  caveat: 'This evaluates raga classification after using the labeled Sa/key from filenames. Auto-Sa accuracy is a separate next step.',
  summary: {
    totalClips: features.length,
    trainingClips: trainingFeatures.length,
    testClips: testFeatures.length,
    eligibleTestClips: eligible,
    correct,
    accuracy
  },
  trainingRagas: trainingFeatures.map((item) => ({
    raga: item.raga,
    canonicalRaga: item.canonicalRaga,
    key: item.key,
    swaras: item.swaras,
    path: item.pathLabels
  })),
  evaluations,
  confusion: buildConfusion(evaluations)
};

await fs.writeFile(path.resolve(process.cwd(), REPORT_JSON_PATH), `${JSON.stringify(report, null, 2)}\n`);
await fs.writeFile(path.resolve(process.cwd(), REPORT_MD_PATH), renderMarkdownReport(report));
await fs.writeFile(path.resolve(process.cwd(), FEATURE_MODEL_PATH), `${JSON.stringify(renderFeatureModel(features), null, 2)}\n`);

console.log('');
console.log(`RagaDNA accuracy: ${correct}/${eligible} = ${accuracy}%`);
console.log(`JSON: ${REPORT_JSON_PATH}`);
console.log(`Report: ${REPORT_MD_PATH}`);
console.log(`Feature model: ${FEATURE_MODEL_PATH}`);

async function extractFeatures(entry, absolutePath) {
  const samples = await decodeToFloat32(absolutePath);
  const tonicIndex = chromatic.indexOf(entry.key);
  if (tonicIndex < 0) throw new Error(`Unknown tonic key ${entry.key} for ${entry.relativePath}`);

  const heard = [];
  for (let offset = 0; offset + FRAME_SIZE <= samples.length; offset += HOP_SIZE) {
    const frame = samples.subarray(offset, offset + FRAME_SIZE);
    const frequency = detectPitch(frame, SAMPLE_RATE);
    if (!frequency) continue;

    const interval = frequencyToInterval(frequency, tonicIndex);
    heard.push({ interval, frequency });
  }

  const stable = cleanDetectedSwaras(summarizeStableIntervals(heard));
  const allowed = new Set(stable.map((item) => item.interval));
  const sequence = compactIntervalSequence(heard, allowed);
  const canonicalRaga = canonicalRagaName(entry);

  return {
    id: entry.id,
    raga: entry.raga,
    canonicalRaga,
    ragaId: entry.ragaId,
    key: entry.key,
    split: entry.split,
    sourceSet: entry.sourceSet,
    relativePath: entry.relativePath,
    frameCount: heard.length,
    swaras: stable.map((item) => ({ ...item, swara: intervalLabels[item.interval] })),
    swaraIntervals: stable.map((item) => item.interval),
    path: sequence,
    pathLabels: sequence.map((interval) => intervalLabels[interval]),
    histogram: intervalHistogram(heard)
  };
}

async function decodeToFloat32(filePath) {
  const { stdout } = await execFileAsync('ffmpeg', [
    '-v',
    'error',
    '-i',
    filePath,
    '-ac',
    '1',
    '-ar',
    String(SAMPLE_RATE),
    '-f',
    'f32le',
    'pipe:1'
  ], { encoding: 'buffer', maxBuffer: 1024 * 1024 * 256 });

  return new Float32Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.byteLength / Float32Array.BYTES_PER_ELEMENT));
}

function buildTrainingModel(items) {
  return items.map((item) => {
    const databaseRaga = findDatabaseRaga(item);
    const expectedSequence = databaseRaga ? ragaIntervalSequence(databaseRaga) : item.path;
    const expectedSet = databaseRaga ? ragaIntervals(databaseRaga) : item.swaraIntervals;
    return {
      ...item,
      expectedSequence,
      expectedSet
    };
  });
}

function renderFeatureModel(items) {
  return {
    generatedAt: new Date().toISOString(),
    method: 'RagaDNA v0.2 YIN+McLeod pitch contour fingerprint',
    totalClips: items.length,
    features: items.map((item) => ({
      id: publicFeatureId(item),
      raga: item.raga,
      canonicalRaga: item.canonicalRaga,
      ragaId: item.ragaId,
      key: item.key,
      split: item.split,
      sourceSet: publicSourceSet(item.sourceSet),
      swaraIntervals: item.swaraIntervals,
      path: item.path,
      histogram: item.histogram,
      frameCount: item.frameCount
    }))
  };
}

function publicSourceSet(sourceSet) {
  return sourceSet === 'shyam-20-baseline' ? 'reference-set-a' : sourceSet;
}

function publicFeatureId(item) {
  if (!['shyam-20-baseline', 'reference-set-a'].includes(item.sourceSet)) return item.id;
  const raga = normalizeName(item.raga).replace(/\s+/g, '-');
  const key = String(item.key || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '');
  return `reference-a__${raga}__${key}`;
}

function evaluateFeature(feature, model) {
  const ranked = model
    .map((candidate) => scoreCandidate(feature, candidate))
    .sort((a, b) => b.score - a.score);
  const topMatch = ranked[0] || null;
  const correct = Boolean(topMatch && topMatch.canonicalRaga === feature.canonicalRaga);
  return {
    id: feature.id,
    raga: feature.raga,
    canonicalRaga: feature.canonicalRaga,
    key: feature.key,
    sourceSet: feature.sourceSet,
    heardSwaras: feature.swaras.map((item) => `${item.swara} (${item.count})`),
    heardPath: feature.pathLabels,
    topMatch,
    correct,
    top3: ranked.slice(0, 3)
  };
}

function scoreCandidate(feature, candidate) {
  const featureSet = new Set(feature.swaraIntervals);
  const candidateSet = new Set(candidate.expectedSet);
  const intersection = [...featureSet].filter((interval) => candidateSet.has(interval));
  const union = new Set([...featureSet, ...candidateSet]);
  const setScore = union.size ? intersection.length / union.size : 0;
  const sequenceScore = feature.path.length >= 4
    ? longestCommonSubsequenceLength(feature.path, candidate.expectedSequence) / Math.max(candidate.expectedSequence.length, 1)
    : 0;
  const fingerprintSequenceScore = feature.path.length >= 4
    ? longestCommonSubsequenceLength(feature.path, candidate.path) / Math.max(candidate.path.length, 1)
    : 0;
  const histogramScore = cosineSimilarity(feature.histogram, candidate.histogram);
  const extraPenalty = Math.max(0, featureSet.size - candidateSet.size) * 0.03;
  const score = Math.max(0, Math.round((
    setScore * 0.32 +
    sequenceScore * 0.28 +
    fingerprintSequenceScore * 0.24 +
    histogramScore * 0.16 -
    extraPenalty
  ) * 100));

  return {
    raga: candidate.raga,
    canonicalRaga: candidate.canonicalRaga,
    score,
    setScore: Math.round(setScore * 100),
    sequenceScore: Math.round(sequenceScore * 100),
    fingerprintSequenceScore: Math.round(fingerprintSequenceScore * 100),
    histogramScore: Math.round(histogramScore * 100),
    matched: intersection.map((interval) => intervalLabels[interval]),
    missing: [...candidateSet].filter((interval) => !featureSet.has(interval)).map((interval) => intervalLabels[interval]),
    extra: [...featureSet].filter((interval) => !candidateSet.has(interval)).map((interval) => intervalLabels[interval])
  };
}

function detectPitch(buffer, sampleRate) {
  const rms = calculateRms(buffer);
  if (rms < 0.008) return 0;

  try {
    const candidates = [
      normalizePitchResult(yin(buffer, { fs: sampleRate, threshold: 0.12 })),
      normalizePitchResult(mcleod(buffer, { fs: sampleRate }))
    ]
      .filter(Boolean)
      .filter((result) => result.freq >= MIN_FREQUENCY && result.freq <= MAX_FREQUENCY)
      .filter((result) => result.clarity >= 0.7);

    if (candidates.length >= 2) {
      const [primary, secondary] = candidates;
      const cents = Math.abs(1200 * Math.log2(primary.freq / secondary.freq));
      if (cents <= 70) return median(candidates.map((result) => result.freq));
      return primary.clarity >= secondary.clarity ? primary.freq : secondary.freq;
    }

    if (candidates.length === 1) return candidates[0].freq;
  } catch {
    // Keep the accuracy runner usable even if the detector package fails on a clip.
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
  if (rms < 0.008) return 0;
  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxOffset = Math.floor(sampleRate / MIN_FREQUENCY);

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation += buffer[index] * buffer[index + offset];
    }
    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestCorrelation < 0.0015 || bestOffset <= 0) return 0;
  return sampleRate / bestOffset;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function frequencyToInterval(frequency, tonicIndex) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const noteIndex = ((midi % 12) + 12) % 12;
  return (noteIndex - tonicIndex + 12) % 12;
}

function summarizeStableIntervals(heard) {
  const counts = heard.reduce((acc, item) => {
    acc[item.interval] = (acc[item.interval] || 0) + 1;
    return acc;
  }, {});
  const intervals = Object.entries(counts)
    .map(([interval, count]) => ({ interval: Number(interval), count }))
    .sort((a, b) => a.interval - b.interval);
  if (!intervals.length) return [];

  const maxCount = Math.max(...intervals.map((item) => item.count));
  const totalCount = intervals.reduce((sum, item) => sum + item.count, 0);
  const minimumCount = Math.max(4, Math.ceil(maxCount * 0.07), Math.ceil(totalCount * 0.012));
  return intervals.filter((item) => item.count >= minimumCount);
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

  removeWeakerNeighbor(1, 2, 1.25);
  removeWeakerNeighbor(2, 3, 1.2);
  removeWeakerNeighbor(3, 4, 1.2);
  removeWeakerNeighbor(5, 6, 1.08);
  removeWeakerNeighbor(8, 9, 1.18);
  removeWeakerNeighbor(9, 10, 1.18);
  removeWeakerNeighbor(10, 11, 1.18);

  return Array.from(byInterval.values()).sort((a, b) => a.interval - b.interval);
}

function compactIntervalSequence(heard, allowedIntervals) {
  const runs = [];
  for (const item of heard) {
    if (!allowedIntervals.has(item.interval)) continue;
    const last = runs[runs.length - 1];
    if (last && last.interval === item.interval) {
      last.count += 1;
      continue;
    }
    runs.push({ interval: item.interval, count: 1 });
  }

  return runs
    .filter((run) => run.count >= 2)
    .map((run) => run.interval)
    .filter((interval, index, list) => index === 0 || interval !== list[index - 1]);
}

function intervalHistogram(heard) {
  const histogram = Array(12).fill(0);
  for (const item of heard) histogram[item.interval] += 1;
  const total = histogram.reduce((sum, count) => sum + count, 0) || 1;
  return histogram.map((count) => count / total);
}

function cosineSimilarity(a, b) {
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

function longestCommonSubsequenceLength(source, target) {
  if (!source.length || !target.length) return 0;
  const previous = Array(target.length + 1).fill(0);
  const current = Array(target.length + 1).fill(0);
  for (const sourceItem of source) {
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex += 1) {
      current[targetIndex] = sourceItem === target[targetIndex - 1]
        ? previous[targetIndex - 1] + 1
        : Math.max(previous[targetIndex], current[targetIndex - 1]);
    }
    for (let index = 0; index <= target.length; index += 1) {
      previous[index] = current[index];
      current[index] = 0;
    }
  }
  return previous[target.length];
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

function normalizeSwara(swara) {
  return swara.replace(/[’']/g, '').trim();
}

function findDatabaseRaga(feature) {
  if (feature.ragaId) {
    const byId = ragas.find((raga) => raga.id === feature.ragaId);
    if (byId) return byId;
  }
  return canonicalRagaIndex.get(normalizeRaga(feature.raga));
}

function buildCanonicalRagaIndex() {
  const index = new Map();
  for (const raga of ragas) {
    const aliases = [raga.name, ...raga.name.split('/').map((part) => part.trim())];
    for (const alias of aliases) {
      index.set(normalizeRaga(alias), raga);
    }
  }
  index.set('charukeshi', index.get('charukesi'));
  index.set('hindola', index.get('hindolam malkauns'));
  index.set('hindolam', index.get('hindolam malkauns'));
  index.set('madhyamaavathi', index.get('madhyamavati'));
  index.set('reethigowla', index.get('reetigowla'));
  index.set('shudda saveri', index.get('shuddha saveri durga'));
  index.set('thodi', index.get('todi'));
  index.set('thodi plain', index.get('todi'));
  return index;
}

function canonicalRagaName(entry) {
  if (entry.ragaId) return entry.ragaId;
  const normalized = normalizeRaga(entry.raga);
  const aliasIds = {
    charukeshi: 'charukesi',
    hindola: 'hindolam_malkauns',
    hindolam: 'hindolam_malkauns',
    madhyamaavathi: 'madhyamavati',
    madhyamavati: 'madhyamavati',
    reethigowla: 'reetigowla',
    reetigowla: 'reetigowla',
    'shudda saveri': 'shuddha_saveri_durga',
    'shuddha saveri': 'shuddha_saveri_durga',
    thodi: 'todi',
    'thodi plain': 'todi'
  };
  if (aliasIds[normalized]) return aliasIds[normalized];
  const raga = canonicalRagaIndex.get(normalized);
  return raga?.id || normalized;
}

function normalizeRaga(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function buildConfusion(evaluations) {
  return evaluations.reduce((acc, item) => {
    const predicted = item.topMatch?.canonicalRaga || 'no-match';
    const key = `${item.canonicalRaga} -> ${predicted}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function renderMarkdownReport(report) {
  const rows = report.evaluations.map((item) => {
    const predicted = item.topMatch ? `${item.topMatch.raga} (${item.topMatch.score}%)` : 'No match';
    return `| ${item.correct ? 'OK' : 'Check'} | ${item.raga} | ${item.key} | ${predicted} | ${item.heardPath.join(' ')} |`;
  }).join('\n');

  const confusion = Object.entries(report.confusion)
    .map(([pair, count]) => `- ${pair}: ${count}`)
    .join('\n');

  return `# RagaDNA Accuracy Report

Generated: ${report.generatedAt}

Method: ${report.method}

${report.caveat}

## Summary

- Total clips: ${report.summary.totalClips}
- Training clips: ${report.summary.trainingClips}
- Test clips: ${report.summary.testClips}
- Eligible test clips: ${report.summary.eligibleTestClips}
- Correct: ${report.summary.correct}
- Accuracy: ${report.summary.accuracy}%

## Test Results

| Result | Actual | Key | Predicted | Heard path |
| --- | --- | --- | --- | --- |
${rows}

## Confusion

${confusion || '- None'}
`;
}
