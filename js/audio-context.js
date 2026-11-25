// One AudioContext for the page, shared by the sound effects (js/sfx.js) and the menu music
// (js/music/). Browsers start it suspended until the page has been used; unlock() resumes it from a
// tap or a key press.

let ctx = null;

export function audioContext() {
  ctx ??= new AudioContext();
  return ctx;
}

/** Resumes the context if it is suspended; resolves true when it runs. */
export async function unlock() {
  const c = audioContext();
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      // Not allowed yet; the next gesture tries again.
    }
  }
  return c.state === 'running';
}
