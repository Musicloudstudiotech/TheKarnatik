const crypto = require('node:crypto');
const { head, put } = require('@vercel/blob');
const {
  ARTIFACTS,
  artifactFor,
  authenticatedUser,
  isDownloadUser,
  parseBody,
  publicArtifact,
  ticketPath
} = require('../server/pluginDownloads.js');

module.exports = async function handler(req, res) {
  const user = await authenticatedUser(req);
  if (!user || !isDownloadUser(user)) {
    res.status(401).json({ error: 'Sign in with Google or a confirmed Karnatik.ai account to access downloads.' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(503).json({ error: 'Private download storage is not connected yet.' });
    return;
  }

  if (req.method === 'GET') {
    const artifacts = await Promise.all(Object.values(ARTIFACTS).map(async (artifact) => {
      try {
        const metadata = await head(artifact.pathname);
        return publicArtifact(artifact, metadata);
      } catch {
        return publicArtifact(artifact, null);
      }
    }));
    res.status(200).json({ artifacts });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Use GET or POST.' });
    return;
  }

  const artifact = artifactFor(parseBody(req).artifact);
  if (!artifact) {
    res.status(400).json({ error: 'Unknown download.' });
    return;
  }

  try {
    await head(artifact.pathname);
  } catch {
    res.status(404).json({ error: 'This build is not available yet.' });
    return;
  }

  const ticket = crypto.randomBytes(32).toString('base64url');
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 5 * 60 * 1000);
  const profile = user.user_metadata || {};
  await put(ticketPath(ticket), JSON.stringify({
    ticket,
    userId: user.id,
    email: user.email,
    fullName: String(profile.full_name || profile.name || '').slice(0, 160),
    gender: String(profile.gender || '').slice(0, 80),
    city: String(profile.city || '').slice(0, 120),
    country: String(profile.country || '').slice(0, 120),
    phone: String(profile.phone || '').slice(0, 60),
    artifact: artifact.id,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  }), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });

  res.status(201).json({
    downloadUrl: `/api/plugin-file?ticket=${encodeURIComponent(ticket)}`,
    expiresAt: expiresAt.toISOString()
  });
};
