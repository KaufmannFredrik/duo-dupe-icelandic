// Answers the current exercise in a Playwright page through the ?qa test hook.
// mode: 'correct' answers right; 'almost' types ASCII stand-ins where the exercise has a text box.

const fold = (s) => s.replace(/[þ]/g, 'th').replace(/[ð]/g, 'd').replace(/[æ]/g, 'ae').replace(/[ö]/g, 'o');

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
    case 'ending': {
      const target = spec.options.find((o) => o.toLocaleLowerCase('is') === spec.target.toLocaleLowerCase('is'));
      await page.click(`.option[data-value="${target}"]`);
      break;
    }
    case 'case':
      await page.click(`.option[data-value="${spec.cases[0]}"]`);
      break;
    case 'typeword': {
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
