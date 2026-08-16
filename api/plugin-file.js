const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { del, get, put } = require('@vercel/blob');
const {
  artifactFor,
  eventPath,
  ticketPath
} = require('../server/pluginDownloads.js');

async function streamJson(result) {
  const response = new Response(result.stream);
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Use GET.');
    return;
  }

  const ticket = String(req.query?.ticket || '');
  if (!ticket || ticket.length > 128) {
    res.status(400).send('Invalid download ticket.');
    return;
  }

  const pathname = ticketPath(ticket);
  const ticketResult = await get(pathname, { access: 'private' });
  if (!ticketResult || ticketResult.statusCode !== 200) {
    res.status(401).send('This download ticket is invalid or has already been used.');
    return;
  }

  const ticketData = await streamJson(ticketResult);
  const artifact = artifactFor(ticketData.artifact);
  const expiresAt = Date.parse(ticketData.expiresAt);
  if (!artifact || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    await del(pathname).catch(() => {});
    res.status(401).send('This download ticket has expired.');
    return;
  }

  const fileResult = await get(artifact.pathname, { access: 'private' });
  if (!fileResult || fileResult.statusCode !== 200) {
    res.status(404).send('The requested beta build is not available.');
    return;
  }

  res.setHeader('Content-Type', artifact.contentType || fileResult.blob.contentType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${artifact.filename}"`);
  res.setHeader('Content-Length', String(fileResult.blob.size));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    await pipeline(Readable.fromWeb(fileResult.stream), res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(502).send('The installer transfer was interrupted. Please try again.');
    }
    return;
  }

  const downloadedAt = new Date().toISOString();
  await put(eventPath(artifact.id, downloadedAt), JSON.stringify({
    userId: ticketData.userId,
    email: ticketData.email,
    fullName: ticketData.fullName || '',
    gender: ticketData.gender || '',
    city: ticketData.city || '',
    country: ticketData.country || '',
    phone: ticketData.phone || '',
    artifact: artifact.id,
    platform: artifact.platform,
    architecture: artifact.architecture,
    version: artifact.version || '0.3.0',
    downloadedAt,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500)
  }), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json'
  }).catch(() => {});
  await del(pathname).catch(() => {});
};
