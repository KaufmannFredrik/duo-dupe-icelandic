# Needs native review

Every piece of Icelandic content or language claim that was written for TÖLVA (not taken from BÍN, Wiktionary, Tatoeba or another source) is listed here until a native speaker has checked it. Content files carry `"reviewed": false` until then.

Sentences shown in exercises come from Tatoeba and are not listed. Inflected forms come from the DMII Core and are not listed.

## Core vocabulary (`content/vocab/core.json`)

The choice of 325 words and their grouping into themes. Every word is confirmed in the DMII Core (or, for seven indeclinable numerals, the full BÍN), and its Wiktionary gloss matches the intended meaning; the selection itself is not reviewed.

## Rules (`content/case-rules.json`)

| Id | Claim | Status |
|---|---|---|
| `til`, `án` | *til* (to) and *án* (without) always take the genitive. | not reviewed |
| `frá`, `hjá`, `úr`, `af` | *frá*, *hjá*, *úr* and *af* always take the dative. | not reviewed |
| `um` | *um* always takes the accusative. | not reviewed |
| `í-staður`, `á-staður` | *í* and *á* take the dative for a location. | not reviewed |
| `í-hreyfing`, `á-hreyfing` | *í* and *á* take the accusative for movement. | not reviewed |
| `eiga` | *eiga* (to own, to have) takes its object in the accusative. | not reviewed |
| `í-tími`, `á-tími`, `um-tími` | In time expressions *í*, *á* and *um* take the accusative: *í dag*, *í sumar*, *í viku*; *á sunnudaginn*, *á veturna*; *um helgar*, *um tíma*. | not reviewed |
| `í-tími-þgf`, `á-tími-þgf` | *í* and *á* take the dative in some time expressions: *í hverri viku*, *í síðasta mánuði*; *á sunnudögum*, *á hverjum degi*. | not reviewed |
| `eftir-tími`, `eftir` | *eftir* takes the accusative when it means after or in a time (*eftir matinn*, *eftir klukkutíma*), and the dative after verbs such as *bíða* and *muna* and for order (*á eftir laugardegi*). | not reviewed |
| `fyrir-síðan`, `fyrir` | *fyrir* takes the dative when it means ago (*fyrir tveimur árum*), and the accusative when it means for or before (*fyrir mig*, *fyrir kvöldmatinn*). | not reviewed |
| `nounGroups` | Which nouns make a time expression for these rules; *tími* counts for *um*, *eftir* and *fyrir* but not for *í* (*í tíma* is usually a class). | not reviewed |

## Sentence tags (`scripts/lib/tags.mjs`, `content/tag-fixes.json`)

