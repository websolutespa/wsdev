import 'virtual:accessible';
import 'virtual:spritemap';
import 'virtual:theme.css';
import '../css/main.scss';
//
import icons from 'virtual:icons';
import theme from 'virtual:theme';
import { colorScheme } from './common/color-scheme';
import { lazyload } from './common/lazyload';
import { lenis } from './common/lenis';

const USE_LENIS = true;

addEventListener('DOMContentLoaded', () => {
  if (USE_LENIS) {
    window.lenis = lenis();
  }
  lazyload(document);
  colorScheme();
});

if (import.meta.env.DEV) {
  console.log('env', import.meta.env);
  console.log('icons', icons);
  console.log('theme', theme);
}

function threeshake() {
  console.log('❗if this comment is present in the main.min.js there is a threeshake error!');
}
