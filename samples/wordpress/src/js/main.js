import 'virtual:accessible';
import 'virtual:spritemap';
import 'virtual:theme.css';
import '../css/main.scss';

export default class Main {
  constructor() {
    this.bind();
  }

  bind() {}
}

window.onload = () => {
  new Main();
};

function threeshake() {
  console.log(
    '❗if this comment is present in the main.min.js there is a threeshake error!'
  );
}
