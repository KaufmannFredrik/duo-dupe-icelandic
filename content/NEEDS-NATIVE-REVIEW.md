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

## Unit titles (`content/demo/path.json`)

Single words, each confirmed to exist in BÍN: *Halló* (interjection), *Kaffi* (neuter noun), *Fjölskylda* (feminine noun). Not reviewed for suitability as titles.

## Pronunciation and language notes (landing page, `js/i18n/*.json`)

| Key | Claim | Status |
|---|---|---|
| `landing.soundsText` | *hv* sounds like kv, *ll* like tl, vowels can be long or short. | not reviewed |
| `landing.soundsExample` | In *Ísland* [ˈistlant], *sl* is said with a t in between (IPA from Wiktionary). | not reviewed |
| `landing.bridgeExample` | *hestur* and Norwegian *hest* both mean horse. | not reviewed |
| `landing.say` | *tölva* comes from *tala* (number) and *völva* (seeress); source: Wiktionary. | sourced, not reviewed |
| `brand.mascot.meaning` | *tala* means both speech and number; Wiktionary lists "a short address, a speech" and "number". | sourced, not reviewed |
| `feedback.reason.*` | Accents change words (for example *ar* and *ár*). | not reviewed |
