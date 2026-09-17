import 'virtual:accessible';
import 'virtual:spritemap';
//
import { colorScheme } from './common/colorScheme';
import { lazyLoad } from './common/lazyLoad';

// Loads a module only when its fixed container is present. The path is passed
// as a variable (not a literal) so Rollup cannot statically resolve it at
// build time: a no-op until the matching component/module file is ported.
function eagerInit(selector, path) {
  if (document.querySelector(selector)) {
    import(/* @vite-ignore */ path);
  }
}

addEventListener('DOMContentLoaded', () => {
  colorScheme();
  lazyLoad();
  eagerInit('[data-module="sonner.module"]', '../templates/components/base/sonner/sonner.module.js');
  eagerInit('[data-module="sidebar.module"]', '../templates/components/base/sidebar/sidebar.module.js');
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
