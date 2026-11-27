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
| *á* in *Slökktu á honum*, *á henni*, *á því* and in *Slökktu á lampanum*, *á sjónvarpinu* (made from T 1329150) is the preposition of *slökkva á* ("turn off"), not the noun *á* ("river") the parser reads; the five sentences keep no parser case. | W slökkva (*Slökktu á perunum*, "Turn off the lights"); translations of T 1316200, 1316201, 1316202, 1329150 | sourced |
| *læs* in *Hann er læs og skrifandi* is the adjective *læs* ("literate"), not a form of *læsa* ("to lock"); a fix with lemma null. | W læs ("literate (able to read)"); translation of T 1356570 ("He can read and write") | sourced |
| *hrædd*, *hræddur* in *Ég var hræddur*, *Ég var hrædd*, *Ég er hrædd við að fara*, *Hann er hræddur við föður sinn* and five more are the adjective *hræddur* ("afraid"), not the past participle of *hræða* ("frighten") the parser reads; *Þau hræddust þig* stays the verb *hræðast*. | W hræddur (adjective, "scared, frightened; afraid"); DMII (*hræddur* lo); BMO redd ("norr. hræddr, av hræða"); translations of T 11353825, 11353827, 1322944, 690290 | sourced |
| *stutt* in *Hún er með stutt hár* is the adjective *stuttur* ("short"), neuter with *hár*, not *studdur* ("supported") the parser reads. | translation of T 1324694 ("She has short hair"); DMII (*stutt*, HK ÞF ET of *stuttur*) | sourced |
| *hatta* in *Mér líkar enginn þessara hatta* is the genitive plural of *hattur* ("hat"), not of *höttur* ("hood") the parser reads. | translation of T 647420 ("I don't like any of these hats"); DMII (*hatta*, EFFT of *hattur*) | sourced |
| *klára* in *Hún verður að gera sig klára fyrir matinn* is the adjective *klár* in the sense "ready", feminine accusative, not an adverb. | W klár ("prepared, ready"); translation of T 908324 ("She's got to get ready for dinner"); DMII (*klára* of *klár*) | sourced |
| *rólega* in *Taktu því rólega!* is the adverb *rólega* ("calmly"), a word of its own, not the adjective *rólegur* the parser reads there; a fix with lemma null. | W rólega (adverb, "calmly"); BÍN (*rólega* ao); T 795470, where the parser reads *rólega* as the adverb | sourced |
| *svona* in *Ekki tala svona*, *Talið ekki svona*, *Það var ekki alltaf svona*, *Svona er hún bara*, *Ég kem aftur eftir svona klukkutíma* and *Ekki vera svona reiður* is the adverb ("like this, so; about"), not the indeclinable adjective ("such") the parser reads. | W svona (adverb: "thus, like this", "to this degree", "approximately, about"; adjective: "like this, such"); translations of T 1351311, 1351314, 3997427, 428538, 863109, 733997 | sourced |
| In *Ekki vera reiður*, *Ekki vera reið*, *Ekki vera svona reiður* and *Ekki vera svona reið*, *vera* is the verb ("be"), not the noun *vera* ("a being"), and *reiður*, *reið* are the adjective *reiður*, not the noun *reiða* or the past of *ríða* ("ride") the parser reads. | translations of T 1316637, 1316636, 733997, 733998 ("Don't be (so) angry"); DMII (*reið*, KVK NF ET of *reiður*) | sourced |
| In *Það er of langt* and *Það er of stutt* (made from T 1318211), *of* is the adverb ("too") and *langt*, *stutt* the adjectives *langur*, *stuttur*; the parser cannot analyze the two sentences, and reads the original *Það er of stórt* so. | the parser's output for T 1318211; W of ("too (excessive degree)") | checked |
| *sé* in *Ég sé illa* is *sjá* ("see"), as in *Ég sé það*; *hef* in *Ég hef ekki tíma til að vera veikur* (and *veik*) is *hafa*, not *hefja* ("lift") the parser reads. | DMII (*sé*, *hef*: GM-FH-NT-1P-ET of *sjá*, *hafa*); translations of T 1321344 ("I can't see well"), 564514, 564515 ("I don't have time to be sick") | sourced |
| *hreinar* in *Eru hendurnar þínar hreinar?* is the adjective *hreinn* ("clean"), feminine plural with *hendurnar*, which the parser reads as another word. | DMII (*hreinar*, KVK NF FT of *hreinn*); translation of T 482948 ("Are your hands clean?") | sourced |
| *bak* in *Augu hans brostu bak við gleraugun* is not the noun *bak* ("back") the course teaches: *bak við* is "behind"; a fix with lemma null. | BÍN (*bak* also an adverb and a preposition); translation of T 386819 ("behind his glasses") | sourced |
| *Dóttur* in *Dóttur hennar er illt í maganum* (and the four sentences made from it) is the dative, the case of the one it hurts, as *mér* in *Mér er illt í hendinni*; the parser gives the genitive, so these keep no parser case. | DMII (*dóttur*: ÞGF ET, also ÞF and EF); W hönd ("Mér er illt í hendinni. = My hand hurts.") | sourced |
| *Fólki* in *Fólki líður best þegar það er heima hjá sér* is the dative, the case *líða* gives the one who feels; the parser gives the nominative, so the sentence keeps no parser case. | DMII (*fólki*: ÞGF ET; the nominative is *fólk*); W líða (impersonal: *Mér líður vel*) | sourced |
| *hendurnar* in *Þvoðu þér um hendurnar* is the accusative after *um*; *hjálp* in *Einhver er að kalla á hjálp* is the accusative after *kalla á*. The parser gives the nominative and the dative; both sentences keep no parser case. | The *um* rule (above); T 736112 (*Kallaðu strax á lækninn*) and 666975, where the accusative *lækninn* differs from the dative *lækninum* (DMII) | sourced (*um*), attested (*kalla á*) |
| *hef* in *Ég hef ekki áhuga á íþróttum* and *Ég hef gaman af skíðum* is *hafa*, not *hefja* ("lift") the parser reads. | DMII (*hef*, GM-FH-NT-1P-ET of *hafa*); translations of T 385014 ("I don't care for sports"), 387930 ("I like skiing") | sourced |
| *lagi* in *Allt er í lagi* and thirteen more is *lag* in the sense "order", in the idiom *í lagi* ("all right"), not *lag* "song" the course teaches: a loose fix, so the word counts as known but the sentence does not teach it. *lög* in *Hann braut lög* is *lög*, "law", a word of its own (lemma null). | W lag ("layer", "tune, song", "order"); BÍN (*lög*, hk, plural only, "law"); translations of T 677836, 1315607, 1320747 ("He broke the law") | sourced |
| *tónleikarnir*, *tónleikunum*, *tónleikana* are *tónleikar* ("a concert", plural only, the DMII Core word); the parser names them by *tónleikur*, which BÍN also lists with the same plural forms (`PLURAL_ONLY` in `scripts/lib/tags.mjs`). | BÍN (*tónleikar* kk, id 91313; *tónleikur* kk, id 90912; both give *tónleikarnir*); W tónleikar ("concert") | sourced |
| *fær* in *Ég er fær um að synda* is the adjective *fær* ("able"), not a form of *fá*; *á* in *Helgina sem ég fór á skíði* is the preposition of *fara á skíði*, not *eiga*. | BÍN (*fær* lo); translations of T 1321802 ("I'm able to swim"), 7319849 ("That weekend I went skiing") | sourced |
| Wrong parser cases dropped: *betra* in *Liðið þitt er betra en okkar* (made from T 544571) is nominative, not genitive; *skák* after *leika* in T 387772 is accusative, not nominative; *gítar* after *leika á* in T 469359 is accusative, as in T 11514561 (*spilar á gítar*), not dative; in T 469363 (*góður á gítar*) no source decides it, so it keeps no case. | DMII (*betra*, comparative of *góður*); the parser's own reading of T 11514561 | sourced |
| *vinsamlegast* ("please") is the superlative of the adverb *vinsamlega*; the parser reads it as the neuter superlative of the adjective *vinsamlegur*, and where it cannot parse the sentence leaves it open between the two (`ADVERB_OF` in `scripts/lib/tags.mjs`). | BÍN (*vinsamlegast*: EST of *vinsamlega* ao, and ESB-HK of *vinsamlegur*); W vinsamlega ("please"); translations of T 1316194 ("Please come"), 624010 | sourced |
| *sæti* in *Vinsamlegast taktu þetta sæti* and *Vinsamlegast fáið ykkur sæti* is the noun "seat", not a form of *sætur*; *Skilið* ("understood") is the supine of *skilja*, not *skila*; *pakka* in *Ég ætti að fara að pakka* is the verb "to pack" (lemma null). | DMII (*sæti* hk; *skilið*, GM-SAGNB of *skilja*); translations of T 388910, 1324686, 477938 ("Understood"), 3799284 ("I should go pack") | sourced |
| Wrong parser cases dropped: *upplýsingar* after *þarf* (made from T 583658, 4000851) is accusative, not genitive; *dyrnar* in T 828869 is accusative; *ferð* after *fara í* (T 1323378, 1355189) is accusative; *mánuði* in *í næsta mánuði* (T 734849, 734850) is dative, the only case of that form. | DMII (*mánuði*: ÞGF ET only; *upplýsingar*: NF/ÞF FT, EF is *upplýsinga*); the accusative of motion after *í* (`content/case-rules.json`, *í-hreyfing*) | sourced |
| The parser reads *í gær* ("yesterday") and *í fyrradag* ("the day before yesterday") as one adverb each; in them *gær* and *fyrradag* are the course words and *í* is known but not taught (`TIME_PHRASES` in `scripts/lib/tags.mjs`). | BÍN (*gær* ao, used only in *í gær*; *fyrradag*, ÞF ET of *fyrradagur*); W gær ("yesterday"), fyrradagur; translations of T 833306, 483021 | sourced |
| *síðan* in *síðan ég var barn* is the conjunction "since", the class the parser gives it, so the course word is *síðan* st. | W síðan ("[conj] since"); BÍN (*síðan* ao, fs, st); T 669486, 387248 | sourced |
| *þá* in *Hann elskar þá*, *Við elskum þá* and *Ég held að ég aldrei hafi séð þá fyrr* is "them", the accusative of *þeir*, not the adverb "then"; *heldur* in *Ég vil heldur vera heima* is the adverb "rather", not *halda* (lemma null); *nú* in *Komdu nú sæll* and *Komdu nú sæl* is a particle in a greeting, a loose fix. | DMII (*þá*, ÞF FT of *hann*); BÍN (*heldur* ao); translations of T 675558 ("He loves them"), 643321 ("I'd rather stay home"), 10628605 ("Hello") | sourced |
| The parser reads a month alone (*janúar*) or with a day (*20. maí*) as a date token (`dagsafs`, `dagsföst`); a month alone is the course noun (`CLASS` in `scripts/lib/tags.mjs`), a date with digits is left open. *Mars* in *ferð til Mars* is the planet, a name (lemma null). | BÍN (the month nouns, kk); translation of T 385892 ("a voyage to Mars") | sourced |
| *mætt* in *Ég get ekki mætt á fundinn í dag* (made from T 10635142) is the supine of *mæta* after *geta*, as *farið* is of *fara* in the original; *hlé* in *draga sig í hlé* ("retire") is an idiom, a loose fix. | DMII (*mætt*, GM-SAGNB of *mæta*); translations of T 3799408, 3799409 ("Tom retired", "I've retired") | sourced |

