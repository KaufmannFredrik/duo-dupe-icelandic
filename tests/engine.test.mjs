import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadData } from './helpers/data.mjs';
import { allowedFor, lessonStates, nextLesson } from '../js/engine/course-model.js';
import { analysesIn, parseTag } from '../js/grammar.js';
import { hashSeed } from '../js/engine/rng.js';
import { numberOf } from '../js/engine/numbers.js';

const d = loadData();
const tokens = (text) => [...text.matchAll(/\p{L}+/gu)].map((m) => ({ raw: m[0], low: m[0].toLocaleLowerCase('is'), index: m.index }));
const lessonsOf = (unitId) => d.course.units.find((u) => u.id === unitId).lessons;

// A verb-form exercise: the verb is in the sentence in a finite form of the tag, the options are
// forms of the same tense with the answer once, and the person agrees with a subject pronoun.
const PRONOUN = { 'ég_pfn': 1, 'þú_pfn': 2, 'hann_pfn': 3, 'hún_pfn': 3, 'það_pfn': 3 };
function checkVerbForm(s) {
  const text = d.sentences[s.sentence].is;
  const bm = d.paradigm(s.lemma);
  const p = parseTag(s.tag);
  assert.ok(p.voice === 'GM' && p.mood === 'FH' && p.person, `${s.tag} is a finite active form`);
  assert.ok(analysesIn(bm, s.target).some((a) => a.tag === s.tag), `"${s.target}" is ${s.tag} of ${s.lemma}`);
  assert.ok(!analysesIn(bm, s.target).some((a) => ['NH', 'SAGNB'].includes(a.parsed.mood)), `"${s.target}" is also the infinitive or supine`);
  const low = (x) => x.toLocaleLowerCase('is');
  const options = s.options ?? []; // typeform has none
  if (s.options) assert.equal(options.filter((o) => low(o) === low(s.target)).length, 1, `the answer once among ${options}`);
  assert.equal(new Set(options).size, options.length, 'distinct options');
  for (const o of options) assert.ok(analysesIn(bm, o).some((a) => a.parsed.mood === 'FH' && a.parsed.tense === p.tense), `option "${o}" is a ${p.tense} form`);
  const toks = tokens(text);
  const tags = d.tagsOf(s.sentence);
  const subjects = toks
    .map((t, i) => (typeof tags?.[i] === 'string' && PRONOUN[tags[i]] ? analysesIn(d.paradigm(tags[i]), t.raw).filter((a) => a.parsed.case === 'NF').map((a) => [PRONOUN[tags[i]], a.parsed.number]) : []))
    .flat();
  if (subjects.length && analysesIn(bm, s.target).filter((a) => a.parsed.mood === 'FH').length > 1) {
    assert.ok(subjects.some(([person, number]) => person === p.person && number === p.number), `"${text}": ${s.target} as ${s.tag} does not agree with its subject`);
  }
  if (toks[0].raw === s.target) assert.ok(text.trim().endsWith('?') || subjects.length, `"${text}" starts with the verb: a command`);
  // A form that can only be 1st or 2nd person has its subject pronoun ("taldir" alone is a participle).
  const finite = analysesIn(bm, s.target).filter((a) => a.parsed.voice === 'GM' && a.parsed.mood === 'FH' && a.parsed.person);
  if (finite.every((a) => a.parsed.person !== 3)) assert.ok(subjects.some(([person, number]) => person === p.person && number === p.number), `"${text}": ${s.target} has no subject pronoun`);
}

// A number exercise: the number is said with words the learner knows, the answer is among
// distinct options, and the words to build are what the number is called.
function checkNumber(s, allowed) {
  const known = new Set([...allowed, s.lemma]);
  const words = tokens(s.say ?? s.words.join(' ')).map((t) => t.low);
  for (const w of words) assert.ok([...(d.formIndex.get(w) ?? [])].some((id) => known.has(id)), `${s.type}: "${w}" in "${s.say ?? s.words.join(' ')}" is not a known word`);
  assert.ok(words.some((w) => d.formIndex.get(w)?.has(s.lemma)) || numberOf(s.lemma)?.form, `${s.type}: ${s.lemma} is not said in "${s.say}"`);
  if (s.type === 'numlisten') {
    assert.equal(s.options.filter((o) => o === s.answer).length, 1, `the answer once among ${s.options}`);
    assert.equal(new Set(s.options).size, s.options.length, 'distinct options');
    assert.equal(s.options.length, 4, 'four options');
  }
  if (s.type === 'numbuild') {
    assert.equal(s.distractors.length, 2, 'two other chips');
    for (const x of s.distractors) assert.ok(!s.words.includes(x), `chip "${x}" is in the answer`);
  }
}

