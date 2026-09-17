// Dark mode via `.dark` on <html>, mirrored by the no-flash inline script in
// layout.twig (must stay in sync: same storage key, same class).
const STORAGE_KEY = 'color-scheme';

export function getColorScheme() {
  if ('localStorage' in window) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setColorScheme(scheme) {
  document.documentElement.classList.toggle('dark', scheme === 'dark');
  if ('localStorage' in window) {
    localStorage.setItem(STORAGE_KEY, scheme);
  }
}

export function colorScheme() {
  setColorScheme(getColorScheme());
  document.querySelectorAll('[data-toggle="color-scheme"]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      setColorScheme(getColorScheme() === 'dark' ? 'light' : 'dark');
    });
  });
}
