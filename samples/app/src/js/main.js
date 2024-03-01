import 'virtual:accessible';
import 'virtual:spritemap';
import 'virtual:theme.css';
import '../css/main.scss';

import { CoreModule, FormsModule, useModule } from '@websolutespa/ws-app';
import { AppComponent } from './app.component';

addEventListener('DOMContentLoaded', () => {
  const app = useModule({
    imports: [
      CoreModule,
      FormsModule,
    ],
    factories: [
      AppComponent,
      ['./lazy/lazy.component.js', 'LazyComponent', '[data-lazy-component]'],
      ['./lazy/lazy.module.js', 'LazyModule', '[data-lazy-module]'],
    ],
    pipes: [],
    dynamics: import.meta.glob('./lazy/*.js'),
  });
  app.observe$(document).subscribe(_ => {
    // console.log('registerComponents$', _.length, _[_.length - 1]);
  });
});

/**
 *
 *
 */

//
import { colorScheme } from './common/colorScheme';
import { lazyLoad } from './common/lazyLoad';
import { lenis } from './common/lenis';

addEventListener('DOMContentLoaded', () => {
  colorScheme();
  lazyLoad();
  lenis();
});

import icons from 'virtual:icons';
import theme from 'virtual:theme';

if (import.meta.env.DEV) {
  console.info('%cws-vite ' + import.meta.env.WS_VITE, 'color: #757575');
  // console.log('env', import.meta.env);
  console.log('icons', icons);
  console.log('theme', theme);
}

function threeshake() {
  console.log('❗if this comment is present in the main.min.js there is a threeshake error!');
}

