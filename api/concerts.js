const SOURCE_TIMEOUT_MS = 8000;

const sourceRegistry = [
  {
    id: 'chennaievent',
    name: 'ChennaiEvent',
    url: 'https://www.chennaievent.com/',
    coverage: 'Daily Chennai sabha and classical listings',
    connector: 'live'
  },
  {
    id: 'sandeep-narayan',
    name: 'Sandeep Narayan Schedule',
    url: 'https://www.sandeepnarayan.in/concerts',
    coverage: 'Artist schedule',
    connector: 'live'
  },
  {
    id: 'kalaverse',
    name: 'Kalaverse',
    url: 'https://www.kalaverse.com/',
    coverage: 'Community platform reference',
    connector: 'partner-needed'
  },
  {
    id: 'hcl-concerts',
    name: 'HCL Concerts',
    url: 'https://www.hclconcerts.com/',
    coverage: 'Indian classical concert platform',
    connector: 'partner-needed'
  },
  {
    id: 'community',
    name: 'Karnatik.ai Community',
    url: 'https://karnatik.ai',
    coverage: 'Teacher, sabha, artist, and rasika submissions',
    connector: 'prototype'
  }
];

const fallbackEvents = [
  {
    id: 'fallback-blr-sabha-01',
    title: 'Evening Raga Sabha',
    artist: 'Featured Karnatik vocalists',
    city: 'Bangalore',
    area: 'Malleswaram',
    date: '2026-07-04',
    time: '6:30 PM',
    venue: 'Community Sabha Hall',
    type: 'Karnatik',
    source: 'Karnatik.ai seed',
    sourceUrl: 'https://karnatik.ai',
    status: 'Sample'
  },
  {
    id: 'fallback-mum-baithak-03',
    title: 'Hindustani Baithak',
    artist: 'Khayal and tabla artists',
    city: 'Mumbai',
    area: 'Dadar',
    date: '2026-07-06',
    time: '7:00 PM',
    venue: 'Baithak Room',
    type: 'Hindustani',
    source: 'Karnatik.ai seed',
    sourceUrl: 'https://karnatik.ai',
    status: 'Sample'
  }
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const [chennai, sandeep] = await Promise.allSettled([
      fetchChennaiEvent(),
      fetchSandeepNarayan()
    ]);

    const sourceStatus = [
      statusFor('chennaievent', chennai),
      statusFor('sandeep-narayan', sandeep),
      ...sourceRegistry
        .filter((source) => !['chennaievent', 'sandeep-narayan'].includes(source.id))
        .map((source) => ({ ...source, status: source.connector === 'prototype' ? 'ready' : 'planned', count: 0 }))
    ];

    const liveEvents = [
      ...(chennai.status === 'fulfilled' ? chennai.value : []),
      ...(sandeep.status === 'fulfilled' ? sandeep.value : [])
    ];
    const events = dedupeEvents(liveEvents.length ? liveEvents : fallbackEvents);

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      events,
      sources: sourceStatus,
      fallback: liveEvents.length === 0
    });
  } catch (error) {
    res.status(200).json({
      generatedAt: new Date().toISOString(),
      events: fallbackEvents,
      sources: sourceRegistry.map((source) => ({ ...source, status: 'unavailable', count: 0 })),
      fallback: true,
      error: error.message
    });
  }
};

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Karnatik.ai concert discovery prototype; contact: hello@karnatik.ai'
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchChennaiEvent() {
  const url = 'https://www.chennaievent.com/';
  const html = await fetchText(url);
  const dateMatch = html.match(/id="upcoming_date"\s+value="([^"]+)"/i);
  const date = parseChennaiDate(dateMatch?.[1]) || todayInIndia();
  const rows = [...html.matchAll(/<tr onclick='location\.href = "([^"]+)"[\s\S]*?<\/tr>/gi)];
  return rows.slice(0, 30).map((row, index) => {
    const cells = [...row[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
    const artists = [...cells.join(' ').matchAll(/title="([^"]+)"/g)]
      .map((match) => cleanText(match[1]))
      .filter((name) => name && !['Free', 'Ticketed', 'Check with Venue'].includes(name));
    const venueName = cleanText(cells[3]?.match(/<b>([\s\S]*?)<\/b>/i)?.[1] || 'Chennai venue');
    const venueDetails = cleanText(cells[3] || '');
    const ticket = cleanText(cells[4]?.match(/title="([^"]+)"/i)?.[1] || 'Check with Venue');
    const program = cleanText(cells[1] || 'Classical music event');
    const sourceUrl = row[1].startsWith('http') ? row[1] : `https://www.chennaievent.com/${row[1]}`;

    return {
      id: `chennaievent-${hash(`${date}-${index}-${program}`)}`,
      title: program,
      artist: artists[0] || 'Chennai artist',
      city: 'Chennai',
      area: inferChennaiArea(venueDetails),
      date,
      time: cleanText(cells[0] || 'Time TBA'),
      venue: venueName,
      type: inferType(program),
      source: 'ChennaiEvent',
      sourceUrl,
      status: ticket || 'Listed'
    };
  }).filter((event) => event.title && event.time);
}

async function fetchSandeepNarayan() {
  const url = 'https://www.sandeepnarayan.in/concerts';
  const text = htmlToLines(await fetchText(url));
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const events = [];
  for (let index = 0; index < text.length; index += 1) {
    const dateLine = text[index];
    if (!/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$/i.test(dateLine)) continue;
    const month = dateLine.slice(0, 3);
    const day = Number(dateLine.replace(/[^\d]/g, ''));
    const monthNumber = monthNames.findIndex((item) => item.toLowerCase() === month.toLowerCase()) + 1;
    const date = `2026-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const city = text[index + 1] || 'City TBA';
    const time = text[index + 2] || 'Time TBA';
    const eventLine = text[index + 3] || '';
    const contextLine = text[index + 4] || '';
    const venueLine = text[index + 5] || '';
    const title = eventLine && eventLine !== 'TBA'
      ? [eventLine, isVenueLike(contextLine) ? '' : contextLine].filter(Boolean).join(' - ')
      : 'Sandeep Narayan concert';
    const venue = isVenueLike(contextLine) ? contextLine : isControlLine(venueLine) ? 'Venue TBA' : venueLine || contextLine || 'Venue TBA';
    const area = isVenueLike(contextLine) && !isControlLine(venueLine) ? venueLine : '';
    events.push({
      id: `sandeep-${hash(`${date}-${city}-${title}`)}`,
      title,
      artist: 'Sandeep Narayan',
      city,
      area,
      date,
      time,
      venue,
      type: 'Karnatik',
      source: 'Sandeep Narayan Schedule',
      sourceUrl: url,
      status: 'Artist schedule'
    });
  }
  return events.filter((event) => event.date >= todayInIndia()).slice(0, 20);
}

function statusFor(id, result) {
  const source = sourceRegistry.find((item) => item.id === id);
  return {
    ...source,
    status: result.status === 'fulfilled' ? 'live' : 'error',
    count: result.status === 'fulfilled' ? result.value.length : 0,
    error: result.status === 'rejected' ? result.reason.message : undefined
  };
}

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.date}|${event.time}|${event.artist}|${event.venue}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });
}

function htmlToLines(html) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h\d|div|span|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function cleanText(value = '') {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value = '') {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

function parseChennaiDate(value = '') {
  const match = value.match(/(\d{2})\/([A-Z]{3})\/(\d{4})/i);
  if (!match) return '';
  const months = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
  return `${match[3]}-${months[match[2].toUpperCase()] || '01'}-${match[1]}`;
}

function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function inferChennaiArea(text) {
  const areas = ['Mylapore', 'Nanganallur', 'T. Nagar', 'Alwarpet', 'Royapettah', 'Adyar', 'Besant Nagar', 'Triplicane'];
  return areas.find((area) => text.toLowerCase().includes(area.toLowerCase())) || '';
}

function inferType(title) {
  const value = title.toLowerCase();
  if (value.includes('hindustani')) return 'Hindustani';
  if (value.includes('dance') || value.includes('bharathanatyam')) return 'Dance';
  if (value.includes('discourse')) return 'Discourse';
  if (value.includes('namasankeerthanam') || value.includes('bhagavathar')) return 'Devotional';
  return 'Karnatik';
}

function isControlLine(value = '') {
  return ['Accompanied by:', 'Location', 'Tickets', 'Free Admission', 'Tickets TBA'].includes(value);
}

function isVenueLike(value = '') {
  return /(hall|centre|center|club|sabha|samaaja|auditorium|festival|mandali|temple|theatre|school|arts|barbican)/i.test(value);
}

function timeToMinutes(value = '') {
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]m)?/i);
  if (!match) return 24 * 60;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const meridian = match[3]?.toLowerCase();
  if (meridian === 'pm' && hours < 12) hours += 12;
  if (meridian === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function hash(input) {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = ((value << 5) - value + input.charCodeAt(index)) | 0;
  }
  return Math.abs(value).toString(36);
}
