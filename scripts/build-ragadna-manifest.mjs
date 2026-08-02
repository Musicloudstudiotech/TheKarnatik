import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { ragas } from '../src/data/ragaDatabase.js';

const execFileAsync = promisify(execFile);

const AUDIO_EXTENSIONS = new Set(['.aac', '.aiff', '.aif', '.amr', '.flac', '.m4a', '.mp3', '.ogg', '.opus', '.wav', '.weba']);
const DEFAULT_ROOT = 'data/raga-samples/whatsapp-export';
const DEFAULT_OUTPUT = 'data/raga-samples/ragadna-manifest.json';

const rootDir = path.resolve(process.cwd(), process.argv[2] || DEFAULT_ROOT);
const outputPath = path.resolve(process.cwd(), process.argv[3] || DEFAULT_OUTPUT);

const ragaIndex = buildRagaIndex(ragas);
const audioFiles = await listAudioFiles(rootDir);
const entries = [];

for (const absolutePath of audioFiles) {
  const fileName = path.basename(absolutePath);
  const parsed = parseLabeledFile(fileName);
  if (!parsed) continue;

  const source = classifySource(absolutePath);
  const stats = await fs.stat(absolutePath);
  const durationSeconds = await readDurationSeconds(absolutePath);
  const normalizedRaga = normalizeName(parsed.raga);
  const raga = ragaIndex.get(normalizedRaga);

  entries.push({
    id: makeId(source.id, parsed.raga, parsed.key, fileName),
    raga: parsed.raga,
    normalizedRaga,
    ragaId: raga?.id || null,
    system: raga?.system || 'Karnatik',
    key: parsed.key,
    tonic: parsed.key,
    performer: parsed.performer || source.performer,
    voiceType: parsed.voiceType || source.voiceType,
    sourceSet: source.sourceSet,
    split: source.split,
    trainingAllowed: true,
    evaluationAllowed: true,
    task: 'arohana-avarohana',
    recordingType: 'voice',
    relativePath: path.relative(process.cwd(), absolutePath),
    fileName,
    extension: path.extname(fileName).slice(1).toLowerCase(),
    bytes: stats.size,
    durationSeconds,
    labels: {
      arohana: raga?.arohana || [],
      avarohana: raga?.avarohana || [],
      family: raga?.family || null,
      pakad: raga?.pakad || null
    },
    tags: parsed.tags,
    notes: source.notes
  });
}

entries.sort((a, b) => a.sourceSet.localeCompare(b.sourceSet) || a.raga.localeCompare(b.raga));

const manifest = {
  name: 'RagaDNA Engine Dataset Manifest',
  version: 1,
  generatedAt: new Date().toISOString(),
  rootDir: path.relative(process.cwd(), rootDir),
  policy: {
    shyam: 'baseline-training',
    otherVoices: 'test-first-training-allowed',
    guidance: 'Use Shyam as the first trusted baseline. Keep other voices as test until reviewed, but preserve trainingAllowed when consent is given.'
  },
  summary: summarize(entries),
  entries
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`RagaDNA manifest written: ${path.relative(process.cwd(), outputPath)}`);
console.log(`Entries: ${entries.length}`);
console.log(`Baseline/training: ${manifest.summary.bySplit.training || 0}`);
console.log(`Test: ${manifest.summary.bySplit.test || 0}`);

async function listAudioFiles(root) {
  const files = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath);
      }
    }
  }

  try {
    await walk(root);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  return files;
}

function parseLabeledFile(fileName) {
  const stem = path.basename(fileName, path.extname(fileName));
  const parts = stem.split(' - ').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3 && /^test$/i.test(parts[0])) {
    const tagged = parseTestParts(parts);
    return {
      performer: tagged.performer,
      voiceType: tagged.voiceType,
      raga: tagged.raga,
      key: normalizeKey(parts.at(-1)),
      tags: tagged.tags
    };
  }

  const compactMatch = stem.match(/^([^-]+)-(.+)-([A-G](?:#|b|Sharp|Flat)?)$/i);
  if (!compactMatch) return null;

  return {
    performer: compactMatch[1].trim(),
    raga: compactMatch[2].trim(),
    key: normalizeKey(compactMatch[3].trim()),
    tags: {}
  };
}

function parseTestParts(parts) {
  const middle = parts.slice(1, -1);
  let voiceType = 'unknown';
  if (/^(male|female)$/i.test(middle[0] || '')) {
    voiceType = middle.shift().toLowerCase();
  }

  const rawRaga = middle.join(' - ');
  const gamakaMatch = rawRaga.match(/\((With|Without)\s+Gamaka\)/i);
  const raga = rawRaga.replace(/\s*\((With|Without)\s+Gamaka\)\s*/i, '').trim();

  return {
    performer: 'unknown',
    voiceType,
    raga,
    tags: {
      gamaka: gamakaMatch ? gamakaMatch[1].toLowerCase() === 'with' : null
    }
  };
}

function classifySource(filePath) {
  const normalizedPath = filePath.split(path.sep).join('/');
  if (normalizedPath.includes('/Shyam/')) {
    return {
      id: 'shyam',
      performer: 'Shyam',
      voiceType: 'male',
      sourceSet: 'shyam-20-baseline',
      split: 'training',
      notes: 'First trusted 20-raga voice baseline.'
    };
  }
  if (normalizedPath.includes('/Test Ragas/')) {
    return {
      id: 'test-ragas-2026-07-21',
      performer: 'unknown',
      voiceType: 'unknown',
      sourceSet: 'test-ragas-2026-07-21',
      split: 'test',
      notes: 'Second labeled RagaDNA library set from Test Ragas.zip; use for evaluation and future training after review.'
    };
  }

  return {
    id: 'random-raga-aarohanam-avarohanam',
    performer: 'unknown',
    voiceType: 'unknown',
    sourceSet: 'random-raga-aarohanam-avarohanam',
    split: 'test',
    notes: 'Consented for machine training; kept test-first until singer and quality tags are reviewed.'
  };
}

async function readDurationSeconds(filePath) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const value = Number.parseFloat(stdout.trim());
    return Number.isFinite(value) ? Number(value.toFixed(3)) : null;
  } catch {
    return null;
  }
}

function buildRagaIndex(items) {
  const index = new Map();
  for (const item of items) {
    index.set(normalizeName(item.name), item);
    for (const alias of item.name.split('/')) {
      index.set(normalizeName(alias), item);
    }
  }

  index.set('charukeshi', index.get('charukesi'));
  index.set('hindolam', index.get('hindolam malkauns'));
  index.set('madhyamaavathi', index.get('madhyamavati'));
  index.set('madhyamaavathi', index.get('madhyamavathi') || index.get('madhyamavati'));
  index.set('reetigowla', index.get('reetigowla'));
  index.set('shudda saveri', index.get('shuddha saveri durga'));
  index.set('thodi plain', index.get('todi'));

  return index;
}

function summarize(items) {
  return {
    total: items.length,
    bySplit: countBy(items, 'split'),
    bySourceSet: countBy(items, 'sourceSet'),
    byKey: countBy(items, 'key'),
    byVoiceType: countBy(items, 'voiceType'),
    byRaga: countBy(items, 'raga')
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function makeId(sourceId, raga, key, fileName) {
  const uniqueStem = path.basename(fileName, path.extname(fileName));
  return [sourceId, raga, key, uniqueStem].map(slugify).join('__');
}

function normalizeName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function slugify(value) {
  return normalizeName(value).replace(/\s+/g, '-');
}

function normalizeKey(value) {
  return String(value).replace(/Sharp/gi, '#').replace(/Flat/gi, 'b').trim();
}
