// Short status messages in a polite live region. Creates the region if the page has none.

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

export function toast(message, { timeout = 4000 } = {}) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  region().append(el);
  setTimeout(() => el.remove(), timeout);
}
