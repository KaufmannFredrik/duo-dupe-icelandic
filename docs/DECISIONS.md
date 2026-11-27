# Decisions log

What was chosen, why, and what failed. Newest phase first. Evidence for every data-source claim is in [api-report.md](api-report.md), which `scripts/probe-apis.mjs` regenerates.

## Section A1, unit 17: *Þjónusta* (2026-11-27)

The ninth new unit of section A1 in [PLAN.md](PLAN.md), after *Nám og vinna*: services, the curriculum's "the bank, sending and fetching, tickets" (stage 2) and the plan's polite *vinsamlegast*, for the goal "make yourself understood in a shop, a bank and a post office" (`content/goals.json`, now also trained by this unit).

- **Words** (26, theme `services`): *vinsamlega*, *opinn*, *röð*, *næstur*, *sæti*; *pósthús*, *póstur*, *frímerki*, *pakki*, *sækja*; *skipta*, *greiða*, *lán*, *lána*, *kvittun*; *miði*, *bóka*, *ferð*, *farangur*; *lest*, *stöð*, *leigubíll*, *upplýsing*; *gleyma*, *týna*, *skila*. *banki*, *strætó*, *kort*, *reikningur*, *borga*, *senda*, *bréf*, *panta*, *bíða* and *hjálpa* were already taught. Chosen by topic, then counted with the scratch word picker limited to the words a learner has after *Nám og vinna*: *vinsamlegast* alone opens 42 Tatoeba sentences; *næstur*, *opinn*, *skipta*, *gleyma*, *lest* and *ferð* bring the most after it.
- **Meanings as Wiktionary words them:** *vinsamlega* "please" (its superlative *vinsamlegast* is the word in use), *röð* "line", *frímerki* "stamp", *skila* "return", *upplýsing* "information".
- **Left out:** *lokaður* ("closed"; no Wiktionary entry, and the sentences read it as the past participle of *loka*, a course word, so the guidebook teaches it), *hraðbanki* (no entry), *eyðublað*, *afsláttur*, *skilríki*, *undirskrift* (no sentence), *biðröð* (one; the guidebook uses *röð*).

### Sentences

- **The word "please":** the parser reads *vinsamlegast* as the neuter superlative of the adjective *vinsamlegur*, and where it cannot parse a sentence (most that start with *Vinsamlegast*), it leaves the word open between that and the adverb; either way no *vinsamlegast* sentence counted. In BÍN it is the superlative of the adverb *vinsamlega*, the course word. `scripts/lib/tags.mjs` now maps the parser's adjective to the course adverb for that form (`ADVERB_OF`), as `PLURAL_ONLY` does for *tónleikar*; 26 sentences now teach it.
- **13 made sentences** (decision 3), from 10 originals: *Ég þarf hjálp* and *Hann þarf hjálp* gave *lán* and *upplýsingar*; *Ég kem að hitta þig á sunnudaginn* and *Það er maður kominn til að hitta þig* gave *sækja*; *Hann fékk kvef* gave *póst*; *Gæti ég vinsamlegast fengið reikninginn?* gave *kvittunina*; *Hvar er sjúkrahúsið?* gave *pósthúsið*; *Hún keypti kjúkling* gave *frímerki* and *miða*; *Af hverju ætti ég að borga?* and *Við getum borgað* gave *greiða*. All passed GreynirCorrect and the parser. Every word has at least two readable sentences.
- **The host's line:** *Vinsamlegast fáðu þér sæti* ("Please have a seat") was the first choice, but GreynirCorrect flags it with a wrong suggestion (*fékk* for the imperative *fáðu*); the suggestion could be right in another sentence, so it was not listed as a false positive, and Amma Sigga says *Vinsamlegast taktu þetta sæti* ("Take this seat, please") instead.
- **Tag fixes** (12): *sæti* as the noun in two unparsed *Vinsamlegast* sentences; *Skilið* ("understood") as *skilja*, not *skila* (two); *pakka* ("to pack") as another word; wrong cases dropped for *upplýsingar* after *þarf* (two), *dyrnar* in *Ekki skilja dyrnar eftir opnar*, *ferð* after *fara í* (two) and *mánuði* in *í næsta mánuði* (two).
- **A translation corrected while reading the lessons:** *Lestin var að fara* is "the train has just left" (*var að* with an infinitive can mean "had just"), as its English says.

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): Please; At the post office; At the bank; Tickets; Bus, train and taxi; Forgotten and lost; and a review. Each has 12 exercises of seven to ten kinds.
- **Guidebook**, seven sections, every claim in `content/CLAIMS.md`: *vinsamlegast* as a superlative and *Gæti ég fengið*; *opinn* and *åpen*, *lokaður*, *röð* and *rad*, *næstur* and *neste*, *sæti* and *sete*; *póstur* from Danish, *frímerki* and *frimerke* (a mark that makes the mail free), *pakki*, *sækja* and *søke* (and *sækja um*, *søke om*); *skipta* and *skifte*, *skipta um lest*, *Það skiptir ekki máli*, *greiða* and *greie*, *lán* (also luck), *lána* to lend against Norwegian *låne* to borrow (*fá lánað*), *kvittun*; *miði* a ticket and a note, *ferð* and *ferd*, *farangur*, *bóka*; *lest* from Low German *last* (Norwegian *last*, cargo), *var að* for "has just", *stöð* with *á* and two cases, *leigubíll*, *upplýsingar*; *gleyma* and *glemme* from *glaumr* (merriment), *týna* against Norwegian *tyne* (to destroy), *skila* with the dative and *skila kveðju*. Sources: Wiktionary, Bokmålsordboka, BÍN, Tatoeba.
- **Host and story:** Amma Sigga hosts with *Vinsamlegast taktu þetta sæti*; the story *Stamps and a train* is a dialogue in which Elias buys stamps from Katla, asks for a receipt, and learns that his train has just left; eleven unchanged Tatoeba sentences readable after this unit.

### Data

- 607 words; 3,288 sentences (177 new, 13 of them made; 17 dropped because better ones were found for their words, and their hand translations removed); 176 new Bokmål translations by hand (163 for Tatoeba sentences, 13 for made ones), with *Niigata* added to the names; 6 hand glosses (*röð* kø, *frímerki* frimerke, *sækja* hente, *skipta* bytte, *bóka* bestille, *upplýsing* opplysning) and one correction (*skila*: *levere tilbake*, not *komme tilbake*); two new phrases (*levere tilbake*, *vær så snill*).
- 23 Bokmål etymologies (*vinsamlega*, *frímerki* and *bóka* have none in Wiktionary); audio for 203 new texts in each of the four voices; the Norwegian bridge has 307 words (13 more, among them *åpen*, *neste*, *sete*, *greie*, *lån*, *ferd*, *glemme*, and *tyne*, the same Old Norse word with another meaning, as the guidebook warns).

### Tests

- `node --test`: 231 tests (nineteen units; the seven new lessons produce valid exercises; *vinsamlegast* is *vinsamlega* in parsed and unparsed sentences; *Skilið* is *skilja*, *pakka* is not *pakki*).
- `node tests/smoke.mjs --unit=services`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa`: see the commit.

## Section A1, unit 15: *Frítími* (2026-11-27)

The eighth new unit of section A1 in [PLAN.md](PLAN.md), between *Líkaminn* and *Nám og vinna*: free time, the curriculum's "hobbies" (stage 2) and the plan's *mér finnst gaman að* and *mig langar*, for the goals "talk fairly freely about things you know well" and "take part in conversations about everyday matters" (`content/goals.json`, now also trained by this unit). Built after the owner said to keep building units one after another.

- **Words** (31, theme `freetime`): *langa*, *áhugi*, *áhugamál*, *skemmta*, *frí*; *íþrótt*, *fótbolti*, *leikur*, *lið*, *spila*, *æfa*; *hlaupa*, *synda*, *hjóla*, *skíði*, *dansa*; *tónlist*, *lag*, *syngja*, *gítar*, *píanó*; *leika*, *spil*, *skák*, *mála*, *teikna*; *bíó*, *leikhús*, *tónleikar*, *ferðast*, *veiða*. *gaman* (*Um mig*), *finna* (whose middle voice *finnst* is), *horfa*, *ganga* and *sundlaug* were already taught. Chosen by topic, then counted with the scratch word picker limited to the words a learner has after *Líkaminn*: *langa* (20 readable sentences), *spila*, *hlaupa*, *lag*, *ferðast* and *synda* bring the most. *spila* is in the sport lesson because *spila fótbolta* needs it there.
- **Meanings as Wiktionary words them:** *langa* "want", *spil* "card" (Wiktionary: "playing card"), *hjóla* "bike", *veiða* "fish". *æfa* is "practice" and *leikhús* "theater": Wiktionary has the British "practise" and "theatre", which the gloss check now reads as the American spelling (`scripts/build-data.mjs`), as it did "colour". *leika* and *spila* are both "play" (near-synonyms; the guidebook tells them apart).
- **Left out:** *frítími* itself (no Wiktionary entry, so no English gloss; the guidebook explains it as *frí* and *tími*), *hljómsveit* ("band", one readable sentence; the guidebook), *uppáhald* (still flagged by GreynirCorrect, see *Föt og fólk*), *keppa*, *bolti*, *mark*, *sund* (no readable sentence), *fljótur* (see *Líkaminn*). Most sentences about teams and matches need *vinna* ("win"), which *Nám og vinna* brings after this unit, so *lið* and *leikur* got made sentences.

### Sentences

- **24 made sentences** (decision 3), from 16 originals: *Hvað er símanúmerið þitt?* gave *Hvað er áhugamálið þitt?*; *Þetta er hjólið mitt* gave *áhugamálið*; *Hann hafði mikinn áhuga á ferðalögum* gave *tónlist*, *íþróttum*, *fótbolta*, *skák*; *Nú er fríið búið* became *Núna er fríið búið* (*nú* is not a course word, *núna* is) and *Ég var í bíói* gave *fríi* and *leikhúsi*; *Liðið þitt er sterkara en okkar* gave *betra*, and *Liðið okkar var í rauðum treyjum* *peysum*; *Spilum fótbolta* gave *Spilum spil*; *Mér finnst gaman að elda* and *Honum finnst gaman að hlaupa* gave *dansa*, *hjóla*, *teikna*, *synda*; *Getur þú farið með mig í bíó?* and *Af hverju fer fólk í bíó?* gave *leikhús*. A first try with *John hefur áhuga á golfi* failed: a name at the start of a sentence counts as an unknown word, so none of its made sentences were readable. All passed GreynirCorrect and the parser. Every word has at least three readable sentences but *leikur*, *lið*, *frí*, *áhugamál*, *hjóla* and *lag* (two each).
- **A plural-only word the parser names by its singular:** BÍN has *tónleikar* ("a concert", plural only, the DMII Core word) and *tónleikur*, with the same plural forms; the parser names *tónleikarnir* by *tónleikur*, so no concert sentence counted. `scripts/lib/tags.mjs` now maps the parser's lemma to the course word for such a pair (`PLURAL_ONLY`), and all five concert sentences are read right.
- **Loose tag fixes:** fourteen sentences have *lag* only in the idiom *(allt) í lagi* ("all right"), where it means order, not "song", and would have taught the word wrong. A tag fix can now say `"loose": true` (`scripts/build-tags.mjs`): the word is known, so the sentence stays readable, but it does not teach the word, as a preposition used as a particle already worked.
- **Tag fixes** (23 in all): the fourteen *í lagi*; *hef* as *hafa*, not *hefja*, in *Ég hef ekki áhuga á íþróttum* and *Ég hef gaman af skíðum*; *lög* ("law") in *Hann braut lög* and *fær* ("able") in *Ég er fær um að synda* as other words; *á* in *fara á skíði* as the preposition; and wrong cases dropped for *betra*, *skák* after *leika*, and *gítar* after *á* (two sentences).
- **Excluded** (one): *Við þurfum að fara æfa* (*fara æfa* for *fara að æfa*), translated "We need exercise".

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): What do you like doing?; Sport; Running and swimming; Music; Games and pictures; Going out; and a review. Each has 12 exercises of six to nine kinds.
- **Guidebook**, seven sections, every claim in `content/CLAIMS.md`: *mér finnst gaman að* (the middle voice of *finna* with the dative), *hafa gaman af*, *skemmta sér*, and *frítími*; *mig langar* (the accusative, *að* with an infinitive, *í* for a thing), *áhugi* and *hafa áhuga á*, *áhugamál*; sport: *íþrótt* and Norwegian *idrett* from Old Norse *íþrótt*, *lið* (Norwegian *lag* is a team, Icelandic *lag* a song), *leikur* and *lek*, *spila* and *spille* from Low German, *æfa sig*; *hlaupa* and *løpe*, *synda* from *sund* (Norwegian *sund*, a place to swim across), *skíði* and *ski*, *fara á skíði*; music: *tónlist*, *lag* and *allt í lagi*, *syngja*, *spila á* an instrument, *tónleikar* always plural; *leika* and *leke*, *spil*, *skák* and *sjakk* from Persian *šāh*, *tefla*, *mála* and *male*, *teikna* and *tegne*; going out: *í bíó* from Danish *bio*, *leikhús*, *á tónleika*, *frí*, *ferðast* and *ferdes*, *veiða* and *veide*. Sources: Wiktionary, Bokmålsordboka, BÍN, Tatoeba.
- **Host and story:** Jónas, the fisherman, hosts with *Mér finnst gaman að ferðast* ("I like traveling"); the story *What shall we do?* is a dialogue in which Katla and Elias choose between soccer, chess and the cinema, nine unchanged Tatoeba sentences readable after this unit.

### Data

- 581 words; 3,128 sentences (190 new, 24 of them made; 12 dropped because better ones were found for their words, and their hand translations removed); 187 new Bokmål translations by hand (163 for Tatoeba sentences, 24 for made ones), with *Østerrike*, *København* and *Mozart* added to the names; 6 hand glosses (*langa* ha lyst, *skemmta* underholde, *spila* spille, *æfa* øve, *hjóla* sykle, *spil* kort) and one new phrase (*ha lyst*).
- 28 Bokmål etymologies (*hjóla*, *teikna* and *tónleikar* have none in Wiktionary); audio for 221 new texts in each of the four voices; the Norwegian bridge has 294 words (13 more: *idrett*, *lek*, *spille*, *løpe*, *ski*, *danse*, *lag*, *gitar*, *piano*, *leke*, *sjakk*, *male*, *veide*; *lag* is the same Old Norse word with other meanings, as the guidebook says).

### Tests

- `node --test`: 223 tests (eighteen units; the seven new lessons produce valid exercises; *í lagi*, *lög* and *fær* do not teach *lag* or *fá*; the concert sentences have *tónleikar*; *Allt er í lagi* is readable with *lag* known but does not teach it, and *Mig langar að syngja lag* does).
- `node tests/smoke.mjs --unit=freetime`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa`: see the commit.

