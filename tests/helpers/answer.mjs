// Answers the current exercise in a Playwright page through the ?qa test hook.
// mode: 'correct' answers right; 'almost' types ASCII stand-ins and leaves out acute accents where
// the exercise has a text box (both grade as almost), so any word with a special letter or an
// accent gives an almost.

const ACUTE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ý: 'y' };
const fold = (s) => s.replace(/[þ]/g, 'th').replace(/[ð]/g, 'd').replace(/[æ]/g, 'ae').replace(/[ö]/g, 'o').replace(/[áéíóúý]/g, (c) => ACUTE[c]);

export async function answer(page, mode = 'correct') {
  const spec = await page.evaluate(() => window.__tolva.spec());
  const word = (id) => page.evaluate((x) => window.__tolva.lemma(x).lemma, id);
  switch (spec.type) {
    case 'choice':
      await page.click(`.option[data-value="${spec.sentence}"]`);
      break;
    case 'pair':
      await page.click(`.option[data-value="${spec.answer}"]`);
      break;
    case 'meaning':
    case 'listen':
      await page.click(`.option[data-value="${spec.lemma}"]`);
      break;
    case 'ending':
    case 'conjugate': {
      const target = spec.options.find((o) => o.toLocaleLowerCase('is') === spec.target.toLocaleLowerCase('is'));
      await page.click(`.option[data-value="${target}"]`);
      break;
    }
    case 'case':
      await page.click(`.option[data-value="${spec.cases[0]}"]`);
      break;
    case 'typeword':
    case 'bridge': {
      const w = await word(spec.lemma);
      await page.fill('#answer', mode === 'almost' ? fold(w) : w);
      break;
    }
    case 'wordbank':
    case 'dictation': {
      const text = await page.evaluate((sid) => window.__tolva.sentence(sid).is, spec.sentence);
      for (const w of text.match(/\p{L}+/gu)) await page.locator('[data-bank] .chip:not(:disabled)', { hasText: new RegExp(`^${w}$`) }).first().click();
      break;
    }
    case 'match':
      for (const id of spec.pairs) {
        await page.click(`[data-side="is"][data-id="${id}"]`);
        await page.click(`[data-side="gloss"][data-id="${id}"]`);
      }
      break;
    case 'speak':
      // Needs tests/helpers/fake-speech.mjs installed; it hears the sentence.
      await page.click('[data-mic]');
      await page.waitForFunction(() => !document.querySelector('[data-action="check"]').disabled);
      break;
    case 'table': {
      const forms = await page.evaluate((id) => window.__tolva.paradigm(id), spec.lemma);
      for (const tag of spec.blanks) await page.fill(`.decl__input[data-tag="${tag}"]`, forms.find((f) => f.g === tag).b);
      break;
    }
    default:
      throw new Error(`no answer strategy for ${spec.type}`);
  }
  return spec;
}