function generate(unitId, lesson) {
  const allowed = allowedFor(d.course, unitId, lesson.index);
  return { allowed, specs: d.generator.lesson({ focus: lesson.focus, allowed, seed: hashSeed(lesson.key), practiced: Boolean(lesson.review) }) };
}

test('course: eighteen units in order, all hand-made', () => {
  assert.deepEqual(d.course.units.map((u) => u.id), ['hello', 'aboutme', 'cafe', 'family', 'numbers', 'around', 'time', 'myday', 'shopping', 'food', 'home', 'people', 'weather', 'body', 'freetime', 'study', 'grammar', 'newwords']);
  for (const u of d.course.units) assert.equal(u.auto, false, `${u.id} has hand-made lessons`);
  for (const u of d.course.units) assert.ok(u.lessons.at(-1).review, `${u.id} ends with a review`);
});

test('course: a hand-made unit teaches every word of its theme exactly once', () => {
  for (const u of d.course.units.filter((x) => !x.auto)) {
    const taught = u.lessons.filter((l) => !l.review).flatMap((l) => l.focus);
    assert.equal(new Set(taught).size, taught.length, `${u.id}: a word is taught twice`);
    assert.deepEqual([...taught].sort(), [...u.lemmas].sort(), `${u.id}: lessons and theme words differ`);
  }
});

test('course: every focus word exists in the lexicon', () => {
  for (const u of d.course.units) for (const l of u.lessons) for (const id of l.focus) assert.ok(d.lexicon.lemmas[id], `${l.key}: ${id}`);
});

test('course: lesson states follow progress', () => {
  const fresh = lessonStates(d.course, { lessons: {}, skippedUnits: [] });
  assert.equal(fresh.get('hello/1'), 'current');
  assert.equal(fresh.get('hello/2'), 'locked');
  assert.equal(fresh.get('cafe/1'), 'locked');
  const doneHello = Object.fromEntries(lessonsOf('hello').filter((l) => !l.review).map((l) => [l.key, { done: true }]));
  const after = lessonStates(d.course, { lessons: doneHello, skippedUnits: [] });
  assert.equal(after.get('hello/review'), 'review');
  assert.equal(after.get('aboutme/1'), 'current');
  assert.equal(after.get('cafe/1'), 'locked');
  const skipped = lessonStates(d.course, { lessons: {}, skippedUnits: ['hello'] });
  assert.equal(skipped.get('hello/1'), 'done');
  assert.equal(skipped.get('aboutme/1'), 'current');
  assert.equal(nextLesson(d.course, { lessons: {}, skippedUnits: ['hello'] }).lesson.key, 'aboutme/1');
});

test('course: the path has sections; units are numbered in it, a bonus unit is not', () => {
  assert.deepEqual(d.course.sections.map((s) => s.id), ['a1', 'a2', 'bonus']);
  const a1 = d.course.sections[0].units;
  assert.deepEqual(a1.map((u) => u.number), a1.map((_, i) => i + 1));
  assert.ok(a1.every((u) => u.section === 'a1'));
  const bonus = d.course.units.find((u) => u.id === 'newwords');
  assert.equal(bonus.section, 'bonus');
  assert.equal(bonus.number, null);
  assert.equal(d.course.units.at(-1), bonus, 'the bonus comes last in the path');
});

