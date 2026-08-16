const {
  getDownloadUrl,
  head,
  issueSignedToken,
  presignUrl,
  put
} = require('@vercel/blob');
const {
  ARTIFACTS,
  artifactFor,
  authenticatedUser,
  eventPath,
  isDownloadUser,
  parseBody,
  publicArtifact
} = require('../server/pluginDownloads.js');

module.exports = async function handler(req, res) {
  const user = await authenticatedUser(req);
  if (!user || !isDownloadUser(user)) {
    res.status(401).json({ error: 'Sign in with a confirmed Karnatik.ai account to access downloads.' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(503).json({ error: 'Private download storage is not connected yet.' });
    return;
  }

  if (req.method === 'GET') {
    const artifacts = await Promise.all(Object.values(ARTIFACTS).map(async (artifact) => {
      if (artifact.publicPath) return publicArtifact(artifact, null);
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

  const body = parseBody(req);
  const artifact = artifactFor(body.artifact);
  if (!artifact) {
    res.status(400).json({ error: 'Unknown download.' });
    return;
  }
  const intent = body.intent === 'view' && artifact.contentType === 'application/pdf' ? 'view' : 'download';

  if (!artifact.publicPath) {
    try {
      await head(artifact.pathname);
    } catch {
      res.status(404).json({ error: 'This build is not available yet.' });
      return;
    }
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 5 * 60 * 1000);
  const profile = user.user_metadata || {};

  let downloadUrl = artifact.publicPath;
  let viewUrl = artifact.publicPath;
  if (!artifact.publicPath) {
    const signedToken = await issueSignedToken({
      pathname: artifact.pathname,
      operations: ['get'],
      validUntil: expiresAt.getTime()
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      access: 'private',
      operation: 'get',
      pathname: artifact.pathname,
      validUntil: expiresAt.getTime()
    });
    downloadUrl = getDownloadUrl(presignedUrl);
    viewUrl = presignedUrl;
  }

  if (intent === 'download') {
    await put(eventPath(artifact.id, issuedAt.toISOString()), JSON.stringify({
      userId: user.id,
      email: user.email,
      fullName: String(profile.full_name || profile.name || '').slice(0, 160),
      gender: String(profile.gender || '').slice(0, 80),
      city: String(profile.city || '').slice(0, 120),
      country: String(profile.country || '').slice(0, 120),
      phone: String(profile.phone || '').slice(0, 60),
      platform: artifact.platform,
      architecture: artifact.architecture,
      version: '0.3.0',
      downloadedAt: issuedAt.toISOString(),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 500)
    }), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    }).catch(() => {});
  }

  res.status(201).json({
    downloadUrl,
    viewUrl,
    expiresAt: expiresAt.toISOString()
  });
};
