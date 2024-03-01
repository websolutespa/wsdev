import './lazy.component.scss';

export function LazyComponent(props) {
  const { node } = props;
  const time = Math.floor(performance.now() / 100) / 10;
  console.log('LazyComponent.onInit', time);
  node.querySelector('.guide__time').innerHTML = `LazyComponent.onInit at ${time}s`;
  // node.querySelector('.guide__time').innerHTML = RelativeDateService.getRelativeTime();
}