- *sé* in *Ég sé það* and *Ég sé það ekki* is *sjá*, not the subjunctive of *vera* (the parser's reading).
- The parser's dative for a meal after *í*, *eftir* or *fyrir* (*fisk í kvöldmat*, *eftir kvöldmat*) is not used; Tatoeba has the accusative after *eftir* and *fyrir* (*eftir matinn*, *fyrir kvöldmatinn*).
- In a sentence without a verb (*Góða nótt*, *Bjór, takk*) the parser's case is not used.

## Units (`content/units/`)

- Unit titles are single course words, each confirmed in the DMII Core: *Halló*, *Kaffi*, *Fjölskylda*, *Gata*, *Tími*, *Búð*, *Veður*, *Vinna*, *Orð*. Not reviewed for suitability as titles.
- Lesson groupings in units 1 and 2 (which words are taught together).
- Guidebook notes in units 1 and 2 (English and Norwegian prose; every Icelandic fragment is checked against the DMII Core by `validate-content`):
  - *Ég heiti*, *Hvað heitir þú?*: Icelandic says "I am called".
  - Greetings are in the accusative: *Góðan daginn* is the accusative of *góður dagur*.
  - An adjective after *vera* agrees with the speaker: *Ég er þyrst* (woman), *Ég er þyrstur* (man).
  - *ekki* comes right after the verb: *Ég skil ekki*.
  - *ég* becomes *mig*, *mér*, *mín*; *við* is part of the same word.
  - Every noun has a gender; the article is an ending: *bjórinn*, *mjólkin*, *kaffið*.
  - *vilja* is irregular in the singular: *ég vil*, *þú vilt*, *hann vill*.
  - Most verbs take an accusative object.
  - *einn* to *fjórir* inflect: *tvær dætur*, *tvo ketti*, *tvö börn*; from five on numbers do not change.
- Unit 3, *Fjölskylda* (family): the lesson groupings, and the guidebook notes (every Icelandic fragment is checked against the DMII Core; the forms in the tables are DMII Core paradigms):
  - *faðir*, *móðir*, *bróðir*, *systir*, *dóttir* end in -ur in every singular case but the nominative; four change their vowel in the plural (*feður*, *mæður*, *bræður*, *dætur*), *systir* keeps it (*systur*). The comparison with English *man, men* and Norwegian *bror, brødre*, *datter, døtre*.
  - *minn* and *þinn* follow the noun and agree with it: *pabbi minn*, *mamma mín*, *barnið mitt*. Most nouns take the article first (*kötturinn minn*), but family words usually do not (*bróðir minn*). *hans* and *hennar* do not inflect: *húsið hans*, *húsið hennar*.
  - *sinn* refers back to the subject of its own sentence, as Norwegian *sin, si, sitt* does: *Hún hringdi í dóttur sína*; *hans* and *hennar* are someone else's: *Hann sér hundinn hennar*. *sig* is the reflexive pronoun: *Hann meiddi sig* ("he hurt himself").
  - Family, pets and things one has are said with *eiga*: *Ég á dóttur*; *ég á*, *þú átt*, *hún á*, *við eigum*; the object is accusative (*þrjá bræður*, *tvær systur*). Where someone lives is said with *búa*: *ég bý*, *þú býrð*, *hún býr*.
  - The numbers from five to twenty do not inflect. Age: *Hún er átta ára*, with *ára* the genitive plural of *ár*; *gamall* (a man or a masculine noun) or *gömul* (a woman) may follow.
- Unit 4, *Gata* (getting around): the lesson groupings, and the guidebook notes:
  - *í* and *á* take the dative for a place and the accusative for a direction: *í bílnum* (in the car), *í bílinn* (into the car). The choice of preposition is learned with the word: *í skóla*, *í búð*, *í banka*, but *á sjúkrahúsi*, *á hóteli*, *á safni*.
  - *til* takes the genitive (*til Íslands*, *til flugvallarins*); *frá*, *úr* and *hjá* take the dative (*frá Íslandi*, *úr bílnum*, *hjá frænda mínum*). The pairs *í* and *úr*, *á* and *af*, *til* and *frá*.
  - *hvar* asks for a place, *hvert* for a direction, *hvaðan* for a starting point; *hér* and *þar* answer *hvar*, *hingað* and *þangað* are for directions.
  - The imperative is the stem with *þú* attached as -ðu, -du or -tu: *farðu*, *beygðu*, *bíddu*, *taktu*; *gakktu* from *ganga*. *til hægri*, *til vinstri*, *beint*; compass points can stand alone after a verb: *keyra norður*.
- Case trainer note "When is each case used?" (summary of the main uses of the four cases).
- Unit 10, *Nýyrði* (new words): the choice of twelve modern words, and the unit title. The guidebook retells Wiktionary's etymologies (sources quoted in `docs/DECISIONS.md`); the retelling and the glosses of the parts need review:
  - *útvarp* = *út* + *varp*; *sjónvarp* made on the same model with *sjón*; *flugvél* = *flug* + *vél*.
  - *tölva*: Sigurður Nordal, 1965, from *tala* + *völva*. *tækni*: Björn Bjarnason, 1912, from *tæki*. *veira*: said to be Vilmundur Jónsson, 1955. *reikistjarna*: attributed to Jónas Hallgrímsson, from *reika* + *stjarna*.
  - *hátalari* as "loud talker"; *rafmagn* = *raf* (amber) + *magn*; *forrit* = a prefix meaning "before" + *rit*.
  - *sími* based on an old word for a cord; *þota* from *þjóta*; *farsími* and *tölvupóstur* as compounds.

## Stories (`content/stories/`)

The sentences are unchanged Tatoeba sentences. Not reviewed: which sentences were chosen, their order, whether they read naturally together, and the speaker labels (A, B) in the two dialogues.

| Story | Lines |
|---|---|
| `hello` Meeting someone | A: *Hæ, hvernig gengur?* B: *Ég er góður.* A: *Hvað heitir þú?* B: *Ég heiti Jack.* A: *Hvaðan ertu?* B: *Ég er frá Ástralíu.* A: *Velkominn!* B: *Takk!* A: *Bless!* |
| `cafe` At the café | *Vilt þú te eða kaffi? Tvo bjóra, takk. Hann er að borða epli. Strákurinn er að borða brauð. Barnið er að drekka mjólk. Mætti ég fá meira kaffi? Takk, það er allt. Takk fyrir matinn.* |
| `family` My family | *Hann er bróðir minn. Hún er systir mín. Systir mín er í vinnu. Móðir mín var dansari. Barnið er sofandi. Hún elskar börn. Hvar er bróðir þinn?* |
| `weather` What is the weather like? | *Veðrið er svo gott! Hvar er sólin? Sólin braust í gegnum skýin. Það er kalt. Er þér ekki kalt? Mér er kalt. Það snjóar. Ég elska snjó.* |
| `around` Taking the bus | *Hvar er bíllinn minn? Áttu bíl? Taktu strætó. Hér kemur strætó. Ég fer með strætó í skólann. Hann kom með strætó.* |

## Minimal pairs (`content/minimal-pairs.json`)

| Pair | Contrast | Status |
|---|---|---|
| *man* / *mann*, *vin* / *vinn*, *sin* / *sinn* | Vowel length: long vowel before one consonant, short before a double one. | not reviewed |
| *tak* / *takk*, *hatur* / *hattur* | Preaspiration before double *kk* and *tt*. | not reviewed |
| *hala* / *halla* | *ll* sounds roughly like "tl". | not reviewed |

The English and Norwegian descriptions of the three contrasts are not reviewed either.

## Sentence tags (`data/tags.json`)

Which course word each word of a sentence is, as the Greynir parser reads it (`scripts/build-tags.mjs`). The parser is not always right; a native speaker could check the 221 cases where the tags say a form is another word than its spelling suggests (listed by `npm run build:tags`), and the rules in `scripts/lib/tags.mjs` that treat some differences as the same word (participles, prepositions used as adverbs, *einn* as numeral or pronoun).

## Generated audio (`data/audio/`)

Every word and sentence without a human recording is spoken by the Piper voice Steinn. A native speaker should listen for wrong pronunciations, starting with the minimal pairs and the stories. Known: *Ísland* is said [ˈisland], without the t that the *sl* cluster should get. Word highlighting in the reader uses estimated timings.

## Norwegian bridge (`data/bridge.json`, `js/bridge-rules.js`)

The pairs are matched by `scripts/build-bridge.mjs`, not by a person. 156 pairs are sourced: Bokmålsordboka and Wiktionary name the same Old Norse word. 5 are shared loans (Wiktionary names the source language) and 8 only look alike with the same meaning. To review:

- Pairs where the two words share an Old Norse origin but have drifted apart in meaning or use (for example *að* and *at*, *ef* and *om*).
- The 8 look-alike pairs (*kaka* and *kake*, *súpa* and *suppe*, *salat*, *frænka* and *frenke*, *jakki* and *jakke*, *kosta* and *koste*, *læra* and *lære*, *norskur* and *norsk*).
- The spelling patterns in `js/bridge-rules.js` and their English and Norwegian names (`bridge.rule.*` in `js/i18n/`). They describe spelling, not historical sound laws, and some are only tendencies.

## Pronunciation and language notes (landing page, `js/i18n/*.json`)

| Key | Claim | Status |
|---|---|---|
| `landing.soundsText` | *hv* sounds like kv, *ll* like tl, vowels can be long or short. | not reviewed |
| `landing.soundsExample` | In *Ísland* [ˈistlant], *sl* is said with a t in between (IPA from Wiktionary). | not reviewed |
| `landing.bridgeExample` | *hestur* and Norwegian *hest* both mean horse. | not reviewed |
| `landing.say` | *tölva* comes from *tala* (number) and *völva* (seeress); source: Wiktionary. | sourced, not reviewed |
| `brand.mascot.meaning` | *tala* means both speech and number; Wiktionary lists "a short address, a speech" and "number". | sourced, not reviewed |
| `feedback.reason.*` | Accents change words (for example *ar* and *ár*). | not reviewed |
