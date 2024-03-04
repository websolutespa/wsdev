import './lazy-module.component.scss';

export function LazyModuleComponent(props) {
  const { node } = props;
  const time = Math.floor(performance.now() / 100) / 10;
  console.log('LazyModuleComponent.onInit', time);
  node.querySelector('.guide__abstract').innerHTML = `LazyModuleComponent.onInit at ${time}s`;
  // node.querySelector('.guide__abstract').innerHTML = RelativeDateService.getRelativeTime();
}

LazyModuleComponent.meta = {
  selector: '[data-lazy-module-component]',
};