test('course: a unit recorded as finished stays finished when lessons are added or units inserted', async () => {
  const { courseModel, unitsToRecord } = await import('../js/engine/course-model.js');
  const doneHello = Object.fromEntries(lessonsOf('hello').filter((l) => !l.review).map((l) => [l.key, { done: true }]));
  assert.deepEqual(unitsToRecord(d.course, { lessons: doneHello }), ['hello']);
  // The same course with a new lesson in hello and a new unit before cafe.
  const units = d.course.units.map((u) => ({ ...u, lessons: u.id === 'hello' ? [...u.lessons.filter((l) => !l.review), { id: 'extra', focus: ['takk_uh'] }, { id: 'review', review: true }] : u.lessons }));
  const index = { sections: [{ id: 'a1', units: ['hello', 'family', 'cafe'] }] };
  const lexicon = { themes: d.lexicon.themes };
  const changed = courseModel({ index, units: units.filter((u) => ['hello', 'family', 'cafe'].includes(u.id)), lexicon });
  // Without the record, the new lesson would be "current" and the units after hello locked.
  const unrecorded = lessonStates(changed, { lessons: doneHello, skippedUnits: [] });
  assert.equal(unrecorded.get('hello/extra'), 'current');
  assert.equal(unrecorded.get('family/1'), 'locked');
  const recorded = lessonStates(changed, { lessons: doneHello, units: { hello: '2026-11-24' }, skippedUnits: [] });
  assert.equal(recorded.get('hello/extra'), 'new', 'the new lesson is open but not where Start goes');
  assert.equal(recorded.get('family/1'), 'current', 'the inserted unit is next');
  assert.equal(recorded.get('cafe/1'), 'locked');
});

test('generator: homographs are told apart by the sentence tags', () => {
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  const cases = [
    ['Það var afar heitur dagur.', 'afi_no', 'heitur_lo'], // afar = "very"
    ['Hann elskaði hana einu sinni.', 'sinn_fn', 'elska_so'], // einu sinni = "once"
    ['Hann elskaði hana einu sinni.', 'einn_to', 'hún_pfn'],
    ['Hann sér hundinn hennar.', 'sig_afn', 'sjá_so'], // sér = "sees"
    ['Við erum öll til.', 'til_fs', 'vera_so'], // til = "ready", a loose use: known, not taught
    ['Ég sé það.', 'vera_so', 'sjá_so'], // the parser reads sé as vera; content/tag-fixes.json
    ['Sá einhver hvað gerðist?', 'sá_fn', 'sjá_so'], // Sá = saw; content/tag-fixes.json
    ['Eru þeir bræður?', 'sá_fn', 'hann_pfn'], // þeir = they; content/tag-fixes.json
    ['Það er svo satt.', 'saddur_lo', 'vera_so'], // satt = true (sannur), not full: a fix with lemma null
    ['Þú verður að fara til baka.', 'baka_so', 'fara_so'], // til baka = back
    ['Slökktu á honum.', 'eiga_so', 'á_fs'], // slökkva á: the parser reads á as a river; content/tag-fixes.json
    ['Hann er læs og skrifandi.', 'læsa_so', 'vera_so'], // læs = literate, not lock: a fix with lemma null
    ['Allt er í lagi.', 'laga_so', 'vera_so'], // í lagi = all right, the noun lag
    ['Hún verður að gera sig klára fyrir matinn.', 'klára_so', 'klár_lo'], // klára = ready, the adjective; content/tag-fixes.json
    ['Má ég klára?', 'klár_lo', 'klára_so'], // the verb, to finish
    ['Taktu því rólega!', 'rólegur_lo', 'taka_so'], // rólega = calmly, the adverb: a fix with lemma null
    ['Hún heilsaði mér með brosi.', 'brosa_so', 'heilsa_so'], // brosi = the noun bros (a smile)
    ['Það er önnur leið.', 'leiður_lo', 'vera_so'], // leið = a way, the noun
    ['Mig langar ekki í meira.', 'langur_lo', 'ekki_ao'], // langar = want, the verb langa
    ['Augu hans brostu bak við gleraugun.', 'bak_no', 'auga_no'], // bak við = behind: a fix with lemma null
    ['Hún bakaði handa mér köku.', 'hönd_no', 'baka_so'], // handa = for, the preposition
    ['Ég er leið.', 'líða_so', 'leiður_lo'], // leið = sad, the adjective
    ['Það er í lagi.', 'lag_no', 'vera_so'], // í lagi = all right: lag ("song") in an idiom, a loose fix
    ['Hann braut lög.', 'lag_no', 'brjóta_so'], // lög = law, a word of its own: a fix with lemma null
    ['Ég er fær um að synda.', 'fá_so', 'synda_so'], // fær = able, not fá: a fix with lemma null
    ['Ég sé illa.', 'vera_so', 'sjá_so'], // the parser reads sé as vera; content/tag-fixes.json
  ];
  for (const [text, not, yes] of cases) {
    assert.ok(sid(text), `"${text}" is in the data`);
    assert.equal(d.generator.hasLemma(sid(text), not), false, `"${text}" has no ${not}`);
    assert.equal(d.generator.hasLemma(sid(text), yes), true, `"${text}" has ${yes}`);
  }
});

