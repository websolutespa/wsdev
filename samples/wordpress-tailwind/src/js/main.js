import 'virtual:accessible';
import 'virtual:spritemap';
//
import { colorScheme } from './common/colorScheme';
import { lazyLoad } from './common/lazyLoad';

// Modules whose root is fixed, offscreen or inside a closed <dialog>: lazyLoad's
// IntersectionObserver would never fire for them. Each node is marked `init`
// synchronously, before the chunk resolves, so the observer skips it (lazyLoad
// honours the same class) and no module is initialized twice.
function eagerInit(selector, load) {
  const nodes = Array.from(document.querySelectorAll(selector)).filter(
    (node) => !node.classList.contains('init')
  );
  if (!nodes.length) return;
  nodes.forEach((node) => node.classList.add('init'));
  load().then((module) => nodes.forEach((node) => module.default(node)));
}

addEventListener('DOMContentLoaded', () => {
  colorScheme();
  lazyLoad();
  eagerInit('[data-module="sonner.module"]', () => import('../templates/components/base/sonner/sonner.module.js'));
  eagerInit('[data-module="sidebar.module"]', () => import('../templates/components/base/sidebar/sidebar.module.js'));
  eagerInit('[data-module="command.module"]', () => import('../templates/components/base/command/command.module.js'));
});

import icons from 'virtual:icons';

if (import.meta.env.DEV) {
  console.info('%cws-vite ' + import.meta.env.WS_VITE, 'color: #757575');
  console.log('icons', icons);
}

function threeshake() {
  console.log(
    '❗if this comment is present in the globals.min.js there is a threeshake error!'
  );
}
