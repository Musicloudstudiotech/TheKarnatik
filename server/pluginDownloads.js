const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');

const DOWNLOAD_OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';
const RELEASE_VERSION = '0.3.0';

const ARTIFACTS = Object.freeze({
  'mac-apple-silicon': {
    id: 'mac-apple-silicon',
    platform: 'macOS',
    architecture: 'Apple Silicon',
    filename: `Karnatik-Tanpura-${RELEASE_VERSION}-macOS-Apple-Silicon.pkg`,
    pathname: `releases/${RELEASE_VERSION}/Karnatik-Tanpura-${RELEASE_VERSION}-macOS-Apple-Silicon.pkg`,
    contentType: 'application/vnd.apple.installer+xml'
  },
  'mac-intel': {
    id: 'mac-intel',
    platform: 'macOS',
    architecture: 'Intel',
    filename: `Karnatik-Tanpura-${RELEASE_VERSION}-macOS-Intel.pkg`,
    pathname: `releases/${RELEASE_VERSION}/Karnatik-Tanpura-${RELEASE_VERSION}-macOS-Intel.pkg`,
    contentType: 'application/vnd.apple.installer+xml'
  },
  'windows-x64': {
    id: 'windows-x64',
    platform: 'Windows',
    architecture: 'x64',
    filename: `Karnatik-Tanpura-${RELEASE_VERSION}-Windows-x64-Setup.exe`,
    pathname: `releases/${RELEASE_VERSION}/Karnatik-Tanpura-${RELEASE_VERSION}-Windows-x64-Setup.exe`,
    contentType: 'application/vnd.microsoft.portable-executable'
  },
  'user-guide': {
    id: 'user-guide',
    platform: 'Documentation',
    architecture: 'PDF',
    filename: `Karnatik-Tanpura-${RELEASE_VERSION}-User-Guide.pdf`,
    pathname: `releases/${RELEASE_VERSION}/Karnatik-Tanpura-${RELEASE_VERSION}-User-Guide.pdf`,
    contentType: 'application/pdf'
  }
});

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function bearerToken(req) {
  const header = String(req.headers?.authorization || '');
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

function supabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  };
}

async function authenticatedUser(req) {
  const token = bearerToken(req);
  const config = supabaseConfig();
  if (!token || !config.url || !config.key) return null;

  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user?.email) return null;
  return data.user;
}

function isOwner(user) {
  return normalizeEmail(user?.email) === DOWNLOAD_OWNER_EMAIL;
}

function isDownloadUser(user) {
  const provider = String(user?.app_metadata?.provider || '').toLowerCase();
  return provider === 'google' || isOwner(user);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function artifactFor(id) {
  return ARTIFACTS[String(id || '')] || null;
}

function publicArtifact(artifact, metadata) {
  return {
    id: artifact.id,
    platform: artifact.platform,
    architecture: artifact.architecture,
    filename: artifact.filename,
    version: RELEASE_VERSION,
    available: Boolean(metadata),
    size: Number(metadata?.size || 0)
  };
}

function ticketPath(ticket) {
  return `downloads/tickets/${ticket}.json`;
}

function eventPath(artifactId, timestamp) {
  const date = timestamp.slice(0, 10);
  return `downloads/events/${artifactId}/${date}/${timestamp.replaceAll(':', '-')}-${crypto.randomUUID()}.json`;
}

module.exports = {
  ARTIFACTS,
  DOWNLOAD_OWNER_EMAIL,
  RELEASE_VERSION,
  artifactFor,
  authenticatedUser,
  eventPath,
  isDownloadUser,
  isOwner,
  normalizeEmail,
  parseBody,
  publicArtifact,
  ticketPath
};
