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
| WP-IO | Wikipedia, [Icelandic orthography](https://en.wikipedia.org/wiki/Icelandic_orthography) (the table of letters, names and sounds) |
| WP-NO | Wikipedia, [Norwegian orthography](https://en.wikipedia.org/wiki/Norwegian_orthography) and [Norwegian phonology](https://en.wikipedia.org/wiki/Norwegian_phonology) (Urban East Norwegian) |
| elon | elon.io Icelandic grammar: [time prepositions](https://elon.io/grammar/icelandic/prepositions/time-prepositions), [dates and time](https://elon.io/grammar/icelandic/numbers/dates-and-time), [possessive placement](https://elon.io/grammar/icelandic/pronouns/possessive-placement), [temporal conjunctions](https://elon.io/grammar/icelandic/conjunctions/temporal), [dummy það](https://elon.io/grammar/icelandic/syntax/dummy-thad) |
| islenzka | [islenzka.net, telling time](https://islenzka.net/telling-time/) |
| Transparent | Transparent Language Icelandic blog, [articles](https://blogs.transparent.com/icelandic/?p=5771) |
| Weather verbs | Eyþórsson and Sigurðardóttir, [A Brief History of Icelandic Weather Verbs](https://projekt.ht.lu.se/fileadmin/_migrated/content_uploads/4._Eythorsson-Sigurdardottir.pdf) |
| UCSC | [Icelandic handout, UC Santa Cruz](https://babel.ucsc.edu/~hank/114/icelandic.pdf) |
| V2 | Lund working papers on Icelandic word order, e.g. [Xu and Angantýsson, WPSS 111](https://projekt.ht.lu.se/fileadmin/user_upload/sol/ovrigt/projekt_grimm/working_papers/2024-dec/WPSS_111.pdf) |
| BMO | [Bokmålsordboka](https://ordbokene.no) (Universitetet i Bergen og Språkrådet) |
| ÍFÚ | Menntamálaráðuneyti, *Íslenska fyrir útlendinga – grunnnám. Námskrá* (2008), [PDF](https://www.stjornarradid.is/media/menntamalaraduneyti-media/media/ritogskyrslur/namskra_islenska_fyrir_utlendinga_2.pdf); page numbers as printed |

Status: **sourced** (a grammar or dictionary states it), **attested** (only shown by Tatoeba sentences or DMII Core forms, which the text then cites), **corrected** (changed after checking; the change is described).

In the content files, `"reviewed": true` means that every hand-written claim in the file is listed here with its source. `npm run validate` lists any file still marked `false`.

## Levels and goals (`content/goals.json`, `content/units/index.json`)

| Claim | Source | Status |
|---|---|---|
| The curriculum's four stages of 60 hours "train the skills that correspond to A1–A2" (*Áföngunum fjórum í námskránni er ætlað að þjálfa þá færni sem samsvarar viðmiðunarrömmum A1 – A2*). | ÍFÚ p. 4 | sourced |
| Stages 1–2 are A1, stages 3–4 are A2. | the course's reading of ÍFÚ, which does not split the stages by level ([docs/PLAN.md](../docs/PLAN.md)) | design choice |
| The 16 goals are the stages' final goals (*lokamarkmið*, printed in bold), quoted in `is` with stage and page, translated to English and Bokmål for the app. | ÍFÚ pp. 7–13 | sourced (translations by the course) |
| A level is about 800 words. | Duolingo's blog, "How are Duolingo courses evolving?" (2019): "about 800 words introduced at each level"; no Icelandic source gives a count | sourced (for Duolingo's courses) |

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
| *gift*, *giftur* in *Ég er gift*, *Er hún gift?* and five more are the adjective *giftur* ("married"), not the participle of *gifta* the parser reads; *gifta sig* stays the verb. | W giftur (adjective, "married"); DMII (*giftur* lo); translations of T 469356, 476778, 479374, 488544, 690287, 738927, 1318023 | sourced |
| The parser's dative for a meal after *í*, *eftir*, *fyrir* is not kept. | T: all 14 sentences with a definite meal after *eftir* or *fyrir* have the accusative; elon (*eftir matinn*) | sourced |
| In a sentence without a verb, the parser's case is not kept. | *Góða nótt*: W góður (strong masc. acc. *góðan*, fem. acc. *góða*), so the greeting is not the nominative the parser picks | sourced |

The parser itself is not checked case by case: `npm run build:tags` lists the 221 words it gives to another word than their spelling suggests.

## Unit guidebooks (`content/units/`)

Headings name the units rather than their numbers, because new units are inserted into the path (see `content/units/index.json`). Unit titles are single course words, each in the DMII Core. Which words are taught together is a design choice, made by running the lesson generator over each grouping (`docs/DECISIONS.md`).

### *Halló* and *Kaffi*

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

### *Um mig*

| Claim | Source | Status |
|---|---|---|
| *sæll* is "happy" and a greeting; *komdu sæll* when meeting, *vertu sæll* when leaving, "come happy", "be happy" word for word. | W sæll ("happy, content"; "hello (a greeting)"; derived *vertu sæll*); W vertu sæll ("goodbye (speaking to a man)"); W koma, vera (imperatives *komdu*, *vertu*); T 10628605, 3838986 | sourced |
| *sæll* agrees with the person spoken to: *sæll* (a man), *sæl* (a woman), *verið þið sæl* (several, neuter plural). | DMII (*sæl* FSB-KVK-NFET and FSB-HK-NFFT); T 3838986, 3838987, 5007770; WP (neuter plural for a mixed group, as in the *Orð* guidebook) | sourced |
| Norwegian *sæl* (happy, glad) is the same word, Old Norse *sæll*. | BMO sæl ("lykkelig, glad"; etymology "norr. sæll") | sourced |
| *kynna* is "introduce"; *kynna X fyrir Y*. | W kynna ("to introduce"); T 743237, 828368 | sourced |
| *kynnast* is *kynna* + -st, "get to know", with the person in the dative. | W kynnast ("From kynna + -st"); W kynna ("to become acquainted with"); T 868561 (*honum*), 518532 (*henni*) | sourced (dative attested) |
| -st comes from the old reflexive pronoun; Norwegian has -s in the same use: *sjást*/*sees*, *hittast*/*møtes*. | W -st ("From Old Norse -sk, reduced form of the reflexive pronoun sik"; "turns verbs into middle voice verbs"); W sjást ("to see each other"), hittast ("to meet each other"); BMO sees ("se hverandre"), møtes ("møte hverandre") | sourced |
| *gaman* is "fun"; *gaman að sjá þig*. | W gaman ("fun, pleasure"; derived *gaman að sjá þig*); T 12701227 | sourced |
| *fyrirgefðu* is the imperative of *fyrirgefa* with *þú* joined on, "excuse me, sorry". | W fyrirgefðu ("The imperative form of the verb fyrirgefa"; "excuse me, sorry"); DMII (GM-BH-ET *fyrirgefðu*, the clitic -ðu as in the *Gata* guidebook) | sourced |
| *afsakið* is the plural imperative of *afsaka* and is used to one person too; *afsakaðu* is the singular. | W afsakið ("Plural imperative mood of afsaka"; example *Afsakið, en gætirðu fært þig?*, with *gætirðu* to one person); W afsaka (*Afsakaðu mig*); DMII (GM-BH-FT *afsakið*, GM-BH-ET *afsakaðu*); T 870842, 870843 | sourced |
| *Gætirðu endurtekið þetta?* "could you repeat that?". | T 1356534; W endurtaka ("to repeat") | attested |
| *fæðast* is *fæða* + -st, "be born"; *ég fæddist*. | W fæðast ("From fæða + -st"; "to be born"); W fæða ("to give birth to"); T 542128, 1337013 | sourced |
| *flytja* "move", past *flutti*. | W flytja ("to move (between homes)"); DMII (*flutti*, GM-FH-ÞT); T 1324559 | sourced |
| *Íslendingur* and *Norðmaður* are written with a capital letter, *íslenskur*, *norskur* and *íslenska* are not. | W Íslendingur, Norðmaður (capitalized headwords: "Icelander", "Norwegian"); W íslenskur, norskur, íslenska (lowercase headwords) | attested |
| *kennitala* is the national identification number, *kenni* (mark) + *tala* (number). | W kennitala ("national identification number"; "From kenni n (“sign, mark”) + tala f (“number”)") | sourced |
| *heimilisfang*, *símanúmer*, *netfang* are neuter and end in -ið with the article; *kennitala* is feminine; *þitt*, *mitt* are the neuter of *þinn*, *minn*. | DMII (genders, NFETgr *símanúmerið*, *heimilisfangið*; *þitt*, *mitt* HK-NFET); T 466872, 1368317 | attested |
| *skilaboð* has only plural forms. | W skilaboð ("plural-only"); DMII (only FT forms) | sourced |
| A letter ends with *kveðja* or *kærar kveðjur*; *skila kveðju* is to send one's regards. | W kveðja ("regards, a greeting at the end of a letter": *Kveðja, Gunna*, *Kærar kveðjur, Jóhann*; derived *skila kveðju*); T 387054, 675073 | sourced |

### *Fjölskylda*

| Claim | Source | Status |
|---|---|---|
| *faðir, móðir, bróðir, systir, dóttir*: -ur in the singular; *feður, mæður, bræður, dætur*, but *systur*. | DMII | attested |
| Possessives follow the noun and agree with it; most nouns take the article first (*kötturinn minn*), family words usually not (*bróðir minn*). | elon (possessive placement); Transparent; WP (possessive table) | corrected: husband and wife do take the article (*maðurinn minn*, *konan mín*), as Transparent and elon note; the guidebook now says so |
| *hans* and *hennar* never change. | WP: they are the genitives of *hann* and *hún*, so they do not agree with the noun | sourced |
| *sinn* refers back to the subject, as Norwegian *sin*. | W sinn ("third-person reflexive possessive"); BMO sin | sourced |
| *eiga* for family and things; *á, átt, á, eigum*; accusative object. | W eiga ("to have, to be closely related to", *Ég á skemmtilega konu*) | sourced |
| *búa*: *bý, býrð, býr*. | DMII | attested |
| Five to twenty do not inflect; *Hún er átta ára*. | WP; DMII (*ára* EFFT); T 10633141 | sourced |

### *Gata*

| Claim | Source | Status |
|---|---|---|
| *í*, *á*: dative for a place, accusative for a direction; the preposition is learned with the place (*í skóla*, *á sjúkrahúsi*). | elon; T (DECISIONS, unit 4) | sourced |
| *til* + genitive; *frá*, *úr*, *hjá* + dative; the pairs *í/úr*, *til/frá*, *á/af*. | W til, frá, úr, hjá, af ("off, from") | sourced |
| *hvar*, *hvert*, *hvaðan*; *hingað*, *þangað*. | WP ("where/whither/whence"); W hingað ("here (movement)"), þangað ("there (in that direction)") | sourced |
| Imperative: stem + *þú* as -ðu, -du, -tu; *gakktu*. | W (*hjálpaðu*, *vinndu*, *þekktu*, *lokaðu*); WP (*Talarðu*); DMII (GM-BH-ET forms) | sourced |

### *Tími*

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

### *Búð*

| Claim | Source | Status |
|---|---|---|
| Adjectives agree, also after *vera*; neuter -t. | WP (*íslenskt*); DMII | sourced |
| Weak after a definite noun (*gamli maðurinn*), strong otherwise. | WP ("If an adjective is modified by the article, or most pronouns, weak declension is used") | sourced |
| Comparison -ri, -ari, -astur; *eldri*, *yngri*, *stærri*, *minni*. | DMII (MST, ESB forms) | attested |
| Person in the dative, thing in the accusative with *kaupa*, *selja*, *gefa*. | T 740802, 888066, 4007820 | attested |
| *hundrað*, *þúsund* count as neuter (*tvö þúsund*). | T 827774; DMII | attested |
| *með* + dative for company, + accusative for what one brings or has. | W með ("with dative or accusative", *með konunni minni*); T 3799264, 698251, 388901 | sourced |
| *án* + genitive; *af* + dative; *Af hverju?* | W án, af | sourced |

### *Veður*

| Claim | Source | Status |
|---|---|---|
| Weather verbs take an empty *það*, left out when another word comes first. | Weather verbs (*Það rignir í dag* / *Í dag rignir*); elon (dummy *það*); T 386152 | sourced |
| *Mér er kalt*: a dative subject; *líka* with the dative. | UCSC ("me-DAT is cold"); W líka ("strict dative-nominative verb") | sourced |
| *úti/út*, *inni/inn*, *heima/heim*: place and direction. | W heima ("at home"), heim ("(towards) home"), úti, inni; WP ("Inn and út denote motion") | sourced |
| *sjá*: *sé, sérð, sér, sá*; *horfa á* + accusative; *heyra* + accusative, *heyra í* + dative. | DMII; W horfa, heyra; T 488512 | sourced |
| *eldfjall* = *eldur* + *fjall*; *norðurljós* = *norður* + *ljós*. | W eldfjall, norðurljós | sourced |
| Norwegian relatives (*vær*, *fjell*, *foss*, *jøkel*, *sky*, *sol*, *vind*). | `data/bridge.json` (BMO and W name the same Old Norse word) | sourced |

### *Vinna*

| Claim | Source | Status |
|---|---|---|
| Languages are feminine nouns in -a with a small letter; accusative after *tala*. | Ritreglur §1.3.4 ("Heiti tungumála … eru rituð með litlum upphafsstaf", example *íslenska*) and §1.3.1 (small letter by default, so also *íslenskur*); DMII; T 1322938 | sourced |
| *vita* a fact, *þekkja* a person, *kunna* a skill. | W vita, þekkja, kunna | sourced |
| *geta* takes the supine. | W geta (usage note: "requires the supine (sagnbót) form … rather than the bare infinitive") | sourced |
| *hjálpa*, *svara*, *loka* take a dative object; *opna* the accusative. | W hjálpa; T 763491, 828852, 828861 | sourced (hjálpa), attested (svara, loka, opna) |
| The past in -aði, -ði, -di, -ti; strong verbs change their vowel. | DMII | attested |
| *vinna* is "work" and "win". | W vinna (*Ég vann!* "I won!") | sourced |

### *Orð*

| Claim | Source | Status |
|---|---|---|
| *verða að*, *þurfa að*; *mega* with the bare infinitive. | T 1321351, 1353611, 473398, 1315570; W mega | sourced |
| Norwegian *må* usually means must, Icelandic *má* usually may. | W mega ("may, be allowed"; also "must"); BMO måtte (permission and necessity) | corrected: was "means"; both words have both senses |
| *þessi* agrees; *þetta* introduces a plural. | DMII; T 647412 | attested |
| *hver* inflects, *hvaða* does not. | WP; DMII (every slot *hvaða*) | sourced |
| A mixed group takes the neuter plural. | WP ("the neuter for either an all neuter or a mixed-gender group") | sourced |
| *að* is "that" and the infinitive marker; *sem*, *ef*. | WP (complementizer *að*); W (infinitives *að heita*) | sourced |
| *líka* the adverb and the verb. | W líka | sourced |

### *Nýyrði* (bonus)

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

The sentences are unchanged Tatoeba sentences, each readable after the unit the story follows (only words from that unit and earlier ones). Their choice, order and speaker labels are design choices, not claims. Which cast member speaks a dialogue (`"cast"`) or tells a reading (`"narrator"`) is a design choice too; so is each unit host's greeting (`"host"` in the unit files), an unchanged Tatoeba sentence shown with its Tatoeba translation.

## Bokmål translations (`content/translations-nb.json`)

Tatoeba has a Bokmål translation for 28 of the 1,876 sentences. The other 1,843 (all but five excluded ones) were translated by hand for TÖLVA, from the Icelandic, with Tatoeba's English translation as a check. A translation is a claim about meaning; these are checked as follows.

| Check | Source | Status |
|---|---|---|
| Every word is a Bokmål word form: a headword or inflected form, a word of a headword expression (*morges* in *i morges*, *tide* in *på tide*), a genitive of such a form, or a compound of two (*svømmehall*, *klimaanlegg*) | BMO, looked up by `npm run validate` (`scripts/lib/bokmal.mjs`) | sourced (word forms) |
| Names: kept as in the Icelandic sentence (Tom, Mary), or in their usual Norwegian form (Island, Tyskland, Sveits, Genève, Moskva), listed in the file's `names` | the place names are the Norwegian exonyms; *Hótel Ísland* keeps its own name | design choice |
| The sentence ends like the Icelandic (or like Tatoeba's English, where the Icelandic has a typo, such as *Má ég fara með þér.*) | `npm run validate` | checked |
| Options of one choice exercise never share a translation, in English or Bokmål | `tests/engine.test.mjs` | checked |

Conventions: common-gender forms for feminine nouns (*boken*, *klokken*, *døren*, as the app's Norwegian interface writes *ordboken*), «» for quoted speech, *du* for *þú* and *dere* for *þið*, Norwegian idiom where the Icelandic is idiomatic (*Takk for maten*, *Det har du godt av*, *Det var på tide*). Where Icelandic separates sentences that Bokmål cannot (gender of *þeir*, *þær*, *þau*; *velkominn* and *velkomin*), the translations are the same.

## Bokmål glosses (`content/glosses-nb.json`)

Wiktionary gives a Bokmål gloss for 315 of the 360 course words. The other 45 were glossed by hand from the word's English Wiktionary meaning (W) and its use in the course sentences, and 64 of Wiktionary's were corrected (below). Every word of every gloss the app shows, from Wiktionary or by hand, is a Bokmålsordboka form (BMO, checked by `npm run validate`), and a gloss of several words is one of the file's `phrases` (Bokmål expressions such as *av og til*, *se på*, *få lov til*). The first gloss is the one exercises show.

| Words | Glosses | Note |
|---|---|---|
| takk, bless, mamma, níu, núna, bara, sem, sig, sinn, enginn, einhver | takk; ha det; mamma; ni; nå; bare; som; seg; sin; ingen; noen | the plain equivalents |
| heita, hitta, hringja, keyra, rigna, hætta | hete; treffe; ringe; kjøre; regne; slutte | verbs, shown with *å* |
| geta, kunna | kunne; beherske | both are "can" in Bokmål; *kunna* (know, master a skill or a language) gets *beherske* so that the two never look alike as options |
| af, úr, yfir, við, hjá, fyrir | av; ut av; over; ved; hos; for | prepositions, each by its first sense in W; *hjá* (at someone's place) is *hos* |
| hvaðan, beint, inni | hvorfra; rett; inne | |
| buxur, húfa, hjól, sími, sundlaug, tölvupóstur, þota, norðurljós, kvöldmatur, skemmtilegur | bukse; lue; sykkel; telefon; svømmebasseng; e-post; jetfly; nordlys; middag; morsom | *kvöldmatur* (the evening meal) is *middag*, the day's hot meal, with *kveldsmat* second |
| réttur, kynna, heilsa, afsaka, kennitala, netfang | riktig, rett; presentere, introdusere; hilse; unnskylde; personnummer; e-postadresse | the adjective "right, correct" (W's third sense, the one in the course sentences, *Það er rétt*, *rétta svarið*); "to introduce"; "to greet"; "to excuse"; "national identification number" (BMO personnummer: the Norwegian number of the same kind); "e-mail address" |
| sæll | hei, ha det, sæl | W's senses "hello (a greeting)" and "happy"; the course sentences use it to greet and take leave (*Komdu nú sæll*, *Vertu sæll*), and *sæl* (BMO "lykkelig, glad") is the same Old Norse word |

### Wiktionary glosses corrected (`"fixes"`)

The Bokmål glosses from Wiktionary are copied from the translation table of the English entry that lists the Icelandic word, so a row of another sense, another word class or a mistake in the table came along. Each correction keeps the Icelandic sense of W (the first sense, unless noted) and gives the Bokmål word BMO has for it; every new word was looked up in BMO. The file repeats Wiktionary's list, so `npm run validate` fails if Wiktionary changes it.

| Words | Was (first gloss) | Now | Why (W sense; BMO) |
|---|---|---|---|
| vera | bli | være | "to be"; *bli* is "become" (*verða*), and the third gloss was "være or være lik", two glosses run together |
| elska | kjærlighet | elske | "to love", a verb; *kjærlighet*, *elsk* and *kjærleik* are nouns |
| búa | bo bu | bo | "to reside, to live"; two words run together |
| rauður | röd | rød | *röd* is Swedish and not in BMO; *rødlig* is "reddish" |
| panta | ordne | bestille | "to reserve, to order"; *ordne* is "arrange, sort out" |
| eftir | senere | etter | "after", a preposition; *senere*, *seinere*, *etterpå* are adverbs ("later") |
| þessi | den | denne, dette | "this"; *den*, *det* are "that, it" |
| mega | kan | få lov til, måtte | "to be allowed, may", second "must"; *kan* is a present tense, not an infinitive (the app showed "å kan"), and the unit 9 guidebook notes that *må* usually means "must" |
| vinna (verb) | arbeid | arbeide, jobbe, vinne | "to work", also "to win" (the unit 8 guidebook); *arbeid*, *jobb*, *verk* are nouns |
| úti, heima | ut; hjem | ute, utenfor; hjemme | "outside", "at home": the place, which the unit 7 guidebook teaches as *ute*, *hjemme* against *ut*, *hjem* (*út*, *heim*) |
| velkominn | kjærkommen | velkommen, kjærkommen | "welcome", as in a greeting (*Velkomin til San Francisco*); *kjærkommen* is "a welcome change" and stays second |
| poki | veske | pose, sekk | "bag, sack"; *veske* is a handbag; the course sentences translate *poka* as *pose* |
| hlusta | høre | lytte, høre på | "to listen"; *høre* is "hear" (*heyra*) |
| horfa | se | se på | "to look at, to watch" (the unit 7 guidebook: *horfa á*); *se* is "see" (*sjá*) |
| sá | det | den | "that (one), the (one)" (*sá sem*, *den som*); *det* is *það* |
| líka (adverb) | dessuten | også | "also, too"; *dessuten* is "moreover" |
| vinur, vinkona | venn (both) | venn; venninne, venn | "friend"; "female friend": *venninne* (BMO) |
| frændi, frænka | slektning (both) | onkel, fetter, slektning; tante, kusine, slektning | "a male relative, especially an uncle or a male cousin"; the female; the course sentences translate them as *onkel*, *fetter*, *tante*, *kusine* |
| bær | by | by, gård | "town", second "farm" |
| fara | reise | dra, reise, fare | "to go, to leave"; *reise* is "travel" |
| seint | sein | sent, seint | an adverb ("late"); *sein* is the adjective |
| stundum | stundom | av og til, iblant, stundom | "sometimes"; *stundom* is old-fashioned |
| köttur | huskatt | katt | "cat"; *huskatt* is "house cat" |
| hátalari | høgtaler | høyttaler | "loudspeaker": the usual spelling |
| sjór | hav | sjø, hav | "sea"; *hav* is "ocean" (Icelandic *haf*) |
| eiginkona | hustru | kone, hustru, frue | "wife": *kone* is the everyday word |
| fá | få tak i | få, få tak i, oppnå | "to receive, to get"; *få tak i* is "get hold of" |
| nemandi | student | elev, student | "student, pupil"; a school pupil is an *elev* |
| ef | dersom | hvis, dersom, om | "if": *hvis* is the everyday word |
| leita | søke | lete, søke | "to search, look for" (*leita að*, *lete etter*) |
| flytja | flytte seg | flytte | "to move (between homes)", also "to move something"; *flytte seg* is "move out of the way" |
| fæða | bære | føde | "to give birth to"; *bære* and *fram* were *bære fram* (bring forth), split in two |
| skilaboð | budskap | beskjed, melding, budskap | "message", in the course sentences one left for someone (*skilja eftir skilaboð*, *legge igjen en beskjed*); *budskap* is a message in the sense of what a text says |

Later glosses (shown in the dictionary only) removed for the same reasons: another sense (*frá* mot "toward", *tala* preke "preach", *skilja* kunne, *nótt* kveld and aften "evening", *dagur* døgn "24 hours", *kirkja* gudstjeneste "church service", *tími* tempo and klokkeslett, *mínúta* øyeblikk "moment", *nýr* nåværende "current", *eða* ellers "otherwise", *fólk* lyd (old "people", today "sound"), *strákur* kamerat and kompis "buddy", *ský* støvsky "dust cloud", *systir* storesøster and lillesøster, *hnífur* knivblad, *veira* datavirus, *sætur* sukkertilsatt, *þú* De and I, the polite and the old plural "you"), a noun for a verb (*svara* svar, *ganga* gåtur, *taka* opptak), a parsing remnant (*barn* "barn n mindreårig"), and words BMO does not list (*byrja* børje, *kaffihús* café, *garður* have, *hæ* heisan, *snjór* sne, *tuttugu* tyve). Added from W's senses: *skilja* skille ("to separate"), *tími* time ("hour"), *tala* prate.

## Bokmål etymologies (`content/etymology-nb.json`)

The 345 etymologies the dictionary shows come from English Wiktionary; for the Norwegian interface they were translated by hand. A translation adds no claim of its own: it says what the English says. Conventions: language names in Bokmål (Old Norse *norrønt*, Proto-Norse *urnordisk*, Proto-Germanic *urgermansk*, Proto-Indo-European *urindoeuropeisk*, Old English *gammelengelsk*, Middle Low German *middelnedertysk*, Ancient Greek *gammelgresk*), glosses in «», cited forms unchanged. Left out: Wiktionary's "Etymology tree" lists, which repeat the text after them, and slips in the English (the typo "Frin", a "[Term?]" placeholder). *loka* has no translation: its English only says "See Etymology 1." Every word of the translations is a form in Bokmålsordboka (`npm run validate`), except cited forms and these names:

| Name | Source | Status |
|---|---|---|
| *urindoeuropeisk*, *urindoeuropeiske* (Proto-Indo-European) | Norwegian Wikipedia, [Urindoeuropeisk](https://no.wikipedia.org/wiki/Urindoeuropeisk) | sourced |
| *urslavisk* (Proto-Slavic) | [Urslavisk](https://no.wikipedia.org/wiki/Urslavisk) | sourced |
| *kasjubisk* (Kashubian) | [Kasjubisk](https://no.wikipedia.org/wiki/Kasjubisk) | sourced |
| *oldgutnisk* (Old Gutnish) | [Gutnisk](https://no.wikipedia.org/wiki/Gutnisk) ("oldgutnisk (forngutnisk)"; the article does not use "gammelgutnisk") | sourced |
| *älvdalsk* (Elfdalian) | [Älvdalsk](https://no.wikipedia.org/wiki/%C3%84lvdalsk) | sourced |
| *norn* (Norn) | [Norn](https://no.wikipedia.org/wiki/Norn) | sourced |
| *vestgermansk urspråk* (Proto-West Germanic) | [Vestgermanske språk](https://no.wikipedia.org/wiki/Vestgermanske_spr%C3%A5k) ("et vestgermansk urspråk"; there is no article "urvestgermansk") | sourced |

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

## Letters and sounds (`content/letters.json`)

Names and sounds of the letters are from WP-IO's table (read on the page on 2026-11-24); Norwegian values from WP-NO and Wiktionary's Bokmål sections. IPA of the example words is Wiktionary's, from the lexicon. The tags in the app (new letter, another sound, close to Norwegian, as in Norwegian) are the course's summary of these comparisons: "close" where the IPA differs a little (a [a] and [ɑ], v [v] and [ʋ], a long ö [œː] and a long ø [øː]), "as in Norwegian" where both sources give the same sound.

| Item | Claim | Source | Status |
|---|---|---|---|
| alphabet | 32 letters in the order a á b d ð e é f g h i í j k l m n o ó p r s t u ú v x y ý þ æ ö; c, q and w only in words of foreign origin and some names; z dropped from the spelling in 1973, kept in names (*Zakarías*) | WP-IO | sourced |
| names | The names and their IPA: a [aː], á [auː], bé [pjɛː], dé [tjɛː], eð [ɛːθ], e [ɛː], é [jɛː], eff [ɛfː], ge [cɛː], há [hauː], i [ɪː], í [iː], joð [jɔːθ], ká [kʰauː], ell [ɛtl̥], emm [ɛmː], enn [ɛnː], o [ɔː], ó [ouː], pé [pʰjɛː], err [ɛr̥ː], ess [ɛsː], té [tʰjɛː], u [ʏː], ú [uː], vaff [vafː], ex [ɛks], ufsilon y [ˈʏfsɪlɔn ɪː], ufsilon ý [ˈʏfsɪlɔn iː], þorn [θɔ(r)tn̥], æ [aiː], ö [œː] | WP-IO | sourced |
| a | [a]; before ng and nk [au], as á (*ganga*); further forward than Norwegian a | WP-IO (vowel table, column "before ng or nk"); W ganga [ˈkauŋka]; WP phonology ("/a/ is central [ä]"); WP-NO (a short /ɑ/, *arg*; long /ɑː/, *far*) | sourced |
| á | [au], not a long a; never the a of Norwegian *far* | WP-IO; WP-NO (*far*, /ɑː/) | sourced |
| b, d | [p], [t] without aspiration; Icelandic tells b from p by aspiration, not voice | WP-IO; WP phonology ("an aspiration contrast between plosives, rather than a voicing contrast"); WP-NO (voiced /b d ɡ/ in the consonant table) | sourced |
| ð | [ð] between vowels and at the end of a word; [θ] before a pause; the th of English *this*; Norwegian has neither [ð] nor [θ] | WP-IO; WP phonology ("devoiced before a pause"); W this /ðɪs/; WP-NO (consonant table) | sourced |
| e | [ɛ], long and short; before ng and nk [ei] (*enginn*); like the short e of Norwegian *pest* | WP-IO; W enginn [ˈeiɲcɪn(ː)]; WP-NO (e short /ɛ/ *pest*, long /eː/ *evig*) | sourced |
| é | [jɛ]: *ég* [jɛːɣ]; Norwegian may add é to tell two words apart (*én gutt*, *en gutt*) | WP-IO; W ég; WP-NO ("Diacritics": not compulsory, added to clarify homonyms) | sourced |
| f | [f] at the start of a word; [v] between vowels and at the end of a word after a vowel (*hafa* [ˈhaːva], *gjöf* [ˈcœːv]); [p] before n (*nafn* [ˈnapn̥]) | WP-IO; WP phonology (*grafa* [ˈkraːva], *grafna* [ˈkrapna]); W hafa, gjöf, nafn | sourced. The f rows of WP-IO's table were hard to read in the copy fetched, so each value is also checked against the Wiktionary IPA and the phonology page |
| g | [k] without aspiration at the start (*gata* [ˈkaːta]); [c] before e, i, y and æ (*gefa* [ˈcɛːva]); [ɣ] between vowels (*dagur* [ˈtaːɣʏr]); [j] after a vowel before i or j (*segja* [ˈseija]) | WP-IO; W gata, gefa, dagur, segja; WP phonology (V+g+V [ɣ]; gi [jɪ]) | sourced |
| h | [h], as Norwegian /h/; hl, hn, hr voiceless (*hlusta* [ˈl̥ʏsta], *hnífur* [ˈn̥iːvʏr]) | WP-IO; W; WP-NO | sourced |
| i, y | [ɪ], long and short, alike; the short i of Norwegian *litt* | WP-IO (i and y share a row); WP-NO (i short /ɪ/ *litt*) | sourced |
| í, ý | [i], alike; the long i of Norwegian *mil* | WP-IO; WP-NO (i long /iː/ *mil*) | sourced |
| j, l, m, n, s | as Norwegian /j l m n s/ | WP-IO; WP-NO (consonant table) | sourced |
| k | [kʰ] at the start, as Norwegian; [cʰ] before e, i, y, æ, ei, ey (*kennari* [ˈcʰɛn(ː)arɪ], *keyra* [ˈcʰeiːra]); no aspiration after s (*skór*), as in Norwegian | WP-IO; W kennari, keyra; WP-NO ("/p, t, k/ are aspirated"; after /s/ unaspirated) | sourced |
| o | [ɔ], long and short (*koma* [ˈkʰɔːma]); the o of Norwegian *opp*; not the o of Norwegian *bok* | WP-IO; W koma; W opp /ɔpː/, bok /buːk/ (Bokmål); WP-NO (o: long mostly /uː/) | sourced |
| ó | [ou]: *bók* [ˈpouːk] | WP-IO; W bók | sourced |
| p, t | [pʰ], [tʰ] at the start, as in Norwegian | WP-IO; WP-NO | sourced |
| r | trilled or tapped [r]; voiceless [r̥] next to aspirated consonants and before a pause (*svartur* [ˈsvar̥tʏr]) | WP-IO; W svartur, kort, kirkja; WP-NO (flap, occasionally trilled) | sourced. The app says "before p, t and k ... often" for WP-IO's "aspirated consonants" |
| u | [ʏ], long and short; before ng and nk [u] (*ungur* [ˈuŋkʏr]); like the y of Norwegian *lykke*, not the u of *gutt* | WP-IO; W ungur; W lykke [ˈlʏʷ.kə], gutt /ɡʉt/ (Bokmål) | sourced |
| ú | [u]: the o of Norwegian *bok*, not the u of Norwegian *hus* | WP-IO; W bok /buːk/, hus /hʉːs/ (Bokmål) | sourced |
| v | [v]; Norwegian /ʋ/, "sometimes a fricative" | WP-IO; WP-NO | sourced |
| x | [ks], as Norwegian *sex* /seks/ | WP-IO; W sex (Icelandic [ˈsɛks]; Bokmål /seks/) | sourced |
| y, ý | not rounded, unlike Norwegian y (/ʏ/, /yː/) | WP-IO; WP-NO | sourced |
| þ | [θ], the th of English *thin*; at the start of words (*þú*, *þrír*) | WP-IO; WP phonology ("[θ] is used morpheme-initially"); W thin /ˈθɪn/ | sourced |
| æ | [ai]; not Norwegian æ (/ɛ, eː/, /æ/ before r); close to Norwegian ai in *hai* (/ɑɪ̯/) | WP-IO; WP-NO | sourced |
| ö | [œ], long and short; the short ø of Norwegian *kjøtt* | WP-IO; W kjøtt /çœt/ (Bokmål); WP-NO (ø short /œ/, long /øː/) | sourced |
| hv | [kʰv] (*hvítur* [ˈkʰviːtʏr]); Norwegian hv is /v/ (*hvit* [ˈviːt]); kv sounds the same (*kvöld* [ˈkʰvœlt]) | WP-IO; W hvítur, kvöld; WP-NO | sourced |
| hj | [ç] (*hjól* [ˈçouːl]), the sound of Norwegian kj (/ç/, *kjele*, *kjøtt*); Norwegian hj is /j/ (*hjelp*) | WP-IO; W hjól, kjøtt; WP-NO | sourced |
| kj | [cʰ] (*kjöt* [ˈcʰœːt]), not Norwegian kj [ç] (*kjøtt* /çœt/) | WP-IO; W kjöt, kjøtt | sourced |
| sj, sk | s and j (*sjór* [ˈsjouːr]); s and k before i, y (*ský* [ˈsciː]); Norwegian sj /ʂ/ (*sjuk*), sk before i, y /ʂ/ (*sky* [ʂy̫ː]) | W sjór, ský; WP-NO | sourced |
| ll | mostly [tl] (*bolli* [ˈpɔtlɪ], *fjall* [ˈfjatl̥]); [lː] at word-part boundaries, in loanwords and pet names (*halló* [ˈhal(ː)ou]); sl [stl] (*íslenska* [ˈistlɛnska]); Norwegian ll is a long l (*alle* [ˈâlːə]) | WP-IO; W bolli, fjall, halló, íslenska, alle (Bokmål) | sourced |
| nn | [tn] after "broad vowels (accent-bearing and graphical diphthongs)" (*einn* [ˈeitn̥], *grænn* [ˈkraitn̥]); a long n elsewhere (*finna*); rn mostly [tn] (*barn* [ˈpartn̥], [ˈpatn̥]); Norwegian rn is [ɳ] | WP-IO; W einn, grænn, finna, barn; WP-NO ("rn > [ɳ]") | sourced. "Gliding vowels (æ, au, ei, ey)" is the app's wording of "graphical diphthongs"; æ is attested by W grænn |
| au | [œy] (WP phonology: "/œi̯/ is phonetically [œy]"); close to Norwegian øy /œʏ̯/; Norwegian au is /æʉ̯/ (*raus*) | WP-IO; WP phonology; WP-NO | sourced |
| ei, ey | [ei], alike; close to Norwegian ei /æɪ̯/ (*meir*) | WP-IO; WP-NO | sourced |
| pp, tt, kk | a breath before the stop, [hp ht hk] (*takk* [ˈtʰahk], *nótt* [ˈnouht]); also before l, m, n (*epli* [ˈɛhplɪ], *vatn* [ˈvahtn̥], *vakna* [ˈvahkna]); Norwegian *takk* has none (/tak/, [tɑk]) | WP phonology ("Geminated sequences pp tt kk ... become preaspirated"); WP-IO; W takk (Icelandic and Bokmål) | sourced |
| long, short | a stressed vowel mostly long before one consonant and short before two (the exception is p, t, k, s before j, v, r); stress always on the first syllable; Norwegian: "short vowels are followed by two or more consonant letters", "long vowels are followed by at most one" | WP phonology; WP-NO | sourced |
| name audio | The voices read the written name "ufsilon y" as "ufsilon ufsilon i", so the audio says "ufsilon i" and "ufsilon í", which match WP-IO's IPA. The other names' phonemes from the voice are those of WP-IO, except that *eð* ends in a voiced [ð] where WP-IO has [θ] before a pause | the voice's phoneme output (espeak-ng, the same for all four voices), compared by hand | checked |

The drill asks "which spelling do you hear?" only with a word whose Wiktionary IPA has the sound at that place (`spot` in `js/engine/letters.js`): *a* in *ganga* is said [au] and is never asked as "a or á"; *ll* only where the IPA shows tl, *nn* only where it shows tn. Its wrong options never sound the same as the answer (i and y, í and ý are never offered together).

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

