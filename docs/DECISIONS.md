# Decisions log

What was chosen, why, and what failed. Newest phase first. Evidence for every data-source claim is in [api-report.md](api-report.md), which `scripts/probe-apis.mjs` regenerates.

## Daily quests (2026-11-24)

Three small goals a day give a reason to come back besides the streak, and point at parts of the app a learner may skip (stories, the sounds drill, typing).

- `js/quests.js` picks the day's three from the date, so they are the same all day and need no server: the first is always about course lessons (finish two, or finish one without a mistake), the other two come from 10 right in a row, 8 listening answers, 6 typed answers, a whole story heard to the end, and a round of Sounds. Pure functions with unit tests (`tests/quests.test.mjs`).
- Progress is `p.quests = { day, counts, chest }` in the progress record, so export and import carry it and a new day starts from nothing. A lesson passes what it counted to `completeLesson` (`events`); a story heard to the end calls `recordQuests`. Finishing all three adds 15 XP once, through the same XP path as everything else (daily goal, streak).
- The quests show on the Practice page and in the desktop side panel; a finished quest is listed on the lesson's closing screen or shown as a toast.
- Rejected: quests that can be impossible on the day (a review round when nothing is due, case questions before unit 2), and rewards larger than a lesson's XP, so quests do not outweigh learning.

## Bokmål translations by hand (2026-11-24)

Tatoeba has a Bokmål translation for only 28 of the 1,764 sentences, so a Norwegian learner saw English in almost every exercise, story line, guidebook example and greeting. The owner asked for translations made by hand.

- All 1,732 sentences without one (the four excluded sentences are never shown) were translated from the Icelandic, with Tatoeba's English as a check, in order of use: host greetings, story lines, guidebook examples, the exercise pool, then dictionary examples.
- They live in `content/translations-nb.json` (with a `names` list for place names in their Norwegian form). `npm run build:translations` writes them into `data/sentences.json` as `nb` with `"nbBy": "tolva"`, only where Tatoeba has none, so a Tatoeba translation added later wins; `scripts/build-data.mjs` applies the same file when it rebuilds everything, and `npm run check` fails while the data is out of date.
- `npm run validate` looks up every word in Bokmålsordboka (ord.uib.no, cached in `.cache/ordbokene/`). The form search misses some headwords (*morges*), so for a word it does not find, the articles a full-text search finds are read and the word counts only if it is one of their headwords or forms. Genitives and compounds of two forms count too. It also checks the final punctuation and that each translation belongs to a sentence Tatoeba does not translate.
- Choice exercises show translations as options, so the generator now keeps options apart in both English and Bokmål (before, only English), and the engine test checks both.
- Rejected: machine translation (the owner asked for hand translations, and a translation service would send the course text out); spelling every feminine noun with *-a* (the interface already writes *ordboken*).

## The cast in the app: hosts, story speakers, combos and friends (2026-11-23)

After the owner approved the cast, it was wired into the app, with gentle game mechanics around it.

### Hosts

- Each unit file names a host and what they say: `"host": { "character": "lundi", "says": "473495" }`. The greeting is a short Tatoeba sentence that fits the unit (Lundi: *Hæ, hvernig gengur?*; Torfi at the café: *Vilt þú te eða kaffi?*; Amma Sigga: *Áttu fjölskyldu?*), so it is real Icelandic with a real translation and generated audio already exists for it. `npm run validate` checks that the character exists and the sentence is there and not excluded.
- Learn shows the host under the unit banner with a speech bubble: name, what they are, the greeting with a play button and its translation. Only the host of the unit in progress moves; the others are still pictures, so a long page does not run ten animations. The host of a locked unit is a silhouette ("Someone new is waiting for you in this unit"), which gives a reason to unlock it. One credit line at the bottom names the greeting sentences and the voice.
- The lesson's closing screen shows the host cheering, and the out-of-hearts screen shows them sorry. Practice rounds, which belong to no unit, keep Tala.
- Units scrolled into view now leave room for the sticky banner (`scroll-margin-top`), so the host is not hidden under it.

### Faces that react, and the guide

- In a course lesson the host's face (48 px) sits at the end of the feedback sheet's title row and reacts to the answer: *happy* when right, *thinking* when almost, *sorry* when wrong, *cheer* on a combo. It adds no height, so the sheet covers no more of the exercise on a phone, and it is decorative (the title says the result). Practice rounds use Tala's matching faces.
- The guidebook shows the unit's host in the *thinking* pose as the one who walks the learner through the grammar.

### Story speakers

- A dialogue story maps its letter speakers to the cast: `"cast": { "A": "katla", "B": "torfi" }`. The reader introduces the cast under the title and puts the speaker's picture at each line; the story list shows the cast on the card. A speaker with no cast member keeps the letter (in the hello dialogue B introduces himself as Jack, so only A is Lundi).
- The five readings have a narrator, the host of the unit they follow (`"narrator": "torfi"`): Torfi tells the café, Amma Sigga the family, Elias the bus ride, Hekla the weekend and Jónas the weather. The reader introduces the narrator like a dialogue's cast, and the story card shows them, so every story now has a face.

### Combos

- Every fifth right answer in a row adds 5 XP: the feedback sheet says so with the host (or Tala) cheering, and the closing screen lists the combo bonus. A perfect 12-exercise lesson now gives 130 XP instead of 120. *Almost* and wrong answers end the run. The placement test has no combos. The bonus is passed to `completeLesson`, so it counts toward the daily goal and the streak like any XP.

### Friends

- Finishing the first unit a character hosts (or skipping it with the placement test) makes them a friend. Torfi and Katla host two units each; only the first counts. The closing screen of the lesson that does it says so, and Profile has a Friends section: friends with their picture, what they are and the unit they host; the others as silhouettes with the unit that befriends them.
- `friends()` and `befriendedBy()` in `js/characters.js` are pure functions with unit tests; `unitDone()` moved into the course model so stories and friends share it.

### Rejected

- A toast for combos: it would cover the feedback sheet on phones. The combo line sits inside the sheet instead.
- Showing every host's greeting before the unit opens: the silhouettes keep something to discover.

## The cast: seven characters (2026-11-23)

The owner asked for lifelike Icelandic characters in the app's theme, people as well as talking things, and reviewed them on a cast sheet before they were wired in.

### The characters