test('generator: feelings the parser reads as participles or nouns are the course adjectives', () => {
  // content/tag-fixes.json: hrædd(ur) is not hræða, reið(ur) not ríða or reiða, vera not the noun, stutt not studdur.
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  const cases = [
    ['Ég var hræddur.', 'hræddur_lo'],
    ['Ég var hrædd.', 'hræddur_lo'],
    ['Hann er hræddur við föður sinn.', 'hræddur_lo'],
    ['Ekki vera reið.', 'reiður_lo'],
    ['Ekki vera reiður.', 'vera_so'],
    ['Ekki vera svona reiður.', 'svona_ao'],
    ['Hún er með stutt hár.', 'stuttur_lo'],
    ['Mér líkar enginn þessara hatta.', 'hattur_no'],
    ['Það er of stutt.', 'of_ao'],
  ];
  for (const [text, yes] of cases) {
    assert.ok(sid(text), `"${text}" is in the data`);
    assert.equal(d.generator.hasLemma(sid(text), yes), true, `"${text}" has ${yes}`);
  }
});

test('data: Líkaminn: a fixed sentence keeps no parser cases where the parser gave a wrong one, and misread words are the course words', () => {
  // content/tag-fixes.json: Dóttur and Fólki are dative, not genitive or nominative; hendurnar after um and hjálp after kalla á are accusative.
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  for (const text of ['Dóttur hennar er illt í maganum.', 'Dóttur hennar er illt í eyranu.', 'Fólki líður best þegar það er heima hjá sér.', 'Þvoðu þér um hendurnar.', 'Einhver er að kalla á hjálp.']) {
    assert.ok(sid(text), `"${text}" is in the data`);
    assert.equal(d.casesOf(sid(text)), undefined, `"${text}" has no parser cases`);
  }
  // Words the parser reads as others are the course words: hef is hafa, not hefja; hreinar is hreinn (clean).
  assert.equal(d.generator.hasLemma(sid('Ég hef ekki tíma til að vera veik.'), 'hafa_so'), true);
  assert.equal(d.generator.hasLemma(sid('Eru hendurnar þínar hreinar?'), 'hreinn_lo'), true);
  // An unfixed one keeps them: hálsinum is dative after í.
  assert.deepEqual(d.casesOf(sid('Mér er illt í hálsinum.')), ['ÞGF', null, 'NF', null, 'ÞGF']);
});

test('data: Frítími: a plural-only noun the parser names by its singular, and í lagi known but not taught', () => {
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  // scripts/lib/tags.mjs PLURAL_ONLY: the parser's lemma is tónleikur, the course word tónleikar.
  for (const text of ['Tónleikarnir hans voru mjög góðir.', 'Það voru of margir á tónleikunum.', 'Hún fór með vini sínum á tónleikana.']) {
    assert.equal(d.generator.hasLemma(sid(text), 'tónleikar_no'), true, `"${text}" has tónleikar`);
  }
  // A loose fix: the word is known (the sentence is readable) but does not teach lag.
  const id = sid('Allt er í lagi.');
  assert.equal(d.generator.hasLemma(id, 'lag_no'), false);
  assert.ok(d.generator.sentenceOk(id, new Set(['allur_fn', 'vera_so', 'í_fs', 'lag_no'])), 'readable with lag known');
  assert.equal(d.generator.hasLemma(sid('Mig langar að syngja lag.'), 'lag_no'), true, 'lag the song is taught');
});

test('data: a made sentence is a Tatoeba sentence with one word replaced, and teaches that word', () => {
  const made = Object.entries(d.sentences).filter(([, s]) => s.from);
  assert.ok(made.length >= 47, `${made.length} made sentences`);
  for (const [id, s] of made) {
    assert.match(id, new RegExp(`^${s.from}-\\d+$`), `${id} is named after its original`);
    const toks = tokens(s.is);
    const at = toks.findIndex((t) => t.raw === s.swap[1]);
    assert.ok(at >= 0, `${id}: "${s.swap[1]}" is a word of "${s.is}"`);
    const original = d.sentences[s.from];
    if (original) {
      const theirs = tokens(original.is).map((t) => t.raw);
      assert.deepEqual(toks.map((t, i) => (i === at ? s.swap[0] : t.raw)), theirs, `${id} differs from ${s.from} in one word`);
    }
    assert.ok(s.en.length && s.nb.length, `${id} has English and Bokmål`);
    // The word put in is a course word there (the parser or a tag fix says so), so it is taught.
    const tag = d.tagsOf(id)?.[at];
    assert.ok(typeof tag === 'string' && !tag.startsWith('~') && d.lexicon.lemmas[tag], `${id}: "${s.swap[1]}" is tagged ${tag}`);
    assert.ok(d.pool.includes(id), `${id} is in the pool`);
  }
});

