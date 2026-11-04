// Short status messages in a polite live region. Creates the region if the page has none.
// With an action, the toast gets a button and stays until it is used or dismissed.

function region() {
  let el = document.querySelector('[data-toasts]');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast-region';
    el.dataset.toasts = '';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  return el;
}

/**
 * @param {string} message
 * @param {{ timeout?: number, action?: { label: string, run: () => void } }} [options]
 */
export function toast(message, { timeout = 4000, action } = {}) {
  const el = document.createElement('div');
  el.className = action ? 'toast toast--action' : 'toast';
  const text = document.createElement('span');
  text.textContent = message;
  el.append(text);
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--sm';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      el.remove();
      action.run();
    });
    el.append(button);
  }
  region().append(el);
  if (!action) setTimeout(() => el.remove(), timeout);
  return el;
}
