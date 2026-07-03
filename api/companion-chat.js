const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST for companion chat.' });
    return;
  }

  try {
    const body = await readJson(req);
    const raga = body.raga || {};
    const question = String(body.question || '').trim();
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!question) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(200).json({
        answer: buildFallbackAnswer(question, raga),
        mode: 'fallback'
      });
      return;
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: [
          'You are Mitra, the Karnatik.ai AI companion for Indian classical music.',
          'Help with Karnatik and Hindustani raga learning, ear training, shruthi, laya, phrases, raga recognition, practice plans, and teacher/student workflows.',
          'Be practical, warm, concise, and musician-first. Prefer Karnatik spelling unless discussing an official title.',
          'Use the provided raga context. If unsure, say what should be verified by a guru or source recording.',
          'Return plain text only. Keep answers under 140 words unless the user asks for depth.'
        ].join(' '),
        input: [
          {
            role: 'user',
            content: [
              'Current raga context:',
              `Name: ${raga.name || 'Unknown'}`,
              `System: ${raga.system || 'Unknown'}`,
              `Family: ${raga.family || 'Unknown'}`,
              `Arohana: ${(raga.arohana || []).join(' ')}`,
              `Avarohana: ${(raga.avarohana || []).join(' ')}`,
              `Pakad: ${raga.pakad || ''}`,
              `Notes: ${raga.notes || ''}`
            ].join('\n')
          },
          ...history.map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: String(item.content || '').slice(0, 900)
          })),
          { role: 'user', content: question }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${detail.slice(0, 180)}`);
    }

    const data = await response.json();
    res.status(200).json({
      answer: data.output_text || extractOutputText(data) || buildFallbackAnswer(question, raga),
      mode: 'openai'
    });
  } catch (error) {
    res.status(200).json({
      answer: buildFallbackAnswer('', {}),
      mode: 'fallback',
      error: error.message
    });
  }
};

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function extractOutputText(data) {
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === 'output_text' || part.text)
    .map((part) => part.text || '')
    .join('\n')
    .trim();
}

function buildFallbackAnswer(question, raga) {
  const name = raga.name || 'this raga';
  const arohana = (raga.arohana || []).join(' ') || 'Arohana needs to be added.';
  const avarohana = (raga.avarohana || []).join(' ') || 'Avarohana needs to be added.';
  const pakad = raga.pakad || 'Start from the core swara pattern, then slow down around the raga identity notes.';
  const lower = question.toLowerCase();

  if (lower.includes('practice') || lower.includes('lesson')) {
    return `For ${name}, do a 12-minute loop: first sing Sa-Pa-Sa for shruthi, then Arohana slowly: ${arohana}. Next sing Avarohana: ${avarohana}. Finish with the signature phrase: ${pakad}`;
  }

  if (lower.includes('pakad') || lower.includes('phrase')) {
    return `${name}'s current signature phrase is: ${pakad}. Sing it slowly first, then repeat only the turning point until the raga color feels natural.`;
  }

  if (lower.includes('scale') || lower.includes('arohana') || lower.includes('avarohana')) {
    return `${name}: Arohana is ${arohana}. Avarohana is ${avarohana}. Use these as the clean scale skeleton before adding gamaka and phrase grammar.`;
  }

  return `For ${name}, start with the raga skeleton: ${arohana} / ${avarohana}. Then work on this identity phrase: ${pakad}. Add one short question and I can guide the next practice step.`;
}