test('generator: a case and its rule come from the sentence, not from the first form of the paradigm', () => {
  const sid = (text) => Object.keys(d.sentences).find((k) => d.sentences[k].is === text);
  const why = (text, id) => {
    assert.ok(sid(text), `"${text}" is in the data`);
    const t = d.generator.caseTarget(id, sid(text));
    return t && { tag: t.tag, rule: d.generator.ruleFor(sid(text), t.index, t.cases[0], id) };
  };
  assert.deepEqual(why('Er hann að drekka kaffi?', 'kaffi_no'), { tag: 'ÞFET', rule: null }); // kaffi: NF, ÞF or ÞGF
  assert.deepEqual(why('Systir mín er í vinnu.', 'vinna_no'), { tag: 'ÞGFET', rule: 'í-staður' });
  assert.deepEqual(why('Ég á dóttur.', 'dóttir_no'), { tag: 'ÞFET', rule: 'eiga' }); // á is the verb eiga here
  assert.deepEqual(why('Ég var í viku hjá frænda mínum.', 'vika_no'), { tag: 'ÞFET', rule: 'í-tími' });
  assert.deepEqual(why('Ég fer á sunnudaginn.', 'sunnudagur_no'), { tag: 'ÞFETgr', rule: 'á-tími' });
  assert.deepEqual(why('Ég fer ekki í skólann á sunnudögum.', 'sunnudagur_no'), { tag: 'ÞGFFT', rule: 'á-tími-þgf' });
  assert.deepEqual(why('Ég fer með þér á flugvöllinn.', 'flugvöllur_no'), { tag: 'ÞFETgr', rule: 'á-hreyfing' });
  assert.deepEqual(why('Horfðu á þetta fjall.', 'fjall_no'), { tag: 'ÞFET', rule: 'á-horfa' }); // horfa á: look at
  assert.equal(why('Lokaðu bókinni.', 'bók_no')?.rule, 'loka'); // loka takes the dative
  assert.deepEqual(why('Ég kom til Japans fyrir tveimur árum.', 'ár_no'), { tag: 'ÞGFFT', rule: 'fyrir-síðan' }); // the phrase is "tveimur árum"
  assert.equal(why('Við verðum að bíða eftir honum.', 'hann_pfn')?.rule, 'eftir');
  assert.equal(why('Hún tekur alltaf af borðinu eftir matinn.', 'matur_no')?.rule, 'eftir-tími');
  assert.equal(why('Takk fyrir matinn.', 'matur_no')?.rule, 'fyrir');
  // No verb: the case comes from a verb left out, so the form's three cases stay undecided.
  assert.equal(why('Góða nótt.', 'nótt_no'), null);
});

test('generator: the same seed gives the same lesson', () => {
  const l = lessonsOf('hello')[1];
  assert.deepEqual(generate('hello', l).specs, generate('hello', l).specs);
});

test('generator: a sentence built from word chips has no digits, in the lessons as the browser plays them', () => {
  // Chips hold letters only, so "Hvað með 12:45?" could never be built right (grammar/4 drew it).
  for (const unit of d.course.units) {
    for (const lesson of unit.lessons) {
      for (const n of [0, 1, 2]) {
        const specs = d.generator.lesson({ focus: lesson.focus, allowed: allowedFor(d.course, unit.id, lesson.index), seed: hashSeed(`${lesson.key}#${n}`), practiced: Boolean(lesson.review) });
        for (const s of specs.filter((x) => x.type === 'wordbank' || x.type === 'dictation')) {
          assert.ok(!/\d/.test(d.sentences[s.sentence].is), `${lesson.key}#${n} ${s.type}: "${d.sentences[s.sentence].is}" has digits`);
        }
      }
    }
  }
});

