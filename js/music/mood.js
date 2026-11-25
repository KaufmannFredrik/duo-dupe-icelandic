// Good moments make the menu music happy for a few minutes: a finished lesson, the daily goal
// reached, or all three daily quests done (js/progress.js calls cheer()). Then the Happy mood
// (C major, ending its chorus on the heroic ♭VI–♭VII–I) replaces Synthwave and Cyberpunk, starting
// at its chorus; the calm Dreamwave screens stay as they are. Kept in sessionStorage, so the moment
// carries from the lesson to the screen the learner goes to next. No other imports: progress.js
// loads this on every page, music or not.

const KEY = 'tolva.music.happy';
export const HAPPY_MINUTES = 3;

/** Starts a happy spell (or makes the current one last HAPPY_MINUTES from now). */
export function cheer(now = Date.now()) {
  try {
    sessionStorage.setItem(KEY, String(now + HAPPY_MINUTES * 60_000));
  } catch {
    // No storage: the music stays as it is.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tolva:happy'));
}

/** True during a happy spell. */
export function isHappy(now = Date.now()) {
  try {
    return Number(sessionStorage.getItem(KEY) ?? 0) > now;
  } catch {
    return false;
  }
}

/** The mood a screen plays: Happy replaces the driving moods during a happy spell. */
export const happyMood = (mood, happy) => (happy && (mood === 'synthwave' || mood === 'cyberpunk') ? 'glad' : mood);
