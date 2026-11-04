// Sound and spelling correspondences from Icelandic to Norwegian Bokmål, used to explain the
// Norwegian bridge. Each rule is an optional rewrite; a pair is explained by the set of rules
// that turns the Icelandic word into the Norwegian one. Pure, shared by the build script, the
// tests and the bridge page.

export const RULES = [
  { id: 'thorn', from: /þ/g, to: 't' },
  { id: 'eth', from: /ð/g, to: 'd' },
  { id: 'eth-drop', from: /ð/g, to: '' },
  { id: 'a-acute', from: /á/g, to: 'å' },
  { id: 'a-acute-a', from: /á/g, to: 'a' },
  { id: 'o-acute', from: /ó/g, to: 'o' },
  { id: 'u-acute', from: /ú/g, to: 'u' },
  { id: 'i-acute', from: /í/g, to: 'i' },
  { id: 'e-acute', from: /é/g, to: 'e' },
  { id: 'y-acute', from: /ý/g, to: 'y' },
  { id: 'ae', from: /æ/g, to: 'e' },
  { id: 'o-umlaut', from: /ö/g, to: 'ø' },
  { id: 'o-umlaut-o', from: /ö/g, to: 'o' },
  { id: 'au', from: /au/g, to: 'ø' },
  { id: 'ending-ur', from: /ur$/, to: '' },
  { id: 'ending-r', from: /([^u])r$/, to: '$1' },
  { id: 'ending-i', from: /i$/, to: 'e' },
  { id: 'ending-a', from: /a$/, to: 'e' },
  { id: 'double', from: /([bdfgklmnprst])e$/, to: '$1$1e' },
];

/**
 * The smallest set of rules that turns an Icelandic word into a Norwegian one, in rule order,
 * or null when no combination does. explain('hestur', 'hest') -> ['ending-ur'].
 */
export function explain(is, nb) {
  const target = nb.toLocaleLowerCase('nb');
  let frontier = new Map([[is.toLocaleLowerCase('is'), []]]);
  if (frontier.has(target)) return [];
  let best = null;
  for (const rule of RULES) {
    const next = new Map(frontier);
    for (const [word, used] of frontier) {
      const out = word.replace(rule.from, rule.to);
      if (out === word) continue;
      const path = [...used, rule.id];
      if (!next.has(out) || next.get(out).length > path.length) next.set(out, path);
    }
    frontier = next;
    const hit = frontier.get(target);
    if (hit && (!best || hit.length < best.length)) best = hit;
  }
  return best;
}