for (const unitId of ['hello', 'aboutme', 'cafe', 'family', 'numbers', 'around', 'time', 'myday', 'shopping', 'food', 'home', 'people', 'weather', 'body', 'freetime', 'study', 'grammar', 'newwords']) {
  for (const lesson of lessonsOf(unitId)) {
    test(`generator: ${lesson.key} produces valid exercises`, () => {
      const { allowed, specs } = generate(unitId, lesson);
      assert.ok(specs.length >= 8, `only ${specs.length} exercises`);
      assert.ok(new Set(specs.map((s) => s.type)).size >= 3, 'at least three exercise types');
      const knownIn = (words) => (t) => [...(d.formIndex.get(t.low) ?? [])].some((id) => words.has(id)) || d.names.has(t.low) || (t.index > 0 && t.raw[0] !== t.low[0]);
      const everyWord = new Set(Object.keys(d.lexicon.lemmas));
      for (const s of specs) {
        // Sentence building uses only words met so far; reading exercises may use any course word.
        const known = knownIn(s.type === 'wordbank' || s.type === 'dictation' ? allowed : everyWord);
        // Word chips hold letters only, so a sentence to build has no digits.
        if (s.type === 'wordbank' || s.type === 'dictation') assert.ok(!/\d/.test(d.sentences[s.sentence].is), `${lesson.key} ${s.type}: "${d.sentences[s.sentence].is}" has digits`);
        for (const sid of [s.sentence, ...(s.type === 'choice' ? s.options : [])].filter(Boolean)) {
          assert.ok(d.sentences[sid], `sentence ${sid} exists`);
          assert.ok(!d.excluded.has(sid), `sentence ${sid} is excluded`);
          for (const t of tokens(d.sentences[sid].is)) assert.ok(known(t), `${lesson.key} ${s.type}: "${t.raw}" in "${d.sentences[sid].is}" is not a known word`);
        }
        if (s.type === 'choice') {
          assert.equal(new Set(s.options.map((x) => d.sentences[x].en[0])).size, s.options.length, 'distinct English translations');
          assert.equal(new Set(s.options.map((x) => d.sentences[x].nb[0])).size, s.options.length, 'distinct Bokmål translations');
        }
        // Word options show the English meaning or the Bokmål gloss: the answer must differ in both.
        const words = s.type === 'meaning' ? s.options : s.type === 'match' ? s.pairs : [];
        for (const [field, of] of [['English meaning', (x) => d.lexicon.lemmas[x].meaning], ['Bokmål gloss', (x) => d.lexicon.lemmas[x].nb[0]]]) {
          if (s.type === 'meaning') assert.equal(words.filter((x) => of(x) === of(s.lemma)).length, 1, `${lesson.key} meaning: another option has the ${field} of ${s.lemma}`);
          if (s.type === 'match') assert.equal(new Set(words.map(of)).size, words.length, `${lesson.key} match: two pairs share a ${field}`);
        }
        if (s.type === 'wordbank' || s.type === 'dictation') {
          const present = new Set(tokens(d.sentences[s.sentence].is).map((t) => t.low));
          for (const x of s.distractors) assert.ok(!present.has(x.toLocaleLowerCase('is')), `distractor "${x}" is in the sentence`);
        }
        if (s.sentence && s.lemma) assert.ok(d.generator.hasLemma(s.sentence, s.lemma), `${s.type}: "${d.sentences[s.sentence].is}" does not contain ${s.lemma}`);
        const verb = d.lexicon.lemmas[s.lemma]?.ofl === 'so';
        if (s.type === 'ending' || s.type === 'case' || (s.type === 'typeform' && !verb)) {
          const tags = d.tagsOf(s.sentence);
          const at = tokens(d.sentences[s.sentence].is).findIndex((t) => t.raw === s.target);
          if (tags) assert.equal(tags[at], s.lemma, `"${s.target}" in "${d.sentences[s.sentence].is}" is tagged ${tags[at]}, not ${s.lemma}`);
          const bm = d.paradigm(s.lemma);
          assert.ok(analysesIn(bm, s.target).length, `"${s.target}" is a form of ${s.lemma}`);
          assert.ok(tokens(d.sentences[s.sentence].is).some((t) => t.raw === s.target), 'target is in the sentence');
          // The case named is the parser's; without one, the form must have a single case.
          const parsed = tags ? d.casesOf(s.sentence)?.[at] : undefined;
          const formCases = new Set(analysesIn(bm, s.target).filter((a) => a.parsed.case && a.parsed.variant === 1).map((a) => a.parsed.case));
          if (parsed) assert.equal(s.meta.case, parsed, `"${s.target}" in "${d.sentences[s.sentence].is}" is ${parsed}, not ${s.meta.case}`);
          else assert.equal(formCases.size, 1, `"${s.target}" can be ${[...formCases]} and the parser did not decide`);
          if (s.rule) {
            const rule = d.rules[s.rule];
            assert.equal(rule.case, s.meta.case, `rule ${s.rule} is for ${rule.case}`);
            if (rule.kind === 'preposition') {
              // The preposition comes right before the phrase: the words before the target in its case.
              let start = at;
              while (start > 0 && tags && d.casesOf(s.sentence)?.[start - 1] === s.meta.case) start--;
              const prev = tokens(d.sentences[s.sentence].is)[start - 1];
              const prevIds = typeof tags?.[start - 1] === 'string' ? [tags[start - 1]] : [...(d.formIndex.get(prev.low) ?? [])];
              assert.deepEqual(prevIds, [`${rule.trigger}_fs`], `rule ${s.rule}: "${prev.raw}" before "${s.target}" is not the preposition`);
            }
          }
        }
        if (s.type === 'ending') {
          assert.ok(s.options.some((o) => o.toLocaleLowerCase('is') === s.target.toLocaleLowerCase('is')), 'answer among options');
          assert.ok(s.options.length >= 2 && new Set(s.options).size === s.options.length, 'distinct options');
          for (const o of s.options) assert.ok(d.paradigm(s.lemma).some((f) => f.b === o), `option "${o}" is a form of ${s.lemma}`);
        }
        if (s.type === 'conjugate' || (s.type === 'typeform' && verb)) checkVerbForm(s);
        if (s.type === 'typeform') assert.notEqual(s.target.toLocaleLowerCase('is'), d.lexicon.lemmas[s.lemma].lemma.toLocaleLowerCase('is'), `typeform asks for the dictionary form ${s.target}`);
        if (s.type === 'case') assert.equal(s.cases.length, 1, 'case questions only for unambiguous forms');
        if (s.type === 'table') for (const tag of s.blanks) assert.ok(d.paradigm(s.lemma).some((f) => f.g === tag), `${tag} in ${s.lemma}`);
        if (s.type === 'numlisten' || s.type === 'numtype' || s.type === 'numbuild') checkNumber(s, allowed);
      }
    });
  }
}