- **Amma Sigga**, a grandmother in a *lopapeysa* whose round yoke is knitted in the app's neon colors; **Jónas**, a fisherman in a *húfa* and a yellow oilskin; **Katla**, a student with headphones and a gold *Þ* pin; **Elias**, a learner from Norway who has just moved to Reykjavík (added so that learners have someone like themselves in the cast; his scarf is Tala's); **Lundi**, a puffin drawn in profile with sand eels in its bill; **Hekla**, a talking volcano drawn as a synthwave wireframe mountain; **Torfi**, a talking turf house whose windows are its eyes and its door its mouth.
- All are lit like the app: a cyan rim light from the left, magenta from the right, gold highlights, on transparent 240 x 240 squares, so they sit on any card. They are reviewed at 440, 96, 64, 48 and 28 px.
- Each has four expressions: *happy*, *cheer* (eyes closed in delight, a big smile; Hekla erupts sparks, Torfi throws the door open), *thinking* (gaze up and aside, one brow raised; Lundi gets a question mark) and *sorry* (brows tilted up in the middle, eyes down, a soft frown; Torfi's door is almost shut).

### Motion

- Each file carries its animation as CSS inside the SVG, so it plays where the file is shown as an image: blinking (an eyelid in the skin's color drops for about 0.1 seconds every five or six seconds, each character at its own pace), breathing (the figure drifts by about a pixel), and one touch each: Amma's yarn ball wobbles, Katla's headphone lights pulse, Elias's scarf tail sways, Lundi's fish swing, Hekla's steam rises, her crater glows and her sparks twinkle, Torfi's windows flicker and his smoke rises.
- The animations stop under `prefers-reduced-motion`. The build also writes a still copy of every file (`-still.svg`, no style, no eyelids) for Calm mode; `js/ui/character.js` picks it when the page is calm.

### How they are made

- `scripts/characters/*.mjs` draw each character in code, like `js/tala.js`, so changes stay small: shared parts (rim lights, a human face by expression, the motion rules, a seeded random generator for beard strands, grass and curls) are in `scripts/characters/lib.mjs`. The approved *happy* faces of Amma, Jónas and Katla are kept exactly as drawn; the other expressions come from the shared face.
- `npm run build:characters` writes `assets/characters/<id>-<expression>.svg` and the still copies: 56 files, 830 KB, precached by the service worker. The cast (names, labels) is `js/characters.js`; who hosts which unit is in the unit files; the style guide shows every character in every expression, so the QA checks them all.

## Claims checked against sources (2026-11-23)

By the owner's decision nobody is asked to review the course, so every hand-written language claim was checked against published sources instead. `content/NEEDS-NATIVE-REVIEW.md` is now `content/CLAIMS.md`: each claim with its source (Wiktionary, the DMII Core, Tatoeba, Íslensk málnefnd's *Ritreglur*, Wikipedia, elon.io, islenzka.net, academic papers on weather verbs and word order, Bokmålsordboka) and a status: sourced, attested (only Tatoeba sentences or DMII Core forms show it) or corrected.

### How

- The claims were sorted into five batches (prepositions and case rules, time, grammar, pronunciation and etymology, and the rest), and the source pages were read for every claim; the URLs are in `content/CLAIMS.md`. The *Ritreglur* PDF was read in full after text extraction.
- Nothing was contradicted outright. Some claims had no grammar source and rest on the corpus (for example *heyra í þér* with the dative, the person in the dative after *kaupa* and *selja*); they are marked "attested".

### Corrected

- **fyrir**: Wiktionary also gives the dative for some "for" senses, so the rule now says *fyrir* mostly takes the accusative for "for" and "before".
- **Possessives** (unit 3): husband and wife take the article (*maðurinn minn*, *konan mín*), unlike other family words (elon.io, Transparent); the guidebook now says so.
- **má and må** (unit 9): both words have both senses (Wiktionary *mega*; Bokmålsordboka *måtte*), so the note says Norwegian *må* usually means must and Icelandic *má* usually may.
- **sími** (unit 10): Wiktionary says it is based on *síma* ("cord"), not on "an old word".
- **Ísland** (landing page): Wiktionary gives both [ˈistlant] and [ˈiːs.lant], so *sl* "is often said" with a t.
- The old review list's example of accents changing a word, *ar* and *ár*, was wrong (*ar* is not an Icelandic word); `content/CLAIMS.md` uses *dýr* and *dyr*.
- Notes that asked for native review (case rules, minimal pairs, stories, the bridge credit, the validator's message) now point to the sources.

### Content flags

- `"reviewed": true` now means that every hand-written claim in the file is in `content/CLAIMS.md` with its source; all units, stories, the case rules, the minimal pairs and the vocabulary are marked so. `npm run validate` lists any file still marked `false`.

## Hand-made units: unit 10 lessons, and four stories (2026-11-23)

- **Unit 10, *Nýyrði*:** its twelve words are now grouped by hand into two lessons and a review, Sound and screens (*sjónvarp*, *útvarp*, *farsími*, *tölvupóstur*, *forrit*, *hátalari*) and From planes to planets (*flugvél*, *þota*, *tækni*, *rafmagn*, *veira*, *reikistjarna*), following the guidebook. Only *sjónvarp*, *flugvél*, *forrit* and *farsími* have sentences a learner can read, so both lessons are mostly word exercises; no grouping does better. All ten units now have hand-made lessons.
- **Four new stories**, one after each unit that had none. Every line is an unchanged Tatoeba sentence that uses only words known after that unit (checked with the generator's `sentenceOk`):
  - *A weekend* (after unit 5): *Ég vaknaði klukkan sex í morgun*, *Það er laugardagur í dag*, *Á morgun er sunnudagur*, *Eigðu góða helgi*.
  - *A new dress* (after unit 6, a dialogue): *Mamma mín keypti mér nýjan kjól*, *Hvað kostar það?*, *Ég er ekki með peninga á mér*, *Ég veit að peningar eru ekki allt*.
  - *Homework* (after unit 8, a dialogue): *Þú þarft að svara spurningunum*, *Þetta er erfitt*, *Get ég hjálpað?*, *Þú verður að læra meira*.
  - *A rainy day* (after unit 9, a dialogue): *Hvað er að gerast?*, *Það tók að rigna*, *Gefðu mér eitthvað að gera*, *Gerðu það sem þú vilt*.
- The five earlier stories (Phase 4) were made before the units were regrouped, and some of their lines use words from later units (*eða*, *með*, *vinnu*) or words outside the course (*svo*, *hvernig*). The word panel and the translations cover them, so they stay as they are.

### Tests

- `node --test`: 112 tests; the course test now checks that every unit has hand-made lessons.
- `npm run smoke`: every lesson of all ten units, and nine stories listed.

## Hand-made units: unit 9, Grammar words (2026-11-23)

### Unit 9, *Orð*

- Six lessons and a review: Have and do, Know and need, Sit and stand, This and that, All or nothing, Also and again (34 words). These words have been allowed in every sentence since unit 1, so every lesson has plenty of sentence work (*að* alone has 144 readable sentences).
- **Three more tag fixes** (`content/tag-fixes.json`), found by reading the generated lessons: *Sá* in *Sá einhver hvað gerðist?* is the past of *sjá*, not the pronoun *sá*; *þeir* in *Eru þeir bræður?* and *þau* in *Hvaða tungumál tala þau í Kóreu?* are the personal pronouns "they", not the demonstrative *sá*. The parser had read all three as *sá*, so lesson 4 taught them as "that".
- Guidebook, six sections, every form from the DMII Core and every example from Tatoeba:
  - **Must and may.** *verða að* and *þurfa að*; *mega* with the bare infinitive (*Má ég fara með þér?*, *Hann má koma*). Wiktionary lists "may, be allowed" and also "must" for *mega*, and Bokmålsordboka lists permission as well as necessity for *måtte*, so the note says that Norwegian *må* usually means must and Icelandic *má* usually means may.
  - **þessi, þetta, sá.** *þessi*, *þetta*, *þennan*, *þessa* (DMII Core); *þetta* introducing a plural (*Þetta eru fallegar myndir*, Tatoeba); *sá sem*.
  - **hver, hvaða.** *hver, hvern, hverjum, hvers* (DMII Core); *hvaða* has the same form in every slot of its DMII Core paradigm.
  - **allur, enginn, einhver.** Agreement, and the neuter plural for a mixed group (Wikipedia: "the neuter for either an all neuter or a mixed-gender group"; *Þið hafið öll staðið ykkur vel*).
  - **að, sem, ef.** *að* as both "that" and the infinitive marker (Wikipedia, Wiktionary), compared with Norwegian *at* and *å*.
  - **The two líka.** The adverb and the verb with a dative subject (Wiktionary *líka*: "strict dative-nominative verb"); *aftur* "again" and "back"; *bara*.
- **Faster checks while making a unit:** `node tests/smoke.mjs --unit=grammar` plays only that unit's lessons, and `node scripts/visual-qa.mjs --only=guide-grammar` checks only the named screens, including their 320 px overflow. The full `npm run smoke` and `npm run qa` still run before each commit.

### Tests

- `node --test`: 112 tests (new: the seven lessons of unit 9, and the *Sá* and *þeir* tag fixes among the homograph regressions).
- `npm run smoke`: every lesson of units 1 to 9. `npm run qa`: the unit 9 guidebook at three sizes.

## Hand-made units: unit 8, Study and work (2026-11-23)

### Unit 8, *Vinna*

- Five lessons and a review: At school, Languages, Questions and answers, Easy or difficult?, At work (27 words). This theme has many sentences (*bók* 27, *kennari*, *hjálpa* and *vinna* 15 each); only the language words *íslenska*, *norska*, *íslenskur* and *norskur* have none, so lesson 2 is mostly word exercises around *enska* and *tungumál*.
- *vinna* the noun and *vinna* the verb are taught in the same lesson; the sentence tags keep them apart.
- **New rules `hjálpa` and `loka`:** both verbs take a dative object (*hjálpa* "[with dative]" in Wiktionary; *Lokaðu dyrunum*, *Lokaðu bókinni* in Tatoeba). A verb rule applies only when no preposition before the word explains its case.
- Guidebook, four sections, every form from the DMII Core and every example from Tatoeba:
  - **tala íslensku.** Languages are feminine nouns in -a with a small letter; accusative after *tala* (*Hann talar ensku*, *Hún talar góða ensku*); *á ensku*; the adjectives *íslenskur*, *norskur*.
  - **Four ways to know.** *vita* a fact, *þekkja* a person, *kunna* a skill (Wiktionary: "to know (by heart), know a skill"; "can: to know how to"), *geta* with the supine (Wiktionary's usage note: "Geta requires the supine (sagnbót) form of an accompanying verb, rather than the bare infinitive"); *veit* and *kann* (DMII Core).
  - **Objects in the dative.** *hjálpa*, *svara*, *loka* against *opna*: *Lokaðu dyrunum*, *Opnaðu dyrnar* (Tatoeba).
  - **The past.** *skrifaði*, *hlustaði*, *hugsaði*, *lærði*, *keypti*, and the strong *las*, *vann*, *sá* (DMII Core); *vinna* is both "work" and "win" (Wiktionary; *Þú vannst!*).
- A guidebook table can now show a verb in the past: `"tables": [{ "lemma": "vinna_so", "tense": "ÞT" }]` (a plain lemma id still shows the present). The section on the past shows *vann, vannst, vann, unnum, unnuð, unnu*.
- The guidebook prose and the lesson grouping are listed in `content/NEEDS-NATIVE-REVIEW.md`.

### Tests

- `node --test`: 105 tests (new: the six lessons of unit 8, and *Lokaðu bókinni* among the hint regressions).
- `npm run smoke`: every lesson of units 1 to 8. `npm run qa`: the unit 8 guidebook at three sizes.

## Hand-made units: unit 7, Weather and nature (2026-11-23)

### Unit 7, *Veður*

- Four lessons and a review: Rain and snow, Outside and inside, Look and listen, Iceland's nature (21 words). Each grouping was run through the generator and its exercises read.
- This theme has the fewest sentences: *veður*, *sjór*, *ský*, *jökull*, *foss*, *eldfjall* and *norðurljós* have none a learner can read (*Veðrið er svo gott!* needs *svo*, which is not a course word). The words with many sentences (*mjög*, *sjá*, *heyra*, *úti*) are placed with them, and *sjá* is put third in lesson 4 so that its first exercises read sentences (the generator starts each word at a point in its cycle that follows the word's place in the lesson).
- **New rule `á-horfa`.** *Horfðu á þetta fjall* got the hint "á takes the accusative for movement"; the accusative comes from *horfa á* (look at, watch), as in *horfa á sjónvarpið*. Rules can now name verbs (`verbs` in `content/case-rules.json`): such a rule applies only after one of them, and rules with a condition are tried first.
- Guidebook, five sections, every form from the DMII Core and every example from Tatoeba:
  - **The empty *það*.** *Það rignir*, *Það snjóar*, *Það er kalt*, *Það er vindur í dag*; *það* holds only the first place and is left out when another word comes first: *Skyndilega rigndi* (Tatoeba), where Norwegian keeps *det*.
  - **Dative for how one feels.** *Mér er kalt*, *Er þér alltaf kalt?* against *Það er kalt*; *líka* with the dative: *Okkur líkar ekki við rigningu*, *Líkar þér svartir kettir?* (Tatoeba).
  - **Place and direction.** *úti* and *út*, *inni* and *inn*, *heima* and *heim*, compared with Norwegian *ute*/*ut*, *inne*/*inn*, *hjemme*/*hjem*: *Hún er úti núna*, *Við gátum ekki farið út sökum rigningarinnar*, *Ég verð heima í dag*, *Pabbi kom heim fyrir um tíu mínútum*, *það er kalt hérna inni*.
  - **sjá, horfa, heyra.** *sé, sérð, sér, sá* (DMII Core), *Sjáumst*; *horfa á* with the accusative; *heyra* with a thing in the accusative (*Hann heyrði það*) and *heyra í* with a person in the dative (*Ég heyri í þér*).
  - **Nature words.** *eldfjall* from *eldur* and *fjall*, *norðurljós* from *norður* and *ljós* (Wiktionary etymologies); the Norwegian relatives are the pairs in `data/bridge.json` with a shared Old Norse word in both Bokmålsordboka and Wiktionary (*vær*, *fjell*, *foss*, *jøkel*, *sky*, *sol*, *vind*).
- The guidebook prose and the lesson grouping are listed in `content/NEEDS-NATIVE-REVIEW.md`.

### Tests

- `node --test`: 99 tests (new: the five lessons of unit 7, and *Horfðu á þetta fjall* among the hint regressions).
- `npm run smoke`: every lesson of units 1 to 7. `npm run qa`: the unit 7 guidebook at three sizes.

## Hand-made units: unit 6, Shopping (2026-11-23)

### Unit 6, *Búð*

- Six lessons and a review: In the shop, How much is it?, Old and new, Clothes, Colors, With and without. As for unit 5, every grouping was run through the generator and its exercises read.
- The words with many sentences (*eða*, *gamall*, *fallegur*, *peningur*, *með*, *af*) are spread over the lessons. The price words have almost none: *verð*, *króna* and *þúsund* have no sentence a learner can read here, and *Það er of dýrt!* needs *of* ("too"), which is not a course word. So lesson 2 is mostly word exercises, with *Hvað kostar það?*. *dýr* in the data is mostly the noun "animal" (*Ég keypti bók um dýr*), which the sentence tags keep apart.
- *með*, *án* and *af* come last, when *kaupa*, *nýr* and *kjóll* are known (*Mamma mín keypti mér nýjan kjól*).
- Guidebook, five sections, every form from the DMII Core and every example from Tatoeba:
  - **Colors agree with the noun.** *Bíllinn minn er rauður*, *Hún er hvít*, *Eplið er rautt*, plural *rauðir*; the neuter in -t as in Norwegian (*rautt*, *blátt*, *grænt*, *gult*, *hvítt*, *svart*: FSB-HK-NFET in the DMII Core), and the feminine *svört*.
  - **Weak adjectives.** *gamli maðurinn*, *gamla bílinn*, *litli bróðir minn* (Tatoeba), against strong *nýjan bíl*, *grænn fiskur*; the Norwegian text compares *den gamle mannen*.
  - **Comparison.** *fallegri*, *dýrari*, and the irregular *eldri, elstur*, *yngri, yngstur*, *stærri, stærstur*, *minni, minnstur* (MST and ESB forms in the DMII Core), the same words that are irregular in Norwegian; *Mamma er eldri en pabbi*.
  - **Buying, selling, giving.** *Hvað kostar þetta?*; *keypti*, *seldi*; the person in the dative and the thing in the accusative (*Ég keypti henni nýjan bíl*, *Hún seldi honum bílinn sinn*, *Hann gaf mér pening*); *tvö þúsund bækur*, *fimm hundruð ára*.
  - **með, án, af.** *með* with the dative for company (*með vinum sínum*) and the accusative for what one brings or has (*Farðu með mig til Tom*, *Ég er ekki með peninga á mér*); *án* with the genitive (*með eða án sykurs*); *af* with the dative (*flaska af víni*, *Af hverju?*).
- The guidebook prose and the lesson grouping are listed in `content/NEEDS-NATIVE-REVIEW.md`.

### Tests

- `node --test`: 94 tests (new: the seven lessons of unit 6).
- `npm run smoke`: every lesson of units 1 to 6. `npm run qa`: the unit 6 guidebook at three sizes.

## Four voices to choose from (2026-11-23)

### Owner decisions (2026-11-23)

1. **Voices:** all four generated voices are offered, and the learner chooses one when they start.
2. **Local only:** no GitHub Pages and no publishing workflow until the owner says the site goes public.
3. **No outside review:** nobody is contacted. Questions about Icelandic are settled with online sources and dictionaries (BÍN, Wiktionary, Tatoeba and the like), cited where they are used. `content/NEEDS-NATIVE-REVIEW.md` stays as the list of hand-written claims.

### What was built

- All four Piper voices are rendered: `npm run build:audio -- --voice <id>` for `steinn`, `salka`, `bui` and `ugla`, 2,109 files each (every course word, minimal-pair word and sentence): Steinn 11.5 MB, Salka 12.3 MB, Búi 11.1 MB, Ugla 10.3 MB, so `data/audio` holds 45 MB of MP3 files instead of 11.5 MB. The brief's 20 MB budget for `/data` no longer holds; a learner still downloads only the voice they use, because generated audio is fetched when played, and "Download all audio" in Settings fetches only the chosen voice and removes the other voices' files from the cache.
- First visit: the Learn page shows a "Choose a voice" card above the path, with the four voices, a sample to play for each (the first sentence of the comparison set) and a radio button. The choice is the `ttsVoice` setting; until then Steinn plays, as before. While the card waits, the page does not scroll down to the current lesson (on a phone that hid the card). Once a voice is chosen the card does not come back.
- Settings has the same chooser (`js/ui/voice-picker.js`), with the voice in use marked, and the Voices page has a "Use this voice" button on each voice's card.
- `js/audio.js`: `TTS_VOICES`, `ttsVoice()`, and one manifest per voice, loaded when first needed. The service worker precaches the four manifests (about 270 KB each); the MP3 files are cached when played, as before.
- The setting is part of progress export and import, like the other settings.

### Tests

- `npm run smoke`: a first visit shows the card, a sample plays, choosing Ugla is kept after a reload, the card is gone, and story line audio then comes from Ugla's files.

## Hand-made units: unit 5, Time (2026-11-23)

### Unit 5, *Tími*

- Six lessons and a review: What time is it?, Days of the week, Week and weekend, Always and never, Seasons and years, Before and after. The 35 words were grouped by running the generator over each grouping and reading every exercise it produced (a scratch evaluator, as for units 3 and 4).
- All seven days are one lesson. Tatoeba has a sentence the learner can read for only three of them (*mánudagur*, *laugardagur*, *sunnudagur*), so the lesson is mostly word exercises (listening, meaning, a table), with *á sunnudaginn* for the case work. The seasons lesson is the same: *sumar*, *vetur* and *haust* have no sentence a learner of unit 5 can read, *vor* has *Vorið kom*.
- *um* is taught with *helgi* (lesson 3), and *fyrir* and *eftir* last, when *ár*, *mínúta* and *klukkutími* are known (*fyrir tveimur árum*).
- *snemma* and *seint* are taught partly through their comparatives: the DMII Core lists *fyrr*, *fyrst* and *seinna*, *seinast* as their forms, and Tatoeba has *Þú hefðir átt að koma fyrr* and *Ég tala við hana seinna*. The guidebook explains the comparison.
- Guidebook, five sections, every form from the DMII Core and every example from Tatoeba:
  - **What time is it?** *Hvað er klukkan?*, *Klukkan er fimm*, *Hún er tuttugu mínútur yfir þrjú*, *korter í þrjú* (the DMII Core spelling; Wiktionary has *kortér*), *hálf tíu* (half past nine), and *klukkan* that keeps its form after a preposition: *til klukkan fimm* (Tatoeba), where *til* otherwise takes the genitive. Sources: Wiktionary's phrase entry *klukkan* (*Ég kem klukkan þrjú*, *Klukkan er kortér yfir þrjú*), *kortér* (*klukkan er kortér í þrjú*, "a quarter to three") and *frekur* (*um hálf tíu*, "about half past nine").
  - **The days of the week.** Written with a small letter; *þriðjudagur*, *miðvikudagur*, *fimmtudagur* and *föstudagur* are "third day", "mid-week day", "fifth day" and "fast day" (Wiktionary etymologies), *sunnudagur* and *mánudagur* the sun's and the moon's day. *á sunnudaginn* (one particular Sunday) and *á sunnudögum* (every Sunday); Tatoeba has both. *laugardagur* is not explained: Wiktionary gives only "From Old Norse laugardagr".
  - **í, á and um in time expressions.** *í viku*, *í tíu mínútur*; *í dag*, *í kvöld*, *í sumar*; *á veturna*, *á haustin* (accusative plural with the article in the DMII Core); *um helgar*, *um tíma*; and the dative with *hver*: *á hverjum degi*, *í hverri viku*. All from Tatoeba.
  - **fyrir, eftir, þegar.** *fyrir tveimur árum* against *Takk fyrir matinn* and *fyrir kvöldmatinn*; *eftir matinn*, *eftir klukkutíma* against *bíða eftir honum*; *hvenær* asks, *þegar* joins two sentences. The Norwegian text compares *takk for maten*.
  - **Always, never, early, late.** Adverbs of frequency right after the verb, *aldrei* in the place of *ekki*, *snemma, fyrr, fyrst* and *seint, seinna, seinast*, and *Betra er seint en aldrei*.
- The guidebook prose and the lesson grouping are listed in `content/NEEDS-NATIVE-REVIEW.md`.

### Tests

- `node --test`: 87 tests (new: the seven lessons of unit 5, with the checks of the case and its rule).
- `npm run smoke`: every lesson of units 1 to 5. `npm run qa`: the unit 5 guidebook at three sizes, 0 axe violations, no horizontal scroll at 320 px.

## The case of a word comes from the parser (2026-11-23)

Planning unit 5 showed a wrong "why this case?" hint (*Ég var í viku hjá frænda mínum*: "í takes the accusative for movement"). A check of every case and ending exercise in every lesson found three causes.

### What was wrong

- **The first case in the paradigm.** A form such as *kaffi* can be three cases (NF, ÞF, ÞGF). An ending exercise named the first one, so *Er hann að drekka kaffi?* explained *kaffi* as nominative. 19 exercises named the wrong case: accusative objects called nominative (*te*, *kaffi*, *mjólk*, *kjötið*, *sykur*, *skeið*, *strætó*, *land*, *buxurnar*, *fjall*, *orðin* and others), and datives called accusative (*með súpu*, *Systir mín er í vinnu*). The same tag names the learner's form card in spaced repetition, so that practice was filed under the wrong form.
- **Spelling instead of the word.** A preposition rule fired on the spelling of the word before: *á* in *Ég á dóttur*, *Hann á fjóra farsíma* and *Ég á bókina* is the verb *eiga*, but the hint said "á takes the accusative for movement".
- **Time is not movement.** *í viku* (for a week), *í fjóra daga* and *á sunnudaginn* got the movement rule. In all, 8 hints were wrong.

### What changed

- `scripts/tag-icelandic.py` (tagger v3) also writes the case Greynir gives each noun, pronoun, adjective and numeral, and which sentence of a text each word is in. `data/tags.json` has a new `cases` map: one letter per word (n, a, d, g, or -). It grows from 18 to 26 KB gzipped.
- Two readings are not kept:
  - the case in a sentence without a verb (*Góða nótt.*, *Bjór, takk.*): the case comes from a verb that is left out, and the parser guesses the nominative. *Góða nótt* is the accusative: *góða* is the strong accusative or the weak nominative (DMII Core), and the strong nominative would be *góð nótt*;
  - a dative for a meal after *í*, *eftir* or *fyrir* (*fisk í kvöldmat*, *eftir kvöldmat*): wherever the form shows the case, Tatoeba has the accusative there (*eftir matinn*, *fyrir kvöldmatinn*, *fyrir morgunmatinn*: 14 sentences, no dative).
- `content/tag-fixes.json` corrects the parser by hand: *sé* in *Ég sé það* and *Ég sé það ekki* is *sjá* ("see"), not the subjunctive of *vera*. A fixed sentence keeps no cases. The two sentences had been used in unit 1 as if the learner knew every word.
- The generator takes a form's case from the parser (`caseTarget` in `js/engine/generate.js`). A form that can be several cases is used only when the parser decided, and the parser never chooses the number (in *Góða nótt mamma* it reads *mamma* as a genitive plural). The case question still asks only about forms with one case.
- A preposition rule applies only when the word before the phrase is that preposition according to the tags. The phrase includes the words before the target that the parser gives the same case (*fyrir tveimur árum*).
- New rules, all with examples from Tatoeba. Time rules apply only when the word or the next one is a time noun (`nounGroups` in `content/case-rules.json`), and are tried first:
  - *í*, *á* and *um* with the accusative: *í dag*, *í sumar*, *í viku*; *á sunnudaginn*, *á veturna*; *um helgar*, *um tíma*;
  - *í* and *á* with the dative: *í hverri viku*, *í síðasta mánuði*; *á sunnudögum*, *á hverjum degi*;
  - *eftir* with the accusative for a time (*eftir matinn*, *eftir klukkutíma*) and the dative otherwise (*bíða eftir honum*, *á eftir laugardegi*);
  - *fyrir* with the dative for "ago" (*fyrir tveimur árum*) and the accusative otherwise (*fyrir mig*, *fyrir kvöldmatinn*).
- *tími* is not a time noun for *í*: *í tíma* is usually a class (*Hann kemur ekki í tíma á morgun*), so the place and movement rules explain it.
- The story reader's word panel shows the case a word has in its sentence, when the parser decided it.
- Saved progress is not migrated: a form card filed under the wrong case keeps its history, and new practice goes to the right card.

### Tests

- `node --test`: 80 tests (new: the parser's case and the readings not kept, eleven hint regressions, the *sé* fix, and for every case and ending exercise in every lesson: the case named is the parser's or the form's only case, and a preposition rule has that preposition before the phrase).

## Hand-made units: unit 4, Getting around (2026-11-05)

### Unit 4, *Gata*

- Eight lessons of six words and a review: In town, Places, Getting there, To and from, Where?, Left and right, Sights, North and south. *í* and *á* come in lesson 1, because almost every sentence about a place needs them.
- Guidebook, four sections:
  - **Where or where to: í and á.** Dative for a place, accusative for a direction: *í bílnum* and *í bílinn* (the DMII Core forms ÞGFETgr and ÞFETgr of *bíll*). Which preposition a place takes is learned with the word: *í skóla*, *í búð*, *í banka*, but *á sjúkrahúsi*, *á hóteli*, *á safni*; Tatoeba has *Hann vinnur í banka*, *Við gistum á hóteli við vatnið*, *Það er mjög áhugavert að fara á safn*, *Við ættum að senda Jordan á sjúkrahús*.
  - **til, frá, úr.** *til* with the genitive (*til Íslands*, *til flugvallarins*), *frá* and *úr* with the dative, *hjá* with the dative (*Ég mun búa hjá frænda mínum í mánuð*), and the pairs *í* and *úr*, *á* and *af*, *til* and *frá*.
  - **hvar, hvert, hvaðan**, with *hér* and *þar* for places and *hingað* and *þangað* for directions; the Norwegian text compares *hit* and *dit*.
  - **Directions in the imperative.** Stem plus the clitic *þú*: *farðu*, *beygðu*, *bíddu*, *taktu*, *gakktu* (all GM-BH-ET forms in the DMII Core), then *til hægri*, *til vinstri*, *beint* and the compass points (*keyrðum norður*).

### Loose words

- Unit 4 showed a gap in the sentence tags: prepositions used as adverbs or particles were accepted as the preposition, so *Við erum öll til* ("we're all ready") was chosen to teach *til* ("to").
- The tags now mark such words as **loose** (`scripts/lib/tags.mjs`): a preposition as an adverb or particle (*búa til*, *vera til*), *að* as a preposition, and *einn* or *annar* as a pronoun or adjective (*Hann býr einn*, "he lives alone"). A loose word counts as known, so its sentence can still be read, but the sentence is never used to teach that word. 104 words are loose; *til* is now taught with *Velkomin til San Francisco*.
- In `data/tags.json` a loose word is stored as -2 minus its lemma index; `tagsOf` returns it as `"~"` plus the lemma id. The story panel shows a loose word as that word.

### Excluded sentences

- Reviewing generated lessons turned up a Tatoeba sentence that must not appear in a course: *Ég elska litlar stelpur* ("I love little girls"). A scan of every sentence's English translation for sensitive words found three more that are unsuitable for beginners: "War is fun.", "Nazis are marching in the streets.", "There were two murders this month."
- `content/sentence-exclude.json` lists them with a reason. `js/data.js` removes them from the exercise pool and from `sentence()`, so they appear nowhere: not in exercises, examples, the dictionary or stories. `validate-content` fails if a guidebook or story uses one, and the generator test checks that no exercise does.
- Sentences about beer and wine stay: they belong to the café unit's vocabulary (*bjór*, *vín*).

### Tests

- `node --test`: 77 tests (new: unit 4's lessons, loose words in the rule tests, *Við erum öll til* as a regression, no excluded sentence in any exercise).
- `npm run qa` caught a bug in this change before it shipped: the exclusion list was read into the wrong slot of `Promise.all` in `loadAll`, which broke every page that loads all the data.

## Hand-made units: unit 3, Family (2026-11-04)

After the planned phases, the preview units are being made by hand, one at a time, like units 1 and 2.

### Unit 3, *Fjölskylda*

- Seven lessons and a review: My family, Brothers and sisters, Grandparents and relatives, Men and women, Friends and pets, Having and living, Age and counting. *minn* and *þinn* are taught in lessons 1 and 2, because most family sentences use them (*bróðir minn*, *systir þín*); *eiga*, *búa*, *sinn* and *sig* come together in lesson 6.
- Guidebook, five sections, every form taken from the DMII Core paradigms and every example from Tatoeba:
  - **Family words in -ir.** *faðir*, *móðir*, *bróðir*, *systir*, *dóttir*: every singular case but the nominative ends in -ur; four change their vowel in the plural (*feður*, *mæður*, *bræður*, *dætur*), *systir* does not (*systur*). Checked against the five paradigms. The Norwegian text compares *bror, brødre* and *datter, døtre*.
  - **Possessives after the noun.** *pabbi minn*, *mamma mín*, *barnið mitt*; most nouns take the article first (*kötturinn minn*), family words usually do not (*bróðir minn*), where Norwegian says *broren min*. *hans* and *hennar* do not inflect. The Tatoeba data agrees: *Hann er bróðir minn*, *Hún er systir mín*, *Þetta er kötturinn minn*, *Þetta er húsið hennar*.
  - **sinn and sig.** Reflexive possession as in Norwegian *sin, si, sitt*: *Hún hringdi í dóttur sína* against *Hann sér hundinn hennar*.
  - **eiga and búa.** *Ég á dóttur*; the present of *eiga* is irregular (*á, átt, á, eigum*); the object is accusative. *búa*: *bý, býrð, býr*.
  - **Age.** *Hún er átta ára* (*ára*, genitive plural of *ár*), and *gamall* or *gömul* agreeing with the person.
- The guidebook prose and the lesson grouping are listed in `content/NEEDS-NATIVE-REVIEW.md`.
- A new test checks that a hand-made unit teaches every word of its theme exactly once, so no word is dropped when units are regrouped. The smoke test now plays every lesson of every hand-made unit, read from the unit files.

### Sentence tags: telling homographs apart

Looking at the generated unit 3 lessons showed exercises that taught the wrong word. The generator found a word in a sentence by spelling, and only course words were known, so:

- *afar* in *Það var afar heitur dagur* ("very") was treated as the plural of *afi* and asked as a case question;
- *sinni* in *einu sinni* ("once") was treated as a form of the possessive *sinn*;
- *sér* in *Hann sér hundinn hennar* ("sees") was used to practice the reflexive *sig*.

The fix is a build step, not a word list:

- `scripts/tag-icelandic.py` runs the Greynir parser (`reynir`, MIT, Miðeind; already installed with GreynirCorrect) on every sentence. `scripts/build-tags.mjs` (`npm run build:tags`, cached in `.cache/greynir/tags.jsonl`) lines the parser's tokens up with the app's words and writes `data/tags.json` (55 KB, 18 KB gzipped): for each word of each sentence, the course word it is there, -1 for another word or a name, or null when undetermined.
- A word counts as a course word only when the parser's word class and lemma agree with it. A few differences are conventions and are accepted (`scripts/lib/tags.mjs`, tested in `tests/tags.test.mjs`): the parser's lemma is itself a DMII Core form of the word (*þér* for *þú*, *hvað* for *hver*), past participles used as adjectives (*farinn*), adverbs that are the neuter of an adjective (*seint*), prepositions used as adverbs (*til*, *um*), interjections (*já*, *bless*), compass directions and sides as nouns (*norður*, *vinstri*), and *einn* or *annar* as numeral, pronoun or adjective. Multiword idioms (*einu sinni*, *á morgun*, *undir eins*) are left undetermined; amounts and times (*klukkan sjö*, *fimm hundruð*) keep their words.
- Result: 1,764 sentences, 96.8% parsed; of 8,756 words, 7,445 are course words, 1,134 other words or names, and 177 undetermined. 221 words that spelling would have given to a course word are another word in their sentence, for example *mun* ("will", from *munu*, not *muna* "remember") 20 times, *myndir* ("pictures"), *ferð* ("a trip", not *fara*), *fundinn* ("the meeting"), *tala* in *Aldur er bara tala* ("a number", not "to speak"), *þegar* ("already").
- The generator uses the tags (`tagsOf` in `js/data.js`): a sentence contains a word only where it is tagged so; a learner knows a word only when its tag is a word they have met; case targets, word-bank distractors and verb-rule hints use the tagged word. Sentences without tags keep the spelling rule. The mix of exercise types barely changes (over all units: 182 instead of 186 ending exercises, 51 instead of 47 case exercises).
- The parser is sometimes wrong (*á* in *Slökktu á útvarpinu* as the noun "river"). Such an error only removes a sentence from use; it cannot create a wrong exercise.
- The story reader's word panel uses the tags too: a tapped word shows the word it is in that sentence, and a word that is no course word there (*meira* in *Mætti ég fá meira kaffi?*, the adjective, not the adverb *mjög*) shows "no details" instead of a lookalike.
- `npm run check` fails when `data/tags.json` does not match `data/sentences.json`; after `npm run build:data`, run `npm run build:tags`.

### Fixed

- At 320 px the Learn path scrolled sideways when a long lesson title ("Grandparents and relatives") sat on a node shifted far to the side. A label's maximum width now shrinks with its node's offset, so it wraps instead.

### Tests

- `node --test`: 68 tests (new: the tag rules, three homograph regressions, every case target tagged as its word, every exercise sentence containing its word, each hand-made unit covering its theme).
- `npm run smoke`: all 22 lessons of units 1 to 3, the drills, offline, speaking and stories.
- `npm run qa`: 0 axe violations, no page errors; the 320 px overflow above was found here and fixed.

## Phase 7: new words, old roots (2026-11-04)

- **Unit 10, *Nýyrði***: twelve modern words that Icelandic built from its own parts instead of borrowing: *sjónvarp*, *útvarp*, *flugvél*, *farsími*, *tölvupóstur*, *forrit*, *tækni*, *rafmagn*, *þota*, *veira*, *hátalari*, *reikistjarna*. All twelve are in the DMII Core and their Wiktionary glosses match; the data now has 337 words.
- **Sources**: every claim in the guidebook retells a Wiktionary etymology (the guidebook says so, CC BY-SA 4.0). For example *tölva*: "A portmanteau word, coined by Sigurður Nordal in 1965 from tala ("number") + völva ("prophetess")"; *tækni*: "Coined by Dr. Björn Bjarnason from Viðfjörður in 1912"; *veira*: "Said to be coined by Director General of public health Vilmundur Jónsson in 1955"; *reikistjarna*: "Coined by Jónas Hallgrímsson, from reika ("to wander") + stjarna ("star")"; *rafmagn*: "From raf ("amber") + magn ("power"), calquing the internationalism electricity". Where Wiktionary hedges ("said to be"), the guidebook hedges too. Every Icelandic fragment is checked against the DMII Core by `validate-content`, and the unit is listed in `content/NEEDS-NATIVE-REVIEW.md`.
- Three of the words (*rafmagn*, *þota*, *hátalari*) have no Tatoeba sentence; their lessons use word exercises. The generator test now covers unit 10 too.
- None of the twelve has a Bokmål relative in the bridge, as expected for native coinages (Norwegian uses *fjernsyn*, *fly*, *datamaskin*).
- Audio for the new words and sentences was generated (2,109 texts, 11.5 MB); `/data` is 13.0 MB in all.
- Long forms such as *flugvélarinnar* overflowed a compact table at 320 px. Table cells may now wrap, and a line-break opportunity is placed where a form extends the indefinite form of the same row (*flugvélar* + *innar*), which is where the suffixed article starts.

### Phase 7 items not built

- **AI conversation practice**: skipped by the owner's decision (no LLM features, no keys).

## Phase 7: Norwegian bridge (2026-11-04)

### Licence

Checked on the University of Bergen's licence page for the dictionaries: "Bokmålsordboka og Nynorskordboka er gjevne ut under Creative Commons Namngjeving 4.0 Internasjonal (CC-BY 4.0)", and "Lisensen gjeld òg for data som vert henta gjennom API-et". Required credit: "Bokmålsordboka/Nynorskordboka, Universitetet i Bergen og Språkrådet, ordbøkene.no, CC-BY 4.0". It is shown on the bridge page and in Credits, and listed in `data/LICENSE.md`. (Store norske leksikon still lists an older CC BY-NC-SA 3.0; the owners' own page is authoritative.)

### What was built

- `scripts/build-bridge.mjs` writes `data/bridge.json` (24 KB). For each course word it looks up its Bokmål glosses from Wiktionary and two spellings made by the correspondence rules in Bokmålsordboka (1,396 requests, cached, 150 ms apart). Evidence, strongest first:
  - **old-norse** (156 words): Bokmålsordboka's etymology and Wiktionary's etymology of the Icelandic word name the same Old Norse word (compared with and without length marks, because conventions differ: *hón*, *hon*). Only these link to a specific Bokmålsordboka article.
  - **loan** (5): both languages borrowed the word, and Wiktionary names the source (*kaffi*, *kaffe*: Italian *caffè*).
  - **form** (8): a Bokmål gloss with the same meaning whose spelling the rules explain, without a shared origin in the sources. Labeled "a shared origin is not confirmed".
- The Bokmål article must have a compatible word class, so a homograph from the same Old Norse word is not taken (*sá* "that" is not paired with *så* "to sow").
- `js/bridge-rules.js`: 19 spelling correspondences (þ to t, ð to d or nothing, á to å or a, accent loss, ö to ø or o, au to ø, the endings -ur and -r dropping, -i and -a becoming -e, consonant doubling). `explain()` finds the smallest set of rules that turns the Icelandic word into the Bokmål one: 79 pairs are explained by the rules and 13 are spelled the same; the other 77 (for example *vatn* and *vann*) are shown as "other changes".
- `bridge.html`: the patterns with counts and an example each (pick one to filter), and every pair with its evidence, its patterns and a link to Bokmålsordboka. Linked from Practice and from each dictionary entry ("Norwegian relative").
- `lesson.html?mode=bridge`: see the Bokmål word and its meaning, type the Icelandic word; the feedback names the shared origin and the patterns. Only sourced pairs that the patterns explain are practiced, words met so far first. Answers count for the word's meaning card in spaced repetition.

### Tests

- `node --test`: 49 tests (new: rule explanations, and that every pair in `data/bridge.json` belongs to a course word and carries its evidence).
- `npm run smoke`: a full bridge practice round. `npm run qa`: the bridge page, a filtered pattern, the exercise, its feedback and a dictionary entry with its relative; 0 axe violations, no horizontal scroll at 320 px.

## Phase 6: speaking (2026-11-04)

### Is there a usable recognizer?

- No free Icelandic speech recognizer can run inside a static site. Open Icelandic ASR models exist (for example the Language and Voice Lab's wav2vec2 and Whisper fine-tunes on Hugging Face), but they are hundreds of megabytes and need a server or a heavy WebAssembly runtime, against the static, under-20 MB design.
- The browser's Web Speech API accepts `lang = "is-IS"`. Chrome and Edge recognize through their makers' online services; Safari's support for Icelandic is unknown. Newer Chrome can also report and use on-device recognition (`SpeechRecognition.available` with `processLocally`). In Chromium 156 the on-device answer for `is-IS` is "unavailable" and the online answer "available".
- Decision: build speaking practice on the Web Speech API, **experimental and off by default**. Settings says plainly that the voice may be sent to the browser maker's service, and the on-device recognizer is used whenever the browser offers it.

### What was built

- `js/speech.js`: support check (on-device, online service, or none) and a one-shot listener with up to five alternatives and interim text.
- Speaking practice (`lesson.html?mode=speak`, a Practice card shown only when the setting is on and the browser has a recognizer): eight short sentences (two to six words) made of words the learner has met, each with audio and translation. The learner taps the microphone and speaks; the best alternative is matched to the sentence word by word, in order (`matchWords` in `js/normalize.js`), and the sentence shows which words were heard.
- **"Did we understand you?"** Recognizers mishear learners, so a match below 80% is never graded until the learner either confirms "Yes, that is what I said" or tries again. Grading: 80% or more correct, 50% or more almost, otherwise wrong. Speaking gives XP but creates no spaced-repetition cards, because a recognizer error should not schedule a word.
- Recognizer errors (microphone blocked, no connection, language not supported) show a plain message instead of failing silently.

### Decisions and fixes

- `SpeechRecognition.available({ processLocally: true })` crashes the renderer of headless Chromium 156 (headed Chrome answers it). The support check therefore runs only after the learner turns speaking on, never on a plain visit, and the tests replace the recognizer with `tests/helpers/fake-speech.mjs`.
- Speaking is a practice mode, not part of regular lessons, so a learner who cannot or will not speak loses nothing.

### Tests

- `node --test`: 45 tests (new: word matching for transcripts).
- `npm run smoke`: with the stand-in recognizer, a poor match shows the confirm step and keeps Check disabled; then a full speaking round completes.
- `npm run qa`: shots of the speaking exercise, the confirm step and the result. 0 axe violations, no horizontal scroll at 320 px, no page errors.

## Phase 5: motivation, offline and polish (2026-11-04)

### What was built

- **XP, streak and daily goal from real progress.** The HUD, the desktop sidebar and the profile read IndexedDB; the Phase 1 demo values are gone. A lesson gives 10 XP per correct answer and 5 per almost-right one; the case trainer gives 2 XP per correct cell. The daily goal (10, 20, 50 or 100 XP, default 20) is set in Settings.
- **Streak with freezes** (`js/stats.js`, pure and unit-tested). A day counts when it has any XP, in the learner's local calendar. One freeze is earned for every seven days of streak, at most two held. On page load, freezes cover the missed days only if there are enough of them for the whole gap; otherwise the streak ends and the freezes are kept. Frozen days keep the streak alive without adding to it.
- **Badges**: first lesson, 3- and 7-day streaks, a perfect lesson, a finished unit, 100 correct forms, a round of sound practice and 1000 XP. Lesson completion and the case trainer announce the daily goal, a longer streak, a new freeze and new badges.
- **Weak spots**: the sidebar mini heatmap now shows the learner's own accuracy by case and number (a cell needs three answers); the practice page and the sidebar share one implementation.
- **Hearts** (Settings, off by default): five per lesson, one lost per wrong or skipped answer; at zero the lesson ends with a retry and a link to the mistakes. Answers given before that are still saved for spaced repetition.
- **Export, import and reset** on the profile page: one JSON file with settings, progress, spaced-repetition cards, mistakes and the attempt log (`app: "tolva"`, `version: 1`). Import checks the file and asks before replacing anything; reset asks too.
- **Offline and installable.** `sw.js` precaches every page, script, style, icon, content file and data file (1.9 MB, 119 files) under a version hashed from their contents, and deletes old versions on activation. When a new version is waiting, the page offers a reload. Generated audio goes into a separate cache as it is played, and Settings can download all of it (11.2 MB); byte-range requests from audio elements are answered from the cache. Human recordings stay on Wikimedia Commons and are not cached; offline, the player falls back to the generated file. `manifest.webmanifest` (theme and background #1A1A2E, start at the learn path) with 192 and 512 px icons, a maskable icon and an Apple touch icon rendered from Tala's head.

### Decisions

- `sw.js` is generated, and `npm run check` fails when it is stale, so a deploy can never ship old cached files under a new site.
- Cache-first for the site, because the cache version changes with the content. The audio cache is not versioned: its file names are hashes of the text, so a file never changes meaning.
- Practice rounds (review, mistakes, letters, sounds) give XP but do not count as lessons for "lessons done".
- Streak days use the local date. Progress saved before this phase used UTC dates; the difference is at most one day at the edges.

### Performance (local server, cold cache, no service worker)

| Page | Files | Raw | Gzip |
|---|---|---|---|
| Landing | 23 | 156 KB | 47 KB |
| Learn path | 39 | 348 KB | 107 KB |
| Lesson | 68 | 1.3 MB | 270 KB |
| Story reader | 60 | 1.5 MB | 327 KB |
| Dictionary | 44 | 1.2 MB | 251 KB |

GitHub Pages serves gzip. Most of the lesson and story weight is the lexicon, sentence and paradigm data, which the service worker keeps after the first visit.

### Tests

- `node --test`: 44 tests, new: day arithmetic across months and daylight saving, streaks with and without freezes, freeze settlement (enough, too few, idempotent), the seven-day calendar, badges, and heatmap cells.
- `npm run smoke`: XP in the HUD after a lesson, export then reset then import, hearts ending a lesson, and offline loading of the learn path, a story, a lesson, the dictionary and the case trainer through the service worker.
- `npm run qa`: new shots for the profile and sidebar with progress, the completion screen with news, hearts and the out-of-hearts screen, and Settings with the offline section. 0 axe violations, no horizontal scroll at 320 px, no page errors.

## Phase 4: audio and reading (2026-11-04)

### What was built

- **Audio chain** (`js/audio.js`): a human recording from Wikimedia Commons or Lingua Libre when the word has one (47% of words), otherwise a pre-generated file from the voice Steinn, otherwise the device's own Icelandic voice. Every course word, minimal-pair word and all 1,733 sentences have a generated file, so the device voice is only a last resort. Slow playback is 0.75x with the pitch kept; the speech-speed setting applies on top.
- **Generated voice**: `scripts/build-audio.py` renders the files offline with Piper 1.8.0 (GPL-3.0, build tool only) and the `is_IS` medium voices, which were trained on Talrómur (Reykjavík University, CC BY 4.0). MP3 at 24 kbps mono: 2,066 files, 11.2 MB. All of `/data` is now 12.7 MB, under the 20 MB budget. The manifest `data/audio/tts-steinn.json` maps exact text to file and records the model URL, size and SHA-256, the tool versions and the date.
- **Voice choice**: the four Piper voices (Búi, Salka, Steinn, Ugla) render the same six sentences on `voices.html` (linked from Settings) so the owner can choose by ear. Steinn is the provisional default. Shipping all four would cost about 45 MB, so the app ships one. To switch: `npm run build:audio -- --voice salka`, then set `TTS_VOICE` in `js/audio.js`. The ESPnet Talrómur models were not rendered: they need a separate toolchain and use older architectures.
- **Word highlighting**: the reader highlights the word being spoken. Piper gives no alignments, so each sentence's duration is split over its words by phoneme count; the browser voice uses its boundary events instead. Close, not exact.
- **Listening exercises**: "Build the sentence you hear" (dictation: audio only, word bank), plus the existing listen-and-pick exercise with human recordings. Dictation is in the lesson cycle for every unit.
- **Minimal pairs** (`lesson.html?mode=sounds`, Practice > Sounds): six pairs that differ in vowel length (*man*/*mann*, *vin*/*vinn*, *sin*/*sinn*), preaspiration (*tak*/*takk*, *hatur*/*hattur*) and *ll* (*hala*/*halla*). Every word is a DMII Core form, and the voice's phoneme strings were checked to differ within each pair. Sounds practice gives XP but does not create spaced-repetition cards.
- **Stories** (`stories.html`): five readings (two dialogues) made only of unchanged Tatoeba sentences, each listed after the unit it fits. The reader plays one line or the whole story with line and word highlighting, shows speaker labels, toggles translations, and opens a word panel on tap (dictionary form, meaning, every possible analysis of the form, audio, links to the dictionary and the full table). Each story credits its sentences by id and author.

### Decisions and fixes

- Human recordings keep priority over the generated voice even though they cover fewer words: Piper gets some rules wrong, for example *Ísland* comes out as [ˈisland] without the t in *sl*.
- `play()` now always calls `onEnd` exactly once, also when the audio is stopped or replaced, so "Play all" can be stopped and a tapped line cancels it.
- The voice test in Settings uses the device voice (`play({ browser: true })`), because that is what the setting chooses.
- `validate-content` also checks the stories index, story ids, units and speakers, every minimal-pair word against the DMII Core, and that every word and sentence has a generated audio file that exists.

### Tests

- `node --test`: 35 tests pass.
- `npm run smoke`: all 14 lessons of units 1 and 2 (now with dictation), the sounds and letters drills, and the story reader (word panel opens, line audio loads from the generated set).
- `npm run qa`: new shots for the story list, reader, word panel, highlighting, translations, sounds, minimal-pair feedback and voices page. 0 axe violations, no horizontal scroll at 320 px, no page errors.

## Phase 3: engine and grammar core (2026-11-04)

### What was built

- **Course**: nine units in `content/units/` (order in `index.json`). Units 1 (Hello) and 2 (At the café) are complete, with hand-grouped lessons and a guidebook (`guide.html`) whose tables are built from DMII Core paradigms and whose examples are Tatoeba sentences. Units 3 to 9 split their theme words into lessons of six automatically and are marked "Preview". Grammar words may appear in sentences from the start.
- **Exercise engine**: `js/engine/generate.js` (pure, tested in Node) turns a lesson's focus words into twelve exercises. One module per type in `js/exercises/`: choice (read a sentence, pick the translation), meaning, listen (human recordings with credit), word bank, type the word, match pairs, fill in the form, which case, and table cells. Sentences come only from the GreynirCorrect-checked Tatoeba pool; forms only from DMII Core paradigms.
- **Grammar-first choices**: "fill in the form" offers only other forms of the same word with the same number and definiteness, so every wrong option is wrong because of its case. "Which case?" is asked only for forms that belong to exactly one case. Hints name the rule when a preposition from `content/case-rules.json` triggers the case (for example *án kaffis*: "án always takes the genitive"). Across the nine units about a third of the exercises are grammar exercises.
- **Sentence choice**: sentences use only words the learner has met (earlier units, this unit so far, grammar words). Reading exercises (choice, fill in the form, which case) fall back to any course word when there is no such sentence; the translation is shown with them. Sentence building stays strict.
- **Form-level spaced repetition**: `js/srs.js` (Leitner boxes: 1, 2, 4, 8, 16, 32 and 64 days; a miss comes back in ten minutes) over IndexedDB (`js/db.js`, with an in-memory fallback). A card is a word's meaning (`kaffi_no|meaning`) or one form (`bjór_no|ÞFETgr`), so review targets the exact form that is weak.
- **Practice**: replay mistakes, review due cards, the special-letters drill, the placement test (adaptive: one or two questions per unit, stops at the first unit with a miss, offers to mark earlier units as done), and the case trainer: the full table of any course noun, adjective, pronoun, numeral or verb (present and past), with three practice levels that hide a third, two thirds or all cells. Every checked cell counts for spaced repetition.
- **Weak spots heatmap**: computed from the learner's own answers (case by number by gender; a cell needs three answers). The sidebar mini heatmap and the HUD's streak and XP are still demo values until Phase 5.
- **Dictionary and stories** use the real data: search any of the 325 words by any form; the dictionary shows recordings with credit, IPA, English and Norwegian glosses, a table, examples and etymology. The stories page is a sample reading until Phase 4.
- The Phase 1 demo lesson, demo path, demo data and its build script were removed.

### Tests

- `node --test`: 35 tests: answer grading, the SRS scheduler, the course model and lesson states, and, against the real data, that every exercise in every lesson of units 1 and 2 uses only known words, real forms of the right word, distinct options and unambiguous case targets.
- `npm run smoke`: Playwright plays the first lesson at phone and desktop size, answering everything correctly, and checks that progress is saved and the next lesson unlocks; then it plays all 14 lessons of units 1 and 2 (168 exercises, all nine types) and fails on any answer not graded correct.
- `npm run qa`: 0 axe violations, no horizontal scroll at 320 px, no page errors.

### Decisions and fixes

- Wiktionary sometimes lists another sense first (*bjór*: "beaver" before "beer"). Glosses that match the intended meaning are now sorted first.
- Lessons are deterministic per attempt (seed: lesson key plus attempt number): a repeated lesson changes, but screenshots and tests are stable.
- A `?qa` URL flag exposes the current exercise to tests; it changes nothing for learners.
- Node.js LTS is now installed system-wide (`C:\Program Files\nodejs`).

## Phase 2: data pipeline (2026-11-03)

### What was built

- `content/vocab/core.json`: 325 words in nine themes (Hello, At the café, Family, Getting around, Time, Shopping, Weather and nature, Study and work, Grammar words). Each entry names the lemma, its DMII Core word class and the intended English meaning, plus an optional hint where the DMII Core has two words with the same lemma (a gender, or a form the paradigm must contain).
- `scripts/build-data.mjs` writes `data/lexicon.json` (index: glosses in English and Norwegian, IPA, etymology, frequency rank, sentence ids, recording count), `data/forms/<theme>.json` (DMII Core paradigms, unchanged), `data/sentences.json` (Tatoeba sentences with authors and translations), `data/audio.json` (Commons recordings with speaker and license), `data/SOURCES.json` and `docs/data-report.md`. Total 1.05 MB, 194 KB gzipped.
- `scripts/validate-content.mjs` checks every Icelandic token in the content against the DMII Core (generated paradigms first, then a cached API lookup), accepts clitic forms such as *geturðu*, and allows proper nouns only from `content/allowlist.json`. Hand-written sentences go through GreynirCorrect. A deliberately wrong word makes it fail.
- GreynirCorrect runs locally in `.venv` (`reynir-correct` plus the Icegrams model, about 200 MB in the user profile) through `scripts/lint-icelandic.py`, with results cached by sentence text.

### Coverage (from docs/data-report.md)

All 325 words confirmed (318 in the DMII Core, 7 indeclinable numerals in the full BÍN); Wiktionary gloss matches the intended meaning for all with a gloss; Norwegian Bokmål gloss 89%; IPA 97%; human recording 47% (154 words); one or more example sentences 97%, three or more 91%.

### Decisions

- **Theme lists are written by hand and checked by data.** Frequency alone (the Gigaword Corpus is news-heavy: *milljarður*, *ráðherra*) does not make a beginner course. The pipeline checks each word in the DMII Core and against its Wiktionary gloss, and orders words inside a theme by corpus frequency.
- **Tatoeba sentences are linted.** GreynirCorrect flagged 852 of 10,602 candidate sentences (for example *föðurs* for *föður*, missing accents, *bakvið* for *bak við*, *á morgnanna* for *á morgnana*); flagged sentences are never used. Parse failures (E001), exclamation marks (E007) and unknown foreign words (U001) do not exclude a sentence. Some correct sentences are excluded too; there are enough left.
- **Norwegian glosses** come from English Wiktionary translation tables: when an English entry's translation sense lists the Icelandic lemma, the Bokmål words of the same sense are used.
- **Indeclinable numerals** (*fimm* to *tuttugu*) are not numerals in the DMII Core (*fimm*, *sex*, *sjö* exist only as nouns; *níu*, *tíu*, *tuttugu* not at all). They are confirmed in the full BÍN through the Ylhýra API and stored as single-form words, with no invented paradigm.
- **The DMII Core API answers `{"0": ""}` when nothing matches.** Both the pipeline and the validator treat that as "not found"; an earlier version counted it as found, which a negative test caught.
- **Recordings are linked, not copied:** 156 Commons and Lingua Libre files, each with speaker and license (mostly CC BY 4.0 and CC BY-SA 4.0).

### Gaps

Ten words have no usable Tatoeba sentence (for example *kaffihús*, *króna*, *foss*); their exercises use word-level types. *seint* has no Wiktionary entry. Corpus sentences from Korp could fill gaps later, after a per-subcorpus license check.

## Phase 1: design system and responsive shell (2026-11-03)

### What was built

- Design system: `css/tokens.css` and `css/base.css` start with the Retro-Futurism reference CSS exactly as given, then add the section 5.3 tokens and the extensions. `css/components.css` holds every component and state from 5.7; `css/layout.css` holds the shell, the lesson focus mode and the screen layouts.
- Screens: landing, Learn path, demo lesson (six exercise types, three feedback states, quit dialog, completion screen), declension table with practice mode, Stories sample reader with tap-a-word, Dictionary, Practice hub with the weak-spots heatmap, Profile, Settings, Credits, and `styleguide.html`.
- Mascot Tala (`js/tala.js`): a CRT-monitor head with a pixel face, an antenna staff with a glowing tip and a magenta scarf, with five expressions (neutral, happy, wrong, sleepy, thinking). Faces are 16 x 11 ASCII grids in the code, so they are easy to edit. Static copies are in `assets/tala/`.
- One icon sprite (`assets/icons.svg`, 35 line icons, `currentColor`).
- UI in English and Norwegian Bokmål (`js/i18n/en.json`, `nb.json`, 246 keys). `scripts/check-i18n.mjs` fails if a key is missing in either language.
- Settings that already work: Calm mode (auto, on, off), scanlines (page default, low, off), sound effects (8-bit chimes from the Web Audio API, off by default), browser Icelandic voice and speed, strict or easy checking, app language, gloss language.

### Decisions

- **Real data in the demo, no invented Icelandic.** `scripts/build-demo-data.mjs` builds `data/demo/lexicon.json` from the DMII Core API (paradigms of *hestur*, *bók* and *Ísland*, copied verbatim), the cached Wiktionary extract (glosses, IPA, etymology, one human recording) and Tatoeba (14 sentences with author credits). Every sentence in the lesson, stories and dictionary comes from Tatoeba, and every form from BÍN. Distractors in "fill in the form" are the other forms of the same lemma. Hand-written claims (two case rules, three unit-title words, pronunciation notes) are listed in `content/NEEDS-NATIVE-REVIEW.md` and flagged `reviewed: false`.
- **One shell module.** Navigation, HUD, sidebar and footer are rendered by `js/shell.js` into empty landmarks in each page, so there is one source for them. The pages need JavaScript anyway.
- **Lesson on phones has no frame.** The "monitor frame" starts at 900 px; on phones the lesson fills the screen, as in the section 5.5 sketch.
- **Narrow declension tables** (under 640 px of table width) show the case abbreviation tag (NF, ÞF, ÞGF, EF) in its color, with a legend underneath spelling out the names. The full names stay in the accessibility tree. The same applies to the dictionary's mini table under 400 px.
- **Answer checking** (`js/normalize.js`, unit-tested): NFC, case, punctuation and space normalization; missing acute accents are ALMOST in easy mode and wrong in strict mode; ASCII stand-ins for þ, ð, æ and ö are ALMOST in early units. The ALMOST hint names the exact letters the learner missed (for example "ð ≠ d").
- **IPA** uses the reference font stack too; the browser takes the few IPA symbols Courier New lacks (such as ʏ) from a fallback font.
- **Placeholders, labeled as such:** the placement test opens the demo lesson; Guidebook buttons show a "Phase 3" message; streak, XP and heatmap numbers are demo data and carry a "Demo data" tag; export and import are disabled until Phase 5; audio uses the browser's Icelandic voice when there is one and otherwise explains that audio arrives in Phase 4.
- **Screenshots are not committed.** A full set is about 13 MB per run; `npm run qa` regenerates them into `screenshots/` (gitignored).

### QA results

- `scripts/check-contrast.mjs`: all 26 token pairs pass WCAG AA (ratios match the brief's table), and no CSS uses blue or pink as a text color.
- `scripts/visual-qa.mjs`: 24 screens and states at 390x844, 768x1024 and 1440x900; axe (WCAG 2.0, 2.1 and 2.2 A and AA): 0 violations; no horizontal scroll at 320 px on 14 pages; no JavaScript errors.
- `node --test`: 8 of 8 pass.

### Fixed during QA

Overflow at 320 px from one-column CSS grids sizing to unbreakable content (now `minmax(0, 1fr)`), the lesson's action buttons, the declension table, and the voice selector; the horizon geometry (a 10rem floor at `rotateX(60deg)` projects to about 63 px, so the line, the sun and Tala's feet now sit there); a word panel dimmed below AA contrast; a node whose visible "Start" label was missing from its accessible name.

### Not verified

- Font rendering of þ ð æ ö and the accented vowels was checked in Chromium on Windows only. Courier New ships with macOS and iOS; Android has no Courier New and falls back to its monospace font, which covers these letters but should be checked on a device.
- No browser Icelandic voice was available in the test browser, so speech playback is untested.
- The scanline overlay is not part of axe's contrast calculation; it darkens text slightly. Reading screens use the low setting, and Calm mode removes it.

### Tooling note

The winget install of Node.js was still waiting for the Windows administrator prompt at the end of Phase 1, so Phase 1 also ran on the portable Node 26.13.0. Playwright and axe are dev dependencies in `package.json`.

## Phase 0: repository and probe (2026-11-03)

### Repository state

- Cloned `https://github.com/KaufmannFredrik/duo-dupe-icelandic` into the working folder. The remote was **empty** (no commits, no files), so there was nothing to summarize or preserve. The project is scaffolded from scratch on `main`.
- Added: `.gitignore`, `.nojekyll`, `LICENSE` (MIT, code only), `data/LICENSE.md` (data licensing split), `package.json` (ES modules, Node 20+, no dependencies yet), `scripts/probe-apis.mjs`, `docs/api-report.md`, this file, and a short `README.md`.
- Commits are pushed to `origin/main` after each phase (owner decision, see below).

### Tooling

- **Node.js is not installed** on the development machine. Phase 0 ran on the official portable Node 26.13.0 LTS zip (SHA-256 checked against nodejs.org) from a temporary folder, without changing the system. A system-wide Node.js LTS install with winget was started afterwards (see the Phase 1 tooling note).
- The `gh` CLI is not installed. Python 3.11.9 is available, which is enough for GreynirCorrect (needs 3.11+).
- The probe uses only Node built-ins (`fetch`, `zlib`, `readline`). Tatoeba exports are bzip2, so the script calls the `bzip2` binary (ships with macOS, Linux and Git for Windows) instead of adding an npm dependency. A minimal zip reader handles the CLARIN frequency archive.
- The repo lives inside OneDrive. `.cache/` (about 150 MB of downloads, gitignored) would still be synced by OneDrive; set `TOLVA_CACHE` to a folder outside OneDrive to avoid that.

### Data-source decisions

1. **Inflections: the official DMII Core API, not the bulk files and not Ylhýra.**
   - `https://bin.arnastofnun.is/api/` returns full prescriptive paradigms as JSON with `Access-Control-Allow-Origin: *`. The DMII Core is the subset made "especially for use in schools and for learners" and "for third party publication". Licence: CC BY-SA 4.0; may be published on the web free of charge if **unmodified** and credited.
   - Phase 2 caches the paradigm of every course lemma from this API into `/data`. "Unmodified" is honored by storing exactly the forms and tags the API returns (only the JSON wrapper is compacted) and showing every variant it lists. The credits page will say so.
   - The bulk files are rejected for now: they sit behind an email plus reCAPTCHA form, and their licence text conflicts (CC BY-SA 4.0 on two pages, the older "no redistribution, no paradigm publication" terms still on the English Download page). The site itself says the bulk data is not meant for reproducing paradigms.
   - Ylhýra's wrapper works (CORS `*`) but adds nothing the official API lacks; documented as a fallback only.
2. **Glosses, IPA, etymology: Wiktionary via kaikki.org**, the per-language Icelandic file. It is marked deprecated, so Phase 2 pins its SHA-256 in `data/SOURCES.json`; fallback is filtering the 2.9 GB raw dump. IPA covers 92% of the 300 most frequent lemmas; English glosses 99%.
3. **Example sentences: Tatoeba bulk exports.** 13,390 Icelandic sentences, 81% with an English translation, but only 144 with Norwegian Bokmål. Korp (`https://malheildir.arnastofnun.is:1234`) is the backup for lemmas without sentences, with the subcorpus licence checked per sentence.
4. **Vocabulary order: CLARIN-IS "Frequency lists for Icelandic 23.06"** (`giga_simple_freq.tsv`, CC BY 4.0).
5. **Audio chain revised, because two planned sources are empty:**
   - The public **Tiro TTS instance is gone**: every path on `tts.tiro.is` (including `POST /v0/speech` and the preflight) returns 404. `speech.tiro.is` too. `api.grammatek.com` does not resolve.
   - **Tatoeba has no Icelandic audio at all** (0 of 13,390 sentences, cross-checked two ways).
   - Wiktionary has recordings for only 117 entries (3.7% of the top 300 lemmas); Lingua Libre on Commons has 375 Icelandic word recordings.
   - New proposal: (1) human word recordings from Commons and Lingua Libre where they exist; (2) **static audio pre-generated at build time with Piper** and its four Icelandic voices (Búi, Salka, Steinn, Ugla), trained on Talrómur (CC BY 4.0); (3) browser `speechSynthesis` with an `is-IS` voice. Slow speed can be a second Piper render or `playbackRate` with `preservesPitch`; decide in Phase 4 against the 20 MB data budget. Approved by the owner as "the best audio you can"; see owner decisions.
   - Word-level highlighting loses Tiro's speech marks. Options for Phase 4: Piper phoneme timings if exposed, browser `boundary` events, or proportional estimates.
6. **Lemmatizer for stories: build-time DMII Core lookups.** Málvinnsla (`malvinnsla.arnastofnun.is`) has a broken HTTPS certificate, so a GitHub Pages site cannot call its HTTP endpoints (mixed content), and `POST /tag` returned HTTP 500 throughout. Each story token will be annotated at build time with `beygingarmynd/{form}`, with ambiguous tokens resolved by hand in the story file. Its hyphenation endpoint (Skiptir) does work and can pre-compute soft hyphens for long compounds.
7. **Grammar lint: GreynirCorrect locally** (`pip install reynir-correct`, MIT) inside `validate-content`. `yfirlestur.is` redirects to Málfríður, so no hosted API.
8. **Speaking (Phase 6): browser `SpeechRecognition` only**, behind a flag, if it supports `is-IS` at runtime. No hosted Icelandic ASR exists; Whisper fine-tunes need a GPU server.
9. **Norwegian bridge (Phase 7): Ordbøkene API** at `https://ord.uib.no` works without a key and with CORS `*`. Build the cognate candidate list at build time; check the content licence first.

### Brand facts

- *tölva*: English Wiktionary says "A portmanteau word, coined by Sigurður Nordal in 1965 from tala ('number') + völva ('prophetess')". That is one source. The owner decided not to contact the Institute, so the About page cites Wiktionary by name.

### What failed (for the record)

| Item | Result |
|---|---|
| `tts.tiro.is` (all routes, GET and POST) | 404 |
| `speech.tiro.is` | 404 |
| `api.grammatek.com` | DNS lookup fails |
| `https://malvinnsla.arnastofnun.is` | TLS certificate does not match the host |
| `http://malvinnsla.arnastofnun.is/tag` | 500 for JSON and form bodies |
| `audio.tatoeba.org/sentences/{lang}/{id}.mp3` | 404; replaced by `tatoeba.org/en/audio/download/{audio_id}` |
| Korp URL `spraakbanken3.it.gu.se/korp` in the malheildir bundle | Answers but has no Icelandic corpora; the real backend is port 1234 |
| BÍN bulk files | Not scriptable (email form); licence text conflicts |

### Owner decisions (2026-11-03)

1. **BÍN: DMII Core API only.** No bulk files and no contact with the Institute. This also means the About page cannot wait for an Institute source on the *tölva* etymology; it will cite Wiktionary and say so.
2. **Audio: "get the best audio you can."** Human recordings first, then the best-sounding open TTS, rendered at build time. Phase 4 renders the same test sentences with every usable candidate into a comparison page so the owner can pick by ear (the build tooling cannot judge audio quality). Candidates found so far:
   - Piper `is_IS` voices bui, salka, steinn, ugla (VITS, Talrómur, CC BY 4.0): the default.
   - ESPnet Talrómur FastSpeech2 and Tacotron2 models (`espnet/GunnarThor_talromur_*`, `language-and-voice-lab/talromur_*`, CC BY 4.0): older architectures, likely lower quality.
   - `facebook/mms-tts-isl`: CC BY-NC 4.0, non-commercial only. Excluded, because it would restrict reuse of `/data`.
   - Commercial neural voices (Azure is-IS Guðrún and Gunnar) probably sound best but need an account and key held by the owner. Only if the owner opts in.
3. **Node.js:** installed with `winget install OpenJS.NodeJS.LTS`.
4. **Pushing:** allowed. Push `main` to `origin` after each phase commit.
5. **AI conversation practice (Phase 7): skipped.** No LLM features, so no API keys anywhere.
6. **GitHub Pages: not yet.** No workflow file; publishing waits for the owner.
7. **Working mode:** keep building phase after phase without stopping for review, and only ask when something truly needs the owner.
