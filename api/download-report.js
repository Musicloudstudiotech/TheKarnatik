const { get, list } = require('@vercel/blob');
const {
  ARTIFACTS,
  authenticatedUser,
  isOwner
} = require('../server/pluginDownloads.js');

async function readJson(pathname) {
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).json();
}

async function listAllEvents() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: 'downloads/events/', cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Use GET.' });
    return;
  }

  const user = await authenticatedUser(req);
  if (!isOwner(user)) {
    res.status(403).json({ error: 'Owner access required.' });
    return;
  }

  const blobs = await listAllEvents();
  const events = (await Promise.all(blobs.map((blob) => readJson(blob.pathname))))
    .filter(Boolean)
    .sort((left, right) => String(right.downloadedAt).localeCompare(String(left.downloadedAt)));

  const counts = Object.fromEntries(Object.keys(ARTIFACTS).map((id) => [id, 0]));
  const uniqueEmails = new Set();
  for (const event of events) {
    counts[event.artifact] = (counts[event.artifact] || 0) + 1;
    if (event.email) uniqueEmails.add(String(event.email).toLowerCase());
  }

  if (String(req.query?.format || '').toLowerCase() === 'csv') {
    const columns = ['downloadedAt', 'email', 'artifact', 'platform', 'architecture', 'version', 'userAgent'];
    const csv = [columns.join(','), ...events.map((event) => columns.map((column) => csvCell(event[column])).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="karnatik-tanpura-downloads.csv"');
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({
    totalDownloads: events.length,
    uniqueTesters: uniqueEmails.size,
    counts,
    events
  });
};