test('generator: placement has a step per unit, with case questions from unit 2', () => {
  const steps = d.generator.placement({ units: d.course.units, seed: 7 });
  assert.equal(steps.length, d.course.units.length);
  assert.ok(steps[0].items.length >= 1);
  assert.ok(steps.slice(1).some((s) => s.items.some((i) => i.type === 'case')));
});

test('generator: review turns due cards into exercises', () => {
  const allowed = allowedFor(d.course, 'cafe', 7);
  const specs = d.generator.review({ cards: [{ key: 'kaffi_no|meaning' }, { key: 'bjór_no|ÞFETgr' }, { key: 'mjólk_no|table' }], allowed, seed: 1 });
  assert.equal(specs.length, 3);
});

// A form card's review must answer that card; before, it could practice another form of the word,
// and the card stayed due for good.
const reviewKeys = (spec) => (spec.type === 'table' ? spec.blanks.map((tag) => `${spec.lemma}|${tag}`) : [spec.key]);

test('generator: review practices exactly the form that is due', () => {
  const allowed = new Set(Object.keys(d.lexicon.lemmas));
  const keys = new Set();
  for (const u of d.course.units) for (const l of u.lessons) {
    for (const s of generate(u.id, l).specs) if (['ending', 'case', 'conjugate'].includes(s.type)) keys.add(s.key);
  }
  assert.ok(keys.size > 100 && [...keys].some((k) => k.includes('_so|')), `${keys.size} form cards, verbs among them`);
  let typed = 0;
  for (const key of keys) {
    const [spec] = d.generator.review({ cards: [{ key }], allowed, seed: 3 });
    assert.ok(spec, `no review for ${key}`);
    assert.ok(reviewKeys(spec).includes(key), `${key} reviewed as ${spec.key}`);
    assert.notEqual(spec.type, 'typeform', 'a new card is picked, not typed');
    // A well-learned card (box 3 and up) is typed where the form differs from the dictionary form.
    const [known] = d.generator.review({ cards: [{ key, box: 4 }], allowed, seed: 3 });
    assert.ok(reviewKeys(known).includes(key), `${key} (box 4) reviewed as ${known.key}`);
    if (known.type === 'typeform') typed++;
  }
  assert.ok(typed > keys.size / 3, `only ${typed} of ${keys.size} known cards are typed`);
});

