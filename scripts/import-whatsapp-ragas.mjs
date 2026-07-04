import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ragas } from '../src/data/ragaDatabase.js';

const AUDIO_EXTENSIONS = new Set(['.aac', '.aiff', '.aif', '.amr', '.flac', '.m4a', '.mp3', '.ogg', '.opus', '.wav', '.weba']);
const DEFAULT_INPUT = 'data/raga-samples/whatsapp-export';
const DEFAULT_OUTPUT = 'data/raga-samples/categorized';

const inputDir = path.resolve(process.cwd(), process.argv[2] || DEFAULT_INPUT);
const outputDir = path.resolve(process.cwd(), process.argv[3] || DEFAULT_OUTPUT);

const ragaAliases = buildRagaAliases();
const chatHints = await readChatHints(inputDir);
const audioFiles = await listAudioFiles(inputDir);

if (!audioFiles.length) {
  console.log(`No audio files found in ${inputDir}`);
  console.log('Export the WhatsApp chat with media, unzip it, and run this script against that folder.');
  process.exit(0);
}

const summary = {
  inputDir,
  outputDir,
  totalAudio: audioFiles.length,
  categorized: 0,
  uncategorized: 0,
  ragas: {}
};

await fs.mkdir(outputDir, { recursive: true });

for (const sourcePath of audioFiles) {
  const filename = path.basename(sourcePath);
  const hintText = `${filename} ${chatHints.get(filename) || ''}`;
  const match = findRaga(hintText);
  const ragaFolder = match?.slug || '_uncategorized';
  const targetDir = path.join(outputDir, ragaFolder);
  const targetName = normalizeFilename(filename);
  const targetPath = await uniquePath(path.join(targetDir, targetName));

  await fs.mkdir(targetDir, { recursive: true });
  await fs.copyFile(sourcePath, targetPath);

  if (match) {
    summary.categorized += 1;
    summary.ragas[match.name] = (summary.ragas[match.name] || 0) + 1;
  } else {
    summary.uncategorized += 1;
  }
}

await fs.writeFile(
  path.join(outputDir, 'import-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`Imported ${summary.totalAudio} audio files.`);
console.log(`Categorized: ${summary.categorized}`);
console.log(`Uncategorized: ${summary.uncategorized}`);
console.log(`Output: ${outputDir}`);

async function listAudioFiles(rootDir) {
  const files = [];
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath);
      }
    }
  }

  try {
    await walk(rootDir);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return files;
}

async function readChatHints(rootDir) {
  const hints = new Map();
  const textFiles = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (path.extname(entry.name).toLowerCase() === '.txt') {
        textFiles.push(entryPath);
      }
    }
  }

  try {
    await walk(rootDir);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  for (const textFile of textFiles) {
    const content = await fs.readFile(textFile, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const mediaMatch = line.match(/([\w\s().-]+\.(?:aac|aiff?|amr|flac|m4a|mp3|ogg|opus|wav|weba))/i);
      if (!mediaMatch) continue;

      const windowText = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join(' ');
      hints.set(path.basename(mediaMatch[1]), windowText);
    }
  }

  return hints;
}

function buildRagaAliases() {
  const aliases = [];
  for (const raga of ragas) {
    const names = [raga.name, ...(raga.name || '').split('/').map((name) => name.trim())];
    for (const name of names) {
      if (!name) continue;
      aliases.push({
        name: raga.name,
        slug: slugify(raga.name.split('/')[0]),
        alias: normalizeText(name)
      });
    }
  }
  return aliases.sort((a, b) => b.alias.length - a.alias.length);
}

function findRaga(text) {
  const normalized = ` ${normalizeText(text)} `;
  return ragaAliases.find((item) => normalized.includes(` ${item.alias} `));
}

function normalizeText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-');
}

function normalizeFilename(value) {
  return path.basename(value).replace(/[^\w(). -]+/g, '_');
}

async function uniquePath(basePath) {
  const ext = path.extname(basePath);
  const stem = basePath.slice(0, -ext.length);
  let candidate = basePath;
  let index = 2;
  while (await exists(candidate)) {
    candidate = `${stem}-${index}${ext}`;
    index += 1;
  }
  return candidate;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