## Section A1, unit 14: *Líkaminn* (2026-11-26)

The seventh new unit of section A1 in [PLAN.md](PLAN.md), between *Veður* and *Nám og vinna*: the body, how you feel, the doctor and the pharmacy, the curriculum's "how you feel, the body" (stage 1) and the doctor of stage 3, for the goal "make yourself understood about your health", which no unit trained until now, and "take part in conversations about everyday matters" (`content/goals.json`).

- **Words** (33, theme `body`): *höfuð*, *háls*, *eyra*, *magi*, *bak*, *illur*; *hönd*, *handleggur*, *andlit*, *munnur*, *meiða*, *brjóta*; *líða*, *illa*, *veikur*, *slæmur*, *hraustur*; *kvef*, *kvefaður*, *hiti*, *hnerra*, *hósta*, *höfuðverkur*; *læknir*, *hjúkrunarfræðingur*, *tannlæknir*, *sjúklingur*, *hjálp*; *apótek*, *lyf*, *batna*, *vona*, *reykja*. *fótur*, *tönn* (*Dagurinn minn*), *hár*, *auga* (*Föt og fólk*), *sjúkrahús* (*Gata*) and *hvíla* were already taught. Chosen by topic, then counted with the word picker limited to the words a learner has at this point (rebuilt as a scratch copy of `scripts/pick-words.py`, since the older scratch copies were gone): *líða*, *illur* (17 readable sentences each), *hönd*, *læknir* and *hjálp* bring the most; the body parts bring almost none. *illa* ("badly") is a word of its own because *Mér líður illa* and *Mér leið illa* need it: the parser reads *illa* as the adverb, not a form of *illur*. *hjálp* is here although A2 has a unit *Hjálp*: *Ég þarf hjálp* belongs to A1, and *hjálpa* comes with *Nám og vinna*.
- **Meanings as Wiktionary words them,** so the check that a gloss contains the meaning stays at 100%: *illur* is "ill" (Wiktionary "evil, ill, wicked"), *kvefaður* "having a cold", *háls* "neck" (the guidebook adds the throat), *kvef* "cold".
- **Left out:** *nef* ("nose"), *anda* ("breathe"), *líkami* ("body", the unit's name), *hjarta* and *fingur*: each has at most one readable sentence here, and no Tatoeba sentence to make more from with one word changed (*Ég get ekki andað!* is the only one for *anda*). The guidebook teaches *nef* with Norwegian *nebb*. *fljótur* ("quick"), which *Ég vona að þér batni fljótt* (I hope you get better soon) needs: *fljótt* is an adverb of its own in BÍN, with no Wiktionary entry, so the sentence stays a guidebook example. *verkjalyf* (painkiller, no Wiktionary entry), *tafla*, *pilla*, *heilsugæsla*, *lyfseðill* (no sentence or one), *deyja*, *slys* and *sjúkrabíll* (A2's *Hjálp*).

### Sentences

- **46 made sentences** (decision 3), from 36 originals, for the body parts and the doctor's words Tatoeba has nothing or almost nothing on: *Mér er illt í bakinu* gave *hálsinum*, *eyranu*, *maganum*, *hendinni* and *handleggnum*; *Dóttur hennar er illt í maganum* gave *höfðinu*, *hálsinum*, *eyranu*, *bakinu*; *Sonur minn er með tannpínu* gave *hita*, *höfuðverk*, *kvef*; the four *hnerra* sentences gave *hósta*; *Ég er ekki læknir*, *Við erum læknar*, *Í dag fór ég til læknisins* gave the nurse and the dentist; *Hvar er sjúkrahúsið?*, *Hún er í baðherberginu* and *Hún hitti frænda sinn í búðinni* gave *apótekið*, *apótekinu*; *Opnaðu flöskuna* and *Ég opnaði augun* gave *munninn*. Three swaps put a course form in place of a word a learner cannot read: *höndinni*, a variant the DMII Core does not have, became *hendinni*; *Mary* in *Hvernig líður Mary?* became *sjúklingnum*; *ráðlagði* (advised) in two *lyf* sentences became *sagði* (told). All passed GreynirCorrect, and the parser read the word put in as the course word in every one. Every word of the unit has at least three readable sentences but *háls* and *andlit* (two each).
- **A GreynirCorrect false positive:** it flags every *kvefið* ("the cold") as a misspelling of *kveðið* (W001/w), which kept *Hvernig er kvefið þitt?* and *Er kvefið í Tom að batna?* out. `scripts/lib/lint.mjs` now has a list of spelling suggestions checked by hand and found wrong (`FALSE_POSITIVES`), with this one in it; the build and `npm run validate` skip them.
- **Tag fixes** (13): *sé* in *Ég sé illa* (the parser reads *vera*), *hef* in *Ég hef ekki tíma til að vera veik(ur)* (*hefja*), *hreinar* in *Eru hendurnar þínar hreinar?* (another word), and *bak* in *Augu hans brostu bak við gleraugun*, where *bak við* is "behind" (lemma null). Wrong cases dropped with a fix on the right word: *Dóttur* is the dative in *Dóttur hennar er illt í …* (the parser gives the genitive, in the original and the four made from it), *Fólki* in *Fólki líður best …* (nominative), *hendurnar* after *um* (nominative) and *hjálp* after *kalla á* (dative; *Kallaðu strax á lækninn* shows the accusative). Mismatches that are the parser being right stay: *handa* the preposition, *leið* "sad" and "way", *til baka* "back", *verst*, *versta* of *illur*.
- **Excluded** (four): *Ég leiti til hans fyrir hjálp* (the subjunctive *leiti* for *leita*) and *Hann sér alls ekki út eins og læknir* (*sér út* for *lítur út*), mistakes GreynirCorrect does not flag; *Hann hætti að reykja*, translated "He stopped to smoke"; and *Hann braust inn*, translated "He broke into a house" (*Hann braust inn í hús* says that).

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): Where does it hurt?; Getting hurt; How are you feeling?; A cold; At the doctor's; Get well soon; and a review. *illur* is in the first lesson, so *Mér er illt í …* works from the start. Each has 12 exercises of five to ten kinds.
- **Guidebook**, seven sections, every claim in `content/CLAIMS.md`: *Mér er illt í* with the body part in the dative and the article, and the one it hurts in the dative, as Norwegian *jeg har vondt i hodet* uses the definite form; the body words Norwegian has from the same Old Norse words (*hode*, *munn*, *øre*, *mage*, *hals*, *hånd*), and *bak*, which is the back in Icelandic and the backside in Norwegian, with *rygg* from *hryggr*, *handleggur* from *leggur* (Norwegian *legg*), *andlit* against Low German *ansikt*, *nef* and *nebb*, *hönd* and *hendi*; *líða* with the dative (*Hvernig líður þér?*, *Mér líður illa*), *illa* and *ille*; *veikur* and Norwegian *veik*, *syk* and *sjúkur* in *sjúkrahús*, *slæmur* and Norwegian *slem*, the same Low German loan; illnesses with *vera með*, *höfuðverkur* with *verkur* (Norwegian *verk*), *tannpína* and *tannpine*, *hnerra* and *nyse* from Old Norse *hnjósa*; *læknir* from *lækna*, Norwegian *lege* through Danish, *tannlæknir* like *tannlege*, *hjúkrunarfræðingur*, *fara til læknis* with the genitive; *meiða sig* and *skade seg*, *brjóta* and *bryte* (but *brekke* an arm), *batna* with the dative, *vona* and Norwegian *von*, *vone*, *lyfjabúð*, *apótek* from Greek. Sources: Wiktionary, Bokmålsordboka, Tatoeba.
- **Host and story:** Lundi, the puffin, hosts a unit again (only *Halló* before), with *Hvernig líður þér?* ("How are you?"); the story *Not feeling well* is a dialogue in which Elias visits Katla, who has a bad cold, fourteen unchanged Tatoeba sentences readable after this unit, from *Hvernig líður þér?* to *Takk!*

### Data

- 550 words; 2,950 sentences (205 new, 46 of them made; 20 dropped because better ones were found for their words, and their hand translations removed); 202 new Bokmål translations by hand (156 for Tatoeba sentences, 46 for made ones) and one removed (the excluded *Hann braust inn*); 9 hand glosses (*brjóta* brekke, *líða* føle seg, *illur* vond, *illa* dårlig, *veikur* syk, *hraustur* frisk, *kvefaður* forkjølet, *læknir* lege, *batna* bli bedre; *føle seg* comes before *ha det*, the gloss of *bless*) and 8 corrections (*höfuð* without *leder* and *sjef*, *munnur* without *kjeft*, *magi* without *magesekk*, *meiða* *skade* and *gjøre vondt* for *gjøre vont* and *svida*, *hjúkrunarfræðingur* without *søster*, *hjálp* without *hjelper*, *lyf* *medisin* first, *vona* without *håp*); three new phrases (*bli bedre*, *føle seg*, *gjøre vondt*).
- 30 Bokmål etymologies (*illa*, *sjúklingur* and *apótek* have none in Wiktionary); audio for 238 new texts in each of the four voices; the Norwegian bridge has 281 words (15 more: *hode*, *hals*, *mage*, *bak*, *ill*, *hånd*, *munn*, *bryte*, *ille*, *veik*, *hoste*, *lege*, *apotek*, *vone*, *røyke*; *bak* is the same Old Norse word with another meaning, as the guidebook says).

### Tests

