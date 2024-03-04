import './lazy.component.scss';

export function LazyComponent(props) {
  const { element } = props;
  const time = Math.floor(performance.now() / 100) / 10;
  console.log('LazyComponent.onInit', time);
  element.querySelector('.guide__abstract').innerHTML = `LazyComponent.onInit at ${time}s`;
  // element.querySelector('.guide__abstract').innerHTML = RelativeDateService.getRelativeTime();
}
