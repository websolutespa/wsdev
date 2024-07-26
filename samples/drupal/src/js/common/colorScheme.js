
function getColorScheme() {
  let scheme = 'initial';
  if (
    'localStorage' in window &&
    localStorage.getItem('color-scheme')
  ) {
    scheme = localStorage.getItem('color-scheme');
  } else if (window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      scheme = 'dark';
    } else {
      scheme = 'light';
    }
  }
  return scheme;
}

function setColorScheme(scheme) {
  const root = document.querySelector(':root');
  root.setAttribute('data-scheme', scheme);
  root.style.setProperty('--color-scheme', scheme);
  if ('localStorage' in window) {
    localStorage.setItem('color-scheme', scheme);
  }
}

export function colorScheme() {
  const scheme = getColorScheme();
  setColorScheme(scheme);
  const toggle = document.querySelector('#color-scheme');
  toggle.checked = scheme === 'light';
  toggle.addEventListener('change', (event) => {
    const scheme = event.target.checked ? 'light' : 'dark';
    setColorScheme(scheme);
  });
}