- `node --test`: 215 tests (seventeen units; the seven new lessons produce valid exercises; *bak* in *bak við*, *handa* and *leið* are other words; *sé*, *hef* and *hreinar* are the course words after their fixes; the sentences whose parser case was wrong keep none, and *Mér er illt í hálsinum* keeps its dative; the health goal is now trained).
- `node tests/smoke.mjs --unit=body`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa` (the new guidebook and story at three sizes): see the commit.

## Section A1, unit 12: *Föt og fólk* (2026-11-26)

The sixth new unit of section A1 in [PLAN.md](PLAN.md), between *Heima* and *Veður*: clothes, appearance and feelings, the curriculum's "appearance, clothes, colors" and "describing people and homes" (stage 2) and "how you feel" (stage 1, where *mér líður* waits for *Líkaminn*), for the goals "talk fairly freely about things you know well" and "take part in conversations about everyday matters" (`content/goals.json`, now also trained by this unit).

- **Words** (37, theme `people`): *skyrta*, *sokkur*, *úlpa*, *trefill*, *vettlingur*, *hattur*; *litur*, *brúnn*, *grár*, *bleikur*, *taska*, *of*; *líta*, *hár*, *auga*, *gleraugu*, *hávaxinn*, *langur*, *stuttur*; *klár*, *fyndinn*, *leiðinlegur*, *rólegur*, *stoltur*, *svona*; *glaður*, *ánægður*, *hamingjusamur*, *leiður*, *reiður*, *hræddur*; *brosa*, *hlæja*, *gráta*, *hissa*, *áhyggja*, *skap*. *Búð* already teaches *föt*, *skór*, *peysa*, *jakki*, *buxur*, *kjóll*, *húfa* and six colors, *Dagurinn minn* *klæða* and *þreyttur*, so this unit takes the winter clothes, the other colors, looks, character and feelings. Chosen by topic, then with the word picker limited to the words a learner has at this point (the scratch version from unit 11): *of* (31 readable sentences, among them *Skórnir eru of litlir*), *svona*, *líta*, *hræddur* and *reiður* bring the most. *Líkaminn* (unit 14) keeps the body and *líða*; *hár* and *auga* are here because describing people needs them.
- **Meanings as Wiktionary words them,** so the check that a gloss contains the meaning stays at 100%: *úlpa* is "winter coat", *áhyggja* "worries" (Wiktionary: "(in the plural) worries"). *litur* is "color": the check now reads Wiktionary's British "colour" as "color", since the course writes American English (`scripts/build-data.mjs`).
- **Left out:** *uppáhald* ("favorite"): GreynirCorrect wants *uppáhalds liturinn* written as one word, *uppáhaldsliturinn*, so neither the made *Hver er uppáhalds liturinn þinn?* nor Tatoeba's *uppáhalds* sentences pass. *lágvaxinn* ("short", of a person): no Wiktionary entry, so no English gloss, and no Tatoeba sentence; the guidebook teaches *hávaxinn* with *há* and *vaxinn*. *úr* (a watch, the same spelling as the preposition), *regnhlíf*, *bolur*, *pils*, *stígvél*, *ljós*, *dökkur*, *feiminn*, *einmana* (no readable sentence or one), and *líða* and *veikur* (*Líkaminn*).

### Sentences

- **42 made sentences** (decision 3), from 21 originals, for the words Tatoeba has nothing or almost nothing on here: *Hvar get ég keypt sokka?* gave *úlpu*, *trefil*, *vettlinga*, *skyrtu* and *tösku*; *Hann tók af sér hattinn* gave *trefilinn*, *vettlingana*, *úlpuna*; *Hvar er húfan þín?* gave *taskan*, *úlpan*, *skyrtan*; *Þessir kjólar eru of stórir* gave *langir* and *stuttir*; colors went into *Bíllinn minn er rauður*, *Skórnir hans eru brúnir*, *Hann var með grátt hár* and *Hún er með blá augu*; *Hann er klár* gave *fyndinn*, *rólegur*, *leiðinlegur*; *Allir voru glaðir* gave *Allir voru hissa*. Every word of the unit now has at least three readable sentences. All passed GreynirCorrect, and the parser read the word put in as the course word in all but *Það er of langt* and *Það er of stutt*, which it could not analyze (fixed by hand, as the original *Það er of stórt* reads).
- **Tag fixes** (27): the parser reads *hræddur* as the participle of *hræða* in nine sentences, *vera* in *Ekki vera reiður* as the noun "a being" and *reið* as the past of *ríða* ("ride"), *stutt* in *Hún er með stutt hár* as *studdur*, *hatta* as *höttur* ("hood"), *klára* in *gera sig klára* as an adverb, and *svona* as the adjective "such" where it is the adverb "like this, so" (six sentences). *rólega* in *Taktu því rólega!* is the adverb *rólega*, a word of its own in BÍN, as the parser reads it in *Farðu rólega í bjórinn*; a fix with lemma null. Mismatches that are the parser being right stay: *leið* "way", *reiðir* "rely on", *brosi* the noun "smile", *langar* "want", *Má ég klára?* the verb.
- **Excluded** (five): two mistakes GreynirCorrect does not flag (*Ég á ánægður að við hittumst* for *Ég er ánægður*, *Þú er mjög hávaxin* for *Þú ert*), *Ég borðaði um of. Nú ég er södd* (the verb must come second: *Nú er ég*), *Af hverju gerði hún svona nokkuð?* (translated "Why did he"), and *Líttu! Fljúgandi Kakkalakki!*, where a common noun with a capital letter counted as a name.

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): What to wear; Colors and sizes; What do they look like?; What are they like?; Happy and sad; Laughing and crying; and a review. Each has 12 exercises of five to eight kinds.
- **Guidebook**, seven sections, every claim in `content/CLAIMS.md`: clothes and their Norwegian names (*skyrta* and *skjorte*, *sokkur* and *sokk* from Latin *soccus*, *hattur* with a brim and *húfa* without, *vettlingur* from *vöttur* as Norwegian *vott*, *úlpa*, *gleraugu* as glass eyes, always plural); putting on and taking off (*fara í* with the accusative, *fara úr* with the dative, *vera í* to wear, *setja á sig* and *taka af sér*); colors and sizes (colors agree, *grátt*, *blátt*; *bleikur* is pink but Norwegian *blek* is pale, from the same Old Norse *bleikr*; *of* is Norwegian *for*; *sítt hár* for long hair); looks (*líta út*, *líta á*, *líta upp til*, *líta eftir*, *vera með* for eyes and hair, *hávaxinn* like *høyvokst*); character (*klár* and Norwegian *klar*, both also "ready"; *fyndinn* from *finna*; *rólegur* and *rolig*; *Taktu því rólega!*; *stoltur af*); feelings (they agree with the speaker, *Ég er glaður* and *Ég er glöð*; *glaður*, *leiður* and *hræddur* are Norwegian *glad*, *lei* and *redd*, the last from Old Norse *hræddr*; *hamingja* the spirit of luck); laughing and crying (*hló*, *grét*, Norwegian *le* and *gråte*; *hlæja að*, *brosa til*; *hissa* never inflects; *áhyggjur*; *skap* and Norwegian *skap*, "shape", the same Old Norse word). Sources: Wiktionary, Bokmålsordboka, Norwegian Wikipedia (*Lilleasia*, in an etymology).
- **Host and story:** Hekla, the talking volcano, hosts the unit with *Hafðu ekki áhyggjur* ("Don't worry"); the story *Too small* is a dialogue in which Amma Sigga takes Elias shopping because his shoes are too small, fourteen unchanged Tatoeba sentences readable after this unit, from *Ég er leiður* to *Takk!*

### Fixes found on the way

- **The Norwegian bridge** (`scripts/build-bridge.mjs`) paired *litur* with Bokmål *lit*: compared without length marks, Old Norse *litr* ("color") and *lítr* ("time", the source of *lit*) are the same. A match that holds only without length marks now counts only for one of the word's Bokmål glosses, as *hun* is for *hún*. Two more: Bokmålsordboka gives two Old Norse spellings as one text (*hatt*: "hǫttr, hattr"), now read as two, which also found eight relatives the bridge had missed (*smør* from *smjǫr*, *etter* from *eptir*, *snø*, *gjøre*, *glugge*, *en*, *din*, *sin*); and a loan from "Middle Low German" was read as the language "Middle Low" and the word "German" (*klár*); language names now have up to three words. No other pair changed.
- **Visual QA** found no lesson with a phone number to type in its first play: the new words shift the draws, and the exercise now comes in the second play of *Tölur*'s lessons 3 and 4. `scripts/visual-qa.mjs` looks for it in the first three plays and records that many plays of the lesson before taking the shot, as a learner would get there.
- **Full smoke:** *time/3* once timed out on a disabled Check button; it passes alone and in a replay of the full run with the same profile, so it was the timing flake noted for unit 11 (see Tests).

### Data

- 517 words; 2,765 sentences (288 new, 42 of them made; 21 dropped because better ones were found for their words, and their hand translations removed); 286 new Bokmål translations by hand (244 for Tatoeba sentences, 42 for made ones); 13 hand glosses (*úlpa* parkas, *taska* veske, *gleraugu* briller, *hávaxinn* høy, *klár* smart, *svona* slik, *glaður* glad, *ánægður* fornøyd, *leiður* lei seg, *hræddur* redd, *rólegur* rolig, *hissa* overrasket, *áhyggja* bekymring) and 4 corrections (*hattur* had *lue*, which is *húfa*; *fyndinn* *morsom* first; *skap* *humør* first, not *lag*; *hamingjusamur* *lykkelig*, since *glad* is *glaður*); one new phrase (*lei seg*).
- 34 Bokmål etymologies (*hræddur*, *hissa* and *hávaxinn* have none in Wiktionary); audio for 328 new texts in each of the four voices; the Norwegian bridge has 266 words (22 more: 14 of this unit, *sokk*, *hatt*, *grå*, *blek*, *taske*, *hår*, *lang*, *stutt*, *klar*, *stolt*, *glad*, *le*, *gråte*, *skap*, and the eight the fix found).

### Tests

- `node --test`: 207 tests (sixteen units; the seven new lessons produce valid exercises; *klára* in *gera sig klára* is *klár* and in *Má ég klára?* the verb; *rólega* in *Taktu því rólega!* is not *rólegur*; *brosi*, *leið* and *langar* are other words; *hræddur*, *reið*, *vera*, *stutt*, *hatta* and *of* are the course words after their fixes).
- `node tests/smoke.mjs --unit=people`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa` (the new guidebook and story at three sizes): see the commit.

## Section A1, unit 11: *Heima* (2026-11-25)

The fifth new unit of section A1 in [PLAN.md](PLAN.md), between *Matur* and *Veður*: the home, the curriculum's "where things are" and "describing people and homes" (stage 2), for the goals "talk fairly freely about things you know well" and "take part in conversations about everyday matters" (`content/goals.json`, now also trained by this unit).

- **Words** (34, theme `home`): *herbergi*, *stofa*, *svefnherbergi*, *baðherbergi*, *klósett*, *íbúð*; *dyr*, *hurð*, *gluggi*, *lykill*, *læsa*; *sófi*, *lampi*, *skápur*, *teppi*, *mynd*, *sjónvarp*; *hérna*, *þarna*, *uppi*, *niðri*, *hlið* (for *við hliðina á*); *inn*, *út*, *upp*, *niður*, *setja*, *leggja*; *þrífa*, *laga*, *kveikja*, *slökkva*, *hreinn*, *skítugur*. *sjónvarp* moves here from *Nýyrði*, as the plan says (its first lesson keeps *útvarp*, *forrit* and *hátalari*); *hús*, *heimili*, *garður*, *borð*, *stóll*, *rúm*, *eldhús*, *heima* and *heim* were already taught. Chosen by topic, then with the word picker limited to the words a learner has at this point (a scratch version of `npm run pick-words`): *dyr* (32 readable sentences), *hérna*, *upp*, *leggja*, *herbergi* and *út* bring the most.
- **Meanings as Wiktionary words them,** so the check that a Wiktionary gloss contains the meaning stays at 100%: *slökkva* is "put out" (Wiktionary: "to extinguish, to put out"), not "turn off"; *framan* would have been "front".
- **Left out:** *framan*: the parser reads *fyrir framan* as one preposition, so the word would have been taught by only one sentence, *Þvoðu þér í framan* ("Wash your face"), which is not "in front"; the guidebook teaches *fyrir framan* as a phrase. *veggur*, *gólf*, *hilla*, *stigi*, *kjallari*, *svalir*, *ljós* (no readable sentence here; *ljós* is a traffic light in its one), *hæð* (its sentences are about height and hills), *salerni* (the formal word; *klósett* has the sentences), *nágranni* and *leigja* (A2's *Húsnæði*), and *inni* and *úti*, which *Veður* teaches (the plan keeps existing units' words; the guidebook shows them against *inn* and *út*).

### Sentences

- **36 made sentences** (decision 3), from 17 originals, for the words Tatoeba has almost nothing on here: *Hvar er klósettið?* gave *stofan*, *svefnherbergið*, *lampinn*, *skápurinn*, *sjónvarpið* and *lykillinn*; *Klósettið er uppi* gave *Svefnherbergið* and *Baðherbergið er uppi* and *Klósettið er niðri*; *Slökktu á honum* gave *Kveiktu á honum*, the only way to give *kveikja* sentences (all seven of its own need *vinsamlegast*, *vegna* or other later words); *Báturinn var hreinn* gave *skítugur*, and *Herbergið er heitt* gave *hreint* and *skítugt* (neuter, as *heitt*). Every word of the unit now has at least three readable sentences. All passed GreynirCorrect, and the parser read the word put in as the course word in every one.
- **Tag fixes:** in *Slökktu á honum*, *á henni*, *á því* and the made *Slökktu á lampanum*, *á sjónvarpinu*, the parser reads *á* as the noun "river", so the sentences counted as unreadable; *á* is now the preposition there. *læs* in *Hann er læs og skrifandi* is the adjective "literate", not *læsa* ("to lock").
- **Excluded** (the English says something else): three more *sjóða niður* sentences translated "They can fish." (the same as the three excluded in *Matur*; *niður* made them readable now), *Þjónninn var niðri* ("The server was down.": a computer server, where the course teaches *þjónn* as a waiter), *Herbergi Hr. Johnsons var stórt* ("Mr Johnson's was a large room.") and *Klukkan sjö þrjátíu lokuðum við dyrunum á eftir okkur* ("we too").
- **What the sentences teach beside the words:** many *upp*, *út* and *leggja* sentences are phrases (*standa upp*, *gefast upp*, *taka út*, *leggja af stað*, *leggja* "park"), and most *setja* and *leggja* sentences have *setjast* and *leggjast* (sit down, lie down). The guidebook explains each.

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): Rooms; Doors and keys; In the living room; Where is it?; In and out; Cleaning up; and a review. Each has 12 exercises of six to nine kinds.
- **Guidebook**, seven sections, every claim in `content/CLAIMS.md`: *herbergi* and Norwegian *herberge*, rooms built on *herbergi*, *stofa* and *stue*, *íbúð* as what you live in, *klósett*; *dyr* (always plural, the doorway, Norwegian *dør* from its Old Norse plural) and *hurð* (the door itself), *opna* with the accusative but *loka* and *læsa* with the dative, *gluggi* and Norwegian *glugge* against *vindu*, *lykill* and *nøkkel*; furniture (*sófi* and *lampi* as weak masculine nouns, *skápur* and *skap* from Low German, *teppi* a carpet and a blanket, *mynd* a picture and a film, *sjónvarp*); *hérna* and *þarna* (*þarna* points, *þar* refers back), *uppi*, *niðri*, *við hliðina á*, *fyrir framan*; going or being: *inn*, *út*, *upp*, *niður*, *heim* with verbs of motion and *inni*, *úti*, *uppi*, *niðri*, *heima* with verbs of being, which Norwegian has too, from the same Old Norse words (*inne*, *ute*, *oppe*, *nede*, *hjemme*); *setja* and *leggja*, *setjast* and *leggjast* (*sette seg*, *legge seg*), *leggja af stað*; cleaning (*þrífa*, *þreif*, *taka til*), *hreinn* and *ren*, *laga* and *allt í lagi*, *kveikja á* and *slökkva á* with the dative, *slökkva* and *slokke*. Sources: Wiktionary, Bokmålsordboka, and elon.io's pages on [adverbs of place](https://elon.io/grammar/icelandic/adverbs/place), [here and there](https://elon.io/grammar/icelandic/adverbs/here-there-a1) and [opna and loka](https://elon.io/grammar/icelandic/verb-ref/opna-loka-a1).
- **Host and story:** Torfi, the talking turf house, hosts the unit (*Heima er best*, "There is no place like home"); the story *Come on in* is a dialogue in which Katla shows Elias her home, fourteen unchanged Tatoeba sentences readable after this unit, from *Þetta er húsið okkar* to *Vilt þú meira te?*

