import 'virtual:accessible';
import icons from 'virtual:icons';
import 'virtual:spritemap';
import theme from 'virtual:theme';
import 'virtual:theme.css';
import '../css/main.scss';
import { lazyload } from './common/lazyload';
import { lenis } from './components/lenis';

const USE_LENIS = true;

addEventListener('DOMContentLoaded', () => {
  if (USE_LENIS) {
    window.lenis = lenis();
  }
  lazyload(document);
});

if (import.meta.env.DEV) {
  console.log('env', import.meta.env);
  console.log('icons', icons);
  console.log('theme', theme);
}

function threeshake() {
  console.log('❗if this comment is present in the main.min.js there is a threeshake error!');
}
