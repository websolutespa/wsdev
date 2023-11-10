import icons from 'virtual:icons';
import theme from 'virtual:theme';

function onDOMContentLoaded() {
  // console.log('theme', theme);
  const dataTheme = document.querySelector('[data-theme]');
  if (dataTheme) {
    dataTheme.innerHTML = JSON.stringify(theme, null, 2);
  }

  const triggers = Array.from(document.querySelectorAll('[data-modal]'));
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const selector = event.currentTarget.getAttribute('data-modal');
      const target = document.querySelector(selector);
      if (target) {
        target.classList.toggle('active');
        const body = document.querySelector('body');
        const active = target.classList.contains('active');
        body.classList.toggle('modally', active);
        if (window.lenis) {
          active ? window.lenis.stop() : window.lenis.start();
        }
      }
    });
  });

  const dataIcons = document.querySelector('[data-icons]');
  if (dataIcons) {
    const items = icons.map(icon => (`
      <div class="theme__margin p-24">
        <svg class="icon icon--${icon.replace('icon-', '')}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlnsxlink="http://www.w3.org/1999/xlink">
          <use xlink:href="#${icon}"></use>
        </svg>
        <div>${icon}</div>
      </div>
    `));
    dataIcons.innerHTML = items.join('\n');
  }
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