### A fix found on the way

The full smoke test failed on *Orð*'s lesson "This and that": its word bank had drawn *Hvað með 12:45?*. Word chips are the sentence's words, letters only, so "12:45" had no chip and the sentence could never be built right. This was there before; the new words only changed which sentences the lessons draw. Word banks and dictations now skip sentences with digits (five in the pool, such as *Hringdu undir eins í 110.*); they still appear in reading exercises. A test plays every lesson with the seeds the browser uses and checks it.

### Data

- 480 words; 2,497 sentences (236 new, 36 of them made; 22 dropped because better ones were found for their words, and their hand translations removed); 231 new Bokmål translations by hand (195 for Tatoeba sentences, 36 for made ones) and one removed (the excluded *Þjónninn var niðri*); 11 hand glosses (*upp* opp, *út* ut, *inn*, *uppi* oppe, *niðri* nede, *hérna* her, *leggja* legge, *hreinn* ren, *skítugur* skitten, *kveikja* tenne, *slökkva* slokke) and 5 corrections (*setja* had *legge*, which is *leggja*; *mynd* had *kino*, a cinema; *soverom* and *baderom* first; *þarna* *der borte*); four new phrases (*slå på*, *slå av*, *der borte*, *gjøre rent*).
- 28 Bokmål etymologies; audio for 269 new texts in each of the four voices; the Norwegian bridge has 244 words (15 new, among them *herberge*, *nøkkel*, *låse*, *oppe*, *sette*, *legge*, *slokke*, *ren*).

### Tests

