// RAGA Companion database v1.
// Keep musical data here so UI, quiz, detection, certification, and future plugin code can share one source.

export const ragas = [
  {
    id: 'yaman',
    name: 'Yaman',
    system: 'Hindustani',
    family: 'Kalyan Thaat',
    time: 'Sandhya, 6 PM - 9 PM',
    mood: 'Serene, devotional, expansive',
    tags: ['Tivra Ma', 'Audav-Sampoorna', 'Shuddha Madhyam avoided'],
    arohana: ['N', 'R', 'G', 'M^', 'D', 'N', "S'"],
    avarohana: ["S'", 'N', 'D', 'P', 'M^', 'G', 'R', 'S'],
    vadi: 'Gandhar (G)',
    samvadi: 'Nishad (N)',
    pakad: 'N R G, M^ D N, D P, M^ G R, S',
    notes:
      'Approach tivra Ma with grace. Keep the nyas on Ga and Ni spacious, and avoid plain jumps from Ga to Pa.',
    phrases: ['N R G, M^ D N, S’', "S’ N D P, M^ G R, S", 'G M^ D, N D P, M^ G', "R G M^, D N S’, N D P"]
  },
  {
    id: 'bhairav',
    name: 'Bhairav',
    system: 'Hindustani',
    family: 'Bhairav Thaat',
    time: 'Pratah, sunrise',
    mood: 'Austere, meditative, ancient',
    tags: ['Komal Re', 'Komal Dha', 'Sampoorna'],
    arohana: ['S', 'r', 'G', 'M', 'P', 'd', 'N', "S'"],
    avarohana: ["S'", 'N', 'd', 'P', 'M', 'G', 'r', 'S'],
    vadi: 'Dhaivat (d)',
    samvadi: 'Rishabh (r)',
    pakad: 'G M r S, N d P, G M r S',
    notes:
      'Let komal Re and komal Dha oscillate slowly. The raga blooms when the descent feels weighty and unhurried.',
    phrases: ['G M r S', 'N d P, M G r S', "S r G M, P d N S'", 'M P d P, G M r S']
  },
  {
    id: 'bageshri',
    name: 'Bageshri',
    system: 'Hindustani',
    family: 'Kafi Thaat',
    time: 'Raat, second prahar',
    mood: 'Intimate, yearning, reflective',
    tags: ['Komal Ga', 'Komal Ni', 'Audav-Sampoorna'],
    arohana: ['S', 'g', 'M', 'D', 'n', "S'"],
    avarohana: ["S'", 'n', 'D', 'M', 'P', 'D', 'g', 'M', 'R', 'S'],
    vadi: 'Madhyam (M)',
    samvadi: 'Shadja (S)',
    pakad: 'n D M, P D g M, R S',
    notes:
      'Hold Ma as the emotional center. The phrases should feel inward, with delicate turns around komal Ga.',
    phrases: ['n D M', 'P D g M', 'g M R S', "M D n S', n D M"]
  },
  {
    id: 'kalyani',
    name: 'Kalyani',
    system: 'Karnatik',
    family: '65th Melakarta',
    time: 'Evening',
    mood: 'Luminous, generous, majestic',
    tags: ['Prati Madhyamam', 'Sampoorna', 'Melakarta'],
    arohana: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M2', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, M2, N3',
    samvadi: 'Nyasa: S, G3, P',
    pakad: 'G3 M2 P, D2 N3 S’, N3 D2 P, M2 G3 R2',
    notes:
      'Let the prati madhyamam shine without rushing it. Gamakas on G3 and N3 define the raga personality.',
    phrases: ['G3 M2 P', "D2 N3 S'", 'N3 D2 P M2', 'G3 R2 S']
  },
  {
    id: 'todi',
    name: 'Todi',
    system: 'Karnatik',
    family: '8th Melakarta',
    time: 'Morning',
    mood: 'Grave, devotional, deeply expressive',
    tags: ['Hanumatodi', 'Gamaka-rich', 'Sampoorna'],
    arohana: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G2', 'R1', 'S'],
    vadi: 'Jiva swaras: G2, D1',
    samvadi: 'Nyasa: S, M1, P',
    pakad: 'S R1 G2~ M1, P D1 N2 S’',
    notes:
      'Todi depends on curved intonation and gamaka depth. Practice slowly before attempting brigas.',
    phrases: ['S R1 G2~ M1', 'M1 P D1', "N2 S' N2 D1", 'P M1 G2 R1 S']
  },
  {
    id: 'hamsadhwani',
    name: 'Hamsadhwani',
    system: 'Karnatik',
    family: 'Janya of Shankarabharanam',
    time: 'Opening raga',
    mood: 'Bright, auspicious, energetic',
    tags: ['Audava', 'No Ma or Dha', 'Concert opener'],
    arohana: ['S', 'R2', 'G3', 'P', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'P', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, N3',
    samvadi: 'Nyasa: S, P',
    pakad: 'S R2 G3 P, N3 S’, N3 P G3 R2',
    notes:
      'Keep it crisp and buoyant. The absence of Ma and Dha gives the raga its clean, ringing lift.',
    phrases: ['S R2 G3 P', "N3 S' N3 P", 'P G3 R2 S', 'R2 G3 P N3']
  },
  {
    id: 'mohana',
    name: 'Mohana / Bhoopali',
    system: 'Both',
    family: 'Audava pentatonic',
    time: 'Evening / auspicious',
    mood: 'Open, bright, devotional',
    tags: ['Audava', 'No Ma or Ni', 'S R G P D'],
    arohana: ['S', 'R2', 'G3', 'P', 'D2', "S'"],
    avarohana: ["S'", 'D2', 'P', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, D2',
    samvadi: 'Nyasa: S, G3, P',
    pakad: 'S R2 G3 P D2 S’, S’ D2 P G3 R2 S',
    notes:
      'Mohana/Bhoopali is defined by the clean pentatonic set S R G P D, with Ma and Ni omitted.',
    phrases: ['S R2 G3 P D2 S’', 'S’ D2 P G3 R2 S', 'G3 P D2 P G3', 'R2 G3 P G3 R2 S']
  },
  {
    id: 'shankarabharanam_bilawal',
    name: 'Shankarabharanam / Bilawal',
    system: 'Both',
    family: '29th Melakarta / Bilawal Thaat',
    time: 'Morning to evening',
    mood: 'Complete, balanced, bright',
    tags: ['Sampoorna', 'Major scale', 'All shuddha swaras'],
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, M1, N3',
    samvadi: 'Nyasa: S, G3, P',
    pakad: 'S R2 G3 M1, P D2 N3 S’',
    notes: 'A full major-scale raga. Phrase grammar and gamaka usage distinguish the Karnatik and Hindustani approaches.',
    phrases: ['S R2 G3 M1', 'P D2 N3 S’', 'S’ N3 D2 P', 'M1 G3 R2 S']
  },
  {
    id: 'mayamalavagowla',
    name: 'Mayamalavagowla',
    system: 'Karnatik',
    family: '15th Melakarta',
    time: 'Early morning',
    mood: 'Foundational, solemn, devotional',
    tags: ['R1', 'G3', 'D1', 'N3', 'Beginner foundation'],
    arohana: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G3', 'R1', 'S'],
    vadi: 'Jiva swaras: R1, G3, D1',
    samvadi: 'Nyasa: S, M1, P',
    pakad: 'S R1 G3 M1, P D1 N3 S’',
    notes: 'Often used for early Karnatik training because the swara positions are clear and symmetrical.',
    phrases: ['S R1 G3 M1', 'G3 M1 P', 'P D1 N3 S’', 'S’ N3 D1 P M1 G3 R1 S']
  },
  {
    id: 'kharaharapriya_kafi',
    name: 'Kharaharapriya / Kafi',
    system: 'Both',
    family: '22nd Melakarta / Kafi Thaat',
    time: 'Late evening',
    mood: 'Earthy, expressive, warm',
    tags: ['Komal Ga/Ni equivalent', 'Sampoorna', 'R2 G2 M1'],
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S'],
    vadi: 'Jiva swaras: G2, N2',
    samvadi: 'Nyasa: S, M1, P',
    pakad: 'S R2 G2 M1, P D2 N2 S’',
    notes: 'A broad parent scale. Specific ragas inside this space need phrase-level distinction.',
    phrases: ['R2 G2 M1 P', 'N2 D2 P M1', 'G2 R2 S', 'M1 P D2 N2 S’']
  },
  {
    id: 'hindolam_malkauns',
    name: 'Hindolam / Malkauns',
    system: 'Both',
    family: 'Audava pentatonic',
    time: 'Night',
    mood: 'Meditative, deep, inward',
    tags: ['No R or P', 'S G M D N', 'Pentatonic'],
    arohana: ['S', 'G2', 'M1', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'M1', 'G2', 'S'],
    vadi: 'Jiva swaras: G2, D1, N2',
    samvadi: 'Nyasa: S, M1',
    pakad: 'G2 M1 D1, N2 D1 M1 G2 S',
    notes: 'The missing R and P make the raga instantly recognizable when the phrase avoids those anchors.',
    phrases: ['S G2 M1 D1', 'N2 D1 M1 G2', 'G2 M1 D1 N2 S’', 'S’ N2 D1 M1 G2 S']
  },
  {
    id: 'revati_bairagi',
    name: 'Revati / Bairagi',
    system: 'Both',
    family: 'Audava pentatonic',
    time: 'Dawn / meditative',
    mood: 'Spare, devotional, ancient',
    tags: ['No G or D', 'R1', 'N2', 'Pentatonic'],
    arohana: ['S', 'R1', 'M1', 'P', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'P', 'M1', 'R1', 'S'],
    vadi: 'Jiva swaras: R1, N2',
    samvadi: 'Nyasa: S, P',
    pakad: 'S R1 M1 P, N2 P M1 R1 S',
    notes: 'Austere and clean. The absence of Ga and Dha is important for detection.',
    phrases: ['S R1 M1 P', 'P N2 S’', 'S’ N2 P', 'M1 R1 S']
  },
  {
    id: 'shuddha_saveri_durga',
    name: 'Shuddha Saveri / Durga',
    system: 'Both',
    family: 'Audava pentatonic',
    time: 'Evening',
    mood: 'Bright, simple, devotional',
    tags: ['No Ga or Ni', 'S R M P D', 'Pentatonic'],
    arohana: ['S', 'R2', 'M1', 'P', 'D2', "S'"],
    avarohana: ["S'", 'D2', 'P', 'M1', 'R2', 'S'],
    vadi: 'Jiva swaras: R2, D2',
    samvadi: 'Nyasa: S, P',
    pakad: 'S R2 M1 P D2 S’, S’ D2 P M1 R2 S',
    notes: 'Clear pentatonic identity with no Ga and no Ni. Distinguish from Mohana by Ma replacing Ga.',
    phrases: ['S R2 M1 P', 'D2 S’ D2 P', 'M1 R2 S', 'R2 M1 P D2']
  },
  {
    id: 'charukesi',
    name: 'Charukesi',
    system: 'Karnatik',
    family: '26th Melakarta',
    time: 'Evening',
    mood: 'Emotional, yearning, dramatic',
    tags: ['M1', 'D1', 'N2', 'Sampoorna'],
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D1', 'P', 'M1', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, D1, N2',
    samvadi: 'Nyasa: S, M1, P',
    pakad: 'G3 M1 P D1 N2 S’, N2 D1 P M1 G3',
    notes: 'Major-like lower tetrachord with a poignant D1-N2 upper color.',
    phrases: ['G3 M1 P', 'D1 N2 S’', 'S’ N2 D1 P', 'M1 G3 R2 S']
  },
  {
    id: 'keeravani_kirwani',
    name: 'Keeravani / Kirwani',
    system: 'Both',
    family: '21st Melakarta / harmonic minor color',
    time: 'Night',
    mood: 'Intense, haunting, cinematic',
    tags: ['G2', 'D1', 'N3', 'Sampoorna'],
    arohana: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N3', "S'"],
    avarohana: ["S'", 'N3', 'D1', 'P', 'M1', 'G2', 'R2', 'S'],
    vadi: 'Jiva swaras: G2, D1, N3',
    samvadi: 'Nyasa: S, P',
    pakad: 'S R2 G2 M1, P D1 N3 S’',
    notes: 'A harmonic-minor-like raga. The D1 to N3 pull is a key identifying color.',
    phrases: ['S R2 G2 M1', 'P D1 N3 S’', 'S’ N3 D1 P', 'M1 G2 R2 S']
  },
  {
    id: 'kambhoji',
    name: 'Kambhoji',
    system: 'Karnatik',
    family: 'Janya of Harikambhoji',
    time: 'Evening / concert main',
    mood: 'Grand, expansive, classical',
    tags: ['Vakra phrases', 'N2 dominant', 'Occasional N3 phrase color'],
    arohana: ['S', 'R2', 'G3', 'M1', 'P', 'D2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G3', 'R2', 'S'],
    vadi: 'Jiva swaras: G3, N2, D2',
    samvadi: 'Nyasa: S, G3, P',
    pakad: 'S R2 G3 M1 P D2 S’, S’ N2 D2 P M1 G3 R2 S',
    notes: 'Kambhoji needs phrase grammar beyond scale. Arohana often omits Ni while descent uses N2.',
    phrases: ['G3 M1 P D2 S’', 'S’ N2 D2 P', 'M1 G3 R2 S', 'G3 M1 P M1 G3']
  },
  {
    id: 'abheri_bhimpalasi',
    name: 'Abheri / Bhimpalasi',
    system: 'Both',
    family: 'Kharaharapriya/Kafi family',
    time: 'Afternoon / evening',
    mood: 'Tender, devotional, longing',
    tags: ['Audava-Sampoorna', 'G2', 'N2'],
    arohana: ['S', 'G2', 'M1', 'P', 'N2', "S'"],
    avarohana: ["S'", 'N2', 'D2', 'P', 'M1', 'G2', 'R2', 'S'],
    vadi: 'Jiva swaras: G2, N2',
    samvadi: 'Nyasa: M1, P, S',
    pakad: 'N2 S’ N2 D2 P, M1 G2 R2 S',
    notes: 'The ascent skips R and D, while descent brings them back. This directional asymmetry matters.',
    phrases: ['S G2 M1 P N2 S’', 'S’ N2 D2 P', 'M1 G2 R2 S', 'G2 M1 P N2']
  },
  {
    id: 'darbari_kanada',
    name: 'Darbari Kanada',
    system: 'Hindustani',
    family: 'Asavari Thaat',
    time: 'Late night',
    mood: 'Grave, royal, introspective',
    tags: ['Komal Ga', 'Komal Dha', 'Andolan-heavy'],
    arohana: ['S', 'R', 'g', 'M', 'P', 'd', 'n', "S'"],
    avarohana: ["S'", 'n', 'd', 'P', 'M', 'P', 'g', 'M', 'R', 'S'],
    vadi: 'Rishabh (R)',
    samvadi: 'Pancham (P)',
    pakad: 'g M R S, d n P, M P g M R S',
    notes: 'Darbari needs slow oscillation on komal Ga and Dha. Scale alone is not sufficient.',
    phrases: ['g M R S', 'd n P', 'M P g M R', 'S R g M P']
  },
  {
    id: 'desh',
    name: 'Desh',
    system: 'Hindustani',
    family: 'Khamaj Thaat',
    time: 'Late evening / monsoon',
    mood: 'Romantic, patriotic, lilting',
    tags: ['Khamaj color', 'Vakra', 'Ni variants by phrase'],
    arohana: ['S', 'R', 'M', 'P', 'N', "S'"],
    avarohana: ["S'", 'n', 'D', 'P', 'M', 'G', 'R', 'G', 'S'],
    vadi: 'Rishabh (R)',
    samvadi: 'Pancham (P)',
    pakad: 'R M P N S’, n D P, M G R G S',
    notes: 'Desh depends on characteristic vakra descent and Ni treatment. Phrase evidence is important.',
    phrases: ['R M P N S’', 'S’ n D P', 'M G R G S', 'R M P D P']
  },
  {
    id: 'brindavana_saranga',
    name: 'Brindavana Saranga',
    system: 'Both',
    family: 'Saranga family',
    time: 'Afternoon',
    mood: 'Devotional, peaceful, open',
    tags: ['No Ga/Dha in core', 'M-P-N-S color', 'Saranga'],
    arohana: ['S', 'R2', 'M1', 'P', 'N3', "S'"],
    avarohana: ["S'", 'N2', 'P', 'M1', 'R2', 'S'],
    vadi: 'Jiva swaras: R2, M1, N',
    samvadi: 'Nyasa: S, P',
    pakad: 'S R2 M1 P N3 S’, S’ N2 P M1 R2 S',
    notes: 'The Ni color and the absence of Ga/Dha in the core give the raga its serene Saranga identity.',
    phrases: ['S R2 M1 P', 'P N3 S’', 'S’ N2 P', 'M1 R2 S']
  }
];

export const melakartaChakras = [
  {
    name: 'Indu',
    range: '1-6',
    madhyamam: 'M1',
    swaraFrame: 'R1 G1',
    ragas: ['Kanakangi', 'Ratnangi', 'Ganamurti', 'Vanaspati', 'Manavati', 'Tanarupi']
  },
  {
    name: 'Netra',
    range: '7-12',
    madhyamam: 'M1',
    swaraFrame: 'R1 G2',
    ragas: ['Senavati', 'Hanumatodi', 'Dhenuka', 'Natakapriya', 'Kokilapriya', 'Rupavati']
  },
  {
    name: 'Agni',
    range: '13-18',
    madhyamam: 'M1',
    swaraFrame: 'R1 G3',
    ragas: ['Gayakapriya', 'Vakulabharanam', 'Mayamalavagowla', 'Chakravakam', 'Suryakantam', 'Hatakambari']
  },
  {
    name: 'Veda',
    range: '19-24',
    madhyamam: 'M1',
    swaraFrame: 'R2 G2',
    ragas: ['Jhankaradhwani', 'Natabhairavi', 'Keeravani', 'Kharaharapriya', 'Gowrimanohari', 'Varunapriya']
  },
  {
    name: 'Bana',
    range: '25-30',
    madhyamam: 'M1',
    swaraFrame: 'R2 G3',
    ragas: ['Mararanjani', 'Charukesi', 'Sarasangi', 'Harikambhoji', 'Dheerasankarabharanam', 'Naganandini']
  },
  {
    name: 'Rutu',
    range: '31-36',
    madhyamam: 'M1',
    swaraFrame: 'R3 G3',
    ragas: ['Yagapriya', 'Ragavardhini', 'Gangeyabhushani', 'Vagadheeswari', 'Shulini', 'Chalanata']
  },
  {
    name: 'Rishi',
    range: '37-42',
    madhyamam: 'M2',
    swaraFrame: 'R1 G1',
    ragas: ['Salagam', 'Jalarnavam', 'Jhalavarali', 'Navaneetam', 'Pavani', 'Raghupriya']
  },
  {
    name: 'Vasu',
    range: '43-48',
    madhyamam: 'M2',
    swaraFrame: 'R1 G2',
    ragas: ['Gavambhodi', 'Bhavapriya', 'Shubhapantuvarali', 'Shadvidamargini', 'Suvarnangi', 'Divyamani']
  },
  {
    name: 'Brahma',
    range: '49-54',
    madhyamam: 'M2',
    swaraFrame: 'R1 G3',
    ragas: ['Dhavalambari', 'Namanarayani', 'Kamavardhini', 'Ramapriya', 'Gamanashrama', 'Vishwambari']
  },
  {
    name: 'Disi',
    range: '55-60',
    madhyamam: 'M2',
    swaraFrame: 'R2 G2',
    ragas: ['Shamalangi', 'Shanmukhapriya', 'Simhendramadhyamam', 'Hemavati', 'Dharmavati', 'Neetimati']
  },
  {
    name: 'Rudra',
    range: '61-66',
    madhyamam: 'M2',
    swaraFrame: 'R2 G3',
    ragas: ['Kantamani', 'Rishabhapriya', 'Latangi', 'Vachaspati', 'Mechakalyani', 'Chitrambari']
  },
  {
    name: 'Aditya',
    range: '67-72',
    madhyamam: 'M2',
    swaraFrame: 'R3 G3',
    ragas: ['Sucharitra', 'Jyotiswarupini', 'Dhatuvardhani', 'Nasikabhushani', 'Kosalam', 'Rasikapriya']
  }
];

export const janyaBranches = [
  {
    parent: '29 Dheerasankarabharanam',
    children: ['Mohana', 'Hamsadhwani', 'Kedaragowla', 'Arabhi'],
    rule: 'Derived ragas may omit swaras, use vakra movement, or lean on signature phrases.'
  },
  {
    parent: '28 Harikambhoji',
    children: ['Kambhoji', 'Khamas', 'Yadukula Kambhoji', 'Surati'],
    rule: 'Same parent scale can branch into very different identities through prayoga and gamaka.'
  },
  {
    parent: '22 Kharaharapriya',
    children: ['Abheri', 'Sriranjani', 'Madhyamavati', 'Kannada'],
    rule: 'Janya identity depends on what is used, what is avoided, and where the phrase resolves.'
  },
  {
    parent: '15 Mayamalavagowla',
    children: ['Malahari', 'Bowli', 'Gowla', 'Saveri'],
    rule: 'A training parent can produce compact janya ragas with strong phrase grammar.'
  },
  {
    parent: '65 Mechakalyani',
    children: ['Kalyani', 'Mohanakalyani', 'Hamirkalyani', 'Yamunakalyani'],
    rule: 'Prati madhyamam color becomes a major branch marker for luminous janya ragas.'
  }
];

export const swaraLegend = [
  { symbol: 'S', label: 'Shadjam', note: 'Sa, fixed tonic' },
  { symbol: 'R1', label: 'Shuddha Rishabham', note: 'Lower Ri' },
  { symbol: 'R2', label: 'Chatusruti Rishabham', note: 'Higher Ri' },
  { symbol: 'R3', label: 'Shatsruti Rishabham', note: 'Highest Ri' },
  { symbol: 'G1', label: 'Shuddha Gandharam', note: 'Same pitch as R2 in 12-tone mapping' },
  { symbol: 'G2', label: 'Sadharana Gandharam', note: 'Middle Ga' },
  { symbol: 'G3', label: 'Antara Gandharam', note: 'Higher Ga' },
  { symbol: 'M1', label: 'Shuddha Madhyamam', note: 'Natural Ma' },
  { symbol: 'M2', label: 'Prati Madhyamam', note: 'Sharp Ma' },
  { symbol: 'P', label: 'Panchamam', note: 'Pa, fixed fifth' },
  { symbol: 'D1', label: 'Shuddha Dhaivatam', note: 'Lower Dha' },
  { symbol: 'D2', label: 'Chatusruti Dhaivatam', note: 'Higher Dha' },
  { symbol: 'D3', label: 'Shatsruti Dhaivatam', note: 'Highest Dha' },
  { symbol: 'N1', label: 'Shuddha Nishadam', note: 'Same pitch as D2 in 12-tone mapping' },
  { symbol: 'N2', label: 'Kaisiki Nishadam', note: 'Lower Ni' },
  { symbol: 'N3', label: 'Kakali Nishadam', note: 'Higher Ni' }
];

export const janyaCatalogue = [
  {
    parent: '8 Hanumatodi',
    ragas: ['Dhanyasi', 'Asaveri', 'Punnagavarali', 'Bhoopalam', 'Ghanta', 'Ahiri']
  },
  {
    parent: '15 Mayamalavagowla',
    ragas: ['Malahari', 'Bowli', 'Gowla', 'Saveri', 'Nadanamakriya', 'Padi', 'Revagupti']
  },
  {
    parent: '16 Chakravakam',
    ragas: ['Malayamarutam', 'Bindumalini', 'Ahir Bhairav', 'Valaji']
  },
  {
    parent: '20 Natabhairavi',
    ragas: ['Hindolam', 'Saramati', 'Jayanthasri', 'Vasantabhairavi', 'Marga Hindolam']
  },
  {
    parent: '21 Keeravani',
    ragas: ['Kalyana Vasantham', 'Sama Priya', 'Vasantha Manohari']
  },
  {
    parent: '22 Kharaharapriya',
    ragas: ['Abheri', 'Sriranjani', 'Madhyamavati', 'Andolika', 'Mukhari', 'Manirangu', 'Kannada', 'Darbar']
  },
  {
    parent: '26 Charukesi',
    ragas: ['Tarangini', 'Shukrajyoti', 'Chandrajyoti']
  },
  {
    parent: '28 Harikambhoji',
    ragas: ['Kambhoji', 'Khamas', 'Yadukula Kambhoji', 'Surati', 'Devagandhari', 'Navarasa Kannada', 'Sahana']
  },
  {
    parent: '29 Dheerasankarabharanam',
    ragas: ['Mohana', 'Hamsadhwani', 'Arabhi', 'Bilahari', 'Begada', 'Nalinakanthi', 'Kadanakuthuhalam', 'Purnachandrika']
  },
  {
    parent: '36 Chalanata',
    ragas: ['Nata', 'Gambhiranata', 'Chayagowla']
  },
  {
    parent: '45 Shubhapantuvarali',
    ragas: ['Shivapantuvarali', 'Amritavarshini']
  },
  {
    parent: '51 Kamavardhini',
    ragas: ['Pantuvarali', 'Purvikalyani', 'Hamsanandi', 'Kumudakriya']
  },
  {
    parent: '53 Gamanashrama',
    ragas: ['Hamsanadam', 'Gamakakriya', 'Purvi']
  },
  {
    parent: '56 Shanmukhapriya',
    ragas: ['Chintamani', 'Sumanesa Ranjani', 'Chamaram']
  },
  {
    parent: '57 Simhendramadhyamam',
    ragas: ['Vijayanagari', 'Suddha Danyasi', 'Urmika']
  },
  {
    parent: '65 Mechakalyani',
    ragas: ['Kalyani', 'Mohanakalyani', 'Hamirkalyani', 'Yamunakalyani', 'Saranga', 'Sunadavinodini']
  }
];

export const earTrainingLevels = [
  {
    id: 'level-1',
    eyebrow: 'Level 1',
    title: 'Arohana / Avarohana Recognition',
    goal: 'Hear a hidden raga scale and identify the raga from answer choices.',
    lessons: [
      { id: 'scale-recognition', ragaId: 'mohana', title: 'Scale Recognition Challenge', focus: 'Hidden arohana or avarohana' }
    ]
  },
  {
    id: 'level-2',
    eyebrow: 'Level 2',
    title: 'Phrase Recognition',
    goal: 'Future activity: identify the raga from characteristic phrases and prayogas.',
    lessons: [
      { id: 'phrase-recognition', ragaId: 'mohana', title: 'Phrase Recognition', focus: 'Coming later' }
    ]
  }
];

export const ragaSchema = {
  id: 'stable slug used by UI, quiz, detection, and future API',
  name: 'display name',
  system: 'Karnatik | Hindustani | Both',
  lineage: 'janaka | janya | thaat-raga | shared',
  parent: 'Melakarta, thaat, or parent raga',
  chakra: 'Karnatik Melakarta chakra when applicable',
  arohana: 'ascending swaras',
  avarohana: 'descending swaras',
  jivaSwaras: 'important identity swaras',
  nyasaSwaras: 'resting swaras',
  pakad: 'signature phrase or chalan',
  phrases: 'phrase examples for detection and lessons',
  avoid: 'notes/swaras to avoid or use carefully',
  lessonEligible: 'can appear in quiz/ear-training/certification flows'
};

const melakartaDhaNiPairs = [
  ['D1', 'N1'],
  ['D1', 'N2'],
  ['D1', 'N3'],
  ['D2', 'N2'],
  ['D2', 'N3'],
  ['D3', 'N3']
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function melakartaRows() {
  return melakartaChakras.flatMap((chakra, chakraIndex) => {
    const start = Number(chakra.range.split('-')[0]);
    const [rishabham, gandharam] = chakra.swaraFrame.split(' ');
    return chakra.ragas.map((raga, ragaIndex) => {
      const [dhaivatam, nishadam] = melakartaDhaNiPairs[ragaIndex];
      return {
        number: start + ragaIndex,
        name: raga,
        chakra: chakra.name,
        chakraNumber: chakraIndex + 1,
        range: chakra.range,
        madhyamam: chakra.madhyamam,
        swaraFrame: chakra.swaraFrame,
        rishabham,
        gandharam,
        dhaivatam,
        nishadam
      };
    });
  });
}

export const melakartaRagas = melakartaRows().map((row) => ({
  id: `melakarta_${String(row.number).padStart(2, '0')}_${slugify(row.name)}`,
  name: row.name,
  system: 'Karnatik',
  lineage: 'janaka',
  parent: `${row.number}th Melakarta`,
  family: `Melakarta ${row.number} / Chakra ${row.chakra}`,
  chakra: row.chakra,
  chakraNumber: row.chakraNumber,
  number: row.number,
  time: 'Practice / reference',
  mood: 'Melakarta parent scale reference',
  tags: ['Janaka', 'Melakarta', row.madhyamam, row.swaraFrame],
  arohana: ['S', row.rishabham, row.gandharam, row.madhyamam, 'P', row.dhaivatam, row.nishadam, "S'"],
  avarohana: ["S'", row.nishadam, row.dhaivatam, 'P', row.madhyamam, row.gandharam, row.rishabham, 'S'],
  vadi: 'Jiva swaras require raga-specific review',
  samvadi: 'Nyasa swaras require raga-specific review',
  pakad: 'Parent scale reference; phrase grammar to be reviewed',
  notes: 'Complete Melakarta parent entry generated from chakra structure. Needs phrase-level review before use in detection claims.',
  phrases: [],
  lessonEligible: ['quiz']
}));

export const janyaRagaEntries = janyaCatalogue.flatMap((group) =>
  group.ragas.map((raga) => ({
    id: `janya_${slugify(raga)}`,
    name: raga,
    system: 'Karnatik',
    lineage: 'janya',
    parent: group.parent,
    family: `Janya of ${group.parent}`,
    time: 'To be reviewed',
    mood: 'To be reviewed',
    tags: ['Janya', 'Needs scale review'],
    arohana: [],
    avarohana: [],
    vadi: 'To be reviewed',
    samvadi: 'To be reviewed',
    pakad: 'To be reviewed',
    notes: 'Catalogue placeholder. Add arohana, avarohana, prayoga, nyasa, and detection phrases before using for confident identification.',
    phrases: [],
    lessonEligible: ['quiz']
  }))
);

export const hindustaniThaatCatalogue = [
  { thaat: 'Bilawal', ragas: ['Alhaiya Bilawal', 'Bihag', 'Deskar', 'Durga', 'Hamsadhwani'] },
  { thaat: 'Kalyan', ragas: ['Yaman', 'Shuddha Kalyan', 'Yaman Kalyan', 'Bhoopali', 'Kamod'] },
  { thaat: 'Khamaj', ragas: ['Khamaj', 'Desh', 'Tilak Kamod', 'Jhinjhoti', 'Jaijaiwanti'] },
  { thaat: 'Kafi', ragas: ['Kafi', 'Bageshri', 'Bhimpalasi', 'Darbari Kanada', 'Malhar'] },
  { thaat: 'Asavari', ragas: ['Asavari', 'Jaunpuri', 'Darbari', 'Adana', 'Komal Rishabh Asavari'] },
  { thaat: 'Bhairav', ragas: ['Bhairav', 'Ahir Bhairav', 'Jogiya', 'Ramkali', 'Gauri'] },
  { thaat: 'Bhairavi', ragas: ['Bhairavi', 'Malkauns', 'Sindhu Bhairavi', 'Bilaskhani Todi', 'Chandrakauns'] },
  { thaat: 'Marwa', ragas: ['Marwa', 'Puriya', 'Sohini', 'Lalit', 'Basant'] },
  { thaat: 'Poorvi', ragas: ['Poorvi', 'Puriya Dhanashree', 'Shree', 'Gauri Poorvi', 'Paraj'] },
  { thaat: 'Todi', ragas: ['Miyan ki Todi', 'Gujari Todi', 'Multani', 'Madhuvanti', 'Lalit Todi'] }
];

export const hindustaniRagaEntries = hindustaniThaatCatalogue.flatMap((group) =>
  group.ragas.map((raga) => ({
    id: `hindustani_${slugify(raga)}`,
    name: raga,
    system: 'Hindustani',
    lineage: 'thaat-raga',
    parent: group.thaat,
    family: `${group.thaat} Thaat`,
    time: 'To be reviewed',
    mood: 'To be reviewed',
    tags: ['Hindustani', group.thaat, 'Needs scale review'],
    arohana: [],
    avarohana: [],
    vadi: 'To be reviewed',
    samvadi: 'To be reviewed',
    pakad: 'To be reviewed',
    notes: 'Catalogue placeholder. Add aroha/avaroha, pakad, vadi/samvadi, and phrase evidence before using for confident detection.',
    phrases: [],
    lessonEligible: ['quiz']
  }))
);

const featuredIds = new Set(ragas.map((raga) => raga.id));
const featuredNames = new Set(ragas.map((raga) => raga.name));

export const ragaKnowledgeBase = [
  ...ragas.map((raga) => ({ ...raga, lineage: raga.lineage || (raga.system === 'Hindustani' ? 'thaat-raga' : 'featured') })),
  ...melakartaRagas.filter((raga) => !featuredNames.has(raga.name) && !featuredIds.has(raga.id)),
  ...janyaRagaEntries.filter((raga) => !featuredNames.has(raga.name) && !featuredIds.has(raga.id)),
  ...hindustaniRagaEntries.filter((raga) => !featuredNames.has(raga.name) && !featuredIds.has(raga.id))
];

export const databaseStats = {
  featured: ragas.length,
  janakaMelakarta: melakartaRagas.length,
  janyaCatalogue: janyaRagaEntries.length,
  hindustaniCatalogue: hindustaniRagaEntries.length,
  total: ragaKnowledgeBase.length
};
