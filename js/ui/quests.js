// The day's quests (js/quests.js) as a list with progress bars, for the Practice page and the side
// panel. Takes the result of questsOf().

import { t } from '../i18n.js';
import { QUEST_BONUS } from '../quests.js';

const icon = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons.svg#i-${name}"></use></svg>`;

export function questsHTML(state) {
  const items = state.items
    .map((q) => {
      const status = q.done ? t('quests.done') : t('quests.progress', { n: q.n, target: q.target });
      return `<li class="quest" data-quest="${q.id}" data-done="${q.done}" data-n="${q.n}">${icon(q.done ? 'check' : q.icon)}
        <span class="quest__body"><span class="quest__name">${t(q.name, { n: q.target })}</span>
          <span class="quest__bar" aria-hidden="true"><span style="--p: ${q.n / q.target}"></span></span></span>
        <span class="quest__count" aria-hidden="true">${q.n}/${q.target}</span><span class="visually-hidden">${status}</span></li>`;
    })
    .join('');
  const chest = t(state.chest ? 'quests.chestDone' : 'quests.chestTodo', { xp: QUEST_BONUS });
  return `<ol class="quests" role="list">${items}</ol><p class="quests__chest${state.chest ? ' quests__chest--done' : ''}">${chest}</p>`;
}