- `node --test`: 199 tests (fifteen units; the seven new lessons produce valid exercises; *á* in *Slökktu á honum* is the preposition, *læs* is not *læsa*, *í lagi* is not *laga*; no word bank in any lesson has a sentence with digits).
- `node tests/smoke.mjs --unit=home`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa` (the new guidebook and story at three sizes): see the commit.

## Section A1, unit 10: *Matur*, and sentences made for thin topics (2026-11-25)

The fourth new unit of section A1 in [PLAN.md](PLAN.md), between *Búð* and *Veður*: food and meals, the curriculum's "meals, food, buying" (stage 1) and "cooking and the table" (stage 2), for the goals "talk fairly freely about things you know well" and "take part in conversations about everyday matters" (`content/goals.json`, now also trained by this unit). With it come the plan's made sentences for thin topics (decision 3).

- **Words** (28, theme `food`): *ávöxtur*, *grænmeti*, *kartafla*, *banani*, *tómatur*; *kjúklingur*, *hrísgrjón*, *pylsa*, *skyr*, *sósa*, *salt*; *eldhús*, *ísskápur*, *elda*, *sjóða*, *baka*, *kokkur*; *samloka*, *pitsa*, *súkkulaði*, *ís*, *flaska*, *dós*; *smakka*, *saddur*, *hollur*, *ljúffengur*, *hella*. *Kaffi* already teaches the café's food and drink, the table and the meals (*brauð*, *fiskur*, *súpa*, *diskur*, *hnífur*, *kvöldmatur*, *svangur*), so this unit takes groceries, cooking and how food tastes. Chosen by topic, then with the word picker limited to the words a learner has at this point (the scratch version from unit 8).
- ***pitsa*, not *pítsa*:** Tatoeba writes *pítsa*, but the DMII Core has only *pitsa* (neither *pítsa* nor *pizza*), and Wiktionary lists *pítsa* as another spelling. The course teaches *pitsa*; the guidebook shows a Tatoeba sentence with *pítsu*.
- **Left out:** *laukur* (onion; in its sentences the forms are those of *ljúka*, "to finish"), *hamborgari*, *gulrót*, *máltíð*, *eftirréttur* (no readable sentence, or one), *langa* and *finnast* (planned for *Frítími*), *biðja* and *vinsamlegast* (*Þjónusta*).

### Sentences made for thin topics

Tatoeba has almost no sentences for everyday foods: among its sentences of up to ten words with an English translation, *kartafla*, *banani*, *tómatur*, *pylsa*, *skyr*, *súkkulaði*, *ís* and *hrísgrjón* had none a learner could read at this point of the path, and *grænmeti* none either (*Af hverju borðarðu ekki grænmeti?* has the clitic form *borðarðu*, which the build counts as unknown). The plan's decision 3 answers this: a sentence made from a real Tatoeba sentence by putting another word in.

- **`content/sentences-made.json`:** each entry names the Tatoeba sentence (`from`), the word replaced and the word put in (`swap`), the result (`is`) and its English (`en`: the original's English with the same word changed). Ids are `<Tatoeba id>-<n>`, so they never clash with Tatoeba's and sort next to their original.
- **The build** (`scripts/build-data.mjs`) applies the swap to the original (the word must occur exactly once, and the result must equal `is`), keeps the original's author and checks the result with GreynirCorrect like every sentence; a flagged made sentence stops the build. From there it is like any other sentence: tagged by the parser, in the pool if readable, with Bokmål in `content/translations-nb.json` and audio in four voices. `data/sentences.json` marks it with `from` and `swap`, and its license line and `data/SOURCES.json` say so.
- **In the app**, the credit of a made sentence (lessons, guidebook, dictionary, stories, the hosts' greetings) links to the original on Tatoeba and adds "one word changed for TÖLVA" (`tatoebaLink` and `changedNote` in `js/data.js`); Credits says how many there are. Stories keep unchanged sentences.
- **47 made sentences** from 25 originals, so that every word of the unit has at least three readable sentences except *hella* (two). For example *Hún keypti kjúkling* gave *kartöflur*, *banana*, *tómata*, *skyr*, *hrísgrjón*, *ís* and *grænmeti*; *Hvernig smakkast súpan?* gave *sósan*, *pitsan*, *kjúklingurinn*; *Ávextir eru hollir* gave *Bananar* and *Tómatar*; *Saltið er búið* gave *Skyrið* and *Súkkulaðið* (only neuter nouns, because *búið* agrees). All are listed in `content/CLAIMS.md`.
- **Checked:** all 47 passed GreynirCorrect, and the parser read the word put in as the course word in all but three, fixed by hand: *sósu* and *fiski* after *með* (read with the accusative, and *fiski* as the noun "fishing"), and *ísa* in a short request the parser could not analyze. A test checks that each made sentence differs from its original in one word and teaches the word put in.

### Fixes found on the way

- **A slur among Wiktionary's senses:** *hrísgrjón* (rice) has an ethnic-slur sense on Wiktionary, which the dictionary would have shown. The build now drops senses that Wiktionary tags slur, offensive, derogatory or vulgar; no other course word had one.
- **A gloss that is just the meaning comes first:** exercises would have shown *hrísgrjón* as "a grain of rice" and *sjóða* as "to seethe". A Wiktionary sense that is exactly the word's intended meaning (with or without "to") now comes first. That also changed *af* ("of" before "off, from"), *gefa* ("to give" before "to give something") and the order of *ætla*'s senses in the dictionary. Picking the matching part inside a longer sense would have changed the exercise glosses of 23 older words (*panta*, *lítill*, *búa* and others), so that was not done; *saddur* shows "satiated" and *hollur* "wholesome", Wiktionary's first words for them.
- **The parser:** it reads *satt* ("true", of *sannur*) as *saddur* in eight sentences, and *saddur* itself as the participle of *seðja*. A tag fix can now say that a word is another word, not a course word (`"lemma": null`, `scripts/build-tags.mjs`), so the eight *satt* sentences do not teach *saddur* (and are not readable, since *sannur* is not taught). *Þetta er ekki salt* has the noun *salt* (the parser read the adjective *saltur*).
- **Dictionary examples:** the build picks a word's examples by spelling, so *saddur* would have shown *Er það satt?* and *baka* *Flýttu þér til baka*. The dictionary now shows the examples in which the parser reads the word as that word, and fills up from other sentences with it (shortest first) when the build's picks run out. The examples of 90 words changed, nearly all by losing a homograph (*verð*, "price", no longer shows *Verð ég að læra?*, nor *á* "on" *Ég á hund*).
- **Sentences the content names stay in the data:** the new words changed which sentences the build picks per word, and *Opnaðu dyrnar*, an example in the *Nám og vinna* guidebook, dropped out. The build now keeps every sentence a guidebook, a host or a story names.
- **Excluded:** *Svengd er besti kokkurinn* ("Hunger is the best spice": an English proverb for one that says cook); three *sjóða niður* sentences translated "They can fish." (to can fish, but it reads as being able to fish); *Hrísgrjón eru góð með mísósúpu* (miso is not in Bokmålsordboka, so it can have no checked Bokmål; its two made sentences do not need it shown).

### The unit

- **Lessons** (grouped by hand, every exercise read over three plays): Fruit and vegetables; What's for dinner?; In the kitchen; Snacks; Thanks for the food; and a review. Each has 12 exercises of seven to nine kinds.
- **Guidebook**, six sections, every claim in `content/CLAIMS.md`: *grænmeti* (green food, no plural), *ávextir*, *kartöflur* (from Danish, where Norwegian has *potet*); rice in the plural (*Hrísgrjón eru góð*), *kjúklingur* and *kylling* from the same Old Norse word, *pylsa* and *pølse*, *skyr* in Bokmålsordboka, *fá sér*; *vera til*, *búinn*, *með* with the dative for food; cooking with fire (*elda* from *eldur*, *eldhús* and Nynorsk *eldhus*, one verb for *lage mat*), *sjóða* and Norwegian *syde*, *bökum*, *ísskápur*; borrowed food words in Icelandic spelling (*súkkulaði*, *pitsa*), *samloka*, *ís* as ice and ice cream; *Takk fyrir matinn* and *Verði þér að góðu*, *smakkast* and *smaker*, *saddur* (from the participle of *seðja*), *hollur*, *ljúffengur*, *hella* and *helle*.
- **Host and story:** Amma Sigga hosts the unit (*Viltu sósu með kjötinu?*); the story *Dinner's ready* is a dialogue in which she has Elias over for dinner, twelve unchanged Tatoeba sentences readable after this unit, ending with *Það er ekki gott að borða yfir sig* and *Takk fyrir að hafa komið*.

### Data

- 447 words; 2,283 sentences (47 made; 23 dropped because better ones were found for their words, and their hand translations removed); 126 new Bokmål translations by hand (79 for Tatoeba sentences, 47 for made ones) and one restored (*Opnaðu dyrnar*); 3 hand glosses (*skyr*; *koke* for *sjóða*; *mett* for *saddur*) and 3 corrections (*kjúklingur* was *høne*, a hen; *dós* lost *kanne*, a jug; *pylsa* lost *kurv*, mostly a basket); *lage mat* listed as a phrase.
- 25 Bokmål etymologies; audio for 159 new texts in each of the four voices; the Norwegian bridge has 229 words (9 new: *kylling*, *salt*, *bake*, *is*, *flaske*, *helle*, *kokk*, *tomat*, *skyr*).

### Tests

- `node --test`: 191 tests (fourteen units; the six new lessons produce valid exercises; *satt* is not *saddur* and *til baka* is not *baka*; every made sentence differs from its original in one word and teaches the word put in).
- `node tests/smoke.mjs --unit=food`: every lesson played in the browser. `npm run smoke` (with a new dictionary check: a made sentence's credit links to its original, and *saddur* shows no *satt*) and `npm run qa` (the new guidebook and story at three sizes): see the commit.

## Section A1, unit 8: *Dagurinn minn* (2026-11-25)

The third new unit of section A1 in [PLAN.md](PLAN.md), between *Tími* and *Búð*: a day from waking up to bedtime, the curriculum's "sleep and washing" and the school and work day (stage 1), for the goal "tell what you do from day to day" (`content/goals.json`, now trained by *Tími* and this unit).

- **Words** (24, theme `myday`): *vekja*, *fótur* (for *fara á fætur*), *syfjaður*, *þreyttur*; *þvo*, *sturta*, *bað*, *bursta*, *tönn*; *klæða*, *flýta*, *seinn*, *tilbúinn*, *upptekinn*; *strax*, *svo*, *venjulega*, *loksins*, *lengi*; *hvíla*, *ætla*, *klára*, *rúm*, *sofna*. *vakna* and *sofa* were already in *Tími*. Chosen by topic, then with the word picker limited to the words a learner has at this point of the path (a scratch version of `npm run pick-words`): *þreyttur*, *flýta*, *seinn*, *upptekinn*, *ætla* and *tilbúinn* bring the most readable sentences, *fótur* brings *fara á fætur*. *klæða* has no sentence a learner can read here (*Ég klæddi mig í buxurnar* needs *Búð*'s *buxur*), so it is taught with word exercises and that sentence as reading.
- **Left out:** *hádegi* (noon): Wiktionary's only gloss is "forenoon; the start of the fifth of the eight eyktir", which the app would show; the guidebook has *fyrir hádegi* and *eftir hádegi* as phrases. The adverb *fyrst*: the parser reads every *fyrst* as *fyrstur* (*Tölur*) or as the superlative of *snemma*, so it had no sentences; the guidebook shows *fyrst ... svo ... loksins*, and *Tími* already teaches *fyrst* as the superlative of *snemma*. *svo* is glossed "so", not "then": that is what it means in 12 of its 13 readable sentences (*svo snemma*, *Ég er svo þreytt*, *Gerðu svo vel*).
- **Tag fixes** (`content/tag-fixes.json`): the parser reads *þreytt(ur)* and *tilbúinn* as the participles of *þreyta* and *tilbúa* (ten and six sentences), as it did with *giftur*; BÍN and Wiktionary list both as adjectives. *sofna* in *Þú mátt ekki sofna* was a plural of a noun *sofn*, and *hvíldum* in one sentence was left open. Two fixes only drop a wrong case: *Farðu í sturtu* (the parser's dative, where *fara í sturtu* is a movement and accusative, as it reads the same phrase elsewhere) and *Ekki standa á fætur* (nominative). With them *þreyttur* has 13 readable sentences instead of 4.
- **Excluded:** *Ég ætlast til að hann komi* ("I expect him to come"): *ætlast til* is a verb of its own, which the course would teach as a form of *ætla* ("to intend").
- **Lessons** (grouped by hand, every exercise read): Getting up; Washing; Hurry up!; Right away, at last; Bedtime; and a review. Each has 12 exercises of six to ten kinds (the adverb lesson has the fewest kinds: adverbs do not inflect).
- **Guidebook**, six sections, every claim in `content/CLAIMS.md`: *vakna* and *vekja* against Norwegian *våkne* and *vekke* (the same Old Norse pair), *fara á fætur*, *þreyttur* and *trett*; reflexive verbs, where Norwegian always has *seg* but Icelandic takes the dative *sér* with *þvo* and *flýta* and the accusative *sig* with *klæða* and *hvíla*; *tönn*, *tennur*, *Burstaðu tennurnar*, *fara í sturtu* and *í bað* (accusative, not *í baði*); *seinn* agreeing (*Ég er sein*), *tilbúinn* and *upptekinn* as participles, *upptekinn* and *opptatt* both "taken up"; the order of the day (*svo*, *venjulega* after the verb, *á kvöldin*, *á hverjum degi*, *strax* and *straks* from Low German, *ekki lengur*); *ætla að* where Bokmål says *skal*, *fara að sofa* and *sofna*, *rúm* and Norwegian *rom*, and *klára* against Norwegian *klare* ("manage").
- **Host and story:** Katla the student hosts the unit (*Ég er sein, er það ekki?*); the story *Better late than never* is a dialogue in which Amma Sigga wakes Katla, twelve unchanged Tatoeba sentences readable after this unit, ending with *Betra er seint en aldrei*.

### Friends stay friends

Katla now hosts this unit before *Nám og vinna*, and a character became a friend only by finishing the first unit they host; a learner who made Katla a friend in *Nám og vinna* would have lost her (the same had happened to Elias with *Um mig* and Jónas with *Tölur*). Now finishing any unit a character hosts makes them a friend, the Profile still names the first unit, and the "new friend" line shows only once (`js/characters.js`, `tests/characters.test.mjs`).

### Data

- 419 words; 2,174 sentences (199 new, 16 dropped because better ones were found for their words, and their hand translations removed); 194 new Bokmål translations by hand (four names added: Harry, Mary, Kate and the exonym Hannover); 7 hand glosses (*svo*, *ætla*, *seinn*, *klára*, *hvíla*, *venjulega*, *bað*) and 7 corrections (*þvo* was *tvette*, *fótur* had *pote* and *labb*, *strax* is *straks* first, *syfjaður* *søvnig* before *trøtt*, *upptekinn* *opptatt* before *travel*, *sofna* *sovne*, *loksins* *endelig*); six new phrases (*skynde seg*, *ha tenkt*, *gjøre ferdig*, *med en gang*, *falle i søvn*, *til slutt*).
- 17 Bokmål etymologies; audio for 223 new texts in each of the four voices; the Norwegian bridge has 220 words (9 new: *fot*, *trøtt*, *bad*, *kle*, *sen*, *lenge*, *hvile*, *esle*, *sovne*).

### Tests

- `node --test`: 184 tests (thirteen units; the six new lessons produce valid exercises; a friend made in a later unit stays a friend).
- `node tests/smoke.mjs --unit=myday`: every lesson of the unit played in the browser. `npm run smoke` and `npm run qa` (with the new guidebook and story at three sizes): see the commit.

## Menu music, step 3: happy moments (2026-11-25)

- **When:** a finished lesson (any lesson round, Letters and sounds included), the daily goal reached (also in the case trainer), or the third daily quest done (also by hearing a story to the end). `completeLesson`, `addXP` and `recordQuests` in `js/progress.js` call `cheer()` (`js/music/mood.js`), which starts a happy spell of three minutes in `sessionStorage`, so it carries from the lesson to the screen the learner goes to next.
- **What:** during a spell the Happy mood replaces Synthwave and Cyberpunk (Learn, Profile, the start page, Practice) and starts at its chorus, so the first thing heard is the hopscotch IV–V–vi–I and the heroic ♭VI–♭VII–I. The calm Dreamwave screens stay as they are, and Calm mode keeps Dreamwave everywhere. When a spell ends, Happy plays on until the learner opens another screen, so no song is cut off.
- **Never sad:** nothing in the music reacts to mistakes, a lost heart or a missed day.

## Menu music, step 2: in the app (2026-11-25)

The music from step 1 now plays in the app when the learner turns it on.

- **Off by default, two ways to turn it on:** a Music switch in Settings (Sound and voice), and a note button beside the sound-effects button in the top bar and the side panel. Settings also has the **music volume** (0 to 100, default 50; the lab's slider is the same setting) and the link to the Music lab. While music is off, the music code (about 70 KB) is not even loaded and no audio context is made (`bindMusic` in `js/app.js` imports `js/music/background.js` on demand).
- **A mood per screen** (`PAGE_MOODS`, by file name): Synthwave on the start page, Learn and Profile; Cyberpunk on Practice; Dreamwave on the guidebook, Dictionary, Case trainer, the Stories list, the Norwegian bridge, Settings and Credits. **Silent:** lessons (every exercise, the placement test and speaking practice), Letters and sounds, Voices, the story reader (it is narrated), the Music lab (it has its own player) and the style guide. The section checkpoints are not built yet; when they are, their start and result screens get Cyberpunk and their questions stay silent like every lesson.
- **Icelandic always wins.** `js/audio.js` sends `tolva:speaking` when any Icelandic audio starts and ends (recordings, the generated voice, the device voice); the music drops to 15% within about a tenth of a second and comes back over about a second. `js/speech.js` sends `tolva:listening` while the microphone is open, and the music stops, so it never reaches the speech recognizer.
- **Calm mode** (on, or auto from reduced motion or more contrast) plays Dreamwave on every screen with music, without drums and at 60% of the volume; it follows a change of the device setting at once.
- **Across pages** each mood keeps its position in `sessionStorage`: the next screen of the same mood within 20 seconds continues the song where it was, fading in over 1.5 seconds; after a longer break (or a new day) the next song starts from its intro. A hidden tab stops the music and saves its place. Songs are seeded by the day and the mood.
- **One audio context** for the sound effects and the music (`js/audio-context.js`).
- **Starting without a tap:** checked in Chromium with its default autoplay policy (Playwright): after music is turned on with a click, a screen reached by a link creates its audio context already running, so Practice started Cyberpunk on its own. Browsers that hold audio back until the page is used (Firefox, Safari) start the music at the first tap, click or key press.
- **Checked in Chromium:** with music off, no music file loads and no audio context exists; the top-bar button starts Synthwave on Learn; Practice then plays Cyberpunk without a tap; a lesson and the story reader create no audio at all; Settings plays Dreamwave and its switch turns the music off everywhere. New tests: the mood of every screen (and Calm mode), and where a song resumes.

## Menu music, step 1: the engine and the Music lab (2026-11-25)

The owner asked for music in the menus that fits the retro-futuristic look, made by code: synthwave, with dreamwave and cyberpunk where they suit, and a happier sound when the learner does well. Owner decisions: music is **off by default**; a **volume control**; the page-to-mood map below; **Cyberpunk on Practice and the section checkpoints**; Icelandic two-part singing in fifths (*tvísöngur*) woven in; and "it is very important that the music theory is correct", so the rules were looked up and are checked by tests. This step builds the engine and a listening page (`music.html`, linked from Settings) where the owner can hear every mood and jump to any section. Nothing plays anywhere else yet.

- **No files.** Every sound is synthesized with the Web Audio API as it plays (`js/music/synth.js`), like the 8-bit sound effects. Songs are composed in the browser (`js/music/compose.js`, about 10 ms a song), from a seed: the lab's seed is the day, so each day has its own tunes, and when a song ends the next one is composed from the next seed.
- **Moods** (`js/music/styles.js`): Synthwave, A Aeolian, 108 bpm (Learn, Profile, start page); Dreamwave, F Lydian, 84 bpm, half-time drums and tape wobble (guidebook, Dictionary, Case trainer, Stories, Settings, Credits); Cyberpunk, E Phrygian, 118 bpm, distorted bass (Practice, checkpoints); Happy, C major, 112 bpm (after a lesson, the daily goal or all three quests). No music in lessons, *Stafirnir*, Voices, the story reader or speaking practice (step 2). Synthwave tempos run from about 80 to 150 bpm, with most between 100 and 140 ([Roland](https://articles.roland.com/synthwave-essentials-for-the-jupiter-xm/)). Four-on-the-floor kick ([Roland](https://articles.roland.com/synthwave-essentials-for-the-jupiter-xm/)), gated reverb on the snare ([eMastered](https://emastered.com/blog/synthwave-chord-progressions)), sidechain pumping of bass and pads, bass on the chord roots in eighths or sixteenths, arpeggios of chord tones in sixteenths and high-passed.
- **Chords** are documented schemas from [Open Music Theory 2e](https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)) (7.9 Four-chord schemas, 7.12 Modal schemas), written as Roman numerals measured from the major scale as OMT writes them. Synthwave: the singer/songwriter schema in minor i–♭VI–♭III–♭VII, the hopscotch schema in minor ♭VI–♭VII–i–♭III, the Aeolian cadence ♭VI–♭VII–i and the subtonic shuttle i–♭VII. Dreamwave: the Lydian shuttle I–II over a tonic pedal. Cyberpunk: the Phrygian ♭II–i, and the lament (i–♭VII–♭VI–v in A minor), heard from its last chord as iv–♭III–♭II–i. Happy: I–V–vi–IV, the authentic cadence I–IV–V–I, the hopscotch IV–V–vi–I, and the Aeolian cadence with a major tonic ♭VI–♭VII–I, which OMT says is "associated with success and heroism"; its ♭VI and ♭VII are borrowed from C minor, and the melody over them uses C minor's notes. A test checks that every chord belongs to its mode (or to the declared borrowed mode) and that each numeral's case matches the chord the mode gives.
- **Form and melody** follow OMT: phrases of 4 and 8 bars (3.2, 11.5); verses are **periods** (an antecedent ending open on a chord tone other than the tonic, a consequent that starts the same way and closes on the tonic) and choruses are **sentences** (a 2-bar basic idea, its repetition moved with the chords, a continuation with shorter notes). Melodic rules from species counterpoint (2.1): mostly steps; a leap of a fourth or more is followed by a step the other way; no tritone, seventh or sixth leaps (an ascending minor sixth is allowed); range at most a tenth; one high point per phrase; the final tonic approached by step. Harmony (4.4): notes on the beat are chord tones; notes off the beat may be passing or neighbor tones, approached and left by step and resolving to a chord tone. One adaptation for pop melody: two leaps the same way are allowed when the three notes outline the chord (an arpeggio). The search (`searchMelody`) tries the most melodic candidate first and backs up when a rule fails; every finished line is checked again with `melodyProblems`.
- **Voicing:** pads move to the nearest voicing of the next chord (common tones held), never double the third of a triad, and avoid minor seconds, minor ninths and close intervals below C3. Classical voice leading forbids parallel fifths, but pop does not follow that rule and tvísöngur is built on them, so the pads are not checked for it.
- **Tvísöngur, the Icelandic part.** Every song has an 8-bar tvísöngur section. What the sources say, and what the composer does: two voices note against note ([Bjarki Sveinbjörnsson, Beck Lecture 2009](https://becklectures.uvic.ca/visit_2009_sveinbjornsson_bjarki_music.html); [Björg Blondal, 2022](https://www.researchcatalogue.net/view/1627986/1627985)) in parallel fifths ([International Research Center for Traditional Polyphony](https://polyphony.ge/en/iceland/); [is.wikipedia](https://is.wikipedia.org/wiki/Tv%C3%ADs%C3%B6ngur)); the voices "cross over each other at some point in each song, meeting at the same note" (Blondal), built here as a voice exchange in contrary steps (fifth, third, unison, third, fifth); "the second part usually finishes with the note that the first part started at the beginning of the song" (polyphony.ge), so the first voice starts on the mode's fifth and ends on its tonic and the second voice does the reverse; slow, and the last note held long (Blondal: "always a fermata"). Real tvísöngur sings the F♯ that a fifth above B needs in Lydian (polyphony.ge); here both voices stay in the mode (the lower voice never sits on the note whose fifth leaves it), so they never clash with the synthesizers. Tvísöngur was sung without instruments, so only the langspil drone (tonic and fifth) sounds, under the first and last notes, the only places where both voices are consonant with it; wind and soft drums fill the rest.
- **Icelandic modes.** About 250 of the songs in Bjarni Þorsteinsson's *Íslenzk þjóðlög* (1906 to 1909) are in the Lydian mode (Sveinbjörnsson). Tvísöngur is most often in F Lydian or D Dorian, the oldest mostly D Dorian (Blondal). So Dreamwave and the Synthwave and Dreamwave bridges are in F Lydian, the Happy bridge in D Dorian. *Krummi svaf í klettagjá* is in the Phrygian mode ([is.wikipedia](https://is.wikipedia.org/wiki/Krummi_svaf_%C3%AD_klettagj%C3%A1)), and Cyberpunk is Phrygian. All of these modes use the same seven notes (the white keys), so moods and bridges change without clashes. Dreamwave's intro is a langspil: "a single melody string and usually 2 drone strings" ([Wikipedia](https://en.wikipedia.org/wiki/Langspil)), the drones on the tonic and fifth as on modern instruments; the historical tuning is poorly documented. No existing melody is quoted: every tune is composed by the rules above.
- **Mix:** levels were measured from offline renders (Chromium `OfflineAudioContext`, 44.1 kHz): at full volume the chorus is about −14 dBFS RMS with peaks held under 0 dB by a limiter; melody about −19, kick −16, bass −17, pads −21, arpeggio −29. The volume setting (`musicVolume`, 0 to 100, default 50) maps to gain by a square law.
- **Tests:** `tests/music.test.mjs` (9 tests): the modes, the numerals, every style's chords, cadences at the ends of phrases, voicings, melodies for 12 seeds of every mood against every rule above, 30 tvísöngur duets in three modes (fifths, one unison, thirds around it, the end notes swapped, both voices in the mode, both lines melodic), determinism, drums on the grid, the bass on the chord's bass note.
- **Next (step 2):** turn it on in Settings and the top bar (with the volume), play the page's mood, lower it to 15% while Icelandic audio plays (`js/audio.js`), stop it for the microphone (`js/speech.js`), pause in hidden tabs, Dreamwave only and quieter in Calm mode, one audio context shared with the sound effects, and continuity across pages (a new page picks up the song at the current bar). Chrome lets audio start without a tap on a page reached from a page of the same origin ([Chrome](https://developer.chrome.com/blog/web-audio-autoplay)); Firefox needs activation on each page ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)), so there the music starts at the first tap.

## Section A1, unit 5: *Tölur*, and numbers by ear (2026-11-25)

The second new unit of section A1 in [PLAN.md](PLAN.md), between *Fjölskylda* and *Gata*: the numbers 11 to 99, ordinal numbers, phone numbers and amounts, for the goal "ask for and give general information" (`content/goals.json`). With it comes the plan's first new exercise type, *numbers by ear*.

- **Words** (35, theme `numbers`): *ellefu* to *nítján* and *þrjátíu* to *níutíu* (16, indeclinable, confirmed in the full BÍN like *fimm* to *tuttugu*); *fyrstur* and *þriðji* to *tíundi* (*annar*, "second", is already the core word "other"); *skipti*, *tala* (the noun "number"), *númer*, *telja*; *margur*, *mikill*, *mikið*, *fár*, *nokkur*, *hálfur*. Chosen by topic, then with `npm run pick-words`.
- **What stays where it was:** *hundrað* and *þúsund* stay in *Búð*'s lesson "How much is it?" with *króna*, *verð* and *kosta*, as the plan keeps the existing units' words; so this unit counts to 99 (its goal says so), and prices are shown in the guidebook and drilled in *Búð*. The adverb *fyrst* was left out: it shares the gloss "first" with *fyrstur* in the same lesson. *mikið* is its own word because the parser reads it as an adverb ("a lot") in most sentences, which would otherwise be unreadable.
- **Ordinals are a word class of their own:** the DMII Core has *þriðji* to *tíundi* as class `rt` (24 forms each, weak declension), and the parser reads them as adjectives. `rt` is now known to the build (frequency and Wiktionary classes), the tables (`gendered`), the declension page, the Norwegian bridge, the class labels ("ordinal number", "ordenstall") and the sentence tags (`scripts/lib/tags.mjs`: an `rt` course word is the parser's adjective with the same lemma).

### Numbers by ear

Tatoeba has almost no sentences for 11 to 99 (0 to 8 each among the 9,407 Tatoeba sentences of up to ten words with an English translation), so a numbers unit made only of sentence exercises would be thin. The plan's "numbers by ear" carries it instead:

- **Three exercise types** (`js/exercises/numlisten.js`, `numtype.js`, `numbuild.js`): hear a number and pick it from four that sound or look alike (17, 70, 7, 27; 47, 74); hear it and write it in digits; see it in digits and build its words from chips (*fjörutíu og sjö* among *fjórtán* and *sjötíu*; "3." as *þriðji* among *þrír* and *fjórði*). Phone numbers come in the first two: hear *sex átta fimm, sautján, tuttugu og fimm* and pick or type 685 17 25. Each answer counts for the word's meaning card.
- **What numbers are called** (`js/engine/numbers.js`, pure, shared by the generator, the audio build and the tests): when counting, one to four are masculine (*þrjátíu og einn*), the ten comes first and *og* joins the unit (Höskuldur Þráinsson's *Kynhlutlaust mál*, elon.io). Ordinals are heard in the form said for a date (*þriðji*). A lesson plays only numbers the learner can say so far, so the first lesson hears 11 to 15 alone and phone numbers with 10, 20 and 25 to 29 in them.
- **Phone numbers** are said as the first three digits one by one and then two pairs (elon.io: *fimm sex sjö — tólf — þrjátíu og fjögur*). The sources disagree on the form of one to four at the end of a pair (elon.io writes the neuter *fjögur*, while counting takes the masculine), and none says how 0 is read in a pair, so the course's 32 phone numbers avoid both: no 1 to 4 or 0 said alone, no pair that ends in 1 to 4 or starts with 0. They start with 5 to 8, as Icelandic numbers do (Wikipedia). They are a fixed list, because every text the exercises play is rendered ahead of time.
- **In lessons:** the indeclinable numerals (five and up) and the ordinals get their own cycle (hear, meaning, build, phone number, write, type the word, sentences where there are any); one to four keep their exercises on gender and case. So *Fjölskylda*'s lesson "Age and counting" now hears and builds 6 to 10 and 20 too. **In reviews**, a numeral's meaning card is reviewed as a number three times in four.
- **Audio:** `node scripts/build-numbers.mjs` writes `data/numbers.json`, the 141 texts the exercises can say (1 to 99, the ordinals, the phone numbers), and `scripts/build-audio.py` renders them in every voice. The file is for the build only and not precached. `tests/numbers.test.mjs` fails if it is out of date or a voice lacks one of its texts.
- **Shared chips:** the word chips of the sentence bank are now a helper (`chipBank` in `js/exercises/common.js`) that the number builder uses too.

### The unit

- **Lessons** (grouped by hand, every exercise read): Eleven to fifteen; Sixteen to nineteen (with *telja*); Thirty to sixty (with *tala*); Seventy to ninety (with *númer*); First to fifth (with *skipti*); Sixth to tenth; Many and few; and a review. Each has 12 exercises of six to eight kinds.
- **Guidebook**, five sections, every claim in `content/CLAIMS.md`: 11 to 19 and *-tán* against Norwegian *-ten*, and *telja*; the tens, *og*, the masculine when counting, the singular after *og einn* (*tuttugu og ein króna*), *hundrað* and *þúsund* as nouns; phone numbers in pairs, *númer* and *tala*; ordinals with a period, their weak declension (*á þriðju hæð*), *annar* as "second" and "other" (as Norwegian *andre* comes from *annen*), dates (*fimmti júní*); *margur* and *mikill*, *fleiri* and *meira*, *mikið*, *fár*, *nokkur*, *hálfur*, *í fyrsta skipti*.
- **Host and story:** Jónas the fisherman hosts the unit (*Það eru margir fiskar í þessu vatni*); the story *More tea?* is a dialogue between Jónas and Amma Sigga, thirteen unchanged Tatoeba sentences readable after this unit (*Hvað áttu margar systur?* ... *Kvöldið er ungt.* *Aldur er bara tala.*).
- **What the sources changed:** a search summary said that the masculine is used in phone numbers, while elon.io's example has the neuter, so the phone numbers avoid the question (above). Bokmålsordboka gives *antall* as "mengde (som kan telles)", so *tala* is glossed *tall* first.

### A fix found on the way

*Dagar hennar eru taldir* ("her days are numbered") was drilled as a verb form, *taldir* "you counted". Now a form that can only be 1st or 2nd person is asked only with its subject pronoun in the sentence. Of the 89 verb-form exercises the lessons make, only that one changed; a first try that skipped every form spelled like a past participle would have removed many good ones (*Við lærðum ensku*, *Þau töluðu ekki*), and was dropped.

### Data

- 395 words; 1,991 sentences (134 new; 19 dropped because better ones were found for their words, and their hand translations removed); 131 new Bokmål translations by hand; three new sentences excluded because their English translation says something else (*nítjánhundruð* translated "1990"; *í fyrsta skipti fyrir þremur árum* as "for the first time in three years"; an Icelandic proverb glossed with an English one).
- Bokmål glosses by hand for *áttatíu*, *níutíu*, *níundi*, *hálfur*, *nokkur*, *mikið*, and two corrections: *tala* was *antall* first, *skipti* was *tid* (now *gang*). *nokkur* shares *noen* with *einhver*, and *mikið* shares *mye* with *mikill*: near-synonyms, handled like *vita*, *þekkja* and *kunna*.
- 31 Bokmål etymologies; the credits now say 23 indeclinable numerals were confirmed in the full BÍN; audio for 274 new texts in each of the four voices; the Norwegian bridge has 211 words (15 new, such as *elleve*, *telle*, *halv*, *tiende*).

### Tests

- `node --test`: 165 tests (twelve units; the eight new lessons produce valid exercises, with checks for number exercises: words the learner knows, the answer once among four options, chips not in the answer; `tests/numbers.test.mjs`: what numbers are called, options, phone-number rules, the audio list, lessons and reviews with number exercises, the verb-form fix; a tag test for ordinals).
- `npm run smoke`: every lesson of every unit (the number exercises among them), twelve stories, all seven friends with twelve units finished. `npm run qa`: the new guidebook, the story, and every number exercise and its feedback at three sizes; no axe violations, no overflow at 320 px.

## Section A1 begins: unit 2, *Um mig* (2026-11-24)

The first new unit of section A1 in [PLAN.md](PLAN.md), between *Halló* and *Kaffi*: introducing yourself politely and giving your details, the curriculum's stage 1 (name, address, politeness) and the goals "answer simple questions about yourself" and "ask for and give general information" (`content/goals.json`).

- **Words** (25, theme `aboutme`): *sæll*, *heilsa*, *kynna*, *gaman*, *kveðja*; *fyrirgefa*, *afsaka*, *endurtaka*, *réttur*, *kalla*; *fæða* (*fæddist*), *afmæli*, *giftur*, *útlendingur*, *flytja*, *vegabréf*; *símanúmer*, *heimilisfang*, *farsími*, *kennitala*, *netfang*; *bréf*, *senda*, *tölvupóstur*, *skilaboð*. Chosen by topic first, then with `npm run pick-words`: *afmæli*, *giftur*, *fæða*, *réttur* and *bréf* bring many readable sentences; *kennitala* has none on Tatoeba but is on every Icelandic form, so it is taught with word exercises only. *Íslendingur* and *Norðmaður* are not course words: written with a capital letter, the sentence analysis reads them as names, so they are explained in the guidebook instead.
- **Unit 10 split, two of five:** *farsími* and *tölvupóstur* moved from *Nýyrði* to this unit, and *flugvél* to *Gata*'s lesson 3 (*Getting there*), as the plan says. *Nýyrði* keeps nine words; *sjónvarp* and *útvarp* move when *Heima* and *Fréttir* exist. A learner who finished *Gata* or *Nýyrði* keeps them finished (recorded units).
- **The unit's place limits its sentences:** after *Halló* only, a sentence the learner builds may use only *Halló*'s words, the grammar words and these; *búa*, *frá*, *í* and *á* come in later units (the plan keeps the existing units' words). So the unit has fewer sentence exercises than *Kaffi*, and *Hvaðan ertu?*, *Ég fæddist í...* and *Ég flutti í...* are taught in the guidebook with Tatoeba examples. Each lesson still has 12 exercises of six to nine kinds.
- **Lessons** (grouped by hand, every exercise read): Hello and goodbye; Sorry?; Born and married; Phone and address; Letters and e-mail; and a review.
- **Guidebook**, six sections, every claim in `content/CLAIMS.md`: *komdu sæll*, *vertu sæl* and how *sæll* agrees with the person spoken to (Norwegian *sæl* is the same word); *kynna* and *kynnast* with the dative, and the -st verbs against Norwegian *sees*, *møtes*; *fyrirgefðu* and *afsakið*; where you are from (*fæddist*, *flutti*, capital letters for *Íslendingur*, not for *íslenskur*); your details (*kennitala*, neuter nouns with -ið); *skilaboð* (plural only) and *kveðja* in letters.
- **Host and story:** Elias, the learner from Norway, hosts the unit (*Hvaðan ertu?*); the story *A newcomer* is a dialogue between Elias and Katla, eleven unchanged Tatoeba sentences a learner can read after this unit, ending with *Vertu sæl!* and *Vertu sæll!*.
- **Tag fixes:** the parser reads *gift* in *Ég er gift*, *Er hún gift?* and five more as the participle of *gifta*; `content/tag-fixes.json` makes them the adjective *giftur*, as BÍN and Wiktionary list it. *gifta sig* stays the verb.
- **Data:** 360 words; 1,876 sentences (122 new, 10 dropped because better ones were found for their words; their nine hand translations were removed from `content/translations-nb.json`); 120 new Bokmål translations by hand; 7 hand glosses (*sæll*, *réttur*, *kynna*, *heilsa*, *afsaka*, *kennitala*, *netfang*) and 3 corrections (*flytja* was "flytte seg", *fæða* "bære", *skilaboð* now *beskjed* first); two more sentences excluded (a curse word; "Traitors will be deported"); audio for 145 new texts in all four voices; the Norwegian bridge has 196 words (7 new Old Norse relatives: *sæl*, *gaman*, *rett*, *kalle* and others). Piper drops espeak's mark for a voiceless l or r (*sæll*, *afmæli*), as it did for *farsími* before. The 21 new words with a Wiktionary etymology have a Bokmål one in `content/etymology-nb.json` (made the same way as the 324 before them).
- **Numbers:** a unit's number is its place in the path, so every unit after *Halló* moved up one. Nothing in the app names a unit by number; `content/CLAIMS.md` now names units instead of numbering them.

### Tests

- `node --test`: 148 tests (the course has eleven units; after *Halló* comes *Um mig*; the goal "self" is practiced when *Halló*, *Um mig* and *Fjölskylda* are finished; the six new lessons produce valid exercises).
- `npm run smoke`: every lesson of every unit, eleven stories. `npm run qa`: the new guidebook at three sizes and its story.
## Everything in Norwegian: credits, the voice credit, word origins (2026-11-24)

The owner asked whether everything on the site is in Norwegian. Every page, lesson and drill was loaded with the Norwegian interface and its 1,571 visible texts checked for English: three places were still in English, and all three are now Norwegian.

- **The voice credit line** (Learn, Letters, Stories) came from the audio manifests, which hold English. It now comes from the interface strings (`audio.credit`, `ttsCredit` in `js/audio.js`).
- **The Credits page** had its text only in the HTML. Every heading and paragraph is now an interface string in English and Bokmål.
- **Word origins in the Dictionary** come from English Wiktionary, and no Norwegian source has them. All 324 were translated into Bokmål by hand (`content/etymology-nb.json`; conventions and the sources of seven language names in `content/CLAIMS.md`). The dictionary loads the file when the app is in Norwegian and shows a translation only while it was made from the English shown now (each names its English by hash), so a rebuilt Wiktionary text falls back to the English instead of an outdated translation. *loka* has none (its English only says "See Etymology 1."), so in Norwegian it shows no etymology.
- `npm run validate` checks every word of the translations against Bokmålsordboka, except cited forms (words also in the English: *vera*, *\*wesaną*) and the listed names, and fails on English left in a translation or English quotation marks. A word without a translation, or one made from an older English text, is a warning: new words arrive that way, with their English shown until they are translated.
- The file is loaded by the page instead of merged into `data/lexicon.json`, because the lexicon was being rebuilt for the next unit at the same time. It is 52 KB and fetched only in Norwegian (precached with the other content files).
- The interface still starts in Norwegian only when the browser is set to Norwegian, otherwise in English until it is changed in Settings.
- `npm run smoke` checks a Norwegian origin in the dictionary, a Norwegian heading on Credits and the Norwegian voice credit.

## Letters and sounds, *Stafirnir* (2026-11-24)

The next piece of [PLAN.md](PLAN.md), before the new units: Icelandic's letters and their sounds against Norwegian, always open, like Duolingo's character practice. For a Norwegian the problem is less new shapes than familiar shapes with other sounds.

- **Content** (`content/letters.json`): the 32 letters in Icelandic order, each with its name, its sounds in IPA, how it compares with Norwegian (new letter, another sound, close to Norwegian, as in Norwegian), an explanation in English and Bokmål, and example words from the course, so every example has audio in the four voices and many have a human recording; then 11 spellings and sounds: *hv*, *hj*, *kj*, *sj*/*sk*, *ll*, *nn*, *au*, *ei*/*ey*, *pp*/*tt*/*kk*, *f* said v, long and short vowels. Every claim is listed with its source in `content/CLAIMS.md`. Before writing, Wikipedia's *Icelandic orthography* table was read again on the page (its consonant rows after *f* and the "broad vowels" behind *nn* [tn]: "accent-bearing and graphical diphthongs"), and the Norwegian values were taken from *Norwegian orthography*, *Norwegian phonology* and Wiktionary's Bokmål entries.
- **What the sources changed in the plan's draft:** a, e and u change before ng and nk (*ganga* [au], *enginn* [ei], *ungur* [u]), so the drill never asks for them there; Icelandic *kj* is a k sound [cʰ] while Norwegian *kj* is [ç], the sound Icelandic writes *hj*, so *kj* got its own item; Icelandic *sj* and *sk* keep their s (*sjór*, *ský*) where Norwegian has one sound [ʂ] (*sky*), a new item; the *f* rows of the table were garbled in the fetched copy, so the claims about *f* are kept to what the Wiktionary IPA and the phonology page also show ([f] at the start, [v] between vowels and at the end, [p] before n).
- **The page** (`letters.html`): a grid of the letters and one of the spellings, each tile with its comparison tag and a ring for how well it is known (its card's Leitner box), the dictionary order, and a legend. A tile opens a dialog: the letter's name to hear, its IPA, the comparison, example words with audio and meanings, and "Practice *x*".
- **The drill** (`lesson.html?mode=alphabet`, `js/engine/letters.js`): ten exercises of four new types and the existing sound pairs: hear a word and pick the spelling missing from it (*ó* or *o*, *hv* or *v*, *kk* or *k*); hear a letter's name and pick the letter; "In *hvar*, does *hv* sound as in Norwegian?"; hear a short word (its meaning shown, since i and y sound alike) and write it. A word is used for a sound only where its Wiktionary IPA has that sound in that place (`spot`), and wrong options never sound the same as the answer. Each answer counts for the card `letter|x`; a round takes due cards first, then letters never practiced (new letters and other sounds before the rest); `&weak` practices the weak ones, `&focus=x` one letter in six exercises of different kinds.
- **Cards everywhere:** due letter cards come back in reviews (up to four of twelve, spread among the words), the sound pairs now count for the cards of their sounds (long and short, *pp*/*tt*/*kk*, *ll*), Practice shows how many letters are weak, and letter answers do not count toward the "100 forms right" badge. The sounds quest counts a round of letters too ("Play a round of letters or sounds").
- **Where:** not a sixth tab. Six tabs at 320 px leave about 49 px for a label, and "Dictionary" needs about 60 px in the tab bar's 10 px monospace font, so by the plan's rule it is the first card on Practice. The "Special letters" and "Sounds" cards moved from Practice to the letters page ("More practice"). On a first visit, Learn offers it once, under the start button so that stays where it was: "New to Icelandic? ... Start with the letters, five minutes". A practice round no longer ends the first visit (only course lessons and skipped units do), so doing the letters first keeps the placement test on offer.
- **Audio:** the letter names in all four voices (30 files each; *á* and *í* were already course words). Piper reads the written name *ufsilon y* as "ufsilon ufsilon i", so the audio text is "ufsilon i" (`say`); the voice's phonemes for the names were compared with the IPA.
- **Checks:** `npm run validate` checks the letters file (alphabet order, every field in both languages, examples are course words, every name has audio in every voice); `tests/letters.test.mjs` checks the drill (every item reachable in at least two ways, the words it avoids, the gap holds the answer, no options that sound alike, the order of a round, weak and one-letter rounds, reviews, the badge tally); `npm run smoke` opens the page and a dialog (the name plays from the generated voice, Escape closes it and focus returns to the tile), plays a round of all letters and one on *þ*, and checks that the *þ* tile then shows progress; `npm run qa` shoots the page, the dialog and every new exercise and feedback state.

## A word picker for new units (2026-11-24)

The third foundation of [PLAN.md](PLAN.md). New units choose their words by topic (the curriculum) first, then by how common a word is and how many example sentences it brings. `npm run pick-words` (`scripts/pick-words.py`, in `.venv`, which has BÍN offline through GreynirCorrect's `islenska` package) answers that from the cached downloads: for given words, their word classes, their rank in the Icelandic Gigaword Corpus frequency list, the Tatoeba sentences that use them and how many each would complete with the course's words; or, with `--top`, the words that complete the most sentences, one after another. It is an estimate for planning (no GreynirCorrect lint, no parser); the real data still comes from `npm run build:data`. First results: *janúar* is common (rank 535) but in no usable sentence, *herbergi* completes 12, and the best openers are *dyr*, *í gær*, *halda*, *samur*, *þreyttur*, *vinsamlegast*.

## Goals for each level (2026-11-24)

The second foundation of [PLAN.md](PLAN.md): what each section aims at, and how far the learner is.

- `content/goals.json` lists the 16 final goals (*lokamarkmið*) of the Ministry of Education's curriculum for adults (2008), four per stage: stages 1–2 as A1, 3–4 as A2 (the course's reading; the curriculum covers A1–A2 without splitting them). Each is quoted in Icelandic with its stage and page and translated for the app, and lists the units that train it; the sources are in `content/CLAIMS.md`. `npm run validate` checks that each goal has its quote, translations and source, and that its units and section exist.
- Today's units train six of the eight A1 goals (*health* waits for *Líkaminn*, and A2's goals for section A2); new units will add themselves to their goals.
- Profile has a "Your level" card per section: words learned of about 800 (`wordsLearned`: the words of done lessons and of skipped units), and each goal as practiced (every unit that trains it finished), not practiced yet, or coming to the course (`goalState` in `js/engine/course-model.js`). The section checks will later score the goals themselves.
- Tests: words learned from done lessons and skipped units, and the three goal states.

## The path in sections, and finished units recorded (2026-11-24)

The first piece of [PLAN.md](PLAN.md)'s foundations: one path from zero, divided into sections.

- `content/units/index.json` has `sections`: A1 (the nine units 1–9 for now), A2 (empty until its units are made) and a bonus section with unit 10 (*Nýyrði*), as the owner decided. A unit's number is its place in the path (`number` in `js/engine/course-model.js`); a bonus unit has none and is labeled "Bonus unit" (`unitLabel` in `js/course.js`), so units can be inserted later without renumbering files. The `order` field in the unit files is no longer read.
- The Learn page shows each section with a banner: its level (A1, A2, + for the bonus), title, goal, and how many of its units are finished; a section with no units is not shown. Unit titles are now headings one level under the section's.
- **Finished units are recorded** (`p.units`: unit id to day, `recordUnits` in `js/progress.js`, after every lesson and when the path is shown, which also records progress from before). The course model counts a recorded unit as finished even when it has a lesson it did not have before, so adding lessons, moving units or inserting new ones never locks a learner out of what they had opened. A lesson added to a finished unit is "new": open, gold, but not where Start goes.
- Kept order: the plan put *Tími* before *Gata*, but unit 5's lessons rely on *í* and *á*, which unit 4 teaches (*í dag*, *á morgun*), so the existing units keep their order and new units go between them.
- Tests: sections, numbering and the bonus (`node --test`); a unit recorded as finished stays finished when a lesson is added to it and a unit is inserted before the next one; `npm run smoke` checks that every unit is recorded after all lessons are played.

## A check before every push (2026-11-24)

`npm run check` (stale `sw.js`, tags or Bokmål data, a missing UI string, invalid content, a failing unit test) only ran when someone remembered to. Without a hosted workflow (the site stays local until the owner says otherwise), a git hook runs it: `.githooks/pre-push`, turned on per clone with `npm run hooks`, and on in this one. It finds Node in Program Files when Git Bash does not have it on its path, and `.gitattributes` keeps the hook's line endings LF in a Windows checkout. It takes about 13 seconds; it stopped a push with a stale `sw.js` in a test. The full `npm run smoke` and `npm run qa` (minutes each) stay manual.

## A lighter first visit, audio that can be renewed, a log that stays small (2026-11-24)

- **First visit.** The service worker precached everything, 4.0 MB in 205 files, among them all four voices' manifests (0.3 MB each, now with file hashes) though a learner uses one, and the cast's 56 pictures (0.8 MB) though they are met one unit at a time. Those now join the cache when first fetched (`ON_USE` in `scripts/build-sw.mjs` and `scripts/sw-template.js`), and the precache is 2.4 MB in 146 files. Steinn's manifest, the default, stays precached; the chosen voice's is fetched in the background once the worker controls the page, so it is cached before the learner goes offline, also after an update. They still count for the cache version.
- **Audio that can be renewed.** Generated files were cached for good under names that are hashes of their text, so a file rendered again (a better model, a pronunciation fix) would never reach a learner who had played it. Each manifest entry now has `v`, the first 8 hex digits of the SHA-1 of the file, written by `scripts/build-audio.py`; the player and "Download all audio" add it to the URL (`?v=`), and choosing a voice or downloading all audio removes cached files that are not in the manifest any more. The existing manifests got `v` without rendering anything again (only that field changed). `npm run validate` now checks all four voices: every file exists and its `v` matches.
- **Attempt log.** Every answer was kept and the whole log was read after each lesson for the badges, and on the Profile; a learner doing three lessons a day adds about 13,000 a year. The log now keeps the newest 5,000 answers (`MAX_ATTEMPTS`, enough for the weak spots), trimmed when a lesson ends, and the all-time counts the badges and Profile need (answers, right answers, right forms) are a running tally (`kv` "tally", updated in the same transaction as it is read, `update` in `js/db.js`). Progress from before is counted from the log on the first page load; exports carry the tally, and older exports get one counted from their log.
- Tests: `npm run smoke` checks that pictures seen online show offline (it failed with the new caching turned off), and that 5,100 answers are cut to 5,000 after a lesson while the tally counts on; `node --test` checks the tally against the log.

## A first visit that shows where to start (2026-11-24)

On a phone the voice card filled the first screen, and the first lesson's Start was two screens down, under the placement card, the unit banner and the host's greeting (the page does not scroll to the lesson while the card waits, so that the card is seen). The owner's decision stands that the learner chooses a voice at the start.

- The card is shorter: one line of text, the legend only for screen readers (the card title says it), and the four voices as compact tiles (radio, name with a small tag under it, sample button), two across on a phone and four across where there is room, never three and one (a container query in `css/components.css`; one per row in a column narrower than 19rem, at 320 px).
- The card ends with "Start the first lesson" and, on a first visit, "Take the placement test", which replaces the separate placement card until a voice is chosen. Start uses Steinn when no voice is chosen, and the card stays until one is.
- At 390 x 844 the start button now ends at 517 px (the lesson's Start node was at 1,201 px); at 768 x 1024 and 1440 x 900 at 386 and 328 px. At 320 x 640 the voices are one per row and the button needs a short scroll.
- `npm run smoke` checks that a phone shows the start button without scrolling on a first visit.

## Wrong options that take knowing to rule out (2026-11-24)

The wrong options of the choice exercises were random, so many could be ruled out without reading: the first lesson offered *halló* with "open, all, that, hello" (grammar words the learner had not been taught, and verbs next to a greeting), and "Hello!" next to "Maybe he will be a good teacher." Two wrong options could even be the same ("that" for both *sá* and *að*).

- **Word meanings** (`meaning`): wrong options of the same word class first, then the lesson's own words (`wordDistractors` in `js/engine/generate.js`); no two options with the same English or Bokmål meaning. *halló* now gets "bye, no, yes". 399 of 399 wrong options share the word class (120 before).
- **Listening** (`listen`): the options are written words, so wrong ones that start like the answer come first: 261 of 273 (20 before).
- **Sentence meanings** (`choice`): wrong options are about as long as the sentence, share a word with it and are readable with the learner's words, the best of a random sample of 400; the average length difference is 0.02 words (2.1 before). Translations count as the same without case and punctuation, so "Welcome." and "Welcome!" are never two options.
- **Word bank:** the chips show the sentence's first word in small letters unless it is a name (`isName` in `js/data.js`), so its capital no longer tells which chip comes first.
- Placement questions prefer the unit's own words.
- Tests: over all lessons, at least nine in ten meaning options share the answer's class, no two options show the same meaning, sentence options differ in length by under a word on average, and no two read alike.

## Writing forms, and sentences for nouns (2026-11-24)

Form exercises were all multiple choice, and the only typing was a word's dictionary form, so a learner could finish the course recognizing endings without ever producing one. Nouns also never built a sentence: their cycle started with two case exercises, and a 12-exercise lesson with six words rarely went further.

- **Write the missing form** (`typeform`, `js/exercises/typeform.js`): the sentence with the word left out, the dictionary form given ("The word: *kaffi*") and the translation; the learner types the form, graded like other typing (accents and special letters "almost" early on). It works for case forms and verb forms, shows the same explanation as "Fill in the right form", and never asks for the dictionary form itself. It counts for the "Type 6 answers" quest.
- **Recognition first, production when known.** In a unit's review lesson every other word with forms starts by writing its form (`practiced` in `lesson()`); a spaced-repetition card in box 3 or higher is reviewed by writing it (`TYPE_FROM_BOX`), a newer one by picking it.
- **Nouns build sentences.** The case cycle is now pick the form, build the sentence, name the case, listen, write the form; every other noun starts at naming the case, so case questions stay as common as before.
- Over all lessons: sentence building 46 to 88 exercises, dictation 16 to 34, written forms 0 to 44, picking a case form 175 to 96, naming the case 46 to 45. Nouns alone: sentence building and dictation 0 to 36, written forms 0 to 23.
- Tests: written forms get the same checks as picked ones (the case named is the parser's, the rule's preposition is there; a verb agrees with its subject) and never ask for the dictionary form; known cards are typed, new ones picked. `scripts/visual-qa.mjs` and the tests now generate unit reviews as the app does.

## Verb forms in lessons (2026-11-24)

Lessons practiced the case of nouns, adjectives and pronouns, but verbs only through their meaning and sentences: over the 56 lessons verbs had 121 exercises and none on a form, although person and number (*ég drekk*, *þú drekkur*, *við drekkum*) are half of Icelandic grammar and the case trainer already had the tables.

- A new exercise type, `conjugate`, on the "Fill in the right form" screen: a sentence with the verb left out, and four forms of the same tense to choose from, so the choice is about person and number (`verbTarget` and `verbSpec` in `js/engine/generate.js`). The feedback names the form ("1st person singular, present"). Each answer counts for the form's card (`drekka_so|GM-FH-NT-1P-ET`), which reviews then practice like case forms.
- Which form a word is: only finite active forms whose spelling is not also the infinitive or the supine (*drekka* after *vil* is not 3rd person plural). Where persons share a form (*drekkur*, 2nd and 3rd singular; *drakk*, 1st and 3rd), the subject pronoun in the nominative decides (*Selur þú vín?*, *Allan morguninn leitaði ég hans*), else the 3rd person, for a noun subject. A form that is also an imperative is used only with a fitting subject (*Ég drekk*), and a sentence that starts with its verb and is no question is taken for a command and not used: *Spurðu Alex* uses the everyday imperative *spurðu*, which the DMII Core lists as *spyrðu*, and *spurðu* is otherwise "they asked".
- Verbs start their cycle with their form, then sentence work (`VERB_CYCLE`); the lessons now have 67 verb-form exercises.
- Tests: for every verb-form exercise in every lesson, the target is that form of the verb in its sentence, the options are forms of the same tense with the answer once, the person agrees with a subject pronoun, and no command is used; verb cards are among those reviews must answer exactly.

## Keeping progress safe (2026-11-24)

All progress lives in the browser's storage on one device. Four gaps:

- **The browser may delete it.** Browsers clear a site's storage when space runs low, and Safari after seven days without a visit unless the app is installed; nothing asked them not to. Now the closing screen of a lesson asks once (`keepStorage` in `js/offline.js`, `navigator.storage.persist()`; Chrome decides on its own, Firefox asks the learner), and Settings, under Offline use, says whether the browser agreed, and if not, to export now and then.
- **Nothing reminded anyone to export.** Profile now says when progress was last exported ("Not exported yet...", "Last exported on ..."), and after a month asks for a new export. The date is kept with the progress (`kv` "backup") and cleared by a reset.
- **A failed import lost everything.** Import cleared the stores and then wrote the file; a failure halfway left nothing. `importAll` now keeps the progress before in memory, writes it back if the import fails, and Profile says so.
- **An old mistake could break the Mistakes round.** Mistakes are stored as whole exercises; one whose sentence was excluded later (`content/sentence-exclude.json`), or from an odd import, threw when it was shown. Exercises that cannot be built are now dropped from the mistakes instead.
- Also: answers are saved one after another, and a lesson's end waits for them, so the badges always count the last answer.
- `npm run smoke`: the export line before and after an export, a planted mistake with an excluded sentence dropped while another plays, and a reset that is waited for (the test passed before only because the reset was quick).

## A typed word with the same meaning counts (2026-11-24)

"Type the word" shows a meaning and asked for one word, but seven English and, after the gloss corrections, five Bokmål meanings belong to more than one course word: "to know" (*vita*, *þekkja*, *kunna*), "home" (*heimili*, *heim*), "when" and *når* (*hvenær*, *þegar*), "Icelandic" and *islandsk* (*íslenska*, *íslenskur*). Typing the other one was graded wrong.

- `gradeWord` in `js/normalize.js` grades the input against the word asked for and, when one fits better, against the other course words shown with the same meaning (`sameGloss` in `js/data.js`). The answer counts; the feedback says "*vita* means that too. This time the word was *þekkja*.", and the answer goes to the spaced-repetition card of the word typed, so the one asked for stays to be learned (its mistake stays too). The letters drill uses the same exercise.
- The comment in `js/normalize.js` that gave *ar* and *ár* as words that accents tell apart now gives *dýr* and *dyr*, like `content/CLAIMS.md` (*ar* is not a word).
- Tests: `tests/normalize.test.mjs` (which word wins, almost against wrong); `npm run smoke` replays a mistake on *þekkja* answered with *vita*.

## Reviews practice the form that is due (2026-11-24)

A review of a form card (*kaffi*, genitive singular) made an exercise on the first form of the word in the shortest sentences, often another form. Of the 187 form cards the lessons create, 39 were practiced as another form when they came due; the due card was never answered, stayed due, and since the review round took the 24 most overdue cards, such cards gathered at its front. They were the rarer forms (*barn* dative, *faðir* nominative, *kaffi* genitive), the weak spots spaced repetition is for.

- `review()` in `js/engine/generate.js` now asks for the card's exact form (`caseTarget(..., { tag })`), in any sentence, not only the 16 shortest. Where no sentence has the form, the word's table is the exercise: the part of it that has the due cell (the plural of a noun, the weak forms of an adjective, a verb's past, as the case trainer shows them), with that cell and up to two more to fill. The table exercise now works for every word class, so the case trainer's cards are reviewed too.
- The review round gets every due card, most overdue first, instead of the first 24, and makes up to twelve exercises from them.
- Tests: every form card the lessons create, reviewed, is answered by its exercise (`node --test`); a weak adjective, a plural with the article and a verb in the past go to their table. `npm run smoke` plays a review round with only form cards due and checks that each exercise answered a due card and that those cards are no longer due.

## Bokmål word glosses corrected (2026-11-24)

A review of the 299 Bokmål glosses that come from Wiktionary found 17 wrong first glosses, the ones exercises show: *vera* was "å bli" (that is *verða*), *elska* "å kjærlighet" (a noun), *búa* "å bo bu" (two words run together), *rauður* "röd" (Swedish), *panta* "å ordne", *eftir* "senere", *þessi* "den", *mega* "å kan", *vinna* the verb "å arbeid", and *úti* "ut" and *heima* "hjem", which contradicted the unit 7 guidebook (*ute*, *hjemme*). About 30 later glosses, shown only in the dictionary, were wrong too (*nótt* "kveld", *kirkja* "gudstjeneste", *barn* "barn n mindreårig").

- **Why they got in.** `scripts/build-data.mjs` copies the Bokmål row of the English Wiktionary translation table that lists the Icelandic word, so a row for another sense or word class, or an error in the table, came along. Nothing checked them: `npm run validate` only checked hand-written glosses, and refused a hand-written gloss for any word Wiktionary covers.
- **Corrections.** `content/glosses-nb.json` has a new `fixes` section: 61 words get a hand-written list in place of Wiktionary's, each with Wiktionary's list repeated (`"wiktionary"`), so a change on Wiktionary's side fails validation until the correction is looked at again. `npm run build:translations` keeps Wiktionary's list in `data/lexicon.json` as `nbWas`, so removing a correction brings it back. The 61: the 17 above; four pairs of course words that showed the same gloss (*vinur* and *vinkona* "venn", *frændi* and *frænka* "slektning"; now *venninne*, *onkel*, *tante*); the later glosses; and eleven where a more usual word now comes first (*fara* "dra" before "reise", *köttur* "katt", *hátalari* "høyttaler", *sjór* "sjø" before "hav"). Reasons and sources are in `content/CLAIMS.md`.
- **Checks.** `npm run validate` now looks up every word of every gloss the app shows, from Wiktionary as well as by hand, in Bokmålsordboka (that found *röd*, *børje*, *café*, *have*, *heisan*, *sne* and *tyve*), and a gloss of several words must be one of the file's `phrases` (*av og til*, *se på*, *få lov til*): the word check alone would pass "bo bu" and "være or være lik", whose words exist one by one.
- **Norwegian bridge rebuilt.** `data/bridge.json` had not been rebuilt since the 38 hand-made glosses; it now links 187 words (170 through Old Norse) instead of 169, among them *takk*, *heita*–*hete*, *hjól*–*hjul*, and from the corrections *búa*–*bo*, *skilja*–*skille* and *elska*–*elske*. *frænka*–*frenke* is gone with the gloss.
- `tests/translations.test.mjs`: corrections replace and restore, applying twice changes nothing, and the corrected words are in the data.

## Tala's tip from the guidebook, and a sidebar that fits (2026-11-24)

- Tala's tip in the sidebar was one fixed sentence. It is now a guidebook section of the learner's current unit, a different one each day (`js/tips.js`): the section's title, its first sentence (a full stop inside `{is:...}` does not end it) and a link to the section. The guidebooks' claims are sourced in `content/CLAIMS.md`, so the tips need no new ones. The course data for it loads only when the sidebar is shown, so phones fetch nothing extra; the old tip shows until it has loaded.
- With the quests, the sidebar was taller than a 900 px window, and its bottom could only be reached by scrolling inside it. Now a sidebar taller than the window scrolls with the page until its bottom reaches the window's bottom and then sticks there (`fitSide` in `js/shell.js` sets `top` to the window height minus the sidebar's height), so nothing in it is out of reach and there is no scroll area inside the page.
- The visual QA's *almost* shot showed a correct answer: the test helper only replaced *þ, ð, æ, ö* with ASCII, and the drill's word had an accent instead. It now leaves out acute accents too, and the shot looks for an accented word as well, so it shows a course lesson with the host thinking.

## A story for unit 10 (2026-11-24)

Units 1 to 9 each had a story; unit 10 now has one too. *A new computer* is a reading told by Katla, the unit's host: an old TV, a little brother watching it, a new computer, writing programs, a phone ringing, and a brother with four mobile phones. Only twelve Tatoeba sentences use unit 10's words and nothing a learner has not met by then, most of them about television, so the reading also uses phone and computer sentences from earlier units. *Visual Basic* joined the proper-name allowlist.

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
- Word glosses had the same gap at a smaller scale: Wiktionary gives no Bokmål for 38 of the 337 course words, among them *takk*, *bless*, *geta* and *núna*. They are glossed by hand in `content/glosses-nb.json` (same word check, same `npm run build:translations`, which also keeps the sizes and sources in `data/SOURCES.json` up to date), so every word has a Bokmål gloss. Meaning and match exercises keep options apart by Bokmål gloss too; *kunna* is glossed *beherske* so that it never reads like *geta* (*kunne*).
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
