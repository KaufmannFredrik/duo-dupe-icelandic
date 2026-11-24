# Hand-written claims and their sources

Every language claim written for TÖLVA (grammar notes, case rules, pronunciation notes, etymologies, tag corrections) is listed here with the source it was checked against. By the owner's decision (2026-11-23) nobody is asked to review the course; claims are checked against published sources instead, and a claim that a source contradicted was corrected.

Not listed: sentences in exercises, examples and stories are unchanged Tatoeba sentences; inflected forms are DMII Core forms (`data/forms`).

## Sources

| Key | Source |
|---|---|
| W | English Wiktionary, Icelandic section of the entry named (`https://en.wiktionary.org/wiki/<word>`); Bokmål section for Norwegian words |
| DMII | DMII Core (BÍN, Árnastofnun), the forms in `data/forms` |
| T | Tatoeba sentence, by id (`data/sentences.json`) |
| Ritreglur | Íslensk málnefnd, *Ritreglur* (Stjórnartíðindi 695/2016), [PDF](https://www.stjornarradid.is/library/04-Raduneytin/Menntamalaraduneytid/Rettritun_Islensk%20malnefnd_2016.pdf) |
| WP | Wikipedia: [Icelandic grammar](https://en.wikipedia.org/wiki/Icelandic_grammar), [Icelandic phonology](https://en.wikipedia.org/wiki/Icelandic_phonology) |
| elon | elon.io Icelandic grammar: [time prepositions](https://elon.io/grammar/icelandic/prepositions/time-prepositions), [dates and time](https://elon.io/grammar/icelandic/numbers/dates-and-time), [possessive placement](https://elon.io/grammar/icelandic/pronouns/possessive-placement), [temporal conjunctions](https://elon.io/grammar/icelandic/conjunctions/temporal), [dummy það](https://elon.io/grammar/icelandic/syntax/dummy-thad) |
| islenzka | [islenzka.net, telling time](https://islenzka.net/telling-time/) |
| Transparent | Transparent Language Icelandic blog, [articles](https://blogs.transparent.com/icelandic/?p=5771) |
| Weather verbs | Eyþórsson and Sigurðardóttir, [A Brief History of Icelandic Weather Verbs](https://projekt.ht.lu.se/fileadmin/_migrated/content_uploads/4._Eythorsson-Sigurdardottir.pdf) |
| UCSC | [Icelandic handout, UC Santa Cruz](https://babel.ucsc.edu/~hank/114/icelandic.pdf) |
| V2 | Lund working papers on Icelandic word order, e.g. [Xu and Angantýsson, WPSS 111](https://projekt.ht.lu.se/fileadmin/user_upload/sol/ovrigt/projekt_grimm/working_papers/2024-dec/WPSS_111.pdf) |
| BMO | [Bokmålsordboka](https://ordbokene.no) (Universitetet i Bergen og Språkrådet) |

Status: **sourced** (a grammar or dictionary states it), **attested** (only shown by Tatoeba sentences or DMII Core forms, which the text then cites), **corrected** (changed after checking; the change is described).

In the content files, `"reviewed": true` means that every hand-written claim in the file is listed here with its source. `npm run validate` lists any file still marked `false`.

## Case rules (`content/case-rules.json`)

| Rule | Claim | Source | Status |
|---|---|---|---|
| `til`, `án` | *til* and *án* take the genitive. | W til, án ("[with genitive]"); elon | sourced |
| `frá`, `hjá`, `úr`, `af` | They take the dative. | W frá, hjá, úr, af ("[with dative]") | sourced |
| `um`, `um-tími` | *um* takes the accusative, also in time expressions (*um helgar*, *um tíma*). | W um ("[with accusative]"); elon (*um helgina*); T 385016, 910254 | sourced |
| `í-staður`, `á-staður`, `í-hreyfing`, `á-hreyfing` | *í* and *á* take the dative for a place and the accusative for movement. | elon ("í húsið … í húsinu"); W í | sourced |
| `í-tími` | *í* with the accusative in time expressions: *í dag*, *í sumar*, *í viku*. | W í ("for; over (spanning a time period) [with accusative]"); elon (*í viku*, *í þrjá daga*; *í dag* is a fixed phrase); T 450323 | sourced |
| `á-tími` | *á* with the accusative in time expressions: *á sunnudaginn*, *á veturna*. | elon (*á föstudaginn*); T 670260, 382251 and W *Kýrnar mjólka á sumrin* for the seasons | sourced |
| `í-tími-þgf`, `á-tími-þgf` | *í* and *á* with the dative in some time expressions: *á sunnudögum*, *á hverjum degi*, *í hverri viku*. | elon (habitual *á mánudögum*); T 482665, 391143, 1324559 | sourced |
| `eftir-tími`, `eftir` | *eftir* with the accusative for a time (*eftir matinn*, *eftir klukkutíma*), with the dative after verbs and for order (*bíða eftir honum*, *á eftir laugardegi*). | elon ("temporal eftir takes the accusative"); W eftir ("[with accusative or dative]"); T 384082, 3795780, 385906 | sourced |
| `fyrir-síðan`, `fyrir` | *fyrir* with the dative for "ago"; mostly the accusative for "for" and "before". | W fyrir (*fyrir tveimur árum*; *fyrir helgina*); elon (*fyrir viku*) | corrected: W also gives the dative for some "for" senses, so the rule now says "mostly" |
| `á-horfa` | *horfa á* takes the accusative. | W horfa ("[with á (+ accusative)]", *Ég horfði á sjónvarpið*) | sourced |
| `eiga` | *eiga* takes an accusative object. | W eiga | sourced |
| `hjálpa`, `loka` | *hjálpa* and *loka* take a dative object. | W hjálpa ("[with dative]"); T 828852 *Lokaðu dyrunum*, 10882623 | sourced (hjálpa), attested (loka) |
| `nounGroups` | Which nouns make a time expression; *tími* not for *í* (*í tíma* is usually a class). | T 861957, 488347 | attested |

## Sentence tags (`scripts/lib/tags.mjs`, `content/tag-fixes.json`)

| Claim | Source | Status |
|---|---|---|
| *sé* in *Ég sé það* is *sjá* ("see"). | DMII (*sé*, present of *sjá*); translation of T 3799208 | sourced |
| *Sá* in *Sá einhver hvað gerðist?* is the past of *sjá*. | DMII (*sá*, GM-FH-ÞT); translation of T 3997410 | sourced |
| *þeir*, *þau* in *Eru þeir bræður?*, *Hvaða tungumál tala þau í Kóreu?* are personal pronouns. | DMII (*þeir* of *hann*, *þau* of *það*); translations of T 3801939, 10963603 | sourced |
| The parser's dative for a meal after *í*, *eftir*, *fyrir* is not kept. | T: all 14 sentences with a definite meal after *eftir* or *fyrir* have the accusative; elon (*eftir matinn*) | sourced |
| In a sentence without a verb, the parser's case is not kept. | *Góða nótt*: W góður (strong masc. acc. *góðan*, fem. acc. *góða*), so the greeting is not the nominative the parser picks | sourced |

The parser itself is not checked case by case: `npm run build:tags` lists the 221 words it gives to another word than their spelling suggests.

## Unit guidebooks (`content/units/`)

Unit titles are single course words, each in the DMII Core. Which words are taught together is a design choice, made by running the lesson generator over each grouping (`docs/DECISIONS.md`).

### Unit 1, *Halló*, and unit 2, *Kaffi*

| Claim | Source | Status |
|---|---|---|
| *Ég heiti*, *Hvað heitir þú?*: "I am called". | W heita ("to be called, to be named"); WP | sourced |
| *Góðan daginn* is in the accusative. | W góður (strong masc. acc. sg. *góðan*); DMII | sourced |
| An adjective after *vera* agrees with the speaker: *Ég er þyrst*, *Ég er þyrstur*. | WP (adjectives agree in gender, number and case); DMII | sourced |
| *ekki* comes right after the finite verb. | WP (*veit ég ekki*); V2 | sourced |
| *ég*, *mig*, *mér*, *mín*. | DMII | attested |
| The article is an ending: *bjórinn*, *mjólkin*, *kaffið*. | WP ("joined to the end of the word") | sourced |
| *ég vil*, *þú vilt*, *hann vill*. | DMII; WP (*vilt*) | sourced |
| Most verbs take an accusative object. | WP lists verbs with dative and genitive objects (*safna*, *sakna*) as special cases; T | attested |
| *einn* to *fjórir* inflect, from five on numbers do not. | WP ("The numbers one to four are declined") | sourced |

### Unit 3, *Fjölskylda*

| Claim | Source | Status |
|---|---|---|
| *faðir, móðir, bróðir, systir, dóttir*: -ur in the singular; *feður, mæður, bræður, dætur*, but *systur*. | DMII | attested |
| Possessives follow the noun and agree with it; most nouns take the article first (*kötturinn minn*), family words usually not (*bróðir minn*). | elon (possessive placement); Transparent; WP (possessive table) | corrected: husband and wife do take the article (*maðurinn minn*, *konan mín*), as Transparent and elon note; the guidebook now says so |
| *hans* and *hennar* never change. | WP: they are the genitives of *hann* and *hún*, so they do not agree with the noun | sourced |
| *sinn* refers back to the subject, as Norwegian *sin*. | W sinn ("third-person reflexive possessive"); BMO sin | sourced |
| *eiga* for family and things; *á, átt, á, eigum*; accusative object. | W eiga ("to have, to be closely related to", *Ég á skemmtilega konu*) | sourced |
| *búa*: *bý, býrð, býr*. | DMII | attested |
| Five to twenty do not inflect; *Hún er átta ára*. | WP; DMII (*ára* EFFT); T 10633141 | sourced |

### Unit 4, *Gata*

| Claim | Source | Status |
|---|---|---|
| *í*, *á*: dative for a place, accusative for a direction; the preposition is learned with the place (*í skóla*, *á sjúkrahúsi*). | elon; T (DECISIONS, unit 4) | sourced |
| *til* + genitive; *frá*, *úr*, *hjá* + dative; the pairs *í/úr*, *til/frá*, *á/af*. | W til, frá, úr, hjá, af ("off, from") | sourced |
| *hvar*, *hvert*, *hvaðan*; *hingað*, *þangað*. | WP ("where/whither/whence"); W hingað ("here (movement)"), þangað ("there (in that direction)") | sourced |
| Imperative: stem + *þú* as -ðu, -du, -tu; *gakktu*. | W (*hjálpaðu*, *vinndu*, *þekktu*, *lokaðu*); WP (*Talarðu*); DMII (GM-BH-ET forms) | sourced |

### Unit 5, *Tími*

| Claim | Source | Status |
|---|---|---|
| *Hvað er klukkan?*; *Klukkan er* or *Hún er*; *yfir* past, *í* to. | islenzka ("Hún er tíu mínútur yfir sex"); W klukkan, kortér ("klukkan er kortér í þrjú") | sourced |
| *korter* | W kortér lists *korter* as an alternative form; the DMII Core has *korter* | sourced |
| *hálf tíu* is half past nine. | islenzka ("Klukkan er hálf tíu. – It is 9:30"); elon; W frekur | sourced |
| *til klukkan fimm*: *klukkan* keeps its form. | T 508646 | attested |
| Days are written with a small letter. | Ritreglur §1.3.3.3 ("Heiti einstakra daga, mánaða … eru rituð með litlum staf"; example *laugardagur*) | sourced |
| *þriðjudagur* third day, *miðvikudagur* mid-week day, *fimmtudagur* fifth day, *föstudagur* fast day; other languages name gods. | W (etymologies); W lists the old *týsdagur* and *frjádagur* | sourced |
| *á sunnudaginn* one day, *á sunnudögum* every week. | elon (*á föstudaginn*; habitual *á mánudögum*) | sourced |
| *í dag*, *í kvöld*, *í sumar*. | ielanguages; T 450323 | sourced |
| *snemma, fyrr, fyrst*; *seint, seinna, seinast*. | W snemma (comparative *fyrr*, superlative *fyrst*); DMII (MST, EST of *seint*) | sourced |
| Frequency adverbs right after the finite verb; *aldrei* in the place of *ekki*. | V2 (sentence adverbs before the verb phrase, after the finite verb) | sourced |
| *hvenær* asks; *þegar* joins two clauses. | elon (temporal conjunctions) | sourced |

### Unit 6, *Búð*

| Claim | Source | Status |
|---|---|---|
| Adjectives agree, also after *vera*; neuter -t. | WP (*íslenskt*); DMII | sourced |
| Weak after a definite noun (*gamli maðurinn*), strong otherwise. | WP ("If an adjective is modified by the article, or most pronouns, weak declension is used") | sourced |
| Comparison -ri, -ari, -astur; *eldri*, *yngri*, *stærri*, *minni*. | DMII (MST, ESB forms) | attested |
| Person in the dative, thing in the accusative with *kaupa*, *selja*, *gefa*. | T 740802, 888066, 4007820 | attested |
| *hundrað*, *þúsund* count as neuter (*tvö þúsund*). | T 827774; DMII | attested |
| *með* + dative for company, + accusative for what one brings or has. | W með ("with dative or accusative", *með konunni minni*); T 3799264, 698251, 388901 | sourced |
| *án* + genitive; *af* + dative; *Af hverju?* | W án, af | sourced |

### Unit 7, *Veður*

| Claim | Source | Status |
|---|---|---|
| Weather verbs take an empty *það*, left out when another word comes first. | Weather verbs (*Það rignir í dag* / *Í dag rignir*); elon (dummy *það*); T 386152 | sourced |
| *Mér er kalt*: a dative subject; *líka* with the dative. | UCSC ("me-DAT is cold"); W líka ("strict dative-nominative verb") | sourced |
| *úti/út*, *inni/inn*, *heima/heim*: place and direction. | W heima ("at home"), heim ("(towards) home"), úti, inni; WP ("Inn and út denote motion") | sourced |
| *sjá*: *sé, sérð, sér, sá*; *horfa á* + accusative; *heyra* + accusative, *heyra í* + dative. | DMII; W horfa, heyra; T 488512 | sourced |
| *eldfjall* = *eldur* + *fjall*; *norðurljós* = *norður* + *ljós*. | W eldfjall, norðurljós | sourced |
| Norwegian relatives (*vær*, *fjell*, *foss*, *jøkel*, *sky*, *sol*, *vind*). | `data/bridge.json` (BMO and W name the same Old Norse word) | sourced |

### Unit 8, *Vinna*

| Claim | Source | Status |
|---|---|---|
| Languages are feminine nouns in -a with a small letter; accusative after *tala*. | Ritreglur §1.3.4 ("Heiti tungumála … eru rituð með litlum upphafsstaf", example *íslenska*) and §1.3.1 (small letter by default, so also *íslenskur*); DMII; T 1322938 | sourced |
| *vita* a fact, *þekkja* a person, *kunna* a skill. | W vita, þekkja, kunna | sourced |
| *geta* takes the supine. | W geta (usage note: "requires the supine (sagnbót) form … rather than the bare infinitive") | sourced |
| *hjálpa*, *svara*, *loka* take a dative object; *opna* the accusative. | W hjálpa; T 763491, 828852, 828861 | sourced (hjálpa), attested (svara, loka, opna) |
| The past in -aði, -ði, -di, -ti; strong verbs change their vowel. | DMII | attested |
| *vinna* is "work" and "win". | W vinna (*Ég vann!* "I won!") | sourced |

### Unit 9, *Orð*

| Claim | Source | Status |
|---|---|---|
| *verða að*, *þurfa að*; *mega* with the bare infinitive. | T 1321351, 1353611, 473398, 1315570; W mega | sourced |
| Norwegian *må* usually means must, Icelandic *má* usually may. | W mega ("may, be allowed"; also "must"); BMO måtte (permission and necessity) | corrected: was "means"; both words have both senses |
| *þessi* agrees; *þetta* introduces a plural. | DMII; T 647412 | attested |
| *hver* inflects, *hvaða* does not. | WP; DMII (every slot *hvaða*) | sourced |
| A mixed group takes the neuter plural. | WP ("the neuter for either an all neuter or a mixed-gender group") | sourced |
| *að* is "that" and the infinitive marker; *sem*, *ef*. | WP (complementizer *að*); W (infinitives *að heita*) | sourced |
| *líka* the adverb and the verb. | W líka | sourced |

### Unit 10, *Nýyrði*

| Claim | Source | Status |
|---|---|---|
| *útvarp* = *út* + *varp*; *sjónvarp* on the same model. | W útvarp, sjónvarp | sourced |
| *tölva*: Sigurður Nordal, 1965, *tala* + *völva*. | W tölva | sourced |
| *tækni*: Björn Bjarnason, 1912. | W tækni | sourced |
| *veira*: said to be Vilmundur Jónsson, 1955. | W veira ("Said to be coined …") | sourced |
| *reikistjarna*: Jónas Hallgrímsson, *reika* + *stjarna*. | W reikistjarna | sourced |
| *rafmagn* = *raf* (amber) + *magn*; *forrit* = *for-* + *rit*; *þota* from *þjóta*. | W rafmagn, forrit, þota | sourced |
| *hátalari* "loud talker". | W hátalari (*hátt* + *tala* + *-ari*) | sourced |
| *sími* based on a word for a cord. | W sími ("Based on síma (“cord”)") | corrected: was "an old word for a cord"; Wiktionary does not say old |

## Stories (`content/stories/`)

The sentences are unchanged Tatoeba sentences, each readable after the unit the story follows (only words from that unit and earlier ones). Their choice, order and speaker labels are design choices, not claims. Which cast member speaks a dialogue (`"cast"`) is a design choice too; so is each unit host's greeting (`"host"` in the unit files), an unchanged Tatoeba sentence shown with its Tatoeba translation.

## Bokmål translations (`content/translations-nb.json`)

Tatoeba has a Bokmål translation for 28 of the 1,764 sentences. The other 1,732 (all but four excluded ones) were translated by hand for TÖLVA, from the Icelandic, with Tatoeba's English translation as a check. A translation is a claim about meaning; these are checked as follows.

| Check | Source | Status |
|---|---|---|
| Every word is a Bokmål word form: a headword or inflected form, a word of a headword expression (*morges* in *i morges*, *tide* in *på tide*), a genitive of such a form, or a compound of two (*svømmehall*, *klimaanlegg*) | BMO, looked up by `npm run validate` (`scripts/lib/bokmal.mjs`) | sourced (word forms) |
| Names: kept as in the Icelandic sentence (Tom, Mary), or in their usual Norwegian form (Island, Tyskland, Sveits, Genève, Moskva), listed in the file's `names` | the place names are the Norwegian exonyms; *Hótel Ísland* keeps its own name | design choice |
| The sentence ends like the Icelandic (or like Tatoeba's English, where the Icelandic has a typo, such as *Má ég fara með þér.*) | `npm run validate` | checked |
| Options of one choice exercise never share a translation, in English or Bokmål | `tests/engine.test.mjs` | checked |

Conventions: common-gender forms for feminine nouns (*boken*, *klokken*, *døren*, as the app's Norwegian interface writes *ordboken*), «» for quoted speech, *du* for *þú* and *dere* for *þið*, Norwegian idiom where the Icelandic is idiomatic (*Takk for maten*, *Det har du godt av*, *Det var på tide*). Where Icelandic separates sentences that Bokmål cannot (gender of *þeir*, *þær*, *þau*; *velkominn* and *velkomin*), the translations are the same.

## The cast (`js/characters.js`, `scripts/characters/`)

| Claim | Source | Status |
|---|---|---|
| *lundi* (m.) is the (Atlantic) puffin, the name of the puffin character | W: lundi ("puffin, Atlantic puffin") | sourced |
| *amma* is grandmother (Amma Sigga) | W: amma; the course gloss of amma_no | sourced |
| *Torfi* is an Icelandic male given name, and *torf* (n.) is sod, turf, the material of the turf house | W: Torfi ("a male given name", from Old Norse *Torfi*); W: torf ("sod, turf") | sourced. That the name suits a turf house is our pun: Wiktionary does not derive the name from *torf* |
| Amma's sweater is a *lopapeysa*, knitted from unspun Icelandic wool, with a round yoke | W: lopapeysa ("a knitted sweater made from unspun Icelandic wool", from *lopi* + *peysa*) | sourced |
| Jónas wears a *húfa*, a soft brimless cap | W: húfa; the course gloss of húfa_no | sourced |
| Hekla is a volcano in Iceland | [WP: Hekla](https://en.wikipedia.org/wiki/Hekla) | sourced |

## Minimal pairs (`content/minimal-pairs.json`)

| Contrast | Source | Status |
|---|---|---|
| Long vowel before one consonant, short before two (*man/mann*). | WP phonology ("long vowels occurring in stressed syllables before single consonants") | sourced |
| Preaspiration before *kk*, *tt* (*tak/takk*, *hatur/hattur*). | WP phonology; W takk [ˈtʰahk], hattur [ˈhahtʏr] | sourced |
| *ll* like "tl" (*hala/halla*). | W halla [ˈhatla]; WP phonology | sourced |

## Language notes in the interface (`js/i18n/*.json`, landing page)

| Key | Claim | Source | Status |
|---|---|---|---|
| `landing.soundsText` | *hv* like kv, *ll* like tl, long and short vowels. | W hvað [ˈkʰvaːð]; W halla; WP phonology | sourced |
| `landing.soundsExample` | *sl* is often said with a t in between. | W Ísland ([ˈistlant] as one word, [ˈiːs.lant] as a compound) | corrected: was "is said"; now "is often said" |
| `landing.bridgeExample` | *hestur* and Norwegian *hest*. | `data/bridge.json` | sourced |
| `landing.say`, `brand.mascot.meaning` | *tölva* from *tala* and *völva*; *tala* is speech and number. | W tölva, tala | sourced |
| `feedback.reason.*` | Accents change words. | W dýr ("animal", "expensive") and dyr ("door") | sourced (the old example *ar*/*ár* in this file was wrong: *ar* is not an Icelandic word) |

## Generated audio (`data/audio/`)

The four Piper voices sometimes mispronounce: *Ísland* comes out as [ˈisland], without the t that Wiktionary gives for the single-word pronunciation. Word highlighting uses estimated timings.

## Norwegian bridge (`data/bridge.json`, `js/bridge-rules.js`)

156 pairs are sourced (Bokmålsordboka and Wiktionary name the same Old Norse word), 5 are shared loans (Wiktionary names the source language). 8 pairs only look alike with the same meaning and are labeled in the app as "a shared origin is not confirmed". The spelling patterns describe spelling, not historical sound laws.