test('generator: case trainer cards are reviewed in their table', () => {
  const allowed = new Set(Object.keys(d.lexicon.lemmas));
  // Forms no readable sentence has: a plural with the article, a weak adjective, a verb in the past.
  for (const key of ['fiskur_no|EFFTgr', 'góður_lo|FVB-KVK-ÞGFFT', 'drekka_so|GM-FH-ÞT-2P-FT']) {
    const [spec] = d.generator.review({ cards: [{ key }], allowed, seed: 3 });
    assert.ok(spec, `no review for ${key}`);
    assert.ok(reviewKeys(spec).includes(key), `${key} reviewed as ${spec.key}`);
    assert.ok(d.generator.reviewable(key));
  }
});

test('generator: wrong options take knowing the word or reading the sentence to rule out', () => {
  let words = 0;
  let sameClass = 0;
  let sentences = 0;
  let lengthDiff = 0;
  const plain = (t) => t.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  for (const u of d.course.units) for (const l of u.lessons) {
    for (const s of generate(u.id, l).specs) {
      if (s.type === 'meaning') {
        const ofl = d.lexicon.lemmas[s.lemma].ofl;
        for (const o of s.options.filter((x) => x !== s.lemma)) {
          words++;
          if (d.lexicon.lemmas[o].ofl === ofl) sameClass++;
        }
        // No two options show the same meaning (before, "hæ" could get "that" twice).
        for (const of of [(x) => d.lexicon.lemmas[x].meaning, (x) => d.lexicon.lemmas[x].nb[0]]) assert.equal(new Set(s.options.map(of)).size, s.options.length, `${l.key}: options ${s.options.map(of)}`);
      }
      if (s.type === 'choice') {
        const n = tokens(d.sentences[s.sentence].is).length;
        for (const o of s.options.filter((x) => x !== s.sentence)) {
          sentences++;
          lengthDiff += Math.abs(tokens(d.sentences[o].is).length - n);
        }
        assert.equal(new Set(s.options.map((x) => plain(d.sentences[x].en[0]))).size, s.options.length, `${l.key}: two options read alike`);
      }
    }
  }
  assert.ok(sameClass / words > 0.9, `${sameClass} of ${words} meaning options share the word class`);
  assert.ok(lengthDiff / sentences < 1, `sentence options differ by ${(lengthDiff / sentences).toFixed(2)} words on average`);
});

test('course: words learned per section, and goals practiced when their units are finished', async () => {
  const { goalState, wordsLearned } = await import('../js/engine/course-model.js');
  const goals = JSON.parse(readFileSync(new URL('../content/goals.json', import.meta.url), 'utf8'));
  const first = lessonsOf('hello')[0];
  const p = { lessons: { [first.key]: { done: true } }, skippedUnits: ['family'] };
  const a1 = wordsLearned(d.course, p, 'a1');
  for (const id of first.focus) assert.ok(a1.has(id), `${id} learned in a done lesson`);
  for (const id of d.course.units.find((u) => u.id === 'family').lemmas) assert.ok(a1.has(id), `${id} of a skipped unit`);
  assert.equal(wordsLearned(d.course, p, 'bonus').size, 0);
  const self = goals.goals.find((g) => g.id === 'self'); // hello, aboutme and family
  assert.equal(goalState(self, d.course, p), 'open');
  assert.equal(goalState(self, d.course, { ...p, units: { hello: '2026-11-24' } }), 'open');
  assert.equal(goalState(self, d.course, { ...p, units: { hello: '2026-11-24', aboutme: '2026-11-24' } }), 'practiced');
  assert.equal(goalState(goals.goals.find((g) => g.id === 'health'), d.course, p), 'open'); // trained by Líkaminn
  assert.equal(goalState(goals.goals.find((g) => g.id === 'housing'), d.course, p), 'coming');
  assert.equal(goals.goals.filter((g) => g.section === 'a1').length, 8);
  assert.equal(goals.goals.filter((g) => g.section === 'a2').length, 8);
});