The parser itself is not checked case by case: `npm run build:tags` lists the 539 words it gives to another word than their spelling suggests.

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
| The months are *janúar*, *febrúar*, *mars*, *apríl*, *maí*, *júní*, *júlí*, *ágúst*, *september*, *október*, *nóvember*, *desember*, written with a small letter, as in Norwegian. | W (each month's entry, "January" to "December"); DMII; Ritreglur §1.3.3.3 ("Heiti einstakra daga, mánaða … eru rituð með litlum staf"); elon dates (the month "stays lowercase"); BMO januar to desember (nouns with a small letter: "være født 10. januar 1999") | sourced |
| The month names come from Latin, as the Norwegian ones do. | W (etymologies: "From Latin Iānuārius", "Ultimately from Latin Februarius", and so on); BMO januar, mai, august (each "fra lat.") | sourced |
| *mars*, the month, has no article and no plural: its forms are *mars* in every case, as for the other months. The DMII Core paradigm with *marsinn* and *marsar* is *mars*, a march, so the course keeps only its indefinite singular (`"ET"` in `content/vocab/core.json`). | W mars (the month: "no plural", four singular forms; the musical march: plural *marsar*); DMII (*janúar* … *desember*: four singular forms each) | sourced |
| In a month is *í*: *í janúar*, *í ágúst*. | elon time prepositions ("í janúar"); T 677850, 740803, 754495 | sourced |
| A date is the ordinal before the month, written as a number with a full stop; on a date is *þann* with the ordinal in the accusative: *þann 13. febrúar*, read *þann þrettánda febrúar*. | elon dates ("4. júní" read *fjórði júní*, "never fjórir júní"; "Við komum heim þann fimmta júní"); T 384673 (*þann fimmtánda febrúar*), 10674012; DMII (*þrettánda*, the accusative of *þrettándi*) | sourced |
| Norwegian writes the date the same way: *den 13. februar*. | Språkrådet, [Tall, tid og dato](https://www.sprakradet.no/sprakhjelp/Skriveregler/Dato/) ("den 5. juni 2026"; "Det skal være punktum ved ordenstall") | sourced |
| The course's Tatoeba sentences have none to three per month (none for *janúar*, *október*, *nóvember*), and at the end of *Tími* only *Í Sviss kemur vorið í maí* and *Hún verður sautján í febrúar* are readable (the others need later words, such as *kennsla*, *hefjast*, *hlakka*, *síðan*); the month lessons drill made sentences and the guidebook shows the real ones. | T 740803, 487079, 677850, 754495, 862215, 673884; the readable count at the end of the unit (`allowedFor`) | checked |

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

### *Heima*

| Claim | Source | Status |
|---|---|---|
| *herbergi* and Norwegian *herberge* (a place to stay the night) both come from Old Norse *herbergi*. | W herbergi ("From Old Norse herbergi"); BMO herberge ("norr. herbergi"; "husly, losji") | sourced |
| *svefnherbergi* is *svefn* ("sleep") + *herbergi*; *baðherbergi* is *bað* + *herbergi*. | W svefnherbergi, baðherbergi | sourced |
| *stofa* is the living room, Norwegian *stue*, both from Old Norse *stofa*. | W stofa ("a living room"; "From Old Norse stofa"); BMO stue ("norr. stofa"; "oppholdsrom i bolighus") | sourced |
| *íbúð* is *í* + *búð* ("lived"), "that which is lived in", from the verb for to live. | W íbúð | sourced |
| *klósett* was borrowed from Danish and goes back to English *closet*, as Norwegian *klosett* does. | W klósett ("Borrowed from Danish kloset ... from English closet"); BMO klosett ("gj ty. og eng.") | sourced |
| *Má ég fara á klósettið hjá þér?* is "May I use your toilet?". | T 827609 | attested |
| *dyr* is the doorway and always plural (*dyrnar*); *hurð* is the door itself, the panel. | W dyr ("a door, a doorway", plural only); W hurð ("door (rigid movable pane designed to open and close a doorway)"); DMII (*dyr*: plural forms only) | sourced |
| Norwegian *dør* comes from Old Norse *dyrr*, which was plural. | BMO dør ("norr. dyr(r) fl"); W dyr ("From Old Norse dyrr") | sourced |
| *opna* takes the accusative (*Opnaðu dyrnar*), *loka* the dative (*Lokaðu dyrunum*, *Lokaðu hurðinni*). | elon [opna and loka](https://elon.io/grammar/icelandic/verb-ref/opna-loka-a1) ("You open something in the accusative ... but you close something in the dative"); T 828861, 828852, 481527 | sourced |
| *læsa* takes the dative: *Læstu dyrunum*, *Hún læsti dyrunum*, *Læstu hurðinni*. | T 831751, 836055, 831750 (*dyrunum*, *hurðinni*: DMII ÞGF) | attested |
| *læsa* and Norwegian *låse* are the same Old Norse verb. | W læsa ("From Old Norse læsa"); BMO låse ("norr. læsa") | sourced |
| *gluggi* is Norwegian *glugge*, a small opening to let in light or air; Norwegian *vindu* is Old Norse *vindauga*, "wind eye". | W gluggi ("Compare ... Norwegian Bokmål glugge"); BMO glugge ("norr. gluggr, gluggi"; "åpning ... til å slippe inn lys eller luft"), vindu ("norr. vindauga, oppr 'vindøye, lufthull'") | sourced |
| *lykill* became Norwegian *nøkkel*. | W lykill ("From Old Norse lykill"); BMO nøkkel ("m.no. nykill", "norr. lykill") | sourced |
| *sófi* and *lampi* are weak masculine nouns, with -a in the other cases of the singular (*sófa*, *lampa*). | DMII; T 473555-1 (made, *Þennan sófa*) | attested |
| *skápur* and Norwegian *skap* (a cupboard) both came from Low German *schap*. | W skápur ("from Middle Low German schap"); BMO skap ("av lty schap"; "oppbevaringsmøbel") | sourced |
| *teppi* is a carpet and also a blanket, as Norwegian *teppe* is. | W teppi ("carpet"; "blanket, bedspread"); BMO teppe ("gulvet er dekket av et mykt teppe"; "varme seg under teppet") | sourced |
| *mynd* is a picture or a photo, and also a film. | W mynd ("image, picture"; "movie, film"); T 469045 ("That's a photo of my sister") | sourced |
| *sjónvarp* is *sjón* + *varp*, made on the model of *útvarp*. | W sjónvarp (as in the *Nýyrði* rows) | sourced |
| *hérna* is *hér* + -na, *þarna* is *þar* + -na. | W hérna, þarna | sourced |
| *þarna* is for a place one can point at ("over there"); *þar* refers back to a place already named. | elon [adverbs of place](https://elon.io/grammar/icelandic/adverbs/place) ("if you could point your finger at it, use þarna; if you're calling back to a place you already named, use þar"), [here and there](https://elon.io/grammar/icelandic/adverbs/here-there-a1); W þarna ("the place being pointed at") | sourced |
| *uppi* is "up, upstairs", *niðri* "down, downstairs". | W uppi ("above, upstairs"), niðri ("downstairs, below") | sourced |
| *við hliðina á* is "next to", with the dative after *á*. | W við hliðina á ("next to"); T 734476 (*húsinu*: DMII ÞGF), 1368361 (*þér*) | sourced (meaning), attested (case) |
| *fyrir framan* is "in front of", with the accusative. | T 1312450 ("He is in front of the door"; *hurðina*: DMII ÞF) | attested |
| A verb of motion takes *inn*, *út*, *upp*, *niður*, *heim*; a verb of being or staying takes *inni*, *úti*, *uppi*, *niðri*, *heima*. | elon [adverbs of place](https://elon.io/grammar/icelandic/adverbs/place) ("a verb of being or staying ... takes the -i form; a verb of motion ... takes the bare form"), [here and there](https://elon.io/grammar/icelandic/adverbs/here-there-a1) (*heima* "at home", *heim* "home(ward)") | sourced |
| Norwegian has the same pairs, from the same Old Norse words: *inne*, *ute*, *oppe*, *nede*, *hjemme* are *inni*, *úti*, *uppi*, *niðri*, *heima*. | BMO inne ("norr. inni"), ute ("norr. úti, av ut"), oppe ("norr. uppi", "jamfør opp"), nede ("norr. niðri"), hjemme ("norr. heima") | sourced |
| *standa upp* is to stand up, *gefast upp* to give up, *taka út* to take out (money). | T 1315528; W gefast upp ("to give up"), T 1315534; T 460447 | sourced |
| *setja* and *leggja* are Norwegian *sette* and *legge*, from Old Norse *setja*, *leggja*. | W setja, leggja ("From Old Norse"); BMO sette, legge (the Old Norse words in `data/bridge.json`) | sourced |
| *setjast* (*setja* + -st) is to sit down; *leggjast* is to lie down. | W setjast ("to sit (down)", "From setja + -st"); T 389899, 12300662, 450785 ("She lay down on the bed"), 513951 ("He lay on his back") | sourced |
| *leggja af stað* is to set off; *leggja* alone can be to park. | T 544549, 505500 ("set off"); W leggja ("to park (a vehicle)"); T 1323724 ("You may park here") | sourced |
| *þrífa* is a strong verb (*þreif*). | DMII (*þreif* GM-FH-ÞT-3P-ET); T 906682 | attested |
| *taka til* is to tidy up. | W taka til ("to clean, to tidy up", with *í* + dative); T 1355099 | sourced |
| *hreinn* and Norwegian *ren* come from Old Norse *hreinn*; *skítugur* is *skítur* ("dirt") + -ugur. | W hreinn, skítugur; BMO ren ("norr. hreinn") | sourced |
| *laga* is to fix; *allt í lagi* ("all right") has the noun *lag* ("order"). | W laga ("to fix, repair"), lag ("order"), allt í lagi ("all right") | sourced |
| Lights and machines are turned on with *kveikja á* and off with *slökkva á*, with the dative. | W kveikja ("turn on (a light) ... with the preposition á"), slökkva (*Slökktu á perunum*, "Turn off the lights"); T 1312221 (*lampanum*: DMII ÞGF), 706951 | sourced |
| *slökkva* and Norwegian *slokke* come from Old Norse *sløkkva*. | W slökkva ("From Old Norse sløkkva"); BMO slokke ("norr. sløkkva") | sourced |
| Unit 11 drops *framan*: the parser reads *fyrir framan* as one preposition, and the only sentence where *framan* stands alone, *Þvoðu þér í framan* ("Wash your face"), is not "in front". | the parser's output (`npm run build:tags`); T 1318339 | checked |

### *Föt og fólk*

| Claim | Source | Status |
|---|---|---|
| *skyrta* and Norwegian *skjorte* both come from Old Norse *skyrta*. | W skyrta ("Cognate to Old Norse skyrta"); BMO skjorte ("norr. skyrta") | sourced |
| *sokkur* and Norwegian *sokk* come from Old Norse *sokkr*, from Latin *soccus*, a slipper. | W sokkur ("From Old Norse sokkr, from Latin soccus ('slipper')"); BMO sokk ("norr. sokkr", "fra lat.") | sourced |
| *hattur* is a hat with a brim, Norwegian *hatt*, from Old Norse *hǫttr*. | W hattur ("From Old Norse hǫttr"); BMO hatt ("norr. hǫttr, hattr"; "hodeplagg med pull og (vanligvis) brem") | sourced |
| *húfa* is a soft cap without a brim, cognate with Norwegian *hue*. | W húfa ("cap (soft brimless hat)"; "Cognate with ... Norwegian Bokmål hue") | sourced |
| *vettlingur* is *vöttur* ("a glove, a mitten") with the diminutive ending *-lingur*; Norwegian *vott* is the Old Norse *vǫttr*. | W vettlingur ("From vöttur + -lingur (diminutive suffix)"), vöttur ("glove"; "From Old Norse vǫttr"); BMO vott ("norr. vǫttr") | sourced |
| *úlpa* is a thick winter coat, often with a hood: a parka or an anorak. | W úlpa ("a thick winter coat (often with a fur-lined cap); a parka; an anorak"); BMO parkas ("varmt, fôret ytterplagg med hette") | sourced |
| *trefill* once meant a rag. | W trefill ("From Old Norse trefill ('tatter, rag')") | sourced |
| *gleraugu* is *gler* ("glass") + *augu* ("eyes") and has only plural forms. | W gleraugu ("From gler + augu"; plural only); DMII | sourced |
| *taska* and Norwegian *taske*, a small bag, come from Old Norse *taska*. | W taska ("From Old Norse taska"); BMO taske ("norr. taska"; "liten veske") | sourced |
| Clothes go on with *fara í* and the accusative and come off with *fara úr* and the dative; *vera í* is to wear. | W fara í ("to put on [with accusative 'clothing']"), fara úr ("to take off [with dative 'clothing']"); T 1353642 ("I put on my trousers"), 664742, 499438, 389196 ("You are wearing your socks inside out"), 4000967 ("I do not like wearing anybody else's clothes") | sourced |
| A hat or glasses go on with *setja á sig* and come off with *taka af sér*, and so can shoes. | T 387039 ("She put on her hat"), 1337006 ("He took off his hat"), 499437 ("You need not take off your shoes") | attested |
| Norwegian *ta på seg* and *ta av seg* do the same. | BMO skjorte ("ta på seg skjorta"), hatt ("han tok hatten av da han kom inn") | sourced |
| *litur* comes from a Proto-Germanic word for appearance, look. | W litur ("From Old Norse litr, from Proto-Germanic *wlitiz, *wlituz ('appearance, look, aspect')") | sourced |
| Colors agree with what they describe; the neuter of *grár* is *grátt*, of *blár* *blátt*. | DMII; T 4010182, 1337019, 482640, 473520, 475024 | attested |
| *brúnn* and *grár* are Norwegian *brun* and *grå*, from Old Norse *brúnn*, *grár*. | BMO brun ("norr. brúnn"), grå ("norr. grár"); W grár ("From Old Norse grár") | sourced |
| *bleikur* is pink, and in an old sense pale; Norwegian *blek*, *bleik*, from the same Old Norse *bleikr*, is pale. | W bleikur ("pink"; "pale [archaic]"; "From Old Norse bleikr"); BMO blek, bleik ("norr. bleikr"; "med svak farge") | sourced |
| *of* is "too", Norwegian *for* (*altfor*). | W of ("too (excessive degree)"); BMO for ("brukt som adverb: altfor, i overkant"; "kjøpe for mye mat"); T 653110, 473063, 482669 | sourced |
| *síður* is long of hair or a dress: *sítt hár*. | W síður ("low-hanging, long, reaching far down (e.g. of a dress or long hair)"); DMII (*sítt* of *síður*) | sourced |
| *líta út* is to look (a certain way), *líta á* to look at, *líta niður á* to look down on, *líta upp til* to look up to, *líta eftir* to look after. | T 385910 ("He looks well"), 1316654, 3799281, 489279, 908291, 504213 | attested |
| *líta* is a strong verb (*leit*). | DMII (*leit*, GM-FH-ÞT-3P-ET); T 906667 | attested |
| Eyes and hair are described with *vera með*. | T 473520 ("She has blue eyes"), 1324694 ("She has short hair"), 482640 ("He had grey hair") | attested |
| *hár* is also an adjective, "high, tall". | W hár (adjective: "high", "tall"; "Þú ert orðinn svo hár! = You've gotten so tall!") | sourced |
| *hávaxinn* is *há* (of *hár*, "high") + *vaxinn* ("grown"), like Norwegian *høyvokst*. | DMII (*há* of *hár*; *vaxinn* lo); BMO høyvokst ("av høy/høg vekst") | checked |
| *klár* was borrowed from Middle Low German *klar*, as Norwegian *klar* was, and both can mean ready. | W klár ("Borrowed from Middle Low German klar"; "prepared, ready"); BMO klar ("gjennom l.ty."; the second article: "ferdig, i stand"); T 908324 | sourced |
| *fyndinn* comes from *finna* ("find, feel"). | W fyndinn ("From finna ('to find; feel')") | sourced |
| *leiðinlegur* is boring, and also sad or disappointing. | W leiðinlegur ("boring"; "sad, disappointing"); T 4007860 | sourced |
| *rólegur* is *ró* ("calm, rest") + *-legur*; Norwegian *rolig* is from *ro*. | W rólegur ("From ró + -legur"), ró ("calm, rest, stillness"); BMO rolig ("av ro") | sourced |
| *Taktu því rólega!* is "take it easy", with the adverb *rólega* ("calmly"). | T 609044 ("Take it easy!"); W rólega ("calmly") | sourced |
| *stoltur af* is "proud of", Norwegian *stolt av*. | T 493082, 813376; BMO stolt ("hun er stolt av den nye bilen") | sourced |
| *svona* is "like this, so". | W svona ("thus, like this"; "to this degree"); T 4171527, 733997 | sourced |
| Adjectives of feeling agree with the speaker: a man says *Ég er glaður*, a woman *Ég er glöð*; so *leiður*, *leið* and *hræddur*, *hrædd*. | DMII (*glöð*, *leið*, *hrædd*: KVK NF ET); T 3795329, 905333, 1315606, 1315605, 11353825, 11353827 | sourced |
| *glaður* and *leiður* are Norwegian *glad* and *lei*, from Old Norse *glaðr*, *leiðr*; *lei seg* is sad, *lei av* fed up with. | W glaður, leiður ("From Old Norse"; leiður: "fed up (with), tired (of)", "sad"); BMO glad ("norr. glaðr"), lei ("norr. leiðr"; "være lei av noe"; "være lei seg") | sourced |
| *hræddur* is Norwegian *redd*, from Old Norse *hræddr*. | BMO redd ("norr. hræddr, av hræða 'skremme'") | sourced |
| *ánægður* is pleased, satisfied; *ánægður með*, pleased with. | W ánægður ("content, satisfied"); T 3799207, 383487 ("He is pleased with his work") | sourced |
| *hamingjusamur* is made from *hamingja* ("happiness, luck"), in Norse belief a spirit of luck that followed a person. | W hamingjusamur ("From the genitive of Old Norse hamingja ('luck') + -samur. In Nordic mythology, hamingja was a type of female guardian spirit that accompanied an individual and brought them luck and happiness"), hamingja ("happiness"; "luck, fortune") | sourced |
| Afraid of is *hræddur við*; angry with is *reiður út í*, or *reiður* with the dative. | T 690290, 451942; T 1324568, 389325 ("Father is angry with me") | attested |
| *hlæja* and *gráta* are strong verbs (*hló*, *grét*, *grætur*), Norwegian *le* and *gråte*, from Old Norse *hlæja*, *gráta*; *brosa* is weak (*brosti*). | DMII; W hlæja, gráta ("From Old Norse"); BMO le ("norr. hlæja"), gråte ("norr. gráta"); T 12360435, 4020755, 1316627, 673131 | sourced |
| You laugh at someone with *að* and smile at someone with *til*. | T 489308 ("Everyone laughed at him"), 3799259, 512680 ("She smiled at her baby") | attested |
| *hissa* does not inflect. | W hissa ("surprised [indeclinable]"); T 10963618, 3799404 | sourced |
| *áhyggja* is used in the plural, *áhyggjur* ("worries"): *Hafðu ekki áhyggjur*, *Engar áhyggjur*, *hafa áhyggjur af*. | W áhyggja ("(in the plural) worries"; "Engar áhyggjur. = No worries."); T 494519, 542934, 384111 | sourced |
| *skap* is mood: *í góðu skapi*, *ekki í skapi til að*. | W skap ("mood, temper"; "Hann er í þungu skapi. = He is in a bad mood."); T 495489, 852818 | sourced |
| Norwegian *skap* in the sense shape, figure (*fin på skap*) is the same Old Norse word; the cupboard *skap* is *skápur*. | BMO skap ("norr. skap"; "form, figur"; "være fin på skap"); W skap ("form, shape"; "From Old Norse skap"); the *Heima* row on *skápur* | sourced |
| *Föt og fólk* leaves out *uppáhald* ("favorite"): GreynirCorrect asks for *uppáhalds* and the noun after it to be written as one word (*uppáhaldsliturinn*, code C003), so the sentences with *uppáhalds* before a noun do not pass the lint. | GreynirCorrect, on the made *Hver er uppáhalds liturinn þinn?* (from T 398808) | checked |
| *Föt og fólk* leaves out *lágvaxinn* ("short", of a person): Wiktionary has no entry for it, so the app would show no English gloss, and Tatoeba has no sentence with it. | W (no entry, kaikki.org); T (none) | checked |

### *Veður*

| Claim | Source | Status |
|---|---|---|
| Weather verbs take an empty *það*, left out when another word comes first. | Weather verbs (*Það rignir í dag* / *Í dag rignir*); elon (dummy *það*); T 386152 | sourced |
| *Mér er kalt*: a dative subject; *líka* with the dative. | UCSC ("me-DAT is cold"); W líka ("strict dative-nominative verb") | sourced |
| *úti/út*, *inni/inn*, *heima/heim*: place and direction. | W heima ("at home"), heim ("(towards) home"), úti, inni; WP ("Inn and út denote motion") | sourced |
| *sjá*: *sé, sérð, sér, sá*; *horfa á* + accusative; *heyra* + accusative, *heyra í* + dative. | DMII; W horfa, heyra; T 488512 | sourced |
| *eldfjall* = *eldur* + *fjall*; *norðurljós* = *norður* + *ljós*. | W eldfjall, norðurljós | sourced |
| Norwegian relatives (*vær*, *fjell*, *foss*, *jøkel*, *sky*, *sol*, *vind*). | `data/bridge.json` (BMO and W name the same Old Norse word) | sourced |

### *Líkaminn*

| Claim | Source | Status |
|---|---|---|
| Something hurts with *Mér er illt í* and the body part with its article, in the dative after *í*; the one it hurts is in the dative too. | W hönd ("Mér er illt í hendinni. = My hand hurts."); T 882033 ("My back hurts"), 1316601, 690292, 882031 ("Her daughter has a stomachache"); DMII (*höfðinu*, *hálsinum*, *maganum*: ÞGF ET with the article) | sourced |
| Norwegian uses the definite form the same way: *ha vondt i hodet*, *vondt i magen*. | BMO hode ("ha vondt i hodet"), mage ("ha vondt i magen") | sourced |
| *illt* is the neuter of *illur*, as *vondt* is of Norwegian *vond*. | DMII (*illt*: FSB HK NF ET of *illur*); BMO vond ("jf vondt"; "au, det gjør vondt") | sourced |
| *Hvar meiðir það?* asks where it hurts. | T 1329176 ("Where does it hurt?") | attested |
| *háls* is the neck and the throat; so is Norwegian *hals*. | W háls ("neck, throat"); BMO hals ("kroppsdel mellom hodet og resten av kroppen"; "svelg, strupe") | sourced |
| *höfuð*, *munnur*, *eyra*, *magi*, *háls*, *hönd* and Norwegian *hode*, *munn*, *øre*, *mage*, *hals*, *hånd* come from the same Old Norse words. | BMO hode ("norr. hǫfuð"), munn ("norr. munnr"), øre ("norr. eyra"), mage ("norr. magi"), hals ("norr. hals"), hånd ("norr. hǫnd"); W höfuð, munnur, eyra, magi, háls, hönd ("From Old Norse") | sourced |
| Icelandic *bak* is the back, Norwegian *rygg*; Norwegian *bak* is the backside. | W bak ("back"); BMO bak ("kroppsdel på baksiden mellom rygg og (bak)bein"; "bakende, rumpe"; "norr. bak"), rygg ("bakre del av overkroppen") | sourced |
| Norwegian *rygg* is Old Norse *hryggr*, Icelandic *hryggur*, the spine. | BMO rygg ("norr. hryggr"); W hryggur ("the spine, the back"; "From Old Norse hryggr") | sourced |
| *handleggur* is *hönd* + *leggur* ("leg, bone"); Norwegian *legg* (the lower leg) is Old Norse *leggr*. | W handleggur ("From hönd + leggur"), leggur ("leg, shank", "bone"; "From Old Norse leggr"); BMO legg ("norr. leggr"; "parti mellom kne og ankel") | sourced |
| *andlit* is the Old Norse word for face; Norwegian *ansikt* came from Low German. | W andlit ("From Old Norse andlit ('face')"); BMO ansikt ("fra l.ty.") | sourced |
| *nef* is nose (and beak); Norwegian *nebb* has the same origin. | W nef ("nose", "beak"); BMO nebb ("sm_o_s norr. nef 'nese, nebb'") | sourced |
| *hönd* changes its vowel: *hönd*, *hendi*, *handar*, plural *hendur*. | DMII (hönd: ÞGF ET *hendi*, EF ET *handar*, NF FT *hendur*) | sourced |
| *líða* is impersonal in the sense "feel", with the one who feels in the dative: *Hvernig líður þér?*, *Mér líður vel*, *Mér líður illa*. | W líða ("describing a specific feeling; to feel", impersonal; "Hvernig líður þér? - Mér líður ekki vel", "Okkur líður illa"); T 466865, 473067, 727701 | sourced |
| *líða* is a strong verb (*leið*), and with time it means to pass: *Tíminn líður*. | DMII (*leið*, GM-FH-ÞT-3P-ET); W líða ("to pass, to go by"; "Tíminn líður. = Time goes by."); T 944615 | sourced |
| *illa* is "badly", Norwegian *ille*, from Old Norse *illa*. | W illa ("badly, poorly"); BMO ille ("norr. illa") | sourced |
| Norwegian asks *hvordan har du det?* and says *føle seg* for how one feels. | BMO ha ("hvordan har du det?"), føle ("føle seg syk") | sourced |
| *veikur* is sick and agrees (*veikur*, *veik*); it is Norwegian *veik*, from Old Norse *veikr*, which in Norwegian is weak or sickly; Icelandic has the sense weak too. | W veikur ("weak, pliant"; "sick, ill"; "Hún er veik. = She's sick."); BMO veik ("norr. veikr"; "kraftløs, svak"; "sykelig") | sourced |
| Norwegian *syk* is Old Norse *sjúkr*, Icelandic *sjúkur*, found in *sjúkrahús*, Norwegian *sykehus*. | BMO syk ("norr. sjúkr"), sykehus; W sjúkur ("From Old Norse sjúkr"), sjúkrahús ("From sjúkur + hús") | sourced |
| *hraustur* is healthy and strong. | W hraustur ("healthy, well", "brave, valiant", "strong"); T 1316185, 1316184 | sourced |
| *slæmur* was borrowed from Danish *slem*, a loan from Low German; Norwegian *slem* is the same Low German word. *Ég er slæmur í bakinu* is "I have a bad back". | W slæmur ("Borrowed from Danish slem, which borrowed it from Middle Low German slim"; "Ég er slæmur í bakinu. = I have a bad back."); BMO slem ("av l.ty. slim"; "dårlig") | sourced |
| An illness goes with *vera með* and the accusative (*Ég er með hita*, *Ég er með höfuðverk*); catching one is *fá* (*Hann fékk kvef*). | T 1337035 ("I have a high fever"), 493912, 472990 ("I have a headache"), 1323341, 387306 ("He came down with a cold"); DMII (*hita*, *höfuðverk*: ÞF ET) | attested |
| *kvefaður* is "having a cold" and agrees: *kvefaður*, *kvefuð*. | W kvefaður ("having a cold, suffering from a cold"; "From kvef + -aður"); T 1323343, 1323342; DMII | sourced |
| *hiti* is heat, fever and temperature. | W hiti ("heat", "fever", "temperature") | sourced |
| *höfuðverkur* is *höfuð* + *verkur* ("ache, pain"); *verkur* and Norwegian *verk* are Old Norse *verkr*. | W höfuðverkur ("From höfuð + verkur"), verkur ("pain, ache"; "From Old Norse verkr"); BMO verk ("norr. verkr"; "murrende smerte") | sourced |
| *tannpína* is *tann-* + *pína* ("pain"), as Norwegian *tannpine* has *pine*, from Old Norse *pína*. | W tannpína ("From tann- + pína"), pína ("pain, torment"; "From Old Norse pína"); BMO tannpine ("smerter i tennene"), pine ("norr. pína") | sourced |
| *hnerra* comes from the Old Norse verb *hnjósa*, the source of Norwegian *nyse*. | W hnerra ("From the noun hnerri, from Old Norse hnøri, hneri, from the past stem of the verb hnjósa"); BMO nyse ("norr. hnjósa") | sourced |
| *hósta* and Norwegian *hoste* are Old Norse *hósta*. | W hósta ("Inherited from Old Norse hósta"); BMO hoste ("norr. hósta") | sourced |
| *læknir* is the one who heals, from *lækna* ("to cure, to heal"); Norwegian *lege* came from Danish, and Bokmålsordboka compares it with Old Norse *læknir*. | W læknir ("From Old Norse læknir ('healer'). Equivalent to lækna + -ir"), lækna ("to cure, to heal"); BMO lege ("fra da. \| jf norr. læknir, læknari, av lækna 'helbrede'") | sourced |
| *tannlæknir* is built like Norwegian *tannlege*. | W tannlæknir ("From tann- + læknir"); BMO tannlege | sourced |
| *hjúkrunarfræðingur* is made from *hjúkrun* ("nursing") and *fræði* ("science, studies"). | W hjúkrunarfræðingur ("From hjúkrunarfræði ('nursing') + -ingur"), hjúkrun ("nursing"), fræði ("science, studies") | sourced |
| To see a doctor is *fara til læknis*, with the genitive after *til*; to call one, *hringja í lækni* or *kalla á lækni*. | T 1322898 ("Tom saw a doctor"), 504913, 496903, 3994559 ("Call a doctor"), 652971; DMII (*læknis*: EF ET) | attested |
| *hjálp* and Norwegian *hjelp* come from Old Norse *hjalp*, *hjǫlp*; *kalla á hjálp* is Norwegian *rope om hjelp*. | W hjálp ("From Old Norse hjalp, hjǫlp"); BMO hjelp ("norr. hjǫlp"; "rope om hjelp"); T 385231 | sourced |
| *meiða sig* is "hurt yourself", Norwegian *skade seg*; *meiðast* is to be hurt. | W meiða ("to harm, hurt"); T 1321866 ("Tom hurt himself"), 1364165, 1324676 ("Nobody was injured"); BMO skade ("skade seg") | sourced |
| *brjóta* is a strong verb (*braut*); it is Norwegian *bryte*, from Old Norse *brjóta*, but Norwegian breaks an arm with *brekke*, from Low German. | DMII (*braut*); W brjóta ("to break"); BMO bryte ("norr. brjóta"), brekke ("av l.ty. breken"; "få til å knekke"); T 1318342, 3994549 ("I broke my leg") | sourced |
| *batna* is impersonal with the dative in the sense "recover": *Ég vona að þér batni fljótt*. | W batna ("to cause to recover (from a disease) [with preceding dative 'someone']"; "Mér batnaði fljótt. = I recovered quickly."); T 482953 ("I hope that you get better soon"); DMII (*batni*: OP-ÞGF-GM-VH-NT-3P-ET) | sourced |
| *vona* comes from *von* ("hope"), Norwegian *von*, from Old Norse *ván*; Norwegian also has the verb *vone*. | W vona ("From Old Norse vána, from the noun ván ('hope') (Icelandic von)"), von ("hope"); BMO von ("norr. ván"; "håp"), vone ("håpe"; "norr. vána") | sourced |
| *lyfjabúð* is *lyf* ("medicine") + *búð* ("shop"), another word for a pharmacy; Norwegian *apotek* comes from Greek *apotheke*, a store. | W lyf ("drug, medicine"), lyfjabúð ("apothecary, pharmacy"; "From lyf + búð"), apótek ("apothecary, pharmacy"); BMO apotek ("av gr. apotheke 'forråd'") | sourced |
| *reykja* and Norwegian *røyke* are Old Norse *reykja*; *hætta að reykja* is to stop smoking. | W reykja ("From Old Norse reykja"); BMO røyke ("norr. reykja"); T 854224 ("You must stop smoking"), 1323353 | sourced |
| *kvefið* is *kvef* with the article, not a misspelling of *kveðið* as GreynirCorrect suggests (W001/w); the suggestion is not counted (`scripts/lib/lint.mjs`). | DMII (*kvefið*: NF/ÞF ET with the article of *kvef*); W kvef ("cold (illness)"); T 383524 ("How's your cold?") | sourced |
| *Líkaminn* leaves out *nef* ("nose"), *anda* ("breathe"), *líkami* ("body"), *hjarta* ("heart") and *fingur* ("finger"): Tatoeba has at most one readable sentence for each here, and no sentence to make more from with one word changed. | T (searched with the scratch picker, 2026-11-26) | checked |
| *Líkaminn* leaves out *fljótur* ("quick"), which *Ég vona að þér batni fljótt* needs: *fljótt* is an adverb of its own in BÍN, and Wiktionary has no entry for it. | BÍN (*fljótt* ao); W (no entry, kaikki.org) | checked |

### *Frítími*

| Claim | Source | Status |
|---|---|---|
| What you like doing is *mér finnst gaman að*: *finnst* is the middle voice of *finna*, impersonal with the dative. | BÍN (*finnst*: MM-FH-NT-3P-ET of *finna*, also OP-ÞGF-MM); W finnast ("to feel, to find, to think"; "Finnst þér fótbolti skemmtilegur?"), gaman ("fun, pleasure, enjoyment"); T 1321867 ("I like traveling"), 1318364, 1356548 | sourced |
| *hafa gaman af* with the dative is to like something; *skemmta sér* is to have a good time. | T 387930 ("I like skiing"), 673167 ("We enjoy playing soccer"), 1315624 ("Have fun"), 3997312 ("Tom had a very good time") | attested |
| *frítími* is *frí* + *tími*. | BÍN (*frítími* kk); W frí ("vacation, holiday"), tími | sourced |
| *langa* takes the one who wants in the accusative, *að* (or *til að*) with an infinitive, and *í* with the accusative for a thing. | W langa ("to cause to want ... [with preceding accusative 'someone', along with í (+ accusative) 'something' or að (+ infinitive)]"); T 1368331, 3772755, 3994437 ("I want something sweet") | sourced |
| Norwegian says *jeg har lyst til å* and *jeg har lyst på*. | BMO lyst ("få lyst på sjokolade", "ha lyst til å spille piano") | sourced |
| *áhugi* is *á* ("on") + *hugi* ("mind"); *hafa áhuga á* takes the dative; *áhugamál* is a matter of interest, a hobby. | W áhugi ("á + hugi"), áhugamál ("Literally, matter of interest"; "hobby, interest"); T 385014, 386377 ("He had a great fancy for traveling"); DMII (*tónlist*, *íþróttum*: ÞGF) | sourced |
| *íþrótt* and Norwegian *idrett* come from Old Norse *íþrótt*. | W íþrótt ("From Old Norse íþrótt"); BMO idrett ("norr. íþrótt") | sourced |
| *fótbolti* is *fótur* + *bolti*. | W fótbolti ("From fótur + bolti") | sourced |
| A team is *lið*; Norwegian *lag* is a team, while Icelandic *lag* is a song (and a layer). | W lið ("team (in sports, games, competitions, etc.)"), lag ("layer", "tune, song", "order"); BMO lag ("gruppe som deltar i konkurranser som en enhet"; "et tynt lag maling") | sourced |
| *leikur* is a game or a match, Norwegian *lek*, from Old Norse *leikr*. | W leikur ("game", "match, game"; "From Old Norse leikr"); BMO lek (`data/bridge.json`, "norr. leikr") | sourced |
| *spila* is to play a game, a sport, cards or an instrument; it and Norwegian *spille* were borrowed from Low German. | W spila ("to play", "to play an instrument"; "Ég spila fótbolta"; "Borrowed from Middle Low German spil"); BMO spille ("av l.ty. spelen, spillen") | sourced |
| *æfa sig* is to practice, to train. | W æfa ("to practise"); T 502963, 908560 ("She always practices the piano") | sourced |
| *hlaupa* is Norwegian *løpe*, from Old Norse *hlaupa*, and strong (*hleypur*, *hljóp*, *hlupum*). | BMO løpe ("norr. hlaupa"); W hlaupa; DMII; T 1315602, 1315590, 673912 | sourced |
| *synda* is weak (*synti*) and made from *sund* ("swimming"); Norwegian *sund* is the same word, originally a place one can swim across. | DMII (*synti*, *syntum*); W synda ("From Old Norse sund ('swimming')"), sund ("swimming"; "channel, strait, sound"); BMO sund ("norr. sund \| besl med svømme, opprinnelig 'sted der en kan svømme over'") | sourced |
| *skíði* is Norwegian *ski*, from Old Norse *skíð*; one goes skiing with *fara á skíði* and is *á skíðum*. | W skíði ("From Old Norse skíð"); BMO ski ("norr. skíð"); T 745360 ("I go skiing very often"), 387930, 3795579 | sourced |
| *hjóla* is to ride a bike, from *hjól*. | W hjóla ("to bike, cycle"), hjól | sourced |
| *dansa* came into Old Norse through Old French. | W dansa ("From Old Norse dansa, through Old French") | sourced |
| *tónlist* is *tónn* + *list*; *list* is art. | W tónlist ("From tónn + list"), list ("art") | sourced |
| *syngja* is strong (*syng*, *söng*), as Norwegian *synge* is. | DMII; BMO synge ("norr. syngja"; *sang*, *sunget*); T 11792677, 388893, 690303 | sourced |
| An instrument is played with *spila á* and the accusative. | T 11514561 ("She plays the guitar very well"), 476777, 690303; the parser's accusative for *gítar* and *píanóið* there | attested |
| *hljómsveit* is a band; *tónleikar* (a concert) is always plural, like *gleraugu*. | W hljómsveit ("band, orchestra"), tónleikar ("concert"); DMII (*tónleikar*: plural forms only) | sourced |
| *leika* is Norwegian *leke*, from Old Norse *leika*; *leika sér* is to play; it is also to play a part or an instrument. | W leika ("to play"); BMO leke ("norr. leika"); T 469369, 545060, 742883, 1368365 ("She acted in the play"), 469359 | sourced |
| *skák* and Norwegian *sjakk* come from Persian *šāh*, the king in the game; *tefla* is also to play chess. | W skák ("From Old Norse skák, from Classical Persian شاه (šāh)"), tefla ("to play a board game; specifically, to play chess"); BMO sjakk ("norr. skák f, oppr persisk \| sm_o_s sjah etter kongen i spillet") | sourced |
| *mála* and *teikna* are Norwegian *male* and *tegne*, from Old Norse *mála* and *teikna*. | W mála ("From Old Norse mála"); BMO male ("norr. mála \| fra l.ty. malen"), tegne ("norr. teikna el tákna") | sourced |
| *bíó* came from Danish *bio*, short for *biograf*; to the movies is *í bíó*. | W bíó ("Borrowed from Danish bio, shortened from biograf"); T 476827, 3994929, 388450 | sourced |
| *leikhús* is *leikur* + *hús*. | W leikhús ("From leikur ('game, act, acting') + hús") | sourced |
| One goes to a concert with *á*. | T 908293 ("She accompanied her friend to the concert"), 860057 | attested |
| *ferðast* is Norwegian *ferdes*, from Old Norse *ferðask*. | W ferðast ("From Old Norse ferðask"); BMO ferdes ("norr. ferðast") | sourced |
| *veiða* is to fish and to hunt, Norwegian *veide*, from Old Norse *veiða*. | W veiða ("to hunt", "to fish"; "From Old Norse veiða"); BMO veide ("norr. veiða"); T 468929 ("My father went fishing") | sourced |
| *Frítími* leaves out *frítími* (no Wiktionary entry) and *hljómsveit* (one readable sentence, *Hljómsveitin mín heitir Red Hot*); the guidebook teaches both. Most sport sentences need *vinna* ("win"), which *Nám og vinna* brings, so the team sentences are made ones. | W (no entry for frítími, kaikki.org); T 388921 | checked |

### *Þjónusta*

| Claim | Source | Status |
|---|---|---|
| *vinsamlegast* ("please") is the superlative of the adverb *vinsamlega*, from *vinsamlegur* ("friendly"); it comes first with a command or after the verb. | BÍN (EST of *vinsamlega*); W vinsamlega ("please"); T 1316194, 831722, 388910, 905343 ("Please phone him") | sourced |
| *Gæti ég fengið* asks politely for something. | T 795478 ("Could I have another glass of beer?"), 624010 | attested |
| *opinn* is Norwegian *åpen*, from Old Norse *opinn*, related to *upp*; it agrees. | BMO åpen ("norr. opinn 'vendt oppover' \| besl med opp"); W opinn; DMII; T 863098, 10717440, 1364302 | sourced |
| *lokaður* (closed) is the past participle of *loka*. | DMII (*lokaður*, LHÞT of *loka*); T 828854 ("Keep the door closed"), 382249 ("The road to Nagano is closed to traffic"); W loka | sourced |
| *röð* is a row or a line, Norwegian *rad*, from Old Norse *rǫð*; *bíða í röð* is to wait in line. | W röð ("a row, a line"); BMO rad ("norr. rǫð"); T 11514566 ("You have to wait in line") | sourced |
| *næstur* is next, Norwegian *neste*, from Old Norse *næstr*: *á næsta ári*, *í næstu viku*. | W næstur ("nearest, closest", "next"); BMO neste ("norr. næstr \| av nær"); T 908795, 908815 | sourced |
| *sæti* is Norwegian *sete*, from Old Norse *sæti*, related to *sitja* (Norwegian *sitte*). | W sæti; BMO sete ("norr. sæti \| besl med sitte") | sourced |
| *póstur* was borrowed from Danish *post*; *pósthús* is *póstur* + *hús*. | W póstur ("Borrowed from Danish post"), pósthús ("From póstur + hús") | sourced |
| *frímerki* is Norwegian *frimerke*, which Bokmålsordboka explains as a mark that makes the mail free. | W frímerki ("postage stamp"); BMO frimerke ("opprinnelig 'merke som gjør postsendingen fri'") | sourced |
| *pakki* is Norwegian *pakke*, from Old Norse *pakki*. | W pakki ("From Old Norse pakki"); BMO pakke (`data/bridge.json`, "norr. pakki") | sourced |
| *sækja* is to fetch or pick up; it is Norwegian *søke*, from Old Norse *sǿkja*, and *sækja um*, like *søke om*, is to apply for. | W sækja ("to fetch", "to pick up"; "From Old Norse sǿkja"); BMO søke ("norr. sǿkja"; "henvende seg til for å få studieplass, arbeid eller lignende"); T 382464 (made), 504853 ("You should apply for that post") | sourced |
| *skipta* is Norwegian *skifte*, from Old Norse *skipta*; *skipta um* is to change (trains); it also means to matter. | W skipta ("to change", "to matter"); BMO skifte ("norr. skipta"; "han skiftet skjorte"); T 1356547 ("Do I have to change trains?"), 856004 ("It doesn't matter") | sourced |
| *greiða* is to pay and also to comb; Norwegian *greie* is from the same Old Norse *greiða*. | W greiða ("to comb", "to pay"); BMO greie ("norr. greiða"); T 624013 | sourced |
| *lán* is a loan and luck, Norwegian *lån*, from Old Norse *lán*; *lána* is to lend, and to borrow is *fá lánað*; Norwegian *låne* is mostly to borrow. | W lán ("loan", "luck"), lána ("to lend"); BMO lån ("norr. lán"), låne ("norr. lána"; "få noe til bruk en viss tid"); T 1353526 ("He lent me two books"), 1368359 ("May I borrow your car?"), 844949 ("Fortune has turned in my favor") | sourced |
| *kvittun* is a receipt. | W kvittun ("receipt"); T 1355112 ("May I have a receipt?") | sourced |
| *miði* is a ticket and a note. | W miði ("note, slip of paper", "transportation ticket"); T 1364325, 3799342 ("Tom read the note") | sourced |
| *ferð* is Norwegian *ferd*, from Old Norse *ferð*; *Góða ferð!* | W ferð ("trip, tour, journey"); BMO ferd ("norr. ferð"); T 706968 ("Have a safe trip") | sourced |
| *farangur* is *fara* + *-angur*, the things one takes along. | W farangur ("From fara ('to go') + -angur, i.e. 'the things that one takes with oneself when going somewhere'") | sourced |
| *bóka* is to book. | W bóka ("to book (register an order for a hotel room ...)"); T 740812 ("I'd like to reserve a single room") | sourced |
| *lest* was borrowed from Low German *last* ("load"); Norwegian *last* is cargo. | W lest ("train"; "From Middle Low German last"); BMO last ("gods som fraktes med et transportmiddel"; "fra l.ty. \| jf norr. lest") | sourced |
| *Lestin var að fara* is "the train has just left": *var að* with an infinitive can mean "had just". | T 543815 ("The train just left") | attested |
| *stöð* is from Old Norse *stǫð*, from *standa*; to the station is *á* with the accusative, at it *á* with the dative. | W stöð ("From Old Norse stǫð, from standa"); T 673368, 512723; the *á* rules (`content/case-rules.json`) | sourced |
| *leigubíll* is *leiga* ("rent") + *bíll*. | W leigubíll ("From leiga + bíll") | sourced |
| *upplýsing* is *upp* + *lýsing* ("lighting"), and information is usually plural, *upplýsingar*. | W upplýsing ("upp + lýsing"; "information"); T 10615789, 564511, 545669 (all plural) | sourced |
| *gleyma* is Norwegian *glemme*, from Old Norse *gleyma*, from *glaumr* ("merriment"): to be so merry that one neglects; it is weak (*gleymdi*). | W gleyma ("From Old Norse gleyma ('to be merry; to forget'), from glaumr"); BMO glemme ("norr. gleyma, av glaumr 'overstadig glede', opprinnelig 'være overstadig lystig (og derfor forsømme)'"); DMII | sourced |
| *týna* is to lose a thing; Norwegian *tyne*, from the same Old Norse *týna*, is to destroy or kill. | W týna ("to lose (objects)"; "From Old Norse týna"); BMO tyne ("norr. týna, av tjón 'skade'"; "gjøre ende på", "drepe"); T 479468, 427992 | sourced |
| *skila* is to give back, with the dative of the thing; *skila kveðju* is to give someone's regards. | W skila ("to give back, to return"); T 504864 ("You must return the book to him"), 387054 ("Please say hello to him for me") | sourced |
| *Þjónusta* leaves out *lokaður* and *hraðbanki* (no Wiktionary entry; *lokaður* is read as *loka*), and *eyðublað*, *afsláttur*, *skilríki* (no sentence). | W (no entries, kaikki.org); T | checked |

### *Í gær*

| Claim | Source | Status |
|---|---|---|
| Yesterday is *í gær* (Norwegian *i går*), the day before *í fyrradag* (Norwegian *i forgårs*); *gær* is used only in the phrase. | W gær ("yesterday"), fyrradagur ("day before yesterday"); BÍN (*gær* ao); BMO forgårs ("i forgårs") | sourced |
| *í gær* comes last, or first with the verb right after it. | T 833306 ("I was ill yesterday"), 466906 ("Yesterday I bought a book"); the verb-second order (V2) | sourced |
| A time ago is *fyrir* with the dative; since is *síðan*; recently is *nýlega*. | T 1351378 ("He died one year ago"), 669486 ("I have lived here since I was a child"), 389570; W síðan, nýlega ("recently") | sourced |
| Strong verbs make the past by a vowel change (*var*, *fór*, *kom*, *sá*); weak verbs add an ending with a d or t sound (*hjálpaði*, *hringdi*, *keypti*). | DMII (GM-FH-ÞT forms); WP (Icelandic grammar: strong and weak verbs) | sourced |
| Norwegian has the same split: *var*, *dro*, *kom*, *så*, but *hjalp*, *ringte*, *kjøpte*. | BMO være, dra, komme, se, hjelpe, ringe, kjøpe (inflection tables) | sourced |
| The past of *deyja* is *dó*, of *halda* *hélt*, of *missa* *missti*. | DMII; T 673841, 733929, 389001 | sourced |
| *nú* is Norwegian *nå*, from Old Norse *nú*; *ná* ("reach") is the other Norwegian *nå*, from Old Norse *ná*. | W nú ("From Old Norse nú"), ná ("From Old Norse ná"); BMO nå (adverb: "norr. nú"; verb: "norr. ná") | sourced |
| *þá* is then, Norwegian *da*, from Old Norse *þá*; *þá* is also "them". | W þá ("then"; "them, accusative of þeir"); BMO da ("norr. þá") | sourced |
| *enn* (*enn þá*) is still, yet; Norwegian *ennå* is Old Norse *ennú*, *enn* + *nú*. | W enn ("still", "yet"); BMO ennå ("norr. ennú \| av enn og nå"); T 1322931, 1323366, 3795586 | sourced |
| *áður* is before; *áður en* is before (something happens). | W áður ("before, earlier, previously"); T 664703, 385847 ("You should eat something before you go") | sourced |
| *frétt* is news, mostly plural; *Hvað er að frétta?* asks what is new. | W frétt ("piece of news", "news"); T 3799215, 5003409, 3994916 | sourced |
| *saga* is Norwegian *saga*, from Old Norse *saga*. | W saga ("From Old Norse saga"); BMO saga ("norr. saga 'utsagn, fortelling'") | sourced |
| *trúa* is Norwegian *tro*, from Old Norse *trúa*; the one believed is in the dative; *trúa á* is believe in. | W trúa ("to believe"); BMO tro ("norr. trúa"); T 791730 ("She always believes me"), 790341 ("She doesn't believe in God") | sourced |
| *halda* is Norwegian *holde*, from Old Norse *halda*, strong (*held*, *hélt*); it also means to think; *halda áfram að* is to go on doing. | W halda ("to hold", "to think (have an opinion)"); BMO holde ("norr. halda"); DMII; T 385938 ("I think so, too"), 388956 ("He went on doing it") | sourced |
| *missa af* is to miss (a bus, a train); Norwegian *miste* in that sense follows English. | W missa ("to lose"); T 389001 ("I missed the last bus yesterday"); BMO miste ("i betydningen 'komme for sent' etter engelsk") | sourced |
| *deyja* is Norwegian *dø*, from Old Norse *deyja*. | W deyja; BMO dø ("norr. deyja") | sourced |
| *Í gær* leaves out *áðan* ("a while ago", no sentence) and *gerast* ("happen"), the middle voice of *gera*, which the course already teaches. | T; BÍN (*gerðist*, MM of *gera*) | checked |

### *Vinna*

| Claim | Source | Status |
|---|---|---|
| Languages are feminine nouns in -a with a small letter; accusative after *tala*. | Ritreglur §1.3.4 ("Heiti tungumála … eru rituð með litlum upphafsstaf", example *íslenska*) and §1.3.1 (small letter by default, so also *íslenskur*); DMII; T 1322938 | sourced |
| *vita* a fact, *þekkja* a person, *kunna* a skill. | W vita, þekkja, kunna | sourced |
| *geta* takes the supine. | W geta (usage note: "requires the supine (sagnbót) form … rather than the bare infinitive") | sourced |
| *hjálpa*, *svara*, *loka* take a dative object; *opna* the accusative. | W hjálpa; T 763491, 828852, 828861 | sourced (hjálpa), attested (svara, loka, opna) |
| The past in -aði, -ði, -di, -ti; strong verbs change their vowel. | DMII | attested |
| *vinna* is "work" and "win". | W vinna (*Ég vann!* "I won!") | sourced |
| A job is said with no word for "a" (*Ég er kennari*), as in Norwegian (*være lærer*); Icelandic has no indefinite article. | WP ("Icelandic does not have an indefinite article (a/an in English)"); T 390420, 3799233; BMO lærer ("være lærer i historie") | sourced |
| *verða* is to become. | W verða ("to become"); T 10963975 ("She became a police officer"), 385001 | sourced |
| *starf* and *vinna* are both a job. | W starf ("work, job"), vinna ("a job, an occupation"); T 1329209 ("He accepted the job"), 482274 ("I like my job very much") | sourced |
| At the office is *á skrifstofunni*; *Hringdu í mig á skrifstofuna* is "call me at the office". | T 748906 ("Is Mr Jones in the office?"), 1356526 ("Call me at the office") | attested |
| *lögreglumaður* is *lögregla* (police) and *maður*; *yfirmaður* (boss) is *yfir* (over) and *maður*. | W lögreglumaður ("From lögregla (“police”) + maður (“man”)"), yfirmaður ("From yfir (“over”) + maður (“person”)"; "boss, superior (at work)") | sourced |
| Working hours take *frá* and *til*: *Ég vinn frá níu til fimm hvern dag*. | T 387400 ("I work from nine to five every day"), 385016 | attested |
| *vakt* (a shift) is Norwegian *vakt*, both from Middle Low German. | W vakt ("shift, watch"; "From Middle Low German wachte"); BMO vakt ("fra l.ty.") | sourced |
| *mæta* is to show up, Norwegian *møte*, from Old Norse *mǿta*; Norwegian *møte* is also to come to a meeting. | W mæta ("to turn up, to show up, to come"; "From Old Norse mǿta … Compare Norwegian møte"); BMO møte ("norr. mǿta"; "komme til et møte til avtalt tid og sted") | sourced |
| *hlé* (a break) is the same Old Norse word as Norwegian *le* (*i le*, out of the wind). | W hlé ("break, rest"; "shelter"; "From Old Norse hlé"); BMO le ("norr. hlé"; "side … som vender fra vinden", "i le") | sourced |
| Ill is *veik* for a woman and *veikur* for a man: *Ég er veik*, *Ég er veikur*; *Ég kem ekki í dag* is "I am not coming today". | DMII (*veik* KVK NFET, *veikur* KK NFET); T 564515, 564514 (the same sentence for a woman and a man), 861954 | sourced |
| A day off is *frídagur*: *Hann tók sér frídag*. | BÍN (*frídagur* kk, ÞFET *frídag*); T 387261 ("He took a day off"), 1344426 | sourced |
| The extra lessons leave out *frídagur* and *veikindi* ("illness"; no Wiktionary entry, as for *frítími* in *Frítími*) and *tilkynna* (no readable sentence); the guidebook teaches *frídagur*. | W (no entries, kaikki.org); T 742882 | checked |

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
| A name at the start is replaced by *Hann* (*Peter þarf ekki að mæta á fundinn* → *Hann þarf …*), the English name by "He"; the supine *farið* by the supine *mætt* (*Ég get ekki farið á fundinn í dag*), and the English stays, since "make it to" says both | DMII (*mætt*, GM-SAGNB of *mæta*); W mæta ("to turn up, to show up, to come") | checked |
| A month after *í* has the same form in the accusative (time: *í dag* → *í janúar*) and the dative (place: *í Afríku* → *í janúar*), so the months fit both frames; in the made sentence it is a time | DMII (*janúar* … *desember*: NF, ÞF, ÞGF the same form); elon time prepositions (*í* + month) | checked |
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
| 469047-1 | *Litli skápurinn er skítugur.* | T 469047 | *ísskápurinn* → *skápurinn* | The little cupboard is dirty. |
| 469047-2 | *Litli ísskápurinn er hreinn.* | T 469047 | *skítugur* → *hreinn* | The little fridge is clean. |
| 473555-1 | *Þennan sófa þarf að laga.* | T 473555 | *stól* → *sófa* | This sofa needs to be fixed. |
| 473555-2 | *Þennan lampa þarf að laga.* | T 473555 | *stól* → *lampa* | This lamp needs to be fixed. |
| 483002-1 | *Hún er í stofunni.* | T 483002 | *baðherberginu* → *stofunni* | She is in the living room. |
| 483002-2 | *Hún er í svefnherberginu.* | T 483002 | *baðherberginu* → *svefnherberginu* | She is in the bedroom. |
| 657272-1 | *Kötturinn sefur á teppinu.* | T 657272 | *sófanum* → *teppinu* | The cat sleeps on the carpet. |
| 827613-1 | *Svefnherbergið er uppi.* | T 827613 | *Klósettið* → *Svefnherbergið* | The bedroom is upstairs. |
| 827613-2 | *Baðherbergið er uppi.* | T 827613 | *Klósettið* → *Baðherbergið* | The bathroom is upstairs. |
| 827613-3 | *Klósettið er niðri.* | T 827613 | *uppi* → *niðri* | The toilet is downstairs. |
| 827650-1 | *Hvar er stofan?* | T 827650 | *klósettið* → *stofan* | Where is the living room? |
| 827650-2 | *Hvar er svefnherbergið?* | T 827650 | *klósettið* → *svefnherbergið* | Where is the bedroom? |
| 827650-3 | *Hvar er lampinn?* | T 827650 | *klósettið* → *lampinn* | Where is the lamp? |
| 827650-4 | *Hvar er skápurinn?* | T 827650 | *klósettið* → *skápurinn* | Where is the cupboard? |
| 827650-5 | *Hvar er sjónvarpið?* | T 827650 | *klósettið* → *sjónvarpið* | Where is the television? |
| 827650-6 | *Hvar er lykillinn?* | T 827650 | *klósettið* → *lykillinn* | Where is the key? |
| 828861-1 | *Opnaðu skápinn.* | T 828861 | *dyrnar* → *skápinn* | Open the cupboard. |
| 905147-1 | *Það eru engir sófar í þessu herbergi.* | T 905147 | *stólar* → *sófar* | There are no sofas in this room. |
| 1316200-1 | *Kveiktu á honum.* | T 1316200 | *Slökktu* → *Kveiktu* | Turn it on. |
| 1316201-1 | *Kveiktu á henni.* | T 1316201 | *Slökktu* → *Kveiktu* | Turn it on. |
| 1316202-1 | *Kveiktu á því.* | T 1316202 | *Slökktu* → *Kveiktu* | Turn it on. |
| 1320713-1 | *Herbergið er hreint.* | T 1320713 | *heitt* → *hreint* | The room is clean. |
| 1320713-2 | *Herbergið er skítugt.* | T 1320713 | *heitt* → *skítugt* | The room is dirty. |
| 1320714-1 | *Það er heitt í stofunni.* | T 1320714 | *herberginu* → *stofunni* | The living room is hot. |
| 1320714-2 | *Það er heitt í íbúðinni.* | T 1320714 | *herberginu* → *íbúðinni* | The apartment is hot. |
| 1323737-1 | *Hann fór niður.* | T 1323737 | *kom* → *fór* | He went downstairs. |
| 1323737-2 | *Hann kom upp.* | T 1323737 | *niður* → *upp* | He came upstairs. |
| 1329150-1 | *Slökktu á lampanum.* | T 1329150 | *útvarpinu* → *lampanum* | Turn off the lamp. |
| 1329150-2 | *Slökktu á sjónvarpinu.* | T 1329150 | *útvarpinu* → *sjónvarpinu* | Turn off the television. |
| 1355099-1 | *Tökum til í íbúðinni okkar.* | T 1355099 | *herberginu* → *íbúðinni* | Let's clean our apartment. |
| 1355101-1 | *Þrífum íbúðina okkar.* | T 1355101 | *herbergið* → *íbúðina* | Let's clean our apartment. |
| 1355138-1 | *Við viljum nýtt sjónvarp.* | T 1355138 | *teppi* → *sjónvarp* | We want a new television. |
| 11052105-1 | *Ég er uppi.* | T 11052105 | *hérna* → *uppi* | I'm upstairs. |
| 11052105-2 | *Ég er niðri.* | T 11052105 | *hérna* → *niðri* | I'm downstairs. |
| 11514512-1 | *Báturinn var skítugur.* | T 11514512 | *hreinn* → *skítugur* | The boat was dirty. |
| 12701233-1 | *Teppið mitt er gamalt.* | T 12701233 | *Sjónvarpið* → *Teppið* | My carpet is old. |
| 387039-1 | *Hún setti trefilinn sinn á sig.* | T 387039 | *hattinn* → *trefilinn* | She put on her scarf. |
| 460455-1 | *Ég þvæ vettlingana mína.* | T 460455 | *sokkana* → *vettlingana* | I wash my mittens. |
| 473520-1 | *Hún er með brún augu.* | T 473520 | *blá* → *brún* | She has brown eyes. |
| 473521-1 | *Augun hennar eru brún.* | T 473521 | *blá* → *brún* | Her eyes are brown. |
| 482640-1 | *Hann var með brúnt hár.* | T 482640 | *grátt* → *brúnt* | He had brown hair. |
| 482640-2 | *Hann var með svart hár.* | T 482640 | *grátt* → *svart* | He had black hair. |
| 515552-1 | *Þessir kjólar eru of langir.* | T 515552 | *stórir* → *langir* | These dresses are too long. |
| 515552-2 | *Þessir kjólar eru of stuttir.* | T 515552 | *stórir* → *stuttir* | These dresses are too short. |
| 583574-1 | *Ég þvoði úlpuna mína.* | T 583574 | *skyrtuna* → *úlpuna* | I washed my winter coat. |
| 647420-1 | *Mér líkar enginn þessara lita.* | T 647420 | *hatta* → *lita* | I don't like any of these colors. |
| 653110-1 | *Sokkarnir eru of litlir.* | T 653110 | *Skórnir* → *Sokkarnir* | The socks are too small. |
| 653110-2 | *Vettlingarnir eru of litlir.* | T 653110 | *Skórnir* → *Vettlingarnir* | The mittens are too small. |
| 906655-1 | *Hún fékk tösku frá pabba.* | T 906655 | *skó* → *tösku* | She got a bag from Father. |
| 1315549-1 | *Hann er fyndinn.* | T 1315549 | *klár* → *fyndinn* | He's funny. |
| 1315549-2 | *Hann er rólegur.* | T 1315549 | *klár* → *rólegur* | He's calm. |
| 1315549-3 | *Hann er leiðinlegur.* | T 1315549 | *klár* → *leiðinlegur* | He's boring. |
| 1315606-1 | *Ég er rólegur.* | T 1315606 | *leiður* → *rólegur* | I'm calm. |
| 1318211-1 | *Það er of langt.* | T 1318211 | *stórt* → *langt* | It's too long. |
| 1318211-2 | *Það er of stutt.* | T 1318211 | *stórt* → *stutt* | It's too short. |
| 1323716-1 | *Hvar er taskan þín?* | T 1323716 | *húfan* → *taskan* | Where is your bag? |
| 1323716-2 | *Hvar er úlpan þín?* | T 1323716 | *húfan* → *úlpan* | Where is your winter coat? |
| 1323716-3 | *Hvar er skyrtan þín?* | T 1323716 | *húfan* → *skyrtan* | Where is your shirt? |
| 1323734-1 | *Allir voru hissa.* | T 1323734 | *glaðir* → *hissa* | Everyone was surprised. |
| 1324694-1 | *Hún er með grátt hár.* | T 1324694 | *stutt* → *grátt* | She has gray hair. |
| 1337006-1 | *Hann tók af sér trefilinn.* | T 1337006 | *hattinn* → *trefilinn* | He took off his scarf. |
| 1337006-2 | *Hann tók af sér vettlingana.* | T 1337006 | *hattinn* → *vettlingana* | He took off his mittens. |
| 1337006-3 | *Hann tók af sér úlpuna.* | T 1337006 | *hattinn* → *úlpuna* | He took off his winter coat. |
| 1337019-1 | *Skórnir hans eru gráir.* | T 1337019 | *brúnir* → *gráir* | His shoes are gray. |
| 1337019-2 | *Skórnir hans eru bleikir.* | T 1337019 | *brúnir* → *bleikir* | His shoes are pink. |
| 3795329-1 | *Ég er hissa.* | T 3795329 | *glaður* → *hissa* | I'm surprised. |
| 3795642-1 | *Mér finnst það leiðinlegt.* | T 3795642 | *fyndið* → *leiðinlegt* | I find that boring. |
| 4007860-1 | *Þessi mynd er fyndin.* | T 4007860 | *leiðinleg* → *fyndin* | This movie is funny. |
| 4010182-1 | *Bíllinn minn er brúnn.* | T 4010182 | *rauður* → *brúnn* | My car is brown. |
| 4010182-2 | *Bíllinn minn er grár.* | T 4010182 | *rauður* → *grár* | My car is gray. |
| 4171677-1 | *Ég var hissa.* | T 4171677 | *leiður* → *hissa* | I was surprised. |
| 10635094-1 | *Þú ert rólegur.* | T 10635094 | *klár* → *rólegur* | You're calm. |
| 10969608-1 | *Hvar get ég keypt úlpu?* | T 10969608 | *sokka* → *úlpu* | Where can I buy a winter coat? |
| 10969608-2 | *Hvar get ég keypt trefil?* | T 10969608 | *sokka* → *trefil* | Where can I buy a scarf? |
| 10969608-3 | *Hvar get ég keypt vettlinga?* | T 10969608 | *sokka* → *vettlinga* | Where can I buy mittens? |
| 10969608-4 | *Hvar get ég keypt skyrtu?* | T 10969608 | *sokka* → *skyrtu* | Where can I buy a shirt? |
| 10969608-5 | *Hvar get ég keypt tösku?* | T 10969608 | *sokka* → *tösku* | Where can I buy a bag? |
| 12340291-3 | *Þetta er grænn litur.* | T 12340291 | *fiskur* → *litur* | This is a green color. |
| 882031-1 | *Dóttur hennar er illt í höfðinu.* | T 882031 | *maganum* → *höfðinu* | Her daughter has a headache. |
| 882031-2 | *Dóttur hennar er illt í hálsinum.* | T 882031 | *maganum* → *hálsinum* | Her daughter has a sore throat. |
| 882031-3 | *Dóttur hennar er illt í eyranu.* | T 882031 | *maganum* → *eyranu* | Her daughter has an earache. |
| 882033-1 | *Mér er illt í hálsinum.* | T 882033 | *bakinu* → *hálsinum* | My throat hurts. |
| 882033-2 | *Mér er illt í eyranu.* | T 882033 | *bakinu* → *eyranu* | My ear hurts. |
| 882033-3 | *Mér er illt í maganum.* | T 882033 | *bakinu* → *maganum* | My stomach hurts. |
| 882033-4 | *Mér er illt í hendinni.* | T 882033 | *bakinu* → *hendinni* | My hand hurts. |
| 882033-5 | *Mér er illt í handleggnum.* | T 882033 | *bakinu* → *handleggnum* | My arm hurts. |
| 511464-1 | *Þau hafa stór eyru.* | T 511464 | *Kanínur* → *Þau* | They have big ears. |
| 513951-1 | *Hann lagðist á magann.* | T 513951 | *bakið* → *magann* | He lay on his stomach. |
| 1364165-1 | *Hann meiddi sig í vinstri hendinni.* | T 1364165 | *höndinni* → *hendinni* | He hurt his left hand. |
| 1364165-2 | *Hann meiddi sig í vinstri handleggnum.* | T 1364165 | *höndinni* → *handleggnum* | He hurt his left arm. |
| 3994549-1 | *Ég braut handlegginn minn.* | T 3994549 | *fótlegginn* → *handlegginn* | I broke my arm. |
| 1323648-1 | *Andlitið á honum er rautt.* | T 1323648 | *Tom* → *honum* | His face is red. |
| 1319432-3 | *Opnaðu munninn.* | T 1319432 | *flöskuna* → *munninn* | Open your mouth. |
| 3799221-1 | *Ég opnaði munninn.* | T 3799221 | *augun* → *munninn* | I opened my mouth. |
| 828852-1 | *Lokaðu munninum.* | T 828852 | *dyrunum* → *munninum* | Close your mouth. |
| 1321866-1 | *Hann meiddi sig.* | T 1321866 | *Tom* → *Hann* | He hurt himself. |
| 537223-1 | *Veðrið er svo slæmt!* | T 537223 | *gott* → *slæmt* | The weather is so bad! |
| 495489-1 | *Hann er í slæmu skapi í dag.* | T 495489 | *góðu* → *slæmu* | He's in a bad mood today. |
| 10288758-1 | *Hann er ekki með kvef.* | T 10288758 | *hita* → *kvef* | He doesn't have a cold. |
| 1316185-1 | *Ég er kvefaður.* | T 1316185 | *hraustur* → *kvefaður* | I have a cold. |
| 1316184-1 | *Ég er kvefuð.* | T 1316184 | *hraust* → *kvefuð* | I have a cold. |
| 472990-1 | *Ég er með hita.* | T 472990 | *höfuðverk* → *hita* | I have a fever. |
| 882032-1 | *Sonur minn er með hita.* | T 882032 | *tannpínu* → *hita* | My son has a fever. |
| 882032-2 | *Sonur minn er með höfuðverk.* | T 882032 | *tannpínu* → *höfuðverk* | My son has a headache. |
| 882032-3 | *Sonur minn er með kvef.* | T 882032 | *tannpínu* → *kvef* | My son has a cold. |
| 1317132-1 | *Ég hósta mikið.* | T 1317132 | *hnerra* → *hósta* | I cough a lot. |
| 1317133-1 | *Ég hósta oft.* | T 1317133 | *hnerra* → *hósta* | I cough a lot. |
| 1364319-1 | *Ég get ekki hætt að hósta.* | T 1364319 | *hnerra* → *hósta* | I can't stop coughing. |
| 10973142-1 | *Ég hóstaði.* | T 10973142 | *hnerraði* → *hóstaði* | I coughed. |
| 3795330-1 | *Ég er ekki hjúkrunarfræðingur.* | T 3795330 | *læknir* → *hjúkrunarfræðingur* | I'm not a nurse. |
| 3994554-1 | *Við erum hjúkrunarfræðingar.* | T 3994554 | *læknar* → *hjúkrunarfræðingar* | We are nurses. |
| 666974-1 | *Hann er sagður vera góður hjúkrunarfræðingur.* | T 666974 | *læknir* → *hjúkrunarfræðingur* | He's said to be a good nurse. |
| 504913-1 | *Í dag fór ég til tannlæknisins.* | T 504913 | *læknisins* → *tannlæknisins* | Today, I went to the dentist's. |
| 4048172-1 | *Ég er tannlæknir.* | T 4048172 | *hjúkrunarfræðingur* → *tannlæknir* | I'm a dentist. |
| 1315576-1 | *Hvernig líður sjúklingnum?* | T 1315576 | *Mary* → *sjúklingnum* | How is the patient? |
| 4172215-1 | *Hvar er apótekið?* | T 4172215 | *sjúkrahúsið* → *apótekið* | Where is the pharmacy? |
| 483002-3 | *Hún er í apótekinu.* | T 483002 | *baðherberginu* → *apótekinu* | She is in the pharmacy. |
| 386105-1 | *Hún hitti frænda sinn í apótekinu.* | T 386105 | *búðinni* → *apótekinu* | She met her uncle at the pharmacy. |
| 888256-1 | *Hún sagði honum að taka lyfin.* | T 888256 | *ráðlagði* → *sagði* | She told him to take the medicine. |
| 888244-1 | *Hún sagði honum að hætta að taka þessi lyf.* | T 888244 | *ráðlagði* → *sagði* | She told him to stop taking that medicine. |
| 11516190-1 | *Læknirinn gaf henni lyf.* | T 11516190 | *verkjalyf* → *lyf* | The doctor gave her some medicine. |
| 5030347-1 | *Er kvefið í þér að batna?* | T 5030347 | *Tom* → *þér* | How's your cold? |
| 391731-1 | *Ég vil að mömmu minni batni strax.* | T 391731 | *skjótt* → *strax* | I want my mother to get well right away. |
| 882031-4 | *Dóttur hennar er illt í bakinu.* | T 882031 | *maganum* → *bakinu* | Her daughter has a backache. |
| 466872-1 | *Hvað er áhugamálið þitt?* | T 466872 | *símanúmerið* → *áhugamálið* | What's your hobby? |
| 1329118-1 | *Þetta er áhugamálið mitt.* | T 1329118 | *hjólið* → *áhugamálið* | This is my hobby. |
| 482417-1 | *Hún og vinir hennar elska íþróttir.* | T 482417 | *tónlist* → *íþróttir* | She and her friends love sports. |
| 483014-1 | *Núna er fríið búið.* | T 483014 | *Nú* → *Núna* | Now the vacation is over. |
| 388450-1 | *Ég var í fríi.* | T 388450 | *bíói* → *fríi* | I was on vacation. |
| 11208765-2 | *Þetta er ekki leikur.* | T 11208765 | *salt* → *leikur* | This isn't a game. |
| 3772549-1 | *Mér finnst gaman að spila leiki.* | T 3772549 | *fótbolta* → *leiki* | I like to play games. |
| 544571-1 | *Liðið þitt er betra en okkar.* | T 544571 | *sterkara* → *betra* | Your team is better than ours. |
| 675375-1 | *Liðið okkar var í rauðum peysum.* | T 675375 | *treyjum* → *peysum* | Our team were wearing red sweaters. |
| 382513-1 | *Spilum spil.* | T 382513 | *fótbolta* → *spil* | Let's play cards. |
| 12701220-1 | *Ég ætla að spila spil í kvöld.* | T 12701220 | *fótbolta* → *spil* | I am going to play cards tonight. |
| 4032105-1 | *Mér finnst gaman að dansa.* | T 4032105 | *elda* → *dansa* | I like to dance. |
| 4032105-2 | *Mér finnst gaman að hjóla.* | T 4032105 | *elda* → *hjóla* | I like to bike. |
| 4032105-3 | *Mér finnst gaman að teikna.* | T 4032105 | *elda* → *teikna* | I like to draw. |
| 1318364-1 | *Honum finnst gaman að dansa.* | T 1318364 | *hlaupa* → *dansa* | He likes to dance. |
| 1318364-2 | *Honum finnst gaman að hjóla.* | T 1318364 | *hlaupa* → *hjóla* | He likes to bike. |
| 1318364-3 | *Honum finnst gaman að synda.* | T 1318364 | *hlaupa* → *synda* | He likes to swim. |
| 385969-1 | *Getur þú farið með mig í leikhús?* | T 385969 | *bíó* → *leikhús* | Could you take me to the theater? |
| 476827-1 | *Af hverju fer fólk í leikhús?* | T 476827 | *bíó* → *leikhús* | Why do people go to the theater? |
| 388450-2 | *Ég var í leikhúsi.* | T 388450 | *bíói* → *leikhúsi* | I was at a theater. |
| 386377-1 | *Hann hafði mikinn áhuga á tónlist.* | T 386377 | *ferðalögum* → *tónlist* | He had a great interest in music. |
| 386377-2 | *Hann hafði mikinn áhuga á íþróttum.* | T 386377 | *ferðalögum* → *íþróttum* | He had a great interest in sports. |
| 386377-3 | *Hann hafði mikinn áhuga á fótbolta.* | T 386377 | *ferðalögum* → *fótbolta* | He had a great interest in soccer. |
| 386377-4 | *Hann hafði mikinn áhuga á skák.* | T 386377 | *ferðalögum* → *skák* | He had a great interest in chess. |
| 583658-1 | *Ég þarf lán.* | T 583658 | *hjálp* → *lán* | I need a loan. |
| 4000851-1 | *Hann þarf lán.* | T 4000851 | *hjálp* → *lán* | He needs a loan. |
| 583658-2 | *Ég þarf upplýsingar.* | T 583658 | *hjálp* → *upplýsingar* | I need information. |
| 4000851-2 | *Hann þarf upplýsingar.* | T 4000851 | *hjálp* → *upplýsingar* | He needs information. |
| 382464-1 | *Ég kem að sækja þig á sunnudaginn.* | T 382464 | *hitta* → *sækja* | I will come to pick you up next Sunday. |
| 383188-1 | *Það er maður kominn til að sækja þig.* | T 383188 | *hitta* → *sækja* | There is a gentleman to pick you up. |
| 387306-1 | *Hann fékk póst.* | T 387306 | *kvef* → *póst* | He got mail. |
| 624010-1 | *Gæti ég vinsamlegast fengið kvittunina?* | T 624010 | *reikninginn* → *kvittunina* | May I have the receipt, please? |
| 4172215-2 | *Hvar er pósthúsið?* | T 4172215 | *sjúkrahúsið* → *pósthúsið* | Where is the post office? |
| 1324689-8 | *Hún keypti frímerki.* | T 1324689 | *kjúkling* → *frímerki* | She bought stamps. |
| 1324689-9 | *Hún keypti miða.* | T 1324689 | *kjúkling* → *miða* | She bought a ticket. |
| 3795505-1 | *Af hverju ætti ég að greiða?* | T 3795505 | *borga* → *greiða* | Why should I pay? |
| 10969598-1 | *Við getum greitt.* | T 10969598 | *borgað* → *greitt* | We can pay. |
| 1329173-1 | *Hvenær endar það?* | T 1329173 | *byrjar* → *endar* | When does it end? |
| 4022330-1 | *Skólinn endar á morgun.* | T 4022330 | *byrjar* → *endar* | School ends tomorrow. |
| 798532-1 | *Konan hló skyndilega.* | T 798532 | *Brúðurin* → *Konan* | The woman suddenly laughed. |
| 10629511-1 | *Hann fæddist í janúar.* | T 10629511 | *Afríku* → *janúar* | He was born in January. |
| 487079-1 | *Hún verður sautján í janúar.* | T 487079 | *febrúar* → *janúar* | She will be seventeen in January. |
| 10629511-2 | *Hann fæddist í febrúar.* | T 10629511 | *Afríku* → *febrúar* | He was born in February. |
| 10629511-3 | *Hann fæddist í mars.* | T 10629511 | *Afríku* → *mars* | He was born in March. |
| 487079-2 | *Hún verður sautján í mars.* | T 487079 | *febrúar* → *mars* | She will be seventeen in March. |
| 10629511-4 | *Hann fæddist í apríl.* | T 10629511 | *Afríku* → *apríl* | He was born in April. |
| 487079-3 | *Hún verður sautján í apríl.* | T 487079 | *febrúar* → *apríl* | She will be seventeen in April. |
| 10629511-5 | *Hann fæddist í maí.* | T 10629511 | *Afríku* → *maí* | He was born in May. |
| 487079-4 | *Hún verður sautján í maí.* | T 487079 | *febrúar* → *maí* | She will be seventeen in May. |
| 10629511-6 | *Hann fæddist í júní.* | T 10629511 | *Afríku* → *júní* | He was born in June. |
| 487079-5 | *Hún verður sautján í júní.* | T 487079 | *febrúar* → *júní* | She will be seventeen in June. |
| 10629511-7 | *Hann fæddist í júlí.* | T 10629511 | *Afríku* → *júlí* | He was born in July. |
| 487079-6 | *Hún verður sautján í júlí.* | T 487079 | *febrúar* → *júlí* | She will be seventeen in July. |
| 10629511-8 | *Hann fæddist í ágúst.* | T 10629511 | *Afríku* → *ágúst* | He was born in August. |
| 487079-7 | *Hún verður sautján í ágúst.* | T 487079 | *febrúar* → *ágúst* | She will be seventeen in August. |
| 10629511-9 | *Hann fæddist í september.* | T 10629511 | *Afríku* → *september* | He was born in September. |
| 487079-8 | *Hún verður sautján í september.* | T 487079 | *febrúar* → *september* | She will be seventeen in September. |
| 10629511-10 | *Hann fæddist í október.* | T 10629511 | *Afríku* → *október* | He was born in October. |
| 487079-9 | *Hún verður sautján í október.* | T 487079 | *febrúar* → *október* | She will be seventeen in October. |
| 10629511-11 | *Hann fæddist í nóvember.* | T 10629511 | *Afríku* → *nóvember* | He was born in November. |
| 487079-10 | *Hún verður sautján í nóvember.* | T 487079 | *febrúar* → *nóvember* | She will be seventeen in November. |
| 10629511-12 | *Hann fæddist í desember.* | T 10629511 | *Afríku* → *desember* | He was born in December. |
| 487079-11 | *Hún verður sautján í desember.* | T 487079 | *febrúar* → *desember* | She will be seventeen in December. |
| 698303-1 | *Ég verð heima í janúar.* | T 698303 | *dag* → *janúar* | I'll stay home in January. |
| 698303-2 | *Ég verð heima í febrúar.* | T 698303 | *dag* → *febrúar* | I'll stay home in February. |
| 698303-3 | *Ég verð heima í mars.* | T 698303 | *dag* → *mars* | I'll stay home in March. |
| 698303-4 | *Ég verð heima í apríl.* | T 698303 | *dag* → *apríl* | I'll stay home in April. |
| 698303-5 | *Ég verð heima í maí.* | T 698303 | *dag* → *maí* | I'll stay home in May. |
| 698303-6 | *Ég verð heima í júní.* | T 698303 | *dag* → *júní* | I'll stay home in June. |
| 698303-7 | *Ég verð heima í júlí.* | T 698303 | *dag* → *júlí* | I'll stay home in July. |
| 698303-8 | *Ég verð heima í ágúst.* | T 698303 | *dag* → *ágúst* | I'll stay home in August. |
| 698303-9 | *Ég verð heima í september.* | T 698303 | *dag* → *september* | I'll stay home in September. |
| 698303-10 | *Ég verð heima í október.* | T 698303 | *dag* → *október* | I'll stay home in October. |
| 698303-11 | *Ég verð heima í nóvember.* | T 698303 | *dag* → *nóvember* | I'll stay home in November. |
| 698303-12 | *Ég verð heima í desember.* | T 698303 | *dag* → *desember* | I'll stay home in December. |
| 390420-1 | *Hann er lögreglumaður.* | T 390420 | *kennari* → *lögreglumaður* | He is a police officer. |
| 390420-2 | *Hann er verkfræðingur.* | T 390420 | *kennari* → *verkfræðingur* | He is an engineer. |
| 390420-3 | *Hann er lögfræðingur.* | T 390420 | *kennari* → *lögfræðingur* | He is a lawyer. |
| 723360-1 | *Er hann lögreglumaður?* | T 723360 | *kennari* → *lögreglumaður* | Is he a police officer? |
| 723360-2 | *Er hann verkfræðingur?* | T 723360 | *kennari* → *verkfræðingur* | Is he an engineer? |
| 723360-3 | *Er hann lögfræðingur?* | T 723360 | *kennari* → *lögfræðingur* | Is he a lawyer? |
| 1323758-1 | *Ég er ekki verkfræðingur.* | T 1323758 | *kennari* → *verkfræðingur* | I am not an engineer. |
| 1323758-2 | *Ég er ekki lögreglumaður.* | T 1323758 | *kennari* → *lögreglumaður* | I am not a police officer. |
| 1337017-1 | *Hann vinnur fyrir fyrirtæki.* | T 1337017 | *banka* → *fyrirtæki* | He works for a company. |
| 513948-1 | *Hann á fyrirtæki.* | T 513948 | *bíl* → *fyrirtæki* | He has a company. |
| 544576-1 | *Hver er yfirmaðurinn þinn?* | T 544576 | *kennarinn* → *yfirmaðurinn* | Who is your boss? |
| 905126-1 | *Yfirmaðurinn þinn verður ekki ánægður.* | T 905126 | *Kennarinn* → *Yfirmaðurinn* | Your boss won't be pleased. |
| 1329173-2 | *Hvenær byrjar vaktin?* | T 1329173 | *það* → *vaktin* | When does the shift begin? |
| 4022330-2 | *Vaktin byrjar á morgun.* | T 4022330 | *Skólinn* → *Vaktin* | The shift starts tomorrow. |
| 1329173-3 | *Hvenær byrjar fundurinn?* | T 1329173 | *það* → *fundurinn* | When does the meeting begin? |
| 583658-3 | *Ég þarf hlé.* | T 583658 | *hjálp* → *hlé* | I need a break. |
| 4000851-3 | *Hann þarf hlé.* | T 4000851 | *hjálp* → *hlé* | He needs a break. |
| 795543-1 | *Hann þarf ekki að mæta á fundinn.* | T 795543 | *Peter* → *Hann* | He doesn't need to attend the meeting. |
| 10635142-1 | *Ég get ekki mætt á fundinn í dag.* | T 10635142 | *farið* → *mætt* | I can't make it to the meeting today. |

## Bokmål translations (`content/translations-nb.json`)

Tatoeba has a Bokmål translation for 36 of the 3,636 sentences. The other 3,564 (all but 36 excluded ones) were translated by hand for TÖLVA, from the Icelandic, with Tatoeba's English translation as a check; the 265 made sentences (above) from their own English. A translation is a claim about meaning; these are checked as follows.

| Check | Source | Status |
|---|---|---|
| Every word is a Bokmål word form: a headword or inflected form, a word of a headword expression (*morges* in *i morges*, *tide* in *på tide*), a genitive of such a form, or a compound of two (*svømmehall*, *klimaanlegg*) | BMO, looked up by `npm run validate` (`scripts/lib/bokmal.mjs`) | sourced (word forms) |
| Names: kept as in the Icelandic sentence (Tom, Mary), or in their usual Norwegian form (Island, Tyskland, Sveits, Genève, Moskva), listed in the file's `names` | the place names are the Norwegian exonyms; *Hótel Ísland* keeps its own name | design choice |
| The sentence ends like the Icelandic (or like Tatoeba's English, where the Icelandic has a typo, such as *Má ég fara með þér.*) | `npm run validate` | checked |
| Options of one choice exercise never share a translation, in English or Bokmål | `tests/engine.test.mjs` | checked |

Conventions: common-gender forms for feminine nouns (*boken*, *klokken*, *døren*, as the app's Norwegian interface writes *ordboken*), «» for quoted speech, *du* for *þú* and *dere* for *þið*, Norwegian idiom where the Icelandic is idiomatic (*Takk for maten*, *Det har du godt av*, *Det var på tide*). Where Icelandic separates sentences that Bokmål cannot (gender of *þeir*, *þær*, *þau*; *velkominn* and *velkomin*), the translations are the same.

## Bokmål glosses (`content/glosses-nb.json`)

Wiktionary gives a Bokmål gloss for 537 of the 652 course words. The other 115 were glossed by hand from the word's English Wiktionary meaning (W) and its use in the course sentences, and 102 of Wiktionary's were corrected (below). Every word of every gloss the app shows, from Wiktionary or by hand, is a Bokmålsordboka form (BMO, checked by `npm run validate`), and a gloss of several words is one of the file's `phrases` (Bokmål expressions such as *av og til*, *se på*, *få lov til*). The first gloss is the one exercises show.

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
| upp, út, inn, uppi, niðri, hérna, leggja | opp; ut; inn; oppe, ovenpå; nede, nedenunder; her; legge | W "up", "out", "in, inside", "above, upstairs", "downstairs, below", "here", "to lay, to put"; BMO oppe ("norr. uppi"), nede ("norr. niðri"), legge; *hérna* shares *her* with *hér*, near-synonyms |
| hreinn, skítugur | ren; skitten | W "clean", "dirty"; BMO ren ("norr. hreinn"), skitten ("som ikke er ren") |
| kveikja, slökkva | tenne, slå på; slokke, slå av | W "to light ... turn on (a light)", "to extinguish, to put out"; BMO tenne ("skru på elektrisk lys"), slokke ("slokke lyset"; "norr. sløkkva"); *slå på* and *slå av* are phrases in the file |
| úlpa, taska, gleraugu, hávaxinn | parkas, anorakk, boblejakke; veske, bag; briller; høy, høyvokst | W "a thick winter coat ...; a parka; an anorak", "bag, case", "glasses, eyeglasses, spectacles", "tall"; BMO parkas ("varmt, fôret ytterplagg med hette"), veske, briller, høyvokst ("av høy/høg vekst") |
| klár, svona | smart, flink, klar; slik, så | W "clever, sharp ...", second "prepared, ready" (*klar*, BMO "ferdig, i stand"); W "thus, like this", "to this degree"; BMO slik |
| glaður, ánægður, leiður, hræddur, rólegur, hissa, áhyggja | glad; fornøyd, tilfreds; lei seg, lei; redd, skremt; rolig; overrasket, forbauset; bekymring | W "happy, glad", "content, satisfied", "sad" and "fed up (with)", "afraid; scared, frightened", "quiet, calm", "surprised", "worries"; BMO glad ("norr. glaðr"), lei ("være lei seg"; "norr. leiðr"), redd ("norr. hræddr"), rolig ("av ro"); *lei seg* is a phrase in the file |
| brjóta, líða, illur, illa, veikur, hraustur, kvefaður, læknir, batna | brekke, knuse, bryte; føle seg, ha det, gå; vond, dårlig, ond; dårlig, ille; syk, svak; frisk, sunn, sterk; forkjølet; lege, doktor; bli bedre | W "to break", "describing a specific feeling; to feel" (*Mér líður vel*, *Jeg har det bra*; *ha det* is also *bless*, so *føle seg* comes first), "evil, ill" (in the course sentences *Mér er illt í*, *Jeg har vondt i*), "badly, poorly", "sick, ill", "healthy, well", "having a cold", "doctor", "to get better"; BMO brekke ("brekke armen" is how a bone breaks), vond ("det gjør vondt"), ille ("norr. illa"), syk, frisk ("som har god helse"), forkjølet, lege; *bli bedre*, *føle seg* are phrases in the file |
| langa, skemmta, spila, æfa, hjóla, spil | ha lyst, lengte; underholde, more; spille; øve, trene; sykle; kort, spill | W "to cause to want", "to entertain, amuse", "to play", "to practise", "to bike, cycle", "game (with ... playing cards or a board)", "playing card"; BMO lyst ("få lyst på sjokolade"), underholde, more ("muntre, oppmuntre, underholde"), spille, øve, trene, sykle, kort; *ha lyst* is a phrase in the file |
| röð, frímerki, sækja, skipta, bóka, upplýsing | kø, rekke; frimerke; hente; bytte, veksle, dele; bestille, booke; opplysning, informasjon | W "a row, a line", "postage stamp", "to fetch", "to change, exchange", "to book", "information"; BMO kø, rekke, frimerke, hente, bytte, veksle, bestille, booke, opplysning |
| maí | mai | W "May"; BMO mai ("årets femte måned"); Wiktionary gave no Bokmål gloss for *maí*; the other months have one |
| hlé, mæta | pause; møte opp, møte | W "break, rest", "to turn up, to show up"; BMO pause ("ta seg en pause"), møte ("komme til et møte til avtalt tid og sted"); *møte opp* is a phrase in the file |
| gær, frétt, eyða, áfram, missa, ná | i går; nyhet; bruke, ødelegge; videre, fremover; miste; nå, rekke | W "yesterday", "news", "to spend, waste", "forward, forth, on", "to lose", "to reach"; BMO nyhet, bruke, ødelegge, videre, fremover, miste, nå, rekke; *i går* is a phrase in the file |

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
| setja | legge | sette, stille | "to put, to place"; *legge* is *leggja* ("to lay"), a course word of the same unit |
| mynd | bilde (second: kino) | bilde, film | "image, picture", also "movie, film"; *kino* is a cinema (BMO), Icelandic *bíó* |
| svefnherbergi, baðherbergi | soveværelse; bad | soverom, soveværelse; baderom, bad | "bedroom", "bathroom": *soverom* is the everyday word (BMO); *bad* is also *bað* ("bath"), so *baderom* comes first |
| þarna | der | der borte, der | "over there, there (the place being pointed at)"; *der* alone is *þar* (the guidebook) |
| hattur | hatt (second: lue) | hatt | "hat"; *lue* is a soft cap, the gloss of *húfa* (W húfa "cap (soft brimless hat)") |
| fyndinn | artig | morsom, artig | "funny": *morsom* (BMO "som morer ... lattervekkende") is the word the course sentences translate it with (*Dette er ikke morsomt!*); *gøy* removed |
| skap | lag | humør, lune | "mood, temper"; BMO humør ("sinnsstemning, lune"), lune ("sinnsstemning, humør"); *í góðu skapi* is *i godt humør* |
| hamingjusamur | glad | lykkelig | "happy"; *glad* is the gloss of *glaður* (the same unit), so the two never look alike as options |
| höfuð | hode (second: leder, sjef) | hode | "a head"; *leder* and *sjef* are "head, chief" |
| munnur | munn (second: kjeft) | munn | "mouth"; *kjeft* is first of all the mouth of an animal (BMO "munn på dyr eller menneske"; "hunden kom mot dem med fråden om kjeften") |
| magi | mage (second: magesekk, mavesekk) | mage | "stomach", "tummy, belly": in the course sentences the belly (*Mér er illt í maganum*), not the organ |
| meiða | gjøre vont | skade, gjøre vondt | "to harm, hurt"; the neuter is spelled *vondt* (BMO vond, "det gjør vondt"); *svida* is not in BMO |
| hjúkrunarfræðingur | sykepleier (second: sykesøster, søster) | sykepleier | "nurse": *sykepleier* is the title for all; *søster* is a sister |
| hjálp | hjelp (second: hjelper) | hjelp | "help"; *hjelper* is a helper, a person |
| lyf | legemiddel | medisin, legemiddel | "drug, medicine": *medisin* is the everyday word (BMO "legemiddel, medikament"; "ta medisin") |
| vona | håpe (second: håp) | håpe | "to hope"; *håp* is the noun (*von*) |
| skila | returnere (second: komme tilbake) | levere tilbake, returnere | "to give back, to return": a thing given back; *komme tilbake* is "come back" |
| deyja, breyta, nýlega, skyndilega, þá | dø (second: dævve); gjøre om; nylig (second: i det siste); plutselig (second: med ett); da (second: den gang) | dø; endre, forandre; nylig, nettopp; plutselig; da, så | *dævve* is dialect; *gjøre om*, *i det siste*, *med ett* and *den gang* are several words, not listed as phrases |
| vakt, fyrirtæki | skift; selskap | vakt, skift; firma, bedrift, selskap | "shift, watch": Norwegian says *vakt* too (BMO vakt: "tidsrom da det holdes vakt", "jeg går på vakt klokka åtte"); "company, firm": *firma* and *bedrift* are the everyday words (BMO firma, bedrift) |
| halda | holde | holde, tro, mene | "to hold", second "to think (have an opinion)": *Ég held það*, *Jeg tror det* |

Later glosses (shown in the dictionary only) removed for the same reasons: another sense (*frá* mot "toward", *tala* preke "preach", *skilja* kunne, *nótt* kveld and aften "evening", *dagur* døgn "24 hours", *kirkja* gudstjeneste "church service", *tími* tempo and klokkeslett, *mínúta* øyeblikk "moment", *nýr* nåværende "current", *eða* ellers "otherwise", *fólk* lyd (old "people", today "sound"), *strákur* kamerat and kompis "buddy", *ský* støvsky "dust cloud", *systir* storesøster and lillesøster, *hnífur* knivblad, *veira* datavirus, *sætur* sukkertilsatt, *dós* kanne (BMO: a jug), *pylsa* kurv and korv (BMO's other word for a sausage, but *kurv* is mostly a basket), *þú* De and I, the polite and the old plural "you"), a noun for a verb (*svara* svar, *ganga* gåtur, *taka* opptak), a parsing remnant (*barn* "barn n mindreårig"), and words BMO does not list (*byrja* børje, *kaffihús* café, *garður* have, *hæ* heisan, *snjór* sne, *tuttugu* tyve). Added from W's senses: *skilja* skille ("to separate"), *tími* time ("hour"), *tala* prate.

## Bokmål etymologies (`content/etymology-nb.json`)

The 603 etymologies the dictionary shows come from English Wiktionary; for the Norwegian interface they were translated by hand. A translation adds no claim of its own: it says what the English says. Conventions: language names in Bokmål (Old Norse *norrønt*, Proto-Norse *urnordisk*, Proto-Germanic *urgermansk*, Proto-Indo-European *urindoeuropeisk*, Old English *gammelengelsk*, Middle Low German *middelnedertysk*, Ancient Greek *gammelgresk*, Middle English *mellomengelsk*, Old Armenian *gammelarmensk*), glosses in «», cited forms unchanged. Left out: Wiktionary's "Etymology tree" lists, which repeat the text after them, and slips in the English (the typo "Frin", a "[Term?]" placeholder). *loka* has no translation: its English only says "See Etymology 1." Every word of the translations is a form in Bokmålsordboka (`npm run validate`), except cited forms and these names:

| Name | Source | Status |
|---|---|---|
| *urindoeuropeisk*, *urindoeuropeiske* (Proto-Indo-European) | Norwegian Wikipedia, [Urindoeuropeisk](https://no.wikipedia.org/wiki/Urindoeuropeisk) | sourced |
| *urslavisk* (Proto-Slavic) | [Urslavisk](https://no.wikipedia.org/wiki/Urslavisk) | sourced |
| *kasjubisk* (Kashubian) | [Kasjubisk](https://no.wikipedia.org/wiki/Kasjubisk) | sourced |
| *oldgutnisk* (Old Gutnish) | [Gutnisk](https://no.wikipedia.org/wiki/Gutnisk) ("oldgutnisk (forngutnisk)"; the article does not use "gammelgutnisk") | sourced |
| *älvdalsk* (Elfdalian) | [Älvdalsk](https://no.wikipedia.org/wiki/%C3%84lvdalsk) | sourced |
| *norn* (Norn) | [Norn](https://no.wikipedia.org/wiki/Norn) | sourced |
| *Lilleasia* (Asia Minor) | Norwegian Wikipedia, [Anatolia](https://no.wikipedia.org/wiki/Anatolia) ("Anatolia, også kjent som Lilleasia"; the page *Lilleasia* redirects there) | sourced |
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

237 pairs are sourced (Bokmålsordboka and Wiktionary name the same Old Norse word), 8 are shared loans (Wiktionary names the source language). 21 pairs only look alike with the same meaning and are labeled in the app as "a shared origin is not confirmed". The spelling patterns describe spelling, not historical sound laws.

