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
| elon | elon.io Icelandic grammar: [time prepositions](https://elon.io/grammar/icelandic/prepositions/time-prepositions), [dates and time](https://elon.io/grammar/icelandic/numbers/dates-and-time), [possessive placement](https://elon.io/grammar/icelandic/pronouns/possessive-placement), [temporal conjunctions](https://elon.io/grammar/icelandic/conjunctions/temporal), [dummy það](https://elon.io/grammar/icelandic/syntax/dummy-thad); numbers: [1 to 4](https://elon.io/grammar/icelandic/numbers/overview), [cardinals 5 and up](https://elon.io/grammar/icelandic/numbers/cardinals-5-plus), [ordinals](https://elon.io/grammar/icelandic/numbers/ordinals), [ordinals in use](https://elon.io/grammar/icelandic/numbers/ordinals-in-use), [numbers in use](https://elon.io/grammar/icelandic/expressions/numbers-in-use) |
| islenzka | [islenzka.net, telling time](https://islenzka.net/telling-time/) |
| HÞ | Höskuldur Þráinsson (University of Iceland), *Kynhlutlaust mál* (2025), [PDF](https://uni.hi.is/hoski/files/2025/02/Kynhlutlaust-mal.pdf); page numbers as printed |
| WP-Tel | Wikipedia, [Telephone numbers in Iceland](https://en.wikipedia.org/wiki/Telephone_numbers_in_Iceland) |
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

| *þreytt*, *þreyttur* in *Ég var þreytt*, *Af hverju er Tom þreyttur?* and eight more are the adjective *þreyttur* ("tired"), not the participle of *þreyta* the parser reads. | W þreyttur (adjective, "tired"); DMII (*þreyttur* lo); translations of T 1316177, 1316178, 3795617, 1364312, 1364313, 477841, 10616898, 10616903, 382239, 476884 | sourced |
| *tilbúinn*, *tilbúin*, *tilbúið*, *tilbúnir* in *Allir eru tilbúnir*, *Er baðið tilbúið?* and four more are the adjective *tilbúinn* ("ready"), not the participle of *tilbúa* the parser reads. | W tilbúinn (adjective, "ready"); DMII (*tilbúinn* lo); translations of T 852821, 1316634, 1321848, 1323369, 3795750, 10973123 | sourced |
| *sofna* in *Þú mátt ekki sofna* is the verb *sofna* ("fall asleep"), not a plural of a noun *sofn* as the parser reads it; *hvíldum* in *Við hvíldum okkur einn á eftir öðrum* is the past of *hvíla*, which the parser leaves open. | W sofna; DMII (*sofna* infinitive; *hvíldum* GM-FH-ÞT-1P-FT); translation of T 7319832; the parser's own reading of T 673384, 673385 | sourced |
| *Farðu í sturtu* and *Ekki standa á fætur* take the accusative (a movement), not the dative and the nominative the parser gives; the two sentences keep no parser case. | the case rules for *í* and *á* with a movement (elon); the parser's accusative in T 664662, 698321 (*í sturtu*) and in ten sentences with *á fætur* | sourced |
| An ordinal is its own class in BÍN (rt) and an adjective to the parser: *þriðju* (lemma *þriðji*, class lo) is the course word *þriðji*. | DMII (class rt for *þriðji* to *tíundi*); the parser's output for *Ég bý á þriðju hæð* and *sjöunda skipti* | checked |
| *satt* in *Það er svo satt*, *Ég er sein, ekki satt?* and six more is the neuter of *sannur* ("true"), not of *saddur* ("full") as the parser reads it; a fix with lemma null marks it as a word outside the course. | W satt ("inflection of sannur: neuter singular"); translations of T 489143, 503350, 1324576, 1324577, 3799338, 4032163, 11537023, 11537032 | sourced |
| *saddur*, *södd* in *Ég er saddur!*, *Ég er södd.* and two more are the adjective *saddur* ("full"), not the participle of *seðja* the parser reads. | W saddur (adjective, "satiated, full"); DMII (*saddur* lo); translations of T 905135, 905137, 1316219, 1316220 | sourced |
| *salt* in *Þetta er ekki salt* is the noun, as its translation says ("This isn't salt."), not the neuter of the adjective *saltur* the parser reads. | translation of T 11208765 | sourced |
| *ísa* in *Tvo stóra ísa, takk* (made from T 488539) is the accusative plural of *ís* after *tvo*; the parser cannot analyze the sentence. | DMII (*ísa* ÞFFT of *ís*); T 488539 ("Two vanilla ice creams, please.") | sourced |
| *með* in the sense "along with" takes the dative, so *Hrísgrjón eru góð með sósu* and *með fiski* (made from T 382243) keep no parser case (it gives the accusative), and *fiski* there is *fiskur*, not the noun *fiski* ("fishing"). | W með (as in the *Búð* rows); T 870309 (*brauð með smjöri*); DMII (*fiski* ÞGFET of *fiskur*) | sourced |

The parser itself is not checked case by case: `npm run build:tags` lists the 306 words it gives to another word than their spelling suggests.

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

### *Tölur*

| Claim | Source | Status |
|---|---|---|
| 11 to 19 are *ellefu, tólf, þrettán, fjórtán, fimmtán, sextán, sautján, átján, nítján*; 13 to 19 end in -*tán*. | elon (cardinals 5 and up: the list, "all end in -tán"); W each word; BÍN via Ylhýra (the build) | sourced |
| *ellefu*, *tólf* are Norwegian *elleve*, *tolv*; where Icelandic has -*tán*, Norwegian has -*ten* (*tretten*, *fjorten*). | W ellefu ("Compare ... Norwegian and Danish elleve"), tólf ("Norwegian, Swedish, and Danish tolv"); BMO tretten, fjorten, femten, seksten, sytten, atten, nitten | sourced |
| From five up, numbers never change. | WP ("Other numbers are ... not declined"); elon (1 to 4: "Draw the line at four") | sourced |
| *telja* is "to count", also "to think, believe"; *talið*, *taldi*. | W telja ("to count; to believe, think"); DMII; T 868053, 384704 | sourced |
| The tens are *tuttugu, þrjátíu, fjörutíu, fimmtíu, sextíu, sjötíu, áttatíu, níutíu*, with ö in *fjörutíu* and *sjötíu*. | elon (cardinals 5 and up: the tens and the warning about ö); W þrjátíu, fjörutíu, fimmtíu ("From fjórir + tíu") | sourced |
| The ten comes first, then *og* and the unit: *tuttugu og fimm*. | elon (cardinals 5 and up: "tuttugu og einn", "þrjátíu og fjórir", "níutíu og níu"; "tuttugu einn" without og is wrong); W tuttugu og einn ("Literally, 'twenty and one'") | sourced |
| When you count with no noun in mind, one to four are masculine (*þrjátíu og einn*). | HÞ pp. 1-2 ("Nú skal ég telja upp að tíu: einn, tveir, þrír, fjórir... (ekki verið að telja neitt sérstakt)"; "málfræðilegt karlkyn er sjálfgefið í íslensku") | sourced |
| Before a noun the last number agrees with it, and after a number ending in one the noun is singular: *tuttugu og ein króna*, *þrjátíu og eins árs*. | elon (cardinals 5 and up: the noun is singular after "... og einn", "tuttugu og ein króna"); W tuttugu og einn (declined as *einn*); T 3995294 | sourced |
| *hundrað* and *þúsund* are nouns. | WP ("hundrað is actually a neuter noun, þúsund can be either feminine or neuter"); elon (cardinals 5 and up) | sourced |
| An Icelandic phone number has seven digits, written 567 1258. | WP-Tel ("seven digits long and generally written in the form xxx xxxx") | sourced |
| It is said as the first three digits one by one, then two pairs, each pair one number: *fimm sex sjö, tólf, fimmtíu og átta*. | elon (numbers in use: "567 12 34" said "fimm sex sjö — tólf — þrjátíu og fjögur"; digit by digit is "stilted") | sourced (the example keeps to pairs whose form no source disputes, see below) |
| *númer* (neuter) is a number that marks or identifies something, a phone number or a size; *tala* (feminine) is a number. | W númer ("number (indicating position in a list or sequence, or acting as an identifier)", "numerical size", "number as in phone number"); W tala ("number"); DMII (genders); T 385691, 10633179 | sourced |
| *Þú ert með vitlaust númer* is "you have the wrong number". | T 385691, 881353 | attested |
| Ordinals are written with a period (3.) and are *fyrsti, annar, þriðji, fjórði, fimmti, sjötti, sjöundi, áttundi, níundi, tíundi*; all but *annar* end in -i and decline as weak adjectives. | elon (ordinals: the list, "all of these except annar end in -i", the weak table of *fjórði*, *annar* strong); DMII (*þriðji*: KK-NFET *þriðji*, KVK-NFET and HK-NFET *þriðja*, KVK-ÞGFET and the plural *þriðju*) | sourced |
| *á þriðju hæð* is "on the third floor" (*hæð* is feminine). | elon (ordinals in use: "Skrifstofan er á þriðju hæð"); DMII (*hæð* kvk) | sourced |
| *annar* is "second" and "other"; Norwegian *andre* (second) comes from *annen*. | W annar ("other, another"; adjective "second"); BMO andre, annen 2 ("ordenstall til to (2.)", "av annen") | sourced |
| *fyrsti* is the weak form of *fyrstur*, "first". | DMII (*fyrstur* FVB-KK-NFET *fyrsti*); W fyrstur ("first") | sourced |
| Dates use ordinals: *5. júní* is said *fimmti júní*. | elon (ordinals: "5. júní is read aloud as fimmti júní") | sourced |
| *margur* is "many" (things counted), *mikill* "much" (an amount). | W margur ("many, a lot of"), mikill ("large in quantity or number; much"); T 469365, 511399 | sourced |
| The comparatives are *fleiri*, *fleira* (of *margur*) and *meiri*, *meira* (of *mikill*). | DMII (MST forms); T 3795655, 738964 | attested |
| The adverb *mikið* is "a lot". | W mikið ("much, a lot"); T 488331 | sourced |
| *fár* is "few", *nokkur* "some, a few", *hálfur* "half". | W fár ("few"), nokkur ("some"), hálfur ("half"); T 451215, 468938, 385869 (*eftir nokkur ár*, "in a few years") | sourced |
| *skipti* is a time, an occasion: *í fyrsta skipti*, *í þetta skipti*. | W skipti ("time, as in occurrence"); T 384146, 10691649, 698277 | sourced |

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

### *Dagurinn minn*

| Claim | Source | Status |
|---|---|---|
| *vakna* is to wake up, *vekja* to wake someone. | W vakna ("(intransitive) to wake up"), vekja ("(transitive) to awaken, to wake up (somebody)"); T 1315613, 891385 | sourced |
| Norwegian *våkne* and *vekke* come from Old Norse *vakna* and *vekja*. | BMO våkne ("norr. vakna"), vekke ("norr. vekja") | sourced |
| *fara á fætur* is to get up; *fætur* is the plural of *fótur*, as *føtter* is of *fot*. | W fara á fætur ("to get up"); DMII (*fætur* NFFT); T 382330, 863024; BMO fot | sourced |
| *þreyttur* and Norwegian *trett* both come from Old Norse *þreyttr*. | W þreyttur ("From Old Norse þreyttr"); BMO trøtt, trett ("norr. þreyttr") | sourced |
| *þvo* and *flýta* take a dative reflexive (*Ég þvæ mér*, *Flýttu þér*); *klæða* and *hvíla* an accusative one (*Ég klæddi mig*, *Má ég hvíla mig?*). | W þvo ("(dative reflexive) to wash oneself"), hvíla ("[with accusative]"); T 460453, 1318339, 586712, 586698, 1353641, 1323383; DMII (*mig* accusative and *mér* dative of *ég*) | sourced (*flýta* and *klæða* attested) |
| *sig* has the dative *sér*; *mig*, *mér*, *þig*, *þér*, *okkur* do the same work for I, you and we. | DMII (*sig*, *ég*, *þú*, *við*) | sourced |
| Norwegian says *vaske seg*, *kle på seg*, *skynde seg*, *hvile seg*. | BMO vaske, kle, skynde, hvile | sourced |
| *þvo* in the present: *þvæ*, *þvær*, *þvoum*. | DMII | attested |
| *tönn* has the plural *tennur*, as Norwegian *tann* has *tenner*. | DMII (*tennur* NFFT); BMO tann | sourced |
| Where English says your teeth, Icelandic says the teeth: *Burstaðu tennurnar*. | T 385858, 508850 (translated "Brush your teeth") | attested |
| *fara í sturtu*, *fara í bað* is to take a shower, a bath; *í* takes the accusative for a movement: *í bað*, not the dative *í baði*. | W sturta ("að fara í sturtu = to take a shower"); T 460469, 4007782; DMII (*bað* ÞFET, *baði* ÞGFET); elon (*í* with a movement) | sourced |
| *seinn* agrees with who is late (*seinn*, *sein*; *sein* for a mixed group); the adverb is *seint*. | DMII; T 1324574, 1324575, 11539549, 5003451; WP (neuter plural for a mixed group) | sourced |
| Norwegian *sen* is the same Old Norse word, *seinn*. | W seinn ("From Old Norse seinn"); BMO sen ("norr. seinn") | sourced |
| *tilbúinn* is *til* + *búinn*; *upptekinn* is the past participle of *upptaka* ("take up"), *upp* + *tekinn* (of *taka*), as Norwegian *opptatt* is made from *oppta* and *ta*. | W tilbúinn ("From til + búinn"), upptekinn ("past participle of upptaka"); DMII (*tekinn*, participle of *taka*); BMO opptatt ("av oppta og ta") | sourced |
| *fyrst* is the superlative of *snemma*. | W snemma (as in the *Tími* rows) | sourced |
| *svo* is "so" and "then"; *gerðu svo vel* is please. | W svo ("so", "then"); T 1316193, 1321821 | sourced |
| *venjulega* comes right after the finite verb; a habitual time of day is plural with the article: *á kvöldin*, "in the evenings". | V2 (as in the *Tími* rows); T 664662; DMII (*kvöldin* ÞFFTgr) | sourced |
| *á hverjum degi*, *á hverjum morgni* are every day, every morning. | T 508850, 385922 | attested |
| *strax* and Norwegian *straks* were both borrowed from (Middle) Low German. | W strax ("Borrowed from Middle Low German"); BMO straks ("fra l.ty.") | sourced |
| *lengi* is Norwegian *lenge* (Old Norse *lengi*); *ekki lengur* is "no longer". | W lengi; BMO lenge ("norr. lengi"); T 511366, 1353593 | sourced |
| *ætla að* + a verb is what you are going to do, where Bokmål says *skal*; with a place no verb is needed. | W ætla ("to intend, to plan, ... be going to"; "Ég ætla heim! = I'm going home!"); T 11074830, 3799246; Tatoeba's own Bokmål translations of T 382340, 863104, 3799246 (*skal*) | sourced |
| *fara að sofa* is to go to bed; *sofna* is to fall asleep, Norwegian *sovne*, both from Old Norse *sofna*. | W fara að sofa ("to go to bed"), sofna ("to fall asleep"; "From Old Norse sofna"); BMO sovne ("norr. sofna") | sourced |
| *rúm* is a bed, and also room, space; Norwegian *rom* comes from Old Norse *rúm*. | W rúm ("bed"; "room, space"); BMO rom ("norr. rúm") | sourced |
| *klára* is made from *klár* ("ready") and -*a*; Norwegian *klare* (to manage) is related to *klar*. | W klára ("From klár ('clear, ready') + -a"), klár ("prepared, ready"); BMO klare ("beslektet med klar": "makte, greie") | sourced |

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

### *Matur*

| Claim | Source | Status |
|---|---|---|
| *grænmeti* is made from *grænn* ("green") and *matur* ("food"); Norwegian says *grønnsaker*. | W grænmeti ("From grænn ('green') + -meti, from matur"); BMO grønnsak | sourced |
| *grænmeti*, *skyr* and *súkkulaði* have no plural; *Hún keypti grænmeti í gær* is "she bought vegetables yesterday". | DMII (singular forms only); T 653128, 476765 | sourced |
| *ávöxtur* has the plural *ávextir*; *kartafla* has *kartöflur*, as *kaka* has *kökur*; *banani* and *tómatur* have *bananar*, *tómatar*, and are masculine. | DMII | attested |
| *kartafla* was borrowed from Danish *kartoffel*; Norwegian says *potet*. | W kartafla ("Borrowed from Danish kartoffel"); BMO potet | sourced |
| *hrísgrjón* is plural for rice (one *hrísgrjón* is a grain), so the verb and the adjective are plural. | W hrísgrjón ("a grain of rice"; "(in the plural) rice"); T 382243 (*Hrísgrjón eru góð*) | sourced |
| Norwegian *kylling* and Icelandic *kjúklingur* come from Old Norse *kjúklingr*. | W kjúklingur ("From Old Norse kjúklingr"); BMO kylling ("norr. kjúklingr") | sourced |
| *pylsa* is a sausage and a hot dog, probably from Danish *pølse*, the word Norwegian has too. | W pylsa ("sausage", "hot dog"; "Probably from Danish pølse"); BMO pølse ("jf isl pylsa") | sourced |
| Bokmålsordboka has *skyr* as a word from Icelandic. | BMO skyr ("fra isl") | sourced |
| *fá sér* is to have something to eat or drink. | T 385537 ("I have breakfast at seven"), 389025 ("I ate a hot dog for lunch"), 1337026, 382340 | attested |
| *vera til* is to exist, to be available: *Það er ekki til meira salt* is "there's no more salt". | W vera til ("to exist, to be available"); T 468923 | sourced |
| *búinn* is "used up, finished" and agrees with what is used up: *Saltið er búið*. | W búinn ("depleted, finished"); T 468926; DMII | sourced |
| *með* takes the dative with food, as for company; *sósu* is the same in the dative and the accusative, *kjötinu* is dative. | W með (as in the *Búð* rows); T 690335, 870309; DMII (*sósu* ÞFET and ÞGFET, *kjötinu* ÞGFETgr) | sourced |
| *elda* is made from *eldur* ("fire"), and *eldhús* from *eldur* + *hús*; compare Nynorsk *eldhus*. | W elda ("From eldur ('fire')"), eldhús ("From eldur ('fire') + hús ('house'). Compare Norwegian Nynorsk eldhus") | sourced |
| Where Norwegian says *lage mat*, Icelandic has the one verb *elda*; a cook is a *kokkur*, Norwegian *kokk*. | W elda ("to cook"; Bokmål *lage mat* in its translation table); W kokkur ("cook, chef"); BMO kokk | sourced |
| *sjóða* became Norwegian *syde*, and it changes its vowel in the past: *sauð*. | W sjóða ("From Old Norse sjóða"); BMO syde ("norr. sjóða"); DMII (*sauð* GM-FH-ÞT-3P-ET); T 908840 | sourced |
| *baka* is regular, with *ö* before *u*: *bakaði*, *bökum*. | DMII; T 908931, 511469 | attested |
| *ísskápur* is *ís* + *skápur* ("cupboard"). | W ísskápur ("From ís ('ice') + skápur ('cupboard, cabinet')"), skápur | sourced |
| *súkkulaði* came through Danish *chokolade*. | W súkkulaði ("Borrowed from Danish chokolade") | sourced |
| BÍN spells pizza *pitsa*; Wiktionary lists *pítsa* as another spelling, and Tatoeba writes it so. | DMII Core API (*pitsa* found, *pítsa* and *pizza* not, 2026-11-25); W pítsa ("alternative form of pitsa"); T 4032141 | sourced |
| *samloka* is the prefix *sam-* and *loka* ("latch"), and also means a clam. | W samloka (etymology "sam- + loka ('latch, catch, bolt')"; senses "sandwich", "bivalve") | sourced |
| *ís* is both ice and ice cream, as Norwegian *is* is. | W ís ("ice cream; ice"); BMO is ("frosset vann"; "ispinne, iskrem") | sourced |
| *flaska* is Norwegian *flaske*; *dós* is a tin can, Norwegian *boks*. | W flaska, dós ("tin can"); BMO flaske, boks | sourced |
| After a meal one says *Takk fyrir matinn*, as Norwegians say *takk for maten*; the answer is *Verði þér að góðu* ("you're welcome"), which before a meal wishes a good meal. | T 917595 (Tatoeba's own Bokmål: *Takk for maten.*), 482353; W verði þér að góðu ("you're welcome (a response to a 'thank you')"; "bon appétit") | sourced |
| How something tastes is the -st form *smakkast*: *Hvernig smakkast súpan?*, Norwegian *Hvordan smaker suppen?*; both verbs came from Low German. | T 698232 (Tatoeba's own Bokmål: *Hvordan smaker suppen?*); W smakka ("Borrowed from Middle Low German smaken"); BMO smake ("fra l.ty.") | sourced |
| *saddur* agrees like *seinn* (*saddur*, *södd*), and began as the past participle of *seðja* ("to satiate"). | DMII (*saddur*, *södd*; *seðja*); T 905135, 905137; W saddr (Old Norse section: "past participle of seðja") | sourced |
| *hollur* is "healthy"; *ljúffengur* is "delicious". | W hollur ("wholesome, healthy"), ljúffengur ("delicious, tasty"); T 3997620, 3795532 | sourced |
| *hella* is Norwegian *helle*, from Old Norse *hella*. | W hella ("to pour"); BMO helle ("norr. hella") | sourced |

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

## Made sentences (`content/sentences-made.json`)

Where Tatoeba has too few sentences for a topic, a sentence is made for TÖLVA from a Tatoeba sentence by putting another word in place of one word, in the DMII Core form the sentence needs (`docs/PLAN.md`, decision 3). The app names the original's author, links to the original and says that a word was changed (CC BY 2.0 FR). Each is a claim that the result is correct Icelandic and says what its English says; they are checked as follows.

| Check | Source | Status |
|---|---|---|
| The sentence is the Tatoeba sentence with exactly one word replaced (the word occurs once; the rest is unchanged) | `scripts/build-data.mjs` (`swapWord`), `tests/engine.test.mjs` | checked |
| The word put in is a DMII Core form, and the one the sentence needs: the same case as the word it replaces, and agreement kept (*Saltið er búið* → *Skyrið er búið*, both neuter; *Ávextir eru hollir* → *Bananar eru hollir*, both masculine plural) | DMII; the parser's reading of each made sentence (`data/tags.json`; *sósu*, *fiski* and *ísa* corrected in the tag rows above) | checked |
| GreynirCorrect finds no error (a flagged made sentence stops the build) | `scripts/build-data.mjs` | checked |
| The word put in is the course word the sentence is for, in the parser's reading | `tests/engine.test.mjs` | checked |
| The English is the original's English with the same word changed; the Bokmål is written like the other hand translations (below) | T (the original's English); BMO | checked |

| Made | Sentence | From | Word replaced | English |
|---|---|---|---|---|
| 1324689-1 | *Hún keypti kartöflur.* | T 1324689 | *kjúkling* → *kartöflur* | She bought potatoes. |
| 1324689-2 | *Hún keypti banana.* | T 1324689 | *kjúkling* → *banana* | She bought bananas. |
| 1324689-3 | *Hún keypti skyr.* | T 1324689 | *kjúkling* → *skyr* | She bought skyr. |
| 1324689-4 | *Hún keypti hrísgrjón.* | T 1324689 | *kjúkling* → *hrísgrjón* | She bought rice. |
| 1324689-5 | *Hún keypti ís.* | T 1324689 | *kjúkling* → *ís* | She bought ice cream. |
| 1324689-6 | *Hún keypti grænmeti.* | T 1324689 | *kjúkling* → *grænmeti* | She bought vegetables. |
| 1324689-7 | *Hún keypti tómata.* | T 1324689 | *kjúkling* → *tómata* | She bought tomatoes. |
| 470238-1 | *Hann borðar oft grænmeti í kvöldmat.* | T 470238 | *fisk* → *grænmeti* | He often eats vegetables for dinner. |
| 470238-2 | *Hann borðar oft pylsur í kvöldmat.* | T 470238 | *fisk* → *pylsur* | He often eats hot dogs for dinner. |
| 470238-3 | *Hann borðar oft kjúkling í kvöldmat.* | T 470238 | *fisk* → *kjúkling* | He often eats chicken for dinner. |
| 479467-1 | *Ég ætla að panta pitsu.* | T 479467 | *samloku* → *pitsu* | I would like to order a pizza. |
| 479467-2 | *Ég ætla að panta pylsu.* | T 479467 | *samloku* → *pylsu* | I would like to order a hot dog. |
| 479467-3 | *Ég ætla að panta ís.* | T 479467 | *samloku* → *ís* | I would like to order an ice cream. |
| 468923-1 | *Það er ekki til meira súkkulaði.* | T 468923 | *salt* → *súkkulaði* | There's no more chocolate. |
| 468923-2 | *Það er ekki til meira grænmeti.* | T 468923 | *salt* → *grænmeti* | There are no more vegetables. |
| 468926-1 | *Skyrið er búið.* | T 468926 | *Saltið* → *Skyrið* | The skyr is all gone. |
| 468926-2 | *Súkkulaðið er búið.* | T 468926 | *Saltið* → *Súkkulaðið* | The chocolate is all gone. |
| 387357-1 | *Mamma mín eldar góðan kjúkling.* | T 387357 | *mat* → *kjúkling* | My mother cooks good chicken. |
| 908840-1 | *Hún sauð kartöflurnar.* | T 908840 | *eggin* → *kartöflurnar* | She boiled the potatoes. |
| 908840-2 | *Hún sauð pylsurnar.* | T 908840 | *eggin* → *pylsurnar* | She boiled the sausages. |
| 496225-1 | *Sjóddu hrísgrjónin.* | T 496225 | *vatnið* → *hrísgrjónin* | Boil the rice. |
| 496225-2 | *Sjóddu kartöflurnar.* | T 496225 | *vatnið* → *kartöflurnar* | Boil the potatoes. |
| 511469-1 | *Hún bakaði mér pitsu.* | T 511469 | *köku* → *pitsu* | She made me a pizza. |
| 908931-1 | *Bökum brauð.* | T 908931 | *köku* → *brauð* | Let's bake bread. |
| 1319432-1 | *Opnaðu ísskápinn.* | T 1319432 | *flöskuna* → *ísskápinn* | Open the fridge. |
| 1319432-2 | *Opnaðu dósina.* | T 1319432 | *flöskuna* → *dósina* | Open the can. |
| 1321809-1 | *Má ég opna ísskápinn?* | T 1321809 | *dós* → *ísskápinn* | May I open the fridge? |
| 698232-1 | *Hvernig smakkast sósan?* | T 698232 | *súpan* → *sósan* | How does the sauce taste? |
| 698232-2 | *Hvernig smakkast pitsan?* | T 698232 | *súpan* → *pitsan* | How does the pizza taste? |
| 698232-3 | *Hvernig smakkast kjúklingurinn?* | T 698232 | *súpan* → *kjúklingurinn* | How does the chicken taste? |
| 3997620-1 | *Bananar eru hollir.* | T 3997620 | *Ávextir* → *Bananar* | Bananas are healthy. |
| 3997620-2 | *Tómatar eru hollir.* | T 3997620 | *Ávextir* → *Tómatar* | Tomatoes are healthy. |
| 3795532-1 | *Er skyrið ekki ljúffengt?* | T 3795532 | *það* → *skyrið* | Isn't the skyr delicious? |
| 3795532-2 | *Er súkkulaðið ekki ljúffengt?* | T 3795532 | *það* → *súkkulaðið* | Isn't the chocolate delicious? |
| 475506-1 | *Hún hellti mér bolla af kaffi.* | T 475506 | *tei* → *kaffi* | She poured me a cup of coffee. |
| 12340291-1 | *Þetta er grænn banani.* | T 12340291 | *fiskur* → *banani* | This is a green banana. |
| 12340291-2 | *Þetta er grænn tómatur.* | T 12340291 | *fiskur* → *tómatur* | This is a green tomato. |
| 7319740-1 | *Epli eða banani?* | T 7319740 | *Gulrót* → *Epli* | Apple or banana? |
| 11208765-1 | *Þetta er ekki sósa.* | T 11208765 | *salt* → *sósa* | This isn't sauce. |
| 382243-1 | *Hrísgrjón eru góð með sósu.* | T 382243 | *mísósúpu* → *sósu* | Rice is good with sauce. |
| 382243-2 | *Hrísgrjón eru góð með fiski.* | T 382243 | *mísósúpu* → *fiski* | Rice is good with fish. |
| 488539-1 | *Tvo stóra ísa, takk.* | T 488539 | *vanillu* → *stóra* | Two big ice creams, please. |
| 389015-1 | *Hann drekkur dós af bjór með matnum.* | T 389015 | *flösku* → *dós* | He drinks a can of beer at dinner. |
| 389025-1 | *Ég fékk mér pylsu í hádegismat.* | T 389025 | *pulsu* → *pylsu* | I ate a hot dog for lunch. |
| 389025-2 | *Ég fékk mér samloku í hádegismat.* | T 389025 | *pulsu* → *samloku* | I ate a sandwich for lunch. |
| 788778-1 | *Það er lítið af mjólk eftir í ísskápnum.* | T 788778 | *flöskunni* → *ísskápnum* | There is little milk left in the fridge. |
| 677862-1 | *Það er kokkur í eldhúsinu.* | T 677862 | *köttur* → *kokkur* | There is a cook in the kitchen. |

## Bokmål translations (`content/translations-nb.json`)

Tatoeba has a Bokmål translation for 32 of the 2,283 sentences. The other 2,237 (all but 14 excluded ones) were translated by hand for TÖLVA, from the Icelandic, with Tatoeba's English translation as a check; the 47 made sentences (above) from their own English. A translation is a claim about meaning; these are checked as follows.

| Check | Source | Status |
|---|---|---|
| Every word is a Bokmål word form: a headword or inflected form, a word of a headword expression (*morges* in *i morges*, *tide* in *på tide*), a genitive of such a form, or a compound of two (*svømmehall*, *klimaanlegg*) | BMO, looked up by `npm run validate` (`scripts/lib/bokmal.mjs`) | sourced (word forms) |
| Names: kept as in the Icelandic sentence (Tom, Mary), or in their usual Norwegian form (Island, Tyskland, Sveits, Genève, Moskva), listed in the file's `names` | the place names are the Norwegian exonyms; *Hótel Ísland* keeps its own name | design choice |
| The sentence ends like the Icelandic (or like Tatoeba's English, where the Icelandic has a typo, such as *Má ég fara með þér.*) | `npm run validate` | checked |
| Options of one choice exercise never share a translation, in English or Bokmål | `tests/engine.test.mjs` | checked |

Conventions: common-gender forms for feminine nouns (*boken*, *klokken*, *døren*, as the app's Norwegian interface writes *ordboken*), «» for quoted speech, *du* for *þú* and *dere* for *þið*, Norwegian idiom where the Icelandic is idiomatic (*Takk for maten*, *Det har du godt av*, *Det var på tide*). Where Icelandic separates sentences that Bokmål cannot (gender of *þeir*, *þær*, *þau*; *velkominn* and *velkomin*), the translations are the same.

## Bokmål glosses (`content/glosses-nb.json`)

Wiktionary gives a Bokmål gloss for 386 of the 447 course words. The other 61 were glossed by hand from the word's English Wiktionary meaning (W) and its use in the course sentences, and 76 of Wiktionary's were corrected (below). Every word of every gloss the app shows, from Wiktionary or by hand, is a Bokmålsordboka form (BMO, checked by `npm run validate`), and a gloss of several words is one of the file's `phrases` (Bokmål expressions such as *av og til*, *se på*, *få lov til*). The first gloss is the one exercises show.

| Words | Glosses | Note |
|---|---|---|
| takk, bless, mamma, níu, núna, bara, sem, sig, sinn, enginn, einhver | takk; ha det; mamma; ni; nå; bare; som; seg; sin; ingen; noen | the plain equivalents |
| heita, hitta, hringja, keyra, rigna, hætta | hete; treffe; ringe; kjøre; regne; slutte | verbs, shown with *å* |
| geta, kunna | kunne; beherske | both are "can" in Bokmål; *kunna* (know, master a skill or a language) gets *beherske* so that the two never look alike as options |
| af, úr, yfir, við, hjá, fyrir | av; ut av; over; ved; hos; for | prepositions, each by its first sense in W; *hjá* (at someone's place) is *hos* |
| hvaðan, beint, inni | hvorfra; rett; inne | |
| buxur, húfa, hjól, sími, sundlaug, tölvupóstur, þota, norðurljós, kvöldmatur, skemmtilegur | bukse; lue; sykkel; telefon; svømmebasseng; e-post; jetfly; nordlys; middag; morsom | *kvöldmatur* (the evening meal) is *middag*, the day's hot meal, with *kveldsmat* second |
| réttur, kynna, heilsa, afsaka, kennitala, netfang | riktig, rett; presentere, introdusere; hilse; unnskylde; personnummer; e-postadresse | the adjective "right, correct" (W's third sense, the one in the course sentences, *Það er rétt*, *rétta svarið*); "to introduce"; "to greet"; "to excuse"; "national identification number" (BMO personnummer: the Norwegian number of the same kind); "e-mail address" |
| áttatíu, níutíu, níundi, hálfur, nokkur, mikið | åtti; nitti; niende; halv; noen; mye | the plain equivalents (W "eighty", "ninety", "ninth", "half", "some", "much, a lot"); *nokkur* shares *noen* with *einhver*, and the adverb *mikið* (W: from *mikill*) shares *mye* with *mikill*: near-synonyms, so typing either counts and they are never options together |
| svo, ætla, seinn, klára, hvíla, venjulega, bað | så; ha tenkt, skulle, planlegge; sen, forsinket; fullføre, gjøre ferdig; hvile; vanligvis, normalt; bad | W "so", "to intend, to plan, be going to", "late", "to finish (a task)", "to rest", "normally", "bath"; *seinn* is *sen* (BMO sen: "som skjer lenger inn i framtiden enn ventet"), the same Old Norse word; *klára* is not *klare*, which is "manage" (BMO; the guidebook says so) |
| skyr, sjóða, saddur | skyr; koke; mett | W "skyr", "to boil", "satiated, full"; BMO skyr (a word from Icelandic), koke, mett ("som ikke er sulten") |
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
| tala (noun) | antall | tall, antall | "number" (*Aldur er bara tala*, *Alder er bare et tall*); *antall* is an amount of things (BMO antall: "mengde (som kan telles)") |
| skipti | tid | gang | "time, as in occurrence" (*í fyrsta skipti*, *for første gang*); *tid* is time that passes, the course word *tími* |
| þvo | tvette | vaske | "to wash"; BMO explains *tvette* as *vaske*, the everyday word |
| fótur | fot | fot, bein | first gloss unchanged; *pote* and *labb* are an animal's paws, and W's second sense is "leg" (BMO bein) |
| strax | øyeblikkelig | straks, med en gang, umiddelbart | "immediately, right away"; *straks* (BMO "med en gang") is the same Low German word |
| syfjaður | trøtt | søvnig, trøtt | "sleepy"; *trøtt* is also "tired", the gloss of *þreyttur*, so *søvnig* (BMO "som kjenner trang til å sove") comes first and the two never look alike as options |
| upptekinn | travel | opptatt, travel | "busy, occupied", also "taken" (a seat); *opptatt* is the same word (the guidebook) |
| sofna | falle i søvn | sovne, falle i søvn | "to fall asleep": the one-word verb first (BMO sovne) |
| loksins | til slutt | endelig, til slutt | "finally", in the course sentences "at last" (*Loksins fékk hann bílinn*); BMO endelig ("brukt som adverb: til slutt, omsider") |
| skilaboð | budskap | beskjed, melding, budskap | "message", in the course sentences one left for someone (*skilja eftir skilaboð*, *legge igjen en beskjed*); *budskap* is a message in the sense of what a text says |
| kjúklingur | høne | kylling | "chicken"; *høne* is a hen (BMO "hunndyr av arten tamhøns"), *kylling* the young bird and its meat (BMO), from the same Old Norse word (the guidebook) |

Later glosses (shown in the dictionary only) removed for the same reasons: another sense (*frá* mot "toward", *tala* preke "preach", *skilja* kunne, *nótt* kveld and aften "evening", *dagur* døgn "24 hours", *kirkja* gudstjeneste "church service", *tími* tempo and klokkeslett, *mínúta* øyeblikk "moment", *nýr* nåværende "current", *eða* ellers "otherwise", *fólk* lyd (old "people", today "sound"), *strákur* kamerat and kompis "buddy", *ský* støvsky "dust cloud", *systir* storesøster and lillesøster, *hnífur* knivblad, *veira* datavirus, *sætur* sukkertilsatt, *dós* kanne (BMO: a jug), *pylsa* kurv and korv (BMO's other word for a sausage, but *kurv* is mostly a basket), *þú* De and I, the polite and the old plural "you"), a noun for a verb (*svara* svar, *ganga* gåtur, *taka* opptak), a parsing remnant (*barn* "barn n mindreårig"), and words BMO does not list (*byrja* børje, *kaffihús* café, *garður* have, *hæ* heisan, *snjór* sne, *tuttugu* tyve). Added from W's senses: *skilja* skille ("to separate"), *tími* time ("hour"), *tala* prate.

## Bokmål etymologies (`content/etymology-nb.json`)

The 418 etymologies the dictionary shows come from English Wiktionary; for the Norwegian interface they were translated by hand. A translation adds no claim of its own: it says what the English says. Conventions: language names in Bokmål (Old Norse *norrønt*, Proto-Norse *urnordisk*, Proto-Germanic *urgermansk*, Proto-Indo-European *urindoeuropeisk*, Old English *gammelengelsk*, Middle Low German *middelnedertysk*, Ancient Greek *gammelgresk*, Middle English *mellomengelsk*, Old Armenian *gammelarmensk*), glosses in «», cited forms unchanged. Left out: Wiktionary's "Etymology tree" lists, which repeat the text after them, and slips in the English (the typo "Frin", a "[Term?]" placeholder). *loka* has no translation: its English only says "See Etymology 1." Every word of the translations is a form in Bokmålsordboka (`npm run validate`), except cited forms and these names:

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

## Numbers by ear (`js/engine/numbers.js`)

| Claim or choice | Source | Status |
|---|---|---|
| Numbers are heard as said when counting: one to four masculine (*fjörutíu og einn*), the ten first with *og*. | HÞ pp. 1-2; elon (cardinals 5 and up) | sourced |
| Ordinals are heard in the form said for a date, the weak masculine nominative (*þriðji*, as in *Í dag er þriðji mars*), and shown as "3.". | elon (ordinals in use: "Í dag er þriðji mars", "Í dag er 3. mars") | sourced |
| Phone numbers are said in pairs after three single digits, as in the *Tölur* guidebook, and start with 5 to 8 (landlines 4 and 5, mobile phones 6, 7 and 8). | elon (numbers in use); WP-Tel ("Numbers of mobile phones tend to begin with either 6xx xxxx, 7xx xxxx or 8xx xxxx", "landline numbers starting with 5xx xxxx ... or 4xx xxxx") | sourced |
| The course's phone numbers have no 1 to 4 said alone or at the end of a pair, no 0 said alone and no pair starting with 0. | elon writes 34 in a phone number as *þrjátíu og fjögur* (neuter), while HÞ gives the masculine for counting; no source here says how 0 or 05 is said. So the course avoids them and makes no claim. | design choice |
| Options that sound or look alike: 17 *sautján*, 70 *sjötíu*, 7 *sjö*; 47 and 74; a phone number with its pairs swapped. | the spellings above | design choice |

## Generated audio (`data/audio/`)

The four Piper voices sometimes mispronounce: *Ísland* comes out as [ˈisland], without the t that Wiktionary gives for the single-word pronunciation. Word highlighting uses estimated timings.

## Norwegian bridge (`data/bridge.json`, `js/bridge-rules.js`)

192 pairs are sourced (Bokmålsordboka and Wiktionary name the same Old Norse word), 7 are shared loans (Wiktionary names the source language). 12 pairs only look alike with the same meaning and are labeled in the app as "a shared origin is not confirmed". The spelling patterns describe spelling, not historical sound laws.

